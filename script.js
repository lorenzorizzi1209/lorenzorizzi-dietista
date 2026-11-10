// Hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
  });
});

// Garanzia: il clic sul testo porta alla FAQ corrispondente e la apre
function openFaqItem(item) {
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
  item.classList.add('active');
}

document.querySelectorAll('a.guarantee-link').forEach(link => {
  link.addEventListener('click', (e) => {
    const item = document.querySelector(link.getAttribute('href'));
    if (!item) return;
    e.preventDefault();
    openFaqItem(item);
    item.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // una FAQ già aperta sopra si chiude e sposta il layout: si ripete lo scorrimento a cose ferme
    setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'start' }), 420);
  });
});

// Se si arriva con l'indirizzo di una FAQ (es. #faq-garanzia-visita), la FAQ si apre da sola
const hashFaq = location.hash ? document.getElementById(location.hash.slice(1)) : null;
if (hashFaq && hashFaq.classList.contains('faq-item')) {
  openFaqItem(hashFaq);
}

// Navbar shadow on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => observer.observe(el));

// Contact form (demo only, no backend)
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Grazie per il tuo messaggio! Ti ricontatterò al più presto.');
    contactForm.reset();
  });
}

// Cookie consent banner + analytics (Google Analytics + Meta Pixel)
const GA_MEASUREMENT_ID = 'G-ZVP6EXHDFY';
const META_PIXEL_ID = '1873333810309595';

// Solo i pulsanti "Prenota" e "Scrivimi" (link WhatsApp) contano come contatto
function trackButtonClicks() {
  document.querySelectorAll('a[href^="https://wa.me"]').forEach(el => {
    el.addEventListener('click', () => {
      const label = el.dataset.label || el.textContent.replace(/\s+/g, ' ').trim();
      if (window.gtag) {
        window.gtag('event', 'contact_click', { event_category: 'contatto', event_label: label });
      }
      if (window.fbq) {
        window.fbq('track', 'Contact', { method: label });
      }
    });
  });
}

function loadAnalytics() {
  if (window.__analyticsLoaded) return;
  window.__analyticsLoaded = true;

  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  // Il page_view lo inviamo noi, con un titolo dedicato (i nomi degli eventi GA non ammettono spazi o "|")
  gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  // Evento 1: arrivo sul sito
  const pageBase = location.origin + location.pathname + location.search;
  gtag('event', 'page_view', {
    page_title: 'Lorenzo Rizzi | Home',
    page_location: pageBase
  });

  // Evento 2: visualizzazione dei box con i prezzi (una sola volta per visita)
  const priceBoxes = document.querySelector('.price-cards');
  if (priceBoxes) {
    const priceBoxesObserver = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        priceBoxesObserver.disconnect();
        gtag('event', 'page_view', {
          page_title: 'Lorenzo Rizzi | Prezzi',
          page_location: pageBase + '#prezzi'
        });
      }
    }, { threshold: 0.3 });
    priceBoxesObserver.observe(priceBoxes);
  }

  (function(f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');

  // Evento dedicato a chi arriva alla sezione "Costi e Pacchetti" (una sola volta per visita)
  const pricingSection = document.getElementById('costi');
  if (pricingSection) {
    const pricingObserver = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        pricingObserver.disconnect();
        window.fbq('track', 'ViewContent', { content_name: 'Offerta Completa' });
        window.gtag('event', 'view_offer_page');
      }
    }, { threshold: 0.2 });
    pricingObserver.observe(pricingSection);
  }

  // Evento: la persona ha fatto scorrere il carosello "Cosa comprende" fino all'ultima card (una sola volta per visita)
  const lastIncludeCard = document.querySelector('.inc-card:last-child');
  if (lastIncludeCard) {
    const lastCardObserver = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        lastCardObserver.disconnect();
        // Come per "Home" e "Prezzi": per Google è una visualizzazione di pagina con titolo dedicato
        // (i nomi degli eventi GA non ammettono spazi né simboli, il titolo sì)
        window.gtag('event', 'page_view', {
          page_title: 'Lorenzo Rizzi | LastCard',
          page_location: pageBase + '#ultima-card'
        });
        window.fbq('trackCustom', 'ViewLastCard', { content_name: 'Cosa comprende: ultima card' });
      }
    }, { threshold: 0.6 });
    lastCardObserver.observe(lastIncludeCard);
  }

  trackButtonClicks();
}

// Versione della scelta sui cookie. Per far rifare la scelta a tutti i visitatori
// basta aumentare il numero: le scelte salvate con versioni precedenti vengono ignorate.
const CONSENT_VERSION = 2;
const CONSENT_KEY = 'cookie_consent_v' + CONSENT_VERSION;
const LEGACY_CONSENT_KEYS = ['cookie_consent'];

// La memoria del browser può non essere disponibile (modalità privata, blocchi):
// in quel caso il banner deve comunque comparire e funzionare per la visita in corso
function readConsent() {
  try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
}

function saveConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* scelta valida solo per questa visita */ }
}

function clearSavedConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
    LEGACY_CONSENT_KEYS.forEach(key => localStorage.removeItem(key));
  } catch (e) { /* niente da rimuovere */ }
}

// Cancella i cookie di misurazione (Google Analytics, Meta) rimasti da una scelta precedente
// Non deve mai bloccare il banner: alcuni browser integrati (es. Instagram) possono vietare
// l'accesso a document.cookie, quindi tutto è in try/catch
function clearTrackingCookies() {
  try {
    const names = document.cookie.split(';')
      .map(c => c.split('=')[0].trim())
      .filter(n => n === '_ga' || n.indexOf('_ga_') === 0 || n === '_gid' || n === '_gat' || n === '_fbp' || n === '_fbc');
    if (!names.length) return;

    const host = location.hostname;
    const parts = host.split('.');
    const domains = [host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));

    names.forEach(name => {
      const expired = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = expired;
      domains.forEach(d => { document.cookie = expired + '; domain=' + d; });
    });
  } catch (e) { /* accesso ai cookie non consentito: niente da cancellare */ }
}

const cookieBanner = document.getElementById('cookieBanner');
if (cookieBanner) {
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieReject = document.getElementById('cookieReject');
  const consent = readConsent();

  // Il banner compare finché l'utente non ha scelto: nessuna scelta automatica
  if (consent === 'accepted') {
    try { loadAnalytics(); } catch (e) { /* un errore del tracciamento non deve bloccare il sito */ }
  } else {
    // prima si mostra il banner, poi si fa pulizia: un errore nella pulizia non può nasconderlo
    if (consent !== 'rejected') {
      cookieBanner.classList.add('show');
    }
    clearTrackingCookies();
  }

  cookieAccept.addEventListener('click', () => {
    saveConsent('accepted');
    cookieBanner.classList.remove('show');
    try { loadAnalytics(); } catch (e) { /* un errore del tracciamento non deve bloccare il sito */ }
  });

  cookieReject.addEventListener('click', () => {
    saveConsent('rejected');
    cookieBanner.classList.remove('show');
    clearTrackingCookies();
  });
}

// Permette di revocare o modificare la scelta sui cookie in qualsiasi momento
document.querySelectorAll('.cookie-preferences-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    clearSavedConsent();
    clearTrackingCookies();
    location.reload();
  });
});

// Promozione: conto alla rovescia (la sezione si nasconde da sola alla scadenza)
(function () {
  const promo = document.getElementById('promo');
  if (!promo) return;
  const deadline = new Date(promo.dataset.deadline).getTime();
  const cells = {};
  promo.querySelectorAll('[data-unit]').forEach(el => { cells[el.dataset.unit] = el; });
  let timerId;

  function tick() {
    const left = deadline - Date.now();
    if (isNaN(deadline) || left <= 0) {
      promo.style.display = 'none';
      clearInterval(timerId);
      return;
    }
    const s = Math.floor(left / 1000);
    const pad = n => String(n).padStart(2, '0');
    setCell(cells.days, pad(Math.floor(s / 86400)));
    setCell(cells.hours, pad(Math.floor(s % 86400 / 3600)));
    setCell(cells.minutes, pad(Math.floor(s % 3600 / 60)));
    setCell(cells.seconds, pad(s % 60));
  }

  // Aggiorna la cifra solo se cambia e ne riavvia l'animazione di comparsa
  function setCell(el, value) {
    if (el.textContent === value) return;
    el.textContent = value;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  }

  tick();
  timerId = setInterval(tick, 1000);
})();

// Cosa comprende: carosello orizzontale (scorrimento, frecce, puntini, trascinamento col mouse)
(function () {
  const carousel = document.querySelector('.inc-carousel');
  if (!carousel) return;
  const viewport = carousel.querySelector('.inc-viewport');
  const track = carousel.querySelector('.inc-track');
  const prev = carousel.querySelector('.inc-prev');
  const next = carousel.querySelector('.inc-next');
  const dotsBox = carousel.querySelector('.inc-dots');
  const cards = Array.from(track.children);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = reduceMotion ? 'auto' : 'smooth';

  const dots = cards.map((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.tabIndex = -1;
    dot.addEventListener('click', () => { markTouched(); goTo(i); });
    dotsBox.appendChild(dot);
    return dot;
  });

  function startOffset() { return parseFloat(getComputedStyle(track).paddingLeft) || 0; }
  function maxScroll() { return track.scrollWidth - track.clientWidth; }
  function step() { return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth; }
  function nearestIndex() {
    if (track.scrollLeft >= maxScroll() - 4) return cards.length - 1;
    return Math.min(cards.length - 1, Math.max(0, Math.round(track.scrollLeft / step())));
  }
  function goTo(i) {
    const index = Math.min(cards.length - 1, Math.max(0, i));
    track.scrollTo({ left: cards[index].offsetLeft - startOffset(), behavior });
  }
  function markTouched() { carousel.classList.add('touched'); }

  let ticking = false;
  function update() {
    ticking = false;
    const x = track.scrollLeft;
    const max = maxScroll();
    viewport.classList.toggle('can-left', x > 4);
    viewport.classList.toggle('can-right', x < max - 4);
    prev.disabled = x <= 4;
    next.disabled = x >= max - 4;
    const active = nearestIndex();
    dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
    if (x > 12) markTouched();
  }

  track.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);

  prev.addEventListener('click', () => { markTouched(); goTo(nearestIndex() - 1); });
  next.addEventListener('click', () => { markTouched(); goTo(nearestIndex() + 1); });
  track.addEventListener('pointerdown', markTouched);
  track.addEventListener('keydown', markTouched);

  // Trascinamento col mouse (da telefono e trackpad si scorre già da soli)
  let dragging = false, moved = false, startX = 0, startScroll = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 4) {
      moved = true;
      track.classList.add('dragging');
      track.style.scrollSnapType = 'none';
    }
    if (moved) track.scrollLeft = startScroll - dx;
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    if (!moved) return;
    track.classList.remove('dragging');
    const index = nearestIndex();
    track.style.scrollSnapType = '';
    goTo(index);
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // All'ingresso nella pagina le card fanno un piccolo movimento laterale (una volta sola)
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const nudgeObserver = new IntersectionObserver((entries) => {
      if (!entries.some(e => e.isIntersecting)) return;
      nudgeObserver.disconnect();
      setTimeout(() => {
        if (track.scrollLeft > 4 || carousel.classList.contains('touched')) return;
        carousel.classList.add('nudge');
        cards[0].addEventListener('animationend', () => carousel.classList.remove('nudge'), { once: true });
      }, 500);
    }, { threshold: 0.7 });
    nudgeObserver.observe(viewport);
  }

  update();
})();

// Risultato: il percorso curvo si disegna mentre si scorre la pagina e accende i passaggi
(function () {
  const map = document.querySelector('.journey-map');
  if (!map) return;
  const svg = map.querySelector('.journey-line');
  const track = svg.querySelector('.journey-track');
  const progress = svg.querySelector('.journey-progress');
  const measure = svg.querySelector('.journey-measure');
  const steps = Array.from(map.querySelectorAll('.journey-step'));
  const nodes = steps.map(s => s.querySelector('.journey-node'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let keys = [];
  let nodeY = [];
  let ticking = false;

  // Costruisce la curva a partire dalla posizione reale dei passaggi (si adatta a qualsiasi larghezza)
  function build() {
    const box = map.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const pts = steps.map((s, i) => {
      const n = nodes[i].getBoundingClientRect();
      const r = s.getBoundingClientRect();
      return { x: n.left + n.width / 2 - box.left, y: n.top + n.height / 2 - box.top, top: r.top - box.top, bottom: r.bottom - box.top };
    });
    svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);

    const cmds = ['M' + pts[0].x + ',' + pts[0].y];
    const marks = [{ y: pts[0].y, node: 0, cmd: 0 }];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const gap = Math.max(0, b.top - a.bottom);
      cmds.push('L' + a.x + ',' + a.bottom);
      marks.push({ y: a.bottom, cmd: cmds.length - 1 });
      cmds.push('C' + a.x + ',' + (a.bottom + gap * 0.65) + ' ' + b.x + ',' + (b.top - gap * 0.65) + ' ' + b.x + ',' + b.top);
      marks.push({ y: b.top, cmd: cmds.length - 1 });
      cmds.push('L' + b.x + ',' + b.y);
      marks.push({ y: b.y, node: i + 1, cmd: cmds.length - 1 });
    }
    const d = cmds.join(' ');
    track.setAttribute('d', d);
    progress.setAttribute('d', d);
    measure.setAttribute('d', d);
    const total = measure.getTotalLength() || 1;

    nodeY = [];
    keys = marks.map(m => {
      measure.setAttribute('d', cmds.slice(0, m.cmd + 1).join(' '));
      if (m.node !== undefined) nodeY[m.node] = m.y;
      return { y: m.y, f: measure.getTotalLength() / total };
    });
    update();
  }

  // Frazione di percorso già "percorsa" per una data altezza della mappa
  function fractionAt(y) {
    if (y <= keys[0].y) return 0;
    if (y >= keys[keys.length - 1].y) return 1;
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (y >= a.y && y < b.y) {
        const span = b.y - a.y;
        return span > 0 ? a.f + (b.f - a.f) * (y - a.y) / span : b.f;
      }
    }
    return 1;
  }

  function update() {
    ticking = false;
    if (!keys.length) return;
    const headY = reduceMotion ? Infinity : window.innerHeight * 0.65 - map.getBoundingClientRect().top;
    const f = fractionAt(headY);
    progress.style.strokeDashoffset = String(1 - f);
    progress.style.visibility = f > 0.001 ? 'visible' : 'hidden';
    nodes.forEach((n, i) => n.classList.toggle('reached', headY >= nodeY[i]));
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', build);
  window.addEventListener('load', build);
  if (window.ResizeObserver) new ResizeObserver(build).observe(map);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  build();
})();
