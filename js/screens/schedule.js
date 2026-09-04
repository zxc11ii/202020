/* ============================================================
   Вкладка «Расписание»
   ============================================================ */

Screens.scheduleHome = () => ({
  title: 'Расписание',
  left: 'none',
  bodyClass: 'pattern',
  right: [
    { icon: 'starBox', on: () => App.go(Screens.favorites()) },
    { icon: 'mapSolid', label: 'Карта', on: () => App.go(Screens.scheduleMap()) }
  ],
  build() {
    const w = h('div', { class: 'screen-inner' });
    const pick = { date: new Date(), type: null, route: null, dir: null, stop: null };

    /* дата */
    const dateRow = h('div', { class: 'sched-date' });
    const field = h('button', { class: 'date-field' });
    const cal = h('button', { class: 'cal-btn' }, ICONS.calendar);
    dateRow.append(field, cal);
    w.appendChild(dateRow);

    const openDates = () => {
      const rows = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const label = pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1) + '.' + d.getFullYear();
        rows.push({
          label, value: i === 0 ? 'сегодня' : (i === 1 ? 'завтра' : ''),
          onClick: () => { pick.date = d; paint(); }
        });
      }
      openSheet('Дата', rows);
    };
    field.addEventListener('click', openDates);
    cal.addEventListener('click', openDates);

    /* селекторы */
    const mkSel = (label, icon, onClick) => {
      const b = h('button', { class: 'sel-row' });
      b.innerHTML = `<span class="sel-text"><span class="sel-label">${label}</span>
        <span class="sel-value"></span></span><span class="sel-ico">${ICONS[icon]}</span>`;
      b.addEventListener('click', onClick);
      w.appendChild(b);
      return b;
    };

    const selType = mkSel('Тип транспорта', 'busType', () => openSheet('Тип транспорта', [
      { label: 'Автобус', onClick: () => { pick.type = 'bus'; pick.route = pick.dir = null; paint(); } },
      { label: 'Трамвай', onClick: () => { pick.type = 'tram'; pick.route = pick.dir = null; paint(); } }
    ]));

    const selRoute = mkSel('Маршрут', 'routeFork', () => {
      const list = ROUTES.filter(r => !pick.type || r.type === pick.type);
      openSheet('Маршрут', list.map(r => ({
        label: '№ ' + r.num + ' · ' + r.title,
        onClick: () => { pick.route = r; pick.type = r.type; pick.dir = null; paint(); }
      })));
    });

    const selDir = mkSel('Направление', 'direction', () => {
      if (!pick.route) return toast('Сначала выберите маршрут');
      const parts = pick.route.title.split('—').map(x => x.trim());
      openSheet('Направление', [
        { label: parts[0] + ' → ' + parts[1], onClick: () => { pick.dir = 0; paint(); } },
        { label: parts[1] + ' → ' + parts[0], onClick: () => { pick.dir = 1; paint(); } }
      ]);
    });

    const selStop = mkSel('Остановка', 'stopBus', () => {
      openSheet('Остановка', STOPS.map(st => ({
        label: st.name,
        onClick: () => { pick.stop = st; paint(); App.go(Screens.stopArrivals(st)); }
      })));
    });

    const paint = () => {
      field.textContent = pad2(pick.date.getDate()) + '.' +
        pad2(pick.date.getMonth() + 1) + '.' + pick.date.getFullYear();
      const set = (el, v) => {
        $('.sel-value', el).textContent = v || '';
        el.classList.toggle('filled', !!v);
      };
      set(selType, pick.type ? (pick.type === 'bus' ? 'Автобус' : 'Трамвай') : '');
      set(selRoute, pick.route ? '№ ' + pick.route.num : '');
      if (pick.dir !== null && pick.route) {
        const parts = pick.route.title.split('—').map(x => x.trim());
        set(selDir, pick.dir === 0 ? parts[1] : parts[0]);
      } else set(selDir, '');
      set(selStop, pick.stop ? pick.stop.name : '');
    };
    paint();
    return w;
  }
});

Screens.scheduleMap = () => ({
  title: 'Расписание на карте',
  bodyClass: 'map-screen',
  right: { icon: 'starBox', on: () => App.go(Screens.favorites()) },
  build() {
    const w = h('div', { class: 'map-wrap' });
    w.appendChild(h('div', { class: 'map' }));

    const zoom = h('div', { class: 'map-zoom' });
    const zi = h('button', { class: 'map-btn' }, ICONS.plus);
    const zo = h('button', { class: 'map-btn' }, ICONS.minus);
    zoom.append(zi, zo);
    w.appendChild(zoom);

    const left = h('div', { class: 'map-tools' });
    const fav = h('button', { class: 'map-btn' }, ICONS.stopSign);
    const layers = h('button', { class: 'map-btn' }, ICONS.layers);
    fav.addEventListener('click', () => App.go(Screens.favorites()));
    layers.addEventListener('click', () => openSheet('Слои карты', [
      { label: 'Остановки', value: 'вкл', onClick: () => toast('Слой остановок включён') },
      { label: 'Транспорт онлайн', value: 'выкл', onClick: () => App.go(Screens.vehiclesMap()) },
      { label: 'Схема маршрутов', value: 'выкл', onClick: () => toast('Слой недоступен в демо-режиме') }
    ]));
    left.append(fav, layers);
    w.appendChild(left);

    const locate = h('button', { class: 'map-btn map-locate' }, ICONS.locate);
    w.appendChild(locate);

    this._refs = { zi, zo, locate };
    return w;
  },
  mounted(el) {
    const map = L.map($('.map', el), { zoomControl: false }).setView(CITY.center, CITY.zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap'
    }).addTo(map);
    el.__map = map;
    STOPS.forEach(s => {
      L.marker([s.lat, s.lng], { icon: stopMarkerIcon() })
        .addTo(map).on('click', () => App.go(Screens.stopArrivals(s)));
    });
    this._refs.zi.addEventListener('click', () => map.zoomIn());
    this._refs.zo.addEventListener('click', () => map.zoomOut());
    this._refs.locate.addEventListener('click', () => {
      map.flyTo(CITY.center, 16);
      toast('Местоположение определено');
    });
    setTimeout(() => map.invalidateSize(), 120);
  },
  unmounted(el) { if (el.__map) el.__map.remove(); }
});

/* ---------- Прибытия на остановке ---------- */
Screens.stopArrivals = (stop) => ({
  title: stop.name,
  sub: 'Ближайшие прибытия',
  bodyClass: 'plain',
  right: { icon: 'bookmark', on() { Screens._toggleFav(stop); } },
  build() {
    const w = h('div', { class: 'screen-inner' });
    const list = h('div', { class: 'list' });
    arrivalsFor(stop.id).forEach(a => {
      list.appendChild(h('div', { class: 'list-row' },
        `<span class="lr-badge ${a.type}">${a.route}</span>
         <span class="lr-body"><span class="lr-title">${a.type === 'tram' ? 'Трамвай' : 'Автобус'} № ${a.route}</span>
         <span class="lr-sub">${a.title}</span></span>
         <span class="arr-min">${a.minutes}<em>мин</em></span>`));
    });
    w.appendChild(list);
    w.appendChild(h('div', { class: 'muted center', style: 'padding:16px;font-size:13px' },
      'Данные актуальны на ' + nowTime()));
    return w;
  }
});

Screens._toggleFav = function (stop) {
  const f = Store.state.favorites;
  const i = f.indexOf(stop.id);
  if (i >= 0) { f.splice(i, 1); toast('Удалено из избранного'); }
  else { f.push(stop.id); toast('Добавлено в избранное'); }
  Store.save();
};

/* ---------- Избранные остановки ---------- */
Screens.favorites = () => ({
  title: 'Избранное',
  bodyClass: 'plain',
  build() {
    const ids = Store.state.favorites;
    if (!ids.length)
      return h('div', { class: 'empty' }, ICONS.bookmark +
        '<div>Избранных остановок нет.<br>Откройте остановку на карте и нажмите на закладку.</div>');
    const w = h('div', { class: 'screen-inner' });
    const list = h('div', { class: 'list' });
    ids.forEach(id => {
      const s = STOPS.find(x => x.id === id);
      if (!s) return;
      const row = h('button', { class: 'list-row' },
        `<span class="lr-body"><span class="lr-title">${s.name}</span>
         <span class="lr-sub">Остановка</span></span>` + ICONS.chevron);
      row.addEventListener('click', () => App.go(Screens.stopArrivals(s)));
      list.appendChild(row);
    });
    w.appendChild(list);
    return w;
  }
});
