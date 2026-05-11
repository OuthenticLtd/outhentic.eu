/* =========================================================
   OSE — module-page interactive demos
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

  // ============================================================
  // PLAY MODULE — full piano (2 octaves) with voice selector
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
        // 2-osc lead — sawtooth + detuned sub
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
  // METRONOME MODULE — full ClickTrackFace working demo
  // ============================================================
  function buildMetronome() {
    var demo = document.querySelector('[data-module-demo="metronome"]');
    if (!demo) return;
    var bpmSlider  = demo.querySelector('[data-mm-bpm]');
    var bpmValue   = demo.querySelector('[data-mm-bpm-value]');
    var bpmDigit   = demo.querySelector('[data-mm-bpm-digit]');
    var tempoLabel = demo.querySelector('[data-mm-tempo]');
    var sigSlider  = demo.querySelector('[data-mm-sig]');
    var sigValue   = demo.querySelector('[data-mm-sig-value]');
    var numLabel   = demo.querySelector('[data-mm-num]');
    var startBtn   = demo.querySelector('[data-mm-start]');
    var beatStrip  = demo.querySelector('[data-mm-beats]');
    var polySvg    = demo.querySelector('[data-mm-poly]');
    if (!bpmSlider || !startBtn || !polySvg) return;

    var audioCtxLocal = null;
    function ensure() {
      if (!audioCtxLocal) audioCtxLocal = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtxLocal.state === 'suspended') audioCtxLocal.resume();
    }

    var schedulerId = null;
    var nextNoteTime = 0;
    var currentBeat = 0;
    var beatStates = [];
    var bpm = 120;
    var beats = 4;

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
      var p = [];
      for (var i = 0; i < n; i++) {
        var v = vertexAt(i, n, r);
        p.push(v.x.toFixed(2) + ',' + v.y.toFixed(2));
      }
      return p.join(' ');
    }
    function rebuildPolygon() {
      var outline = polySvg.querySelector('[data-mm-poly-outline]');
      var fill    = polySvg.querySelector('[data-mm-poly-fill]');
      var dot     = polySvg.querySelector('[data-mm-dot]');
      outline.setAttribute('points', polygonPoints(beats, 50));
      fill.setAttribute('points',    polygonPoints(beats, 35));
      var v0 = vertexAt(0, beats, 50);
      dot.setAttribute('cx', v0.x);
      dot.setAttribute('cy', v0.y);
    }
    function rebuildBeatStrip() {
      beatStrip.innerHTML = '';
      beatStates = [];
      for (var i = 0; i < beats; i++) {
        beatStates.push(i === 0 ? 'accent' : 'normal');
        var col = document.createElement('button');
        col.className = 'mm-beat';
        col.setAttribute('data-state', beatStates[i]);
        col.setAttribute('data-idx', String(i));
        col.textContent = String(i + 1);
        col.addEventListener('click', function (e) {
          var idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
          var c = beatStates[idx];
          var n = c === 'accent' ? 'normal' : (c === 'normal' ? 'silent' : 'accent');
          beatStates[idx] = n;
          e.currentTarget.setAttribute('data-state', n);
        });
        beatStrip.appendChild(col);
      }
    }
    function tickClick(t, accent) {
      var osc = audioCtxLocal.createOscillator();
      var gain = audioCtxLocal.createGain();
      osc.type = 'square';
      osc.frequency.value = accent ? 1500 : 1100;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(accent ? 0.25 : 0.15, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain).connect(audioCtxLocal.destination);
      osc.start(t); osc.stop(t + 0.08);
    }
    function scheduleAnimation(beatIdx, t) {
      var msUntil = (t - audioCtxLocal.currentTime) * 1000;
      setTimeout(function () {
        var dot = polySvg.querySelector('[data-mm-dot]');
        var v = vertexAt(beatIdx, beats, 50);
        dot.style.transition = 'cx 80ms linear, cy 80ms linear';
        dot.setAttribute('cx', v.x);
        dot.setAttribute('cy', v.y);
        var dots = beatStrip.querySelectorAll('.mm-beat');
        dots.forEach(function (d) { d.classList.remove('is-playing'); });
        if (dots[beatIdx]) {
          dots[beatIdx].classList.add('is-playing');
          setTimeout(function () { dots[beatIdx].classList.remove('is-playing'); }, 120);
        }
      }, Math.max(0, msUntil));
    }
    function scheduler() {
      while (nextNoteTime < audioCtxLocal.currentTime + 0.10) {
        var s = beatStates[currentBeat] || 'normal';
        if (s !== 'silent') tickClick(nextNoteTime, s === 'accent');
        scheduleAnimation(currentBeat, nextNoteTime);
        nextNoteTime += 60.0 / bpm;
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
      startBtn.textContent = 'STOP';
    }
    function stop() {
      if (schedulerId) cancelAnimationFrame(schedulerId);
      schedulerId = null;
      startBtn.setAttribute('data-running', 'false');
      startBtn.textContent = 'START';
      beatStrip.querySelectorAll('.mm-beat').forEach(function (d) { d.classList.remove('is-playing'); });
    }
    function updateBpm() {
      bpm = parseInt(bpmSlider.value, 10);
      bpmValue.textContent = bpm;
      bpmDigit.textContent = bpm;
      tempoLabel.textContent = 'BPM · ' + tempoMarking(bpm);
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
  // SIGNAL GENERATOR MODULE — 7 waveforms + freq + amp + play
  // ============================================================
  function buildSignalGen() {
    var demo = document.querySelector('[data-module-demo="signal-gen"]');
    if (!demo) return;
    var pathBg   = demo.querySelector('[data-sg-path]');
    var pathFg   = demo.querySelector('[data-sg-path-fg]');
    var chips    = demo.querySelectorAll('[data-sg-wave]');
    var freqIn   = demo.querySelector('[data-sg-freq]');
    var freqVal  = demo.querySelector('[data-sg-freq-value]');
    var freqBig  = demo.querySelector('[data-sg-freq-display]');
    var ampIn    = demo.querySelector('[data-sg-amp]');
    var ampVal   = demo.querySelector('[data-sg-amp-value]');
    var playBtn  = demo.querySelector('[data-sg-play]');
    var statusEl = demo.querySelector('[data-sg-status]');
    if (!playBtn || !pathBg) return;

    var ctxL = null;
    function ensure() {
      if (!ctxL) ctxL = new (window.AudioContext || window.webkitAudioContext)();
      if (ctxL.state === 'suspended') ctxL.resume();
    }

    var waveType = 'sine';
    var freq = 440;
    var amp = -12;     // dB
    var running = false;
    var osc = null, gainNode = null, noiseNode = null;

    function buildPath(kind) {
      var W = 700, H = 200;
      var midY = H * 0.5;
      var amp = H * 0.40;
      var steps = 110;
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
          if (k === 0) d += 'M ' + x0 + ' ' + (midY - amp);
          d += ' L ' + x1 + ' ' + (midY - amp);
          d += ' L ' + x1 + ' ' + (midY + amp);
          d += ' L ' + x2 + ' ' + (midY + amp);
        }
      } else if (kind === 'sawtooth') {
        var pd = W / 2;
        for (var s = 0; s < 2; s++) {
          var sx0 = s * pd;
          var sx1 = sx0 + pd;
          if (s === 0) d += 'M ' + sx0 + ' ' + (midY + amp);
          d += ' L ' + sx1 + ' ' + (midY - amp);
          d += ' L ' + sx1 + ' ' + (midY + amp);
        }
      } else if (kind === 'triangle') {
        var tp = W / 2;
        for (var u = 0; u < 2; u++) {
          var ux0 = u * tp;
          var uxM = ux0 + tp * 0.5;
          var ux1 = ux0 + tp;
          if (u === 0) d += 'M ' + ux0 + ' ' + midY;
          d += ' L ' + uxM + ' ' + (midY - amp);
          d += ' L ' + ux1 + ' ' + midY;
        }
      } else {
        // Noise — draw a jagged random-looking path
        d = 'M 0 ' + midY;
        var rng = function (seed) { var x = Math.sin(seed) * 10000; return x - Math.floor(x); };
        var seedBase = kind === 'white' ? 1 : kind === 'pink' ? 2 : 3;
        for (var n = 1; n <= 60; n++) {
          var nx = n / 60 * W;
          var rough = (rng(seedBase * n) - 0.5) * 2;
          var dampening = kind === 'pink' ? 0.7 : kind === 'brown' ? 0.4 : 1.0;
          var ny = midY + rough * amp * dampening;
          d += ' L ' + nx.toFixed(1) + ' ' + ny.toFixed(2);
        }
      }
      return d;
    }
    function refreshPath() {
      var d = buildPath(waveType);
      pathBg.setAttribute('d', d);
      pathFg.setAttribute('d', d);
    }
    function ampToGain(db) { return Math.pow(10, db / 20); }

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
        noiseNode.connect(gainNode).connect(ctxL.destination);
        noiseNode.start();
      } else {
        osc = ctxL.createOscillator();
        gainNode = ctxL.createGain();
        osc.type = waveType;
        osc.frequency.value = freq;
        gainNode.gain.setValueAtTime(0, ctxL.currentTime);
        gainNode.gain.linearRampToValueAtTime(ampToGain(amp), ctxL.currentTime + 0.05);
        osc.connect(gainNode).connect(ctxL.destination);
        osc.start();
      }
      running = true;
      playBtn.setAttribute('data-running', 'true');
      playBtn.textContent = 'STOP';
      if (statusEl) statusEl.textContent = '● PLAYING';
    }
    function stop() {
      try { if (gainNode) gainNode.gain.exponentialRampToValueAtTime(0.0001, ctxL.currentTime + 0.05); } catch (e) {}
      try { if (osc) osc.stop(ctxL.currentTime + 0.07); } catch (e) {}
      setTimeout(stopNoise, 80);
      osc = null;
      gainNode = null;
      running = false;
      playBtn.setAttribute('data-running', 'false');
      playBtn.textContent = 'START';
      if (statusEl) statusEl.textContent = 'READY';
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
    if (freqIn) {
      freqIn.addEventListener('input', function () {
        freq = parseInt(freqIn.value, 10);
        freqVal.textContent = freq + ' Hz';
        if (freqBig) freqBig.textContent = (freq >= 1000 ? (freq / 1000).toFixed(2) + ' kHz' : freq + ' Hz');
        if (osc) osc.frequency.setValueAtTime(freq, ctxL.currentTime);
      });
    }
    if (ampIn) {
      ampIn.addEventListener('input', function () {
        amp = parseInt(ampIn.value, 10);
        ampVal.textContent = amp + ' dB';
        if (gainNode) gainNode.gain.setValueAtTime(ampToGain(amp), ctxL.currentTime);
      });
    }
    playBtn.addEventListener('click', function () { if (running) stop(); else start(); });
    refreshPath();
  }

  function init() {
    try { buildPlay(); }       catch (e) { console.warn('play module demo:', e); }
    try { buildMetronome(); }  catch (e) { console.warn('metronome module demo:', e); }
    try { buildSignalGen(); }  catch (e) { console.warn('sig-gen module demo:', e); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
