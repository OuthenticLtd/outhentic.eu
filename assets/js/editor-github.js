/* Outhentic editor — GitHub direct-save + binary uploads.
 *
 * Adds:
 *  - "Connect GitHub" pill (top-right of editor header)
 *  - "Save to GitHub" button next to every Download button
 *  - "Upload" button next to every image / audio / cover path field
 *  - Quill image button: uploads the picked file to GitHub instead of base64
 *
 * Credentials are stored in localStorage on this browser only.
 */
(function () {
  if (!document.getElementById('editor')) return;

  var STORAGE = {
    repo:   'outhentic-gh-repo',
    token:  'outhentic-gh-token',
    branch: 'outhentic-gh-branch'
  };

  /* ====================================================================
     LOCAL DEFAULTS — pre-fill the Connect modal so you only need to paste
     a token. After "Connect GitHub" the values you save go into
     localStorage and take precedence on subsequent loads.
     SECURITY: keep the token field empty in this file. Tokens belong in
     localStorage only, never in a file that could end up in a repo.
     ==================================================================== */
  var DEFAULTS = {
    repo:   'OuthenticLtd/outhentic.eu',
    token:  '',
    branch: 'main'
  };

  function get(k) {
    var v = localStorage.getItem(k);
    if (v) return v;
    // Fall back to baked-in default
    if (k === STORAGE.repo)   return DEFAULTS.repo;
    if (k === STORAGE.token)  return DEFAULTS.token;
    if (k === STORAGE.branch) return DEFAULTS.branch;
    return '';
  }
  function set(k, v) { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); }
  function isConnected() { return !!(get(STORAGE.repo) && get(STORAGE.token)); }
  function escape(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // ---------- UI: status pill + connect modal ----------
  function injectUI() {
    var head = document.querySelector('.ed-head');
    if (!head || head.querySelector('.gh-pill')) return;

    var pill = document.createElement('button');
    pill.className = 'gh-pill';
    pill.style.cssText =
      'border: 1px solid var(--line); background: #fff; padding: 8px 14px;' +
      'font: inherit; font-size: .76rem; font-weight: 600; letter-spacing: .12em;' +
      'text-transform: uppercase; cursor: pointer; color: var(--ink);' +
      'display: inline-flex; align-items: center; gap: 8px;';
    head.appendChild(pill);

    function refreshPill() {
      if (isConnected()) {
        pill.innerHTML = '<span style="color:#2e8540;">●</span> ' + escape(get(STORAGE.repo));
        pill.title = 'Connected to GitHub. Click to disconnect.';
      } else {
        pill.innerHTML = '<span style="color:var(--muted);">○</span> Connect GitHub';
        pill.title = 'Connect a GitHub repo to save changes directly.';
      }
    }
    refreshPill();
    pill.addEventListener('click', function () {
      if (isConnected()) {
        if (confirm('Disconnect from GitHub?\nRepo: ' + get(STORAGE.repo))) {
          set(STORAGE.repo, ''); set(STORAGE.token, ''); set(STORAGE.branch, '');
          refreshPill(); refreshSaveButtons(); refreshUploadButtons();
        }
      } else {
        showModal();
      }
    });
    window.__ghRefreshPill = refreshPill;
  }

  function showModal() {
    var bg = document.createElement('div');
    bg.style.cssText =
      'position:fixed; inset:0; background:rgba(10,10,10,.78); z-index:200;' +
      'display:flex; align-items:center; justify-content:center; padding:20px;';
    bg.innerHTML =
      '<div style="background:#fff; max-width:520px; width:100%; padding:32px; border:1px solid var(--line);">' +
      '<h2 style="font-family:Fraunces,serif; font-weight:400; margin:0 0 8px; font-size:1.4rem;">Connect to GitHub</h2>' +
      '<p style="color:var(--muted); margin:0 0 22px; font-size:.92rem;">Save changes directly to your repo. Credentials stored only in this browser.</p>' +
      '<div style="margin-bottom:14px;"><label style="display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:5px;">Repo (username/repo)</label>' +
      '<input id="gh-repo" type="text" placeholder="zhivkovasilev/outhentic-website" style="width:100%; padding:10px 12px; font:inherit; border:1px solid var(--line); background:var(--bg);" value="' + escape(get(STORAGE.repo)) + '"></div>' +
      '<div style="margin-bottom:14px;"><label style="display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:5px;">Branch</label>' +
      '<input id="gh-branch" type="text" placeholder="main" style="width:100%; padding:10px 12px; font:inherit; border:1px solid var(--line); background:var(--bg);" value="' + escape(get(STORAGE.branch) || 'main') + '"></div>' +
      '<div style="margin-bottom:14px;"><label style="display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:5px;">Personal access token</label>' +
      '<input id="gh-token" type="password" placeholder="ghp_..." style="width:100%; padding:10px 12px; font:inherit; border:1px solid var(--line); background:var(--bg); font-family:JetBrains Mono,monospace; font-size:.85rem;"></div>' +
      '<div style="background:var(--bg-alt); padding:14px; font-size:.84rem; color:var(--ink-soft); margin-bottom:18px; border-left:3px solid var(--accent);">' +
      '<strong>How to get a token:</strong><br>' +
      '1. Go to <a href="https://github.com/settings/tokens?type=beta" target="_blank">github.com/settings/tokens</a> → Generate new token (fine-grained)<br>' +
      '2. Repository access: just your site repo<br>' +
      '3. Permissions: <code>Contents: Read and write</code><br>' +
      '4. Copy the <code>github_pat_…</code> string and paste above</div>' +
      '<div id="gh-err" style="color:var(--warn); font-size:.85rem; margin-bottom:14px; min-height:1.2em;"></div>' +
      '<div style="display:flex; gap:10px; justify-content:flex-end;">' +
      '<button id="gh-cancel" class="btn btn--small">Cancel</button>' +
      '<button id="gh-save" class="btn btn--primary btn--small">Test &amp; save</button>' +
      '</div></div>';
    document.body.appendChild(bg);

    var close = function () { bg.remove(); };
    bg.querySelector('#gh-cancel').addEventListener('click', close);
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });

    bg.querySelector('#gh-save').addEventListener('click', async function () {
      var repo = bg.querySelector('#gh-repo').value.trim();
      var branch = bg.querySelector('#gh-branch').value.trim() || 'main';
      var token = bg.querySelector('#gh-token').value.trim();
      var err = bg.querySelector('#gh-err');
      if (!repo || !token) { err.textContent = 'Repo and token are required.'; return; }
      if (!/^[^\s\/]+\/[^\s\/]+$/.test(repo)) { err.textContent = 'Repo must look like "username/reponame".'; return; }
      err.textContent = 'Testing…';
      try {
        var r = await fetch('https://api.github.com/repos/' + repo + '/branches/' + encodeURIComponent(branch), {
          headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' }
        });
        if (!r.ok) {
          if (r.status === 401) err.textContent = 'Token rejected. Check that it has Contents:write on this repo.';
          else if (r.status === 404) err.textContent = 'Repo or branch not found. Check the names.';
          else err.textContent = 'GitHub error: ' + r.status + ' ' + r.statusText;
          return;
        }
        set(STORAGE.repo, repo); set(STORAGE.token, token); set(STORAGE.branch, branch);
        if (window.__ghRefreshPill) window.__ghRefreshPill();
        refreshSaveButtons(); refreshUploadButtons();
        close();
      } catch (e) {
        err.textContent = 'Network error: ' + e.message;
      }
    });
    setTimeout(function () { bg.querySelector('#gh-token').focus(); }, 50);
  }

  // ---------- File save (text content) ----------
  async function saveFile(path, content, commitMsg) {
    var repo = get(STORAGE.repo);
    var token = get(STORAGE.token);
    var branch = get(STORAGE.branch) || 'main';
    if (!repo || !token) throw new Error('GitHub not connected');

    var sha = null;
    try {
      var probe = await fetch('https://api.github.com/repos/' + repo + '/contents/' + path + '?ref=' + encodeURIComponent(branch), {
        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' }
      });
      if (probe.ok) sha = (await probe.json()).sha;
    } catch (_) {}

    var b64 = btoa(unescape(encodeURIComponent(content)));
    var body = { message: commitMsg || ('Update ' + path + ' via editor'), content: b64, branch: branch };
    if (sha) body.sha = sha;

    var resp = await fetch('https://api.github.com/repos/' + repo + '/contents/' + path, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!resp.ok) { var t = await resp.text(); throw new Error('GitHub returned ' + resp.status + ': ' + t); }
    return resp.json();
  }

  // ---------- Binary upload (images, audio) ----------
  function arrayBufferToBase64(buf) {
    var bytes = new Uint8Array(buf);
    var binary = '';
    var chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }
  async function uploadBinary(path, file, commitMsg) {
    var repo = get(STORAGE.repo);
    var token = get(STORAGE.token);
    var branch = get(STORAGE.branch) || 'main';
    if (!repo || !token) throw new Error('GitHub not connected');

    var buf = await file.arrayBuffer();
    var b64 = arrayBufferToBase64(buf);

    var sha = null;
    try {
      var probe = await fetch('https://api.github.com/repos/' + repo + '/contents/' + path + '?ref=' + encodeURIComponent(branch), {
        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' }
      });
      if (probe.ok) sha = (await probe.json()).sha;
    } catch (_) {}

    var body = { message: commitMsg || ('Upload ' + path + ' via editor'), content: b64, branch: branch };
    if (sha) body.sha = sha;

    var resp = await fetch('https://api.github.com/repos/' + repo + '/contents/' + path, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!resp.ok) { var t = await resp.text(); throw new Error('GitHub returned ' + resp.status + ': ' + t); }
    return resp.json();
  }
  window.__outhenticUploadBinary = uploadBinary;

  // ---------- Save buttons (text content) ----------
  function refreshSaveButtons() {
    document.querySelectorAll('[data-gh-save-of]').forEach(function (b) { b.remove(); });
    if (!isConnected()) return;

    var setups = [
      { sel: '#news-download',     file: 'assets/news/posts.js',     label: 'Save posts.js to GitHub',     gen: makeNewsContent },
      { sel: '.site-download',     file: 'assets/news/site-data.js', label: 'Save site-data.js to GitHub', gen: makeSiteContent },
      { sel: '#albums-download',   file: 'assets/js/albums.js',      label: 'Save albums.js to GitHub',    gen: makeAlbumsContent }
    ];
    setups.forEach(function (s) {
      document.querySelectorAll(s.sel).forEach(function (btn) {
        if (btn.parentNode.querySelector('[data-gh-save-of="' + s.sel + '"]')) return;
        var save = document.createElement('button');
        save.className = 'btn btn--primary';
        save.textContent = '↑ ' + s.label;
        save.style.marginLeft = '6px';
        save.setAttribute('data-gh-save-of', s.sel);
        save.addEventListener('click', async function () {
          save.disabled = true; var orig = save.textContent; save.textContent = 'Saving…';
          try {
            await saveFile(s.file, s.gen(), 'Update ' + s.file.split('/').pop() + ' via /editor.html');
            save.textContent = '✓ Saved';
            setTimeout(function () { save.textContent = orig; save.disabled = false; }, 2500);
            window.dispatchEvent(new CustomEvent('outhentic-saved', { detail: { file: s.file } }));
          } catch (e) {
            console.error('GitHub save failed', e);
            alert('Save failed:\n' + e.message);
            save.textContent = orig; save.disabled = false;
          }
        });
        btn.parentNode.insertBefore(save, btn.nextSibling);
      });
    });
  }

  // ---------- Upload buttons (binary) ----------
  // Mappings from a path-input context to a target folder. We figure out the folder
  // either from the field's data-key/data-h or from the surrounding panel.
  function folderFor(input) {
    // Explicit override
    var explicit = input.getAttribute('data-upload-folder');
    if (explicit) return explicit;

    var key = input.getAttribute('data-key') || input.getAttribute('data-h') || '';
    var panel = input.closest('[data-panel]');
    var pname = panel ? panel.getAttribute('data-panel') : '';

    if (key === 'photo' && pname === 'members-group')      return 'assets/img/band/';
    if (key === 'photo' && pname === 'members-foundation') return 'assets/img/band/';
    if (key === 'src'   && pname === 'gallery')            return 'assets/img/gallery/';
    if (key === 'image' && pname === 'news') {
      // News article cover — try to put into per-slug folder if we can find the slug
      var card = input.closest('[data-section="news"]');
      if (card) {
        var slugInput = card.querySelector('input[data-key="slug"]');
        if (slugInput && slugInput.value) return 'assets/img/articles/' + slugInput.value + '/';
      }
      return 'assets/img/articles/';
    }
    if (key === 'image' && pname === 'hero') {
      var hk = input.closest('[data-hero-key]');
      var which = hk ? hk.getAttribute('data-hero-key') : 'hero';
      return 'assets/img/' + (which === 'foundation' ? 'foundation/' : '');
    }
    if (key === 'cover' && pname === 'albums') return 'assets/img/albums/';
    if (key === 'src'   && pname === 'albums') {
      var trackCard = input.closest('[data-album-key]');
      var akey = trackCard ? trackCard.getAttribute('data-album-key') : 'misc';
      return 'assets/audio/' + akey + '/';
    }
    return 'assets/uploads/';
  }
  function safeName(name) {
    return String(name || 'file').toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function refreshUploadButtons() {
    var connected = isConnected();
    // Update labels on existing buttons (toggle when connection state changes)
    document.querySelectorAll('.gh-upload-wrap button').forEach(function (b) {
      if (connected) { b.disabled = false; b.textContent = '⤴ Upload file'; }
      else { b.disabled = false; b.textContent = '⤴ Connect GitHub to upload'; }
    });

    // Find every upload-eligible input: image / photo / src / cover / hero image
    var selectors = [
      'input[data-key="photo"]',
      'input[data-key="image"]',
      'input[data-key="src"]',
      'input[data-key="cover"]',
      'input[data-h="image"]',
      'input[data-slider-input]'
    ];
    var inputs = document.querySelectorAll(selectors.join(','));
    inputs.forEach(function (inp) {
      // Skip if there's already an upload wrap right after this input
      if (inp.nextElementSibling && inp.nextElementSibling.classList && inp.nextElementSibling.classList.contains('gh-upload-wrap')) {
        var existingBtn = inp.nextElementSibling.querySelector('button');
        if (existingBtn) { existingBtn.disabled = false; existingBtn.textContent = '⤴ Upload file'; }
        return;
      }

      var wrap = document.createElement('span');
      wrap.className = 'gh-upload-wrap';
      wrap.style.cssText = 'display:inline-flex; gap:6px; margin-top:6px; align-items:center;';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--small';
      btn.style.cssText = 'padding:6px 10px; font-size:.68rem;';
      btn.textContent = isConnected() ? '⤴ Upload file' : '⤴ Connect GitHub to upload';
      btn.disabled = false;
      btn.title = isConnected()
        ? 'Pick a file from your computer — it will be uploaded to your GitHub repo.'
        : 'Click the GitHub pill to connect first.';

      var fileInp = document.createElement('input');
      fileInp.type = 'file';
      fileInp.style.display = 'none';
      // Hint accept based on field key
      var key = inp.getAttribute('data-key') || inp.getAttribute('data-h') || '';
      if (key === 'src' && inp.closest('[data-panel="albums"]')) fileInp.accept = 'audio/*';
      else fileInp.accept = 'image/*';

      var status = document.createElement('span');
      status.style.cssText = 'font-size:.72rem; color:var(--muted);';

      btn.addEventListener('click', function () {
        if (!isConnected()) { showModal(); return; }
        fileInp.click();
      });
      fileInp.addEventListener('change', async function () {
        var file = fileInp.files && fileInp.files[0];
        if (!file) return;
        var folder = folderFor(inp);
        var path = folder + safeName(file.name);
        status.textContent = 'Uploading ' + file.name + '…';
        btn.disabled = true;
        try {
          await uploadBinary(path, file, 'Upload ' + path + ' via /editor.html');
          inp.value = path;
          // Trigger an "input" event so editor's listeners pick up the new value
          inp.dispatchEvent(new Event('input', { bubbles: true }));

          // For audio: probe duration via temp <audio>
          if (fileInp.accept === 'audio/*') {
            try {
              var url = URL.createObjectURL(file);
              var a = new Audio();
              a.preload = 'metadata';
              a.src = url;
              a.addEventListener('loadedmetadata', function () {
                var card = inp.closest('[data-album-key]');
                var trackCard = inp.closest('[data-track-idx]');
                if (trackCard) {
                  var durInp = trackCard.querySelector('input[data-key="duration"]');
                  if (durInp) {
                    durInp.value = a.duration.toFixed(2);
                    durInp.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }
                URL.revokeObjectURL(url);
              });
            } catch (_) {}
          }

          status.textContent = '✓ Uploaded → ' + path;
          status.style.color = '#2e8540';
          setTimeout(function () { status.textContent = ''; status.style.color = 'var(--muted)'; }, 4000);
        } catch (e) {
          status.textContent = 'Failed: ' + e.message;
          status.style.color = 'var(--warn)';
          console.error(e);
        }
        btn.disabled = !isConnected();
        fileInp.value = '';
      });

      wrap.appendChild(btn);
      wrap.appendChild(fileInp);
      wrap.appendChild(status);

      // Place the wrap right after the input
      inp.insertAdjacentElement('afterend', wrap);
    });
  }

  // ---------- Quill image handler ----------
  // After the editor builds Quill instances, we override the image button so
  // it uploads via GitHub instead of base64-embedding into the article body.
  function quillImageHandlerFactory(editorInstance) {
    return function () {
      if (!isConnected()) {
        alert('Connect to GitHub first (top-right pill) to upload images.');
        return;
      }
      var picker = document.createElement('input');
      picker.type = 'file'; picker.accept = 'image/*';
      picker.addEventListener('change', async function () {
        var file = picker.files && picker.files[0];
        if (!file) return;
        // Try to derive slug from the post the editor is on
        var card = document.activeElement && document.activeElement.closest ? document.activeElement.closest('[data-section="news"]') : null;
        var slug = (card && card.querySelector('input[data-key="slug"]')) ? card.querySelector('input[data-key="slug"]').value : 'misc';
        var path = 'assets/img/articles/' + (slug || 'misc') + '/' + safeName(file.name);
        try {
          await uploadBinary(path, file, 'Upload article image ' + path);
          // Insert at current selection
          var range = editorInstance.getSelection(true);
          editorInstance.insertEmbed(range.index, 'image', path, 'user');
          editorInstance.setSelection(range.index + 1, 0);
        } catch (e) {
          alert('Upload failed: ' + e.message);
        }
      });
      picker.click();
    };
  }
  // Wait for Quill instances and patch them
  function patchQuillEditors() {
    if (!window.Quill) return;
    document.querySelectorAll('[data-quill]').forEach(function (div) {
      var q = Quill.find(div);
      if (!q || div.dataset.ghPatched) return;
      var toolbar = q.getModule('toolbar');
      if (toolbar) {
        toolbar.addHandler('image', quillImageHandlerFactory(q));
        div.dataset.ghPatched = '1';
      }
    });
  }

  // ---------- Generators ----------
  function makeNewsContent() {
    if (window.__outhenticEditorState && window.__outhenticEditorState.posts) {
      var sorted = window.__outhenticEditorState.posts.slice().sort(function (a, b) {
        return (b.date || '').localeCompare(a.date || '');
      });
      return "/* Outhentic news posts — bilingual (en/bg). Saved via /editor.html on " +
        new Date().toISOString().slice(0, 19).replace('T', ' ') + " UTC. */\n" +
        "window.OUTHENTIC_NEWS = " + JSON.stringify({ posts: sorted }, null, 2) + ";\n";
    }
    return "/* No data */\nwindow.OUTHENTIC_NEWS = " + JSON.stringify(window.OUTHENTIC_NEWS || { posts: [] }, null, 2) + ";\n";
  }
  function makeSiteContent() {
    var s = (window.__outhenticEditorState && window.__outhenticEditorState.site) || window.OUTHENTIC_SITE || {};
    return "/* Outhentic — site-wide content. Saved via /editor.html on " +
      new Date().toISOString().slice(0, 19).replace('T', ' ') + " UTC. */\n" +
      "window.OUTHENTIC_SITE = " + JSON.stringify(s, null, 2) + ";\n";
  }
  function makeAlbumsContent() {
    var a = (window.__outhenticEditorState && window.__outhenticEditorState.albums) || window.OUTHENTIC_ALBUMS || {};
    return "/* Outhentic — album data. Saved via /editor.html on " +
      new Date().toISOString().slice(0, 19).replace('T', ' ') + " UTC. */\n" +
      "window.OUTHENTIC_ALBUMS = " + JSON.stringify(a, null, 2) + ";\n";
  }

  // ---------- Init + observe DOM changes (re-render on tab/render) ----------
  function init() {
    injectUI();
    refreshSaveButtons();
    refreshUploadButtons();
    patchQuillEditors();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run setup whenever the editor toggles visibility (gate → unlocked) and
  // whenever tab buttons re-render content. Debounced + re-entry-guarded so the
  // observer can't loop on its own DOM additions.
  var refreshing = false;
  function scheduleRefresh() {
    if (refreshing) return;
    refreshing = true;
    setTimeout(function () {
      try {
        if (!document.getElementById('editor').classList.contains('hidden')) {
          injectUI();
          refreshSaveButtons();
          refreshUploadButtons();
          patchQuillEditors();
        }
      } finally {
        // delay reset so DOM mutations from our own work don't queue another run
        setTimeout(function () { refreshing = false; }, 50);
      }
    }, 0);
  }
  // Editor unlock: only watch class attribute on #editor
  var observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.getElementById('editor'), { attributes: true, attributeFilter: ['class'] });
  // Tab clicks (lists may re-render)
  document.addEventListener('click', function (e) {
    if (e.target.closest && (e.target.closest('.tab') || e.target.closest('button[data-act]') || e.target.closest('button[data-aact]') || e.target.closest('button[data-tact]') || e.target.closest('#news-add') || e.target.closest('#gm-add') || e.target.closest('#fm-add') || e.target.closest('#gal-add') || e.target.closest('#albums-add'))) {
      scheduleRefresh();
    }
  });
  // <details> toggle (Quill editors lazy-init when opened)
  document.addEventListener('toggle', function () { scheduleRefresh(); }, true);

  window.__outhenticGitHub = {
    isConnected: isConnected,
    upload: uploadBinary,
    saveFile: saveFile
  };
})();
