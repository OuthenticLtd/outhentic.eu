/* OSE site - nav, scroll reveals, mobile menu */
(function () {
  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
  }

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // Reveal once 15% is visible, OR - for elements taller than ~6.6x the
        // viewport (e.g. full legal pages), which can never reach a 15% ratio
        // and would otherwise stay invisible - as soon as any part scrolls in.
        if (e.intersectionRatio >= 0.15 ||
            (e.isIntersecting && e.target.offsetHeight * 0.15 > window.innerHeight)) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: [0, 0.15] });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  // Sub-nav active link (manual / module sections)
  var subnavLinks = document.querySelectorAll('.sub-nav a[href^="#"]');
  if (subnavLinks.length) {
    var sections = Array.prototype.map.call(subnavLinks, function (a) {
      var id = a.getAttribute('href').slice(1);
      return { a: a, el: document.getElementById(id) };
    }).filter(function (s) { return s.el; });

    function onScroll() {
      var y = window.scrollY + 120;
      var current = sections[0];
      sections.forEach(function (s) {
        if (s.el.offsetTop <= y) current = s;
      });
      sections.forEach(function (s) { s.a.classList.toggle('is-active', s === current); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();

/* =========================================================================
   OSE brand mark - the GlowingO, matched 1:1 to the in-app launch/home logo.

   The app draws the mark from primitives (branding/GlowingO.kt):
     • a two-arc ring with the canonical blue → white → orange gradient,
     • a 13-point white waveform across the middle that, on the home screen,
       breathes with a TRAVELING SINE RIPPLE (audioActive = true) - a faint
       wave drifts left → right through the rest shape. It is NOT a scale
       pulse. Each point's Y gets `AMP * sin(x * SPATIAL - phase)` added,
       phase advancing at TEMPORAL rad/s.

   Constants are copied verbatim from GlowingO.kt so the motion is identical:
     AMP = 0.6, SPATIAL = 0.7, TEMPORAL = 1.8 (full cycle ≈ 3.5 s), and the
     audio intensity ramps 0 → 1 over 450 ms on entry (FastOutSlowIn). The
     wave lives in the app's 30-unit space centred on (15,15); every surface
     just maps it via local = (app - 15) * scale + centre.
   ========================================================================= */
(function () {
  // Canonical 13-point waveform, app 30-unit space centred on (15,15).
  var WAVE = [5,15, 7.5,15, 9,12, 10.5,18, 12,10, 13.5,20, 15,8,
              16.5,22, 18,10, 19.5,18, 21,12, 22.5,15, 25,15];
  var AMP = 0.6, SPATIAL = 0.7, TEMPORAL = 1.8;   // GlowingO.kt
  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // FastOutSlowInEasing (Compose) ≈ cubic-bezier(0.4, 0, 0.2, 1).
  function fastOutSlowIn(t) {
    // Closed-form-free sampling is overkill here; a smoothstep is visually
    // indistinguishable for a 450 ms opacity-of-amplitude ramp.
    return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  }

  // Build the `d` for one wave path at ripple phase + intensity.
  function buildD(s, cx, cy, phase, intensity) {
    var d = '', amp = AMP * intensity;
    for (var i = 0; i < WAVE.length; i += 2) {
      var ax = WAVE[i], ay = WAVE[i + 1] + amp * Math.sin(ax * SPATIAL - phase);
      var x = ((ax - 15) * s + cx).toFixed(2);
      var y = ((ay - 15) * s + cy).toFixed(2);
      d += (i === 0 ? 'M ' : ' L ') + x + ',' + y;
    }
    return d;
  }

  // The standalone brand mark (viewBox 18 18 72 72, like the favicon crop),
  // built from the SAME primitives as the app: gradient ring + black disc +
  // animated wave. `uid` keeps gradient ids unique per instance on a page.
  function brandSvg(uid) {
    var gid = 'oseRing_' + uid;
    return '<svg viewBox="18 18 72 72" aria-hidden="true" focusable="false" class="ose-brand">' +
      '<defs><linearGradient id="' + gid + '" x1="24" y1="54" x2="84" y2="54" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0%" stop-color="#4AA3FF"/><stop offset="50%" stop-color="#FFFFFF"/>' +
      '<stop offset="100%" stop-color="#FF8A2A"/></linearGradient></defs>' +
      '<circle cx="54" cy="54" r="30" fill="#0A0A0A"/>' +
      '<path d="M 24,54 A 30,30 0 0 1 84,54" fill="none" stroke="url(#' + gid + ')" stroke-width="5.5" stroke-linecap="round"/>' +
      '<path d="M 84,54 A 30,30 0 0 1 24,54" fill="none" stroke="url(#' + gid + ')" stroke-width="5.5" stroke-linecap="round"/>' +
      '<path data-ose-wave="2.5,54,54" d="M 29,54 L 79,54" fill="none" stroke="#FFFFFF" ' +
      'stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
  }

  // Swap every static logo <img> (nav + footer) for the live inline mark so
  // the menu logo is alive exactly like the app's. CSS already sizes both
  // `.nav-logo img` and `.nav-logo svg`, so the dimensions are preserved.
  var uid = 0;
  document.querySelectorAll('img[src$="ose-logo.svg"]').forEach(function (img) {
    var tpl = document.createElement('div');
    tpl.innerHTML = brandSvg(++uid);
    var svg = tpl.firstChild;
    if (img.getAttribute('alt')) svg.setAttribute('aria-label', img.getAttribute('alt'));
    img.parentNode.replaceChild(svg, img);
  });

  // Gather every wave path: the injected marks + the hero home-screen mock.
  var heroWave = document.querySelector('.anim-glowo-wave path');
  if (heroWave) heroWave.setAttribute('data-ose-wave', '0.775,14,14');

  var waves = [];
  document.querySelectorAll('[data-ose-wave]').forEach(function (p) {
    var cfg = p.getAttribute('data-ose-wave').split(',').map(Number);
    waves.push({ el: p, s: cfg[0], cx: cfg[1], cy: cfg[2] });
  });
  if (!waves.length) return;

  // Reduced motion → paint the static rest shape once, no rAF.
  if (reduce) {
    waves.forEach(function (w) { w.el.setAttribute('d', buildD(w.s, w.cx, w.cy, 0, 0)); });
    return;
  }

  var t0 = null;
  function frame(now) {
    if (t0 === null) t0 = now;
    var elapsed = (now - t0) / 1000;                 // seconds
    var phase = (elapsed * TEMPORAL) % (Math.PI * 2);
    var intensity = fastOutSlowIn(elapsed / 0.45);   // 450 ms ramp-in
    for (var i = 0; i < waves.length; i++) {
      var w = waves[i];
      w.el.setAttribute('d', buildD(w.s, w.cx, w.cy, phase, intensity));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* =========================================================================
   Tutorials - floating module switcher with scroll-spy. Runs only on the
   tutorials page (where .tut-modnav exists). Highlights the module you are
   currently in, tints the bar to its accent, and jumps with a header offset.
   ========================================================================= */
(function () {
  var nav = document.querySelector('.tut-modnav');
  if (!nav) return;
  var nowEl = nav.querySelector('[data-tut-now]');
  var chips = Array.prototype.slice.call(nav.querySelectorAll('[data-tut-chip]'));
  var sections = chips.map(function (c) {
    return document.getElementById('t-' + c.getAttribute('data-tut-chip'));
  });
  var OFFSET = 112; // height of site header + this bar

  function setActive(i) {
    chips.forEach(function (c, j) { c.classList.toggle('is-active', j === i); });
    var sec = sections[i];
    if (!sec) return;
    var kick = sec.querySelector('.tut-mod-kicker');
    if (nowEl && kick) nowEl.textContent = kick.textContent;
    var acc = getComputedStyle(sec).getPropertyValue('--tut-accent');
    if (acc) nav.style.setProperty('--tut-now-accent', acc.trim());
  }

  function onScroll() {
    var y = window.scrollY + OFFSET + 28;
    var idx = 0;
    for (var k = 0; k < sections.length; k++) {
      if (sections[k] && sections[k].offsetTop <= y) idx = k;
    }
    setActive(idx);
  }

  chips.forEach(function (c, i) {
    c.addEventListener('click', function (e) {
      var sec = sections[i];
      if (!sec) return;
      e.preventDefault();
      var top = sec.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();

/* =========================================================================
   Scroll-to-top button - added to every page. Appears once you have scrolled
   down, smooth-scrolls back to the top, and lifts above the cookie notice
   while that notice is on screen.
   ========================================================================= */
(function () {
  if (!document.body) return;
  var btn = document.createElement('button');
  btn.className = 'to-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Scroll back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var consent = document.querySelector('.ose-consent');
  function update() {
    if (window.scrollY > 420) btn.classList.add('is-visible');
    else btn.classList.remove('is-visible');
    var c = consent || document.querySelector('.ose-consent');
    var noteUp = !!(c && c.offsetHeight > 0 && getComputedStyle(c).display !== 'none');
    btn.classList.toggle('to-top--raised', noteUp);
  }
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();
