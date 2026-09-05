/* ============================================================
   Вкладка «Проездной» — Единая транспортная карта
   ============================================================ */

/* --- Переиспользуемые блоки экрана карты --- */
function canTopUp(card) { return card.kind !== 'school' && card.kind !== 'pension'; }

function fillBalance(el, card) {
  el.innerHTML = `<span>Баланс:</span><span class="bal-value">${card.balance} \u20bd</span>`;
  const r = h('button', { class: 'bal-refresh' }, ICONS.refresh);
  r.addEventListener('click', () => {
    loading(true, 'Обновление');
    setTimeout(() => { loading(false); toast('Баланс обновлён'); }, 700);
  });
  el.appendChild(r);
}

function fillServices(el, card) {
  /* без подключённых проездных блок не показываем */
  if (!card.services.length) { el.style.display = 'none'; el.innerHTML = ''; return; }
  el.style.display = '';
  el.innerHTML = `<div class="srv-head"><span>Активные проездные</span><span>Остаток</span></div>`;
  card.services.forEach(s => {
    const row = h('div', { class: 'srv-row' });
    row.innerHTML = `<span class="srv-name"><b>${s.name}</b><em>${s.rest}</em></span>` +
      (s.restValue && s.restValue !== '\u221e' ? `<span class="srv-rest">${s.restValue}</span>` : '');
    el.appendChild(row);
  });
}

function cardActionsEl(getCard) {
  const stack = h('div', { class: 'btn-stack pass-actions' });
  const bTop = h('button', { class: 'btn ' + (canTopUp(getCard()) ? 'green' : 'gray') },
    ICONS.wallet + '<span>Пополнить</span>');
  const bBuy = h('button', { class: 'btn green' }, ICONS.busOutline + '<span>Купить проездной</span>');
  const bHist = h('button', { class: 'btn' }, ICONS.historyBack + '<span>История</span>');
  bTop.addEventListener('click', () => {
    const c = getCard();
    if (!canTopUp(c)) return toast('Пополнение баланса недоступно\nдля льготной карты');
    App.go(Screens.topUp(c));
  });
  bBuy.addEventListener('click', () => {
    const c = getCard();
    App.go(c.kind === 'digital' ? Screens.buyPass(c) : Screens.buyService(c));
  });
  bHist.addEventListener('click', () => App.go(Screens.cardOps(getCard())));
  stack.append(bTop, bBuy, bHist);
  stack.sync = () => { bTop.className = 'btn ' + (canTopUp(getCard()) ? 'green' : 'gray'); };
  return stack;
}

Screens.passHome = () => ({
  navWhite: true,
  bodyClass: 'pattern',
  left: 'none',
  idx: 0,
  get title() { return this.idx === Store.cards.length ? 'Добавить карту' : 'Единая транспортная карта'; },
  right: { icon: 'dots', on: () => openSheet('Действия с картой', [
    { label: 'Переименовать карту', onClick: () => toast('Переименование недоступно в демо-режиме') },
    { label: 'Удалить карту', onClick: () => Screens._removeCard() }
  ]) },
  build() {
    const w = h('div', { class: 'pass-wrap' });
    this.idx = Store.state.activeCard;

    /* карусель: карты + слайд добавления */
    const track = h('div', { class: 'etk-track' });
    Store.cards.forEach(c => {
      const slide = h('div', { class: 'etk-slide' });
      slide.appendChild(etkCardEl(c));
      track.appendChild(slide);
    });
    const addSlide = h('div', { class: 'etk-slide' });
    addSlide.innerHTML = `<div class="etk-add"><img src="assets/img/add-card.jpg" alt="Добавить карту"></div>`;
    track.appendChild(addSlide);
    w.appendChild(track);
    this._track = track;

    /* точки: карты + красная точка с плюсом */
    const dots = h('div', { class: 'dots' });
    Store.cards.forEach((c, i) => {
      const d = h('button', { class: 'dot', 'data-i': i });
      d.addEventListener('click', () => this.select(i));
      dots.appendChild(d);
    });
    const addDot = h('button', { class: 'dot dot-add' }, '+');
    addDot.addEventListener('click', () => this.select(Store.cards.length));
    dots.appendChild(addDot);
    w.appendChild(dots);
    this._dots = dots;

    /* --- блоки существующей карты --- */
    const cardBox = h('div', { class: 'pass-card-box' });
    const benefit = h('div', { class: 'card notice' });
    const bal = h('div', { class: 'card balance-row' });
    const srv = h('div', { class: 'card services' });
    const stack = cardActionsEl(() => Store.card);
    cardBox.append(benefit, bal, srv, stack);
    w.appendChild(cardBox);

    /* --- форма добавления карты --- */
    const addBox = h('div', { class: 'pass-card-box' });
    const form = h('div', { class: 'card add-card' });
    form.innerHTML = `<div class="ac-title">Номер карты</div>
      <div class="ac-row"><span class="ac-prefix">96431059033</span></div>
      <div class="ac-hint">Введите последние 8 цифр номера карты.</div>`;
    const input = h('input', { class: 'ac-input', type: 'tel', inputmode: 'numeric',
      maxlength: '8', autocomplete: 'off' });
    $('.ac-row', form).appendChild(input);
    addBox.appendChild(form);

    const addBtn = h('button', { class: 'btn gray', style: 'margin-top:12px' },
      ICONS.plusCircle + '<span>Добавить</span>');
    addBtn.addEventListener('click', () => {
      const tail = input.value.replace(/\D/g, '');
      if (tail.length !== 8) return toast('Введите последние 8 цифр номера карты');
      loading(true, 'Проверка карты');
      setTimeout(() => {
        loading(false);
        Store.cards.push({
          id: 'c' + Date.now(), kind: 'common', number: '96431059033' + tail,
          label: 'Карта ' + (Store.cards.length + 1), balance: 0, services: []
        });
        Store.state.activeCard = Store.cards.length - 1;
        Store.save();
        App.setRoot(Screens.passHome());
        toast('Карта добавлена');
      }, 1000);
    });
    addBox.appendChild(addBtn);

    const note = h('div', { class: 'card info-plain' });
    note.innerHTML = `<p>В данном разделе добавляются пластиковые транспортные карты по номеру,
      указанному на оборотной стороне карты. Пластиковой транспортной картой оплата проезда
      осуществляется только через валидатор. Для выпуска цифровой карты или активации ранее
      выпущенной цифровой карты на устройстве для оплаты проезда через приложение перейдите
      в раздел Билеты и следуйте инструкции. При возникновении вопросов обращайтесь,
      пожалуйста, в службу поддержки по адресу help@proezdnoy59.ru.</p>`;
    addBox.appendChild(note);
    w.appendChild(addBox);

    this.refresh = () => {
      const adding = this.idx === Store.cards.length;
      cardBox.style.display = adding ? 'none' : '';
      addBox.style.display = adding ? '' : 'none';

      $$('.dot', this._dots).forEach((d, k) => {
        const isAdd = d.classList.contains('dot-add');
        const active = isAdd ? adding : k === this.idx;
        d.classList.toggle('on', active);
        d.setAttribute('style', active && !isAdd
          ? '--dot:' + CARD_KINDS[Store.cards[k].kind].color : '');
      });

      if (adding) return;
      const c = Store.card;
      if (c.benefitUntil) {
        benefit.style.display = '';
        benefit.innerHTML = `<div class="notice-text">Льгота подтверждена до ${c.benefitUntil}</div>`;
        const more = h('button', { class: 'notice-btn' }, ICONS.warn + '<span>Подробнее…</span>');
        more.addEventListener('click', () => App.go(Screens.benefitInfo(c)));
        benefit.appendChild(more);
      } else {
        benefit.style.display = 'none';
      }
      const withBalance = c.balance !== null && c.balance !== undefined;
      bal.style.display = withBalance ? '' : 'none';
      if (withBalance) fillBalance(bal, c);
      fillServices(srv, c);
      stack.sync();
    };
    this.refresh();
    return w;
  },
  select(i) {
    if (i < 0 || i > Store.cards.length) return;
    this.idx = i;
    if (i < Store.cards.length) { Store.state.activeCard = i; Store.save(); }
    this._track.scrollTo({ left: this._track.clientWidth * i, behavior: 'smooth' });
    this.refresh();
    App.paintNav(this);
  },
  mounted(el) {
    const track = this._track;
    track.scrollLeft = track.clientWidth * this.idx;
    let t = null;
    track.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== this.idx) this.select(i);
      }, 90);
    });
  }
});

Screens._removeCard = function () {
  if (Store.cards.length <= 1) return toast('Нельзя удалить единственную карту');
  Store.cards.splice(Store.state.activeCard, 1);
  Store.state.activeCard = 0;
  Store.save();
  App.setRoot(Screens.passHome());
  toast('Карта удалена');
};

/* ---------- Добавление карты ---------- */
Screens.addCard = () => ({
  title: 'Добавление карты',
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'plate-screen' });
    let value = '';
    const box = h('div', { class: 'plate-box' });
    const input = h('div', { class: 'plate-input' }, '<span class="ph">Номер карты</span>');
    box.append(input, h('div', { class: 'plate-hint muted center' },
      'Введите 13 цифр, указанных на лицевой стороне Единой транспортной карты'));
    w.appendChild(box);

    const add = h('button', { class: 'btn green', disabled: 'true' }, 'Добавить карту');
    const redraw = () => {
      input.innerHTML = value ? value.replace(/(\d{4})(?=\d)/g, '$1 ') : '<span class="ph">Номер карты</span>';
      if (value.length === 13) add.removeAttribute('disabled'); else add.setAttribute('disabled', 'true');
    };
    w.appendChild(keypadEl(k => {
      if (k === '⌫') value = value.slice(0, -1);
      else if (value.length < 13) value += k;
      redraw();
    }));
    add.addEventListener('click', () => {
      loading(true, 'Проверка карты');
      setTimeout(() => {
        loading(false);
        const kinds = ['common', 'digital'];
        Store.cards.push({
          id: 'c' + Date.now(), kind: kinds[Store.cards.length % kinds.length],
          number: value, label: 'Карта ' + (Store.cards.length + 1),
          balance: 0, services: []
        });
        Store.state.activeCard = Store.cards.length - 1;
        Store.save();
        App.openTab('pass');
        App.setRoot(Screens.passHome());
        toast('Карта добавлена');
      }, 1100);
    });
    const act = h('div', { class: 'plate-actions' });
    act.appendChild(add);
    w.appendChild(act);
    return w;
  }
});

/* ---------- Пополнение ---------- */
function hasBalance(card) { return card.balance !== null && card.balance !== undefined; }

Screens.topUp = (card) => ({
  title: 'Единая транспортная карта',
  sub: 'Пополнение',
  bodyClass: 'pattern',
  build() {
    if (!hasBalance(card)) {
      return h('div', { class: 'empty' }, ICONS.cardLines +
        '<div>По этой карте оплата производится через валидатор.<br>' +
        'Баланс и проездные доступны на цифровой транспортной карте.</div>');
    }

    const w = h('div', { class: 'screen-inner' });
    let amount = 100;

    const head = h('div', { class: 'card' });
    head.innerHTML = `<div class="muted">Номер карты</div>
      <div class="topup-num">${card.number}</div>
      <div class="muted" style="margin-top:8px">Текущий баланс</div>
      <div class="topup-num">${card.balance} руб</div>`;
    w.appendChild(head);

    w.appendChild(h('div', { class: 'section-title' }, 'Сумма пополнения'));
    const grid = h('div', { class: 'amount-grid' });
    TOPUP_AMOUNTS.forEach(a => {
      const b = h('button', { class: 'amount' + (a === amount ? ' on' : ''), 'data-a': a }, a + ' ₽');
      b.addEventListener('click', () => {
        amount = a;
        $$('.amount', grid).forEach(x => x.classList.toggle('on', Number(x.dataset.a) === a));
        go.textContent = 'Пополнить на ' + rub(amount);
      });
      grid.appendChild(b);
    });
    w.appendChild(grid);

    const go = h('button', { class: 'btn green', style: 'margin-top:16px' }, 'Пополнить на ' + rub(amount));
    go.addEventListener('click', () => {
      App.go(Screens.payment({
        title: 'Единая транспортная карта',
        header: ['Проездной документ МКУ Гортранс', 'Пополнение транспортных единиц'],
        lines: [
          { label: 'Номер карты', value: card.number, blur: true },
          { label: 'Сумма', value: amount + ' руб' }
        ],
        total: amount,
        totalUnit: 'руб',
        onSuccess: () => {
          card.balance += amount;
          Store.save();
          App.openTab('pass');
          App.setRoot(Screens.passHome());
          toast('Баланс пополнен на ' + rub(amount));
        }
      }));
    });
    w.appendChild(go);
    return w;
  }
});

/* ---------- Покупка проездного на цифровую карту ---------- */
Screens.buyPass = (card) => ({
  title: 'Цифровая карта',
  sub: 'Оплата',
  bodyClass: 'pattern',
  build() {
    const w = h('div', { class: 'screen-inner' });

    PASS_TARIFFS.forEach(t => {
      const { from, to } = passPeriod(t);
      const c = h('div', { class: 'card pass-tariff' });
      c.innerHTML = `
        <div class="pt-title">${t.name}</div>
        <div class="pt-sep"></div>
        <div class="pt-label">Период действия</div>
        <div class="pt-value">с ${fmtDayTime(from)}</div>
        <div class="pt-value">до ${fmtDayTime(to)}</div>
        <div class="pt-label">Стоимость</div>
        <div class="pt-value">${t.price} \u20bd</div>`;

      const buy = h('button', { class: 'pt-buy' }, ICONS.creditCard + '<span>Купить</span>');
      buy.addEventListener('click', () => App.go(Screens.payment({
        title: 'Цифровая карта',
        header: ['Проездной документ МКУ Гортранс', t.name],
        lines: [
          { label: 'Номер карты', value: card.number, blur: true },
          { label: 'Период действия', value: fmtDayTime(from) + ' — ' + fmtDayTime(to) },
          { label: 'Сумма', value: t.price + ' руб' }
        ],
        total: t.price,
        totalUnit: 'руб',
        onSuccess: () => {
          card.services.push({
            name: t.name,
            rest: 'до ' + pad2(to.getDate()) + '.' + pad2(to.getMonth() + 1) + '.' + to.getFullYear(),
            restValue: t.rides ? String(t.rides) : '\u221e'
          });
          Store.save();
          App.openTab('pass');
          App.setRoot(Screens.passHome());
          toast('Проездной подключён');
        }
      })));
      c.appendChild(buy);
      w.appendChild(c);
    });

    return w;
  }
});

/* ---------- Покупка услуги ---------- */
Screens.buyService = (card) => ({
  title: 'Покупка услуги',
  sub: 'Карта № ' + card.number,
  bodyClass: 'plain',
  build() {
    if (!hasBalance(card)) {
      return h('div', { class: 'empty' }, ICONS.cardLines +
        '<div>По этой карте оплата производится через валидатор.<br>' +
        'Баланс и проездные доступны на цифровой транспортной карте.</div>');
    }

    const w = h('div', { class: 'screen-inner' });
    const list = h('div', { class: 'list' });
    TARIFFS.forEach(t => {
      const row = h('button', { class: 'list-row' },
        `<span class="lr-body"><span class="lr-title">${t.name}</span>
         <span class="lr-sub">${t.note}</span></span>
         <span class="lr-value" style="color:#000">${rub(t.price)}</span>` + ICONS.chevron);
      row.addEventListener('click', () => App.go(Screens.payment({
        title: 'Покупка проездного',
        header: ['Проездной документ МКУ Гортранс', t.name],
        lines: [
          { label: 'Номер карты', value: card.number, blur: true },
          { label: 'Услуга', value: t.name },
          { label: 'Сумма', value: t.price + ' руб' }
        ],
        total: t.price,
        totalUnit: 'руб',
        onSuccess: () => {
          const d = new Date(); d.setDate(d.getDate() + 30);
          card.services.push({
            name: t.name.replace(/,.*$/, ''),
            rest: 'до ' + pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1) + '.' + d.getFullYear(),
            restValue: /поезд/.test(t.name) ? t.name.match(/\d+/)[0] : '∞'
          });
          Store.save();
          App.openTab('pass');
          App.setRoot(Screens.passHome());
          toast('Проездной подключён');
        }
      })));
      list.appendChild(row);
    });
    w.appendChild(list);
    return w;
  }
});

/* ---------- История операций по карте ---------- */
Screens.cardOps = (card) => ({
  title: 'История операций',
  sub: 'Карта № ' + card.number,
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'screen-inner' });
    const ops = [
      { d: '02.09.2026 08:14', t: 'Оплата проезда, маршрут № 14', v: -37 },
      { d: '01.09.2026 18:42', t: 'Оплата проезда, маршрут № 7',  v: -37 },
      { d: '01.09.2026 09:03', t: 'Пополнение баланса',           v: +300 },
      { d: '29.08.2026 17:55', t: 'Оплата проезда, маршрут № 33', v: -37 },
      { d: '25.08.2026 12:10', t: 'Покупка услуги «30 поездок»',  v: -880 }
    ];
    const list = h('div', { class: 'list' });
    ops.forEach(o => {
      list.appendChild(h('div', { class: 'list-row' },
        `<span class="lr-body"><span class="lr-title">${o.t}</span>
         <span class="lr-sub">${o.d}</span></span>
         <span class="op-sum ${o.v > 0 ? 'plus' : ''}">${o.v > 0 ? '+' : '−'}${Math.abs(o.v)} ₽</span>`));
    });
    w.appendChild(list);
    return w;
  }
});

/* ---------- Цифровая транспортная карта ---------- */
function payInfoEl() {
  const info = h('div', { class: 'card info-pay' });
  info.innerHTML = `<div class="ip-title">Оплачивайте проезд в приложении</div>
    <p class="ip-text">Цифровой транспортной картой оплатить проезд можно путем сканирования
    специального QR-кода, размещенного в салоне автобуса/трамвая, путем ввода гос. номера
    ТС/номера вагона, либо при помощи геолокации. Перед использованием цифровой транспортной
    карты ознакомьтесь с порядком оплаты проезда.</p>`;
  const b = h('button', { class: 'notice-btn' }, ICONS.warn + '<span>Подробнее…</span>');
  b.addEventListener('click', () => App.go(Screens.payRules()));
  info.appendChild(b);
  return info;
}

Screens.digitalCard = () => ({
  sub: 'Цифровая карта',
  navWhite: true,
  bodyClass: 'pattern',
  get titleHTML() {
    return `<span class="nav-num">${Store.digital.number}</span>` +
      `<button class="nav-copy" aria-label="Скопировать номер">${ICONS.copy}</button>`;
  },
  onCopy() { Screens._copyNumber(Store.digital.number); },
  right: { icon: 'refresh', on() {
    loading(true, 'Обновление');
    setTimeout(() => { loading(false); toast('Данные обновлены'); }, 800);
  } },
  build() {
    const w = h('div', { class: 'pass-wrap' });

    const track = h('div', { class: 'etk-track' });
    Store.digitalCards.forEach(c => {
      const slide = h('div', { class: 'etk-slide' });
      slide.appendChild(etkCardEl(c));
      track.appendChild(slide);
    });
    w.appendChild(track);
    this._track = track;

    const info = payInfoEl();
    info.classList.add('digital-info');
    w.appendChild(info);
    return w;
  },
  select(i) {
    Store.state.activeDigital = i; Store.save();
    this._track.scrollTo({ left: this._track.clientWidth * i, behavior: 'smooth' });
    App.paintNav(this);
  },
  mounted(el) {
    const track = this._track;
    track.scrollLeft = track.clientWidth * Store.state.activeDigital;
    let t = null;
    track.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== Store.state.activeDigital) this.select(i);
      }, 90);
    });
  }
});

Screens._copyNumber = function (num) {
  try {
    if (navigator.clipboard) navigator.clipboard.writeText(num);
  } catch (e) { /* буфер обмена недоступен */ }
  toast('Номер карты скопирован');
};

/* ---------- Подтверждение льготы ---------- */
Screens.benefitInfo = (card) => ({
  title: 'Льгота',
  sub: 'Карта № ' + card.number,
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'screen-inner' });
    const c = h('div', { class: 'card' });
    c.innerHTML = `<div class="card-title">Льгота подтверждена</div>
      <p class="rule-text">Право на льготный проезд подтверждено${card.benefitUntil ? ' до ' + card.benefitUntil : ''}.
      Для продления подтверждения обратитесь в пункт пополнения транспортных карт
      или в образовательное учреждение.</p>`;
    w.appendChild(c);
    return w;
  }
});

/* ---------- Срок действия карты ---------- */
Screens.cardValidity = (card) => ({
  title: 'Срок действия',
  sub: 'Цифровая карта',
  bodyClass: 'plain',
  build() {
    const w = h('div', { class: 'screen-inner' });

    const c = h('div', { class: 'card' });
    c.innerHTML = `<div class="card-title">Карта действительна год</div>
      <p class="rule-text">Цифровая транспортная карта выпущена ${fmtRuDate(card.issued)}
      и действительна до ${plusYear(card.issued)} включительно.</p>`;
    w.appendChild(c);

    const d = h('div', { class: 'card' });
    d.innerHTML = `<div class="val-row"><span class="muted">Выпущена</span><b>${fmtRuDate(card.issued)}</b></div>
      <div class="hr"></div>
      <div class="val-row"><span class="muted">Действительна до</span><b>${plusYear(card.issued)}</b></div>
      <div class="hr"></div>
      <div class="val-row"><span class="muted">Номер карты</span><b>${card.number}</b></div>`;
    w.appendChild(d);

    w.appendChild(h('div', { class: 'card' },
      `<p class="rule-text">За месяц до окончания срока карта продлевается автоматически.
      Баланс и активные проездные при продлении сохраняются.</p>`));
    return w;
  }
});
