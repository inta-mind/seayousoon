/* ==========================================================================
   Sea You Soon & Spa — Site scripts
   Vanilla ES6. No external libraries.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  initSmoothScroll();
  initActiveNav();
  initScrollReveal();
  initTideIndicator();
  initHeroParallax();
  initGalleryLightbox();
  initBackToTop();
  initFooterYear();
  preloadHeroImage();
});

/* --------------------------------------------------------------------------
   Sticky navbar — becomes opaque after leaving the hero
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const toggle = () => {
    if (window.scrollY > 80) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

/* --------------------------------------------------------------------------
   Mobile navigation
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  const closeMenu = () => {
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };

  const openMenu = () => {
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  };

  toggle.addEventListener('click', () => {
    const isOpen = document.body.classList.contains('nav-open');
    isOpen ? closeMenu() : openMenu();
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* --------------------------------------------------------------------------
   Smooth scrolling for in-page anchors (CSS handles most of it;
   this compensates for the fixed header offset on older browsers)
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerOffset = 84;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* --------------------------------------------------------------------------
   Highlight the current section in the nav
   -------------------------------------------------------------------------- */
function initActiveNav() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const map = new Map();
  navLinks.forEach(link => map.set(link.getAttribute('href').slice(1), link));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = map.get(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

/* --------------------------------------------------------------------------
   Fade-up reveal on scroll
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .waterline');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // slight stagger for elements revealed together
        const delay = Math.min(i * 40, 200);
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   "Tide" scroll progress indicator
   -------------------------------------------------------------------------- */
function initTideIndicator() {
  const fill = document.getElementById('tideFill');
  if (!fill) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    fill.style.width = progress + '%';
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

/* --------------------------------------------------------------------------
   Subtle hero parallax
   -------------------------------------------------------------------------- */
function initHeroParallax() {
  const heroImg = document.getElementById('heroImg');
  const hero = document.getElementById('hero');
  if (!heroImg || !hero) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const update = () => {
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const offset = window.scrollY * 0.35;
    heroImg.style.transform = `translateY(${offset}px) scale(1.08)`;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* --------------------------------------------------------------------------
   Gallery lightbox with keyboard navigation
   -------------------------------------------------------------------------- */
function initGalleryLightbox() {
  const items = Array.from(document.querySelectorAll('.masonry-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  if (!items.length || !lightbox || !lightboxImg) return;

  let currentIndex = 0;
  let lastFocused = null;

  const openAt = (index) => {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    const full = item.getAttribute('data-full');
    const altText = item.querySelector('img')?.getAttribute('alt') || '';

    lightboxImg.setAttribute('src', full);
    lightboxImg.setAttribute('alt', altText);
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  items.forEach((item, index) => {
    item.addEventListener('click', () => openAt(index));
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => openAt(currentIndex - 1));
  nextBtn.addEventListener('click', () => openAt(currentIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') openAt(currentIndex + 1);
    if (e.key === 'ArrowLeft') openAt(currentIndex - 1);
  });
}

/* --------------------------------------------------------------------------
   Back-to-top button
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const toggle = () => {
    if (window.scrollY > window.innerHeight) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  };

  toggle();
  window.addEventListener('scroll', toggle, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   Footer year
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* --------------------------------------------------------------------------
   Preload the hero image for a smooth first paint
   -------------------------------------------------------------------------- */
function preloadHeroImage() {
  const heroImg = document.getElementById('heroImg');
  if (!heroImg) return;
  const src = heroImg.getAttribute('src');
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'image';
  preloadLink.href = src;
  document.head.appendChild(preloadLink);
}