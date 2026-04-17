/* Owen Style v2 — main.js */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navigation scroll effect ────────────────────────────────── */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile hamburger ───────────────────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks   = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  /* ── Scroll reveal ─────────────────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => revealObserver.observe(el));

  /* ── Active nav link ───────────────────────────────────────── */
  const navLinksAll = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  const onScrollNav = () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinksAll.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ── Lightbox ──────────────────────────────────────────────── */
  const lightbox    = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lb-img');
  const lbCounter  = document.getElementById('lb-counter');
  const lbClose    = document.getElementById('lb-close');
  const lbPrev     = document.getElementById('lb-prev');
  const lbNext     = document.getElementById('lb-next');
  const lbBackdrop = document.getElementById('lb-backdrop');

  if (!lightbox) {
    /* no lightbox on this page, skip to contact form setup */
  } else {

  const items = Array.from(document.querySelectorAll('.masonry-item img'));
  let current = 0;

  function openLB(index) {
    current = Math.max(0, Math.min(index, items.length - 1));
    lbImg.src = items[current].src;
    lbImg.alt = items[current].alt;
    lbCounter.textContent = `${current + 1} / ${items.length}`;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLB() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prevLB() { openLB(current - 1); }
  function nextLB() { openLB(current + 1); }

  items.forEach((img, i) => {
    img.parentElement.addEventListener('click', () => openLB(i));
  });

  lbClose?.addEventListener('click', closeLB);
  lbBackdrop?.addEventListener('click', closeLB);
  lbPrev?.addEventListener('click', prevLB);
  lbNext?.addEventListener('click', nextLB);

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLB();
    if (e.key === 'ArrowLeft')  prevLB();
    if (e.key === 'ArrowRight') nextLB();
  });

  } /* end lightbox block */

  /* ── Contact form → Formspree (native submission) ───────── */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      const btn = contactForm.querySelector('button[type="submit"]');
      
      // Basic validation
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const service = document.getElementById('service').value;
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !service || !message) {
        e.preventDefault();
        alert('請填寫必填欄位（姓名、Email、服務項目、訊息）');
        return;
      }

      // Show loading state
      btn.disabled = true;
      btn.textContent = '傳送中…';
      
      // Form will submit to Formspree normally
      // Page will redirect to Formspree thank you page
    });
  }
});
