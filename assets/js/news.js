/* Outhentic — render news posts dynamically.
   Reads from window.OUTHENTIC_NEWS (loaded via posts.js).
   Falls back to fetch(posts.json) for HTTP setups that prefer it. */
(function () {
  var grid = document.getElementById('news-grid');
  if (!grid) return;

  var lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('bg') ? 'bg' : 'en';
  var inBg = location.pathname.indexOf('/bg/') !== -1;

  var I18N = {
    en: { empty: 'No news posts to show right now. Check back soon.',
          error: 'Sorry — could not load the latest news right now.',
          read:  'Continue reading' },
    bg: { empty: 'Все още няма новини. Върнете се скоро.',
          error: 'Съжаляваме — в момента не можем да заредим новините.',
          read:  'Прочетете още' }
  };
  var t = I18N[lang];

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    var monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var monthsBg = ['януари','февруари','март','април','май','юни','юли','август','септември','октомври','ноември','декември'];
    var months = lang === 'bg' ? monthsBg : monthsEn;
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function pick(p, key) {
    return p[key + '_' + lang] || p[key + '_en'] || p[key] || '';
  }

  function renderCard(p) {
    var date = escape(p.date || '');
    var cat = escape(pick(p, 'category'));
    var title = escape(pick(p, 'title'));
    var img = p.image || 'assets/img/logo-mark.png';
    if (inBg && img && !/^(https?:|\.\.|\/)/.test(img)) img = '../' + img;
    img = escape(img);
    var excerpt = escape(pick(p, 'excerpt'));
    var slug = p.slug ? escape(p.slug) : '';

    var meta = (date ? '<time datetime="' + date + '">' + fmtDate(p.date) + '</time>' : '') +
               (cat && date ? ' · ' : '') + (cat ? cat : '');

    // Link to internal article page if there's a slug
    var href = slug ? 'article.html?slug=' + slug : '';
    var imgWrap = href
      ? '<a class="news-card-img" href="' + href + '"><img src="' + img + '" alt="' + title + '" loading="lazy"/></a>'
      : '<div class="news-card-img"><img src="' + img + '" alt="' + title + '" loading="lazy"/></div>';
    var titleHtml = href ? '<a href="' + href + '">' + title + '</a>' : title;
    var cont = href ? '<a class="news-link" href="' + href + '">' + t.read + ' <span class="arrow">→</span></a>' : '';

    return '<article class="news-card">' + imgWrap +
      '<div class="news-card-body">' +
        '<div class="news-meta">' + meta + '</div>' +
        '<h3 class="news-title">' + titleHtml + '</h3>' +
        '<p class="news-excerpt">' + excerpt + '</p>' +
        cont +
      '</div></article>';
  }

  function render(posts) {
    posts = posts.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    if (!posts.length) {
      grid.innerHTML = '<p class="muted" style="grid-column:1/-1;text-align:center;padding:40px 0;">' + t.empty + '</p>';
      return;
    }
    grid.innerHTML = posts.map(renderCard).join('');
  }

  // Path 1 — preloaded via posts.js (works everywhere, including file://)
  if (window.OUTHENTIC_NEWS && window.OUTHENTIC_NEWS.posts) {
    render(window.OUTHENTIC_NEWS.posts);
    return;
  }

  // Path 2 — fall back to fetching posts.json (HTTP only)
  var POSTS_URL = inBg ? '../assets/news/posts.json' : 'assets/news/posts.json';
  fetch(POSTS_URL, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) { render((data && data.posts) || []); })
    .catch(function (err) {
      console.error('news.js: could not load posts —', err);
      grid.innerHTML = '<p class="muted" style="grid-column:1/-1;text-align:center;padding:40px 0;">' + t.error + '</p>';
    });
})();
