/* =========================================================
   OSE — site-wide editable content.
   This file is the single source of truth for every piece of
   text and every image path on outhentic.eu/ose.
   Edit via /ose/editor.html or directly here. Auto-generated
   updates land back in this file via "Save to GitHub" or
   "Download ose-content.js" + manual upload.
   ========================================================= */
window.OSE_CONTENT = {
  "meta": {
    "siteName": "OSE",
    "fullName": "Outhentic Sound Engine",
    "tagline": "The mobile music studio that fits in your pocket.",
    "shortDescription": "Synth, recorder, MIDI editor, audio editor, metronome, tuner, signal generator and meters — eight studio-grade modules in one Android app.",
    "playStoreUrl": "#",
    "contactEmail": "info@outhentic.eu",
    "addressLine": "Sofia 1592, Bulgaria",
    "twitterHandle": "",
    "ogImage": "assets/img/ose-logo.svg",
    "version": "1.0",
    "lastUpdated": "2026-05-10"
  },

  "nav": [
    { "href": "index.html",        "label": "Home" },
    { "href": "manual.html",       "label": "Manual" },
    { "href": "tutorials.html",    "label": "Tutorials" },
    { "href": "help.html",         "label": "Help" }
  ],

  "hero": {
    "eyebrow": "Outhentic Sound Engine · Android",
    "title_a": "Eight studios.",
    "title_b": "One pocket.",
    "title_c": "",
    "lead": "OSE is a complete mobile audio workstation. Synthesise, record, edit, sequence, tune, measure and time — every tool a producer reaches for, designed phone-first and built for the way real musicians actually work.",
    "ctaPrimaryLabel": "Get it on Google Play",
    "ctaPrimaryHref": "#",
    "ctaSecondaryLabel": "Read the manual",
    "ctaSecondaryHref": "manual.html"
  },

  "pitch": {
    "eyebrow": "Why OSE",
    "title": "A studio is no longer a place. It is a phone.",
    "body_html": "<p>Most mobile audio apps copy a corner of a desktop DAW and stop there. OSE was designed the other way around: from a blank screen, asking what a touch interface should actually do. The result is a home screen of eight focused modules — every one a complete tool — that work together through a shared language of hubs, gestures and settings.</p><p>You move from idea to printed take without leaving the phone. The synth in your pocket can now sound like a synth on a desk.</p>"
  },

  "highlights": [
    {
      "title": "Eight modules, one home screen",
      "body": "Play · Audio · MIDI · Practice · Metronome · Tuner · Signal Generator · Meters. Open OSE and the entire studio is one tap away."
    },
    {
      "title": "Phone-first, not desktop-shrunk",
      "body": "Every control is sized for thumbs and stylus. Landscape and portrait are treated as first-class — neither is an afterthought."
    },
    {
      "title": "Non-destructive by default",
      "body": "Audio edits stack as virtual layers; MIDI clip edges hide notes instead of deleting them. Bake when you're sure, revert when you change your mind."
    },
    {
      "title": "Real DSP, not toys",
      "body": "Native filters, phase-locked stretch, spectral cleaning, sample-accurate looping. Pro-grade quality on hardware most apps treat as second-class."
    }
  ],

  "modules": [
    {
      "id": "play",
      "name": "Play Module",
      "shortName": "Play",
      "tile_role": "synthesise & perform",
      "tagline": "The Play Hub — a pocket synthesiser, drum machine and instrument browser.",
      "summary": "The Play Module — known inside the app as the Play Hub — is where you actually make a sound. It hosts the synth voice, the keyboard or drum-pad surface, the pitch and modulation wheels, and quick access to every other Hub: Metronome, Instrument browser, Instrument Editor, MIDI sessions, Piano Roll, Audio Editor and DSP.",
      "topbar_html": "<p>The top bar shows the title <strong>PLAY HUB</strong> with a gear icon for module settings. Tap the title to bring up navigation back to the home grid. Adjacent buttons open the Hubs (overlays that draw on top of the playing surface).</p>",
      "body_controls_html": "<h3>Play surface</h3><p>The body fills the screen with either a piano keyboard or an 8 × 2 drum-pad grid. Switch between them in the Settings sheet under <code>PLAY SURFACE</code>. The choice is session-scoped: it applies immediately, persists across editor cancels and is committed to the preset only when you save.</p><h3>Pitch and modulation wheels</h3><p>In landscape both wheels appear on the outer edges of the screen — pitch on one side, mod on the other — sized to fall under the thumbs that hold the device. In portrait they collapse into the top bar. Pitch wheel is sprung; mod wheel latches.</p><h3>DSP card</h3><p>A compact, scroll-free DSP panel sits inside the Play Hub showing every effect on the current voice. Each tab presents its full control surface in one screen — no hidden pages. The DSP card is the gold standard the rest of the app's surfaces follow.</p><h3>Bottom transport</h3><p>A drag handle on one side and Play / Stop / Record on the other. Record captures into the active MIDI clip via the Piano Roll's record-in-place sink, or into an audio session depending on which Hub is open.</p>",
      "settings_html": "<p>The Settings sheet (gear icon) is laid out in three foldable categories — <strong>SYSTEM</strong>, <strong>AUDIO</strong>, then module-specific. SYSTEM is foldable and expanded by default; it holds Auto-Rotate and Always-On Screen. AUDIO holds the input device picker (collapsing all built-in microphones into one entry) and, when a USB audio interface is plugged in, the channel chooser. The module-specific section holds <code>PLAY SURFACE</code> (Piano / Drum Pads).</p>",
      "hubs_html": "<p>Seven Hubs are reachable from the Play Hub top bar. Each opens as a draggable dialog over the playing surface so you can tweak without leaving the keyboard:</p><ul><li><strong>Metronome Hub</strong> — tempo, time signature, click mix.</li><li><strong>Instrument Hub</strong> — browse and load presets.</li><li><strong>Instrument Editor</strong> — zones, sources and the active skin.</li><li><strong>MIDI Hub</strong> — sessions and recordings.</li><li><strong>Piano Roll Editor</strong> — note editing for the active clip.</li><li><strong>Audio Editor</strong> — waveform editing for the active recording.</li><li><strong>DSP Hub</strong> — a fuller version of the DSP card with extra utility.</li></ul>",
      "tips_html": "<ul><li>Long-press any knob or slider to start MIDI Learn — the system-wide gesture for binding hardware controllers.</li><li>The instrument editor's per-skin colour drives the rest of the app's accent: change the skin and the Piano Roll's note colour follows.</li><li>Drum-pad mode in landscape exposes page navigation in the bottom bar; pads remain finger-sized.</li></ul>"
    },

    {
      "id": "audio",
      "name": "Audio Module",
      "shortName": "Audio",
      "tile_role": "record, edit, master",
      "tagline": "Two lenses — Recorder and Library — with a fullscreen waveform editor underneath.",
      "summary": "The Audio Module is the recording and editing studio. It opens with two lenses: <strong>Recorder</strong> (live capture, monitoring, signal-chain) and <strong>Library</strong> (every take you've made, ready to open in the fullscreen Audio Editor). The Recorder lens is the default.",
      "topbar_html": "<p>The top bar holds a 2-tab segmented chip — <strong>RECORD</strong> and <strong>LIBRARY</strong> — and a gear icon for settings. Tapping a tab swaps the body in place; the visualizer position is anchored under the top bar in both lenses and both orientations so the eye doesn't have to track.</p>",
      "body_controls_html": "<h3>Recorder lens</h3><p>From the top down: a live waveform visualizer; an <strong>INPUT</strong> row showing the currently selected input device with a microphone icon, the active sample rate, and a chevron that opens a device dropdown; an <strong>AUTO / MONO / STEREO</strong> channel-mode segment; a timer and live meters; the DSP signal chain (defaults to the IN tab); and at the bottom a full-width <strong>REC</strong> pill with a 18-point wordmark sitting 16 dp from the screen edge.</p><p>Two independent toggle pills sit alongside the chain:</p><ul><li><strong>MONITOR</strong> — when on, opens an AudioTrack so you hear the input through the same DSP chain you'll print. Defaults to OFF; entering the recorder lens does not auto-open monitoring.</li><li><strong>PRINT</strong> — when on, an offline DSP bake fires when you leave the lens, when you start a new take, or when you flip back to the editor. Stopping is for staying and listening; baking happens on leave.</li></ul><h3>Library lens</h3><p>A list of every recorded take, each row showing the take's duration, format and a peek of its waveform. Tapping a row opens it in the fullscreen Audio Editor. Just-recorded takes auto-select so you go straight from REC to editing.</p>",
      "audio_editor_html": "<h3>The Audio Editor</h3><p>Tapping any take opens the editor fullscreen. Its surface is a single waveform canvas with the playhead pinned to centre and the timeline scrolling beneath — the same model used in the Piano Roll. The waveform is the primary surface; every other control is a small, optional overlay or fold.</p><h4>Clip handles</h4><p>The clip's master start and end edges live as thin precision pillars with chunky 28 × 24 dp tap caps. Drag them inward to crop, drag them outward — even before <code>t = 0</code> — to extend with silence. All edits are <strong>non-destructive</strong>: edges write to a sidecar; nothing rewrites the source until you bake.</p><h4>Selection tool</h4><p>A toggleable Select tool lets you rubber-band a region. Selection edges get the same pillar-and-cap treatment; long-press the middle of the selection (~500 ms) to drag the whole region as a unit. Drag from outside the clip into it and the rectangle clamps to the clip bounds.</p><h4>Loop region</h4><p>An independent loop region sits inside or outside the clip. It plays sample-perfect: when the playhead crosses the end, the next sample IS the loop start, with no audible gap. Drag the loop edges to resize, long-press the middle to move the whole region.</p><h4>Toolbar verbs</h4><p>A foldable toolbar holds the verbs: Select · Cut · Copy · Paste · Silence · Delete · FadeIn · FadeOut · Undo · Redo · Fit · Marker. The Fit pill floats above the magnifier when you're zoomed away from natural density.</p><h4>Tune fold</h4><p>A semitone wheel and a cents slider live behind the Tune fold. Phase-locked stretch under the hood keeps timing intact when you pitch.</p><h4>Repair, Stems, Clean</h4><p>Three sibling sections handle restoration. <strong>REPAIR</strong> covers de-clip, de-noise, de-reverb, de-ess, de-plosive and de-click. <strong>STEMS</strong> separates a mix into source instruments. <strong>CLEAN</strong> is a single-knob spectral denoiser — twist it up, the noise floor drops, the music stays.</p><h4>Snap-to-content</h4><p>A toggle in the toolbar makes clip handles and selection edges magnetically lock to silence-to-signal transitions in the waveform. Trim a take's leading silence in two finger movements.</p><h4>Bounce and Revert</h4><p>All edits are virtual until you Bounce — at which point the original is stashed and a rendered file replaces the source. Revert restores the stash. Closing the editor doesn't bake.</p>",
      "tips_html": "<ul><li>The visualizer position is anchored under the top bar — it never reflows when you swap lenses, so your eyes can stay on the meters while you change settings.</li><li>Built-in microphones collapse to one row in the input picker. USB interfaces expose every channel.</li><li>The Audio Editor's playhead position survives every edit: silence, fade, cut, all preserve where you were so the viewport doesn't snap to <code>t = 0</code>.</li></ul>"
    },

    {
      "id": "midi",
      "name": "MIDI Module",
      "shortName": "MIDI",
      "tile_role": "compose & sequence",
      "tagline": "A stylus-first Piano Roll Editor with marker lane, automation lanes and record-in-place.",
      "summary": "The MIDI Module hosts the Piano Roll Editor — the central surface for composing and editing notes, automation and tempo. Designed first for the S-Pen, it works equally well on phone, tablet and DeX.",
      "topbar_html": "<p>The top bar shows the module title with a gear icon for settings, plus a small <strong>MIDI REC</strong> chip in the trailing prefix. Tapping the chip opens the Play Hub so you can perform notes that record straight into the open clip.</p>",
      "body_controls_html": "<h3>Tools row</h3><p>Above the canvas sits a tools strip: <strong>GRID</strong> · <strong>SNAP</strong> · <strong>MET-arm</strong> · <strong>TEMPO chip</strong> (BPM · TS) · <strong>Play / Stop / Rec</strong>. Arm and tempo are deliberately separate buttons — arming the metronome and changing tempo are two different intents.</p><h3>Marker lane</h3><p>A 56 dp marker lane sits above the canvas in both portrait and landscape. Markers are tick-based; drag them along the timeline to retime them. The lane animates in when the first marker is added and out when the last is removed.</p><h3>Loop region</h3><p>Loop edges render as sky-blue pillars at canvas centre, draggable and grid-snapped. The model mirrors the Audio Editor — a deliberate cross-Hub parity so muscle memory transfers.</p><h3>Centred playhead</h3><p>The playhead is pinned to the horizontal centre and the canvas scrolls beneath. Zoom anchors on the playhead, not the screen edge. The model is shared with the Audio Editor and the MIDI Hub mini-visualisers.</p><h3>Fold tabs</h3><p>Four icon-only fold tabs anchor above the transport: <strong>EDIT</strong>, <strong>SPEED &amp; PITCH</strong>, <strong>LOOPS</strong>, <strong>CC</strong>. Each opens a body that draws above the canvas; only one fold is active at a time. The CC body is a single-lane dropdown switcher — pick the lane (velocity, pitch bend, sustain, aftertouch, or any CC 0–127), edit it above the canvas, switch.</p><h3>Record in place</h3><p>Tap <strong>REC</strong> in the grid-snap strip to record into the open clip at the playhead — no new gallery take, no destructive overwrite. Notes outside the clip's visible window are kept in the recording's event list and become available again if you extend the clip handles outward.</p>",
      "settings_html": "<p>Settings follow the standard module-sheet pattern: SYSTEM (foldable, default expanded) → AUDIO → MIDI-module-specific. The shared OSE settings sheet, accessible from the home screen, holds the global MIDI Learn switch.</p>",
      "tips_html": "<ul><li>Clip handles on the Piano Roll are non-destructive: out-of-clip notes survive in the underlying recording, ready to come back if you extend the clip.</li><li>Hold and drag a note with a stylus to use tilt and pressure axes for velocity nuance.</li><li>Pitch-bend, velocity, sustain and aftertouch each get their own colour-coded automation lane — orange, purple, sky and gold respectively.</li></ul>"
    },

    {
      "id": "practice",
      "name": "Practice Module",
      "shortName": "Practice",
      "tile_role": "daily routine",
      "tagline": "A focused practice companion built around the rest of the studio.",
      "summary": "The Practice Module is the home for daily routine. It links the metronome, tuner and Play Hub into a single rehearsal flow so the tools you reach for the most are always one tap apart.",
      "topbar_html": "<p>Top bar: module title and a gear icon. Settings follow the standard SYSTEM → AUDIO → module pattern.</p>",
      "body_controls_html": "<p>The Practice Module's exact body layout depends on the routine you set up — if you'd like the manual to describe it control-by-control, send a screenshot or open the Settings sheet and list what you see and we'll fill this section in precisely.</p>",
      "settings_html": "<p>Settings: SYSTEM (Auto-Rotate, Always-On), AUDIO (input device, USB channel chooser when applicable), and Practice-specific options.</p>",
      "tips_html": "<ul><li>Long-press any control to enter MIDI Learn — bind a foot pedal to start/stop, for instance.</li></ul>"
    },

    {
      "id": "metronome",
      "name": "Metronome",
      "shortName": "Metronome",
      "tile_role": "tempo & time",
      "tagline": "BPM, time signature, beat strength — all visible at once.",
      "summary": "The Metronome is the tempo reference for the whole studio. It runs as a module of its own, but the same engine drives the Play Hub's MET-arm and the Piano Roll's tempo chip.",
      "topbar_html": "<p>Top bar: module title and gear icon for settings.</p>",
      "body_controls_html": "<h3>Tempo</h3><p>A large central BPM readout sits over a tempo icon button — the same 32-point numeral the Piano Roll uses. Plus and minus buttons either side step the tempo; tap-and-hold on the readout itself opens a numeric entry sheet.</p><h3>Time signature</h3><p>The Time Signature section keeps the same chrome as the tempo button: 44 dp tap targets, 22 dp visual circle, 32-point beat numeral. Plus and minus buttons step beats per bar; the denominator is a separate button. In portrait the labels collapse so the numerals breathe; in landscape they re-appear.</p><h3>Beat strength</h3><p>A row of beat dots above the controls shows downbeat versus weak beats. The first beat carries an accent indicator; tap any beat to mute or accent it.</p><h3>Transport</h3><p>A play / stop button to the right of the BPM block starts and stops the click.</p><h3>Landscape</h3><p>In landscape the screen splits into two panes: <strong>rhythm and mix</strong> on the left, <strong>BPM and transport</strong> on the right. No scrolling — the entire metronome fits one landscape screen.</p>",
      "settings_html": "<p>Settings: SYSTEM → AUDIO → Metronome (click sound, accent volume, count-in length).</p>",
      "tips_html": "<ul><li>The Metronome Hub inside the Play Hub is the same engine — change tempo here and the Play Hub follows.</li><li>Bind hardware tap-tempo via MIDI Learn for hands-free tempo entry.</li></ul>"
    },

    {
      "id": "tuner",
      "name": "Tuner",
      "shortName": "Tuner",
      "tile_role": "intonation",
      "tagline": "Cents-accurate, with a forgiving snap-in-tune lock.",
      "summary": "The Tuner is a chromatic instrument tuner driven by the same input chain the rest of the modules share. It's accurate to within a cent — but it knows when to stop fighting you.",
      "topbar_html": "<p>Top bar: module title and gear icon for settings — same X position as every other non-Play module's gear by design.</p>",
      "body_controls_html": "<h3>Pitch readout</h3><p>A large note-name display dominates the screen — for example <strong>A4</strong> — with the cents deviation under it (<code>+5¢</code>, <code>−3¢</code>) and a needle or arc visualisation showing how far off you are.</p><h3>Snap-in-tune</h3><p>When the deviation falls inside ±3 cents the needle snaps to centre, the readout paints LED green, and the surrounding halo lights up. A wobble of a single cent will not pull the needle around — the lock is forgiving on purpose. The behaviour is UI-only and toggleable in Settings; it's on by default.</p>",
      "settings_html": "<p>Settings: SYSTEM → AUDIO. Audio holds the input device picker and the USB channel chooser when an interface is plugged in. The picker collapses all built-in microphones into one row so the list stays short. Tuner-specific options include the snap-in-tune toggle and reference pitch (default 440 Hz).</p>",
      "tips_html": "<ul><li>Plug in a USB audio interface to choose the exact input channel — useful if you've got multiple instruments hanging off one device.</li><li>Phantom telephony and remote-submix entries are filtered out of the picker, so you only see real inputs.</li></ul>"
    },

    {
      "id": "signal-generator",
      "name": "Signal Generator",
      "shortName": "Signal Gen",
      "tile_role": "test & calibrate",
      "tagline": "Seven waveforms, sweep mode, auto-stop. A pocket bench tool.",
      "summary": "The Signal Generator (Spectrum Bench) is a precise audio-frequency oscillator and noise source. Use it to calibrate gear, sweep room responses, set delays by ear, train your ears or just bench-test the rest of the studio.",
      "topbar_html": "<p>Top bar: module title and gear icon.</p>",
      "body_controls_html": "<h3>Waveform</h3><p>Seven waveforms are selectable: four shapes — <strong>Sine</strong>, <strong>Square</strong>, <strong>Triangle</strong>, <strong>Saw</strong> — and three colours of noise — <strong>White</strong>, <strong>Pink</strong>, <strong>Brown</strong>. Pure-Kotlin engine; no native dependencies.</p><h3>Frequency</h3><p>A frequency control sets the tone in Hz. Tap the readout for numeric entry, drag for fine adjustment.</p><h3>Amplitude</h3><p>Output level, relative to full-scale.</p><h3>Auto-stop timer</h3><p>An adjustable timer cuts the output after a set duration — set it long enough to walk over to the speakers without rushing. A separate fade-out duration keeps the cut from being a sudden click.</p><h3>Sweep mode</h3><p>A frequency sweep mode glides between two endpoints over a chosen time. Use it to test a speaker, find a room mode, or trace a filter response.</p>",
      "settings_html": "<p>Settings: SYSTEM → AUDIO → Signal Generator-specific (output device, default fade time).</p>",
      "tips_html": "<ul><li>Pink noise plus the Meters Module is a fast way to spot uneven monitoring.</li><li>Auto-stop with a long fade is great for pulling the test tone away gracefully when calibrating with someone in the room.</li></ul>"
    },

    {
      "id": "meters",
      "name": "Meters",
      "shortName": "Meters",
      "tile_role": "measure & verify",
      "tagline": "Peak, RMS and ballistics from a real metering engine, not a marketing screenshot.",
      "summary": "The Meters Module is the studio's measurement tool. Plug in a signal — microphone, instrument, or the Signal Generator — and read what's actually arriving at the converter.",
      "topbar_html": "<p>Top bar: module title and gear icon.</p>",
      "body_controls_html": "<h3>Meters</h3><p>The screen shows full-resolution peak and RMS bars with calibrated ballistics. Numeric peak holds and clip indicators sit alongside the bars.</p><h3>Input row</h3><p>The same input picker the rest of the studio uses sits inside Settings → Audio. Built-in microphones collapse to one row; USB interfaces expose every channel.</p>",
      "settings_html": "<p>Settings: SYSTEM → AUDIO. Audio's input picker is shared with Tuner and Audio Module by design — you set a device once and every module follows.</p>",
      "tips_html": "<ul><li>Pair Meters with the Signal Generator's pink noise to verify gain staging without rolling tape.</li><li>Watch the peak-hold flag — if it lights and never drops, you're clipping intermittently even when the bar looks fine.</li></ul>"
    }
  ],

  "homeGrid": {
    "eyebrow": "Eight modules",
    "title": "The home screen IS the studio.",
    "body_html": "<p>Open OSE and you land on a single grid of eight tiles. No menus, no nested settings to dig through. Every tile is a complete tool. The Play tile is emphasised because it's the most-used surface — the rest sit at uniform weight, two to a row.</p><p>Tap a tile, work in that module. Want a different tool? One tap back, one tap forward.</p>"
  },

  "tutorials": [
    {
      "id": "first-take",
      "title": "Record your first take",
      "duration": "3 min",
      "intro": "From cold-start to a printed audio take — the shortest path through the Audio Module.",
      "steps": [
        { "h": "Open the Audio Module", "p": "From the home grid tap the AUDIO tile. The module opens on the RECORDER lens by default — that's the default since it's where you usually want to be when you tap AUDIO." },
        { "h": "Pick your input", "p": "On the INPUT row, tap the chevron to choose your input device. Built-in microphones collapse to a single row labelled 'Internal device'. Plug in a USB interface and every channel will appear; pick the one your microphone is on." },
        { "h": "Set the channel mode", "p": "Below the input row, the AUTO / MONO / STEREO segment controls how channels are routed. AUTO follows the device; MONO sums or picks one channel; STEREO captures two." },
        { "h": "Decide on monitor and print", "p": "Tap MONITOR to hear yourself through the same DSP chain you'll print. Tap PRINT to enable the offline DSP bake when you leave the lens. They're independent — you can monitor without printing, or print without monitoring." },
        { "h": "Hit REC", "p": "The full-width REC pill at the bottom starts the take. The visualizer above shows live levels; the timer counts up. Hit it again to stop." },
        { "h": "Bake on leave", "p": "When you flip back to the editor, start a new take, or leave the module, PRINT bakes the offline DSP. Stop is for staying and listening — bake happens on leave by design." }
      ]
    },
    {
      "id": "trim-clean-bounce",
      "title": "Trim a take, clean it up, bounce a final",
      "duration": "5 min",
      "intro": "Non-destructive editing in the Audio Editor — clip handles, the CLEAN macro, and a Bounce.",
      "steps": [
        { "h": "Open the take", "p": "Tap the LIBRARY lens, then tap your take. The Audio Editor opens fullscreen with the waveform pinned at natural density." },
        { "h": "Trim the head", "p": "Drag the left clip handle inward — the thin pillar with the chunky 28 dp cap. The waveform shifts but the source file isn't touched: the trim writes to a sidecar." },
        { "h": "Snap to content (optional)", "p": "Toggle Snap-to-content in the toolbar to magnetically lock the clip handle to the first non-silent sample. Saves you from over-trimming a soft attack." },
        { "h": "Clean the noise floor", "p": "Open the CLEAN section and turn the macro knob clockwise. Spectral denoise reduces the floor without smearing the music." },
        { "h": "Bounce", "p": "When you're sure, tap Bounce. The original is stashed; a rendered file replaces the source. Revert at any time to restore the stash." }
      ]
    },
    {
      "id": "build-a-loop",
      "title": "Build a loop that wraps perfectly",
      "duration": "4 min",
      "intro": "The Audio Editor's loop region plays sample-perfect — here's how to set it.",
      "steps": [
        { "h": "Drag-select the region", "p": "Toggle the Select tool. Drag a rectangle over the part you want to loop. Selection edges pick up handles automatically." },
        { "h": "Convert to a loop", "p": "Tap the loop verb in the toolbar. The selection promotes to a loop region with sky-blue edge caps." },
        { "h": "Drag the edges to taste", "p": "Loop edges grid-snap when grid is on, free when off. Long-press the loop's middle to drag the whole region together." },
        { "h": "Press play", "p": "The next sample after the loop end IS the loop start — no audible gap. The wrap is sample-accurate because playback runs through the AudioLoopEngine, not the polling player." }
      ]
    },
    {
      "id": "tune-cents",
      "title": "Tune to within a cent (or three)",
      "duration": "2 min",
      "intro": "Snap-in-tune makes the Tuner forgiving without lying to you.",
      "steps": [
        { "h": "Open the Tuner", "p": "Home grid → TUNER tile. The note-name display lights up as soon as a pitch is detected." },
        { "h": "Pick your input", "p": "Settings → Audio → Input. If you're using a USB interface, pick the channel your instrument is on." },
        { "h": "Play a note", "p": "The needle moves; the cents readout shows your distance from centre." },
        { "h": "Watch for the green lock", "p": "Inside ±3 cents the needle snaps to centre and the LED glows green. A 1-cent wobble won't pull the needle around. Toggle the behaviour off in Settings if you'd rather see every micro-flutter." }
      ]
    },
    {
      "id": "midi-record-in-place",
      "title": "Record a MIDI part into an existing clip",
      "duration": "3 min",
      "intro": "Record-in-place keeps everything on one timeline.",
      "steps": [
        { "h": "Open the MIDI Module", "p": "Home grid → MIDI tile. The Piano Roll opens on the active clip." },
        { "h": "Position the playhead", "p": "Scrub the timeline so the playhead sits where you want the recording to start. Remember — the playhead stays at centre, the timeline scrolls under it." },
        { "h": "Tap the small REC pill", "p": "It lives in the grid-snap strip, not the transport. The pill arms recording into the current clip." },
        { "h": "Play", "p": "Use the MIDI REC chip in the top bar to open the Play Hub, then play. Notes record into the clip at the playhead via the live sink — no new gallery take is created." },
        { "h": "Trim with the clip handles", "p": "If the take overshoots the clip, drag the right clip handle inward — the extra notes hide but aren't deleted. Drag the handle back out and they return." }
      ]
    }
  ],

  "faq": [
    {
      "q": "Why are some of my microphones missing from the input list?",
      "a": "OSE collapses every built-in microphone into a single 'Internal device' row to keep the list short. Phantom inputs (telephony, remote submix) are filtered out — they're never useful for music. Plug in a USB interface and every real channel will appear."
    },
    {
      "q": "What's the difference between MONITOR and PRINT?",
      "a": "MONITOR opens an audible loopback so you hear yourself through the DSP chain in real time. PRINT controls whether the offline DSP bake fires when you leave the recorder lens. They're independent toggles — you can have one without the other, both, or neither."
    },
    {
      "q": "I trimmed a take and now I want it back. Did I lose audio?",
      "a": "No. The Audio Editor is non-destructive by default. Clip handles write to a sidecar; nothing rewrites the source file until you Bounce. Drag the handle back out to recover the trimmed audio. Even after a Bounce, Revert restores the stashed original."
    },
    {
      "q": "Why is my recording silent when I'm sure I plugged something in?",
      "a": "Open Settings → Audio and check that the input device matches your physical input. If it's a USB interface, the channel chooser inside Settings has to point to the right channel. The Tuner and Meters modules can confirm signal arrival in seconds."
    },
    {
      "q": "Does OSE work on a tablet or with DeX?",
      "a": "Yes. The Piano Roll Editor was built stylus-first — S-Pen tilt, pressure and side-button axes are read where MotionEvent exposes them — so phone, tablet and DeX share one codebase. Layout adapts to landscape and portrait independently rather than scaling a phone view."
    },
    {
      "q": "Can I bind hardware controllers?",
      "a": "Yes — long-press any knob, slider or toggle to enter MIDI Learn. Bindings are global and channel-aware. The Settings sheet shows all current bindings."
    },
    {
      "q": "How do I import an audio file from my device?",
      "a": "All file imports use the system's single-file picker. The previous in-app folder-grant dialog has been retired."
    },
    {
      "q": "Where can I report a bug or request a feature?",
      "a": "Email <a href='mailto:info@outhentic.eu'>info@outhentic.eu</a> with a short description and, if possible, a screen recording. The Outhentic team reads everything."
    }
  ],

  "footer": {
    "tagline": "Outhentic Sound Engine. By Outhentic Ltd. — Sofia, Bulgaria.",
    "columns": [
      {
        "title": "Product",
        "links": [
          { "href": "index.html",     "label": "Overview" },
          { "href": "manual.html",    "label": "Manual" },
          { "href": "tutorials.html", "label": "Tutorials" },
          { "href": "help.html",      "label": "Help & FAQ" }
        ]
      },
      {
        "title": "Modules",
        "links": [
          { "href": "modules/play.html",             "label": "Play" },
          { "href": "modules/audio.html",            "label": "Audio" },
          { "href": "modules/midi.html",             "label": "MIDI" },
          { "href": "modules/practice.html",         "label": "Practice" }
        ]
      },
      {
        "title": "Tools",
        "links": [
          { "href": "modules/metronome.html",        "label": "Metronome" },
          { "href": "modules/tuner.html",            "label": "Tuner" },
          { "href": "modules/signal-generator.html", "label": "Signal Generator" },
          { "href": "modules/meters.html",           "label": "Meters" }
        ]
      },
      {
        "title": "Legal",
        "links": [
          { "href": "privacy.html", "label": "Privacy policy" },
          { "href": "terms.html",   "label": "Terms of use" },
          { "href": "https://outhentic.eu/", "label": "Outhentic.eu" }
        ]
      }
    ]
  },

  "privacy_html": "<h2>Privacy Policy for OSE (Outhentic Sound Engine)</h2><p><strong>Effective Date:</strong> [DATE]</p><p>This Privacy Policy describes how OSE (Outhentic Sound Engine) (\"the App\") handles your information. The App is developed by Outhentic Ltd. (\"we\", \"us\", or \"our\").</p><p><strong>Company data:</strong><br>Outhentic Ltd.<br>ID: 204923841<br>VAT: BG204923841<br>Address: Sofia 1592, Bulgaria, Druzhba 72, vh.D, ap.95</p><h3>1. No Data Collection</h3><p>We believe in your privacy as a musician. OSE does not collect, transmit, or store any personal data.</p><ul><li>We do not collect your name, email address, or phone number.</li><li>We do not use any third-party analytics or tracking software.</li><li>We do not show advertisements.</li></ul><h3>2. Permissions &amp; Usage</h3><p>The App requires certain permissions to function as a professional audio workstation. These are used locally on your device and are never shared with us or any third party:</p><ul><li><strong>Bluetooth &amp; Location:</strong> Used exclusively to discover and connect to Bluetooth Low Energy (BLE) MIDI keyboards. Location access is an Android system requirement for Bluetooth scanning; we do not track your physical location.</li><li><strong>Storage Access:</strong> Used to allow you to import your own SoundFont (.sf2) files and to save/share your MIDI recordings.</li><li><strong>Audio Settings:</strong> Used to optimize the Oboe C++ engine for low-latency performance and to manage audio routing to external USB devices.</li></ul><h3>3. MIDI &amp; Audio Data</h3><p>All MIDI recordings made within the App (including \"Ghost Recordings\") are stored locally on your device. When you choose to \"Share\" a MIDI file, it is handled by the Android system's standard sharing mechanism to the destination you choose. We have no access to your musical creations.</p><h3>4. Third-Party Services</h3><p>The App does not connect to any third-party cloud services or social media platforms.</p><h3>5. Changes to This Policy</h3><p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page or through an app update.</p><h3>6. Contact Us</h3><p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:</p><p>Email: <a href='mailto:info@outhentic.eu'>info@outhentic.eu</a></p>",

  "terms_html": "<h2>Terms of use</h2><p><em>Last updated: 10 May 2026.</em></p><p>The Outhentic Sound Engine (\"OSE\", the \"App\") is developed by Outhentic Ltd. (ID 204923841, VAT BG204923841), Sofia 1592, Bulgaria, Druzhba 72, vh.D, ap.95.</p><h3>1. Acceptance</h3><p>By installing or using OSE, or by visiting <code>outhentic.eu/ose</code>, you accept these terms.</p><h3>2. Licence</h3><p>OSE is licensed, not sold. We grant you a non-exclusive, non-transferable, revocable licence to use OSE for personal or commercial music production on devices you own or control. You may not redistribute, decompile or sublicense the App.</p><h3>3. Your content</h3><p>Audio recordings, MIDI files, presets and any other content you create with OSE belong to you. We make no claim of ownership.</p><h3>4. Disclaimer of warranty</h3><p>OSE and the Site are provided \"as is\" without warranty of any kind, express or implied. We do not guarantee that the App will be uninterrupted, error-free, or compatible with every device and Android version.</p><h3>5. Limitation of liability</h3><p>To the maximum extent permitted by law, Outhentic Ltd. will not be liable for any indirect, incidental, special, consequential or punitive damages arising from your use of OSE or the Site, including loss of recordings or data. Always keep backups of work that matters.</p><h3>6. Third-party services</h3><p>OSE is distributed via the Google Play Store, which has its own terms.</p><h3>7. Changes</h3><p>We may update these terms; the latest version will live at this URL with the date at the top updated.</p><h3>8. Governing law</h3><p>These terms are governed by the laws of Bulgaria. Disputes will be resolved in the courts of Sofia, Bulgaria.</p><h3>9. Contact</h3><p>Questions: <a href='mailto:info@outhentic.eu'>info@outhentic.eu</a>.</p>"
};
