/* =========================================================
   OSE site renderer
   Reads window.OSE_CONTENT (loaded from /ose/assets/data/ose-content.js)
   and fills any element with a data-ose attribute.
   Mirrors the parent site's render-on-load pattern.
   ========================================================= */
(function () {
  if (!window.OSE_CONTENT) {
    console.warn('[ose] content data missing');
    return;
  }
  var C = window.OSE_CONTENT;

  // ────────────────────────────────────────────────────────────────────
  // CTA resolution - pick the effective primary-CTA URL and label based
  // on the meta.released flag. When NOT released (default), the CTA
  // points at meta.waitlistUrl with label "Join the waitlist". When
  // released, it switches to meta.playStoreUrl with "Get it on Google
  // Play". The user toggles this from the editor without having to edit
  // any HTML.
  // ────────────────────────────────────────────────────────────────────
  if (C.meta && C.hero) {
    var isReleased = C.meta.released === true;
    if (isReleased) {
      C.hero.ctaPrimaryHref  = C.meta.playStoreUrl || '#';
      C.hero.ctaPrimaryPre   = 'Get it on';
      C.hero.ctaPrimaryLabel = 'Google Play';
    } else {
      C.hero.ctaPrimaryHref  = C.meta.waitlistUrl || '#';
      C.hero.ctaPrimaryPre   = 'Coming soon';
      C.hero.ctaPrimaryLabel = 'Join the waitlist';
    }
  }

  // Resolve a dotted path like "hero.title_a" or "modules.0.name"
  function get(path) {
    var parts = path.split('.');
    var cur = C;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return '';
      cur = cur[parts[i]];
    }
    return cur == null ? '' : cur;
  }

  // Find a module entry by id
  function moduleById(id) {
    if (!Array.isArray(C.modules)) return null;
    for (var i = 0; i < C.modules.length; i++) if (C.modules[i].id === id) return C.modules[i];
    return null;
  }

  function setText(el, text) { el.textContent = text == null ? '' : String(text); }
  function setHtml(el, html) { el.innerHTML  = html == null ? '' : String(html); }

  // Path prefix: pages inside /ose/modules/ need ../ in front of relative links
  // declared in ose-content.js (which are relative to /ose/ root).
  var inModulesDir = document.body && document.body.getAttribute('data-module-id');
  function fixHref(h) {
    if (!h) return '#';
    if (h.startsWith('http') || h.startsWith('mailto:') || h.startsWith('#') || h.startsWith('/')) return h;
    return inModulesDir ? '../' + h : h;
  }

  // -------- text/html bindings --------
  document.querySelectorAll('[data-ose]').forEach(function (el) {
    var path = el.getAttribute('data-ose');
    var val = get(path);
    if (el.hasAttribute('data-ose-html')) setHtml(el, val);
    else setText(el, val);
  });

  // -------- href bindings --------
  document.querySelectorAll('[data-ose-href]').forEach(function (el) {
    el.setAttribute('href', get(el.getAttribute('data-ose-href')) || '#');
  });

  // -------- src/alt bindings --------
  document.querySelectorAll('[data-ose-src]').forEach(function (el) {
    el.setAttribute('src', get(el.getAttribute('data-ose-src')));
  });

  // -------- module-page binding --------
  // Any element with data-ose-module="<field>" reads modules[id == data-module-id].<field>
  var pageModuleId = (document.body && document.body.getAttribute('data-module-id')) || '';
  if (pageModuleId) {
    var mod = moduleById(pageModuleId);
    if (mod) {
      document.querySelectorAll('[data-ose-module]').forEach(function (el) {
        var field = el.getAttribute('data-ose-module');
        var val = mod[field];
        if (el.hasAttribute('data-ose-html')) setHtml(el, val);
        else setText(el, val);
      });
    }
  }

  // -------- nav links --------
  var navHost = document.querySelector('[data-ose-nav]');
  if (navHost && Array.isArray(C.nav)) {
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    navHost.innerHTML = C.nav.map(function (n) {
      var active = (n.href || '').toLowerCase() === here ? ' is-active' : '';
      return '<a href="' + fixHref(n.href) + '" class="' + active.trim() + '">' + n.label + '</a>';
    }).join('');
  }

  // Persistent "Get the app" CTA on EVERY page's nav (the landing page builds
  // its nav from [data-ose-nav]; module/doc pages have a static .nav-links).
  // Now that OSE ships on both stores it's a split pill: App Store on the left,
  // Google Play on the right, one shape divided in two. Idempotent, and each
  // half only renders if that store URL exists. Only shows once released.
  if (C.meta && C.meta.released === true && (C.meta.appStoreUrl || C.meta.playStoreUrl)) {
    var appleGlyph = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>';
    var playGlyph  = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 2.5v19a1 1 0 0 0 1.5.87l16-9.5a1 1 0 0 0 0-1.74l-16-9.5A1 1 0 0 0 4 2.5z"/></svg>';
    var halves = [];
    if (C.meta.appStoreUrl)  halves.push('<a href="' + C.meta.appStoreUrl + '" target="_blank" rel="noopener" aria-label="Download on the App Store" title="Download on the App Store">' + appleGlyph + '</a>');
    if (C.meta.playStoreUrl) halves.push('<a href="' + C.meta.playStoreUrl + '" target="_blank" rel="noopener" aria-label="Get it on Google Play" title="Get it on Google Play">' + playGlyph + '</a>');
    var navCtaHtml = '<span class="nav-cta nav-cta--split" role="group" aria-label="Get the app">' + halves.join('') + '</span>';
    document.querySelectorAll('.nav-links').forEach(function (nl) {
      if (!nl.querySelector('.nav-cta')) {
        nl.insertAdjacentHTML('beforeend', navCtaHtml);
      }
    });
  }

  // -------- footer columns --------
  var footHost = document.querySelector('[data-ose-foot-cols]');
  if (footHost && C.footer && Array.isArray(C.footer.columns)) {
    footHost.innerHTML = C.footer.columns.map(function (col) {
      return (
        '<div>' +
        '<h4>' + col.title + '</h4>' +
        col.links.map(function (l) {
          return '<a href="' + fixHref(l.href) + '">' + l.label + '</a>';
        }).join('') +
        '</div>'
      );
    }).join('');
  }

  // -------- 8-module grid (landing) --------
  // Each card mirrors the corresponding *Wide composable in
  // app/.../main_screen/MainScreenIconsAnimated.kt.
  var gridHost = document.querySelector('[data-ose-module-grid]');
  if (gridHost && Array.isArray(C.modules)) {
    // ---- PlayKeysWide: 7 white keys + 5 sharps, accent tint cycles L→R ----
    function vizPlay() {
      var whites = '';
      var tints = '';
      for (var i = 0; i < 7; i++) {
        var x = i * 100 + 3;
        whites += '<rect x="' + x + '" y="0" width="94" height="200" rx="10" fill="#E8E8EC"/>';
        tints  += '<rect x="' + x + '" y="0" width="94" height="200" rx="10" fill="currentColor" class="mcw-play-tint mcw-play-tint-' + i + '" opacity="0"/>';
      }
      var sharpAfter = [0, 1, 3, 4, 5];
      var sharps = '';
      sharpAfter.forEach(function (idx) {
        var cx = (idx + 1) * 100;
        sharps += '<rect x="' + (cx - 27) + '" y="0" width="55" height="124" rx="8" fill="#0A0A0E"/>';
      });
      return '<svg viewBox="0 0 700 200" preserveAspectRatio="none">' +
             '<g>' + whites + '</g>' +
             '<g>' + tints + '</g>' +
             '<g>' + sharps + '</g>' +
             '</svg>';
    }
    // ---- AudioWaveWide: 22 vertical bars, pre-baked heights ----
    function vizAudio() {
      var heights = [0.30,0.55,0.80,0.60,0.90,0.45,0.70,0.35,0.65,0.85,0.50,0.75,0.40,0.60,0.30,0.55,0.80,0.45,0.65,0.90,0.50,0.35];
      var slot = 700 / heights.length;
      var barW = slot * 0.62;
      var H = 200;
      var bars = '';
      for (var i = 0; i < heights.length; i++) {
        var barH = heights[i] * H;
        var x = i * slot + (slot - barW) / 2;
        var y = H - barH;
        bars += '<rect class="mcw-audio-bar" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + barH.toFixed(1) + '" rx="' + (barW * 0.25).toFixed(1) + '" fill="currentColor"/>';
      }
      return '<svg viewBox="0 0 700 200" preserveAspectRatio="none">' + bars + '</svg>';
    }
    // ---- MidiWide: 6 note bars across 4 lanes ----
    function vizMidi() {
      var notes = [
        [0.02, 0.16, 1, 'mcw-midi-1'],
        [0.20, 0.10, 2, 'mcw-midi-2'],
        [0.32, 0.18, 0, 'mcw-midi-3'],
        [0.52, 0.12, 1, 'mcw-midi-4'],
        [0.66, 0.18, 3, 'mcw-midi-5'],
        [0.86, 0.12, 2, 'mcw-midi-6']
      ];
      var W = 700, H = 200;
      var laneH = H / 4;
      var barH  = laneH * 0.58;
      var bars = '';
      notes.forEach(function (n) {
        var x = n[0] * W;
        var w = n[1] * W;
        var y = n[2] * laneH + (laneH - barH) / 2;
        bars += '<rect class="' + n[3] + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + barH.toFixed(1) + '" rx="' + (barH * 0.32).toFixed(1) + '" fill="currentColor"/>';
      });
      return '<svg viewBox="0 0 700 200" preserveAspectRatio="none">' + bars + '</svg>';
    }
    // ---- PracticeWide: rail with growing fill + sweeping playhead ----
    function vizPractice() {
      var W = 700, H = 200;
      var midY = H * 0.5;
      var railH = H * 0.18;
      var railTop = midY - railH / 2;
      var markW = W * 0.014;
      var markH = H * 0.74;
      var phW = W * 0.022;
      var phH = H * 0.88;
      return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
        // Background rail
        '<rect x="0" y="' + railTop + '" width="' + W + '" height="' + railH + '" rx="' + (railH/2) + '" fill="currentColor" opacity="0.18"/>' +
        // Filled portion (animates scaleX)
        '<rect class="mcw-practice-fill" x="0" y="' + railTop + '" width="' + W + '" height="' + railH + '" rx="' + (railH/2) + '" fill="currentColor" opacity="0.55"/>' +
        // Loop start pillar
        '<rect x="0" y="' + (midY - markH/2) + '" width="' + markW + '" height="' + markH + '" rx="' + (markW/2) + '" fill="currentColor" opacity="0.85"/>' +
        // Loop end pillar
        '<rect x="' + (W - markW) + '" y="' + (midY - markH/2) + '" width="' + markW + '" height="' + markH + '" rx="' + (markW/2) + '" fill="currentColor" opacity="0.85"/>' +
        // Playhead (sweeps L→R)
        '<g class="mcw-practice-head">' +
          '<rect x="' + (-phW * 1.7) + '" y="' + (midY - phH/2) + '" width="' + (phW * 3.4) + '" height="' + phH + '" rx="' + (phW * 1.7) + '" fill="currentColor" opacity="0.32"/>' +
          '<rect x="' + (-phW/2) + '" y="' + (midY - phH/2) + '" width="' + phW + '" height="' + phH + '" rx="' + (phW/2) + '" fill="currentColor"/>' +
        '</g>' +
        '</svg>';
    }
    // ---- MetronomeWide: 4 pillars with one active at a time ----
    function vizMetronome() {
      var W = 700, H = 200;
      var slot = W / 4;
      var barW = slot * 0.32;
      var barH = H * 0.50;
      var bars = '';
      for (var i = 0; i < 4; i++) {
        var x = i * slot + (slot - barW) / 2;
        var y = H - barH;
        bars += '<rect class="mcw-met-' + (i + 1) + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + barH.toFixed(1) + '" rx="' + (barW * 0.45).toFixed(1) + '" fill="currentColor"/>';
      }
      return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + bars + '</svg>';
    }
    // ---- TunerWide: pitch ribbon, 5 cent ticks, drifting needle ----
    function vizTuner() {
      var W = 700, H = 200;
      var midY = H * 0.5;
      var railH = H * 0.16;
      var railTop = midY - railH / 2;
      var centerX = W / 2;
      var ticks = '';
      [-0.40, -0.20, 0, 0.20, 0.40].forEach(function (off) {
        var isCenter = off === 0;
        var tx = centerX + off * W;
        var tickH = isCenter ? H * 0.68 : H * 0.45;
        var tickW = isCenter ? W * 0.018 : W * 0.012;
        ticks += '<rect x="' + (tx - tickW/2).toFixed(1) + '" y="' + (midY - tickH/2).toFixed(1) + '" width="' + tickW.toFixed(2) + '" height="' + tickH.toFixed(1) + '" rx="' + (tickW/2).toFixed(2) + '" fill="currentColor" opacity="' + (isCenter ? 0.88 : 0.40) + '"/>';
      });
      var needleW = W * 0.024;
      var needleH = H * 0.88;
      return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
        // Soft full-width rail
        '<rect x="0" y="' + railTop + '" width="' + W + '" height="' + railH + '" rx="' + (railH/2) + '" fill="currentColor" opacity="0.20"/>' +
        // Cent ticks
        ticks +
        // Needle (drifts ±3% - translateX animates the group)
        '<g class="mcw-tuner-needle">' +
          '<rect x="' + (centerX - needleW * 1.6).toFixed(1) + '" y="' + (midY - needleH/2).toFixed(1) + '" width="' + (needleW * 3.2).toFixed(1) + '" height="' + needleH.toFixed(1) + '" rx="' + (needleW * 1.6).toFixed(1) + '" fill="currentColor" opacity="0.28"/>' +
          '<rect x="' + (centerX - needleW/2).toFixed(1) + '" y="' + (midY - needleH/2).toFixed(1) + '" width="' + needleW.toFixed(1) + '" height="' + needleH.toFixed(1) + '" rx="' + (needleW/2).toFixed(1) + '" fill="currentColor"/>' +
        '</g>' +
        '</svg>';
    }
    // ---- SignalGenWide: scrolling sine wave with halo ----
    function vizSignalGen() {
      var W = 700, H = 200;
      var midY = H * 0.5;
      var amp  = H * 0.40;
      var d = 'M 0 ' + midY;
      var steps = 80;
      for (var i = 1; i <= steps; i++) {
        var t = i / steps;
        var x = t * (W + 100);
        var y = midY + Math.sin(t * 4 * Math.PI) * amp;
        d += ' L ' + x.toFixed(1) + ' ' + y.toFixed(2);
      }
      return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="overflow:hidden;">' +
        '<g class="mcw-sine">' +
          '<path d="' + d + '" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="' + (H * 0.14) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="' + (H * 0.06) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</g>' +
        '</svg>';
    }
    // ---- MetersWide: 8 vertical FFT bars ----
    function vizMeters() {
      var heights = [0.55, 0.78, 0.92, 0.70, 0.85, 0.62, 0.74, 0.50];
      var W = 700, H = 200;
      var slot = W / heights.length;
      var barW = slot * 0.58;
      var bars = '';
      for (var i = 0; i < heights.length; i++) {
        var barH = heights[i] * H;
        var x = i * slot + (slot - barW) / 2;
        var y = H - barH;
        bars += '<rect class="mcw-meter-' + (i + 1) + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + barH.toFixed(1) + '" rx="' + (barW * 0.18).toFixed(1) + '" fill="currentColor" opacity="0.85"/>';
      }
      return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + bars + '</svg>';
    }
    var vizFns = {
      'play': vizPlay,
      'audio': vizAudio,
      'midi': vizMidi,
      'practice': vizPractice,
      'metronome': vizMetronome,
      'tuner': vizTuner,
      'signal-generator': vizSignalGen,
      'meters': vizMeters
    };
    var classMap = {
      'play': 'mc--play',
      'audio': 'mc--audio',
      'midi': 'mc--midi',
      'practice': 'mc--practice',
      'metronome': 'mc--metronome',
      'tuner': 'mc--tuner',
      'signal-generator': 'mc--signalgen',
      'meters': 'mc--meters'
    };
    gridHost.innerHTML = C.modules.map(function (m) {
      var emph = m.id === 'play' ? ' is-emphasized' : '';
      var cls  = classMap[m.id] || '';
      var href = fixHref('modules/' + m.id + '.html');
      var viz  = (vizFns[m.id] || function () { return ''; })();
      return (
        '<a class="module-card ' + cls + emph + '" href="' + href + '">' +
        '<div class="mc-head">' +
          '<div class="mc-name">' + (m.shortName || m.name) + '</div>' +
          '<div class="mc-sub">' + (m.tile_role || '') + '</div>' +
        '</div>' +
        '<div class="mc-viz">' + viz + '</div>' +
        '</a>'
      );
    }).join('');
  }

  // -------- highlights row --------
  var hlHost = document.querySelector('[data-ose-highlights]');
  if (hlHost && Array.isArray(C.highlights)) {
    hlHost.innerHTML = C.highlights.map(function (h) {
      return (
        '<div class="hub-card">' +
        '<h3>' + h.title + '</h3>' +
        '<p>' + h.body + '</p>' +
        '</div>'
      );
    }).join('');
  }

  // -------- tutorials list --------
  var tutHost = document.querySelector('[data-ose-tutorials]');
  if (tutHost && Array.isArray(C.tutorials)) {
    tutHost.innerHTML = C.tutorials.map(function (t) {
      var stepsHtml = (t.steps || []).map(function (s) {
        return '<div class="step"><div><h3>' + s.h + '</h3><p>' + s.p + '</p></div></div>';
      }).join('');
      return (
        '<article class="hub-card" id="' + t.id + '" style="margin-bottom:24px;">' +
        '<div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:6px;">' +
        '<h2 style="margin:0;font-size:clamp(1.4rem,2.4vw,2rem);">' + t.title + '</h2>' +
        '<span class="tag tag--muted">' + (t.duration || '') + '</span>' +
        '</div>' +
        '<p style="margin-bottom:22px;">' + t.intro + '</p>' +
        '<div class="steps">' + stepsHtml + '</div>' +
        '</article>'
      );
    }).join('');
  }

  // -------- FAQ list --------
  var faqHost = document.querySelector('[data-ose-faq]');
  if (faqHost && Array.isArray(C.faq)) {
    faqHost.innerHTML = C.faq.map(function (f) {
      return (
        '<details class="hub-card" style="margin-bottom:12px;padding:18px 22px;">' +
        '<summary style="cursor:pointer;font-weight:600;color:var(--ink);list-style:none;display:flex;justify-content:space-between;align-items:center;gap:14px;">' +
        '<span>' + f.q + '</span>' +
        '<span style="color:var(--accent-orange);font-size:1.4rem;line-height:1;">+</span>' +
        '</summary>' +
        '<div style="padding-top:14px;color:var(--ink-soft);">' + f.a + '</div>' +
        '</details>'
      );
    }).join('');
  }

  // -------- meta tags / title --------
  var titleEl = document.querySelector('[data-ose-title]');
  if (titleEl) {
    titleEl.textContent = (get('meta.siteName') || 'OSE') + ' - ' + (get('meta.tagline') || '');
  }

  // -------- module list (manual page) --------
  var manualHost = document.querySelector('[data-ose-manual-modules]');
  if (manualHost && Array.isArray(C.modules)) {
    manualHost.innerHTML = C.modules.map(function (m) {
      var href = fixHref('modules/' + m.id + '.html');
      return (
        '<a class="hub-card" href="' + href + '" style="display:block;">' +
        '<h3 style="margin:0 0 6px;">' + m.name + '</h3>' +
        '<p style="margin:0;">' + m.tagline + '</p>' +
        '</a>'
      );
    }).join('');
  }

  // -------- legal page bodies --------
  var pri = document.querySelector('[data-ose-privacy]');
  if (pri) pri.innerHTML = C.privacy_html || '';
  var ter = document.querySelector('[data-ose-terms]');
  if (ter) ter.innerHTML = C.terms_html || '';
  var coo = document.querySelector('[data-ose-cookies]');
  if (coo) coo.innerHTML = C.cookies_html || '';
  var leg = document.querySelector('[data-ose-legal-notice]');
  if (leg) leg.innerHTML = C.legal_notice_html || '';
  var acc = document.querySelector('[data-ose-accessibility]');
  if (acc) acc.innerHTML = C.accessibility_html || '';

  // -------- year auto-fill in footer --------
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
