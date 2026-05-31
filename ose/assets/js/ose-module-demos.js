/* =========================================================
   OSE - module-page interactive demos
   Big working demos on the Play, Metronome and Signal Generator
   module pages so visitors can use the tools directly in the
   browser. The other five modules stay as visual mockups.
   ========================================================= */
(function () {

  var audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  // Set the CSS --fill custom property on a range slider so the
  // linear-gradient track visualizes the current value position.
  function updateSliderFill(slider) {
    if (!slider) return;
    var min = parseFloat(slider.min);
    var max = parseFloat(slider.max);
    var val = parseFloat(slider.value);
    if (isNaN(min) || isNaN(max) || isNaN(val) || max <= min) return;
    var pct = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--fill', pct.toFixed(2) + '%');
  }
  function wireSliderFill(slider) {
    if (!slider) return;
    updateSliderFill(slider);
    slider.addEventListener('input', function () { updateSliderFill(slider); });
  }

  // ============================================================
  // PLAY MODULE - full piano (2 octaves) with voice selector
  // ============================================================
  function buildPlay() {
    var demo = document.querySelector('[data-module-demo="play"]');
    if (!demo) return;
    var pianoHost  = demo.querySelector('[data-pm-piano]');
    var voiceChips = demo.querySelectorAll('[data-pm-voice]');
    var sustainBtn = demo.querySelector('[data-pm-sustain]');
    var statusEl   = demo.querySelector('[data-pm-status]');
    if (!pianoHost) return;

    // 14 white keys C4..B5 with semitone offsets from C4
    var whites = [
      { n: 'C4', s:  0 }, { n: 'D4', s:  2 }, { n: 'E4', s:  4 }, { n: 'F4', s:  5 },
      { n: 'G4', s:  7 }, { n: 'A4', s:  9 }, { n: 'B4', s: 11 },
      { n: 'C5', s: 12 }, { n: 'D5', s: 14 }, { n: 'E5', s: 16 }, { n: 'F5', s: 17 },
      { n: 'G5', s: 19 }, { n: 'A5', s: 21 }, { n: 'B5', s: 23 }
    ];
    var blackAfter = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];
    var blacks = blackAfter.map(function (i) {
      return { n: whites[i].n[0] + '#' + whites[i].n[1], s: whites[i].s + 1, after: i };
    });

    var voice = 'synth';
    var sustain = false;

    function freqOf(semis) { return 261.63 * Math.pow(2, semis / 12); }

    function playNote(semis) {
      ensureAudio();
      var t = audioCtx.currentTime;
      var freq = freqOf(semis);
      var release = sustain ? 2.5 : 0.85;
      if (voice === 'synth') {
        // 2-osc lead - sawtooth + detuned sub
        var osc1 = audioCtx.createOscillator();
        var osc2 = audioCtx.createOscillator();
        var lp   = audioCtx.createBiquadFilter();
        var gain = audioCtx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.value = freq;
        osc2.frequency.value = freq * 0.995;
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(freq * 6, t);
        lp.frequency.exponentialRampToValueAtTime(freq * 2.5, t + 0.5);
        lp.Q.value = 2;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.16, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + release);
        osc1.connect(lp);
        osc2.connect(lp);
        lp.connect(gain).connect(audioCtx.destination);
        osc1.start(t); osc1.stop(t + release + 0.05);
        osc2.start(t); osc2.stop(t + release + 0.05);
      } else if (voice === 'piano') {
        // Triangle + sine octave
        var pOsc1 = audioCtx.createOscillator();
        var pOsc2 = audioCtx.createOscillator();
        var pGain = audioCtx.createGain();
        pOsc1.type = 'triangle';
        pOsc2.type = 'sine';
        pOsc1.frequency.value = freq;
        pOsc2.frequency.value = freq * 2;
        pGain.gain.setValueAtTime(0, t);
        pGain.gain.linearRampToValueAtTime(0.18, t + 0.012);
        pGain.gain.exponentialRampToValueAtTime(0.0001, t + release);
        pOsc1.connect(pGain);
        pOsc2.connect(pGain);
        pGain.connect(audioCtx.destination);
        pOsc1.start(t); pOsc1.stop(t + release + 0.05);
        pOsc2.start(t); pOsc2.stop(t + release + 0.05);
      } else if (voice === 'bass') {
        var bOsc = audioCtx.createOscillator();
        var bLp  = audioCtx.createBiquadFilter();
        var bG   = audioCtx.createGain();
        bOsc.type = 'sawtooth';
        bOsc.frequency.value = freq / 2;
        bLp.type = 'lowpass'; bLp.frequency.value = 800;
        bG.gain.setValueAtTime(0, t);
        bG.gain.linearRampToValueAtTime(0.22, t + 0.010);
        bG.gain.exponentialRampToValueAtTime(0.0001, t + release);
        bOsc.connect(bLp).connect(bG).connect(audioCtx.destination);
        bOsc.start(t); bOsc.stop(t + release + 0.05);
      } else if (voice === 'pad') {
        // Sustained pad with chorus-ish detune
        var pads = [-7, 0, 7].map(function (det) {
          var o = audioCtx.createOscillator();
          o.type = 'sine';
          o.frequency.value = freq * Math.pow(2, det / 1200);
          return o;
        });
        var padLp = audioCtx.createBiquadFilter();
        padLp.type = 'lowpass'; padLp.frequency.value = freq * 4;
        var padG = audioCtx.createGain();
        var padR = sustain ? 4.0 : 1.6;
        padG.gain.setValueAtTime(0, t);
        padG.gain.linearRampToValueAtTime(0.10, t + 0.18);
        padG.gain.exponentialRampToValueAtTime(0.0001, t + padR);
        pads.forEach(function (o) { o.connect(padLp); o.start(t); o.stop(t + padR + 0.05); });
        padLp.connect(padG).connect(audioCtx.destination);
      }
    }

    function buildKeys() {
      pianoHost.innerHTML = '';
      var whitesEl = document.createElement('div');
      whitesEl.className = 'pm-whites';
      whites.forEach(function (k, i) {
        var w = document.createElement('div');
        w.className = 'pm-w-key';
        w.setAttribute('data-semi', String(k.s));
        var label = document.createElement('span');
        label.className = 'pm-key-label';
        label.textContent = k.n;
        w.appendChild(label);
        w.addEventListener('pointerdown', function () {
          var semi = parseInt(w.getAttribute('data-semi'), 10);
          w.classList.add('is-down');
          playNote(semi);
          setTimeout(function () { w.classList.remove('is-down'); }, 200);
        });
        whitesEl.appendChild(w);
      });
      pianoHost.appendChild(whitesEl);
      var blacksEl = document.createElement('div');
      blacksEl.className = 'pm-blacks';
      var whiteW = 100 / whites.length;
      var blackW = whiteW * 0.62;
      blacks.forEach(function (b) {
        var seam = (b.after + 1) * whiteW;
        var bk = document.createElement('div');
        bk.className = 'pm-b-key';
        bk.style.left = (seam - blackW / 2) + '%';
        bk.style.width = blackW + '%';
        bk.setAttribute('data-semi', String(b.s));
        bk.addEventListener('pointerdown', function () {
          var semi = parseInt(bk.getAttribute('data-semi'), 10);
          bk.classList.add('is-down');
          playNote(semi);
          setTimeout(function () { bk.classList.remove('is-down'); }, 200);
        });
        blacksEl.appendChild(bk);
      });
      pianoHost.appendChild(blacksEl);
    }

    // Voice selector
    voiceChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        voice = chip.getAttribute('data-pm-voice');
        voiceChips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        if (statusEl) statusEl.textContent = voice.toUpperCase();
      });
    });
    // Sustain toggle
    if (sustainBtn) {
      sustainBtn.addEventListener('click', function () {
        sustain = !sustain;
        sustainBtn.classList.toggle('is-active', sustain);
        sustainBtn.textContent = sustain ? 'SUSTAIN · ON' : 'SUSTAIN · OFF';
      });
    }
    buildKeys();
  }

  // ============================================================
  // METRONOME MODULE - full ClickTrackFace + working transport demo
  //
  // One-for-one with MetronomeModule.kt + ClickTrackFace.kt:
  //   • 30-300 BPM range, 1-16 beats, /4 /8 /16 note values
  //   • Click sound matches AudioEngine.cpp exactly: 50 ms sine wave,
  //     1500 Hz (accent) or 1000 Hz (normal), linear decay envelope,
  //     output clipped to ±0.95.
  //   • Beat strip: tappable columns, 3 accent states cycle
  //     NORMAL (0) → ACCENT (1) → MUTED (2) → NORMAL. Heights
  //     45% / 78% / 22% of strip height (animated).
  //   • TAP-tempo: average the last 4 intervals, clamp 30-300.
  //   • BPM scrubber: horizontal drag = 1 BPM per 6 px (app convention).
  //   • Tempo polygon: regular n-gon for n beats with a dot
  //     travelling vertex-to-vertex on each beat.
  // ============================================================
  function buildMetronome() {
    var demo = document.querySelector('[data-module-demo="metronome"]');
    if (!demo) return;
    var bpmDigit   = demo.querySelector('[data-mm-bpm-digit]');
    var bpmScrub   = demo.querySelector('[data-mm-bpm-scrubber]');
    var bpmScrubV  = demo.querySelector('[data-mm-bpm-scrubber-value]');
    var tempoLabel = demo.querySelector('[data-mm-tempo]');
    var numLabel   = demo.querySelector('[data-mm-num]');
    var denLabel   = demo.querySelector('[data-mm-den]');
    var startBtn   = demo.querySelector('[data-mm-start]');
    var startLabel = demo.querySelector('[data-mm-start-label]');
    var tapBtn     = demo.querySelector('[data-mm-tap]');
    var strip      = demo.querySelector('[data-mm-strip]');
    var polySvg    = demo.querySelector('[data-mm-poly]');
    var bpmDownBtn = demo.querySelector('[data-mm-bpm-step="-1"]');
    var bpmUpBtn   = demo.querySelector('[data-mm-bpm-step="1"]');
    var tsDownBtn  = demo.querySelector('[data-mm-ts-step="-1"]');
    var tsUpBtn    = demo.querySelector('[data-mm-ts-step="1"]');
    var tsNum      = demo.querySelector('[data-mm-ts-num]');
    var noteChips  = demo.querySelectorAll('[data-mm-note]');
    var meterToggle = demo.querySelector('[data-mm-meter-toggle]');
    var sheet       = demo.querySelector('[data-mm-sheet]');
    var sheetScrim  = demo.querySelector('[data-mm-sheet-scrim]');
    var sheetClose  = demo.querySelector('[data-mm-sheet-close]');
    var beatsWheel  = demo.querySelector('[data-mm-beats-wheel]');
    var noteWheel   = demo.querySelector('[data-mm-note-wheel]');
    var volSlider   = demo.querySelector('[data-mm-vol]');
    var volValue    = demo.querySelector('[data-mm-vol-value]');
    var volReset    = demo.querySelector('[data-mm-vol-reset]');
    if (!startBtn || !polySvg || !strip) return;

    // Persistent audio graph:
    //   osc → clickGain (per-beat envelope) → masterGain (volume) → out
    // masterGain is created once and lives for the page; the volume
    // slider writes directly to masterGain.gain.value, so the change
    // is heard on the *very next sample*, not the next scheduled click.
    var audioCtxLocal = null;
    var masterGain = null;
    function ensure() {
      if (!audioCtxLocal) audioCtxLocal = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtxLocal.state === 'suspended') audioCtxLocal.resume();
      if (!masterGain) {
        masterGain = audioCtxLocal.createGain();
        masterGain.gain.value = volume;
        masterGain.connect(audioCtxLocal.destination);
      }
    }

    var MIN_BPM = 30, MAX_BPM = 300;
    var DEFAULT_VOL = 0.8;        // matches app default
    var schedulerId = null;
    var nextNoteTime = 0;
    var currentBeat = 0;
    var beatStates = [];       // 0 = normal, 1 = accent, 2 = muted
    var bpm = 120;
    var beats = 4;
    var noteValue = 4;
    var volume = DEFAULT_VOL;    // 0..1, multiplies the click peak gain
    var tapTimes = [];

    function tempoMarking(v) {
      if (v < 40)  return 'LARGHISSIMO';
      if (v < 60)  return 'LARGO';
      if (v < 66)  return 'LARGHETTO';
      if (v < 76)  return 'ADAGIO';
      if (v < 108) return 'ANDANTE';
      if (v < 120) return 'MODERATO';
      if (v < 156) return 'ALLEGRO';
      if (v < 168) return 'VIVACE';
      if (v < 200) return 'PRESTO';
      return 'PRESTISSIMO';
    }
    function vertexAt(i, n, r) {
      var ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      return { x: Math.cos(ang) * r, y: Math.sin(ang) * r };
    }
    function polygonPoints(n, r) {
      // Single point for n=1 just draws a tiny line - looks weird, so
      // when n=1 we draw a small circle via 6-point polygon at half
      // radius (matches the app's TempoPolygonIcon n=1 fallback feel).
      if (n < 2) {
        var p = [];
        for (var k = 0; k < 12; k++) {
          var a = (k / 12) * Math.PI * 2 - Math.PI / 2;
          p.push((Math.cos(a) * r * 0.5).toFixed(2) + ',' + (Math.sin(a) * r * 0.5).toFixed(2));
        }
        return p.join(' ');
      }
      var pts = [];
      for (var i = 0; i < n; i++) {
        var v = vertexAt(i, n, r);
        pts.push(v.x.toFixed(2) + ',' + v.y.toFixed(2));
      }
      return pts.join(' ');
    }
    function rebuildPolygon() {
      var outline = polySvg.querySelector('[data-mm-poly-outline]');
      var fill    = polySvg.querySelector('[data-mm-poly-fill]');
      var dot     = polySvg.querySelector('[data-mm-dot]');
      outline.setAttribute('points', polygonPoints(beats, 50));
      fill.setAttribute('points',    polygonPoints(beats, 35));
      var v0 = vertexAt(0, Math.max(beats, 2), 50);
      dot.setAttribute('cx', v0.x);
      dot.setAttribute('cy', v0.y);
    }
    function rebuildBeatStrip() {
      strip.innerHTML = '';
      // Resize state array preserving existing accents where possible.
      var nextStates = [];
      for (var i = 0; i < beats; i++) {
        nextStates.push(beatStates[i] != null ? beatStates[i] : (i === 0 ? 1 : 0));
      }
      beatStates = nextStates;
      // Slot width tapers as the bar count grows (mirrors the
      // Kotlin `(52 - n*2).coerceIn(28, 48)` formula).
      var slot = Math.max(28, Math.min(48, 52 - beats * 2));
      for (var j = 0; j < beats; j++) {
        var col = document.createElement('button');
        col.className = 'mm-col';
        col.style.minWidth = slot + 'px';
        col.style.maxWidth = (slot * 1.6) + 'px';
        col.setAttribute('data-idx', String(j));
        applyBeatState(col, beatStates[j]);
        col.addEventListener('click', function (e) {
          var idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
          // 0=normal → 1=accent → 2=muted → 0
          var c = beatStates[idx];
          var nxt = (c + 1) % 3;
          beatStates[idx] = nxt;
          applyBeatState(e.currentTarget, nxt);
        });
        strip.appendChild(col);
      }
    }
    function applyBeatState(col, state) {
      // State drives both height fraction and the visual data-state.
      // App uses 0.78/0.46/0.22 but the web demo benefits from a more
      // dramatic contrast - accent column now towers at 96 %, normal
      // sits at 50 %, muted at 22 %. The downbeat reads instantly.
      var frac = state === 1 ? 0.96 : state === 2 ? 0.22 : 0.50;
      var stateName = state === 1 ? 'accent' : state === 2 ? 'muted' : 'normal';
      col.setAttribute('data-state', stateName);
      var bar = col.querySelector('.mm-col-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'mm-col-bar';
        col.appendChild(bar);
      }
      bar.style.height = (frac * 100) + '%';
      // Beat numeral lives inside the bar so it scrolls with the
      // accent fill - matches the app's BeatColumn layout.
      bar.textContent = String(parseInt(col.getAttribute('data-idx'), 10) + 1);
    }

    // ── Click synthesis - one-for-one with AudioEngine.cpp ──
    // 50 ms duration, 1500 Hz (accent) / 1000 Hz (normal) sine,
    // linear decay, ±0.95 clip. Skip muted beats entirely.
    // The per-click envelope peaks at HEADROOM (0.85) so we stay
    // under the engine's ±0.95 hidden brick-wall. Volume scaling
    // happens AFTER this stage via the masterGain node - the slider
    // writes to masterGain.gain directly, so volume changes are
    // audible on the very next sample, not the next click.
    function tickClick(t, accentType) {
      if (accentType === 2) return; // muted
      var freq = accentType === 1 ? 1500 : 1000;
      var osc = audioCtxLocal.createOscillator();
      var gain = audioCtxLocal.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      var dur = 0.05;
      var HEADROOM = 0.85;
      gain.gain.setValueAtTime(HEADROOM, t);
      gain.gain.linearRampToValueAtTime(0, t + dur);
      // Route through masterGain so the slider's value applies live.
      osc.connect(gain).connect(masterGain);
      osc.start(t);
      osc.stop(t + dur + 0.005);
    }
    function scheduleAnimation(beatIdx, t) {
      var msUntil = (t - audioCtxLocal.currentTime) * 1000;
      setTimeout(function () {
        var dot = polySvg.querySelector('[data-mm-dot]');
        var v = vertexAt(beatIdx, Math.max(beats, 2), 50);
        dot.style.transition = 'cx 80ms linear, cy 80ms linear';
        dot.setAttribute('cx', v.x);
        dot.setAttribute('cy', v.y);
        var cols = strip.querySelectorAll('.mm-col');
        cols.forEach(function (c) { c.classList.remove('is-live'); });
        if (cols[beatIdx]) {
          cols[beatIdx].classList.add('is-live');
          var col = cols[beatIdx];
          setTimeout(function () { col.classList.remove('is-live'); }, 110);
          // Scroll the active beat into view if the strip is overflowing.
          if (col.offsetLeft < strip.scrollLeft ||
              col.offsetLeft + col.offsetWidth > strip.scrollLeft + strip.clientWidth) {
            strip.scrollTo({ left: col.offsetLeft - 12, behavior: 'smooth' });
          }
        }
      }, Math.max(0, msUntil));
    }
    function scheduler() {
      // Effective BPM scales with the note value (app uses
      // bpm * (beatUnit / 4) so /8 doubles the click rate).
      var effectiveBpm = bpm * (noteValue / 4.0);
      var interval = 60.0 / effectiveBpm;
      while (nextNoteTime < audioCtxLocal.currentTime + 0.10) {
        var s = beatStates[currentBeat] != null ? beatStates[currentBeat] : 0;
        tickClick(nextNoteTime, s);
        scheduleAnimation(currentBeat, nextNoteTime);
        nextNoteTime += interval;
        currentBeat = (currentBeat + 1) % beats;
      }
      schedulerId = requestAnimationFrame(scheduler);
    }
    function start() {
      ensure();
      nextNoteTime = audioCtxLocal.currentTime + 0.05;
      currentBeat = 0;
      schedulerId = requestAnimationFrame(scheduler);
      startBtn.setAttribute('data-running', 'true');
      if (startLabel) startLabel.textContent = 'STOP';
    }
    function stop() {
      if (schedulerId) cancelAnimationFrame(schedulerId);
      schedulerId = null;
      startBtn.setAttribute('data-running', 'false');
      if (startLabel) startLabel.textContent = 'START';
      strip.querySelectorAll('.mm-col').forEach(function (d) { d.classList.remove('is-live'); });
    }
    function setBpm(v) {
      var nv = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(v)));
      if (nv === bpm) return;
      bpm = nv;
      bpmDigit.textContent = bpm;
      bpmScrubV.textContent = bpm;
      tempoLabel.textContent = 'BPM · ' + tempoMarking(bpm);
    }
    function setBeats(n) {
      var nv = Math.max(1, Math.min(16, Math.round(n)));
      if (nv === beats) return;
      beats = nv;
      numLabel.textContent = beats;
      tsNum.textContent = beats;
      currentBeat = Math.min(currentBeat, beats - 1);
      rebuildPolygon();
      rebuildBeatStrip();
    }
    function setNoteValue(d) {
      noteValue = d;
      denLabel.textContent = d;
      noteChips.forEach(function (c) {
        c.classList.toggle('is-active', parseInt(c.getAttribute('data-mm-note'), 10) === d);
      });
    }
    function setVolume(v, source) {
      // v is 0..1; the slider holds 0..100, so we normalise both ways.
      var clamped = Math.max(0, Math.min(1, v));
      if (isNaN(clamped)) clamped = DEFAULT_VOL;
      volume = clamped;
      // Push the new value into the live audio graph IMMEDIATELY.
      // masterGain might not exist yet (created lazily in ensure());
      // setTargetAtTime gives a 6 ms exponential smoother so big
      // jumps don't click.
      if (masterGain && audioCtxLocal) {
        try {
          masterGain.gain.setTargetAtTime(clamped, audioCtxLocal.currentTime, 0.006);
        } catch (e) {
          masterGain.gain.value = clamped;
        }
      }
      var pct = Math.round(clamped * 100);
      if (source !== 'slider' && volSlider) {
        volSlider.value = pct;
      }
      if (volValue) volValue.textContent = pct + '%';
      if (volSlider) updateSliderFill(volSlider);
    }

    // ── BPM scrubber ──
    // Two interactions, like the app:
    //   • Horizontal drag → 1 BPM per 6 px (the wheel scrub feel).
    //   • Click without dragging → tap-to-edit numeric input.
    // We disambiguate by tracking how far the pointer moved before
    // release; <4 px counts as a tap, otherwise it's a scrub gesture
    // and the click handler is suppressed.
    var scrubStart = null;
    var scrubBaseBpm = 120;
    var scrubMaxDelta = 0;
    bpmScrub.addEventListener('pointerdown', function (e) {
      scrubStart = e.clientX; scrubBaseBpm = bpm; scrubMaxDelta = 0;
      bpmScrub.setPointerCapture(e.pointerId);
    });
    bpmScrub.addEventListener('pointermove', function (e) {
      if (scrubStart == null) return;
      var dx = e.clientX - scrubStart;
      if (Math.abs(dx) > scrubMaxDelta) scrubMaxDelta = Math.abs(dx);
      if (Math.abs(dx) >= 4) setBpm(scrubBaseBpm + Math.round(dx / 6));
    });
    function endScrub(e) {
      var wasTap = scrubStart != null && scrubMaxDelta < 4;
      if (scrubStart != null && bpmScrub.hasPointerCapture && bpmScrub.hasPointerCapture(e.pointerId)) {
        bpmScrub.releasePointerCapture(e.pointerId);
      }
      scrubStart = null;
      if (wasTap) openBpmScrubberEditor();
    }
    bpmScrub.addEventListener('pointerup', endScrub);
    bpmScrub.addEventListener('pointercancel', endScrub);

    function openBpmScrubberEditor() {
      // Swap the value span for a numeric input, restore on commit.
      if (bpmScrub.querySelector('.mm-bpm-scrubber-edit')) return;
      var input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'numeric';
      input.className = 'mm-bpm-scrubber-edit';
      input.value = String(bpm);
      input.setAttribute('aria-label', 'Set BPM');
      bpmScrubV.style.display = 'none';
      bpmScrub.insertBefore(input, bpmScrubV);
      input.focus(); input.select();
      function commit() {
        var v = parseInt(input.value, 10);
        if (!isNaN(v)) setBpm(v);
        if (input.parentNode) input.parentNode.removeChild(input);
        bpmScrubV.style.display = '';
      }
      input.addEventListener('blur', commit);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
        else if (e.key === 'Escape') { e.preventDefault(); input.value = bpm; commit(); }
      });
    }

    // BPM ± buttons
    bpmDownBtn.addEventListener('click', function () { setBpm(bpm - 1); });
    bpmUpBtn.addEventListener('click', function () { setBpm(bpm + 1); });

    // TS beats ± buttons
    tsDownBtn.addEventListener('click', function () { setBeats(beats - 1); });
    tsUpBtn.addEventListener('click', function () { setBeats(beats + 1); });

    // Note value chips
    noteChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        setNoteValue(parseInt(chip.getAttribute('data-mm-note'), 10));
      });
    });

    // Volume slider - drag updates volume in real time, the new value
    // takes effect on the next click (each beat creates a fresh gain
    // node, so no per-beat ramp is needed). Double-tap the label to
    // reset to the app default (80 %).
    if (volSlider) {
      volSlider.addEventListener('input', function () {
        setVolume(parseInt(volSlider.value, 10) / 100, 'slider');
      });
    }
    if (volReset) {
      volReset.addEventListener('dblclick', function () { setVolume(DEFAULT_VOL); });
    }

    // ── Meter picker sheet ──
    // Mirrors MeterBottomSheet from the app: two vertically-scrolling
    // wheels for BEATS (1-16) and NOTE (4/8/16). Selecting a value
    // commits immediately so closing the sheet has no "OK / Cancel"
    // semantics - the only button is "Done" for tap-target convenience.
    function buildWheel(wheelEl, values, selected, onSelect) {
      wheelEl.innerHTML = '';
      values.forEach(function (v) {
        var item = document.createElement('div');
        item.className = 'mm-wheel-item' + (v === selected ? ' is-selected' : '');
        item.textContent = v;
        item.addEventListener('click', function () {
          // Visually update selection.
          wheelEl.querySelectorAll('.mm-wheel-item').forEach(function (i) {
            i.classList.toggle('is-selected', i === item);
          });
          // Smooth-scroll the tapped item into the centre band.
          item.scrollIntoView({ block: 'center', behavior: 'smooth' });
          onSelect(v);
        });
        wheelEl.appendChild(item);
      });
      // Centre the selected item AFTER the wheel is in the DOM
      // (defer one tick because the wheel is inside a hidden sheet
      // on first build).
      setTimeout(function () {
        var sel = wheelEl.querySelector('.is-selected');
        if (sel) sel.scrollIntoView({ block: 'center' });
      }, 0);
    }

    function openSheet() {
      sheet.hidden = false;
      // Rebuild wheels so they always reflect current state.
      var beatsValues = [];
      for (var i = 1; i <= 16; i++) beatsValues.push(i);
      buildWheel(beatsWheel, beatsValues, beats, function (v) {
        setBeats(v);
      });
      buildWheel(noteWheel, [4, 8, 16], noteValue, function (v) {
        setNoteValue(v);
      });
    }
    function closeSheet() { sheet.hidden = true; }
    if (meterToggle) meterToggle.addEventListener('click', openSheet);
    if (sheetScrim) sheetScrim.addEventListener('click', closeSheet);
    if (sheetClose) sheetClose.addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sheet.hidden) closeSheet();
    });

    // TAP-tempo: collect timestamps, average last N=4 intervals.
    tapBtn.addEventListener('click', function () {
      var now = performance.now();
      tapTimes.push(now);
      if (tapTimes.length > 5) tapTimes.shift();
      // Reset window if user pauses for >2 s.
      if (tapTimes.length >= 2 && (now - tapTimes[tapTimes.length - 2]) > 2000) {
        tapTimes = [now];
      }
      if (tapTimes.length >= 2) {
        var sum = 0;
        for (var k = 1; k < tapTimes.length; k++) sum += (tapTimes[k] - tapTimes[k - 1]);
        var avgMs = sum / (tapTimes.length - 1);
        var tapped = Math.round(60000 / avgMs);
        setBpm(tapped);
      }
      tapBtn.classList.add('is-pulsing');
      setTimeout(function () { tapBtn.classList.remove('is-pulsing'); }, 120);
    });

    // Click the big BPM digit to edit it inline.
    bpmDigit.addEventListener('click', function () {
      var input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'numeric';
      input.className = 'mm-bpm-edit';
      input.value = String(bpm);
      bpmDigit.replaceWith(input);
      input.focus(); input.select();
      function commit() {
        var v = parseInt(input.value, 10);
        if (!isNaN(v)) setBpm(v);
        input.replaceWith(bpmDigit);
      }
      input.addEventListener('blur', commit);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
      });
    });

    startBtn.addEventListener('click', function () { if (schedulerId) stop(); else start(); });

    // Initial render - paint everything explicitly so the labels +
    // polygon + beat strip all match even though the state vars are
    // already at their default values (setBpm/setBeats early-return
    // on identity).
    bpmDigit.textContent = bpm;
    bpmScrubV.textContent = bpm;
    tempoLabel.textContent = 'BPM · ' + tempoMarking(bpm);
    setNoteValue(4);
    rebuildPolygon();
    rebuildBeatStrip();
    numLabel.textContent = beats;
    tsNum.textContent = beats;
    setVolume(DEFAULT_VOL);   // paints %, slider position + fill bar
  }

  // ============================================================
  // SIGNAL GENERATOR MODULE - 7 waveforms + typed freq + scope / FFT
  //
  // The visualiser is a one-for-one port of LiveSpectrumVisualizer
  // from SignalGenModule.kt:
  //   • AnalyserNode runs the FFT in native code (fftSize 8192 for
  //     fine bin resolution; smoothing 0 because we do our own
  //     attack/release in JS).
  //   • getFloatFrequencyData returns dBFS values directly.
  //   • 80 log-spaced display bands (30 Hz → 20 kHz), MAX-magnitude
  //     per band (keeps harmonic peaks crisp, no smearing).
  //   • Normalised across [SPEC_DB_FLOOR, SPEC_DB_CEIL] = [-72, 0] dB.
  //   • Fast-attack / slow-release smoother: instant up, EMA α=0.45
  //     down so the bars settle without flicker.
  //   • Renders as a smooth Path: gradient fill below an outline.
  //   • SCOPE tab keeps a higher-res time-domain trace driven by
  //     getFloatTimeDomainData on the same analyser.
  // ============================================================
  var SPEC_BANDS = 80;
  var SPEC_MIN = 30, SPEC_MAX = 20000;
  var SPEC_DB_FLOOR = -72, SPEC_DB_CEIL = 0;
  var SPEC_RELEASE_ALPHA = 0.45;
  var SPEC_VIEW_W = 700, SPEC_VIEW_H = 220;

  // Pre-compute band centre frequencies + edge frequencies. These are
  // static for the lifetime of the page so we cache them outside the
  // hot loop.
  var SPEC_TLO = Math.log10(SPEC_MIN);
  var SPEC_THI = Math.log10(SPEC_MAX);
  var SPEC_BAND_EDGES_HZ = [];
  for (var b = 0; b <= SPEC_BANDS; b++) {
    SPEC_BAND_EDGES_HZ.push(Math.pow(10, SPEC_TLO + (SPEC_THI - SPEC_TLO) * (b / SPEC_BANDS)));
  }
  function freqToLogX(f) {
    var c = Math.max(SPEC_MIN, Math.min(SPEC_MAX, f));
    return ((Math.log10(c) - SPEC_TLO) / (SPEC_THI - SPEC_TLO)) * SPEC_VIEW_W;
  }
  function bandCentreFreq(i) {
    return Math.pow(10, SPEC_TLO + (SPEC_THI - SPEC_TLO) * ((i + 0.5) / SPEC_BANDS));
  }

  function buildSignalGen() {
    var demo = document.querySelector('[data-module-demo="signal-gen"]');
    if (!demo) return;
    var pathStatic   = demo.querySelector('[data-sg-path-static]');
    var pathScope    = demo.querySelector('[data-sg-path-scope]');
    var spectrumFill    = demo.querySelector('[data-sg-spectrum-fill]');
    var spectrumOutline = demo.querySelector('[data-sg-spectrum-outline]');
    var axis        = demo.querySelector('[data-sg-axis]');
    var grid100     = demo.querySelector('[data-sg-grid-100]');
    var grid1k      = demo.querySelector('[data-sg-grid-1k]');
    var grid10k     = demo.querySelector('[data-sg-grid-10k]');
    var chips       = demo.querySelectorAll('[data-sg-wave]');
    var freqIn      = demo.querySelector('[data-sg-freq]');
    var freqVal     = demo.querySelector('[data-sg-freq-value]');
    var freqBig     = demo.querySelector('[data-sg-freq-display]');
    var freqInput   = demo.querySelector('[data-sg-freq-input]');
    var ampIn       = demo.querySelector('[data-sg-amp]');
    var ampVal      = demo.querySelector('[data-sg-amp-value]');
    var playBtn     = demo.querySelector('[data-sg-play]');
    var statusEl    = demo.querySelector('[data-sg-status]');
    var presets     = demo.querySelectorAll('[data-sg-preset]');
    var vizTabs     = demo.querySelectorAll('[data-sg-viz]');
    if (!playBtn || !pathStatic) return;

    // Place the decade vertical grid lines at their log-x positions.
    if (grid100) { var x100 = freqToLogX(100); grid100.setAttribute('x1', x100); grid100.setAttribute('x2', x100); }
    if (grid1k)  { var x1k  = freqToLogX(1000); grid1k.setAttribute('x1', x1k); grid1k.setAttribute('x2', x1k); }
    if (grid10k) { var x10k = freqToLogX(10000); grid10k.setAttribute('x1', x10k); grid10k.setAttribute('x2', x10k); }

    var ctxL = null, analyser = null, scopeBuf = null, freqDbBuf = null;
    function ensure() {
      if (!ctxL) ctxL = new (window.AudioContext || window.webkitAudioContext)();
      if (ctxL.state === 'suspended') ctxL.resume();
      if (!analyser) {
        // 8192-point FFT gives 4096 bins at 44.1 kHz sample rate, so
        // bin width ≈ 5.4 Hz. Native FFT - fast and detailed.
        analyser = ctxL.createAnalyser();
        analyser.fftSize = 8192;
        analyser.smoothingTimeConstant = 0;   // we smooth ourselves
        scopeBuf = new Float32Array(analyser.fftSize);
        freqDbBuf = new Float32Array(analyser.frequencyBinCount);
      }
    }

    // Smoothed band magnitudes - preserved between frames so the
    // fast-attack / slow-release smoother has memory.
    var smoothBands = new Float32Array(SPEC_BANDS);

    var waveType = 'sine';
    var freq = 440;
    var amp = -12;     // dB
    var running = false;
    var vizMode = 'scope';
    var rafId = null;
    var osc = null, gainNode = null, noiseNode = null;

    var VIZ_W = 700, VIZ_H = 220;

    function buildPath(kind) {
      var W = VIZ_W, H = VIZ_H;
      var midY = H * 0.5;
      var amplitude = H * 0.40;
      var steps = 110;
      var d = '';
      if (kind === 'sine') {
        for (var i = 0; i <= steps; i++) {
          var t = i / steps;
          var x = t * W;
          var y = midY + Math.sin(t * 4 * Math.PI) * amplitude;
          d += (i === 0 ? 'M ' : ' L ') + x.toFixed(1) + ' ' + y.toFixed(2);
        }
      } else if (kind === 'square') {
        var period = W / 2;
        for (var k = 0; k < 2; k++) {
          var x0 = k * period;
          var x1 = x0 + period * 0.5;
          var x2 = x0 + period;
          if (k === 0) d += 'M ' + x0 + ' ' + (midY - amplitude);
          d += ' L ' + x1 + ' ' + (midY - amplitude);
          d += ' L ' + x1 + ' ' + (midY + amplitude);
          d += ' L ' + x2 + ' ' + (midY + amplitude);
        }
      } else if (kind === 'sawtooth') {
        var pd = W / 2;
        for (var s = 0; s < 2; s++) {
          var sx0 = s * pd;
          var sx1 = sx0 + pd;
          if (s === 0) d += 'M ' + sx0 + ' ' + (midY + amplitude);
          d += ' L ' + sx1 + ' ' + (midY - amplitude);
          d += ' L ' + sx1 + ' ' + (midY + amplitude);
        }
      } else if (kind === 'triangle') {
        var tp = W / 2;
        for (var u = 0; u < 2; u++) {
          var ux0 = u * tp;
          var uxM = ux0 + tp * 0.5;
          var ux1 = ux0 + tp;
          if (u === 0) d += 'M ' + ux0 + ' ' + midY;
          d += ' L ' + uxM + ' ' + (midY - amplitude);
          d += ' L ' + ux1 + ' ' + midY;
        }
      } else {
        // Noise - jagged random-looking path
        d = 'M 0 ' + midY;
        var rng = function (seed) { var x = Math.sin(seed) * 10000; return x - Math.floor(x); };
        var seedBase = kind === 'white' ? 1 : kind === 'pink' ? 2 : 3;
        for (var n = 1; n <= 60; n++) {
          var nx = n / 60 * W;
          var rough = (rng(seedBase * n) - 0.5) * 2;
          var dampening = kind === 'pink' ? 0.7 : kind === 'brown' ? 0.4 : 1.0;
          var ny = midY + rough * amplitude * dampening;
          d += ' L ' + nx.toFixed(1) + ' ' + ny.toFixed(2);
        }
      }
      return d;
    }
    function refreshPath() {
      var d = buildPath(waveType);
      pathStatic.setAttribute('d', d);
    }
    function ampToGain(db) { return Math.pow(10, db / 20); }

    // ── Live visualizer loop ──
    // SCOPE: high-res time-domain trace (one SVG path point per
    // ~2.5 sample slice, drawn at 60 fps).
    function drawScope() {
      analyser.getFloatTimeDomainData(scopeBuf);
      var W = SPEC_VIEW_W, H = SPEC_VIEW_H;
      var mid = H * 0.5, scale = H * 0.46;
      var n = scopeBuf.length;
      // Show ~2 full cycles for typical mid-band tones so the wave
      // doesn't blur. Cycle samples = sampleRate / freq, take ×2 if
      // it fits in the buffer, otherwise show the whole buffer.
      var sr = ctxL ? ctxL.sampleRate : 48000;
      var perCycle = (freq > 0) ? sr / freq : n;
      var showSamples = Math.min(n, Math.max(64, Math.round(perCycle * 2)));
      // Sub-pixel resolution: 1 sample per pixel ceiling.
      var stride = Math.max(1, Math.floor(showSamples / W));
      var d = '';
      var first = true;
      for (var i = 0; i < showSamples; i += stride) {
        var x = (i / showSamples) * W;
        var y = mid - scopeBuf[i] * scale;
        d += (first ? 'M ' : ' L ') + x.toFixed(1) + ' ' + y.toFixed(2);
        first = false;
      }
      pathScope.setAttribute('d', d);
    }
    // SPECTRUM: native FFT → 80 log-spaced bands (max-magnitude per
    // band) → dBFS-normalised → fast-attack / slow-release smoother →
    // outline + gradient-fill path. Mirrors LiveSpectrumVisualizer
    // line-for-line.
    function drawSpectrum() {
      analyser.getFloatFrequencyData(freqDbBuf);   // dBFS per bin
      var W = SPEC_VIEW_W, H = SPEC_VIEW_H;
      var sr = ctxL.sampleRate;
      var nBins = freqDbBuf.length;
      var fftSize = analyser.fftSize;
      // Range scale - map dB → [0,1] across SPEC_DB_FLOOR..SPEC_DB_CEIL.
      var dbRange = SPEC_DB_CEIL - SPEC_DB_FLOOR;
      // Two-pass: 1) compute raw band magnitudes (max-magnitude per
      // band). 2) apply attack/release smoother into smoothBands.
      // 3) build the SVG path.
      var raw = new Float32Array(SPEC_BANDS);
      for (var bi = 0; bi < SPEC_BANDS; bi++) {
        var fLo = SPEC_BAND_EDGES_HZ[bi];
        var fHi = SPEC_BAND_EDGES_HZ[bi + 1];
        var kLo = Math.max(0, Math.floor(fLo * fftSize / sr));
        var kHi = Math.min(nBins - 1, Math.ceil(fHi * fftSize / sr));
        if (kHi < kLo) kHi = kLo;
        // Max magnitude (in dB) across the band - preserves peaks.
        var peakDb = -200;
        for (var k = kLo; k <= kHi; k++) {
          var v = freqDbBuf[k];
          if (v > peakDb) peakDb = v;
        }
        // Floor at SPEC_DB_FLOOR - anything quieter clamps to silence.
        if (peakDb < SPEC_DB_FLOOR) peakDb = SPEC_DB_FLOOR;
        if (peakDb > SPEC_DB_CEIL)  peakDb = SPEC_DB_CEIL;
        raw[bi] = (peakDb - SPEC_DB_FLOOR) / dbRange;   // → [0,1]
      }
      // Fast-attack / slow-release: instant up, EMA α down.
      for (var i = 0; i < SPEC_BANDS; i++) {
        var prev = smoothBands[i];
        var cur = raw[i];
        smoothBands[i] = (cur >= prev) ? cur : prev + SPEC_RELEASE_ALPHA * (cur - prev);
      }
      // Build outline + fill paths from the smoothed bands.
      var outlineD = '';
      var fillD = 'M 0 ' + H.toFixed(1);
      for (var j = 0; j < SPEC_BANDS; j++) {
        var x = freqToLogX(bandCentreFreq(j));
        var mag = smoothBands[j];
        if (mag < 0) mag = 0; else if (mag > 1) mag = 1;
        var y = H - (mag * H * 0.92);
        outlineD += (j === 0 ? 'M ' : ' L ') + x.toFixed(2) + ' ' + y.toFixed(2);
        fillD    += ' L ' + x.toFixed(2) + ' ' + y.toFixed(2);
      }
      // Close fill down to baseline.
      var lastX = freqToLogX(bandCentreFreq(SPEC_BANDS - 1));
      fillD += ' L ' + lastX.toFixed(2) + ' ' + H.toFixed(1) + ' L 0 ' + H.toFixed(1) + ' Z';
      spectrumOutline.setAttribute('d', outlineD);
      spectrumFill.setAttribute('d', fillD);
    }
    function vizLoop() {
      if (!running) { rafId = null; return; }
      if (vizMode === 'scope') drawScope(); else drawSpectrum();
      rafId = requestAnimationFrame(vizLoop);
    }

    function stopNoise() {
      if (noiseNode) { try { noiseNode.disconnect(); } catch (e) {} noiseNode = null; }
    }
    function buildNoise(kind) {
      var size = ctxL.sampleRate * 2;
      var buf = ctxL.createBuffer(1, size, ctxL.sampleRate);
      var d = buf.getChannelData(0);
      if (kind === 'white') {
        for (var i = 0; i < size; i++) d[i] = Math.random() * 2 - 1;
      } else if (kind === 'pink') {
        // Voss-McCartney approximation
        var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for (var p = 0; p < size; p++) {
          var w = Math.random() * 2 - 1;
          b0 = 0.99886*b0 + w*0.0555179;
          b1 = 0.99332*b1 + w*0.0750759;
          b2 = 0.96900*b2 + w*0.1538520;
          b3 = 0.86650*b3 + w*0.3104856;
          b4 = 0.55000*b4 + w*0.5329522;
          b5 = -0.7616*b5 - w*0.0168980;
          d[p] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.11;
          b6 = w * 0.115926;
        }
      } else { // brown
        var last = 0;
        for (var br = 0; br < size; br++) {
          var nb = (Math.random() * 2 - 1) * 0.5;
          last = (last + nb) / 1.02;
          d[br] = last * 3.5;
        }
      }
      var src = ctxL.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      return src;
    }

    function start() {
      ensure();
      if (waveType === 'white' || waveType === 'pink' || waveType === 'brown') {
        noiseNode = buildNoise(waveType);
        gainNode = ctxL.createGain();
        gainNode.gain.setValueAtTime(0, ctxL.currentTime);
        gainNode.gain.linearRampToValueAtTime(ampToGain(amp), ctxL.currentTime + 0.05);
        // Branch: → analyser (for viz) and → destination (audible).
        noiseNode.connect(gainNode);
        gainNode.connect(analyser);
        gainNode.connect(ctxL.destination);
        noiseNode.start();
      } else {
        osc = ctxL.createOscillator();
        gainNode = ctxL.createGain();
        osc.type = waveType;
        osc.frequency.value = freq;
        gainNode.gain.setValueAtTime(0, ctxL.currentTime);
        gainNode.gain.linearRampToValueAtTime(ampToGain(amp), ctxL.currentTime + 0.05);
        osc.connect(gainNode);
        gainNode.connect(analyser);
        gainNode.connect(ctxL.destination);
        osc.start();
      }
      running = true;
      playBtn.setAttribute('data-running', 'true');
      playBtn.textContent = 'STOP';
      if (statusEl) statusEl.textContent = '● PLAYING';
      // Fade out the static waveform preview so the live trace dominates.
      pathStatic.setAttribute('stroke-opacity', '0.08');
      if (!rafId) vizLoop();
    }
    function stop() {
      try { if (gainNode) gainNode.gain.exponentialRampToValueAtTime(0.0001, ctxL.currentTime + 0.05); } catch (e) {}
      try { if (osc) osc.stop(ctxL.currentTime + 0.07); } catch (e) {}
      setTimeout(stopNoise, 80);
      osc = null;
      gainNode = null;
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      playBtn.setAttribute('data-running', 'false');
      playBtn.textContent = 'START';
      if (statusEl) statusEl.textContent = 'READY';
      // Clear live traces, restore static preview, drain smoothed bands.
      pathScope.setAttribute('d', '');
      spectrumOutline.setAttribute('d', '');
      spectrumFill.setAttribute('d', '');
      for (var i = 0; i < SPEC_BANDS; i++) smoothBands[i] = 0;
      pathStatic.setAttribute('stroke-opacity', '0.18');
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        waveType = chip.getAttribute('data-sg-wave');
        chips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        refreshPath();
        var isNoise = (waveType === 'white' || waveType === 'pink' || waveType === 'brown');
        if (freqIn) freqIn.disabled = isNoise;
        if (running) {
          // Restart with new waveform
          stop();
          setTimeout(start, 120);
        }
      });
    });
    function setFreq(v, source) {
      var f = Math.max(20, Math.min(20000, Math.round(v)));
      freq = f;
      if (source !== 'slider' && freqIn) freqIn.value = f;
      if (source !== 'input' && freqInput) freqInput.value = f;
      if (freqVal) freqVal.textContent = f + ' Hz';
      if (freqBig) freqBig.textContent = (f >= 1000 ? (f / 1000).toFixed(2) + ' kHz' : f + ' Hz');
      if (osc) osc.frequency.setValueAtTime(f, ctxL.currentTime);
      if (freqIn) updateSliderFill(freqIn);
    }

    if (freqIn) {
      freqIn.addEventListener('input', function () { setFreq(parseInt(freqIn.value, 10), 'slider'); });
      updateSliderFill(freqIn);
    }
    if (freqInput) {
      freqInput.addEventListener('input', function () {
        var v = parseInt(freqInput.value, 10);
        if (!isNaN(v)) setFreq(v, 'input');
      });
      freqInput.addEventListener('blur', function () {
        // Clamp the visible value on blur so out-of-range entries
        // resolve to the legal min/max.
        var v = parseInt(freqInput.value, 10);
        if (isNaN(v)) v = 440;
        setFreq(v);
      });
      freqInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); freqInput.blur(); }
      });
    }
    presets.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setFreq(parseInt(btn.getAttribute('data-sg-preset'), 10));
      });
    });
    if (ampIn) {
      ampIn.addEventListener('input', function () {
        amp = parseInt(ampIn.value, 10);
        ampVal.textContent = amp + ' dB';
        if (gainNode) gainNode.gain.setValueAtTime(ampToGain(amp), ctxL.currentTime);
        updateSliderFill(ampIn);
      });
      updateSliderFill(ampIn);
    }
    // Visualizer mode tabs
    function setVizMode(mode) {
      vizMode = mode;
      vizTabs.forEach(function (t) {
        t.classList.toggle('is-active', t.getAttribute('data-sg-viz') === mode);
      });
      if (mode === 'scope') {
        pathScope.style.display = '';
        spectrumOutline.style.display = 'none';
        spectrumFill.style.display = 'none';
        spectrumOutline.setAttribute('d', '');
        spectrumFill.setAttribute('d', '');
        pathStatic.style.display = '';
        if (axis) axis.style.display = 'none';
      } else {
        pathScope.style.display = 'none';
        pathScope.setAttribute('d', '');
        spectrumOutline.style.display = '';
        spectrumFill.style.display = '';
        // Spectrum view doesn't show the waveform shape underneath.
        pathStatic.style.display = 'none';
        if (axis) axis.style.display = '';
      }
    }
    vizTabs.forEach(function (tab) {
      tab.addEventListener('click', function () { setVizMode(tab.getAttribute('data-sg-viz')); });
    });
    playBtn.addEventListener('click', function () { if (running) stop(); else start(); });
    refreshPath();
    setVizMode('scope');
  }

  function init() {
    try { buildPlay(); }       catch (e) { console.warn('play module demo:', e); }
    try { buildMetronome(); }  catch (e) { console.warn('metronome module demo:', e); }
    try { buildSignalGen(); }  catch (e) { console.warn('sig-gen module demo:', e); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
