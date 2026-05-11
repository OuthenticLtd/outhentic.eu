/* =========================================================
   OSE — interactive tutorial widgets (v2 — matches actual app UI)
   - VintageMeterFace tuner (half-arc with pivot below canvas,
     dense tick hierarchy at every 1¢, ghost note in upper portion)
   - ClickTrackFace metronome (BPM digit + adaptive polygon
     + 4/4 meter on warm amber-glass panel)
   - Speed/pitch slider with visible waveform stretch
   - Real piano with interspersed black sharps
   - Long-press → MIDI Learn bottom sheet
   ========================================================= */
(function () {

  var TEMPO_MARKING = function (bpm) {
    if (bpm < 40)  return 'LARGHISSIMO';
    if (bpm < 60)  return 'LARGO';
    if (bpm < 66)  return 'LARGHETTO';
    if (bpm < 76)  return 'ADAGIO';
    if (bpm < 108) return 'ANDANTE';
    if (bpm < 120) return 'MODERATO';
    if (bpm < 156) return 'ALLEGRO';
    if (bpm < 168) return 'VIVACE';
    if (bpm < 200) return 'PRESTO';
    return 'PRESTISSIMO';
  };

  // ============================================================
  // 1. METRONOME — ClickTrackFace with proper layout
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
    var bpmDigit   = demo.querySelector('[data-met-bpm-digit]');
    var tempoLabel = demo.querySelector('[data-met-tempo-marking]');
    var numLabel   = demo.querySelector('[data-met-num]');
    var denLabel   = demo.querySelector('[data-met-den]');

    var audioCtx = null;
    var schedulerId = null;
    var nextNoteTime = 0;
    var currentBeat = 0;
    var beatStates = [];
    var bpm = 120;
    var beats = 4;

    function vertexAt(i, n, r) {
      var ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      return { x: Math.cos(ang) * r, y: Math.sin(ang) * r };
    }
    function polygonPoints(n, r) {
      var pts = [];
      for (var i = 0; i < n; i++) {
        var v = vertexAt(i, n, r);
        pts.push(v.x.toFixed(2) + ',' + v.y.toFixed(2));
      }
      return pts.join(' ');
    }
    function rebuildPolygon() {
      var outline = polySvg.querySelector('polygon:first-of-type');
      var fill    = polySvg.querySelectorAll('polygon')[1];
      var dot     = polySvg.querySelector('[data-met-dot]');
      outline.setAttribute('points', polygonPoints(beats, 26));
      fill.setAttribute('points',    polygonPoints(beats, 18));
      var v0 = vertexAt(0, beats, 26);
      dot.setAttribute('cx', v0.x);
      dot.setAttribute('cy', v0.y);
    }
    function rebuildBeatStrip() {
      beatStrip.innerHTML = '';
      beatStates = [];
      for (var i = 0; i < beats; i++) {
        beatStates.push(i === 0 ? 'accent' : 'normal');
        var col = document.createElement('div');
        col.className = 'ctf-beat-col';
        col.setAttribute('data-state', beatStates[i]);
        col.setAttribute('data-idx', String(i));
        var num = document.createElement('span');
        num.className = 'ctf-beat-num';
        num.textContent = String(i + 1);
        col.appendChild(num);
        col.addEventListener('click', function (e) {
          var idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
          var cur = beatStates[idx];
          var next = cur === 'accent' ? 'normal' : (cur === 'normal' ? 'silent' : 'accent');
          beatStates[idx] = next;
          e.currentTarget.setAttribute('data-state', next);
        });
        beatStrip.appendChild(col);
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
      var msUntil = (t - audioCtx.currentTime) * 1000;
      setTimeout(function () {
        var dot = polySvg.querySelector('[data-met-dot]');
        var v = vertexAt(beatIdx, beats, 26);
        dot.style.transition = 'cx 80ms linear, cy 80ms linear';
        dot.setAttribute('cx', v.x);
        dot.setAttribute('cy', v.y);
        var cols = beatStrip.querySelectorAll('.ctf-beat-col');
        cols.forEach(function (d) { d.classList.remove('is-playing'); });
        if (cols[beatIdx]) {
          cols[beatIdx].classList.add('is-playing');
          setTimeout(function () { cols[beatIdx].classList.remove('is-playing'); }, 120);
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
      beatStrip.querySelectorAll('.ctf-beat-col').forEach(function (d) { d.classList.remove('is-playing'); });
    }
    function updateBpm() {
      bpm = parseInt(bpmSlider.value, 10);
      bpmValue.textContent = bpm;
      bpmDigit.textContent = bpm;
      tempoLabel.textContent = 'BPM · ' + TEMPO_MARKING(bpm);
    }
    function updateSig() {
      beats = parseInt(sigSlider.value, 10);
      sigValue.textContent = beats + ' / 4';
      numLabel.textContent = beats;
      rebuildPolygon();
      rebuildBeatStrip();
    }
    bpmSlider.addEventListener('input', updateBpm);
    sigSlider.addEventListener('input', updateSig);
    startBtn.addEventListener('click', function () { if (schedulerId) stop(); else start(); });
    updateBpm();
    updateSig();
  }

  // ============================================================
  // 2. SPEED / PITCH SLIDER — waveform stretches, pitch reads
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

    var heights = [42,60,28,50,72,36,58,30,64,44,52,38,68,32,56,42,60,28,50,70,36,58,32,64,44,50,38,68,32,56];
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
      inner.style.setProperty('--stretch', (1 / speed).toFixed(3));
      var hz = 440 * Math.pow(2, semis / 12);
      pitchHz.textContent = hz.toFixed(1) + ' Hz';
    }
    speedSlider.addEventListener('input', update);
    pitchSlider.addEventListener('input', update);
    update();
  }

  // ============================================================
  // 3. TUNER — VintageMeterFace with proper half-arc
  //    Pivot is at (140, 512) in the 280×260 viewBox — that's
  //    well below the canvas, so the visible top of the arc
  //    appears nearly straight (PiaScore layout).
  //    Sweep ±22° from vertical, mapped to ±50 cents.
  //    Tick hierarchy: 0 / ±50 / ±25 / every 10 / every 5 / every 1
  // ============================================================
  function buildTuner() {
    var demo = document.querySelector('[data-demo="tuner"]');
    if (!demo) return;
    var slider     = demo.querySelector('[data-tn-tune]');
    var centsValue = demo.querySelector('[data-tn-cents]');
    var hzValue    = demo.querySelector('[data-tn-hz]');
    var needle     = demo.querySelector('[data-tn-needle]');
    var needleLine = demo.querySelector('[data-tn-needle-line]');
    var halo       = demo.querySelector('[data-tn-halo]');
    var ledIn      = demo.querySelector('[data-tn-led-in]');
    var ledFlat    = demo.querySelector('[data-tn-led-flat]');
    var ledSharp   = demo.querySelector('[data-tn-led-sharp]');
    var snapToggle = demo.querySelector('[data-tn-snap]');
    var ticksHost  = demo.querySelector('[data-tn-ticks]');
    var glass      = demo.querySelector('[data-tn-glass]');

    // Render ticks every 1¢ with hierarchy. Pivot at SVG y=512, radius 460.
    // Sweep half-angle = 22° from vertical → max angle 22deg → sin(22°)≈0.375.
    // So tip span ≈ 460*sin(22°)*2 ≈ 345 (fits the 280-wide viewBox via padding).
    var ARC_R = 460;
    var HALF_DEG = 22;
    var ticks = '';
    for (var c = -50; c <= 50; c++) {
      var angDeg = (c / 50) * HALF_DEG;
      var angRad = angDeg * Math.PI / 180;
      var sinA = Math.sin(angRad);
      var cosA = Math.cos(angRad);
      var len, width, opacity, color;
      if (c === 0) {
        len = 18; width = 2.2; opacity = 1.0; color = '#FFFFFF';
      } else if (c === -50 || c === 50) {
        len = 16; width = 1.8; opacity = 0.95; color = '#FFFFFF';
      } else if (c === -25 || c === 25) {
        len = 14; width = 1.6; opacity = 0.95; color = '#FFFFFF';
      } else if (c % 10 === 0) {
        len = 10; width = 1.2; opacity = 0.70; color = '#FFFFFF';
      } else if (c % 5 === 0) {
        len = 7;  width = 1.0; opacity = 0.55; color = '#FFFFFF';
      } else {
        len = 4;  width = 0.8; opacity = 0.30; color = '#FFFFFF';
      }
      // The tick sits along the arc: from radius (ARC_R - len) to ARC_R, pointing outward
      // In our coord frame the pivot is at (0, 0) translated to (140, 512), so points
      // are calculated as: (sinA * r, -cosA * r) where r is the distance from pivot.
      var x1 = (sinA * (ARC_R - len)).toFixed(2);
      var y1 = (-cosA * (ARC_R - len)).toFixed(2);
      var x2 = (sinA * ARC_R).toFixed(2);
      var y2 = (-cosA * ARC_R).toFixed(2);
      ticks += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2
            +  '" stroke="' + color + '" stroke-opacity="' + opacity
            +  '" stroke-width="' + width + '" stroke-linecap="square"/>';
    }
    ticksHost.innerHTML = ticks;

    function update() {
      var cents = parseInt(slider.value, 10);
      var snap  = snapToggle.checked && Math.abs(cents) <= 3;
      var displayCents = snap ? 0 : cents;
      var deg = (displayCents / 50) * HALF_DEG;
      needle.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' 0 0)');
      var sign = displayCents > 0 ? '+' : '';
      centsValue.textContent = sign + displayCents + '¢';
      // Hz: cents shift from A4 440.
      var hz = 440 * Math.pow(2, displayCents / 1200);
      hzValue.textContent = hz.toFixed(1) + ' Hz';
      // LEDs
      ledIn.setAttribute('data-on',    snap ? 'true' : 'false');
      ledFlat.setAttribute('data-on',  (!snap && cents < -5) ? 'true' : 'false');
      ledSharp.setAttribute('data-on', (!snap && cents > 5)  ? 'true' : 'false');
      // Needle color & halo
      needleLine.setAttribute('stroke', snap ? '#3CCB69' : '#FFFFFF');
      halo.setAttribute('opacity', snap ? '0.85' : '0');
      // Cents text color
      var col = snap ? '#3CCB69' : (Math.abs(cents) <= 5 ? 'var(--c-tuner)' : 'var(--ink-soft)');
      centsValue.style.color = col;
      // Glass green-cast tint when snapped
      if (snap) glass.classList.add('vmf-snapped');
      else glass.classList.remove('vmf-snapped');
    }
    slider.addEventListener('input', update);
    snapToggle.addEventListener('change', update);
    update();
  }

  // ============================================================
  // 4. LONG-PRESS DEMO — hold 600ms, sheet slides up, auto-binds
  // ============================================================
  function buildLongPress() {
    var demo = document.querySelector('[data-demo="long-press"]');
    if (!demo) return;
    var pad      = demo.querySelector('[data-lp-pad]');
    var sheet    = demo.querySelector('[data-lp-sheet]');
    var label    = demo.querySelector('[data-lp-label]');
    var resetBtn = demo.querySelector('[data-lp-reset]');

    var pressTimer = null;
    var sheetTimer = null;
    var bound = false;
    var keys = ['CC 64 · Sustain', 'CC 67 · Pedal', 'Note C-2', 'CC 1 · Mod'];
    var lastKey = 0;

    function startPress() {
      if (bound) return;
      pad.setAttribute('data-pressing', 'true');
      pressTimer = setTimeout(function () {
        pad.setAttribute('data-pressing', 'false');
        sheet.setAttribute('data-open', 'true');
        sheetTimer = setTimeout(function () {
          var which = keys[lastKey % keys.length]; lastKey++;
          sheet.setAttribute('data-open', 'false');
          pad.setAttribute('data-bound', 'true');
          bound = true;
          label.textContent = 'BOUND · ' + which;
        }, 1800);
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
  // 5. LAYERED KEYBOARD — real piano with interspersed sharps
  //    14 white keys (C4–B5), 10 black keys at proper seams.
  //    Tap any key to hear a piano (left of split) or strings
  //    (right of split) tone via Web Audio.
  // ============================================================
  function buildLayerKeys() {
    var demo = document.querySelector('[data-demo="layer-keys"]');
    if (!demo) return;
    var piano       = demo.querySelector('[data-lk-piano]');
    var whitesHost  = demo.querySelector('[data-lk-whites]');
    var blacksHost  = demo.querySelector('[data-lk-blacks]');
    var splitLine   = demo.querySelector('[data-lk-split-line]');
    var splitSlider = demo.querySelector('[data-lk-split]');
    var splitValue  = demo.querySelector('[data-lk-split-value]');
    var pianoLabel  = demo.querySelector('[data-lk-piano-label]');
    var stringsLabel = demo.querySelector('[data-lk-strings-label]');

    // 14 white keys C4..B5 with their semitone-from-C4 offset
    var whiteKeys = [
      { n: 'C4',  s:  0 }, { n: 'D4',  s:  2 }, { n: 'E4',  s:  4 }, { n: 'F4',  s:  5 },
      { n: 'G4',  s:  7 }, { n: 'A4',  s:  9 }, { n: 'B4',  s: 11 },
      { n: 'C5',  s: 12 }, { n: 'D5',  s: 14 }, { n: 'E5',  s: 16 }, { n: 'F5',  s: 17 },
      { n: 'G5',  s: 19 }, { n: 'A5',  s: 21 }, { n: 'B5',  s: 23 }
    ];
    // Black keys: which white-key-index they sit AFTER, plus their name & semitone offset.
    // No sharp after E (idx 2), no sharp after B (idx 6, 13).
    var blackAfter = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];
    var blackKeys = blackAfter.map(function (afterIdx) {
      var w = whiteKeys[afterIdx];
      return { n: w.n.charAt(0) + '#' + w.n.charAt(1), s: w.s + 1, afterWhite: afterIdx };
    });

    var splitIndex = 4;

    var audioCtx = null;
    function ensureAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }
    function freqOf(semis) { return 261.63 * Math.pow(2, semis / 12); }

    function playNote(semis, isPiano) {
      ensureAudio();
      var t = audioCtx.currentTime;
      // Piano: triangle + small detuned sine for harmonics. Strings: sawtooth + lowpass.
      if (isPiano) {
        var osc1 = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.value = freqOf(semis);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.20, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        osc1.connect(gain).connect(audioCtx.destination);
        osc1.start(t); osc1.stop(t + 1.0);
      } else {
        var osc = audioCtx.createOscillator();
        var lp  = audioCtx.createBiquadFilter();
        var g   = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freqOf(semis);
        lp.type = 'lowpass';
        lp.frequency.value = freqOf(semis) * 3;
        lp.Q.value = 1.0;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.14, t + 0.18);
        g.gain.setValueAtTime(0.14, t + 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        osc.connect(lp).connect(g).connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 1.5);
      }
    }

    function buildKeys() {
      whitesHost.innerHTML = '';
      blacksHost.innerHTML = '';
      whiteKeys.forEach(function (k, i) {
        var wk = document.createElement('div');
        wk.className = 'tut-w-key';
        wk.setAttribute('data-idx', String(i));
        // Tint by zone
        if (i < splitIndex) wk.style.backgroundColor = 'color-mix(in srgb, #FF8A2A 28%, #FFFFF0)';
        else                wk.style.backgroundColor = 'color-mix(in srgb, #4AA3FF 28%, #FFFFF0)';
        var lab = document.createElement('span');
        lab.className = 'tut-w-label';
        lab.textContent = k.n;
        wk.appendChild(lab);
        wk.addEventListener('pointerdown', function () {
          var idx = parseInt(wk.getAttribute('data-idx'), 10);
          var isPiano = idx < splitIndex;
          wk.classList.add('is-playing');
          playNote(whiteKeys[idx].s, isPiano);
          setTimeout(function () { wk.classList.remove('is-playing'); }, 180);
        });
        whitesHost.appendChild(wk);
      });
      // Black keys positioned by percentage on top of the white-key row.
      // Each white key occupies (100/14)% ≈ 7.143%. Black key sits at the seam
      // = (afterWhite + 1) * (100/14)% offset, centred (black width ≈ 7% so
      // offset by -3.5% from the seam).
      var whiteW = 100 / 14;
      var blackW = whiteW * 0.62;
      blackKeys.forEach(function (b, i) {
        var seam = (b.afterWhite + 1) * whiteW;
        var bk = document.createElement('div');
        bk.className = 'tut-b-key';
        bk.style.left = (seam - blackW / 2) + '%';
        bk.style.width = blackW + '%';
        // Zone-aware tint (slightly less saturated than the whites)
        var blackIdxAfter = b.afterWhite;
        // Black keys between two same-zone whites belong to that zone.
        // At the split boundary the black key belongs to the LEFT zone (below split).
        var inLeftZone = (blackIdxAfter + 1) <= splitIndex;
        if (inLeftZone) bk.style.backgroundColor = '#3a1f08';
        else            bk.style.backgroundColor = '#0a1a2b';
        bk.setAttribute('data-i', String(i));
        bk.addEventListener('pointerdown', function () {
          var ii = parseInt(bk.getAttribute('data-i'), 10);
          var bb = blackKeys[ii];
          var isPiano = (bb.afterWhite + 1) <= splitIndex;
          bk.classList.add('is-playing');
          playNote(bb.s, isPiano);
          setTimeout(function () { bk.classList.remove('is-playing'); }, 180);
        });
        blacksHost.appendChild(bk);
      });
      // Split marker line — at the seam between (splitIndex-1) and splitIndex.
      splitLine.style.left = (splitIndex * whiteW) + '%';
      // Labels
      splitValue.textContent = whiteKeys[splitIndex] ? whiteKeys[splitIndex].n : '—';
      pianoLabel.textContent  = whiteKeys[0].n + ' — ' + (splitIndex > 0 ? whiteKeys[splitIndex - 1].n : whiteKeys[0].n);
      stringsLabel.textContent = (whiteKeys[splitIndex] ? whiteKeys[splitIndex].n : whiteKeys[whiteKeys.length - 1].n)
                              + ' — ' + whiteKeys[whiteKeys.length - 1].n;
    }
    splitSlider.addEventListener('input', function () {
      splitIndex = parseInt(splitSlider.value, 10);
      buildKeys();
    });
    buildKeys();
  }

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
