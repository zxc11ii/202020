/* Набор SVG-иконок приложения. Все иконки наследуют currentColor. */
const ICONS = {
  /* --- навигация --- */
  burger: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
    <path d="M3 8h22M3 14h22M3 20h22"/></svg>`,
  back: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 5 3.5 14 12 23M3.5 14H25"/></svg>`,
  close: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
    <path d="M6 6l16 16M22 6L6 22"/></svg>`,
  bookmark: `<svg viewBox="0 0 28 28" fill="currentColor"><path d="M7 3h14a1 1 0 0 1 1 1v21l-8-5.4L6 25V4a1 1 0 0 1 1-1z"/></svg>`,
  refresh: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M23 6v6h-6"/><path d="M22.2 12a8.7 8.7 0 1 0-1.6 6.6"/></svg>`,
  dots: `<svg viewBox="0 0 28 28" fill="currentColor"><circle cx="14" cy="6" r="2.1"/><circle cx="14" cy="14" r="2.1"/><circle cx="14" cy="22" r="2.1"/></svg>`,
  copy: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round">
    <rect x="9" y="9" width="15" height="16" rx="2.4"/><path d="M19 9V6.4A2.4 2.4 0 0 0 16.6 4H6.4A2.4 2.4 0 0 0 4 6.4v10.2A2.4 2.4 0 0 0 6.4 19H9"/></svg>`,
  warn: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <circle cx="14" cy="14" r="11"/><path d="M14 8v7.4"/><circle cx="14" cy="19.6" r="1.3" fill="currentColor" stroke="none"/></svg>`,
  chevron: `<svg class="chev" viewBox="0 0 9 15" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 1.5 7 7.5 1.5 13.5"/></svg>`,

  /* --- нижние вкладки --- */
  tabTickets: `<svg viewBox="0 0 28 28">
    <path d="M6.3 5.2 8.9 3.1 11.4 5.2 14 3.1 16.6 5.2 19.1 3.1 21.7 5.2V22.8L19.1 24.9 16.6 22.8 14 24.9 11.4 22.8 8.9 24.9 6.3 22.8Z"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M9.6 11.2h5.6M9.6 15h8.8M9.6 18.8h8.8"
      fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  tabPass: `<svg viewBox="0 0 28 28">
    <rect x="4" y="5.4" width="20" height="17.2" rx="3.6"
      fill="none" stroke="currentColor" stroke-width="2.4"/>
    <path d="M7.9 10.6h12v2.8h-12zm0 4.6h9.6v2.8H7.9z" fill="currentColor" stroke="none"/></svg>`,
  tabSchedule: `<svg viewBox="0 0 28 28">
    <circle cx="6" cy="9.4" r="3.2" fill="currentColor" stroke="none"/>
    <rect x="5.2" y="10.6" width="1.6" height="13.4" rx=".8" fill="currentColor" stroke="none"/>
    <path fill-rule="evenodd" fill="currentColor" stroke="none"
      d="M17.6 5c-4 0-6 1.4-6 3.9v11.6h12V8.9c0-2.5-2-3.9-6-3.9zm-4.1 4h8.2v4h-8.2zm1.6 6.2a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1zm5 0a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1z"/>
    <rect x="12.8" y="20.1" width="2.1" height="3.6" rx=".95" fill="currentColor" stroke="none"/>
    <rect x="20.2" y="20.1" width="2.1" height="3.6" rx=".95" fill="currentColor" stroke="none"/></svg>`,
  tabAccount: `<svg viewBox="0 0 28 28">
    <circle cx="14" cy="8.7" r="4.7" fill="none" stroke="currentColor" stroke-width="2.2"/>
    <path d="M6.4 24.3v-2.6c0-2.7 1-4.8 2.7-5.8.6-.4 1.4-.3 2 .2 1 .7 2.1 1.1 2.9 1.1s1.9-.4 2.9-1.1c.6-.5 1.4-.6 2-.2 1.7 1 2.7 3.1 2.7 5.8v2.6z"
      fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>`,

  /* --- боковое меню --- */
  busFront: `<svg viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
    <path d="M8.4 3.6h11.2a3 3 0 0 1 3 3v12.2a3 3 0 0 1-3 3H8.4a3 3 0 0 1-3-3V6.6a3 3 0 0 1 3-3z"
      fill="none" stroke="currentColor" stroke-width="2.1"/>
    <rect x="8.4" y="7.4" width="11.2" height="4.6" rx="1.1"/>
    <circle cx="10.2" cy="16.2" r="1.5"/><circle cx="17.8" cy="16.2" r="1.5"/>
    <path d="M8.2 22.4h2.6v2.2H8.2zm9 0h2.6v2.2h-2.6z"/></svg>`,
  mapSolid: `<svg viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
    <path d="M10.4 4.2 3.4 6.9a1 1 0 0 0-.6.9v14.5c0 .7.7 1.2 1.4 1l6.2-2.4z"/>
    <path d="M12.2 4.2v16.7l5.6 2.2V6.4z"/>
    <path d="M19.6 6.4v16.7l6.2-2.4a1 1 0 0 0 .6-.9V5.3c0-.7-.7-1.2-1.4-1z"/></svg>`,
  menuLines: `<svg viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
    <rect x="5" y="8.2" width="18" height="2.9" rx="1.45"/>
    <rect x="5" y="12.6" width="18" height="2.9" rx="1.45"/>
    <rect x="5" y="17" width="18" height="2.9" rx="1.45"/></svg>`,
  theme: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9"
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="14" cy="14" r="8.4"/>
    <path d="M14 5.6a8.4 8.4 0 0 0 0 16.8z" fill="currentColor" stroke="none"/></svg>`,
  stopBus: `<svg viewBox="0 0 28 28" aria-hidden="true">
    <circle cx="5.6" cy="8.6" r="2.9" fill="currentColor" stroke="none"/>
    <rect x="4.85" y="9.8" width="1.5" height="13.8" rx=".7" fill="currentColor" stroke="none"/>
    <path fill-rule="evenodd" fill="currentColor" stroke="none"
      d="M17.6 4.4c-4.2 0-6.3 1.4-6.3 4.1v12h12.6v-12c0-2.7-2.1-4.1-6.3-4.1zM13 8.8h9.2v4.4H13zm1.6 6.6a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3zm5.7 0a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3z"/>
    <rect x="12.5" y="20.4" width="2.2" height="3.4" rx="1" fill="currentColor" stroke="none"/>
    <rect x="20.5" y="20.4" width="2.2" height="3.4" rx="1" fill="currentColor" stroke="none"/></svg>`,
  calendar: `<svg viewBox="0 0 28 28" aria-hidden="true">
    <path fill="currentColor" stroke="none" d="M7.6 2h2.6v3.2H7.6zm10.2 0h2.6v3.2h-2.6z"/>
    <rect x="2.6" y="4" width="22.8" height="21.4" rx="2.6" fill="currentColor" stroke="none"/>
    <rect x="4.9" y="9.6" width="18.2" height="13.4" fill="#fff" fill-opacity=".16" stroke="none"/>
    <rect x="11.4" y="13.6" width="5.2" height="5.2" fill="#fff" stroke="none"/></svg>`,
  busType: `<svg viewBox="0 0 28 28" aria-hidden="true">
    <path fill-rule="evenodd" fill="currentColor" stroke="none"
      d="M14 3.4c-4.7 0-7 1.6-7 4.6v12.6h14V8c0-3-2.3-4.6-7-4.6zM9.6 8h8.8v4.8H9.6zm1.7 7.3a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm5.4 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z"/>
    <rect x="8.4" y="20.4" width="2.4" height="4.2" rx="1.1" fill="currentColor" stroke="none"/>
    <rect x="17.2" y="20.4" width="2.4" height="4.2" rx="1.1" fill="currentColor" stroke="none"/></svg>`,
  routeFork: `<svg viewBox="0 0 28 28" aria-hidden="true">
    <path fill="currentColor" stroke="none"
      d="M9.2 25.4h3.2v-8.8c0-2.4 1.1-3.9 3.4-4.6l3.1-1-1.1-3-3.4 1.1c-2.1.7-3.7 1.8-4.7 3.2-.3-.4-.6-.8-.5-.6V7.6H9.2z"/>
    <path fill="currentColor" stroke="none" d="M10.8 2.2 15 8.2H6.6z"/>
    <path fill="currentColor" stroke="none" d="M21.4 4.6 25.6 8.8 21.4 13 17.2 8.8z"/></svg>`,
  direction: `<svg viewBox="0 0 28 28" aria-hidden="true">
    <rect x="12.9" y="4" width="2.2" height="21" rx="1" fill="currentColor" stroke="none"/>
    <path fill="currentColor" stroke="none" d="M13.6 7.2h8.6l3.4 3.3-3.4 3.3h-8.6z"/>
    <path fill="currentColor" stroke="none" d="M14.4 7.2H7.2l-2.6 3.3 2.6 3.3h7.2z" fill-opacity=".9"/></svg>`,
  starBox: `<svg viewBox="0 0 28 28" aria-hidden="true">
    <rect x="3.4" y="3.4" width="21.2" height="21.2" rx="2.2" fill="none" stroke="currentColor" stroke-width="2"/>
    <path fill="currentColor" stroke="none" d="m14 7.6 2.3 4.7 5.2.8-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1-3.8-3.6 5.2-.8z"/></svg>`,
  pencil: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9"
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M18.6 3.9a2.7 2.7 0 0 1 3.8 3.8L9.2 20.9l-5 1.2 1.2-5z"/>
    <path d="M16.8 5.7l4.8 4.8"/></svg>`,
  gear: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9"
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="14" cy="14" r="3.4"/>
    <path d="M22.4 17a1.9 1.9 0 0 0 .4 2.1l.1.1a2.3 2.3 0 1 1-3.3 3.3l-.1-.1a1.9 1.9 0 0 0-2.1-.4 1.9 1.9 0 0 0-1.2 1.7v.2a2.3 2.3 0 1 1-4.6 0v-.1a1.9 1.9 0 0 0-1.3-1.8 1.9 1.9 0 0 0-2.1.4l-.1.1a2.3 2.3 0 1 1-3.3-3.3l.1-.1a1.9 1.9 0 0 0 .4-2.1 1.9 1.9 0 0 0-1.7-1.2h-.2a2.3 2.3 0 1 1 0-4.6h.1a1.9 1.9 0 0 0 1.8-1.3 1.9 1.9 0 0 0-.4-2.1l-.1-.1a2.3 2.3 0 1 1 3.3-3.3l.1.1a1.9 1.9 0 0 0 2.1.4h.1a1.9 1.9 0 0 0 1.2-1.7v-.2a2.3 2.3 0 1 1 4.6 0v.1a1.9 1.9 0 0 0 1.2 1.7 1.9 1.9 0 0 0 2.1-.4l.1-.1a2.3 2.3 0 1 1 3.3 3.3l-.1.1a1.9 1.9 0 0 0-.4 2.1v.1a1.9 1.9 0 0 0 1.7 1.2h.2a2.3 2.3 0 1 1 0 4.6h-.1a1.9 1.9 0 0 0-1.7 1.2z"/></svg>`,
  plusCircle: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round">
    <circle cx="14" cy="14" r="10.4"/><path d="M14 9.4v9.2M9.4 14h9.2"/></svg>`,
  qr: `<svg viewBox="0 0 28 28" fill="currentColor">
    <path d="M3 3h9v9H3V3zm2.2 2.2v4.6h4.6V5.2H5.2z"/><path d="M16 3h9v9h-9V3zm2.2 2.2v4.6h4.6V5.2h-4.6z"/>
    <path d="M3 16h9v9H3v-9zm2.2 2.2v4.6h4.6v-4.6H5.2z"/>
    <rect x="6.6" y="6.6" width="1.8" height="1.8"/><rect x="19.6" y="6.6" width="1.8" height="1.8"/><rect x="6.6" y="19.6" width="1.8" height="1.8"/>
    <rect x="16" y="16" width="2.2" height="2.2"/><rect x="20" y="16" width="2.2" height="2.2"/><rect x="23" y="16" width="2" height="2.2"/>
    <rect x="16" y="20" width="2.2" height="2.2"/><rect x="20" y="20" width="2.2" height="2.2"/><rect x="23" y="20.6" width="2" height="2"/>
    <rect x="16" y="23.6" width="2.2" height="1.8"/><rect x="20.6" y="23.6" width="4.4" height="1.8"/></svg>`,
  bus: `<svg viewBox="0 0 28 28" aria-hidden="true">
    <path fill-rule="evenodd" fill="currentColor" stroke="none"
      d="M14 3.6c-4.6 0-6.9 1.6-6.9 4.5v12.3h13.8V8.1c0-2.9-2.3-4.5-6.9-4.5zM9.7 8.1h8.6v4.7H9.7zm1.6 7.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm5.4 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z"/>
    <rect x="8.5" y="20.2" width="2.4" height="4" rx="1.1" fill="currentColor" stroke="none"/>
    <rect x="17.1" y="20.2" width="2.4" height="4" rx="1.1" fill="currentColor" stroke="none"/></svg>`,
  map: `<svg viewBox="0 0 28 28" aria-hidden="true">
    <path fill="currentColor" stroke="none"
      d="M10.2 3.4 3.6 6.1v18.5l6.6-2.7zm1.8 0v18.5l6.6 2.7V6.1zm8.4 2.7v18.5l6.6-2.7V3.4z" transform="translate(-1.2 0)"/></svg>`,
  bluetooth: `<svg viewBox="0 0 28 28" aria-hidden="true">
    <path fill-rule="evenodd" fill="currentColor" stroke="none"
      d="M12.4 2.2 20 9.1l-4.7 4.4 4.7 4.4-7.6 6.9V16l-3.8 3.4-1.7-1.9 5-4.4-5-4.4L8.6 7l3.8 3.4zm2.2 4.6v3.9l2.1-1.9zm0 10.4v3.9l2.1-2z"/>
    <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
      d="M22.6 10.6a4.6 4.6 0 0 1 0 6.8"/></svg>`,
  clipboard: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
    <path d="M10.4 4.6H7.4a1.8 1.8 0 0 0-1.8 1.8v16.2a1.8 1.8 0 0 0 1.8 1.8h13.2a1.8 1.8 0 0 0 1.8-1.8V6.4a1.8 1.8 0 0 0-1.8-1.8h-3"/>
    <rect x="10.4" y="2.6" width="7.2" height="4" rx="1.4"/>
    <path d="M9.6 11.8h8.8M9.6 15.4h8.8M9.6 19h5.6"/></svg>`,
  history: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6.6 10.2a9.2 9.2 0 1 1-1 6.8"/>
    <path d="M2.6 5.6v5.4h5.4" />
    <path d="M14 9.6V14l3.4 2.6"/></svg>`,
  cardLines: `<svg viewBox="0 0 28 28" aria-hidden="true">
    <rect x="4" y="6.4" width="20" height="15.2" rx="3.2"
      fill="none" stroke="currentColor" stroke-width="2.4"/>
    <path d="M7.9 11.4h12.2v2.6H7.9zm0 4.3h9.4v2.6H7.9z" fill="currentColor" stroke="none"/></svg>`,
  infoRound: `<svg viewBox="0 0 28 28" aria-hidden="true">
    <circle cx="14" cy="14" r="11" fill="currentColor" stroke="none"/>
    <circle cx="14" cy="8.6" r="1.5" fill="var(--card)" stroke="none"/>
    <rect x="12.7" y="11.6" width="2.6" height="8.4" rx="1.3" fill="var(--card)" stroke="none"/></svg>`,
  info: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round">
    <circle cx="14" cy="14" r="10.6"/>
    <path d="M14 12.8v6.6"/>
    <circle cx="14" cy="8.9" r="1.35" fill="currentColor" stroke="none"/></svg>`,

  /* --- прочее --- */
  wallet: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9"
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M6.4 6.2V4.6a2.4 2.4 0 0 1 2.4-2.4h14.6a2.4 2.4 0 0 1 2.4 2.4v13.2a2.4 2.4 0 0 1-2.4 2.4h-1.4"/>
    <rect x="2" y="6.2" width="21.4" height="18.4" rx="2.8"/>
    <rect x="15.6" y="11.6" width="9.6" height="7.6" rx="3.8"/>
    <path d="M18.7 15.4h1.9" stroke-width="2.4"/></svg>`,
  busOutline: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round">
    <rect x="6.2" y="2.4" width="15.6" height="20.2" rx="2.6"/>
    <path d="M8 5.6h12"/>
    <rect x="8" y="6.9" width="12" height="7.1" rx="1"/>
    <path d="M6.2 15.4c2.6 1.1 5.2 1.6 7.8 1.6s5.2-.5 7.8-1.6"/>
    <path d="M6.2 7.2H4.6a1.6 1.6 0 0 0-1.6 1.6v2.6h3.2M21.8 7.2h1.6a1.6 1.6 0 0 1 1.6 1.6v2.6h-3.2"/>
    <path d="M8.4 19.2h2.8M16.8 19.2h2.8M12.4 20.6h3.2"/>
    <rect x="7.6" y="22.4" width="4.2" height="3.4" rx="1.5"/>
    <rect x="16.2" y="22.4" width="4.2" height="3.4" rx="1.5"/></svg>`,
  historyBack: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1"
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M7.4 8.6a10 10 0 1 1-1.1 11.3"/>
    <path d="M1.8 9.1h9.8L6.7 15z" fill="currentColor" stroke="none"/>
    <path d="M14 9.4v5.2l3.9 2.9"/></svg>`,
  busSolid: `<svg viewBox="0 0 28 28" fill="currentColor"><path d="M6 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm.4 2.6v5.8h15.2V6.6H6.4zM8.2 14.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zm11.6 0a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z"/><path d="M6.6 21h3v2.2h-3zm11.8 0h3v2.2h-3z"/></svg>`,
  clock: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <circle cx="14" cy="14" r="10.6"/><path d="M14 7.6V14l4.4 2.6"/></svg>`,
  creditCard: `<svg viewBox="0 0 28 28" fill="currentColor"><rect x="2.5" y="6" width="23" height="16" rx="2.6"/><rect x="2.5" y="10" width="23" height="3" fill="#fff" fill-opacity=".55"/></svg>`,
  star: `<svg viewBox="0 0 28 28"><path d="m14 2.8 3.5 7.1 7.8 1.1-5.6 5.5 1.3 7.8L14 20.6l-7 3.7 1.3-7.8-5.6-5.5 7.8-1.1z"/></svg>`,
  torch: `<svg viewBox="0 0 28 28" fill="currentColor">
    <path d="M9 2.4h10l-1.3 4.8h-7.4z"/>
    <path d="M10.6 8.6h6.8l-.7 3.2h-5.4z"/>
    <rect x="11.2" y="13" width="5.6" height="12.6" rx="1.6"/></svg>`,
  plus: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M14 6v16M6 14h16"/></svg>`,
  minus: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 14h16"/></svg>`,
  locate: `<svg viewBox="0 0 28 28" fill="currentColor"><path d="M24.6 3.4 3.6 12.2c-1 .4-.9 1.9.2 2.1l8.2 1.9 1.9 8.2c.2 1.1 1.7 1.2 2.1.2z"/></svg>`,
  layers: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
    <path d="M14 3 25 9l-11 6L3 9z"/><path d="m3 14.6 11 6 11-6"/></svg>`,
  stopSign: `<svg viewBox="0 0 28 28" fill="currentColor"><rect x="4" y="3" width="14" height="11" rx="1.6"/><path d="M10.4 14h1.8v11h-1.8z"/><path d="M7 25h8.6v1.6H7z"/></svg>`,
  ticketBig: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
    <path d="M5 5h18v18l-3-2-3 2-3-2-3 2-3-2-3 2z"/><path d="M9 10h10M9 14h10M9 18h6"/></svg>`,
  bell: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round">
    <path d="M14 3.4a7 7 0 0 1 7 7c0 5.2 1.6 6.6 2.4 7.6H4.6c.8-1 2.4-2.4 2.4-7.6a7 7 0 0 1 7-7z"/>
    <path d="M11.6 21.6a2.6 2.6 0 0 0 4.8 0"/></svg>`,
  logout: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4.6H6.4A2.4 2.4 0 0 0 4 7v14a2.4 2.4 0 0 0 2.4 2.4H11"/><path d="M17.6 8.6 23 14l-5.4 5.4M23 14H10.4"/></svg>`,
  shield: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
    <path d="M14 3 24 6.6v7.2C24 19.6 19.6 24 14 25.6 8.4 24 4 19.6 4 13.8V6.6z"/><path d="m9.6 14 3 3 6-6" stroke-linecap="round"/></svg>`,
  phone: `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round">
    <rect x="7" y="2.6" width="14" height="22.8" rx="3"/><path d="M12 22h4" stroke-linecap="round"/></svg>`,

  /* --- логотипы платёжных методов --- */
  sber: `<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="none" stroke-width="3.4" stroke-dasharray="52 20" stroke="url(#sbg)" stroke-linecap="round" transform="rotate(-42 14 14)"/>
    <defs><linearGradient id="sbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0fa8e0"/><stop offset=".45" stop-color="#7fd400"/><stop offset="1" stop-color="#f2e500"/></linearGradient></defs>
    <path d="m8.6 13.6 4.4 4.2 8-8.4" fill="none" stroke="#21a038" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  sbp: `<svg viewBox="0 0 68 28"><path d="M6 6.6 11.4 14 6 21.4z" fill="#5b57a2"/><path d="M11.4 14 6 6.6V3l8.6 11z" fill="#d90751"/>
    <path d="M14.6 14 6 25v-3.6L11.4 14z" fill="#fab718"/><path d="M22.6 9.6 14.6 14H11l3.6-4.4z" fill="#0fa8e0"/>
    <path d="M14.6 14h-3.2l3.2 4.4h8z" fill="#21a038"/><path d="M22.6 9.6h-8L20 3z" fill="#d90751" opacity=".85"/>
    <text x="30" y="20" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="700" fill="#1a1a1a">СБП</text></svg>`,
  mirVisaMc: `<svg viewBox="0 0 116 28">
    <text x="0" y="20" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="700" fill="#0f9d58">МИР</text>
    <text x="36" y="20" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="800" font-style="italic" fill="#1a1f71">VISA</text>
    <circle cx="93" cy="14" r="8.4" fill="#eb001b"/><circle cx="104" cy="14" r="8.4" fill="#f79e1b" fill-opacity=".9"/></svg>`,
  applePay: `<svg viewBox="0 0 62 28"><rect x="1" y="1" width="60" height="26" rx="5" fill="none" stroke="#111" stroke-width="1.6"/>
    <path d="M17.6 10.4c.7-.9.6-2.1.5-2.4-.5 0-1.3.4-1.8 1-.5.5-.7 1.4-.6 2.1.7.1 1.4-.3 1.9-.7zm2.6 6.4c-.4.9-.6 1.3-1.1 2.1-.7 1.1-1.7 2.4-2.9 2.4-1.1 0-1.4-.7-2.9-.7s-1.8.7-2.9.7c-1.2 0-2.1-1.2-2.8-2.2-2-3-2.2-6.5-1-8.4.9-1.3 2.3-2.1 3.6-2.1s2.2.7 3.2.7c1 0 1.7-.7 3.2-.7 1.2 0 2.4.6 3.3 1.7-2.9 1.6-2.4 5.7.3 6.5z"/>
    <text x="24" y="19" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="600" fill="#111">Pay</text></svg>`
};
