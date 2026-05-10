/* OSE site — nav, scroll reveals, mobile menu */
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
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
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
