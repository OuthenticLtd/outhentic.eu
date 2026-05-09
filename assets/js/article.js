/* Outhentic — single-article view.
   URL pattern: article.html?slug=ethno-bulgaria-2023
   Reads window.OUTHENTIC_NEWS, finds matching post, renders. */
(function () {
  var root = document.getElementById('article-root');
  if (!root || !window.OUTHENTIC_NEWS) {
    if (root) root.innerHTML = '<section class="section"><div class="wrap"><p class="muted">Article not available.</p></div></section>';
    return;
  }

  var lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('bg') ? 'bg' : 'en';
  var inBg = location.pathname.indexOf('/bg/') !== -1;
  var I18N = {
    en: { back: '← Back to news', notFound: 'Article not found.', date: 'en-GB' },
    bg: { back: '← Обратно към новините', notFound: 'Статията не е намерена.', date: 'bg-BG' }
  };
  var t = I18N[lang];

  // Parse slug from query string
  var params = new URLSearchParams(location.search);
  var slug = params.get('slug');
  var posts = window.OUTHENTIC_NEWS.posts || [];
  var post = posts.find(function (p) { return p.slug === slug; });

  // Update lang toggle to point to the same slug in the other language
  var enLink = document.querySelector('a[data-lang-en]');
  var bgLink = document.querySelector('a[data-lang-bg]');
  if (enLink && slug) enLink.href = (inBg ? '../article' : 'article') + '?slug=' + slug;
  if (bgLink && slug) bgLink.href = (inBg ? 'article' : 'bg/article') + '?slug=' + slug;

  if (!post) {
    root.innerHTML = '<section class="section"><div class="wrap"><h1>404</h1><p class="muted">' + t.notFound + '</p><p><a class="news-link" href="' + (inBg ? 'news' : 'news') + '">' + t.back + '</a></p></div></section>';
    return;
  }

  function pick(p, key) { return p[key + '_' + lang] || p[key + '_en'] || p[key] || ''; }
  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    var monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var monthsBg = ['януари','февруари','март','април','май','юни','юли','август','септември','октомври','ноември','декември'];
    var months = lang === 'bg' ? monthsBg : monthsEn;
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  var title = escape(pick(post, 'title'));
  var category = escape(pick(post, 'category'));
  var dateStr = post.date ? fmtDate(post.date) : '';
  var img = post.image || '';
  if (inBg && img && !/^(https?:|\.\.|\/)/.test(img)) img = '../' + img;
  var body = pick(post, 'body') || '<p>' + escape(pick(post, 'excerpt')) + '</p>';
  var newsHref = inBg ? 'news' : 'news';

  // Update document title and meta description
  document.title = (lang === 'bg' ? 'Outhentic — ' : 'Outhentic — ') + (pick(post, 'title') || '');
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', pick(post, 'excerpt') || pick(post, 'title') || '');

  root.innerHTML =
    '<section class="article-hero"' + (img ? ' style="background-image: linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.78) 100%), url(' + escape(img) + ');"' : '') + '>' +
      '<div class="wrap article-hero-inner">' +
        '<div class="article-meta-top">' +
          (dateStr ? '<time>' + escape(dateStr) + '</time>' : '') +
          (category && dateStr ? '<span> · </span>' : '') +
          (category ? '<span>' + category + '</span>' : '') +
        '</div>' +
        '<h1 class="article-title">' + title + '</h1>' +
      '</div>' +
    '</section>' +
    '<section class="section article-body-section">' +
      '<div class="wrap">' +
        '<a class="news-link" href="' + newsHref + '" style="margin-bottom: 36px; display: inline-flex;">' + t.back + '</a>' +
        '<article class="article-body">' + body + '</article>' +
        '<div style="margin-top: 56px;"><a class="news-link" href="' + newsHref + '">' + t.back + '</a></div>' +
      '</div>' +
    '</section>';
})();
