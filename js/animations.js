/* ============================================================
   GeoMiner.AI — Premium Animations Engine
   ============================================================ */
(function () {
  'use strict';

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    injectScrollProgress();
    injectHeroGlows();
    tagRevealElements();
    initScrollReveal();
    initNavScroll();
    initParallax();
    initCounters();
    initTiltCards();
    initMagneticButtons();
    initParticles();
    initSmoothAnchors();
  }

  /* ---------- Scroll Progress Bar ---------- */
  function injectScrollProgress() {
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.prepend(bar);
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (scrollTop / docHeight * 100) + '%';
    }, { passive: true });
  }

  /* ---------- Hero Glow Orbs ---------- */
  function injectHeroGlows() {
    var header = document.querySelector('header.section');
    if (!header) return;
    header.style.position = 'relative';
    header.style.overflow = 'hidden';
    var g1 = document.createElement('div');
    g1.className = 'hero-glow';
    var g2 = document.createElement('div');
    g2.className = 'hero-glow-2';
    header.prepend(g2);
    header.prepend(g1);
  }

  /* ---------- Auto-Tag Reveal Elements ---------- */
  function tagRevealElements() {
    // Sections and main content blocks
    var selectors = [
      '.card', '.card_body', '.card-body',
      'h1', 'h2', '.h1-heading', '.h2-heading',
      '.subheading', '.paragraph_large', '.paragraph-lg',
      '.button-group', '.eyebrow',
      '.flex-horizontal.flex-vertical.x-left',
      '.fn-form', '.fn-column',
      '.utility-padding-left-2rem',
      '.footer_link',
      'header .w-layout-grid > *',
      '.grid_3-col > *',
      '.grid-layout > li',
      '.grid-layout > div'
    ];

    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el.dataset.reveal && !el.closest('[data-reveal]')) {
          el.dataset.reveal = '';
        }
      });
    });

    // Add stagger to grid lists
    document.querySelectorAll('.grid_3-col, .grid-layout.desktop-4-column, .grid-layout.desktop-3-column').forEach(function (el) {
      el.dataset.revealStagger = '';
    });
  }

  /* ---------- Intersection Observer for Reveals ---------- */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything
      document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;

          // Stagger children
          if (el.dataset.revealStagger !== undefined) {
            Array.from(el.children).forEach(function (child, i) {
              child.style.transitionDelay = (i * 0.12) + 's';
            });
          }

          // Stagger delay for items within a group
          if (el.dataset.reveal !== undefined) {
            var parent = el.parentElement;
            if (parent) {
              var siblings = Array.from(parent.children).filter(function (c) {
                return c.dataset.reveal !== undefined;
              });
              var idx = siblings.indexOf(el);
              if (idx > 0) {
                el.style.transitionDelay = (idx * 0.1) + 's';
              }
            }
          }

          el.classList.add('revealed');
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Nav Background on Scroll ---------- */
  function initNavScroll() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var threshold = 80;
    function checkScroll() {
      if (window.scrollY > threshold) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }

  /* ---------- Parallax on Images ---------- */
  function initParallax() {
    var images = document.querySelectorAll('.cover-image, .ix-full-screen-background img');
    if (!images.length) return;

    images.forEach(function (img) {
      img.classList.add('parallax-img');
    });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          images.forEach(function (img) {
            var rect = img.getBoundingClientRect();
            var inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (inView) {
              var offset = (rect.top / window.innerHeight - 0.5) * 30;
              img.style.transform = 'translateY(' + offset + 'px) scale(1.02)';
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Animated Counters ---------- */
  function initCounters() {
    var statMap = {
      '40%': { end: 40, suffix: '%' },
      '75%': { end: 75, suffix: '%' },
      '50–80%': { end: 80, suffix: '%', prefix: '50–' },
      '$0': { end: 0, prefix: '$' },
      '$19': { end: 19, prefix: '$' },
      '$29': { end: 29, prefix: '$' },
      '$49': { end: 49, prefix: '$' },
      '80%': { end: 80, suffix: '%' }
    };

    var headings = document.querySelectorAll('.h2-heading');
    headings.forEach(function (h) {
      var text = h.textContent.trim();
      // Check for stat-like content that contains a number with % or $
      var strong = h.querySelector('strong');
      if (strong) text = strong.textContent.trim();

      Object.keys(statMap).forEach(function (key) {
        if (text.indexOf(key) !== -1 && !text.match(/[a-zA-Z]{3,}/)) {
          h.classList.add('stat-counter');
          h.dataset.counterEnd = statMap[key].end;
          h.dataset.counterSuffix = statMap[key].suffix || '';
          h.dataset.counterPrefix = statMap[key].prefix || '';
          h.dataset.counterOriginal = h.innerHTML;
        }
      });
    });

    if (!('IntersectionObserver' in window)) return;

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-counter').forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  function animateCounter(el) {
    var end = parseInt(el.dataset.counterEnd, 10);
    var prefix = el.dataset.counterPrefix || '';
    var suffix = el.dataset.counterSuffix || '';
    var duration = 1500;
    var start = 0;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (end - start) * eased);
      el.innerHTML = '<strong>' + prefix + current + suffix + '</strong>';
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.innerHTML = el.dataset.counterOriginal;
        el.classList.add('counted');
      }
    }
    if (end > 0) {
      requestAnimationFrame(step);
    }
  }

  /* ---------- Tilt Effect on Cards ---------- */
  function initTiltCards() {
    var cards = document.querySelectorAll('.card');
    cards.forEach(function (card) {
      card.classList.add('tilt-card');
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'translateY(-8px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------- Magnetic Buttons ---------- */
  function initMagneticButtons() {
    var buttons = document.querySelectorAll('.button, .w-button');
    buttons.forEach(function (btn) {
      btn.classList.add('magnetic-btn');
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.15) + 'px,' + (y * 0.15) + 'px) translateY(-2px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Particle Network Background ---------- */
  function initParticles() {
    var canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.prepend(canvas);
    var ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var particles = [];
    var count = Math.min(60, Math.floor(window.innerWidth / 25));

    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Particles
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 200, 120, 0.4)';
        ctx.fill();

        // Lines between nearby particles
        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var dx = p.x - p2.x;
          var dy = p.y - p2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(0, 200, 120, ' + (0.12 * (1 - dist / 150)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------- Smooth Anchor Scrolling ---------- */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

})();
