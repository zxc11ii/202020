/* ============================================================
   Вкладка «Кабинет»
   ============================================================ */

Screens.account = () => ({
  title: 'Кабинет',
  left: 'none',
  bodyClass: 'plain',
  right: { icon: 'gear', on: () => App.go(Screens.settings()) },
  build() {
    const w = h('div');

    const head = h('div', { class: 'profile-flat' });
    head.innerHTML = `<div class="pf-avatar">${ICONS.tabAccount}</div>
      <div class="pf-body">
        <div class="pf-mail">${USER.email}</div>
        <div class="pf-tel">${USER.phone}</div>
      </div>`;
    w.appendChild(head);

    const rows = [
      { label: 'Пункты выдачи и пополнения',      go: () => App.go(Screens.servicePoints()) },
      { label: 'Тарифное меню',                   go: () => App.go(Screens.tariffMenu()) },
      { label: 'Правила пересадки',               go: () => App.go(Screens.textPage('transfer')) },
      { label: 'Порядок оформления ЛПД',          go: () => App.go(Screens.textPage('lpd')) },
      { label: 'Новостная лента',                 go: () => App.go(Screens.notifications()) },
      { label: 'Профиль',                         go: () => App.go(Screens.profile()) },
      { label: 'Привязанные счета СБП',           go: () => App.go(Screens.sbpAccounts()) },
      { label: 'Порядок оплаты по цифровой карте', go: () => App.go(Screens.payRules()) },
      { label: 'Написать в службу поддержки',     go: () => App.go(Screens.feedback()) },
      { label: 'О приложении',                    go: () => App.go(Screens.about('about')) }
    ];
    const list = h('div', { class: 'flat-list' });
    rows.forEach(r => {
      const row = h('button', { class: 'flat-row' }, r.label);
      row.addEventListener('click', r.go);
      list.appendChild(row);
    });
    w.appendChild(list);
    return w;
  }
});

/* ---------- Настройки ---------- */
const THEME_NAMES = { system: 'Как в системе', light: 'Светлое', dark: 'Тёмное' };

Screens._pickTheme = function (after) {
  openSheet('Оформление', Object.keys(THEME_NAMES).map(k => ({
    label: THEME_NAMES[k],
    value: (Store.state.theme || 'system') === k ? '✓' : '',
    onClick: () => { App.setTheme(k); after && after(); }
  })));
};

Screens.settings = () => ({
  title: 'Настройки',
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'screen-inner' });
    const list = h('div', { class: 'list' });

    const theme = h('button', { class: 'list-row' },
      `<span class="lr-body"><span class="lr-title">Оформление</span></span>
       <span class="lr-value">${THEME_NAMES[Store.state.theme || 'system']}</span>` + ICONS.chevron);
    theme.addEventListener('click', () => Screens._pickTheme(() => App.replace(Screens.settings())));
    list.appendChild(theme);

    const reset = h('button', { class: 'list-row' },
      `<span class="lr-body"><span class="lr-title" style="color:#e4142b">Сбросить демо-данные</span></span>`);
    reset.addEventListener('click', () => {
      Store.reset();
      App.stacks.pass = []; App.stacks.tickets = []; App.stacks.schedule = [];
      App.setRoot(Screens.account());
      toast('Демо-данные восстановлены');
    });
    list.appendChild(reset);

    w.appendChild(list);
    w.appendChild(h('div', { class: 'muted center', style: 'padding:18px 8px;font-size:12px' },
      'Версия 3.24 · демонстрационная веб-версия'));
    return w;
  }
});

/* ---------- Пункты выдачи и пополнения ---------- */
Screens.servicePoints = () => ({
  title: 'Пункты выдачи и пополнения',
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'screen-inner' });
    const list = h('div', { class: 'list' });
    SERVICE_POINTS.forEach(sp => {
      list.appendChild(h('div', { class: 'list-row' },
        `<span class="lr-body">
           <span class="lr-title">${sp.name}</span>
           <span class="lr-sub">${sp.addr}</span>
           <span class="lr-sub">${sp.time}</span>
         </span>`));
    });
    w.appendChild(list);
    return w;
  }
});

/* ---------- Тарифное меню ---------- */
Screens.tariffMenu = () => ({
  title: 'Тарифное меню',
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'screen-inner' });
    const fare = h('div', { class: 'card' });
    fare.innerHTML = `<div class="card-title">Разовая поездка</div>
      <p class="rule-text">Проезд на всех видах транспорта — ${FARE.ticket} ₽.<br>
      Пересадка на всех видах транспорта — ${FARE.transfer} ₽.<br>
      Провоз багажа — ${FARE.baggage} ₽.</p>`;
    w.appendChild(fare);

    w.appendChild(h('div', { class: 'section-title' }, 'Проездные документы'));
    const list = h('div', { class: 'list' });
    TARIFFS.forEach(t => {
      list.appendChild(h('div', { class: 'list-row' },
        `<span class="lr-body"><span class="lr-title">${t.name}</span>
         <span class="lr-sub">${t.note}</span></span>
         <span class="lr-value" style="color:var(--text)">${rub(t.price)}</span>`));
    });
    w.appendChild(list);
    return w;
  }
});

/* ---------- Текстовые разделы ---------- */
Screens.textPage = (mode) => ({
  title: mode === 'transfer' ? 'Правила пересадки' : 'Порядок оформления ЛПД',
  bodyClass: 'flat-white',
  build() {
    const w = h('div', { class: 'doc' });
    (mode === 'transfer' ? TRANSFER_RULES : LPD_RULES)
      .forEach(t => w.appendChild(h('p', { class: 'doc-p' }, t)));
    return w;
  }
});

/* ---------- Профиль ---------- */
Screens.profile = () => ({
  title: 'Профиль',
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'screen-inner' });
    const c = h('div', { class: 'list' });
    [['E-mail', USER.email], ['Телефон', USER.phone], ['Устройство', USER.device]].forEach(([k, v]) => {
      c.appendChild(h('div', { class: 'list-row' },
        `<span class="lr-body"><span class="lr-title">${k}</span></span>
         <span class="lr-value">${v}</span>`));
    });
    w.appendChild(c);
    w.appendChild(h('div', { class: 'muted', style: 'padding:14px 4px;font-size:13px;line-height:1.5' },
      'Профиль используется для выпуска и активации цифровой транспортной карты. ' +
      'Управление профилем доступно через указанный при регистрации адрес электронной почты.'));
    return w;
  }
});

/* ---------- Привязанные счета СБП ---------- */
Screens.sbpAccounts = () => ({
  title: 'Привязанные счета СБП',
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'screen-inner' });
    const list = h('div', { class: 'list' });
    list.appendChild(h('div', { class: 'list-row' },
      `<span class="lr-body"><span class="lr-title">Сбербанк</span>
       <span class="lr-sub">Счёт •• 4417 · по умолчанию</span></span>`));
    w.appendChild(list);
    const add = h('button', { class: 'btn light', style: 'margin-top:14px' },
      ICONS.plusCircle + '<span>Привязать счёт</span>');
    add.addEventListener('click', () => toast('Привязка счёта недоступна в демо-режиме'));
    w.appendChild(add);
    return w;
  }
});

/* ---------- Обратная связь ---------- */
Screens.feedback = () => ({
  title: 'Служба поддержки',
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'screen-inner' });
    const c = h('div', { class: 'card' });
    c.innerHTML = `<div class="card-title">Написать в службу поддержки</div>`;
    const ta = h('textarea', { class: 'ta', rows: '6', placeholder: 'Опишите проблему или предложение' });
    c.appendChild(ta);
    w.appendChild(c);

    const send = h('button', { class: 'btn green', style: 'margin-top:14px' }, 'Отправить');
    send.addEventListener('click', () => {
      if (!ta.value.trim()) return toast('Введите текст обращения');
      loading(true, 'Отправка');
      setTimeout(() => { loading(false); toast('Обращение отправлено'); App.back(); }, 900);
    });
    w.appendChild(send);

    const contacts = h('div', { class: 'card', style: 'margin-top:16px' });
    contacts.innerHTML = `<div class="card-title">Контакты</div>
      <p class="rule-text">МКУ «Гортранс», г. Пермь<br>
      Телефон: +7 342 236 33 35<br>
      E-mail: help@proezdnoy59.ru</p>`;
    w.appendChild(contacts);
    return w;
  }
});

/* ---------- О приложении / конфиденциальность ---------- */
Screens.about = (mode) => ({
  title: mode === 'privacy' ? 'Конфиденциальность' : 'О приложении',
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'screen-inner' });
    const c = h('div', { class: 'card' });
    if (mode === 'privacy') {
      c.innerHTML = `<div class="card-title">Обработка данных</div>
        <p class="rule-text">Разработчик не ведёт сбор данных в этом приложении.
        Данные о поездках хранятся локально на устройстве и используются только
        для отображения истории заказов и состояния транспортных карт.</p>`;
    } else {
      c.innerHTML = `<div class="demo-note-title">${ICONS.info}<span>Это демо-приложение</span></div>
        <p class="rule-text">Приложение создано только для демонстрации интерфейса. Оно
        <b>не является платёжным средством</b> и <b>не даёт права проезда</b>
        в общественном транспорте.</p>
        <p class="rule-text">Все карты, билеты, балансы, маршруты и платежи — вымышленные:
        деньги не списываются, билеты недействительны при контроле.</p>
        <p class="rule-text">Данные хранятся только на вашем устройстве и никуда не передаются.
        Приложение не связано с перевозчиками, транспортными организациями и их
        официальными сервисами.</p>
        <p class="rule-text muted">Демо-версия · 1.0</p>`;
      c.className = 'card demo-note';
    }
    w.appendChild(c);
    return w;
  }
});
