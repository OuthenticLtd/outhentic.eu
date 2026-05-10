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
  var gridHost = document.querySelector('[data-ose-module-grid]');
  if (gridHost && Array.isArray(C.modules)) {
    var icons = {
      "play":             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 4 20 12 6 20 6 4"/></svg>',
      "audio":            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="3" y2="12"/><line x1="6" y1="9" x2="6" y2="15"/><line x1="9" y1="6" x2="9" y2="18"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="15" y1="6" x2="15" y2="18"/><line x1="18" y1="9" x2="18" y2="15"/><line x1="21" y1="12" x2="21" y2="12"/></svg>',
      "midi":             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><line x1="7" y1="6" x2="7" y2="14"/><line x1="11" y1="6" x2="11" y2="14"/><line x1="15" y1="6" x2="15" y2="14"/><line x1="19" y1="6" x2="19" y2="14"/></svg>',
      "practice":         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>',
      "metronome":        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21 L12 3 L17 21 Z"/><line x1="12" y1="3" x2="17" y2="14"/></svg>',
      "tuner":            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16 A9 9 0 0 1 21 16"/><line x1="12" y1="16" x2="14" y2="6"/><circle cx="12" cy="16" r="1.4" fill="currentColor"/></svg>',
      "signal-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 Q 6 4 9 12 T 15 12 T 21 12"/></svg>',
      "meters":           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3"  y="14" width="3" height="6"/><rect x="8"  y="10" width="3" height="10"/><rect x="13" y="6"  width="3" height="14"/><rect x="18" y="12" width="3" height="8"/></svg>'
    };
    gridHost.innerHTML = C.modules.map(function (m) {
      var emph = m.id === 'play' ? ' is-emphasized' : '';
      var href = fixHref('modules/' + m.id + '.html');
      return (
        '<a class="module-card' + emph + '" href="' + href + '">' +
        '<span class="mc-icon">' + (icons[m.id] || '') + '</span>' +
        '<div>' +
        '<div class="mc-name">' + (m.shortName || m.name) + '</div>' +
        '<div class="mc-sub">' + (m.tile_role || '') + '</div>' +
        '</div>' +
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
    titleEl.textContent = (get('meta.siteName') || 'OSE') + ' — ' + (get('meta.tagline') || '');
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

  // -------- year auto-fill in footer --------
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
