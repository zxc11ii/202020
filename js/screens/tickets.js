/* ============================================================
   Вкладка «Билеты» и всё, что открывается из бокового меню
   ============================================================ */
const Screens = {};

/* ---------- Сканирование QR ---------- */
Screens.scanQR = () => ({
  title: 'Оплата проезда',
  sub: 'Сканировать QR',
  bodyClass: 'scan-screen',
  build() {
    const w = h('div', { class: 'scan' });

    const video = h('video', { class: 'scan-video', playsinline: '', autoplay: '', muted: '' });
    video.muted = true;
    const hint = h('div', { class: 'scan-hint' }, 'Нажмите на экран для включения сканера');
    const frame = h('div', { class: 'scan-frame' });
    const stack = h('div', { class: 'scan-stack' });
    stack.append(hint, frame);
    w.append(video, stack);

    /* кнопки справа */
    const side = h('div', { class: 'scan-side' });
    const mk = (icon, cls, on) => {
      const b = h('button', { class: 'scan-btn' + (cls ? ' ' + cls : '') }, icon);
      b.addEventListener('click', e => { e.stopPropagation(); on(); });
      return b;
    };
    const torch = mk(ICONS.torch, 'only-on', () => this.toggleTorch());
    const zin = mk(ICONS.plus, 'only-on', () => this.zoom(1));
    const zout = mk(ICONS.minus, 'only-on', () => this.zoom(-1));
    const plate = mk(ICONS.busFront, '', () => App.replace(Screens.enterPlate()));
    const map = mk(ICONS.mapSolid, '', () => App.replace(Screens.vehiclesMap()));
    side.append(torch, zin, zout, plate, map);
    w.appendChild(side);

    const menu = h('button', { class: 'scan-menu' }, ICONS.menuLines);
    menu.addEventListener('click', e => { e.stopPropagation(); App.openDrawer(); });
    w.appendChild(menu);

    w.addEventListener('click', () => this.start());
    this._el = { w, video, hint, frame };
    return w;
  },

  /* включение камеры по касанию экрана */
  async start() {
    if (this._on) return;
    this._on = true;
    const { w, video, hint } = this._el;
    w.classList.add('on');
    hint.textContent = 'Для оплаты проезда отсканируйте QR-код';

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this._stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }, audio: false
        });
        video.srcObject = this._stream;
        await video.play();
        w.classList.add('live');
      } else {
        throw new Error('no camera');
      }
    } catch (e) {
      w.classList.add('nocam');
      toast('Камера недоступна — работает демо-режим');
    }

    /* распознавание кода */
    this._t = setTimeout(() => {
      if (App.current() !== this) return;
      const v = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
      toast('QR-код распознан');
      App.replace(Screens.orderForm(v));
    }, 4200);
  },

  toggleTorch() {
    const track = this._stream && this._stream.getVideoTracks()[0];
    const caps = track && track.getCapabilities ? track.getCapabilities() : {};
    if (!caps.torch) return toast('Фонарик недоступен на этом устройстве');
    this._torch = !this._torch;
    track.applyConstraints({ advanced: [{ torch: this._torch }] });
    toast(this._torch ? 'Фонарик включён' : 'Фонарик выключен');
  },

  zoom(dir) {
    this._z = Math.min(3, Math.max(1, (this._z || 1) + dir * 0.4));
    this._el.video.style.transform = 'scale(' + this._z.toFixed(2) + ')';
  },

  unmounted() {
    clearTimeout(this._t);
    if (this._stream) this._stream.getTracks().forEach(t => t.stop());
  }
});

/* ---------- Заказ билетов: выбор способа ---------- */
Screens.orderChoice = () => ({
  title: 'Оплата проезда',
  sub: 'Заказ билетов',
  bodyClass: 'pattern',
  build() {
    const w = h('div', { class: 'screen-inner' });

    const hint = h('div', { class: 'card choice-hint' });
    hint.innerHTML = `<span class="ch-ico">${ICONS.tabTickets}</span>
      <span class="ch-text">Выберите один из вариантов оформления заказа на оплату билетов:</span>`;
    w.appendChild(hint);

    const stack = h('div', { class: 'btn-stack', style: 'margin-top:12px' });
    [
      ['qr',        'Сканировать QR',        () => Screens.scanQR()],
      ['bus',       'Ввести гос. номер ТС',  () => Screens.enterPlate()],
      ['map',       'Выбрать ТС на карте',   () => Screens.vehiclesMap()],
      ['bluetooth', 'Поиск ТС по Bluetooth', () => Screens.bluetooth()]
    ].forEach(([icon, label, screen]) => {
      const b = h('button', { class: 'btn choice-btn' }, ICONS[icon] + `<span>${label}</span>`);
      b.addEventListener('click', () => App.go(screen()));
      stack.appendChild(b);
    });
    w.appendChild(stack);
    return w;
  }
});

/* ---------- Ввод гос. номера ---------- */
Screens.enterPlate = () => ({
  title: 'Оплата проезда',
  sub: 'Ввести гос. номер ТС',
  bodyClass: 'pattern',
  build() {
    const w = h('div', { class: 'plate-screen' });

    const box = h('div', { class: 'card plate-box' });
    box.innerHTML = `<div class="plate-label">Для оплаты проезда введите гос. номер ТС</div>`;
    const input = h('input', {
      class: 'plate-field', type: 'text', autocomplete: 'off',
      autocapitalize: 'characters', spellcheck: 'false', maxlength: '9'
    });
    box.appendChild(input);
    w.appendChild(box);

    const go = h('button', { class: 'btn gray plate-go' }, 'Продолжить');
    go.disabled = true;
    w.appendChild(go);

    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase();
      const ok = input.value.trim().length >= 5;
      go.disabled = !ok;
      go.className = 'btn plate-go ' + (ok ? 'blue' : 'gray');
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });

    go.addEventListener('click', () => {
      const val = input.value.trim().toUpperCase();
      const v = VEHICLES.find(x => x.plate.toUpperCase() === val);
      loading(true, 'Поиск');
      setTimeout(() => {
        loading(false);
        if (v) App.go(Screens.orderForm(v));
        else toast('Транспортное средство не найдено.\nПроверьте номер и повторите.', 2800);
      }, 900);
    });

    this._input = input;
    return w;
  },
  mounted() { setTimeout(() => this._input && this._input.focus(), 250); }
});

/* ---------- Поиск ТС по Bluetooth ---------- */
Screens.bluetooth = () => ({
  title: 'Оплата проезда',
  sub: 'Поиск ТС по Bluetooth',
  bodyClass: 'pattern',
  right: { icon: 'infoRound', on: () => App.go(Screens.btInfo()) },
  build() {
    const w = h('div', { class: 'bt-screen' });

    const box = h('div', { class: 'card bt-box' });
    w.appendChild(box);
    this._box = box;

    const list = h('div', { class: 'list bt-list' });
    w.appendChild(list);
    this._list = list;

    const find = h('button', { class: 'btn bt-find' },
      ICONS.bluetooth + '<span>Найти транспорт</span>');
    find.addEventListener('click', () => App.go(Screens.pickRoute()));
    w.appendChild(find);
    this._find = find;

    this.idle = () => {
      list.innerHTML = '';
      box.innerHTML = `<div class="bt-title">Транспорт поблизости не найден</div>`;
      const link = h('button', { class: 'bt-link' },
        ICONS.infoRound + '<span>Ознакомьтесь с информацией</span>');
      link.addEventListener('click', () => App.go(Screens.btInfo()));
      box.appendChild(link);
    };
    this.idle();
    return w;
  },
  search() {
    const { _box: box, _list: list } = this;
    list.innerHTML = '';
    box.innerHTML = `<div class="bt-title">Идёт поиск транспорта поблизости…</div>
      <div class="bt-progress"><span></span></div>`;
    this._timers = [];
    const near = VEHICLES.slice(0, 3);
    near.forEach((v, i) => {
      this._timers.push(setTimeout(() => {
        if (App.current() !== this) return;
        if (i === 0) box.innerHTML = `<div class="bt-title">Транспорт поблизости</div>`;
        const r = routeOf(v.route, v.type);
        const row = h('button', { class: 'list-row' },
          `<span class="lr-badge ${v.type}">${v.route}</span>
           <span class="lr-body"><span class="lr-title">${v.type === 'tram' ? 'Трамвай' : 'Автобус'} ${v.plate}</span>
           <span class="lr-sub">${r.title}</span></span>` + ICONS.chevron);
        row.addEventListener('click', () => App.go(Screens.orderForm(v)));
        list.appendChild(row);
      }, 1400 + i * 800));
    });
  },
  unmounted() { (this._timers || []).forEach(clearTimeout); }
});

/* ---------- Выбор маршрута ---------- */
Screens.pickRoute = () => ({
  title: 'Поиск ТС',
  sub: 'Выберите маршрут',
  bodyClass: 'plain fixed-screen',
  build() {
    let type = 'bus', picked = null, query = '';
    const w = h('div', { class: 'pick-screen' });

    /* переключатель вида транспорта */
    const seg = h('div', { class: 'segmented' });
    [['bus', 'Автобус'], ['tram', 'Трамвай']].forEach(([t, label]) => {
      const b = h('button', { class: 'seg-btn' + (t === type ? ' on' : ''), 'data-t': t }, label);
      b.addEventListener('click', () => {
        type = t; picked = null;
        $$('.seg-btn', seg).forEach(x => x.classList.toggle('on', x.dataset.t === t));
        draw();
      });
      seg.appendChild(b);
    });
    w.appendChild(seg);

    /* поиск по номеру */
    const search = h('div', { class: 'pick-search' });
    const input = h('input', { class: 'pick-input', type: 'text', inputmode: 'numeric',
      placeholder: 'Номер маршрута', autocomplete: 'off' });
    input.addEventListener('input', () => { query = input.value.trim(); draw(); });
    search.appendChild(input);
    w.appendChild(search);

    const list = h('div', { class: 'list pick-list' });
    w.appendChild(list);

    const go = h('button', { class: 'btn gray pick-go' }, 'Выбрать');
    go.disabled = true;
    go.addEventListener('click', () => {
      if (!picked) return;
      App.go(Screens.orderForm(vehicleForRoute(picked)));
    });
    w.appendChild(go);

    const draw = () => {
      const q = query.toLowerCase();
      const found = ROUTES.filter(r => r.type === type &&
        (!q || r.num.startsWith(q) || r.title.toLowerCase().includes(q)));
      list.innerHTML = '';
      if (!found.length) {
        list.appendChild(h('div', { class: 'pick-empty muted center' }, 'Маршрут не найден'));
      }
      found.forEach(r => {
        const row = h('button', { class: 'list-row pick-row' + (picked === r ? ' on' : '') },
          `<span class="lr-badge ${r.type}">${r.num}</span>
           <span class="lr-body"><span class="lr-title">${r.type === 'tram' ? 'Трамвай' : 'Автобус'} № ${r.num}</span>
           <span class="lr-sub">${r.title}</span></span>`);
        row.addEventListener('click', () => {
          picked = r;
          $$('.pick-row', list).forEach(x => x.classList.remove('on'));
          row.classList.add('on');
          go.disabled = false;
          go.className = 'btn blue pick-go';
        });
        list.appendChild(row);
      });
      go.disabled = !picked;
      go.className = 'btn pick-go ' + (picked ? 'blue' : 'gray');
    };
    draw();
    return w;
  }
});

/* ---------- Информация о поиске по Bluetooth ---------- */
Screens.btInfo = () => ({
  title: 'Поиск ТС по Bluetooth',
  bodyClass: 'flat-white',
  build() {
    const w = h('div', { class: 'doc' });
    BT_INFO.forEach(t => w.appendChild(h('p', { class: 'doc-p' }, t)));
    return w;
  }
});

/* ---------- Карта с транспортными средствами ---------- */
Screens.vehiclesMap = () => ({
  title: 'Оплата проезда',
  sub: 'Выбрать ТС на карте',
  bodyClass: 'map-screen',
  right: { icon: 'bookmark', on: () => toast('Маршруты добавлены в избранное') },
  build() {
    const w = h('div', { class: 'map-wrap' });
    w.appendChild(h('div', { class: 'map' }));
    const zoom = h('div', { class: 'map-zoom' });
    const zi = h('button', { class: 'map-btn' }, ICONS.plus);
    const zo = h('button', { class: 'map-btn' }, ICONS.minus);
    zoom.append(zi, zo);
    w.appendChild(zoom);
    this._zi = zi; this._zo = zo;
    const panel = h('div', { class: 'veh-panel', id: 'vehPanel' });
    w.appendChild(panel);
    this._panel = panel;
    return w;
  },
  mounted(el) {
    const map = L.map($('.map', el), { zoomControl: false, attributionControl: true })
      .setView(CITY.center, CITY.zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap'
    }).addTo(map);
    el.__map = map;
    this._zi.addEventListener('click', () => map.zoomIn());
    this._zo.addEventListener('click', () => map.zoomOut());

    VEHICLES.forEach(v => {
      L.marker([v.lat, v.lng], { icon: vehicleMarkerIcon(v) })
        .addTo(map)
        .on('click', () => this.showPanel(v));
    });
    setTimeout(() => map.invalidateSize(), 120);

    /* лёгкое «движение» транспорта */
    el.__move = setInterval(() => {
      map.eachLayer(l => {
        if (l instanceof L.Marker) {
          const p = l.getLatLng();
          l.setLatLng([p.lat + (Math.random() - .5) * 0.0004, p.lng + (Math.random() - .5) * 0.0006]);
        }
      });
    }, 3000);
  },
  showPanel(v) {
    const p = this._panel;
    const r = routeOf(v.route, v.type), c = carrierOf(v);
    p.innerHTML = `
      <div class="vp-head">
        <div class="vp-title">${v.type === 'tram' ? 'Трамвай' : 'Автобус'} ${v.plate}</div>
        <button class="vp-close">${ICONS.close}</button>
      </div>
      <div class="vp-body">
        <div>Маршрут: ${v.route}, ${r.title}</div>
        <div>Перевозчик: ${c.name}</div>
        <div>Тел: ${c.phone}</div>
        <div>E-mail: ${c.email}</div>
        <div class="vp-note">Данные о местоположении актуальны на ${nowTime()}</div>
      </div>`;
    const btn = h('button', { class: 'btn vp-btn' }, 'Оформить заказ билетов');
    btn.addEventListener('click', () => App.go(Screens.orderForm(v)));
    p.appendChild(btn);
    $('.vp-close', p).addEventListener('click', () => p.classList.remove('open'));
    p.classList.add('open');
  },
  unmounted(el) { clearInterval(el.__move); if (el.__map) el.__map.remove(); }
});

/* ---------- Оформление заказа билетов ---------- */
const ORDER_LIFE = 60;   /* заказ действителен минуту */

Screens.orderForm = (v) => ({
  title: 'Оплата проезда',
  sub: 'Заказ билетов',
  bodyClass: 'pattern',
  right: { icon: 'pencil', on: () => Screens._editRoute(v) },
  build() {
    const r = routeOf(v.route, v.type), c = carrierOf(v);
    const boardedAt = new Date();
    let pax = 1, bag = 0;
    this._boardedAt = boardedAt;

    const w = h('div', { class: 'screen-inner order-screen' });

    /* время посадки */
    const time = h('div', { class: 'card receipt-time' });
    time.innerHTML = `<div class="rt-label">Время посадки</div>
      <div class="rt-time">${pad2(boardedAt.getHours())}:${pad2(boardedAt.getMinutes())}:${pad2(boardedAt.getSeconds())}</div>
      <div class="rt-date">${pad2(boardedAt.getDate())}.${pad2(boardedAt.getMonth() + 1)}.${boardedAt.getFullYear()}</div>`;
    w.appendChild(time);

    /* маршрут и сумма */
    const info = h('div', { class: 'card order-info' });
    const sumEl = h('div', { class: 'oi-sum' });
    info.innerHTML = `<div class="oi-route">${v.route}, ${r.title}</div>
      <div class="oi-line">${v.type === 'tram' ? 'Трамвай' : 'Автобус'} ${v.plate}</div>
      <div class="oi-line">${c.name}</div>
      <div class="oi-sep"></div>
      <div class="oi-label">К оплате</div>`;
    info.appendChild(sumEl);
    w.appendChild(info);

    /* количество билетов и багажа */
    const box = h('div', { class: 'card order-count' });
    const mkRow = (label, price, get, set, min) => {
      const wrap = h('div', { class: 'cnt-block' });
      wrap.appendChild(h('div', { class: 'cnt-title' }, label));
      const row = h('div', { class: 'cnt-row' });
      const minus = h('button', { class: 'cnt-btn' }, '−');
      const val = h('div', { class: 'cnt-val' }, String(get()));
      const plus = h('button', { class: 'cnt-btn' }, '+');
      minus.addEventListener('click', () => { set(Math.max(min, get() - 1)); val.textContent = get(); total(); });
      plus.addEventListener('click', () => { set(Math.min(10, get() + 1)); val.textContent = get(); total(); });
      row.append(minus, val, plus);
      wrap.appendChild(row);
      wrap.appendChild(h('div', { class: 'cnt-note' }, price));
      return wrap;
    };
    box.appendChild(mkRow('Количество билетов', 'Цена билета - ' + FARE.ticket + ' \u20bd',
      () => pax, x => pax = x, 1));
    box.appendChild(mkRow('Количество багажа', 'Цена провоза багажа - ' + FARE.baggage + ' \u20bd',
      () => bag, x => bag = x, 0));
    w.appendChild(box);

    /* оплата */
    const pay = h('button', { class: 'btn green order-pay' });
    w.appendChild(pay);
    this._pay = pay;

    const total = () => {
      const sum = pax * FARE.ticket + bag * FARE.baggage;
      sumEl.textContent = sum + ' \u20bd';
      pay.dataset.sum = sum;
    };
    total();

    this.left = ORDER_LIFE;
    this.paintPay = () => {
      pay.innerHTML = ICONS.creditCard +
        `<span>Оплатить (${pad2(Math.floor(this.left / 60))}:${pad2(this.left % 60)})</span>`;
    };
    this.paintPay();

    pay.addEventListener('click', () => {
      const sum = Number(pay.dataset.sum);
      clearInterval(this._tick);
      App.go(Screens.payment({
        title: 'Оплата проезда',
        header: ['Электронный билет МКУ «Гортранс»', 'Оплата проезда и провоза багажа'],
        lines: [
          { label: 'Маршрут', value: '\u2116 ' + v.route },
          { label: 'Транспортное средство', value: v.plate },
          { label: 'Пассажиров', value: String(pax) },
          { label: 'Багажа', value: String(bag) }
        ],
        total: sum,
        onSuccess: () => {
          const order = {
            id: 'o' + Date.now(), route: v.route,
            vehicleType: v.type === 'tram' ? 'Трамвай' : 'Автобус', plate: v.plate,
            paid: sum, passengers: pax, baggage: bag, device: USER.device,
            boardedAt: boardedAt.toISOString(),
            ticketNo: String(7642071674 - Math.floor(Math.random() * 99999)),
            carrier: carrierOf(v).name.replace(/[«»]/g, '"'), inn: '5906006610',
            routeTitle: v.route + ', ' + routeOf(v.route, v.type).title,
            balanceAfter: Store.digital.balance, rated: 0
          };
          Store.state.orders.unshift(order);
          Store.state.currentOrder = order.id;
          Store.save();
          App.setRoot(Screens.activeTicket(order));
          toast('Билет оформлен');
        }
      }));
    });

    return w;
  },
  mounted() {
    this._tick = setInterval(() => {
      this.left--;
      if (this.left <= 0) {
        clearInterval(this._tick);
        toast('Время оформления заказа истекло');
        App.setRoot(Screens.orderChoice());
        return;
      }
      this.paintPay();
    }, 1000);
  },
  unmounted() { clearInterval(this._tick); }
});

Screens._editRoute = function (v) {
  const list = ROUTES.filter(r => r.type === v.type);
  openSheet('Маршрут транспортного средства', list.map(r => ({
    label: '\u2116 ' + r.num + ' \u00b7 ' + r.title,
    onClick: () => { v.route = r.num; App.replace(Screens.orderForm(v)); }
  })));
};

/* ---------- Текущий заказ ---------- */
Screens.currentOrder = () => ({
  title: 'Оплата проезда',
  sub: 'Текущий заказ',
  bodyClass: 'pattern',
  build() {
    const id = Store.state.currentOrder;
    const order = Store.orders.find(o => o.id === id);
    if (!order || ticketLeft(order) <= 0) {
      setTimeout(() => App.replace(Screens.orderChoice()), 0);
      return h('div');
    }
    setTimeout(() => App.replace(Screens.activeTicket(order)), 0);
    return h('div');
  }
});

/* ---------- История заказов ---------- */
Screens.orderHistory = () => ({
  title: 'История заказов',
  bodyClass: 'pattern',
  build() {
    const w = h('div', { class: 'screen-inner hist' });
    if (!Store.orders.length)
      return h('div', { class: 'empty' }, ICONS.ticketBig + '<div>История заказов пуста</div>');
    Store.orders.forEach(o => {
      const row = h('button', { class: 'hist-row' });
      row.innerHTML = `<span class="hist-badge">${ICONS.busType}<b>${o.route}</b></span>
        <span class="hist-date">${fmtDate(o.boardedAt)} ${fmtTime(o.boardedAt)}</span>
        <span class="hist-sum">${o.paid} ₽</span>`;
      row.addEventListener('click', () => App.go(Screens.orderDetails(o)));
      w.appendChild(row);
    });
    return w;
  }
});

/* Верхние карточки чека — используются и в «текущем заказе» */
function receiptTop(o) {
  const wrap = h('div');
  const c1 = h('div', { class: 'card receipt-main' });
  c1.innerHTML = `
    <div class="rm-line">Маршрут <b>№ ${o.route}</b></div>
    <div class="rm-line">${o.vehicleType} <b>${o.plate}</b></div>
    <div class="rm-line">оплачено <b>${o.paid} \u20bd</b></div>
    <div class="rm-line">пассажиров <b>${o.passengers}</b> багажа <b>${o.baggage}</b></div>
    <div class="rm-dev">Устройство</div>
    <div class="rm-dev-name">${o.device}</div>`;
  const c2 = h('div', { class: 'card receipt-time' });
  c2.innerHTML = `<div class="rt-label">Время посадки</div>
    <div class="rt-time">${fmtTime(o.boardedAt, true)}</div>
    <div class="rt-date">${fmtDate(o.boardedAt)}</div>`;
  wrap.append(c1, c2);
  return wrap;
}

/* QR-код билета */
function ticketQR() {
  return '<img class="qr-img" src="assets/img/ticket-qr.png" alt="QR-код билета" draggable="false">';
}

/* Нижняя часть чека: QR-код, остаток баланса и пунктирный билет */
function receiptBottom(o) {
  const wrap = h('div');
  wrap.appendChild(h('div', { class: 'card qr-ticket' }, ticketQR()));
  if (o.balanceAfter !== undefined && o.balanceAfter !== null) {
    wrap.appendChild(h('div', { class: 'card rest-row' }, 'Остаток баланса ' + o.balanceAfter + ' \u20bd'));
  }
  const t = h('div', { class: 'ticket' });
  t.innerHTML = `
    <div class="tk-head">БИЛЕТ</div>
    <div class="tk-no">№${o.ticketNo}</div>
    <div class="tk-date">${fmtDate(o.boardedAt)} ${fmtTime(o.boardedAt)}</div>
    <div class="tk-sep"></div>
    <div class="tk-block">
      <div>${o.carrier}</div>
      <div>ИНН ${o.inn}</div>
      <div>по заказу МКУ "Гортранс"</div>
    </div>
    <div class="tk-sep"></div>
    <div class="tk-block">
      <div>${o.routeTitle}</div>
      <div>${o.vehicleType} ${o.plate}</div>
    </div>
    <div class="tk-sep"></div>
    <div class="tk-total">Стоимость: ${o.paid} \u20bd</div>`;
  wrap.appendChild(t);
  wrap.appendChild(h('div', { class: 'demo-hint' },
    'Демо-билет: не является платёжным документом и не даёт права проезда'));
  return wrap;
}

/* Билет действует 60 минут с момента посадки */
const TICKET_LIFE = 60 * 60;
/* сколько секунд прошло с посадки, но не больше часа */
function ticketElapsed(o) {
  const passed = Math.floor((Date.now() - new Date(o.boardedAt).getTime()) / 1000);
  return Math.max(0, Math.min(TICKET_LIFE, passed));
}
function ticketLeft(o) { return TICKET_LIFE - ticketElapsed(o); }

/* ---------- Детали заказа (чек) ---------- */
Screens.orderDetails = (o) => ({
  title: 'История заказов',
  sub: 'Детали заказа',
  bodyClass: 'pattern',
  build() {
    const w = h('div', { class: 'screen-inner' });
    w.appendChild(receiptTop(o));
    w.appendChild(receiptBottom(o));
    return w;
  }
});

/* ---------- Действующий билет ---------- */
Screens.activeTicket = (o) => ({
  title: 'Оплата проезда',
  sub: 'Заказ оплачен',
  bodyClass: 'pattern',
  build() {
    const w = h('div', { class: 'screen-inner' });

    const notify = h('button', { class: 'btn blue' },
      ICONS.bluetooth + '<span>Включить уведомления о ТС</span>');
    notify.addEventListener('click', () => toast('Уведомления о транспорте включены'));
    w.appendChild(notify);

    const c1 = h('div', { class: 'card receipt-main' });
    c1.innerHTML = `
      <div class="rm-line">Маршрут <b>\u2116 ${o.route}</b></div>
      <div class="rm-line">${o.vehicleType} <b>${o.plate}</b></div>
      <div class="rm-line">оплачено <b>${o.paid} \u20bd</b></div>
      <div class="rm-line">пассажиров <b>${o.passengers}</b> багажа <b>${o.baggage}</b></div>
      <div class="rm-dev">Устройство</div>
      <div class="rm-dev-name">${o.device}</div>`;
    w.appendChild(c1);

    const boarded = h('div', { class: 'card receipt-time' });
    boarded.innerHTML = `<div class="rt-label">Время посадки</div>
      <div class="rt-time">${fmtTime(o.boardedAt, true)}</div>
      <div class="rt-date">${fmtDate(o.boardedAt)}</div>`;
    w.appendChild(boarded);

    const trip = h('div', { class: 'card receipt-time trip-time' });
    w.appendChild(trip);
    this._trip = trip;

    const control = h('button', { class: 'btn blue' }, 'Контроль');
    control.addEventListener('click', () => banner('Ошибка сервера'));
    w.appendChild(control);

    w.appendChild(receiptBottom(o));

    const rate = h('button', { class: 'btn blue', style: 'margin-top:14px' }, 'Оценить поездку');
    rate.addEventListener('click', () => App.go(Screens.rateTrip(o)));
    w.appendChild(rate);
    return w;
  },
  paint() {
    const el = ticketElapsed(o);
    const done = el >= TICKET_LIFE;
    const mm = pad2(Math.floor(el / 60)), ss = pad2(el % 60);
    this._trip.innerHTML =
      `<div class="rt-label">${done ? 'Срок действия билета истёк' : 'Время в пути'}</div>
       <div class="rt-time${done ? ' expired' : ''}">${mm}:${ss}</div>`;
    return TICKET_LIFE - el;
  },
  mounted() {
    this.paint();
    this._tick = setInterval(() => { if (this.paint() <= 0) clearInterval(this._tick); }, 1000);
  },
  unmounted() { clearInterval(this._tick); }
});

/* ---------- Оценка поездки ---------- */
Screens.rateTrip = (o) => ({
  title: 'Оценка поездки',
  navCenter: true,
  left: 'none',
  hideTabs: false,
  bodyClass: 'plain',
  right: { icon: 'close', on: () => App.back() },
  build() {
    const w = h('div', { class: 'rate-screen' });
    const marks = Object.assign({}, o.rating || {});

    RATING_CRITERIA.forEach((label, i) => {
      const block = h('div', { class: 'rate-block' });
      block.appendChild(h('div', { class: 'rate-label' }, label));
      const row = h('div', { class: 'rate-row' });
      for (let k = 0; k < 3; k++) {
        const b = h('button', { class: 'rate-star', 'data-k': k }, starEmoji(k));
        b.addEventListener('click', () => {
          marks[i] = k;
          $$('.rate-star', row).forEach(x => x.classList.toggle('on', Number(x.dataset.k) === k));
          row.classList.add('picked');
          sync();
        });
        row.appendChild(b);
      }
      if (marks[i] !== undefined) {
        row.classList.add('picked');
        $$('.rate-star', row).forEach(x => x.classList.toggle('on', Number(x.dataset.k) === marks[i]));
      }
      block.appendChild(row);
      w.appendChild(block);
    });

    const hint = h('div', { class: 'card rate-hint' }, RATING_HINT);
    w.appendChild(hint);

    const send = h('button', { class: 'btn gray rate-send' }, 'Оценить');
    w.appendChild(send);

    const sync = () => {
      const n = Object.keys(marks).length;
      const all = n === RATING_CRITERIA.length;
      send.textContent = all || n === 0 ? 'Оценить' : 'Оценить частично';
      send.className = 'btn rate-send ' + (n === 0 ? 'gray' : 'blue');
      send.disabled = n === 0;
    };
    sync();

    send.addEventListener('click', () => {
      const vals = Object.values(marks);
      o.rating = marks;
      o.rated = Math.round(vals.reduce((a, b) => a + b + 1, 0) / vals.length);
      Store.save();
      loading(true, 'Отправка');
      setTimeout(() => {
        loading(false);
        toast('Спасибо за оценку поездки!');
        App.back();
      }, 800);
    });

    return w;
  }
});

/* ---------- Порядок оплаты ---------- */
Screens.payRules = () => ({
  title: 'Порядок оплаты',
  bodyClass: 'flat-white',
  build() {
    const w = h('div', { class: 'doc' });
    PAY_RULES.forEach(t => w.appendChild(h('p', { class: 'doc-p' }, t)));
    return w;
  }
});

/* ---------- Лента уведомлений ---------- */
Screens.notifications = () => ({
  title: 'Уведомления',
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'screen-inner' });
    NOTIFICATIONS.forEach(n => {
      const c = h('div', { class: 'card' });
      c.innerHTML = `<div class="n-date muted">${n.date}</div>
        <div class="card-title">${n.title}</div><p class="rule-text">${n.text}</p>`;
      w.appendChild(c);
    });
    return w;
  }
});
