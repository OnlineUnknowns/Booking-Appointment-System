// Demo API for GitHub Pages (No Python backend required)

const API = {
    async launchBrowsers(platform, country, windows = 5, useProxies = false) {
        alert(`Demo: Launching ${windows} browser windows for ${platform} - ${country}`);
        return true;
    },

    async getAccounts() {
        return [
            {
                id: 1,
                name: "Ahmed Hassan",
                email: "ahmed@example.com",
                platform: "BLS"
            },
            {
                id: 2,
                name: "Demo User",
                email: "demo@example.com",
                platform: "TLScontact"
            }
        ];
    },

    async addAccount(account) {
        alert("Demo account added successfully.");
        return true;
    },

    async getProxies() {
        return [
            {
                ip: "192.168.1.100",
                port: "8080"
            },
            {
                ip: "10.0.0.25",
                port: "3128"
            }
        ];
    },

    async addProxy(proxy) {
        alert("Demo proxy added successfully.");
        return true;
    },

    async getLogs() {
        return [
            "System initialized...\n",
            "License activated successfully.\n",
            "Dashboard loaded.\n",
            "Monitoring service started.\n"
        ];
    },

    async startSlotMonitor(platform, country) {
        alert(`Demo monitoring started for ${platform} - ${country}`);
        return true;
    },

    async stopSlotMonitor() {
        alert("Demo monitoring stopped.");
        return true;
    }
};

// Mock Eel object so main.js continues to work on GitHub Pages
window.eel = {
    get_supported_platforms: () => async () => [
        "BLS",
        "TLScontact",
        "VFS Global"
    ],

    get_countries_for_platform: () => async () => [
        "Germany",
        "France",
        "Italy",
        "Spain"
    ],

    delete_account: () => async () => true,
    close_all_browsers: () => async () => true,
    get_browser_count: async () => 5
};