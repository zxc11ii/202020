/* ============================================================
   Мелкие UI-помощники: DOM, тосты, лоадер, шторка, карточки ЕТК
   ============================================================ */

function h(tag, attrs, html) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'style') e.setAttribute('style', attrs[k]);
    else if (k.startsWith('on') && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
    else if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
  }
  if (html !== undefined && html !== null) e.innerHTML = html;
  return e;
}
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

/* --- Тост --- */
let toastTimer = null;
function toast(msg, ms) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms || 2200);
}

/* --- Нижняя плашка с сообщением --- */
let bannerTimer = null;
function banner(text, ms) {
  let el = $('#banner');
  if (!el) {
    el = h('div', { class: 'banner', id: 'banner' });
    $('#phone').insertBefore(el, $('#toast'));
  }
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => el.classList.remove('show'), ms || 4000);
}

/* --- Лоадер --- */
function loading(on, text) {
  const l = $('#loader');
  $('#loaderText').textContent = text || '';
  l.classList.toggle('show', !!on);
}

/* --- Нижняя шторка --- */
function openSheet(title, rows, opts) {
  const sheet = $('#sheet');
  sheet.innerHTML = '';
  if (title) sheet.appendChild(h('div', { class: 'sheet-title' }, title));
  rows.forEach(r => {
    const btn = h('button', { class: 'sheet-row' });
    btn.appendChild(h('span', null, r.label));
    if (r.art) btn.appendChild(h('span', { class: 'sr-art' }, ICONS[r.art] || r.art));
    else if (r.value) btn.appendChild(h('span', { class: 'muted' }, r.value));
    btn.addEventListener('click', () => { closeSheet(); setTimeout(() => r.onClick && r.onClick(), 240); });
    sheet.appendChild(btn);
  });
  sheet.appendChild(h('div', { class: 'sheet-pad' }));
  $('#sheetScrim').classList.add('open');
  sheet.classList.add('open');
}
function closeSheet() {
  $('#sheet').classList.remove('open');
  $('#sheetScrim').classList.remove('open');
}

/* --- Медведь ЕТК (низкополигональный) --- */
function bearArt() {
  return '<img class="etk-bear" src="assets/img/bear.png" alt="" draggable="false">';
}

/* --- Карточка ЕТК --- */
function etkCardEl(card) {
  const kind = CARD_KINDS[card.kind];
  const el = h('div', { class: 'etk', style: `--etk-color:${kind.color}` });
  el.innerHTML = `
    <div class="etk-stripes"></div>
    <div class="etk-left">
      <div class="etk-modes">${busGlyph()}${tramGlyph()}</div>
      <div class="etk-brand">${(kind.brand || 'ЕДИНАЯ ТРАНСПОРТНАЯ КАРТА').split(' ').join('<br>')}</div>
      ${(kind.title || kind.subtitle) ? `<div class="etk-kind">
        ${kind.title ? `<div class="etk-kind-1">${kind.title}</div>` : ''}
        ${kind.subtitle ? `<div class="etk-kind-2">${kind.subtitle}</div>` : ''}
      </div>` : ''}
    </div>
    ${bearArt()}`;
  return el;
}
function tramGlyph() {
  return `<svg viewBox="0 0 24 26" fill="currentColor" aria-hidden="true">
    <path d="M7.7 0h8.6v2.2h-3.2v2.1h-2.2V2.2H7.7z"/>
    <path fill-rule="evenodd" d="M4.7 4.3h14.6c1.5 0 2.7 1.2 2.7 2.7v11.2c0 1.5-1.2 2.7-2.7 2.7H4.7A2.7 2.7 0 0 1 2 18.2V7c0-1.5 1.2-2.7 2.7-2.7zm1.4 2.6v5.6h11.8V6.9H6.1zm1.3 8.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9.2 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
    <path d="M5 21.8h14v2.6H5z"/></svg>`;
}

function busGlyph() {
  return `<svg viewBox="0 0 24 26" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M4.7 1.4h14.6c1.5 0 2.7 1.2 2.7 2.7v13.4c0 1.5-1.2 2.7-2.7 2.7H4.7A2.7 2.7 0 0 1 2 17.5V4.1c0-1.5 1.2-2.7 2.7-2.7zm1.4 2.6v6.3h11.8V4H6.1zm1.3 8.8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9.2 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
    <path d="M5.4 20.8h2.7v3.4H5.4zm10.5 0h2.7v3.4h-2.7z"/></svg>`;
}

/* --- Маркеры карты --- */
function vehicleMarkerIcon(v) {
  const cls = v.type === 'tram' ? 'vm-tram' : 'vm-bus';
  const glyph = v.type === 'tram' ? tramGlyph() : ICONS.busSolid;
  return L.divIcon({
    className: '',
    html: `<div class="vmark ${cls}"><span class="vmark-ico">${glyph}</span><span class="vmark-num">${v.route}</span></div>`,
    iconSize: [78, 30], iconAnchor: [10, 30]
  });
}
function stopMarkerIcon() {
  return L.divIcon({
    className: '',
    html: `<div class="smark">${ICONS.busSolid}</div>`,
    iconSize: [30, 30], iconAnchor: [15, 30]
  });
}

/* --- Ввод суммы/номера: экранная клавиатура --- */
function keypadEl(onKey) {
  const pad = h('div', { class: 'keypad' });
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  keys.forEach(k => {
    if (k === '') { pad.appendChild(h('div')); return; }
    const b = h('button', { class: 'key' + (k === '⌫' ? ' key-del' : '') }, k);
    b.addEventListener('click', () => onKey(k));
    pad.appendChild(b);
  });
  return pad;
}

/* --- Звёзды-смайлики оценки --- */
const STAR_BODY = 'M50 10 65.3 33 91.8 40.4 74.7 62 75.9 89.6 50 80 24.1 89.6 25.3 62 8.2 40.4 34.7 33Z';

function starFace(kind) {
  const cheeks = '<ellipse cx="31" cy="65" rx="7.4" ry="4.8" fill="#f2949b"/>' +
                 '<ellipse cx="69" cy="65" rx="7.4" ry="4.8" fill="#f2949b"/>';
  let face = '';
  if (kind === 0) {
    face = cheeks +
      /* опущенные брови */
      '<path d="M26 45q8-5 16-1M74 45q-8-5-16-1" fill="none" stroke="#4a3a2c" stroke-width="3.6" stroke-linecap="round"/>' +
      /* грустные прикрытые глаза — дуги вниз */
      '<path d="M28 53q8 9 16 0M56 53q8 9 16 0" fill="none" stroke="#4a3a2c" stroke-width="4" stroke-linecap="round"/>' +
      '<ellipse cx="50" cy="70" rx="6" ry="7.4" fill="#4a3a2c"/>' +
      '<path d="M28 66q4 7 0 11-4-4 0-11Z" fill="#7ec8f2"/>';
  } else if (kind === 1) {
    face = cheeks +
      '<circle cx="37" cy="56" r="4" fill="#4a3a2c"/><circle cx="63" cy="56" r="4" fill="#4a3a2c"/>' +
      '<path d="M40 67q10 9 20 0" fill="none" stroke="#4a3a2c" stroke-width="4" stroke-linecap="round"/>';
  } else {
    const heart = (cx) => `<path d="M${cx} 63c-7-6.4-11-9.8-11-13.8 0-3 2.3-5 5-5 2.2 0 4.2 1.2 6 3.2 1.8-2 3.8-3.2 6-3.2 2.7 0 5 2 5 5 0 4-4 7.4-11 13.8z" fill="#ff4d63"/>`;
    face = cheeks + heart(35) + heart(65) +
      '<path d="M37 66h26a13 13 0 0 1-26 0z" fill="#4a3a2c"/>';
  }
  return face;
}

function starEmoji(kind) {
  return `<svg class="star-emoji" viewBox="0 0 100 100" aria-hidden="true">
    <path d="${STAR_BODY}" fill="#fad64b" stroke="#fad64b" stroke-width="11" stroke-linejoin="round"/>
    ${starFace(kind)}
  </svg>`;
}

