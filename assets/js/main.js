/* Outhentic site — small interactions */
(function () {
  // ----- Live nav-height measurement -----
  // The nav bar is position:sticky and takes vertical space at the top.
  // The hero is sized to (100dvh - nav-height) so that one scroll lands you
  // on the next section. We re-measure on resize and orientation change.
  function setNavHeightVar() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var h = nav.getBoundingClientRect().height;
    if (h && h > 0) {
      document.documentElement.style.setProperty('--nav-h', h + 'px');
    }
  }
  setNavHeightVar();
  // Re-measure once fonts load (nav height changes if logo image hasn't loaded yet)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setNavHeightVar);
  }
  window.addEventListener('load', setNavHeightVar);
  window.addEventListener('resize', setNavHeightVar);
  window.addEventListener('orientationchange', setNavHeightVar);

  // ----- Mobile nav toggle -----
  var toggle = document.querySelector('.nav-toggle');
  var links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (links.classList.contains('open')) {
          links.classList.remove('open');
          toggle.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // ----- Reveal on scroll -----
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ----- Footer year -----
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  // ----- Lightbox with prev/next navigation -----
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.lightbox-trigger'));
  if (triggers.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML =
      '<button class="lightbox-close" aria-label="Close (Esc)">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<line x1="18" y1="6" x2="6" y2="18"></line>' +
          '<line x1="6" y1="6" x2="18" y2="18"></line>' +
        '</svg>' +
      '</button>' +
      '<button class="lightbox-nav lightbox-prev" aria-label="Previous photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<polyline points="15 18 9 12 15 6"></polyline>' +
        '</svg>' +
      '</button>' +
      '<button class="lightbox-nav lightbox-next" aria-label="Next photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<polyline points="9 18 15 12 9 6"></polyline>' +
        '</svg>' +
      '</button>' +
      '<span class="lightbox-counter"></span>' +
      '<img alt="" />' +
      '<div class="lightbox-caption"></div>';
    document.body.appendChild(lb);

    var lbImg     = lb.querySelector('img');
    var lbCap     = lb.querySelector('.lightbox-caption');
    var lbClose   = lb.querySelector('.lightbox-close');
    var lbPrev    = lb.querySelector('.lightbox-prev');
    var lbNext    = lb.querySelector('.lightbox-next');
    var lbCounter = lb.querySelector('.lightbox-counter');
    var current   = -1;

    var showAt = function (i) {
      if (i < 0) i = triggers.length - 1;
      if (i >= triggers.length) i = 0;
      current = i;
      var a   = triggers[i];
      var img = a.querySelector('img');
      var src = a.getAttribute('href') || (img ? img.src : '');
      var alt = (img && img.alt) || a.getAttribute('aria-label') || '';
      lbImg.src = src;
      lbImg.alt = alt;
      lbCap.textContent = alt;
      lbCounter.textContent = (i + 1) + ' / ' + triggers.length;
      // hide arrows entirely if there's only one image
      if (triggers.length <= 1) {
        lbPrev.style.display = 'none';
        lbNext.style.display = 'none';
      }
    };

    var open = function (i) {
      showAt(i);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-locked');
    };
    var close = function () {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-locked');
      setTimeout(function () {
        if (!lb.classList.contains('is-open')) lbImg.src = '';
      }, 300);
    };
    var prev = function () { showAt(current - 1); };
    var next = function () { showAt(current + 1); };

    triggers.forEach(function (a, idx) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        open(idx);
      });
    });
    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
    lbNext.addEventListener('click', function (e) { e.stopPropagation(); next(); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft')  prev();
      else if (e.key === 'ArrowRight') next();
    });

    // Touch swipe on the image
    var touchStartX = 0, touchEndX = 0;
    lb.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    lb.addEventListener('touchend',   function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var dx = touchEndX - touchStartX;
      if (Math.abs(dx) > 40) { dx > 0 ? prev() : next(); }
    }, { passive: true });
  }
})();

/* ===========================================================
   Custom audio player — replaces Bandcamp embed.
   Builds tracklist from window.OUTHENTIC_ALBUMS data.
   =========================================================== */
(function () {
  if (!window.OUTHENTIC_ALBUMS) return;
  var players = document.querySelectorAll('.player[data-album]');
  if (!players.length) return;

  function fmtTime(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' + sec : sec);
  }

  function buildPlayer(root) {
    var key = root.getAttribute('data-album');
    var data = window.OUTHENTIC_ALBUMS[key];
    if (!data) return;

    // Tracklist HTML
    var listEl = root.querySelector('.player-tracklist');
    listEl.innerHTML = '';
    data.tracks.forEach(function (t, i) {
      var li = document.createElement('li');
      li.className = 'player-track';
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.dataset.index = String(i);
      li.innerHTML =
        '<span class="player-track-num">' + (i + 1).toString().padStart(2, '0') + '</span>' +
        '<span class="player-track-title">' + t.title + '</span>' +
        '<span class="player-track-time">' + fmtTime(t.duration) + '</span>';
      listEl.appendChild(li);
    });

    var audio   = root.querySelector('.player-audio');
    var btnPlay = root.querySelector('.player-play-btn');
    var btnPrev = root.querySelector('.player-prev-btn');
    var btnNext = root.querySelector('.player-next-btn');
    var prog    = root.querySelector('.player-progress');
    var fill    = root.querySelector('.player-progress-fill');
    var elTime  = root.querySelector('.player-time');
    var elNumNow = root.querySelector('.player-now-num');
    var elTitleNow = root.querySelector('.player-now-title');

    var current = 0;
    var iconPlay  = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
    var iconPause = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

    function loadTrack(i, autoplay) {
      if (i < 0) i = data.tracks.length - 1;
      if (i >= data.tracks.length) i = 0;
      current = i;
      var t = data.tracks[i];
      audio.src = t.src;
      // UI
      elNumNow.textContent = (i + 1).toString().padStart(2, '0');
      elTitleNow.textContent = t.title;
      listEl.querySelectorAll('.player-track').forEach(function (el, idx) {
        el.classList.toggle('is-current', idx === i);
        el.classList.remove('is-playing');
      });
      if (autoplay) audio.play().catch(function () {});
    }

    function togglePlay() {
      if (audio.paused) {
        audio.play().catch(function () {});
      } else {
        audio.pause();
      }
    }

    btnPlay.addEventListener('click', togglePlay);
    btnPrev.addEventListener('click', function () { loadTrack(current - 1, !audio.paused); });
    btnNext.addEventListener('click', function () { loadTrack(current + 1, !audio.paused); });

    listEl.addEventListener('click', function (e) {
      var li = e.target.closest('.player-track');
      if (!li) return;
      loadTrack(parseInt(li.dataset.index, 10), true);
    });
    listEl.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var li = e.target.closest('.player-track');
      if (!li) return;
      e.preventDefault();
      loadTrack(parseInt(li.dataset.index, 10), true);
    });

    // Progress bar
    audio.addEventListener('play', function () {
      btnPlay.innerHTML = iconPause;
      var li = listEl.children[current];
      if (li) li.classList.add('is-playing');
    });
    audio.addEventListener('pause', function () {
      btnPlay.innerHTML = iconPlay;
      var li = listEl.children[current];
      if (li) li.classList.remove('is-playing');
    });
    audio.addEventListener('ended', function () {
      loadTrack(current + 1, true);
    });
    // Preview-limit setup. previewSec=0 disables the limit.
    var previewSec = (typeof data.preview_seconds === 'number')
      ? data.preview_seconds
      : (window.OUTHENTIC_PREVIEW_DEFAULT || 30);
    var buyUrl = data.buy_url || '';

    function showBuyPrompt() {
      var existing = root.querySelector('.player-buy-prompt');
      if (existing) { existing.classList.add('is-shown'); return; }
      var overlay = document.createElement('div');
      overlay.className = 'player-buy-prompt is-shown';
      var title = data.tracks[current] ? data.tracks[current].title : 'this track';
      var lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('bg') ? 'bg' : 'en';
      var msg = lang === 'bg'
        ? 'Чухте кратък откъс от тази песен. Купете албума, за да слушате цялата.'
        : 'You have heard a preview of this track. Buy the album to hear the full song.';
      var btnLabel = lang === 'bg' ? 'Купи албума' : 'Buy the album';
      var dismissLabel = lang === 'bg' ? 'Затвори' : 'Dismiss';
      var html =
        '<div class="player-buy-msg">' +
          '<p>' + msg + '</p>' +
          '<div class="player-buy-actions">' +
            (buyUrl ? '<a class="btn btn--accent" href="' + buyUrl + '" target="_blank" rel="noopener">' + btnLabel + ' &rarr;</a>' : '') +
            '<button type="button" class="btn btn--small player-buy-dismiss">' + dismissLabel + '</button>' +
          '</div>' +
        '</div>';
      overlay.innerHTML = html;
      var host = root.querySelector('.player-main') || root;
      host.appendChild(overlay);
      overlay.querySelector('.player-buy-dismiss').addEventListener('click', function () {
        overlay.classList.remove('is-shown');
      });
    }
    function hideBuyPrompt() {
      var existing = root.querySelector('.player-buy-prompt');
      if (existing) existing.classList.remove('is-shown');
    }

    audio.addEventListener('timeupdate', function () {
      var dur = audio.duration || data.tracks[current].duration || 0;
      var cur = audio.currentTime || 0;
      if (previewSec > 0 && cur >= previewSec && !audio.paused) {
        audio.pause();
        audio.currentTime = previewSec;
        showBuyPrompt();
      }
      var pct = dur ? (cur / dur) * 100 : 0;
      fill.style.width = pct + '%';
      var displayDur = previewSec > 0 ? Math.min(previewSec, dur) : dur;
      var suffix = (previewSec > 0 && dur > previewSec) ? ' (preview)' : '';
      elTime.textContent = fmtTime(cur) + ' / ' + fmtTime(displayDur) + suffix;
    });

    prog.addEventListener('click', function (e) {
      var rect = prog.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / rect.width;
      var dur = audio.duration || data.tracks[current].duration || 0;
      var target = ratio * dur;
      if (previewSec > 0 && target > previewSec) target = previewSec - 0.1;
      audio.currentTime = target;
    });

    audio.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    root.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // Hide the buy prompt whenever a new track is selected by the user
    listEl.addEventListener('click', hideBuyPrompt);
    btnPrev.addEventListener('click', hideBuyPrompt);
    btnNext.addEventListener('click', hideBuyPrompt);

    btnPlay.innerHTML = iconPlay;
    loadTrack(0, false);
    var initDur = data.tracks[0].duration || 0;
    var initShown = previewSec > 0 ? Math.min(previewSec, initDur) : initDur;
    var initSuffix = (previewSec > 0 && initDur > previewSec) ? ' (preview)' : '';
    elTime.textContent = '0:00 / ' + fmtTime(initShown) + initSuffix;
  }

  players.forEach(buildPlayer);
})();
    