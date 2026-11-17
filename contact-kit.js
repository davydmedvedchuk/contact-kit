/*! Contact kit: call, WhatsApp, Telegram and email buttons with a ready message, plus a map that loads only when tapped.
 *  One file, no dependencies, no cookies, no tracking. Nothing is requested from another site until the visitor taps "Show map".
 *  MIT, Davyd Medvedchuk.
 *
 *  <script src="contact-kit.js" defer></script>
 *  <contact-kit phone="+351 912 345 678" whatsapp="351912345678" telegram="brightside" message="Hello!"
 *               address="Rua do Comércio 45, Porto" lat="41.1496" lon="-8.6110" lang="pt"></contact-kit>
 */
(function () {
  'use strict';

  var T = {
    en: { call: 'Call', whatsapp: 'WhatsApp', telegram: 'Telegram', email: 'Email', map: 'Show map', open: 'Open in Maps', hint: 'The map comes from OpenStreetMap and loads only when you tap.', msg: 'Hello, I found you online and have a question.', label: 'Contact' },
    pt: { call: 'Ligar', whatsapp: 'WhatsApp', telegram: 'Telegram', email: 'Email', map: 'Mostrar mapa', open: 'Abrir no Maps', hint: 'O mapa vem do OpenStreetMap e só carrega quando tocar.', msg: 'Olá, encontrei-vos online e gostaria de pedir informações.', label: 'Contacto' },
    ru: { call: 'Позвонить', whatsapp: 'WhatsApp', telegram: 'Telegram', email: 'Почта', map: 'Показать карту', open: 'Открыть в Картах', hint: 'Карта загружается с OpenStreetMap только после нажатия.', msg: 'Здравствуйте, нашёл вас в интернете, хочу уточнить.', label: 'Связаться' },
    uk: { call: 'Подзвонити', whatsapp: 'WhatsApp', telegram: 'Telegram', email: 'Пошта', map: 'Показати мапу', open: 'Відкрити в Мапах', hint: 'Мапа завантажується з OpenStreetMap лише після натискання.', msg: 'Вітаю, знайшов вас в інтернеті, хочу уточнити.', label: 'Зв’язатися' }
  };

  var ICON = {
    call: '<path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/>',
    whatsapp: '<path d="M4 20l1.3-4.2A8 8 0 1 1 8.3 18.8zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8a4.6 4.6 0 0 1-2.2-2.2l.8-1-1-2z"/>',
    telegram: '<path d="M21 4L3 11.2l5.2 1.8L10 19l3-3.6L17.5 19zM9 13l8-6.2-6.2 7.2z"/>',
    email: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.5 2L12 12.6 19.5 7z"/>',
    map: '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>'
  };

  var CSS = ':host{display:block;--ck-accent:#1F7A55;--ck-ink:#15171B;--ck-bg:#fff;--ck-line:#d5d6d9;--ck-radius:10px;font:16px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ck-ink)}' +
    '*{box-sizing:border-box}.row{display:flex;flex-wrap:wrap;gap:10px}' +
    'a.b,button.b{flex:1 1 140px;min-height:48px;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 14px;border:2px solid var(--ck-ink);border-radius:var(--ck-radius);background:var(--ck-bg);color:var(--ck-ink);font-family:inherit;font-weight:600;font-size:16px;line-height:1;text-decoration:none;cursor:pointer}' +
    'a.b.main{background:var(--ck-accent);border-color:var(--ck-accent);color:#fff}' +
    'a.b:focus-visible,button.b:focus-visible{outline:3px solid var(--ck-accent);outline-offset:2px}' +
    'svg{width:22px;height:22px;fill:currentColor;flex:none}' +
    '.map{margin-top:12px;border:2px solid var(--ck-line);border-radius:var(--ck-radius);overflow:hidden;background:#eef0ee}' +
    '.ph{padding:18px;text-align:center}.ph p{margin:0 0 6px}.ph small{display:block;margin-top:8px;color:#62666f;font-size:13px}' +
    '.ph .addr{font-weight:600}.ph .row{justify-content:center}' +
    'iframe{display:block;width:100%;height:300px;border:0}.alt{padding:8px 12px;font-size:14px;background:#fff}.alt a{color:inherit}' +
    ':host([layout=bar]){position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:var(--ck-bg);border-top:2px solid var(--ck-ink);padding:8px 10px calc(8px + env(safe-area-inset-bottom))}' +
    ':host([layout=bar]) .row{flex-wrap:nowrap}:host([layout=bar]) a.b{flex:1;min-width:0;padding:10px 6px;font-size:14px;flex-direction:column;gap:4px;min-height:54px}' +
    ':host([layout=bar]) .map{display:none}' +
    '@media (prefers-color-scheme:dark){:host(:not([theme=light])){--ck-ink:#ecedef;--ck-bg:#1b1d21;--ck-line:#2c2f35}.map,.alt{background:#1b1d21}.ph small{color:#9ea2aa}}';

  // ---- link building (exported so it can be tested without a browser) ----
  function digits(s) { return String(s || '').replace(/\D+/g, ''); }

  // "+351 912 345 678", "00351912345678", "912345678", "0912345678" -> "351912345678"
  function intl(num, country) {
    var raw = String(num || '').trim(), d = digits(raw), c = digits(country || '351');
    if (!d) return '';
    if (raw.charAt(0) === '+') return d;
    if (d.indexOf('00') === 0) return d.slice(2);
    if (c && d.indexOf(c) === 0 && d.length > c.length + 6) return d;      // already has the country code
    return c + d.replace(/^0+/, '');
  }
  function waLink(num, msg, country) { var n = intl(num, country); return n ? 'https://wa.me/' + n + (msg ? '?text=' + encodeURIComponent(msg) : '') : ''; }
  function telLink(num, country) { var n = intl(num, country); return n ? 'tel:+' + n : ''; }
  function tgLink(who, msg, country) {
    who = String(who || '').trim().replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/^@/, '');
    if (!who) return '';
    var base = /^\+?[\d\s()-]{7,}$/.test(who) ? 'https://t.me/+' + intl(who, country) : 'https://t.me/' + encodeURIComponent(who);
    return base + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }
  function mailLink(addr, msg, subject) {
    addr = String(addr || '').trim(); if (!addr) return '';
    var q = []; if (subject) q.push('subject=' + encodeURIComponent(subject)); if (msg) q.push('body=' + encodeURIComponent(msg));
    return 'mailto:' + addr + (q.length ? '?' + q.join('&') : '');
  }
  function mapEmbed(lat, lon, zoom) {
    var d = 0.004 * Math.pow(2, 16 - (zoom || 16)), la = +lat, lo = +lon;
    return 'https://www.openstreetmap.org/export/embed.html?bbox=' + [lo - d * 1.6, la - d, lo + d * 1.6, la + d].map(function (x) { return x.toFixed(5); }).join('%2C') + '&layer=mapnik&marker=' + la + '%2C' + lo;
  }
  function mapsLink(lat, lon, query) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(lat && lon ? lat + ',' + lon : query);
  }

  var kit = { intl: intl, waLink: waLink, telLink: telLink, tgLink: tgLink, mailLink: mailLink, mapEmbed: mapEmbed, mapsLink: mapsLink, strings: T };
  (typeof window !== 'undefined' ? window : globalThis).ContactKit = kit;
  if (typeof customElements === 'undefined') return;

  function svg(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[name] + '</svg>'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  class ContactKitEl extends HTMLElement {
    static get observedAttributes() { return ['phone', 'whatsapp', 'telegram', 'email', 'message', 'lang', 'address', 'lat', 'lon', 'zoom', 'country', 'layout', 'subject', 'theme', 'order']; }
    constructor() { super(); this.attachShadow({ mode: 'open' }); this._t = 0; }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { var s = this; clearTimeout(s._t); s._t = setTimeout(function () { s.render(); }, 0); }
    render() {
      var g = this.getAttribute.bind(this), lang = (g('lang') || document.documentElement.lang || 'en').slice(0, 2).toLowerCase(), t = T[lang] || T.en;
      var msg = g('message') != null ? g('message') : t.msg, country = g('country') || '351';
      var wa = g('whatsapp') != null ? g('whatsapp') : '', tg = g('telegram'), ph = g('phone'), em = g('email');
      var items = { call: ph ? [telLink(ph, country), t.call] : null, whatsapp: wa ? [waLink(wa, msg, country), t.whatsapp] : null,
                    telegram: tg ? [tgLink(tg, msg, country), t.telegram] : null, email: em ? [mailLink(em, msg, g('subject') || ''), t.email] : null };
      var order = (g('order') || 'whatsapp,call,telegram,email').split(/[\s,]+/), html = '', first = true;
      order.forEach(function (k) {
        var it = items[k]; if (!it || !it[0]) return;
        var ext = k === 'whatsapp' || k === 'telegram';
        html += '<a class="b' + (first ? ' main' : '') + '" href="' + esc(it[0]) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' data-k="' + k + '">' + svg(k) + '<span>' + esc(it[1]) + '</span></a>'; first = false;
      });
      var hasMap = g('lat') && g('lon');
      var map = '';
      if (hasMap && g('layout') !== 'bar') {
        map = '<div class="map"><div class="ph">' + (g('address') ? '<p class="addr">' + esc(g('address')) + '</p>' : '') +
          '<div class="row"><button class="b" type="button" data-map>' + svg('map') + '<span>' + esc(t.map) + '</span></button>' +
          '<a class="b" href="' + esc(mapsLink(g('lat'), g('lon'), g('address'))) + '" target="_blank" rel="noopener">' + svg('map') + '<span>' + esc(t.open) + '</span></a></div>' +
          '<small>' + esc(t.hint) + '</small></div></div>';
      }
      this.shadowRoot.innerHTML = '<style>' + CSS + '</style><div class="row" role="group" aria-label="' + esc(t.label) + '">' + html + '</div>' + map;
      var btn = this.shadowRoot.querySelector('[data-map]'), self = this;
      if (btn) btn.addEventListener('click', function () {
        var box = self.shadowRoot.querySelector('.map');
        box.innerHTML = '<iframe title="' + esc(g('address') || t.map) + '" loading="lazy" referrerpolicy="no-referrer" src="' + esc(mapEmbed(g('lat'), g('lon'), +g('zoom') || 16)) + '"></iframe>' +
          '<div class="alt"><a href="' + esc(mapsLink(g('lat'), g('lon'), g('address'))) + '" target="_blank" rel="noopener">' + esc(t.open) + '</a></div>';
      });
    }
  }
  if (!customElements.get('contact-kit')) customElements.define('contact-kit', ContactKitEl);
})();
