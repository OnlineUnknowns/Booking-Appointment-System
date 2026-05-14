// Dashboard render
async function renderDashboard() {
    const container = document.getElementById('page-dashboard');
    const platforms = await eel.get_supported_platforms()();
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
                    ${platforms.map(p => `<option>${p}</option>`).join('')}
                </select>
                <select id="dashCountry" class="bg-black/40 p-2 rounded-xl"></select>
                <button id="quickLaunch" class="bg-blue-600 px-6 py-2 rounded-xl hover:bg-blue-500 transition">Launch 5 Windows</button>
            </div>
        </div>
    `;
    // populate country on platform change
    const platSelect = document.getElementById('dashPlatform');
    const countrySelect = document.getElementById('dashCountry');
    async function updateCountries() {
        const countries = await eel.get_countries_for_platform(platSelect.value)();
        countrySelect.innerHTML = countries.map(c => `<option>${c}</option>`).join('');
    }
    platSelect.addEventListener('change', updateCountries);
    await updateCountries();
    document.getElementById('quickLaunch').onclick = async () => {
        await API.launchBrowsers(platSelect.value, countrySelect.value, 5, false);
        alert('Browsers launched!');
    };
    // update browser count periodically
    setInterval(async () => {
        const count = await eel.get_browser_count?.() || 0;
        document.getElementById('browserCount').innerText = count;
    }, 2000);
}

// Accounts manager render (simplified but full CRUD)
async function renderAccounts() {
    const container = document.getElementById('page-accounts');
    const accounts = await API.getAccounts();
    container.innerHTML = `
        <div class="glass-card p-6">
            <div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold">Account Manager</h2><button id="addAccountBtn" class="bg-green-600 px-4 py-2 rounded-xl">+ Add</button></div>
            <table class="w-full text-left">
                <thead><tr><th>Name</th><th>Email</th><th>Platform</th><th>Actions</th></tr></thead>
                <tbody id="accountsTableBody">${accounts.map(acc => `<tr><td>${acc.name}</td><td>${acc.email}</td><td>${acc.platform || '-'}</td><td><button onclick="deleteAccount(${acc.id})" class="text-red-400">Delete</button></td></tr>`).join('')}</tbody>
            </table>
        </div>
    `;
    document.getElementById('addAccountBtn').onclick = () => {
        const name = prompt("Name"); if(!name)return;
        const email = prompt("Email");
        API.addAccount({name, email, password:"", platform:"", country:""}).then(()=>renderAccounts());
    };
}
window.deleteAccount = async (id) => {
    await eel.delete_account(id)();
    renderAccounts();
};

// Browser Launcher page
async function renderBrowser() {
    const container = document.getElementById('page-browser');
    const platforms = await eel.get_supported_platforms()();
    container.innerHTML = `
        <div class="glass-card p-6 max-w-2xl">
            <h2 class="text-2xl font-bold mb-6">🚀 Launch 5 Chrome Windows</h2>
            <label class="block mb-2">Platform</label>
            <select id="launchPlatform" class="w-full p-3 bg-white/10 rounded-xl mb-4">${platforms.map(p=>`<option>${p}</option>`)}</select>
            <label class="block mb-2">Country</label>
            <select id="launchCountry" class="w-full p-3 bg-white/10 rounded-xl mb-4"></select>
            <label class="flex items-center mb-4"><input type="checkbox" id="useProxies" class="mr-2"> Use proxies (if available)</label>
            <button id="doLaunch" class="w-full bg-blue-600 py-3 rounded-xl font-bold">Launch 5 Instances</button>
            <button id="closeAll" class="w-full mt-2 bg-red-600/50 py-2 rounded-xl">Close All Browsers</button>
        </div>
    `;
    const platSelect = document.getElementById('launchPlatform');
    const countrySelect = document.getElementById('launchCountry');
    async function updateCountries() {
        const countries = await eel.get_countries_for_platform(platSelect.value)();
        countrySelect.innerHTML = countries.map(c=>`<option>${c}</option>`).join('');
    }
    platSelect.addEventListener('change', updateCountries);
    await updateCountries();
    document.getElementById('doLaunch').onclick = async () => {
        const useProxies = document.getElementById('useProxies').checked;
        await API.launchBrowsers(platSelect.value, countrySelect.value, 5, useProxies);
    };
    document.getElementById('closeAll').onclick = async () => {
        await eel.close_all_browsers()();
        alert("Closed all browsers");
    };
}

// Slot Monitor page
async function renderSlotMonitor() {
    const container = document.getElementById('page-slot_monitor');
    const platforms = await eel.get_supported_platforms()();
    container.innerHTML = `
        <div class="glass-card p-6">
            <h2 class="text-2xl font-bold mb-4">⏱ Real-Time Slot Monitor</h2>
            <div class="flex gap-4 mb-6">
                <select id="monitorPlatform" class="bg-black/40 p-2 rounded-xl">${platforms.map(p=>`<option>${p}</option>`)}</select>
                <select id="monitorCountry" class="bg-black/40 p-2 rounded-xl"></select>
                <button id="startMonitor" class="bg-green-600 px-4 py-2 rounded-xl">Start Monitoring (30s)</button>
                <button id="stopMonitor" class="bg-red-600 px-4 py-2 rounded-xl">Stop</button>
            </div>
            <div id="slotStatus" class="text-center p-6 text-xl">Not monitoring</div>
        </div>
    `;
    const platSel = document.getElementById('monitorPlatform');
    const countrySel = document.getElementById('monitorCountry');
    async function updateCountries() {
        const countries = await eel.get_countries_for_platform(platSel.value)();
        countrySel.innerHTML = countries.map(c=>`<option>${c}</option>`).join('');
    }
    platSel.addEventListener('change', updateCountries);
    await updateCountries();
    document.getElementById('startMonitor').onclick = async () => {
        await API.startSlotMonitor(platSel.value, countrySel.value);
        document.getElementById('slotStatus').innerHTML = "🟢 Monitoring active...";
    };
    document.getElementById('stopMonitor').onclick = async () => {
        await API.stopSlotMonitor();
        document.getElementById('slotStatus').innerHTML = "🔴 Monitoring stopped";
    };
    window.update_slot_status = (available, platform, country) => {
        const statusDiv = document.getElementById('slotStatus');
        if(available) statusDiv.innerHTML = `✅ SLOT AVAILABLE for ${platform}/${country} !!!`;
        else statusDiv.innerHTML = `⏳ No slots yet for ${platform}/${country}`;
    };
}

// Logs Console
async function renderLogs() {
    const container = document.getElementById('page-logs');
    container.innerHTML = `<div class="glass-card p-6"><h2 class="text-2xl font-bold mb-4">📋 Live Logs</h2><pre id="logContent" class="bg-black/50 p-4 rounded-xl overflow-auto h-96 text-sm font-mono"></pre><button id="refreshLogs" class="mt-4 bg-blue-600 px-4 py-2 rounded-xl">Refresh</button></div>`;
    async function refresh() {
        const logs = await API.getLogs();
        document.getElementById('logContent').innerText = logs.join('');
    }
    document.getElementById('refreshLogs').onclick = refresh;
    refresh();
    setInterval(refresh, 5000);
}
// Proxies, Notifications, Settings similar – omitted for brevity but follow same pattern