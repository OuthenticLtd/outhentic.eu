/* OSE editor - GitHub direct-save layer (mirrors parent site's editor-github.js
 * pattern; targets /ose/assets/data/ose-content.js).
 *
 * Adds:
 *   - "Connect GitHub" pill (top-right of editor header)
 *   - "Save to GitHub" button next to the Download button
 * Credentials live in localStorage on this browser only.
 */
(function () {
  if (!document.getElementById('editor')) return;

  var STORAGE = {
    repo:   'ose-gh-repo',
    token:  'ose-gh-token',
    branch: 'ose-gh-branch'
  };
  var DEFAULTS = {
    repo:   'OuthenticLtd/outhentic.eu',
    token:  '',
    branch: 'main'
  };
  // Path of the content file inside the repo
  var CONTENT_PATH = 'ose/assets/data/ose-content.js';

  function get(k) {
    var v = localStorage.getItem(k);
    if (v) return v;
    if (k === STORAGE.repo)   return DEFAULTS.repo;
    if (k === STORAGE.token)  return DEFAULTS.token;
    if (k === STORAGE.branch) return DEFAULTS.branch;
    return '';
  }
  function setStore(k, v) { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); }
  function isConnected() { return !!(get(STORAGE.repo) && get(STORAGE.token)); }
  function escape(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // ---------- UI ----------
  function injectUI() {
    var head = document.querySelector('.ed-head');
    if (!head || head.querySelector('.gh-pill')) return;
    var pill = document.createElement('button');
    pill.className = 'gh-pill';
    pill.style.cssText =
      'border: 1px solid var(--line); background: var(--surface); padding: 8px 14px;' +
      'font: inherit; font-size: .76rem; font-weight: 600; letter-spacing: .12em;' +
      'text-transform: uppercase; cursor: pointer; color: var(--ink);' +
      'display: inline-flex; align-items: center; gap: 8px; border-radius: 999px;';
    head.appendChild(pill);
    function refresh() {
      if (isConnected()) {
        pill.innerHTML = '<span style="color:#42E07A;">●</span> ' + escape(get(STORAGE.repo));
        pill.title = 'Connected to GitHub. Click to disconnect.';
      } else {
        pill.innerHTML = '<span style="color:var(--muted);">○</span> Connect GitHub';
        pill.title = 'Connect a GitHub repo to save changes directly.';
      }
    }
    refresh();
    pill.addEventListener('click', function () {
      if (isConnected()) {
        if (confirm('Disconnect from GitHub?\nRepo: ' + get(STORAGE.repo))) {
          setStore(STORAGE.repo, ''); setStore(STORAGE.token, ''); setStore(STORAGE.branch, '');
          refresh(); refreshSaveButtons();
        }
      } else {
        showModal();
      }
    });
    window.__ghRefreshPill = refresh;
  }

  function showModal() {
    var bg = document.createElement('div');
    bg.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,.78); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px;';
    bg.innerHTML =
      '<div style="background:var(--surface); max-width:520px; width:100%; padding:32px; border:1px solid var(--line); border-radius:14px;">' +
      '<h2 style="font-weight:700; margin:0 0 8px; font-size:1.4rem; color:var(--ink);">Connect to GitHub</h2>' +
      '<p style="color:var(--muted); margin:0 0 22px; font-size:.92rem;">Save changes directly to your repo. Credentials stored only in this browser.</p>' +
      '<div style="margin-bottom:14px;"><label style="display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:5px;">Repo (username/repo)</label>' +
      '<input id="gh-repo" type="text" placeholder="OuthenticLtd/outhentic.eu" style="width:100%; padding:10px 12px; font:inherit; border:1px solid var(--line); background:var(--bg); color:var(--ink); border-radius:6px;" value="' + escape(get(STORAGE.repo)) + '"></div>' +
      '<div style="margin-bottom:14px;"><label style="display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:5px;">Branch</label>' +
      '<input id="gh-branch" type="text" placeholder="main" style="width:100%; padding:10px 12px; font:inherit; border:1px solid var(--line); background:var(--bg); color:var(--ink); border-radius:6px;" value="' + escape(get(STORAGE.branch) || 'main') + '"></div>' +
      '<div style="margin-bottom:14px;"><label style="display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:5px;">Personal access token</label>' +
      '<input id="gh-token" type="password" placeholder="ghp_..." style="width:100%; padding:10px 12px; font:inherit; border:1px solid var(--line); background:var(--bg); color:var(--ink); border-radius:6px; font-family:JetBrains Mono,monospace; font-size:.85rem;"></div>' +
      '<div style="background:var(--bg-1); padding:14px; font-size:.84rem; color:var(--ink-soft); margin-bottom:18px; border-left:3px solid var(--accent-orange); border-radius:6px;">' +
      '<strong>How to get a token:</strong><br>1. <a href="https://github.com/settings/tokens?type=beta" target="_blank" style="color:var(--accent-orange);">github.com/settings/tokens</a> → Generate new token (fine-grained)<br>2. Repository access → Only this repo<br>3. Permissions → Contents: Read &amp; Write</div>' +
      '<div style="display:flex; gap:10px; justify-content:flex-end;">' +
      '<button id="gh-cancel" class="btn">Cancel</button>' +
      '<button id="gh-save" class="btn btn--primary">Connect</button>' +
      '</div></div>';
    document.body.appendChild(bg);
    bg.querySelector('#gh-cancel').addEventListener('click', function () { document.body.removeChild(bg); });
    bg.querySelector('#gh-save').addEventListener('click', function () {
      var r = bg.querySelector('#gh-repo').value.trim();
      var b = bg.querySelector('#gh-branch').value.trim() || 'main';
      var t = bg.querySelector('#gh-token').value.trim();
      if (!r || !t) { alert('Repo and token are required'); return; }
      setStore(STORAGE.repo, r); setStore(STORAGE.token, t); setStore(STORAGE.branch, b);
      document.body.removeChild(bg);
      window.__ghRefreshPill && window.__ghRefreshPill();
      refreshSaveButtons();
    });
  }

  // Add Save-to-GitHub buttons next to every Download button
  function refreshSaveButtons() {
    document.querySelectorAll('.dl-content').forEach(function (btn) {
      var wrap = btn.parentNode;
      if (wrap.querySelector('.gh-save')) return;
      var save = document.createElement('button');
      save.className = 'btn btn--primary gh-save';
      save.textContent = 'Save to GitHub';
      save.style.marginLeft = '6px';
      save.addEventListener('click', saveContent);
      wrap.insertBefore(save, btn.nextSibling);
    });
  }

  // Get the SHA of an existing file (needed for PUT with overwrite)
  async function fileSha(path) {
    var url = 'https://api.github.com/repos/' + get(STORAGE.repo) + '/contents/' + path + '?ref=' + encodeURIComponent(get(STORAGE.branch));
    var r = await fetch(url, { headers: { 'Authorization': 'token ' + get(STORAGE.token), 'Accept': 'application/vnd.github+json' } });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('GitHub: ' + r.status);
    var j = await r.json();
    return j.sha;
  }

  async function putFile(path, contentString, message) {
    // base64 encode the UTF-8 string
    var bytes = new TextEncoder().encode(contentString);
    var b64 = btoa(Array.prototype.map.call(bytes, function (b) { return String.fromCharCode(b); }).join(''));
    var sha = null;
    try { sha = await fileSha(path); } catch (e) { console.warn(e); }
    var body = {
      message: message,
      content: b64,
      branch: get(STORAGE.branch)
    };
    if (sha) body.sha = sha;
    var r = await fetch('https://api.github.com/repos/' + get(STORAGE.repo) + '/contents/' + path, {
      method: 'PUT',
      headers: { 'Authorization': 'token ' + get(STORAGE.token), 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      var t = await r.text();
      throw new Error('GitHub PUT ' + r.status + ': ' + t);
    }
    return await r.json();
  }

  async function saveContent() {
    if (!isConnected()) { showModal(); return; }
    if (!window.OSE_BUILD_CONTENT_JS) { alert('Editor not ready'); return; }
    try {
      var jsString = window.OSE_BUILD_CONTENT_JS();
      await putFile(CONTENT_PATH, jsString, 'Edit ose-content.js via /ose/editor.html');
      var status = document.querySelector('.site-dirty');
      if (status) { status.textContent = 'saved'; status.style.color = '#42E07A'; }
      alert('Saved to GitHub. Live site updates in ~30 seconds.');
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { injectUI(); refreshSaveButtons(); });
  } else { injectUI(); refreshSaveButtons(); }
  // Re-inject when the editor reveals after gate
  var iv = setInterval(function () {
    if (document.getElementById('editor') && !document.getElementById('editor').classList.contains('hidden')) {
      injectUI(); refreshSaveButtons(); clearInterval(iv);
    }
  }, 300);
})();
