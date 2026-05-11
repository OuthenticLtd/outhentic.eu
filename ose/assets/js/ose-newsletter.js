/* =========================================================
   OSE — newsletter signup form (footer)

   Static-site-friendly: NO backend assumed.
     • If `meta.newsletter.endpointUrl` is set → POSTs JSON to it
       (drop in a Formspree / Cloudflare Worker URL when ready).
     • Otherwise → opens the visitor's email client to
       ose@outhentic.eu pre-filled with name + email. Visitor hits
       send, the signup lands in the inbox. From there, search +
       export to CSV for Mailchimp import.

   Spam protection (no captcha):
     • Honeypot: hidden text input "company" — bots fill it, real
       users don't see it. Submit silently drops if it's not empty.
     • Time-check: form must have been on the page ≥ 3 seconds
       before submit (rules out auto-submitters).
     • Email regex: basic shape check (RFC-5322 simplified).
     • One-submit lockout: prevents form mash-submit.

   Idempotent — safe to include on any page that has the
   `<div data-ose-newsletter></div>` host in the footer.
   ========================================================= */
(function () {
  'use strict';

  function init() {
    var host = document.querySelector('[data-ose-newsletter]');
    if (!host) return;
    var C = (window.OSE_CONTENT && window.OSE_CONTENT.newsletter) || {};
    if (C.enabled === false) { host.style.display = 'none'; return; }

    var contactEmail = (window.OSE_CONTENT && window.OSE_CONTENT.meta && window.OSE_CONTENT.meta.contactEmail) || 'ose@outhentic.eu';
    var endpoint = (C.endpointUrl || '').trim();

    var headline = C.headline || 'Stay in the loop';
    var subline  = C.subline  || 'One short email when we ship.';
    var emailLabel = C.emailLabel || 'Your email';
    var emailPlaceholder = C.emailPlaceholder || 'you@yourband.com';
    var namePlaceholder = C.namePlaceholder || 'Name (optional)';
    var submitLabel = C.submitLabel || 'Subscribe';
    var successMailto = C.successMailto || 'Thanks — your email client just opened pre-filled. Hit send to confirm.';
    var successEndpoint = C.successEndpoint || 'Thanks — you\'re on the list.';
    var errorMessage = C.errorMessage || 'That email doesn\'t look right.';

    // Render — minimal, footer-friendly markup.
    host.innerHTML = ''
      + '<div class="nl-card">'
      +   '<div class="nl-head">'
      +     '<h3 class="nl-headline"></h3>'
      +     '<p class="nl-subline"></p>'
      +   '</div>'
      +   '<form class="nl-form" data-nl-form novalidate>'
      +     '<div class="nl-row">'
      +       '<input class="nl-name" data-nl-name type="text" autocomplete="given-name" />'
      +       '<input class="nl-email" data-nl-email type="email" required autocomplete="email" />'
      +       '<button class="nl-submit" data-nl-submit type="submit"></button>'
      +     '</div>'
      // Honeypot — visually hidden + aria-hidden so screen readers skip
      // it. Real users won't touch it; spam bots blindly fill every
      // input they find.
      +     '<div class="nl-trap" aria-hidden="true">'
      +       '<label>Company<input type="text" name="company" tabindex="-1" autocomplete="off" data-nl-trap /></label>'
      +     '</div>'
      +     '<div class="nl-feedback" data-nl-feedback role="status" aria-live="polite"></div>'
      +     '<div class="nl-fineprint">'
      +       'We use your email only to send the OSE newsletter — never sold, never shared. '
      +       'Unsubscribe with one click in any email.'
      +     '</div>'
      +   '</form>'
      + '</div>';

    host.querySelector('.nl-headline').textContent = headline;
    host.querySelector('.nl-subline').textContent = subline;
    var nameInput = host.querySelector('[data-nl-name]');
    var emailInput = host.querySelector('[data-nl-email]');
    var submitBtn = host.querySelector('[data-nl-submit]');
    var trap = host.querySelector('[data-nl-trap]');
    var feedback = host.querySelector('[data-nl-feedback]');
    var form = host.querySelector('[data-nl-form]');
    nameInput.placeholder = namePlaceholder;
    emailInput.placeholder = emailPlaceholder;
    emailInput.setAttribute('aria-label', emailLabel);
    submitBtn.textContent = submitLabel;

    var renderedAt = Date.now();
    var sent = false;

    // Reasonable RFC-5322 "shape" regex — won't catch every edge
    // case but rejects obvious garbage. Backend should still validate.
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function showError(msg) {
      feedback.textContent = msg;
      feedback.setAttribute('data-state', 'error');
    }
    function showSuccess(msg) {
      feedback.textContent = msg;
      feedback.setAttribute('data-state', 'ok');
    }

    function onSubmit(e) {
      e.preventDefault();
      if (sent) return;

      // ── Spam checks (silent fail on honeypot — don't tip off bots) ──
      if (trap.value && trap.value.trim().length > 0) {
        // Pretend success so the bot moves on.
        showSuccess(endpoint ? successEndpoint : successMailto);
        sent = true;
        return;
      }
      if (Date.now() - renderedAt < 3000) {
        showError('Hold on a moment, then try again.');
        return;
      }

      var name = (nameInput.value || '').trim().slice(0, 80);
      var email = (emailInput.value || '').trim().toLowerCase().slice(0, 120);
      if (!emailRe.test(email)) {
        showError(errorMessage);
        emailInput.focus();
        return;
      }

      // Build payload — used by both branches.
      var payload = {
        email: email,
        name: name,
        source: 'outhentic.eu/ose',
        page: location.pathname,
        ts: new Date().toISOString()
      };

      sent = true;
      submitBtn.disabled = true;
      submitBtn.textContent = '…';

      if (endpoint) {
        // ── Endpoint mode ──
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (r) {
          if (!r.ok) throw new Error('http ' + r.status);
          showSuccess(successEndpoint);
          form.reset();
        }).catch(function (err) {
          // Fall back to mailto on endpoint failure rather than
          // silently losing the signup.
          openMailto(payload);
          showSuccess(successMailto);
        }).then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
        });
        return;
      }

      // ── Mailto mode ──
      openMailto(payload);
      showSuccess(successMailto);
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }

    function openMailto(p) {
      var subject = 'OSE newsletter signup — ' + p.email;
      var body = ''
        + 'Hi Outhentic team,\n\n'
        + 'Please add me to the OSE newsletter list.\n\n'
        + 'Email: ' + p.email + '\n'
        + (p.name ? 'Name: ' + p.name + '\n' : '')
        + 'Submitted from: ' + p.page + '\n'
        + 'When: ' + p.ts + '\n\n'
        + 'Thanks!';
      var url = 'mailto:' + encodeURIComponent(contactEmail)
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
      // window.location = url opens the registered mail handler.
      window.location.href = url;
    }

    form.addEventListener('submit', onSubmit);
  }

  // The renderer fills page-wide content slots; we wait for it to
  // populate (or just for DOMContentLoaded if no renderer present).
  function boot() {
    if (window.OSE_CONTENT) init();
    else document.addEventListener('DOMContentLoaded', init);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
