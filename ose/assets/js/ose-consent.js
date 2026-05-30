/* =========================================================
   OSE — cookie / storage notice banner.

   This site sets NO advertising or tracking cookies. The only
   client-side storage is strictly necessary: this banner's own
   dismissal flag, and (admin only) the editor's GitHub token.
   Strictly-necessary storage is exempt from consent under the
   ePrivacy Directive Art. 5(3), so this is an INFORMATIONAL
   notice with a single "Got it" dismiss — NOT a consent gate.

   Self-contained: injects its own styles + DOM on DOMContentLoaded,
   respects the dismissal flag in localStorage, and links to the
   Cookie statement. Visually consistent with the site (dark,
   accent, Inter — uses the same CSS variables / self-hosted fonts).
   ========================================================= */
(function () {
  var FLAG = 'ose-cookie-notice-dismissed';

  // Strictly-necessary storage: remember dismissal. Wrapped in try/catch
  // so privacy modes that block storage simply re-show the notice rather
  // than throwing.
  function isDismissed() {
    try { return localStorage.getItem(FLAG) === '1'; } catch (e) { return false; }
  }
  function setDismissed() {
    try { localStorage.setItem(FLAG, '1'); } catch (e) { /* no-op */ }
  }

  // Resolve cookies.html relative to where this page lives. Pages under
  // /ose/modules/ carry data-module-id on <body>; everything else is at root.
  function cookiesHref() {
    var inModules = document.body && document.body.getAttribute('data-module-id');
    return (inModules ? '../' : '') + 'cookies.html';
  }

  function injectStyles() {
    if (document.getElementById('ose-consent-style')) return;
    var css =
      '.ose-consent{position:fixed;left:50%;bottom:16px;transform:translateX(-50%) translateY(8px);' +
      'z-index:9999;width:calc(100% - 32px);max-width:720px;box-sizing:border-box;' +
      'display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;' +
      'padding:14px 18px;border-radius:14px;' +
      'background:rgba(17,17,21,0.96);border:1px solid rgba(255,255,255,0.14);' +
      'box-shadow:0 16px 48px rgba(0,0,0,0.55);' +
      'font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
      'opacity:0;pointer-events:none;transition:opacity .28s ease,transform .28s ease;}' +
      '.ose-consent.is-visible{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0);}' +
      '.ose-consent__text{flex:1 1 320px;min-width:0;margin:0;font-size:.86rem;line-height:1.5;color:#B8B8BD;}' +
      '.ose-consent__text strong{color:#ECECEE;font-weight:600;}' +
      '.ose-consent__text a{color:#FF8A2A;text-decoration:underline;}' +
      '.ose-consent__btn{flex:0 0 auto;cursor:pointer;border:0;border-radius:9px;' +
      'padding:9px 18px;font-family:inherit;font-size:.84rem;font-weight:600;color:#0A0A0E;' +
      'background:linear-gradient(90deg,#4AA3FF 0%,#FFFFFF 50%,#FF8A2A 100%);' +
      'transition:filter .2s ease,transform .05s ease;}' +
      '.ose-consent__btn:hover{filter:brightness(1.08);}' +
      '.ose-consent__btn:active{transform:translateY(1px);}' +
      '.ose-consent__btn:focus-visible{outline:2px solid #4AA3FF;outline-offset:2px;}' +
      '@media (max-width:520px){.ose-consent{flex-direction:column;align-items:stretch;text-align:left;gap:12px;padding:13px 15px;}' +
      '.ose-consent__text{flex:0 0 auto;}' +   /* in column, flex-basis is height — reset so it hugs content */
      '.ose-consent__btn{width:100%;}}' +
      '@media (prefers-reduced-motion:reduce){.ose-consent{transition:opacity .01ms;}}';
    var style = document.createElement('style');
    style.id = 'ose-consent-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function build() {
    if (isDismissed()) return;
    if (document.getElementById('ose-consent')) return;
    injectStyles();

    var bar = document.createElement('div');
    bar.id = 'ose-consent';
    bar.className = 'ose-consent';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie and storage notice');

    var text = document.createElement('p');
    text.className = 'ose-consent__text';
    text.innerHTML =
      '<strong>No tracking here.</strong> We use no advertising or tracking cookies — only ' +
      'storage that is strictly necessary for the site to work. ' +
      '<a href="' + cookiesHref() + '">Learn more</a>.';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ose-consent__btn';
    btn.textContent = 'Got it';
    btn.addEventListener('click', function () {
      setDismissed();
      bar.classList.remove('is-visible');
      window.setTimeout(function () {
        if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
      }, 320);
    });

    bar.appendChild(text);
    bar.appendChild(btn);
    document.body.appendChild(bar);

    // Animate in on the next frame so the transition runs.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { bar.classList.add('is-visible'); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
