// ========================================
// VERSION CONFIGURATION
// ========================================
// Update this version number whenever you make changes to force cache refresh
// Format: YYYY.MM.DD.BUILD (e.g., 2026.01.24.001)

const APP_VERSION = '2026.03.08.011';

// Export for use in service worker and app
if (typeof window !== 'undefined') {
    window.APP_VERSION = APP_VERSION;
    console.log(`%c🚀 BrgyONE v${APP_VERSION}`, 'color: #2563eb; font-weight: bold; font-size: 14px;');
}

if (typeof self !== 'undefined' && typeof ServiceWorkerGlobalScope !== 'undefined' && self instanceof ServiceWorkerGlobalScope) {
    self.APP_VERSION = APP_VERSION;
}
