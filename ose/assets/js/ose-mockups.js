/* ════════════════════════════════════════════════════════════════════
   ose-mockups.js — makes the phone-frame mockups actually work, so they
   feel like the real app. Works on the inline-fill SVG art.

   Opt in: <div class="phone-frame" data-interactive> … </div>.
   Accent/idle read from nearest [data-accent] / [data-idle] (svg root).

   Hooks (classes on SVG elements):
     .mk-key   data-note="60"               playable key → real synth voice + flash
     .mk-tab   data-tabs="grp"              tab; active → accent + underline/box;
                  optional data-panel="osc" switches the visible panel in its group
     .mk-pick  data-pick="grp"              selectable chip; optional data-wave + data-osc
     .mk-knob  data-param="cutoff" data-min data-max data-val [data-log] [data-fmt]
                  draggable knob; rotates its .mk-ind and drives the synth
     .mk-toggle data-on="1"                 switch / SUSTAIN
     .mk-press                              momentary press flash
     .mk-step  data-step-target="id"        +/- stepper
     .mk-nav   data-href="…"                tap-to-open navigation
     [data-panel="osc"] inside [data-panel-group] : show/hide panels
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Audio engine ────────────────────────────────────────────────────
  var AC = null;
  function audio() {
    if (AC === null) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = false; } }
    if (AC && AC.state === 'suspended') AC.resume();
    return AC || null;
  }
  var WAVES = ['sine', 'triangle', 'sawtooth', 'square'];

  // Per-svg synth state (Play). Defaults mirror a sensible Outhentic Synth patch.
  function synthState(svg) {
    if (!svg.__synth) {
      svg.__synth = {
        oscAWave: 'sawtooth', oscBWave: 'sine',
        oscASemi: 0, oscAFine: 0, oscBSemi: 0, oscBFine: 0,
        cutoff: 6000, res: 0.18, attack: 0.01, decay: 0.18, sustain: 0.7, release: 0.35,
        sustainPedal: false, voices: {}
      };
    }
    return svg.__synth;
  }
  function midiToHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function noteOn(svg, midi) {
    var ctx = audio(); if (!ctx) return;
    var s = synthState(svg);
    if (s.voices[midi]) noteOff(svg, midi, true);
    var t = ctx.currentTime;
    var base = midiToHz(midi);
    var oscA = ctx.createOscillator(), oscB = ctx.createOscillator();
    oscA.type = s.oscAWave; oscB.type = s.oscBWave;
    oscA.frequency.value = base * Math.pow(2, (s.oscASemi + s.oscAFine / 100) / 12);
    oscB.frequency.value = base * Math.pow(2, (s.oscBSemi + s.oscBFine / 100) / 12);
    var mix = ctx.createGain(); mix.gain.value = 0.32;
    var filt = ctx.createBiquadFilter(); filt.type = 'lowpass';
    filt.frequency.value = s.cutoff; filt.Q.value = 0.5 + s.res * 18;
    var amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.9, t + Math.max(0.003, s.attack));
    amp.gain.exponentialRampToValueAtTime(Math.max(0.02, s.sustain), t + Math.max(0.004, s.attack) + Math.max(0.01, s.decay));
    oscA.connect(mix); oscB.connect(mix); mix.connect(filt); filt.connect(amp); amp.connect(ctx.destination);
    oscA.start(t); oscB.start(t);
    s.voices[midi] = { oscA: oscA, oscB: oscB, amp: amp };
  }
  function noteOff(svg, midi, hard) {
    var ctx = audio(); if (!ctx) return;
    var s = synthState(svg); var v = s.voices[midi]; if (!v) return;
    if (s.sustainPedal && !hard) return; // held by pedal
    var t = ctx.currentTime, rel = hard ? 0.02 : Math.max(0.04, s.release);
    try {
      v.amp.gain.cancelScheduledValues(t);
      v.amp.gain.setValueAtTime(Math.max(0.0001, v.amp.gain.value), t);
      v.amp.gain.exponentialRampToValueAtTime(0.0001, t + rel);
      v.oscA.stop(t + rel + 0.02); v.oscB.stop(t + rel + 0.02);
    } catch (e) {}
    delete s.voices[midi];
  }
  // simple tone for non-synth frames
  function tone(midi) {
    var ctx = audio(); if (!ctx) return;
    var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = 'triangle'; o.frequency.value = midiToHz(midi);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.55);
  }

  function accentOf(el) { var n = el.closest('[data-accent]'); return (n && n.getAttribute('data-accent')) || '#fff'; }
  function idleOf(el) { var n = el.closest('[data-idle]'); return (n && n.getAttribute('data-idle')) || '#7a7a82'; }
  function svgOf(el) { return el.closest('svg'); }

  // ── Keys ────────────────────────────────────────────────────────────
  function wireKey(el) {
    var svg = svgOf(el), accent = accentOf(el), isSynth = svg && svg.getAttribute('data-synth') === 'play';
    var down = function (e) {
      e.preventDefault();
      var note = parseInt(el.getAttribute('data-note'), 10);
      if (!isNaN(note)) { isSynth ? noteOn(svg, note) : tone(note); }
      if (!el.dataset.origFill) el.dataset.origFill = el.getAttribute('fill') || 'transparent';
      el.setAttribute('fill', accent);
    };
    var up = function () {
      var note = parseInt(el.getAttribute('data-note'), 10);
      if (isSynth && !isNaN(note)) noteOff(svg, note);
      if (el.dataset.origFill) el.setAttribute('fill', el.dataset.origFill);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('pointercancel', up);
  }

  // ── Tabs / picks ────────────────────────────────────────────────────
  function setActive(el, accent, idle, on) {
    var txt = el.querySelector('text');
    var ul = el.querySelector('.mk-ul'), fill = el.querySelector('.mk-fill');
    if (txt) txt.setAttribute('fill', on ? accent : idle);
    if (ul) ul.style.display = on ? '' : 'none';
    if (fill) fill.style.display = on ? '' : 'none';
  }
  function switchPanel(svg, group, name) {
    if (!svg || !name) return;
    svg.querySelectorAll('[data-panel-group="' + group + '"] [data-panel]').forEach(function (p) {
      p.style.display = (p.getAttribute('data-panel') === name) ? '' : 'none';
    });
  }
  function wireGroup(attr) {
    var groups = {};
    document.querySelectorAll('.phone-frame[data-interactive] [' + attr + ']').forEach(function (el) {
      (groups[el.getAttribute(attr)] = groups[el.getAttribute(attr)] || []).push(el);
    });
    Object.keys(groups).forEach(function (g) {
      groups[g].forEach(function (el) {
        el.addEventListener('click', function () {
          var accent = accentOf(el), idle = idleOf(el), svg = svgOf(el);
          groups[g].forEach(function (o) { setActive(o, accent, idle, o === el); });
          var panel = el.getAttribute('data-panel');
          if (panel) switchPanel(svg, el.getAttribute('data-panel-grp') || 'main', panel);
          // waveform pick → synth state
          var wave = el.getAttribute('data-wave');
          if (wave && svg) {
            var st = synthState(svg);
            if (el.getAttribute('data-osc') === 'b') st.oscBWave = wave; else st.oscAWave = wave;
          }
        });
      });
    });
  }

  // ── Knobs (draggable + rotating) ────────────────────────────────────
  function fmtVal(v, fmt) {
    if (fmt === 'st') return (v > 0 ? '+' : '') + Math.round(v) + 'st';
    if (fmt === 'ct') return (v > 0 ? '+' : '') + Math.round(v) + 'ct';
    if (fmt === 'hz') return v >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v) + '';
    if (fmt === 'pct') return Math.round(v * 100) + '%';
    if (fmt === 'sec') return v < 1 ? Math.round(v * 1000) + 'ms' : v.toFixed(2) + 's';
    return Math.round(v) + '';
  }
  function wireKnob(el) {
    var svg = svgOf(el);
    var min = parseFloat(el.getAttribute('data-min')), max = parseFloat(el.getAttribute('data-max'));
    var log = el.getAttribute('data-log') === '1';
    var param = el.getAttribute('data-param'), fmt = el.getAttribute('data-fmt');
    var ind = el.querySelector('.mk-ind');
    var valTxt = el.parentNode.querySelector('[data-knob-val="' + param + '"]');
    var cx = parseFloat(el.getAttribute('data-cx') || '0'), cy = parseFloat(el.getAttribute('data-cy') || '0');
    var val = parseFloat(el.getAttribute('data-val'));
    function norm(v) { return log ? (Math.log(v / min) / Math.log(max / min)) : (v - min) / (max - min); }
    function render() {
      var n = norm(val); var ang = -135 + n * 270;
      if (ind) ind.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ' ' + cx + ' ' + cy + ')');
      if (valTxt) valTxt.textContent = fmtVal(val, fmt);
      if (svg && param) synthState(svg)[param] = val;
    }
    render();
    var dragging = false, startY = 0, startVal = 0;
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault(); dragging = true; startY = e.clientY; startVal = val;
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dy = startY - e.clientY; var span = max - min;
      if (log) {
        var n0 = norm(startVal) + dy / 160; n0 = Math.max(0, Math.min(1, n0));
        val = min * Math.pow(max / min, n0);
      } else {
        val = Math.max(min, Math.min(max, startVal + (dy / 160) * span));
      }
      render();
    });
    var end = function (e) { if (dragging) { dragging = false; try { el.releasePointerCapture(e.pointerId); } catch (x) {} } };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  // ── Toggle / press / step / nav ─────────────────────────────────────
  function wireToggle(el) {
    var accent = accentOf(el), svg = svgOf(el);
    el.addEventListener('click', function () {
      var on = el.getAttribute('data-on') !== '1';
      el.setAttribute('data-on', on ? '1' : '0');
      var body = el.querySelector('.mk-body') || el;
      if (el.dataset.onFill) {
        if (!el.dataset.offFill) el.dataset.offFill = body.getAttribute('fill') || 'none';
        body.setAttribute('fill', on ? el.dataset.onFill : el.dataset.offFill);
      }
      var trk = el.querySelector('.mk-trk'), knob = el.querySelector('.mk-knob-sw');
      if (trk) trk.setAttribute('fill', on ? accent : 'rgba(255,255,255,0.18)');
      if (knob && knob.dataset.onx && knob.dataset.offx) knob.setAttribute('cx', on ? knob.dataset.onx : knob.dataset.offx);
      if (el.getAttribute('data-sustain') === '1' && svg) {
        var st = synthState(svg); st.sustainPedal = on;
        if (!on) Object.keys(st.voices).slice().forEach(function (m) { noteOff(svg, parseInt(m, 10)); });
      }
    });
  }
  function wirePress(el) {
    el.addEventListener('pointerdown', function () {
      el.style.transition = 'none'; el.style.opacity = '0.5';
      setTimeout(function () { el.style.transition = 'opacity .25s'; el.style.opacity = '1'; }, 70);
    });
  }
  function wireStep(el) {
    el.addEventListener('click', function () {
      var t = document.getElementById(el.getAttribute('data-step-target')); if (!t) return;
      var d = parseFloat(el.getAttribute('data-step') || '1');
      var cur = parseFloat(t.getAttribute('data-val') || t.textContent) || 0;
      var nv = Math.round((cur + d) * 10) / 10; t.setAttribute('data-val', nv);
      t.textContent = t.dataset.suffix ? nv + t.dataset.suffix : nv;
    });
  }
  function wireNav(el) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', function () { var h = el.getAttribute('data-href'); if (h) window.location.href = h; });
  }

  function init() {
    document.querySelectorAll('.phone-frame[data-interactive]').forEach(function (f) { f.removeAttribute('aria-hidden'); });
    var sel = '.phone-frame[data-interactive] ';
    document.querySelectorAll(sel + '.mk-key, ' + sel + '.mk-pad').forEach(wireKey);
    wireGroup('data-tabs'); wireGroup('data-pick');
    document.querySelectorAll(sel + '.mk-knob').forEach(wireKnob);
    document.querySelectorAll(sel + '.mk-toggle').forEach(wireToggle);
    document.querySelectorAll(sel + '.mk-press').forEach(wirePress);
    document.querySelectorAll(sel + '.mk-step').forEach(wireStep);
    document.querySelectorAll(sel + '.mk-nav').forEach(wireNav);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
