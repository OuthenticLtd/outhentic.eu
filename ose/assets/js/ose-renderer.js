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
    if (C.meta.appStoreUrl)  halves.push('<a href="' + C.meta.appStoreUrl + '" target="_blank" rel="noopener" aria-label="Download on the App Store">' + appleGlyph + '<span class="nav-cta-lbl">App Store</span></a>');
    if (C.meta.playStoreUrl) halves.push('<a href="' + C.meta.playStoreUrl + '" target="_blank" rel="noopener" aria-label="Get it on Google Play">' + playGlyph + '<span class="nav-cta-lbl">Google Play</span></a>');
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

  // -------- OSE home-tile artwork --------
  // A faithful port of the *Wide composables in
  // app/.../main_screen/MainScreenIconsAnimated.kt (2026-05-01 ambient pass),
  // drawn into a 156 x 96 box (a portrait phone tile's art area, in dp).
  // Geometry, alpha tiers and loop timings are the Kotlin values; the CSS
  // keyframes (ot*) live in ose-styles.css. Reduced motion freezes every
  // loop on its t = 0 frame, exactly like rememberAnimationsEnabled() = false.
  var oseTileArt = (function () {
    var W = 156, H = 96;
    var SINE = 'cubic-bezier(0.37,0,0.63,1)';      // half-sine ease (sin-modulated loops)
    var FOSI = 'cubic-bezier(0.4,0,0.2,1)';        // Compose FastOutSlowInEasing
    function f(v) { var s = (+v).toFixed(2).replace(/\.?0+$/, ''); return s === '-0' || s === '' ? '0' : s; }
    function sinval(t) { return (Math.sin(2 * Math.PI * t) + 1) / 2; }
    // Kotlin: value = (sin(2π((t - i·k) mod 1)) + 1) / 2 on a linear loop of
    // period T. CSS equivalent: min→max over T/2 with a half-sine ease,
    // alternating, phase-shifted per element.
    function sinAnim(name, T, k, i) {
      var d = (((0.75 + i * k) % 1) * T) - T;
      return name + ' ' + f(T / 2) + 's ' + SINE + ' ' + f(d) + 's infinite alternate';
    }
    function rect(x, y, w, h, r, extra) {
      return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(r) + '" ' + extra + '/>';
    }
    function sineD(phase) {
      var pts = [], steps = 64, mid = H * 0.5, amp = H * 0.40;
      for (var i = 0; i <= steps; i++) {
        var t = i / steps;
        pts.push(f(W * t) + ',' + f(mid + Math.sin(t * 4 * Math.PI + phase) * amp));
      }
      return 'M' + pts.join(' L');
    }
    var A = {
      // PlayKeysWide: 7 white keys + 5 sharps; one key at a time lerps 10 %
      // toward the accent, 14 s linear loop.
      play: function () {
        var keyW = W / 7, gap = keyW * 0.06, ww = keyW - gap, r = keyW * 0.10, o = '';
        for (var i = 0; i < 7; i++) {
          var x = i * keyW + gap / 2;
          o += rect(x, 0, ww, H, r, 'fill="#E8E8EC"');
          o += rect(x, 0, ww, H, r, 'fill="currentColor" opacity="0" style="animation:otPk 14s linear ' + f(i * 2 - 14) + 's infinite"');
        }
        var sw = keyW * 0.55, sh = H * 0.62, sr = keyW * 0.08;
        [0, 1, 3, 4, 5].forEach(function (idx) { o += rect((idx + 1) * keyW - sw / 2, 0, sw, sh, sr, 'fill="#0A0A0E"'); });
        return o;
      },
      // AudioWaveWide: 22 bars, slot 62 %, height 93-100 %, alpha .65-.73,
      // 12 s loop, 0.04 stagger.
      audio: function () {
        var base = [0.30,0.55,0.80,0.60,0.90,0.45,0.70,0.35,0.65,0.85,0.50,0.75,0.40,0.60,0.30,0.55,0.80,0.45,0.65,0.90,0.50,0.35];
        var slot = W / base.length, bw = slot * 0.62, o = '';
        base.forEach(function (b, i) {
          var mod0 = 0.93 + sinval(-i * 0.04) * 0.07;
          var h0 = Math.max(b * H * 0.93, 2), h1 = b * H, hs = Math.max(b * H * mod0, 2);
          var st = '--h0:' + f(h0) + 'px;--y0:' + f(H - h0) + 'px;--h1:' + f(h1) + 'px;--y1:' + f(H - h1) + 'px;' +
                   '--o0:' + f(0.65 + 0.93 * 0.08) + ';--o1:.73;animation:' + sinAnim('otGeo', 12, 0.04, i) + ',' + sinAnim('otOp', 12, 0.04, i);
          o += rect(i * slot + (slot - bw) / 2, H - hs, bw, hs, bw * 0.25, 'fill="currentColor" opacity="' + f(0.65 + mod0 * 0.08) + '" style="' + st + '"');
        });
        return o;
      },
      // MidiWide: 6 notes on 4 lanes, bar 58 % of a lane, alpha .70-.78,
      // 12 s loop, 0.12 stagger.
      midi: function () {
        var notes = [[0.02,0.16,1],[0.20,0.10,2],[0.32,0.18,0],[0.52,0.12,1],[0.66,0.18,3],[0.86,0.12,2]];
        var laneH = H / 4, bh = laneH * 0.58, o = '';
        notes.forEach(function (n, i) {
          var a0 = 0.70 + sinval(-i * 0.12) * 0.08;
          o += rect(n[0] * W, n[2] * laneH + (laneH - bh) / 2, n[1] * W, bh, bh * 0.32,
                    'fill="currentColor" opacity="' + f(a0) + '" style="--o0:.70;--o1:.78;animation:' + sinAnim('otOp', 12, 0.12, i) + '"');
        });
        return o;
      },
      // PracticeWide: rail .18, fill .55 grows to the playhead, end pillars
      // .85, playhead + 3.4x halo .32; 14 s linear sweep, restart.
      practice: function () {
        var mid = H * 0.5, rh = H * 0.18, rt = mid - rh / 2, rr = rh / 2;
        var o = rect(0, rt, W, rh, rr, 'fill="currentColor" opacity=".18"') +
                rect(0, rt, 0, rh, rr, 'fill="currentColor" opacity=".55" style="animation:otPrFill 14s linear infinite"');
        var mw = W * 0.014, mh = H * 0.74;
        [0, W - mw].forEach(function (mx) { o += rect(mx, mid - mh / 2, mw, mh, mw / 2, 'fill="currentColor" opacity=".85"'); });
        var pw = W * 0.022, ph = H * 0.88;
        return o + '<g style="animation:otPrHead 14s linear infinite">' +
          rect(-pw * 1.7, mid - ph / 2, pw * 3.4, ph, pw * 1.7, 'fill="currentColor" opacity=".32"') +
          rect(-pw / 2, mid - ph / 2, pw, ph, pw / 2, 'fill="currentColor"') + '</g>';
      },
      // MetronomeWide: 4 pillars, slot 32 %; idle h .50 @ .42, active
      // .70 -> .58 @ .62; 6 s linear loop, one beat per 1.5 s.
      metronome: function () {
        var slot = W / 4, bw = slot * 0.32, r = bw * 0.45, hA = H * 0.70, hI = H * 0.50, o = '';
        for (var i = 0; i < 4; i++) {
          var hs = i === 0 ? hA : hI;
          o += rect(i * slot + (slot - bw) / 2, H - hs, bw, hs, r,
                    'fill="currentColor" opacity="' + (i === 0 ? '.62' : '.42') + '" style="animation:otMw 6s linear ' + f(i * 1.5 - 6) + 's infinite"');
        }
        return o;
      },
      // TunerWide: rail .20, cent ticks at ±40/±20/0, needle + 3.2x halo
      // .28 drifting ±3 % on a 10 s FastOutSlowIn ping-pong.
      tuner: function () {
        var mid = H / 2, rh = H * 0.16;
        var o = rect(0, mid - rh / 2, W, rh, rh / 2, 'fill="currentColor" opacity=".20"');
        [-0.40, -0.20, 0, 0.20, 0.40].forEach(function (off) {
          var c = off === 0, th = H * (c ? 0.68 : 0.45), tw = W * (c ? 0.018 : 0.012), tx = W / 2 + off * W;
          o += rect(tx - tw / 2, mid - th / 2, tw, th, tw / 2, 'fill="currentColor" opacity="' + (c ? '.88' : '.40') + '"');
        });
        var nw = W * 0.024, nh = H * 0.88, nx = W / 2;
        return o + '<g style="animation:otTw 10s ' + FOSI + ' infinite alternate">' +
          rect(nx - nw * 1.6, mid - nh / 2, nw * 3.2, nh, nw * 1.6, 'fill="currentColor" opacity=".28"') +
          rect(nx - nw / 2, mid - nh / 2, nw, nh, nw / 2, 'fill="currentColor"') + '</g>';
      },
      // SignalGenWide: 2-cycle sine, amplitude 40 % h, halo 14 % h @ .25 +
      // core 6 % h; 13 s linear phase loop.
      'signal-generator': function () {
        var d = sineD(0), an = 'animation:otSg 13s linear infinite';
        return '<path d="' + d + '" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="' + f(H * 0.14) + '" stroke-linecap="round" stroke-linejoin="round" style="' + an + '"/>' +
               '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="' + f(H * 0.06) + '" stroke-linecap="round" stroke-linejoin="round" style="' + an + '"/>';
      },
      // MetersWide: 8 bars, slot 58 % @ .85, height 96-104 %, 9 s loop,
      // 0.18 stagger.
      meters: function () {
        var base = [0.55, 0.78, 0.92, 0.70, 0.85, 0.62, 0.74, 0.50];
        var slot = W / base.length, bw = slot * 0.58, o = '';
        base.forEach(function (b, i) {
          var h0 = b * H * 0.96, h1 = Math.min(b * H * 1.04, H - 2);
          var hs = Math.min(b * H * (0.96 + sinval(-i * 0.18) * 0.08), H - 2);
          o += rect(i * slot + (slot - bw) / 2, H - hs, bw, hs, bw * 0.18,
                    'fill="currentColor" opacity=".85" style="--h0:' + f(h0) + 'px;--y0:' + f(H - h0) + 'px;--h1:' + f(h1) + 'px;--y1:' + f(H - h1) + 'px;animation:' + sinAnim('otGeo', 9, 0.18, i) + '"');
        });
        return o;
      }
    };
    return function (id) { return A[id] ? A[id]() : ''; };
  })();

  // Fill any static art slot (the hero home-screen mock) from the same source.
  document.querySelectorAll('[data-ose-tile-art]').forEach(function (el) {
    el.innerHTML = oseTileArt(el.getAttribute('data-ose-tile-art'));
  });

  // -------- 8-module grid (landing) --------
  // The OSE home grid: MainScreenCardSlot tiles (MainScreenCard.kt) in the
  // app's reading order, each with its *Wide artwork above. Play is the
  // emphasised tile, as in MainScreen.kt.
  var gridHost = document.querySelector('[data-ose-module-grid]');
  if (gridHost && Array.isArray(C.modules)) {
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
    gridHost.innerHTML = C.modules.map(function (m, i) {
      var emph = m.id === 'play' ? ' is-emphasized' : '';
      var cls  = classMap[m.id] || '';
      var href = fixHref('modules/' + m.id + '.html');
      var name = m.shortName || m.name;
      return (
        '<a class="module-card ' + cls + emph + '" href="' + href + '" style="--i:' + i + '">' +
        '<div class="mc-head">' +
          '<div class="mc-name">' + name + '</div>' +
          '<div class="mc-sub">' + (m.tile_role || '') + '</div>' +
        '</div>' +
        '<div class="mc-viz"><svg viewBox="0 0 156 96" aria-hidden="true" focusable="false">' + oseTileArt(m.id) + '</svg></div>' +
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
