/* ════════════════════════════════════════════════════════════════════
   ose-mockups.js — makes the phone-frame mockups feel like the real app.

   Attribute-driven, works directly on the inline-fill SVG art so the
   visuals stay pixel-faithful. Opt in per frame with
   <div class="phone-frame" data-interactive> … </div>.

   Hooks (classes on SVG elements):
     .mk-key      data-note="60"            playable key → tone + flash
     .mk-pad      data-note="60"            drum/pad → tone + flash
     .mk-tab      data-tabs="grp"           tab; active gets accent + underline
                  (group container is just the shared data-tabs value)
     .mk-pick     data-pick="grp"           selectable option (like tabs, fill)
     .mk-toggle   data-on="1"               switch (knob + track flip)
     .mk-press                              momentary press flash
     .mk-step     data-step-target="id"     +/- stepper, data-step="1"
     .mk-play                               transport play↔pause toggle

   Accent + idle colors are read from the nearest [data-accent] / [data-idle]
   (usually the <svg> root). Tabs/picks each carry an optional child
   <rect class="mk-ul"> (underline) or <rect class="mk-fill"> (chip fill).
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var AC = null;
  function audio() {
    if (AC === null) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { AC = false; }
    }
    if (AC && AC.state === 'suspended') AC.resume();
    return AC || null;
  }
  function tone(midi, type) {
    var ctx = audio(); if (!ctx) return;
    var f = 440 * Math.pow(2, (midi - 69) / 12);
    var osc = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    osc.type = type || 'triangle';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.connect(g).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.6);
  }

  function accentOf(el) {
    var n = el.closest('[data-accent]');
    return (n && n.getAttribute('data-accent')) || '#ffffff';
  }
  function idleOf(el) {
    var n = el.closest('[data-idle]');
    return (n && n.getAttribute('data-idle')) || '#7a7a82';
  }

  // ── Playable keys / pads ────────────────────────────────────────────
  function wireKey(el) {
    var accent = accentOf(el);
    var press = function (e) {
      e.preventDefault();
      var note = parseInt(el.getAttribute('data-note'), 10);
      if (!isNaN(note)) tone(note, el.classList.contains('mk-pad') ? 'sine' : 'triangle');
      if (!el.dataset.origFill) el.dataset.origFill = el.getAttribute('fill') || 'transparent';
      el.setAttribute('fill', accent);
      el.style.opacity = '1';
    };
    var release = function () {
      if (el.dataset.origFill) el.setAttribute('fill', el.dataset.origFill);
    };
    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointerleave', release);
    el.addEventListener('pointercancel', release);
  }

  // ── Tabs / selectable picks ─────────────────────────────────────────
  function setActive(el, accent, idle, on) {
    var txt = el.querySelector('text') || el;
    var ul = el.querySelector('.mk-ul');
    var fill = el.querySelector('.mk-fill');
    if (txt.tagName === 'text') txt.setAttribute('fill', on ? accent : idle);
    if (ul) ul.style.display = on ? '' : 'none';
    if (fill) fill.style.display = on ? '' : 'none';
  }
  function wireGroup(attr) {
    var groups = {};
    document.querySelectorAll('.phone-frame[data-interactive] [' + attr + ']').forEach(function (el) {
      var g = el.getAttribute(attr);
      (groups[g] = groups[g] || []).push(el);
    });
    Object.keys(groups).forEach(function (g) {
      var els = groups[g];
      els.forEach(function (el) {
        el.addEventListener('click', function () {
          var accent = accentOf(el), idle = idleOf(el);
          els.forEach(function (o) { setActive(o, accent, idle, o === el); });
        });
      });
    });
  }

  // ── Toggles (switch) ────────────────────────────────────────────────
  function wireToggle(el) {
    var accent = accentOf(el);
    el.addEventListener('click', function () {
      var on = el.getAttribute('data-on') === '1';
      on = !on;
      el.setAttribute('data-on', on ? '1' : '0');
      var trk = el.querySelector('.mk-trk');
      var knob = el.querySelector('.mk-knob');
      if (trk) trk.setAttribute('fill', on ? accent : 'rgba(255,255,255,0.18)');
      if (knob) {
        var x = knob.getAttribute(knob.dataset.onx ? 'data-onx' : 'cx');
        if (knob.dataset.onx && knob.dataset.offx)
          knob.setAttribute('cx', on ? knob.dataset.onx : knob.dataset.offx);
      }
      // generic fill toggle (e.g. SUSTAIN pill)
      if (el.dataset.onFill) {
        var body = el.querySelector('.mk-body') || el;
        if (!el.dataset.offFill) el.dataset.offFill = body.getAttribute('fill') || 'none';
        body.setAttribute('fill', on ? el.dataset.onFill : el.dataset.offFill);
      }
    });
  }

  // ── Momentary press flash ───────────────────────────────────────────
  function wirePress(el) {
    el.addEventListener('pointerdown', function () {
      el.style.transition = 'none'; el.style.opacity = '0.55';
      setTimeout(function () { el.style.transition = 'opacity .25s'; el.style.opacity = '1'; }, 60);
    });
  }

  // ── Stepper (+/-) ───────────────────────────────────────────────────
  function wireStep(el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute('data-step-target');
      var d = parseFloat(el.getAttribute('data-step') || '1');
      var t = document.getElementById(id);
      if (!t) return;
      var cur = parseFloat(t.getAttribute('data-val') || t.textContent) || 0;
      var nv = Math.round((cur + d) * 10) / 10;
      t.setAttribute('data-val', nv);
      t.textContent = (t.dataset.suffix ? nv + t.dataset.suffix : nv);
    });
  }

  function init() {
    document.querySelectorAll('.phone-frame[data-interactive]').forEach(function (f) {
      f.removeAttribute('aria-hidden');
    });
    document.querySelectorAll('.phone-frame[data-interactive] .mk-key, .phone-frame[data-interactive] .mk-pad').forEach(wireKey);
    wireGroup('data-tabs');
    wireGroup('data-pick');
    document.querySelectorAll('.phone-frame[data-interactive] .mk-toggle').forEach(wireToggle);
    document.querySelectorAll('.phone-frame[data-interactive] .mk-press').forEach(wirePress);
    document.querySelectorAll('.phone-frame[data-interactive] .mk-step').forEach(wireStep);
    // Home-grid tiles navigate to their module page (app-like tap-to-open).
    document.querySelectorAll('.phone-frame[data-interactive] .mk-nav').forEach(function (el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function () {
        var href = el.getAttribute('data-href');
        if (href) window.location.href = href;
      });
    });
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else init();
})();
