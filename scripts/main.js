// main.js — static GitHub Pages version (no Eel backend)
// All eel.* calls are safe: window.eel is guaranteed by api.js mock.
// Load order in index.html must be: api.js BEFORE main.js.

/* ── Utility: safe element getter (never throws) ─────────────────── */
function getEl(id) {
  var el = document.getElementById(id);
  if (!el) console.warn('[main.js] Element not found: #' + id);
  return el;
}

/* ── Dashboard ───────────────────────────────────────────────────── */
async function renderDashboard() {
  var container = getEl('page-dashboard');
  if (!container) return;

  var platforms = [];
  try { platforms = await window.eel.get_supported_platforms()(); } catch(e) {}

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6">
        <h3 class="text-lg font-semibold mb-2">Active Browsers</h3>
        <div class="text-3xl font-bold text-blue-400" id="browserCount">0</div>
      </div>
      <div class="glass-card p-6">
        <h3 class="text-lg font-semibold mb-2">Last Slot Check</h3>
        <div class="text-3xl font-bold text-yellow-400" id="lastSlot">-</div>
      </div>
      <div class="glass-card p-6">
        <h3 class="text-lg font-semibold mb-2">Notifications Sent</h3>
        <div class="text-3xl font-bold text-green-400">0</div>
      </div>
    </div>
    <div class="mt-8 glass-card p-6">
      <h2 class="text-xl font-bold mb-4">Quick Launch</h2>
      <div class="flex gap-4 flex-wrap">
        <select id="dashPlatform" class="bg-black/40 p-2 rounded-xl">
          ${platforms.map(function(p) { return '<option>' + p + '</option>'; }).join('')}
        </select>
        <select id="dashCountry" class="bg-black/40 p-2 rounded-xl"></select>
        <button id="quickLaunch" class="bg-blue-600 px-6 py-2 rounded-xl hover:bg-blue-500 transition">Launch 5 Windows</button>
      </div>
    </div>
  `;

  var platSelect    = getEl('dashPlatform');
  var countrySelect = getEl('dashCountry');
  if (!platSelect || !countrySelect) return;

  async function updateDashCountries() {
    var countries = [];
    try { countries = await window.eel.get_countries_for_platform(platSelect.value)(); } catch(e) {}
    countrySelect.innerHTML = countries.map(function(c) { return '<option>' + c + '</option>'; }).join('');
  }
  platSelect.addEventListener('change', updateDashCountries);
  await updateDashCountries();

  var quickLaunch = getEl('quickLaunch');
  if (quickLaunch) {
    quickLaunch.onclick = async function() {
      await API.launchBrowsers(platSelect.value, countrySelect.value, 5, false);
    };
  }

  // Update browser count periodically (safe — checks element exists each tick)
  setInterval(async function() {
    var countEl = getEl('browserCount');
    if (!countEl) return;
    var count = 0;
    try { count = (await window.eel.get_browser_count()) || 0; } catch(e) {}
    countEl.innerText = count;
  }, 2000);
}

/* ── Accounts ────────────────────────────────────────────────────── */
async function renderAccounts() {
  var container = getEl('page-accounts');
  if (!container) return;

  var accounts = [];
  try { accounts = await API.getAccounts(); } catch(e) {}

  container.innerHTML = `
    <div class="glass-card p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Account Manager</h2>
        <button id="addAccountBtn" class="bg-green-600 px-4 py-2 rounded-xl">+ Add</button>
      </div>
      <table class="w-full text-left">
        <thead><tr><th>Name</th><th>Email</th><th>Platform</th><th>Actions</th></tr></thead>
        <tbody id="accountsTableBody">
          ${accounts.map(function(acc) {
            return '<tr><td>' + acc.name + '</td><td>' + acc.email + '</td><td>' + (acc.platform || '-') + '</td>' +
                   '<td><button onclick="deleteAccount(' + acc.id + ')" class="text-red-400">Delete</button></td></tr>';
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  var addBtn = getEl('addAccountBtn');
  if (addBtn) {
    addBtn.onclick = function() {
      var name = prompt('Name'); if (!name) return;
      var email = prompt('Email'); if (!email) return;
      API.addAccount({ name: name, email: email, password: '', platform: '', country: '' })
        .then(function() { renderAccounts(); });
    };
  }
}

window.deleteAccount = async function(id) {
  try { await window.eel.delete_account(id)(); } catch(e) {}
  renderAccounts();
};

/* ── Browser Launcher ────────────────────────────────────────────── */
async function renderBrowser() {
  var container = getEl('page-browser');
  if (!container) return;

  var platforms = [];
  try { platforms = await window.eel.get_supported_platforms()(); } catch(e) {}

  container.innerHTML = `
    <div class="glass-card p-6 max-w-2xl">
      <h2 class="text-2xl font-bold mb-6">🚀 Launch 5 Chrome Windows</h2>
      <label class="block mb-2">Platform</label>
      <select id="launchPlatform" class="w-full p-3 bg-white/10 rounded-xl mb-4">
        ${platforms.map(function(p) { return '<option>' + p + '</option>'; }).join('')}
      </select>
      <label class="block mb-2">Country</label>
      <select id="launchCountry" class="w-full p-3 bg-white/10 rounded-xl mb-4"></select>
      <label class="flex items-center mb-4">
        <input type="checkbox" id="useProxies" class="mr-2"> Use proxies (if available)
      </label>
      <button id="doLaunch" class="w-full bg-blue-600 py-3 rounded-xl font-bold">Launch 5 Instances</button>
      <button id="closeAll" class="w-full mt-2 bg-red-600/50 py-2 rounded-xl">Close All Browsers</button>
    </div>
  `;

  var platSelect    = getEl('launchPlatform');
  var countrySelect = getEl('launchCountry');
  if (!platSelect || !countrySelect) return;

  async function updateBrowserCountries() {
    var countries = [];
    try { countries = await window.eel.get_countries_for_platform(platSelect.value)(); } catch(e) {}
    countrySelect.innerHTML = countries.map(function(c) { return '<option>' + c + '</option>'; }).join('');
  }
  platSelect.addEventListener('change', updateBrowserCountries);
  await updateBrowserCountries();

  var doLaunch = getEl('doLaunch');
  if (doLaunch) {
    doLaunch.onclick = async function() {
      var useProxies = getEl('useProxies');
      await API.launchBrowsers(platSelect.value, countrySelect.value, 5, useProxies ? useProxies.checked : false);
    };
  }

  var closeAll = getEl('closeAll');
  if (closeAll) {
    closeAll.onclick = async function() {
      try { await window.eel.close_all_browsers()(); } catch(e) {}
      alert('Closed all browsers');
    };
  }
}

/* ── Slot Monitor ────────────────────────────────────────────────── */
async function renderSlotMonitor() {
  var container = getEl('page-slot_monitor');
  if (!container) return;

  var platforms = [];
  try { platforms = await window.eel.get_supported_platforms()(); } catch(e) {}

  container.innerHTML = `
    <div class="glass-card p-6">
      <h2 class="text-2xl font-bold mb-4">⏱ Real-Time Slot Monitor</h2>
      <div class="flex gap-4 mb-6">
        <select id="monitorPlatform" class="bg-black/40 p-2 rounded-xl">
          ${platforms.map(function(p) { return '<option>' + p + '</option>'; }).join('')}
        </select>
        <select id="monitorCountry" class="bg-black/40 p-2 rounded-xl"></select>
        <button id="startMonitor" class="bg-green-600 px-4 py-2 rounded-xl">Start Monitoring (30s)</button>
        <button id="stopMonitor"  class="bg-red-600 px-4 py-2 rounded-xl">Stop</button>
      </div>
      <div id="slotStatus" class="text-center p-6 text-xl">Not monitoring</div>
    </div>
  `;

  var platSel    = getEl('monitorPlatform');
  var countrySel = getEl('monitorCountry');
  if (!platSel || !countrySel) return;

  async function updateMonitorCountries() {
    var countries = [];
    try { countries = await window.eel.get_countries_for_platform(platSel.value)(); } catch(e) {}
    countrySel.innerHTML = countries.map(function(c) { return '<option>' + c + '</option>'; }).join('');
  }
  platSel.addEventListener('change', updateMonitorCountries);
  await updateMonitorCountries();

  var startBtn = getEl('startMonitor');
  if (startBtn) {
    startBtn.onclick = async function() {
      try { await API.startSlotMonitor(platSel.value, countrySel.value); } catch(e) {}
      var s = getEl('slotStatus');
      if (s) s.innerHTML = '🟢 Monitoring active...';
    };
  }

  var stopBtn = getEl('stopMonitor');
  if (stopBtn) {
    stopBtn.onclick = async function() {
      try { await API.stopSlotMonitor(); } catch(e) {}
      var s = getEl('slotStatus');
      if (s) s.innerHTML = '🔴 Monitoring stopped';
    };
  }

  window.update_slot_status = function(available, platform, country) {
    var statusDiv = getEl('slotStatus');
    if (!statusDiv) return;
    statusDiv.innerHTML = available
      ? '✅ SLOT AVAILABLE for ' + platform + '/' + country + ' !!!'
      : '⏳ No slots yet for ' + platform + '/' + country;
  };
}

/* ── Logs Console ────────────────────────────────────────────────── */
async function renderLogs() {
  var container = getEl('page-logs');
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card p-6">
      <h2 class="text-2xl font-bold mb-4">📋 Live Logs</h2>
      <pre id="logContent" class="bg-black/50 p-4 rounded-xl overflow-auto h-96 text-sm font-mono"></pre>
      <button id="refreshLogs" class="mt-4 bg-blue-600 px-4 py-2 rounded-xl">Refresh</button>
    </div>
  `;

  async function refresh() {
    var logs = [];
    try { logs = await API.getLogs(); } catch(e) {}
    var el = getEl('logContent');
    if (el) el.innerText = logs.join('');
  }

  var refreshBtn = getEl('refreshLogs');
  if (refreshBtn) refreshBtn.onclick = refresh;

  refresh();
  setInterval(async function() {
    // Only refresh if the logs page is currently visible
    var container = getEl('page-logs');
    if (container && container.classList.contains('active-page')) refresh();
  }, 5000);
}

/* ── Proxies ─────────────────────────────────────────────────────── */
async function renderProxies() {
  var container = getEl('page-proxies');
  if (!container) return;

  var proxies = [];
  try { proxies = await API.getProxies(); } catch(e) {}

  container.innerHTML = `
    <div class="glass-card p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Proxy Manager</h2>
        <button id="addProxyBtn" class="bg-green-600 px-4 py-2 rounded-xl">+ Add Proxy</button>
      </div>
      <table class="w-full text-left">
        <thead><tr><th>IP</th><th>Port</th></tr></thead>
        <tbody>
          ${proxies.map(function(p) {
            return '<tr><td>' + p.ip + '</td><td>' + p.port + '</td></tr>';
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  var addProxyBtn = getEl('addProxyBtn');
  if (addProxyBtn) {
    addProxyBtn.onclick = function() {
      var ip   = prompt('Proxy IP');   if (!ip)   return;
      var port = prompt('Proxy Port'); if (!port) return;
      API.addProxy({ ip: ip, port: port }).then(function() { renderProxies(); });
    };
  }
}

/* ── Notifications ───────────────────────────────────────────────── */
async function renderNotifications() {
  var container = getEl('page-notifications');
  if (!container) return;
  container.innerHTML = `
    <div class="glass-card p-6">
      <h2 class="text-2xl font-bold mb-4">🔔 Notifications</h2>
      <p class="text-gray-400">No notifications yet. Slot alerts will appear here.</p>
    </div>
  `;
}

/* ── Settings ────────────────────────────────────────────────────── */
async function renderSettings() {
  var container = getEl('page-settings');
  if (!container) return;
  container.innerHTML = `
    <div class="glass-card p-6">
      <h2 class="text-2xl font-bold mb-4">⚙️ Settings</h2>
      <p class="text-gray-400">Settings panel — static demo mode active.</p>
    </div>
  `;
}

/* ── Live Monitor ────────────────────────────────────────────────── */
async function renderMonitor() {
  var container = getEl('page-monitor');
  if (!container) return;
  container.innerHTML = `
    <div class="glass-card p-6">
      <h2 class="text-2xl font-bold mb-4">📡 Live Monitor</h2>
      <p class="text-gray-400">Live monitoring view — demo mode.</p>
    </div>
  `;
}