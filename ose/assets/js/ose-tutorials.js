/* =========================================================
   OSE — interactive tutorial widgets
   - Working metronome (Web Audio + animated polygon)
   - Speed/pitch slider with stretching waveform
   - Tuner-needle drift+snap demo
   - Long-press → MIDI Learn sheet flow
   - Layer-zone keyboard
   - All run with no external deps.
   ========================================================= */
(function () {

  // ============================================================
  // 1. WORKING METRONOME — Web Audio click + polygon orbit + dots
  // ============================================================
  function buildMetronome() {
    var demo = document.querySelector('[data-demo="metronome"]');
    if (!demo) return;
    var bpmSlider  = demo.querySelector('[data-met-bpm]');
    var bpmValue   = demo.querySelector('[data-met-bpm-value]');
    var sigSlider  = demo.querySelector('[data-met-sig]');
    var sigValue   = demo.querySelector('[data-met-sig-value]');
    var startBtn   = demo.querySelector('[data-met-start]');
    var beatStrip  = demo.querySelector('[data-met-beats]');
    var polySvg    = demo.querySelector('[data-met-poly]');
    var polyShape  = polySvg.querySelector('polygon');
    var orbitDot   = polySvg.querySelector('[data-met-dot]');

    var audioCtx = null;
    var schedulerId = null;
    var nextNoteTime = 0;
    var currentBeat = 0;
    var beatStates = []; // 'accent' | 'normal' | 'silent'
    var bpm = 120;
    var beats = 4;

    function polygonPoints(n, r) {
      var pts = [];
      for (var i = 0; i < n; i++) {
        var ang = (i / n) * Math.PI * 2 - Math.PI / 2;
        pts.push((Math.cos(ang) * r).toFixed(2) + ',' + (Math.sin(ang) * r).toFixed(2));
      }
      return pts.join(' ');
    }
    function vertexAt(i, n, r) {
      var ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      return { x: Math.cos(ang) * r, y: Math.sin(ang) * r };
    }
    function rebuildPolygon() {
      polyShape.setAttribute('points', polygonPoints(beats, 50));
      // Place orbit dot at vertex 0 initially
      var v = vertexAt(0, beats, 50);
      orbitDot.setAttribute('cx', v.x);
      orbitDot.setAttribute('cy', v.y);
    }
    function rebuildBeatStrip() {
      beatStrip.innerHTML = '';
      beatStates = [];
      for (var i = 0; i < beats; i++) {
        beatStates.push(i === 0 ? 'accent' : 'normal');
        var dot = document.createElement('button');
        dot.className = 'tut-beat-dot';
        dot.setAttribute('data-state', beatStates[i]);
        dot.setAttribute('data-idx', String(i));
        dot.textContent = String(i + 1);
        dot.addEventListener('click', function (e) {
          var idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
          var cur = beatStates[idx];
          var next = cur === 'accent' ? 'normal' : (cur === 'normal' ? 'silent' : 'accent');
          beatStates[idx] = next;
          e.currentTarget.setAttribute('data-state', next);
        });
        beatStrip.appendChild(dot);
      }
    }
    function tickClick(t, accent) {
      if (!audioCtx) return;
      var osc  = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = accent ? 1500 : 1100;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(accent ? 0.25 : 0.15, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    }
    function scheduleAnimation(beatIdx, t) {
      // Animate orbit dot to vertex `beatIdx` and flash the corresponding beat dot.
      var msUntil = (t - audioCtx.currentTime) * 1000;
      setTimeout(function () {
        var v = vertexAt(beatIdx, beats, 50);
        orbitDot.style.transition = 'cx 80ms linear, cy 80ms linear';
        orbitDot.setAttribute('cx', v.x);
        orbitDot.setAttribute('cy', v.y);
        // Flash dot
        var dots = beatStrip.querySelectorAll('.tut-beat-dot');
        dots.forEach(function (d) { d.classList.remove('is-playing'); });
        if (dots[beatIdx]) {
          dots[beatIdx].classList.add('is-playing');
          setTimeout(function () { dots[beatIdx].classList.remove('is-playing'); }, 120);
        }
      }, Math.max(0, msUntil));
    }
    function scheduler() {
      while (nextNoteTime < audioCtx.currentTime + 0.10) {
        var state = beatStates[currentBeat] || 'normal';
        if (state !== 'silent') tickClick(nextNoteTime, state === 'accent');
        scheduleAnimation(currentBeat, nextNoteTime);
        nextNoteTime += 60.0 / bpm;
        currentBeat = (currentBeat + 1) % beats;
      }
      schedulerId = requestAnimationFrame(scheduler);
    }
    function start() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      nextNoteTime = audioCtx.currentTime + 0.05;
      currentBeat = 0;
      schedulerId = requestAnimationFrame(scheduler);
      startBtn.setAttribute('data-running', 'true');
      startBtn.textContent = 'STOP';
    }
    function stop() {
      if (schedulerId) cancelAnimationFrame(schedulerId);
      schedulerId = null;
      startBtn.setAttribute('data-running', 'false');
      startBtn.textContent = 'START';
      beatStrip.querySelectorAll('.tut-beat-dot').forEach(function (d) { d.classList.remove('is-playing'); });
    }
    bpmSlider.addEventListener('input', function () {
      bpm = parseInt(bpmSlider.value, 10);
      bpmValue.textContent = bpm + ' BPM';
    });
    sigSlider.addEventListener('input', function () {
      beats = parseInt(sigSlider.value, 10);
      sigValue.textContent = beats + ' / 4';
      rebuildPolygon();
      rebuildBeatStrip();
    });
    startBtn.addEventListener('click', function () {
      if (schedulerId) stop(); else start();
    });
    rebuildPolygon();
    rebuildBeatStrip();
  }

  // ============================================================
  // 2. SPEED/PITCH SLIDER — visible waveform stretching
  // ============================================================
  function buildSpeedPitch() {
    var demo = document.querySelector('[data-demo="speed-pitch"]');
    if (!demo) return;
    var speedSlider = demo.querySelector('[data-sp-speed]');
    var speedValue  = demo.querySelector('[data-sp-speed-value]');
    var pitchSlider = demo.querySelector('[data-sp-pitch]');
    var pitchValue  = demo.querySelector('[data-sp-pitch-value]');
    var stretchBox  = demo.querySelector('[data-sp-stretch]');
    var pitchHz     = demo.querySelector('[data-sp-pitch-hz]');

    // Build a fixed waveform of bars
    var heights = [42, 60, 28, 50, 72, 36, 58, 30, 64, 44, 52, 38, 68, 32, 56, 42, 60, 28, 50, 70, 36, 58, 32, 64, 44, 50, 38, 68, 32, 56];
    var inner = document.createElement('div');
    inner.className = 'tut-wave-display-stretch';
    heights.forEach(function (h) {
      var b = document.createElement('div');
      b.className = 'tut-wave-bar';
      b.style.height = h + '%';
      inner.appendChild(b);
    });
    stretchBox.appendChild(inner);

    function update() {
      var speed = parseFloat(speedSlider.value);
      var semis = parseInt(pitchSlider.value, 10);
      speedValue.textContent = (speed * 100).toFixed(0) + '%';
      pitchValue.textContent = (semis >= 0 ? '+' : '') + semis + ' st';
      // Stretch visualisation: lower speed => waveform stretches wider visually
      // 1.0x speed => scaleX 1, 0.5x speed => scaleX 1 / 0.5 = 2
      inner.style.setProperty('--stretch', (1 / speed).toFixed(3));
      // Pitch indicator: semitones
      var hz = 440 * Math.pow(2, semis / 12);
      pitchHz.textContent = hz.toFixed(1) + ' Hz';
    }
    speedSlider.addEventListener('input', update);
    pitchSlider.addEventListener('input', update);
    update();
  }

  // ============================================================
  // 3. TUNER NEEDLE — drift toward target, snap green at ±3¢
  // ============================================================
  function buildTuner() {
    var demo = document.querySelector('[data-demo="tuner"]');
    if (!demo) return;
    var slider = demo.querySelector('[data-tn-tune]');
    var centsValue = demo.querySelector('[data-tn-cents]');
    var noteValue  = demo.querySelector('[data-tn-note]');
    var needle     = demo.querySelector('[data-tn-needle]');
    var halo       = demo.querySelector('[data-tn-halo]');
    var ledIn      = demo.querySelector('[data-tn-led-in]');
    var ledFlat    = demo.querySelector('[data-tn-led-flat]');
    var ledSharp   = demo.querySelector('[data-tn-led-sharp]');
    var snapToggle = demo.querySelector('[data-tn-snap]');

    function update() {
      var cents = parseInt(slider.value, 10);
      var snap  = snapToggle.checked && Math.abs(cents) <= 3;
      var displayCents = snap ? 0 : cents;
      var deg = (displayCents / 50) * 60; // ±50¢ → ±60°
      needle.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' 0 0)');
      var sign = displayCents > 0 ? '+' : '';
      centsValue.textContent = sign + displayCents + '¢';
      // LEDs
      ledIn.setAttribute('data-on', snap ? 'true' : 'false');
      ledFlat.setAttribute('data-on', (!snap && cents < -5) ? 'true' : 'false');
      ledSharp.setAttribute('data-on', (!snap && cents > 5) ? 'true' : 'false');
      // Halo
      halo.style.opacity = snap ? '0.6' : '0';
      // Note name + readout color
      var col = snap ? '#3CCB69' : (Math.abs(cents) <= 5 ? 'var(--c-tuner)' : '#7A7A82');
      centsValue.style.color = col;
      noteValue.style.color  = col;
      needle.querySelector('line').setAttribute('stroke', snap ? '#3CCB69' : '#ECECEE');
    }
    slider.addEventListener('input', update);
    snapToggle.addEventListener('change', update);
    update();
  }

  // ============================================================
  // 4. LONG-PRESS DEMO — hold the pad for 600ms, sheet slides up
  // ============================================================
  function buildLongPress() {
    var demo = document.querySelector('[data-demo="long-press"]');
    if (!demo) return;
    var pad   = demo.querySelector('[data-lp-pad]');
    var sheet = demo.querySelector('[data-lp-sheet]');
    var label = demo.querySelector('[data-lp-label]');
    var resetBtn = demo.querySelector('[data-lp-reset]');

    var pressTimer = null;
    var sheetTimer = null;
    var bound = false;
    var keys = ['Spacebar', 'Pedal CC 67', 'Note C-2', 'Knob CC 1'];
    var lastKey = 0;

    function startPress() {
      if (bound) return;
      pad.setAttribute('data-pressing', 'true');
      pressTimer = setTimeout(function () {
        pad.setAttribute('data-pressing', 'false');
        sheet.setAttribute('data-open', 'true');
        // Auto-bind after 1.6s of "listening"
        sheetTimer = setTimeout(function () {
          var which = keys[lastKey % keys.length]; lastKey++;
          sheet.setAttribute('data-open', 'false');
          pad.setAttribute('data-bound', 'true');
          bound = true;
          label.textContent = 'BOUND · ' + which;
        }, 1600);
      }, 600);
    }
    function endPress() {
      pad.setAttribute('data-pressing', 'false');
      if (pressTimer) clearTimeout(pressTimer);
    }
    function reset() {
      bound = false;
      pad.setAttribute('data-bound', 'false');
      sheet.setAttribute('data-open', 'false');
      label.textContent = 'LOOP TOGGLE';
      if (pressTimer) clearTimeout(pressTimer);
      if (sheetTimer) clearTimeout(sheetTimer);
    }
    pad.addEventListener('pointerdown',   startPress);
    pad.addEventListener('pointerup',     endPress);
    pad.addEventListener('pointerleave',  endPress);
    pad.addEventListener('pointercancel', endPress);
    resetBtn.addEventListener('click', reset);
  }

  // ============================================================
  // 5. LAYERED KEYBOARD — click keys, see which zone responds
  // ============================================================
  function buildLayerKeys() {
    var demo = document.querySelector('[data-demo="layer-keys"]');
    if (!demo) return;
    var keysHost = demo.querySelector('[data-lk-keys]');
    var splitSlider = demo.querySelector('[data-lk-split]');
    var splitValue  = demo.querySelector('[data-lk-split-value]');
    var pianoLabel  = demo.querySelector('[data-lk-piano-label]');
    var stringsLabel = demo.querySelector('[data-lk-strings-label]');

    var noteNames = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5','B5'];
    var splitIndex = 4; // G4
    var keys = [];

    var audioCtx = null;
    function ensureAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }
    function midiOf(idx) { return 60 + idx + (idx > 6 ? 0 : 0); } // C4=60..B5
    function freqOf(idx) { return 261.63 * Math.pow(2, idx / 12); }
    function playNote(idx, isPiano) {
      ensureAudio();
      var t = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = isPiano ? 'triangle' : 'sawtooth';
      osc.frequency.value = freqOf(idx);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (isPiano ? 0.7 : 1.4));
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 1.5);
    }
    function rebuild() {
      keysHost.innerHTML = '';
      keys = [];
      noteNames.forEach(function (name, i) {
        var k = document.createElement('div');
        k.className = 'tut-key';
        k.setAttribute('data-idx', String(i));
        // Tint based on zone
        if (i < splitIndex) k.style.background = 'color-mix(in srgb, #FF8A2A 25%, #FFFFF0)';
        else                k.style.background = 'color-mix(in srgb, #4AA3FF 25%, #FFFFF0)';
        var label = document.createElement('span');
        label.className = 'tut-key-label';
        label.textContent = name;
        k.appendChild(label);
        k.addEventListener('pointerdown', function () {
          var idx = parseInt(k.getAttribute('data-idx'), 10);
          var isPiano = idx < splitIndex;
          k.classList.add('is-playing');
          k.style.background = isPiano ? '#FF8A2A' : '#4AA3FF';
          playNote(idx, isPiano);
          setTimeout(function () {
            k.classList.remove('is-playing');
            k.style.background = idx < splitIndex
              ? 'color-mix(in srgb, #FF8A2A 25%, #FFFFF0)'
              : 'color-mix(in srgb, #4AA3FF 25%, #FFFFF0)';
          }, 220);
        });
        keysHost.appendChild(k);
        keys.push(k);
      });
      splitValue.textContent = noteNames[splitIndex];
      pianoLabel.textContent  = noteNames[0] + ' — ' + (splitIndex > 0 ? noteNames[splitIndex - 1] : noteNames[0]);
      stringsLabel.textContent = noteNames[splitIndex] + ' — ' + noteNames[noteNames.length - 1];
    }
    splitSlider.addEventListener('input', function () {
      splitIndex = parseInt(splitSlider.value, 10);
      rebuild();
    });
    rebuild();
  }

  // Init all
  function init() {
    try { buildMetronome(); }   catch (e) { console.warn('metronome demo failed:', e); }
    try { buildSpeedPitch(); }  catch (e) { console.warn('speed-pitch demo failed:', e); }
    try { buildTuner(); }       catch (e) { console.warn('tuner demo failed:', e); }
    try { buildLongPress(); }   catch (e) { console.warn('long-press demo failed:', e); }
    try { buildLayerKeys(); }   catch (e) { console.warn('layer-keys demo failed:', e); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
