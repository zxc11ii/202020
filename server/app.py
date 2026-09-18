"""
Шлюз доступа к демо-приложению: коды доступа, привязка к устройству,
сессия на 90 дней, админка для выпуска кодов.

Работает за Nginx: Nginx отдаёт статику только если /auth ответил 204.
Запуск:  gunicorn -w 2 -b 127.0.0.1:8000 app:app
"""
import os, re, secrets, sqlite3, string
from datetime import datetime
from functools import wraps
from zoneinfo import ZoneInfo

from flask import (Flask, Response, abort, g, make_response, redirect,
                   render_template, request, url_for)
from itsdangerous import BadSignature, URLSafeTimedSerializer

BASE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get('DB_PATH', os.path.join(BASE, 'data', 'access.db'))
SECRET_KEY = os.environ.get('SECRET_KEY') or (_ for _ in ()).throw(
    RuntimeError('Задайте SECRET_KEY в окружении (см. .env.example)'))
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') or (_ for _ in ()).throw(
    RuntimeError('Задайте ADMIN_PASSWORD в окружении (см. .env.example)'))

SESSION_DAYS = int(os.environ.get('SESSION_DAYS', '90'))
SESSION_MAX_AGE = SESSION_DAYS * 24 * 3600
DEVICE_MAX_AGE = 10 * 365 * 24 * 3600
# Safari и «иконка на экране Домой» на iPhone — два разных хранилища cookie,
# поэтому одному устройству даём два слота.
MAX_DEVICES = int(os.environ.get('MAX_DEVICES', '2'))
COOKIE_SECURE = os.environ.get('COOKIE_SECURE', '1') == '1'

app = Flask(__name__, template_folder='templates', static_folder='static',
            static_url_path='/gate-static')
app.config['SECRET_KEY'] = SECRET_KEY
signer = URLSafeTimedSerializer(SECRET_KEY, salt='session')


# ---------------------------------------------------------------- БД
def db():
    if 'db' not in g:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_):
    d = g.pop('db', None)
    if d: d.close()


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with sqlite3.connect(DB_PATH) as c:
        c.executescript('''
        CREATE TABLE IF NOT EXISTS codes (
            id INTEGER PRIMARY KEY,
            code TEXT UNIQUE NOT NULL,
            note TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            first_used_at TEXT,
            last_used_at TEXT,
            revoked INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY,
            code_id INTEGER NOT NULL REFERENCES codes(id) ON DELETE CASCADE,
            device_id TEXT NOT NULL,
            user_agent TEXT,
            bound_at TEXT NOT NULL,
            last_seen_at TEXT,
            UNIQUE(code_id, device_id)
        );''')


init_db()


def now():
    """Пермское время (UTC+5) — чтобы в админке было понятно, когда входили."""
    return datetime.now(ZoneInfo(os.environ.get('TZ_NAME', 'Asia/Yekaterinburg'))).strftime('%d.%m.%Y %H:%M')


# ---------------------------------------------------------------- коды
ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'   # без 0/O/1/I


def gen_code():
    raw = ''.join(secrets.choice(ALPHABET) for _ in range(9))
    return f'{raw[:3]}-{raw[3:6]}-{raw[6:]}'


def norm_code(s):
    s = re.sub(r'[^A-Za-z0-9]', '', s or '').upper()
    return f'{s[:3]}-{s[3:6]}-{s[6:9]}' if len(s) == 9 else None


# ---------------------------------------------------------------- сессия
def session_payload():
    tok = request.cookies.get('gate_sess')
    if not tok: return None
    try:
        return signer.loads(tok, max_age=SESSION_MAX_AGE)
    except BadSignature:
        return None


def session_valid():
    p = session_payload()
    if not p: return False
    row = db().execute('SELECT revoked FROM codes WHERE id=?', (p.get('c'),)).fetchone()
    if not row or row['revoked']: return False
    dev = db().execute('SELECT 1 FROM devices WHERE code_id=? AND device_id=?',
                       (p['c'], p.get('d'))).fetchone()
    return bool(dev)


def set_cookie(resp, name, value, max_age):
    resp.set_cookie(name, value, max_age=max_age, httponly=True,
                    secure=COOKIE_SECURE, samesite='Lax', path='/')


# ---------------------------------------------------------------- маршруты
@app.get('/auth')
def auth():
    """Для Nginx auth_request: 204 — пускать, 401 — на страницу входа."""
    if session_valid():
        p = session_payload()
        db().execute('UPDATE devices SET last_seen_at=? WHERE code_id=? AND device_id=?',
                     (now(), p['c'], p['d']))
        db().execute('UPDATE codes SET last_used_at=? WHERE id=?', (now(), p['c']))
        db().commit()
        return Response(status=204)
    return Response(status=401)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if session_valid():
        return redirect('/')
    error = None
    prefill = request.args.get('code', '')
    if request.method == 'POST':
        code = norm_code(request.form.get('code'))
        row = db().execute('SELECT * FROM codes WHERE code=?', (code,)).fetchone() if code else None
        if not row or row['revoked']:
            error = 'Код не найден или отозван'
        else:
            device_id = request.cookies.get('gate_dev') or secrets.token_urlsafe(24)
            bound = db().execute('SELECT 1 FROM devices WHERE code_id=? AND device_id=?',
                                 (row['id'], device_id)).fetchone()
            if not bound:
                used = db().execute('SELECT COUNT(*) FROM devices WHERE code_id=?',
                                    (row['id'],)).fetchone()[0]
                if used >= MAX_DEVICES:
                    error = 'Этот код уже используется на другом устройстве'
                else:
                    db().execute(
                        'INSERT INTO devices(code_id, device_id, user_agent, bound_at, last_seen_at) '
                        'VALUES(?,?,?,?,?)',
                        (row['id'], device_id, request.headers.get('User-Agent', '')[:300], now(), now()))
                    if not row['first_used_at']:
                        db().execute('UPDATE codes SET first_used_at=? WHERE id=?', (now(), row['id']))
            if not error:
                db().execute('UPDATE codes SET last_used_at=? WHERE id=?', (now(), row['id']))
                db().commit()
                resp = make_response(redirect('/'))
                set_cookie(resp, 'gate_sess', signer.dumps({'c': row['id'], 'd': device_id}), SESSION_MAX_AGE)
                set_cookie(resp, 'gate_dev', device_id, DEVICE_MAX_AGE)
                return resp
    return render_template('login.html', error=error, prefill=prefill, days=SESSION_DAYS)


@app.get('/logout')
def logout():
    resp = make_response(redirect(url_for('login')))
    resp.delete_cookie('gate_sess', path='/')
    return resp


# ---------------------------------------------------------------- админка
def admin_required(f):
    @wraps(f)
    def w(*a, **k):
        auth = request.authorization
        if not auth or not secrets.compare_digest(auth.password or '', ADMIN_PASSWORD):
            return Response('Нужен пароль администратора', 401,
                            {'WWW-Authenticate': 'Basic realm="admin"'})
        return f(*a, **k)
    return w


@app.get('/admin')
@admin_required
def admin():
    rows = db().execute('''
        SELECT c.*, COUNT(d.id) AS devices,
               GROUP_CONCAT(d.user_agent, '||') AS agents
        FROM codes c LEFT JOIN devices d ON d.code_id=c.id
        GROUP BY c.id ORDER BY c.id DESC''').fetchall()
    base = request.host_url.rstrip('/')
    return render_template('admin.html', rows=rows, base=base, max_devices=MAX_DEVICES)


@app.post('/admin/new')
@admin_required
def admin_new():
    n = max(1, min(50, int(request.form.get('count', 1) or 1)))
    note = (request.form.get('note') or '').strip()[:100]
    for _ in range(n):
        db().execute('INSERT INTO codes(code, note, created_at) VALUES(?,?,?)',
                     (gen_code(), note, now()))
    db().commit()
    return redirect(url_for('admin'))


@app.post('/admin/<int:cid>/revoke')
@admin_required
def admin_revoke(cid):
    db().execute('UPDATE codes SET revoked=1-revoked WHERE id=?', (cid,))
    db().commit()
    return redirect(url_for('admin'))


@app.post('/admin/<int:cid>/unbind')
@admin_required
def admin_unbind(cid):
    """Отвязать все устройства — код снова можно ввести на новом телефоне."""
    db().execute('DELETE FROM devices WHERE code_id=?', (cid,))
    db().commit()
    return redirect(url_for('admin'))


@app.post('/admin/<int:cid>/delete')
@admin_required
def admin_delete(cid):
    db().execute('DELETE FROM devices WHERE code_id=?', (cid,))
    db().execute('DELETE FROM codes WHERE id=?', (cid,))
    db().commit()
    return redirect(url_for('admin'))


if __name__ == '__main__':
    app.run('127.0.0.1', 8000, debug=True)
