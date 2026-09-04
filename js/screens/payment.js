/* ============================================================
   Универсальный экран оплаты и экран успеха
   ============================================================ */

Screens.payment = (cfg) => ({
  title: cfg.title || 'Оплата',
  sub: 'Оплата',
  bodyClass: 'pattern',
  build() {
    const unit = cfg.totalUnit || '₽';
    let method = PAY_METHODS.find(m => m.id === Store.state.lastPayMethod) || PAY_METHODS[0];

    const w = h('div', { class: 'screen-inner' });

    /* реквизиты платежа */
    const doc = h('div', { class: 'card pay-doc' });
    doc.innerHTML =
      `<div class="pd-head">${cfg.header.map(x => `<div>${x}</div>`).join('')}</div>
       <div class="pd-sep"></div>` +
      cfg.lines.map(l => `<div class="pd-row">
          <div class="pd-label">${l.label}</div>
          <div class="pd-value">${l.value}${l.blur ? '<span class="pd-blur"></span>' : ''}</div>
        </div>`).join('') +
      `<div class="pd-sep"></div>
       <div class="pd-row"><div class="pd-label">К оплате</div>
       <div class="pd-value">${cfg.total} ${unit}</div></div>`;
    w.appendChild(doc);

    /* способ оплаты */
    const mrow = h('button', { class: 'card method-row' });
    const paint = () => {
      mrow.innerHTML = `<span class="mr-name">${method.name}</span>
        <span class="mr-art">${ICONS[method.art]}</span>` + ICONS.chevron;
    };
    mrow.addEventListener('click', () => {
      openSheet('Способ оплаты', PAY_METHODS.map(m => ({
        label: m.name, art: m.art,
        onClick: () => {
          method = m; Store.state.lastPayMethod = m.id; Store.save(); paint();
        }
      })));
    });
    paint();
    w.appendChild(mrow);

    /* кнопка оплаты */
    const pay = h('button', { class: 'btn green-dark', style: 'margin-top:14px' },
      ICONS.creditCard + '<span>К оплате</span>');
    pay.addEventListener('click', () => {
      loading(true, 'Проводим платёж');
      setTimeout(() => {
        loading(false);
        App.replace(Screens.paySuccess(cfg, method, unit));
      }, 1800);
    });
    w.appendChild(pay);

    return w;
  },
  mounted() {
    /* показать выбор способа оплаты сразу — как в оригинальном приложении */
  }
});

/* ---------- Успешная оплата ---------- */
Screens.paySuccess = (cfg, method, unit) => ({
  title: cfg.title || 'Оплата',
  sub: 'Платёж выполнен',
  left: 'none',
  bodyClass: 'pattern',
  build() {
    const w = h('div', { class: 'screen-inner' });
    const c = h('div', { class: 'card success-card' });
    c.innerHTML = `
      <div class="ok-circle"><svg viewBox="0 0 48 48"><path d="M13 25l7.5 7.5L35 17" fill="none"
        stroke="#fff" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="ok-title">Оплата прошла успешно</div>
      <div class="ok-sum">${cfg.total} ${unit}</div>
      <div class="ok-meta muted">${method.name}<br>${nowDate()} в ${nowTimeSec()}</div>`;
    w.appendChild(c);

    const done = h('button', { class: 'btn', style: 'margin-top:16px' }, 'Готово');
    done.addEventListener('click', () => cfg.onSuccess && cfg.onSuccess());
    w.appendChild(done);
    return w;
  }
});
