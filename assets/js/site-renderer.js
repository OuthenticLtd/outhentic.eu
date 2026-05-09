/* Outhentic — site renderer.
   Reads window.OUTHENTIC_SITE and patches the DOM:
   - Main nav (relabel + reorder cross-page items)
   - Hero (image, eyebrow, title, lead, button, mobile focal-point, meta strip)
   - Members grid (group + foundation)
   - Gallery grid
   - Footer social URLs + contact email
   The hardcoded HTML is the fallback if site-data.js isn't loaded. */
(function () {
  if (!window.OUTHENTIC_SITE) return;
  var data = window.OUTHENTIC_SITE;

  var lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('bg') ? 'bg' : 'en';
  var inBg = location.pathname.indexOf('/bg/') !== -1;

  function pick(obj, key) { return obj[key + '_' + lang] || obj[key + '_en'] || obj[key] || ''; }
  function pickList(obj, key) {
    var v = obj[key + '_' + lang];
    if (!v || !v.length) v = obj[key + '_en'] || obj[key] || [];
    return Array.isArray(v) ? v : [];
  }
  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fixPath(p) {
    if (!p) return p;
    if (/^(https?:|\.\.|\/|#|mailto:)/.test(p)) return p;
    return inBg ? '../' + p : p;
  }

  /* ----- Main nav: rebuild per-page menu from site-data ----- */
  // <body data-nav-page="group|foundation|news"> tells us which menu to use.
  // Backward-compat: if data.nav is still an array (old format), treat it as a
  // single shared menu applied to every page.
  if (data.nav) {
    var pageKey = (document.body && document.body.getAttribute('data-nav-page')) || '';
    var items = null;
    if (Array.isArray(data.nav)) {
      items = data.nav; // old format
    } else if (pageKey && Array.isArray(data.nav[pageKey])) {
      items = data.nav[pageKey];
    }

    if (items && items.length) {
      document.querySelectorAll('.nav-links').forEach(function (navEl) {
        // Remove every existing <a> in the menu (keep .lang-toggle)
        Array.prototype.slice.call(navEl.children).forEach(function (child) {
          if (child.tagName === 'A') navEl.removeChild(child);
        });
        var langToggle = navEl.querySelector('.lang-toggle');
        items.forEach(function (item) {
          var a = document.createElement('a');
          var href = item.href || '';
          if (href.charAt(0) !== '#' && !/^(https?:|\.\.|\/|mailto:)/.test(href)) {
            href = fixPath(href);
          }
          a.setAttribute('href', href);
          a.textContent = pick(item, 'label');
          if (langToggle) navEl.insertBefore(a, langToggle);
          else navEl.appendChild(a);
        });
      });
    }
  }

  /* ----- Hero ----- */
  document.querySelectorAll('[data-hero]').forEach(function (section) {
    var key = section.getAttribute('data-hero');
    if (!data.hero || !data.hero[key]) return;
    var h = data.hero[key];

    var img = section.querySelector('.hero-img');
    if (img) {
      if (h.image) img.setAttribute('src', fixPath(h.image));
      var alt = pick(h, 'image_alt');
      if (alt) img.setAttribute('alt', alt);
    }

    // If h.images is an array of 2+ paths, build a fading slideshow.
    // Each image stays visible 5s; total cycle = 5s × N. CSS @keyframes handle the fade.
    if (Array.isArray(h.images) && h.images.length > 1) {
      section.classList.add('hero-slider');
      var altText = pick(h, 'image_alt');
      // Wipe and rebuild the .hero-img stack
      Array.prototype.slice.call(section.querySelectorAll('.hero-img')).forEach(function (el) {
        if (el !== img) el.parentNode.removeChild(el);
      });
      // Make sure base .hero-img has the first image
      if (img) img.setAttribute('src', fixPath(h.images[0]));
      // Append the rest right after the first <img>
      for (var i = 1; i < h.images.length; i++) {
        var n = document.createElement('img');
        n.className = 'hero-img';
        n.setAttribute('src', fixPath(h.images[i]));
        n.setAttribute('alt', altText || '');
        n.setAttribute('loading', 'lazy');
        if (img) img.parentNode.insertBefore(n, img.nextSibling);
        else section.insertBefore(n, section.firstChild);
      }
      // Set CSS variables so the @keyframes timing scales with image count
      var n = h.images.length;
      var totalSec = n * 5;
      section.style.setProperty('--hero-cycle', totalSec + 's');
      section.style.setProperty('--hero-count', n);
      // Stagger each image's animation-delay by 5s
      Array.prototype.slice.call(section.querySelectorAll('.hero-img')).forEach(function (el, idx) {
        el.style.animationDelay = (idx * 5) + 's';
      });
    }

    if (h.mobile_focus) {
      section.style.setProperty('--hero-mobile-focus', h.mobile_focus);
    }

    var inner = section.querySelector('.hero-inner');
    if (!inner) return;

    var eyebrow = inner.querySelector('.eyebrow');
    var eyebrowText = pick(h, 'eyebrow');
    if (eyebrowText) {
      if (!eyebrow) {
        eyebrow = document.createElement('span');
        eyebrow.className = 'eyebrow';
        inner.insertBefore(eyebrow, inner.firstChild);
      }
      eyebrow.textContent = eyebrowText;
      eyebrow.style.display = '';
    } else if (eyebrow) {
      eyebrow.style.display = 'none';
    }

    var title = inner.querySelector('h1');
    var titleHtml = pick(h, 'title');
    if (title && titleHtml) title.innerHTML = titleHtml;

    var lead = inner.querySelector('.lead');
    var leadText = pick(h, 'lead');
    if (lead && leadText) lead.innerHTML = escape(leadText).replace(/\n+/g, '<br>');

    var btn = inner.querySelector('a.btn');
    var btnText = pick(h, 'button');
    if (btn) {
      if (h.button_href) btn.setAttribute('href', h.button_href);
      if (btnText) {
        var arrow = btn.querySelector('.arrow');
        btn.textContent = btnText + ' ';
        if (arrow) {
          btn.appendChild(document.createTextNode(' '));
          btn.appendChild(arrow);
        } else {
          var ar = document.createElement('span');
          ar.className = 'arrow';
          ar.textContent = '→';
          btn.appendChild(ar);
        }
      }
    }

    var meta = inner.querySelector('.hero-meta');
    var metaList = pickList(h, 'meta');
    if (meta) {
      if (metaList.length) {
        meta.innerHTML = metaList.map(function (m) { return '<span>' + escape(m) + '</span>'; }).join('');
        meta.style.display = '';
      } else {
        meta.style.display = 'none';
      }
    }
  });

  /* ----- Members grid ----- */
  function renderMembers(container, members, cols) {
    if (!container || !members || !members.length) return;
    var html = members.map(function (m) {
      var photo = fixPath(m.photo);
      var photoHtml = photo
        ? '<img src="' + escape(photo) + '" alt="' + escape(pick(m,'name')) + '" loading="lazy"/>'
        : '<svg viewBox="0 0 200 200" width="60%" height="60%" aria-hidden="true">' +
            '<circle cx="100" cy="100" r="80" fill="none" stroke="#B8893E" stroke-width="3"/>' +
            '<polygon points="100,55 145,135 55,135" fill="#B8893E" opacity="0.85"/></svg>';
      return '<article class="member">' +
        '<figure class="member-photo"' + (photo ? '' : ' style="background:var(--bg-alt); display:flex; align-items:center; justify-content:center;"') + '>' +
          photoHtml +
        '</figure>' +
        '<h3 class="member-name">' + escape(pick(m,'name')) + '</h3>' +
        '<div class="member-role">' + escape(pick(m,'role')) + '</div>' +
        '<p class="member-bio">' + escape(pick(m,'bio')) + '</p>' +
      '</article>';
    }).join('');
    container.className = 'members cols-' + cols;
    container.innerHTML = html;
  }
  document.querySelectorAll('[data-render="group-members"]').forEach(function (el) {
    renderMembers(el, data.groupMembers, 4);
  });
  document.querySelectorAll('[data-render="foundation-members"]').forEach(function (el) {
    renderMembers(el, data.foundationMembers, 3);
  });

  /* ----- Gallery grid ----- */
  document.querySelectorAll('[data-render="gallery"]').forEach(function (el) {
    if (!data.gallery || !data.gallery.length) return;
    el.innerHTML = data.gallery.map(function (g) {
      var src = fixPath(g.src);
      var alt = pick(g, 'alt');
      return '<a class="lightbox-trigger" href="' + escape(src) + '">' +
        '<img src="' + escape(src) + '" alt="' + escape(alt) + '" loading="lazy"/>' +
      '</a>';
    }).join('');
  });

  /* ----- Footer social URLs ----- */
  if (data.social) {
    document.querySelectorAll('a[href*="facebook.com/outhentic"]').forEach(function (a) {
      if (data.social.facebook) a.href = data.social.facebook;
    });
    document.querySelectorAll('a[href*="instagram.com/outhentic"]').forEach(function (a) {
      if (data.social.instagram) a.href = data.social.instagram;
    });
    document.querySelectorAll('a[href*="youtube.com/@Outhentic"], a[href*="youtube.com/@outhentic"]').forEach(function (a) {
      if (data.social.youtube) a.href = data.social.youtube;
    });
  }

  /* ----- Contact email + address ----- */
  if (data.contact) {
    if (data.contact.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
        a.href = 'mailto:' + data.contact.email;
        if (a.textContent.indexOf('@') !== -1) a.textContent = data.contact.email;
      });
    }
    var addr = pick(data.contact, 'address');
    if (addr) {
      document.querySelectorAll('[data-render="address"]').forEach(function (el) {
        el.textContent = addr;
      });
    }
  }
})();
