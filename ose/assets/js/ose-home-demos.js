/* =========================================================
   OSE — interactive home-grid demos
   Wires the Play / Metronome / Signal Gen cards on the landing
   page with real Web Audio so visitors can play with them
   without leaving the page or downloading the app.
   ========================================================= */
(function () {

  // Shared AudioContext — lazily created on first user interaction.
  var audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  // Suppress card navigation when user interacts with the viz area.
  function suppress(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // ============================================================
  // PLAY card — tappable keyboard with Web Audio tones
  // ============================================================
  function buildPlay() {
    var card = document.querySelector('[data-home-demo="play"]');
    if (!card) return;
    var keys = card.querySelectorAll('.mcw-play-key');
    if (!keys.length) return;

    keys.forEach(function (key) {
      var semi = parseInt(key.getAttribute('data-note'), 10);
      key.style.cursor = 'pointer';
      key.addEventListener('pointerdown', function (e) {
        suppress(e);
        ensureAudio();
        playPianoNote(semi);
        // Flash the key briefly. White keys darken; black keys lighten.
        key.classList.add('is-down');
        setTimeout(function () { key.classList.remove('is-down'); }, 220);
      });
    });
  }

  function playPianoNote(semis) {
    // C4 = 261.63 Hz. semis is semitones from C4.
    var freq = 261.63 * Math.pow(2, semis / 12);
    var t = audioCtx.currentTime;
    // Two-osc piano-ish tone: triangle fundamental + soft sine octave.
    var osc1 = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 2;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.010);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);
    osc1.start(t); osc1.stop(t + 0.9);
    osc2.start(t); osc2.stop(t + 0.9);
  }

  // ============================================================
  // METRONOME card — tap to start/stop. While running, JS drives the 4
  // beat pillars in sync with the Web-Audio scheduler. While stopped,
  // the CSS ambient cycle ("mcw-met-1..4") plays.
  // ============================================================
  function buildMetronome() {
    var card = document.querySelector('[data-home-demo="metronome"]');
    if (!card) return;
    var tap       = card.querySelector('[data-met-tap]');
    var statusEl  = card.querySelector('[data-met-status]');
    var glyph     = card.querySelector('[data-met-glyph]');
    var bars      = card.querySelectorAll('[data-met-bar]');
    if (!tap || !statusEl || !bars.length) return;

    var bpm = 120;
    var beats = 4;
    var running = false;
    var schedulerId = null;
    var nextNoteTime = 0;
    var currentBeat = 0;

    function tickClick(t, accent) {
      var osc  = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = accent ? 1500 : 1100;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(accent ? 0.22 : 0.14, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    }
    function flashBar(beatIdx, t) {
      var msUntil = (t - audioCtx.currentTime) * 1000;
      setTimeout(function () {
        bars.forEach(function (b, i) {
          if (i === beatIdx) {
            b.style.opacity = '1';
            b.style.transform = 'scaleY(1.2)';
            b.style.transformOrigin = '50% 100%';
            b.style.transformBox = 'fill-box';
            // Decay it back over the next 120ms
            setTimeout(function () {
              b.style.opacity = '0.42';
              b.style.transform = 'scaleY(1.0)';
            }, 120);
          }
        });
      }, Math.max(0, msUntil));
    }
    function scheduler() {
      while (nextNoteTime < audioCtx.currentTime + 0.10) {
        tickClick(nextNoteTime, currentBeat === 0);
        flashBar(currentBeat, nextNoteTime);
        nextNoteTime += 60.0 / bpm;
        currentBeat = (currentBeat + 1) % beats;
      }
      schedulerId = requestAnimationFrame(scheduler);
    }
    function start() {
      ensureAudio();
      running = true;
      card.classList.add('is-running');
      // Suppress the CSS ambient cycle by clearing animation; we drive
      // the bars from JS now.
      bars.forEach(function (b) {
        b.style.animation = 'none';
        b.style.opacity = '0.42';
        b.style.transform = 'scaleY(1.0)';
      });
      if (glyph) glyph.style.opacity = '0';
      nextNoteTime = audioCtx.currentTime + 0.05;
      currentBeat = 0;
      schedulerId = requestAnimationFrame(scheduler);
      statusEl.textContent = bpm + ' BPM · ●';
    }
    function stop() {
      if (schedulerId) cancelAnimationFrame(schedulerId);
      schedulerId = null;
      running = false;
      card.classList.remove('is-running');
      // Restore CSS ambient cycle.
      bars.forEach(function (b) {
        b.style.animation = '';
        b.style.opacity = '';
        b.style.transform = '';
      });
      if (glyph) glyph.style.opacity = '';
      statusEl.textContent = bpm + ' BPM · TAP';
    }

    tap.addEventListener('click', function (e) {
      suppress(e);
      if (running) stop(); else start();
    });
  }

  // ============================================================
  // SIGNAL GEN card — pick a waveform, tap to play/stop oscillator
  // ============================================================
  function buildSignalGen() {
    var card = document.querySelector('[data-home-demo="signal-generator"]');
    if (!card) return;
    var pathBg = card.querySelector('[data-home-sig-wave-path]');
    var pathFg = card.querySelector('[data-home-sig-wave-path-fg]');
    var tap    = card.querySelector('[data-home-sig-tap]');
    var status = card.querySelector('[data-home-sig-status]');
    var glyph  = card.querySelector('[data-home-sig-glyph]');
    var chips  = card.querySelectorAll('[data-home-sig-wave]');
    if (!pathBg || !pathFg || !tap || !status) return;

    var waveType = 'sine';
    var freq = 440;
    var running = false;
    var osc = null, gainNode = null;

    // ----- Waveform path generator (drawn into a 700×140 viewBox) -----
    function buildPath(kind) {
      var W = 700, H = 140;
      var midY = H * 0.5;
      var amp = H * 0.34;
      var steps = 100;
      var d = '';
      if (kind === 'sine') {
        for (var i = 0; i <= steps; i++) {
          var t = i / steps;
          var x = t * W;
          var y = midY + Math.sin(t * 4 * Math.PI) * amp;
          d += (i === 0 ? 'M ' : ' L ') + x.toFixed(1) + ' ' + y.toFixed(2);
        }
      } else if (kind === 'square') {
        var period = W / 2;
        for (var k = 0; k < 2; k++) {
          var x0 = k * period;
          var x1 = x0 + period * 0.5;
          var x2 = x0 + period;
          if (k === 0) d += 'M ' + x0.toFixed(1) + ' ' + (midY - amp);
          d += ' L ' + x1.toFixed(1) + ' ' + (midY - amp);
          d += ' L ' + x1.toFixed(1) + ' ' + (midY + amp);
          d += ' L ' + x2.toFixed(1) + ' ' + (midY + amp);
        }
      } else if (kind === 'sawtooth') {
        var pd = W / 2;
        for (var s = 0; s < 2; s++) {
          var sx0 = s * pd;
          var sx1 = sx0 + pd;
          if (s === 0) d += 'M ' + sx0.toFixed(1) + ' ' + (midY + amp);
          d += ' L ' + sx1.toFixed(1) + ' ' + (midY - amp);
          d += ' L ' + sx1.toFixed(1) + ' ' + (midY + amp);
        }
      } else if (kind === 'triangle') {
        var tp = W / 2;
        for (var u = 0; u < 2; u++) {
          var ux0 = u * tp;
          var uxMid = ux0 + tp * 0.5;
          var ux1 = ux0 + tp;
          if (u === 0) d += 'M ' + ux0.toFixed(1) + ' ' + midY;
          d += ' L ' + uxMid.toFixed(1) + ' ' + (midY - amp);
          d += ' L ' + ux1.toFixed(1) + ' ' + midY;
        }
      }
      return d;
    }
    function refreshPath() {
      var d = buildPath(waveType);
      pathBg.setAttribute('d', d);
      pathFg.setAttribute('d', d);
    }

    function start() {
      ensureAudio();
      osc = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();
      osc.type = waveType;
      osc.frequency.value = freq;
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      // Square/saw are louder than sine; reduce gain for those
      var peak = (waveType === 'sine' || waveType === 'triangle') ? 0.12 : 0.07;
      gainNode.gain.linearRampToValueAtTime(peak, audioCtx.currentTime + 0.05);
      osc.connect(gainNode).connect(audioCtx.destination);
      osc.start();
      running = true;
      if (glyph) glyph.style.opacity = '0';
      status.textContent = freq + ' Hz · ●';
    }
    function stop() {
      if (gainNode) {
        try {
          gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
        } catch (e) {}
      }
      if (osc) {
        try { osc.stop(audioCtx.currentTime + 0.07); } catch (e) {}
      }
      osc = null;
      gainNode = null;
      running = false;
      if (glyph) glyph.style.opacity = '1';
      status.textContent = freq + ' Hz · TAP';
    }

    tap.addEventListener('click', function (e) {
      suppress(e);
      if (running) stop(); else start();
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        suppress(e);
        waveType = chip.getAttribute('data-home-sig-wave');
        chips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        refreshPath();
        if (osc) { try { osc.type = waveType; } catch (err) {} }
      });
    });

    refreshPath();
  }

  // ============================================================
  // Init — wait until the renderer has populated the grid.
  // ============================================================
  function init() {
    // Poll briefly because the grid is rendered by ose-renderer.js with
    // defer + data-driven HTML. Wait up to ~1.2s for the cards to appear.
    var attempts = 0;
    function tryWire() {
      var ready = document.querySelector('[data-home-demo]');
      if (ready) {
        try { buildPlay(); }       catch (e) { console.warn('home play demo:', e); }
        try { buildMetronome(); }  catch (e) { console.warn('home metronome demo:', e); }
        try { buildSignalGen(); }  catch (e) { console.warn('home sig-gen demo:', e); }
        return;
      }
      attempts++;
      if (attempts < 24) setTimeout(tryWire, 50);
    }
    tryWire();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
