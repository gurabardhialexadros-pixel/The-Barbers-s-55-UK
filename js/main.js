/* ==============================================
   THE BARBERS 55 — Main JS
   GSAP + Lenis + Canvas Particles
   ============================================== */

/* ---------- Register GSAP plugins ---------- */
gsap.registerPlugin(ScrollTrigger);

/* ---------- Detect touch devices ----------- */
const hasHover = window.matchMedia('(hover: hover)').matches;
if (hasHover) document.body.classList.add('has-hover');

/* ======================
   CANVAS PARTICLES
   ====================== */
function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COUNT = 55;
  const particles = Array.from({ length: COUNT }, () => createParticle(canvas));

  function createParticle(c, fromBottom = false) {
    return {
      x:      Math.random() * c.width,
      y:      fromBottom ? c.height + 10 : Math.random() * c.height,
      r:      Math.random() * 1.5 + 0.3,
      vy:     -(Math.random() * 0.35 + 0.1),
      vx:     (Math.random() - 0.5) * 0.2,
      alpha:  Math.random() * 0.45 + 0.05,
      phase:  Math.random() * Math.PI * 2,
    };
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.phase += 0.018;
      p.x += p.vx + Math.sin(p.phase) * 0.25;
      p.y += p.vy;

      if (p.y < -10) {
        particles[i] = createParticle(canvas, true);
        return;
      }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#c9a84c';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(tick);
  }
  tick();
}

/* ======================
   CUSTOM CURSOR
   ====================== */
function initCursor() {
  if (!hasHover) return;

  const cursor = document.getElementById('cursor');
  const dot    = cursor.querySelector('.cursor-dot');
  const ring   = cursor.querySelector('.cursor-ring');

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const quickX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
  const quickY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });

  window.addEventListener('mousemove', e => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    gsap.set(dot, { x: pos.x, y: pos.y });
    quickX(pos.x);
    quickY(pos.y);
  }, { passive: true });

  document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
  });
}

/* ======================
   NAV
   ====================== */
function initNav() {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* ======================
   MAGNETIC BUTTONS
   ====================== */
function initMagnetic() {
  if (!hasHover) return;

  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.32;
      const y = (e.clientY - r.top  - r.height / 2) * 0.32;
      gsap.to(btn, { x, y, duration: 0.35, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ======================
   HERO REVEAL
   ====================== */
function heroReveal() {
  const tl = gsap.timeline();
  tl
    .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    .to('.hero-title .line-inner',
        { y: '0%', duration: 1.2, ease: 'power4.out', stagger: 0.12 }, '-=0.5')
    .to('.hero-tagline',  { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.7')
    .to('.hero-actions',  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.6')
    .to(['.hero-socials', '.hero-scroll-hint'],
        { opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.5');
}

/* ======================
   PRELOADER
   ====================== */
function initPreloader() {
  const preloader  = document.getElementById('preloader');
  const bar        = document.getElementById('preloaderBar');
  const countEl    = document.getElementById('preloaderCount');
  const logoEl     = preloader.querySelector('.preloader-logo');
  const subEl      = preloader.querySelector('.preloader-sub');

  const counter = { val: 0 };
  const tl = gsap.timeline({
    onComplete() {
      document.body.classList.remove('is-loading');
      heroReveal();
    }
  });

  tl
    .to(logoEl, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.7,
      ease: 'power4.out'
    })
    .to(subEl, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to(counter, {
      val: 100,
      duration: 1.8,
      ease: 'power1.inOut',
      onUpdate() {
        const v = Math.round(counter.val);
        countEl.textContent = v.toString().padStart(2, '0') + '%';
        bar.style.width = v + '%';
      }
    }, 0)
    .to(preloader, {
      yPercent: -100,
      duration: 0.9,
      ease: 'power4.inOut',
      delay: 0.25
    })
    .from('.nav', { opacity: 0, duration: 0.5 }, '-=0.4');
}

/* ======================
   SCROLL ANIMATIONS
   ====================== */
function initScrollAnimations() {

  /* — reveal-text elements — */
  document.querySelectorAll('.reveal-text').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter() { el.classList.add('is-visible'); }
    });
  });

  /* — split-reveal headings — */
  document.querySelectorAll('.split-reveal').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter() { el.classList.add('is-visible'); }
    });
  });

  /* — service cards stagger — */
  gsap.from('.service-card', {
    y: 40,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.08,
    scrollTrigger: {
      trigger: '.services-grid',
      start: 'top 80%',
    }
  });

  /* — stats counter — */
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter() {
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate() {
            const v = Math.round(obj.val);
            el.textContent = target >= 1000
              ? v.toLocaleString('en-GB')
              : v.toString();
          }
        });
      }
    });
  });

  /* — vibe items stagger — */
  gsap.from('.vibe-item', {
    opacity: 0,
    scale: 0.96,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.06,
    scrollTrigger: {
      trigger: '.vibes-grid',
      start: 'top 82%',
    }
  });

  /* — about visual parallax — */
  if (window.innerWidth > 1024) {
    gsap.to('.about-img-frame', {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-body',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }

  /* — info cards stagger — */
  gsap.from('.info-card', {
    y: 30,
    opacity: 0,
    duration: 0.65,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: '.find-us-info',
      start: 'top 82%',
    }
  });
}

/* ======================
   LENIS SMOOTH SCROLL
   ====================== */
function initLenis() {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ======================
   BOOT
   ====================== */
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initCursor();
  initNav();
  initMagnetic();
  initPreloader();
  initScrollAnimations();
  initLenis();
});
