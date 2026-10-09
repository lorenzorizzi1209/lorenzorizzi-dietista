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

  trackButtonClicks();
}

const cookieBanner = document.getElementById('cookieBanner');
if (cookieBanner) {
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieReject = document.getElementById('cookieReject');
  const consent = localStorage.getItem('cookie_consent');

  if (consent === 'accepted') {
    loadAnalytics();
  } else if (consent !== 'rejected') {
    cookieBanner.classList.add('show');
  }

  cookieAccept.addEventListener('click', () => {
    localStorage.setItem('cookie_consent', 'accepted');
    cookieBanner.classList.remove('show');
    loadAnalytics();
  });

  cookieReject.addEventListener('click', () => {
    localStorage.setItem('cookie_consent', 'rejected');
    cookieBanner.classList.remove('show');
  });
}

// Permette di revocare o modificare la scelta sui cookie in qualsiasi momento
document.querySelectorAll('.cookie-preferences-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('cookie_consent');
    location.reload();
  });
});
