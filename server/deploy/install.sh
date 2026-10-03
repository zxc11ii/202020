#!/usr/bin/env bash
# Первичная установка на Ubuntu/Debian. Запускать от root:
#   DOMAIN=72-56-28-97.sslip.io bash server/deploy/install.sh
set -euo pipefail

DOMAIN="${DOMAIN:?Укажите DOMAIN=... (например 72-56-28-97.sslip.io)}"
REPO="${REPO:-https://github.com/zxc11ii/202020.git}"
DEST=/var/www/permtransport

apt-get update
apt-get install -y nginx python3-venv git certbot python3-certbot-nginx

git config --global --add safe.directory "$DEST" 2>/dev/null || true

if [ -d "$DEST/.git" ]; then git -C "$DEST" pull; else git clone "$REPO" "$DEST"; fi

python3 -m venv "$DEST/server/venv"
"$DEST/server/venv/bin/pip" install -q -r "$DEST/server/requirements.txt"

mkdir -p /var/lib/permtransport
if [ ! -f /etc/permtransport.env ]; then
  SECRET=$(python3 -c "import secrets;print(secrets.token_hex(32))")
  ADMIN=$(python3 -c "import secrets;print(secrets.token_urlsafe(12))")
  sed -e "s|^SECRET_KEY=.*|SECRET_KEY=$SECRET|" -e "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$ADMIN|" \
      "$DEST/server/.env.example" > /etc/permtransport.env
  chmod 600 /etc/permtransport.env
  echo "=============================================="
  echo " Пароль администратора (/admin): $ADMIN"
  echo " Сохранён в /etc/permtransport.env"
  echo "=============================================="
fi
chown -R www-data:www-data "$DEST" /var/lib/permtransport

cp "$DEST/server/deploy/permtransport.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now permtransport

sed "s/DOMAIN/$DOMAIN/" "$DEST/server/deploy/nginx.conf" > /etc/nginx/sites-available/permtransport
ln -sf /etc/nginx/sites-available/permtransport /etc/nginx/sites-enabled/permtransport
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect

echo "Готово: https://$DOMAIN  (админка: https://$DOMAIN/admin)"
