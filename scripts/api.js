// api.js — static GitHub Pages demo (no Python backend, no Eel)
// MUST be loaded BEFORE main.js in index.html:
//   <script src="scripts/api.js"></script>
//   <script src="scripts/main.js"></script>

/* ── Demo API object ─────────────────────────────────────────────── */
var API = {
  launchBrowsers: async function(platform, country, windows, useProxies) {
    alert('Demo: Launching ' + (windows || 5) + ' browser windows for ' + platform + ' - ' + country);
    return true;
  },

  getAccounts: async function() {
    return [
      { id: 1, name: 'Ahmed Hassan', email: 'ahmed@example.com', platform: 'BLS' },
      { id: 2, name: 'Demo User',    email: 'demo@example.com',  platform: 'TLScontact' }
    ];
  },

  addAccount: async function(account) {
    alert('Demo account added successfully.');
    return true;
  },

  getProxies: async function() {
    return [
      { ip: '192.168.1.100', port: '8080' },
      { ip: '10.0.0.25',     port: '3128' }
    ];
  },

  addProxy: async function(proxy) {
    alert('Demo proxy added successfully.');
    return true;
  },

  getLogs: async function() {
    return [
      'System initialized...\n',
      'License activated successfully.\n',
      'Dashboard loaded.\n',
      'Monitoring service started.\n'
    ];
  },

  startSlotMonitor: async function(platform, country) {
    alert('Demo monitoring started for ' + platform + ' - ' + country);
    return true;
  },

  stopSlotMonitor: async function() {
    alert('Demo monitoring stopped.');
    return true;
  }
};

/* ── Mock Eel object ─────────────────────────────────────────────── */
// Provides window.eel so main.js never throws "eel is not defined".
// Every function returns a curried async function matching Eel's
// double-call pattern: eel.fn(args)() → Promise
window.eel = {
  get_supported_platforms: function() {
    return async function() { return ['BLS', 'TLScontact', 'VFS Global']; };
  },

  get_countries_for_platform: function() {
    return async function() { return ['Germany', 'France', 'Italy', 'Spain']; };
  },

  delete_account: function() {
    return async function() { return true; };
  },

  close_all_browsers: function() {
    return async function() {
      alert('Demo: All browsers closed.');
      return true;
    };
  },

  get_browser_count: async function() {
    return 0;
  }
};