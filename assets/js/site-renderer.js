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

  /* ----- Main nav: relabel + reorder cross-page items ----- */
  if (Array.isArray(data.nav) && data.nav.length) {
    var navMap = {};
    data.nav.forEach(function (item) { if (item && item.id) navMap[item.id] = item; });

    document.querySelectorAll('.nav-links').forEach(function (navEl) {
      var keyed = Array.prototype.slice.call(navEl.querySelectorAll('a[data-nav-key]'));
      if (!keyed.length) return;

      keyed.forEach(function (a) {
        var item = navMap[a.dataset.navKey];
        if (!item) return;
        a.textContent = pick(item, 'label');
        if (item.href) a.setAttribute('href', fixPath(item.href));
      });

      var sorted = data.nav
        .map(function (item) { return keyed.find(function (a) { return a.dataset.navKey === item.id; }); })
        .filter(Boolean);
      sorted.forEach(function (a) { a.remove(); });
      var langToggle = navEl.querySelector('.lang-toggle');
      sorted.forEach(function (a) {
        if (langToggle) navEl.insertBefore(a, langToggle);
        else navEl.appendChild(a);
      });
    });
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
