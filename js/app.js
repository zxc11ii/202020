/* ============================================================
   Оболочка приложения: вкладки, стек навигации, шапка, меню
   ============================================================ */

const App = {
  tabs: [
    { id: 'tickets',  label: 'Билеты',     icon: 'tabTickets',  root: () => Screens.digitalCard() },
    { id: 'pass',     label: 'Проездной',  icon: 'tabPass',     root: () => Screens.passHome() },
    { id: 'schedule', label: 'Расписание', icon: 'tabSchedule', root: () => Screens.scheduleHome() },
    { id: 'account',  label: 'Кабинет',    icon: 'tabAccount',  root: () => Screens.account() }
  ],
  stacks: {},
  tab: 'tickets',
  busy: false,

  /* --- запуск --- */
  init() {
    Store.load();
    this.applyTheme();
    this.buildTabbar();
    this.buildDrawer();
    this.bindShell();
    this.tabs.forEach(t => this.stacks[t.id] = []);
    this.openTab('tickets', true);
  },

  /* --- оформление: системная / светлая / тёмная --- */
  applyTheme() {
    const t = Store.state.theme || 'system';
    const root = document.documentElement;
    if (t === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', t);
    const dark = t === 'dark' ||
      (t === 'system' && matchMedia('(prefers-color-scheme:dark)').matches);
    document.querySelectorAll('meta[name="theme-color"]')
      .forEach(m => m.setAttribute('content', dark ? '#0b0b0d' : '#f5f5f5'));
  },
  setTheme(t) {
    Store.state.theme = t; Store.save();
    this.applyTheme();
  },

  bindShell() {
    $('#drawerScrim').addEventListener('click', () => this.closeDrawer());
    $('#drawerClose').addEventListener('click', () => this.closeDrawer());
    $('#sheetScrim').addEventListener('click', closeSheet);
    $('#navLeft').addEventListener('click', () => {
      const cur = this.current();
      if (this.stack().length > 1) this.back();
      else if (cur && cur.left !== 'none') this.openDrawer();
    });
  },

  /* --- нижние вкладки --- */
  buildTabbar() {
    const bar = $('#tabbar');
    bar.innerHTML = '';
    this.tabs.forEach(t => {
      const b = h('button', { class: 'tab', 'data-tab': t.id },
        ICONS[t.icon] + `<span class="tab-label">${t.label}</span>`);
      b.addEventListener('click', () => this.openTab(t.id));
      bar.appendChild(b);
    });
  },

  openTab(id, force) {
    if (this.tab === id && !force) {
      if (this.stack().length > 1) this.popToRoot();
      return;
    }
    closeSheet();
    this.closeDrawer();
    this.tab = id;
    $$('#tabbar .tab').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    const st = this.stack();
    if (!st.length) {
      const tab = this.tabs.find(t => t.id === id);
      st.push(tab.root());
    }
    this.render('fade');
  },

  stack() { return this.stacks[this.tab]; },
  current() { const s = this.stack(); return s[s.length - 1]; },

  /* --- навигация --- */
  go(screen) {
    if (!screen) return;
    this.stack().push(screen);
    this.render('push');
  },
  back() {
    const s = this.stack();
    if (s.length < 2) return;
    s.pop();
    this.render('pop');
  },
  popToRoot() {
    const s = this.stack();
    if (s.length < 2) return;
    this.stacks[this.tab] = [s[0]];
    this.render('pop');
  },
  replace(screen) {
    const s = this.stack();
    s[s.length - 1] = screen;
    this.render('fade');
  },
  /* сбросить стек вкладки и открыть новый экран (для пунктов бокового меню) */
  setRoot(screen) {
    this.stacks[this.tab] = [screen];
    this.render('fade');
  },

  /* --- отрисовка --- */
  render(mode) {
    const vp = $('#viewport');
    const screen = this.current();
    const oldEls = $$('.screen', vp);
    const oldEl = oldEls[oldEls.length - 1] || null;

    const el = h('div', { class: 'screen ' + (screen.bodyClass || 'pattern') });
    el.__screen = screen;
    const content = screen.build ? screen.build() : null;
    if (content) el.appendChild(content);
    vp.appendChild(el);

    // анимация
    if (mode === 'push' && oldEl) { oldEl.classList.add('anim-push-out'); el.classList.add('anim-push-in'); }
    else if (mode === 'pop' && oldEl) { oldEl.classList.add('anim-pop-out'); el.classList.add('anim-pop-in'); }
    else { el.classList.add('anim-fade'); }

    const cleanup = () => {
      oldEls.forEach(o => {
        if (!o.parentNode) return;
        const prev = o.__screen;
        if (prev && prev.unmounted) prev.unmounted(o);
        o.remove();
      });
      el.classList.remove('anim-push-in', 'anim-pop-in', 'anim-fade');
    };
    if (oldEls.length) setTimeout(cleanup, mode === 'fade' ? 190 : 330); else cleanup();

    this.paintNav(screen);
    if (screen.mounted) requestAnimationFrame(() => {
      if (this.current() === screen) screen.mounted(el);
    });
  },

  paintNav(screen) {
    const navbar = $('#navbar');
    navbar.className = 'navbar' + (screen.navWhite ? ' white' : '') + (screen.navCenter ? ' center' : '');
    const titleEl = $('#navTitle');
    if (screen.titleHTML) {
      titleEl.innerHTML = screen.titleHTML;
      const copy = $('.nav-copy', titleEl);
      if (copy) copy.addEventListener('click', () => screen.onCopy && screen.onCopy());
    } else {
      titleEl.textContent = screen.title || '';
    }
    $('#navSub').textContent = screen.sub || '';

    const deep = this.stack().length > 1;
    const left = $('#navLeft');
    const leftMode = screen.left || (deep ? 'back' : 'burger');
    left.innerHTML = leftMode === 'back' ? ICONS.back : (leftMode === 'none' ? '' : ICONS.burger);
    left.classList.toggle('hidden', leftMode === 'none');

    const right = $('#navRight');
    right.innerHTML = '';
    const items = screen.right ? (Array.isArray(screen.right) ? screen.right : [screen.right]) : [];
    right.classList.toggle('hidden', !items.length);
    items.forEach(it => {
      const b = h('button', { class: 'nav-btn' },
        (ICONS[it.icon] || '') + (it.label ? `<span>${it.label}</span>` : ''));
      b.addEventListener('click', () => it.on && it.on());
      right.appendChild(b);
    });
    $('#tabbar').classList.toggle('hidden', !!screen.hideTabs);
    $('#navbar').style.display = screen.hideNav ? 'none' : '';
  },

  /* --- боковое меню --- */
  buildDrawer() {
    const list = $('#drawerList');
    list.innerHTML = '';
    DRAWER_ITEMS.forEach(item => {
      const li = h('li');
      const b = h('button', { class: 'drawer-item', 'data-id': item.id },
        `<span class="di-icon">${ICONS[item.icon]}</span><span>${item.label}</span>`);
      b.addEventListener('click', () => {
        this.closeDrawer();
        setTimeout(() => {
          this.drawerActive = item.id;
          if (this.tab !== 'tickets') this.openTab('tickets');
          this.setRoot(item.screen());
          this.markDrawer();
        }, 260);
      });
      li.appendChild(b);
      list.appendChild(li);
    });
  },
  markDrawer() {
    $$('#drawerList .drawer-item').forEach(b =>
      b.classList.toggle('active', b.dataset.id === this.drawerActive));
  },
  openDrawer() { this.markDrawer(); $('#drawer').classList.add('open'); $('#drawerScrim').classList.add('open'); },
  closeDrawer() { $('#drawer').classList.remove('open'); $('#drawerScrim').classList.remove('open'); }
};

/* Пункты бокового меню — как в оригинальном приложении */
const DRAWER_ITEMS = [
  { id: 'qr',      label: 'Сканировать QR',      icon: 'qr',        screen: () => Screens.scanQR() },
  { id: 'plate',   label: 'Ввести гос. номер ТС', icon: 'bus',      screen: () => Screens.enterPlate() },
  { id: 'map',     label: 'Выбрать ТС на карте',  icon: 'map',      screen: () => Screens.vehiclesMap() },
  { id: 'bt',      label: 'Поиск ТС по Bluetooth', icon: 'bluetooth', screen: () => Screens.bluetooth() },
  { id: 'current', label: 'Текущий заказ',        icon: 'clipboard', screen: () => Screens.currentOrder() },
  { id: 'history', label: 'История заказов',      icon: 'history',   screen: () => Screens.orderHistory() },
  { id: 'digital', label: 'Цифровая карта',       icon: 'cardLines', screen: () => Screens.digitalCard() },
  { id: 'rules',   label: 'Порядок оплаты',       icon: 'info',      screen: () => Screens.payRules() }
];

document.addEventListener('DOMContentLoaded', () => App.init());
