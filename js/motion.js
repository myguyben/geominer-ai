/* ============================================================
   GeoMiner.AI — Motion engine (motion.js)
   Vanilla, brand-purple, prefers-reduced-motion aware.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ---- Mobile menu ---- */
  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
      var open = document.body.classList.contains("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
    });
  }

  /* ---- Nav scroll state + progress bar ---- */
  function initNavScroll() {
    var nav = document.querySelector(".nav");
    var bar = document.getElementById("scroll-progress");
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (nav) nav.classList.toggle("scrolled", y > 40);
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Scroll reveal ---- */
  function initReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("revealed"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var delay = parseFloat(el.getAttribute("data-delay")) || 0;
        el.style.transitionDelay = delay + "s";
        el.classList.add("revealed");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    els.forEach(function (el) {
      // auto-stagger direct children of a [data-stagger] container
      if (el.parentElement && el.parentElement.hasAttribute("data-stagger") && !el.hasAttribute("data-delay")) {
        var sibs = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.transitionDelay = (sibs * 0.09) + "s";
      }
      io.observe(el);
    });
  }

  /* ---- Animated counters ---- */
  function initCounters() {
    var nodes = document.querySelectorAll("[data-count]");
    if (!nodes.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.textContent = n.getAttribute("data-count-text") || n.getAttribute("data-count"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        animate(e.target); io.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (n) { io.observe(n); });

    function animate(node) {
      var finalText = node.getAttribute("data-count-text");
      var target = parseFloat(node.getAttribute("data-count"));
      var prefix = node.getAttribute("data-prefix") || "";
      var suffix = node.getAttribute("data-suffix") || "";
      if (isNaN(target)) { node.textContent = finalText; return; }
      var dur = 1500, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else node.textContent = finalText || (prefix + target + suffix);
      }
      requestAnimationFrame(step);
    }
  }

  /* ---- Parallax (rAF-throttled) ---- */
  function initParallax() {
    if (reduce) return;
    var els = document.querySelectorAll("[data-parallax]");
    if (!els.length) return;
    var ticking = false;
    function update() {
      els.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.12;
        var r = el.getBoundingClientRect();
        var off = (r.top + r.height / 2 - window.innerHeight / 2) * -speed;
        el.style.transform = "translate3d(0," + off.toFixed(1) + "px,0) scale(1.06)";
      });
      ticking = false;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  /* ---- Timeline: light nodes on enter + fill spine on scroll ---- */
  function initTimeline() {
    var tl = document.querySelector("[data-timeline]");
    if (!tl) return;
    var steps = tl.querySelectorAll(".t-step");
    var fill = tl.querySelector(".timeline-fill");
    var spine = tl.querySelector(".timeline");
    if (!steps.length) return;

    if (reduce || !("IntersectionObserver" in window)) {
      steps.forEach(function (s) { s.classList.add("active"); });
      if (fill) fill.style.height = "100%";
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("active"); });
    }, { threshold: 0.35, rootMargin: "0px 0px -18% 0px" });
    steps.forEach(function (s) { io.observe(s); });

    if (!fill || !spine) return;
    var ticking = false;
    function update() {
      var r = spine.getBoundingClientRect();
      var vh = window.innerHeight;
      var pct = (vh * 0.5 - r.top) / r.height;
      pct = Math.max(0, Math.min(1, pct));
      fill.style.height = (pct * 100).toFixed(1) + "%";
      ticking = false;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  /* ---- Magnetic buttons (throttled mousemove) ---- */
  function initMagnetic() {
    if (reduce || window.matchMedia("(pointer: coarse)").matches) return;
    var btns = document.querySelectorAll(".btn-primary");
    btns.forEach(function (btn) {
      var raf = null;
      btn.addEventListener("mousemove", function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = btn.getBoundingClientRect();
          var x = (e.clientX - r.left - r.width / 2) * 0.18;
          var y = (e.clientY - r.top - r.height / 2) * 0.28;
          btn.style.transform = "translate(" + x.toFixed(1) + "px," + (y - 3).toFixed(1) + "px)";
          raf = null;
        });
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---- Smooth in-page anchors ---- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    });
  }

  /* ---- Hero particle network (brand purple) ---- */
  function initParticles() {
    if (reduce) return;
    var canvas = document.getElementById("hero-particles");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w, h, particles, raf;
    var host = canvas.parentElement;

    function size() {
      w = canvas.width = host.offsetWidth;
      h = canvas.height = host.offsetHeight;
      var count = Math.min(48, Math.floor(w / 32));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: rand(0, w), y: rand(0, h),
          vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
          r: rand(1, 2.4)
        });
      }
    }
    function rand(a, b) { return a + (b - a) * pseudo(); }
    var seed = 0.4172; // deterministic (Math.random unavailable in some harnesses; fine in browser)
    function pseudo() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(143,127,255,0.55)";
        ctx.fill();
        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(106,83,254," + (0.16 * (1 - dist / 130)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    size();
    draw();
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 200); }, { passive: true });
  }

  ready(function () {
    initMenu();
    initNavScroll();
    initReveal();
    initCounters();
    initParallax();
    initTimeline();
    initMagnetic();
    initAnchors();
    initParticles();
  });
})();
