// ========================================
// PWA INSTALL PROMPT (MANDATORY VERSION)
// ========================================

let deferredInstallPrompt = null;
let isForced = true; // Set to true to make it mandatory

// Detect platform and installation state
function detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    // Android detection
    const isAndroid = /android/i.test(userAgent);
    
    // Check if already installed (Standalone Mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
        || window.navigator.standalone 
        || document.referrer.includes('android-app://');
    
    const results = {
        isIOS,
        isAndroid,
        isStandalone,
        isMobile: isIOS || isAndroid
    };

    console.log('[PWA] Platform Detection:', results);
    return results;
}

// Show mandatory install prompt
function showInstallPrompt() {
    console.log('[PWA] showInstallPrompt called');
    const platform = detectPlatform();
    
    // IF ALREADY INSTALLED, DO NOTHING
    if (platform.isStandalone) {
        console.log('[PWA] Already in standalone mode. Hiding prompts.');
        hideEverything();
        return;
    }

    // Check if user has dismissed it recently (last 24 hours)
    const dismissedAt = localStorage.getItem('pwaPromptDismissedAt');
    if (dismissedAt) {
        const hoursSinceDismissed = (new Date() - new Date(parseInt(dismissedAt))) / (1000 * 60 * 60);
        if (hoursSinceDismissed < 24) {
            console.log('[PWA] Prompt was dismissed recently. Skipping.');
            return;
        }
    }
    
    const promptElement = document.getElementById('installPrompt');
    const overlayElement = document.getElementById('installOverlay');
    const installButton = document.getElementById('installButton');
    const messageElement = document.getElementById('installPromptMessage');
    
    console.log('[PWA] UI Elements found:', { 
        prompt: !!promptElement, 
        overlay: !!overlayElement, 
        button: !!installButton 
    });

    if (!promptElement || !overlayElement) {
        console.error('[PWA] Missing required UI elements');
        return;
    }

    // Apply mandatory styles
    promptElement.classList.add('mandatory');
    overlayElement.style.display = 'block';
    
    // Customize message based on platform
    if (platform.isIOS) {
        messageElement.innerHTML = '<strong>Action Required:</strong> To use BrgyONE, you must add it to your Home Screen.<br><br>Tap the Share icon <svg style="display:inline; width:16px; margin:0 2px;" viewBox="0 0 24 24" fill="currentColor"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/></svg> and select <strong>"Add to Home Screen"</strong>.';
        installButton.innerHTML = '<span>Show Instructions</span>';
        installButton.onclick = showIOSInstructions;
    } else if (platform.isAndroid) {
        messageElement.innerHTML = '<strong>Action Required:</strong> Please install the BrgyONE App for a better and faster experience.';
        installButton.innerHTML = '<span>Install App</span>';
        installButton.onclick = handleAndroidInstall;
    } else {
        // Desktop or other
        messageElement.innerHTML = '<strong>Action Required:</strong> Please install BrgyONE to proceed.';
        installButton.innerHTML = '<span>Install Now</span>';
        installButton.onclick = handleAndroidInstall;
    }
    
    promptElement.style.display = 'block';
}

function hideEverything() {
    const promptElement = document.getElementById('installPrompt');
    const overlayElement = document.getElementById('installOverlay');
    if (promptElement) promptElement.style.display = 'none';
    if (overlayElement) overlayElement.style.display = 'none';
}

function closeInstallPrompt() {
    hideEverything();
    // Remember dismissal time
    localStorage.setItem('pwaPromptDismissedAt', Date.now().toString());
    console.log('[PWA] Prompt dismissed by user');
}
window.closeInstallPrompt = closeInstallPrompt;

// Handle Android install
async function handleAndroidInstall() {
    if (!deferredInstallPrompt) {
        // If beforeinstallprompt didn't fire yet, show manual instructions
        showManualInstructions();
        return;
    }
    
    try {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log(`[PWA] User response to install: ${outcome}`);
        
        if (outcome === 'accepted') {
            console.log('[PWA] User accepted install');
            // We still don't hide yet, wait for 'appinstalled' event to be sure
        }
        deferredInstallPrompt = null;
    } catch (err) {
        console.error('[PWA] Install error:', err);
        showManualInstructions();
    }
}

// Show iOS instructions (Using standard Modal system)
function showIOSInstructions() {
    if (typeof createModal !== 'function') {
        alert('Please tap the Share icon (⬆️) then "Add to Home Screen"');
        return;
    }

    const modal = createModal('iOS Installation Guide', `
        <div style="text-align: center; padding: 10px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">📲</div>
            <p style="margin-bottom: 20px; font-weight: 500;">Follow these steps to install BrgyONE on your iPhone/iPad:</p>
            
            <div style="text-align: left; background: var(--bg-tertiary); padding: 15px; border-radius: 12px;">
                <div style="display: flex; gap: 12px; margin-bottom: 12px; align-items: center;">
                    <div style="background: var(--primary-color); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.8rem;">1</div>
                    <p style="margin: 0; font-size: 0.9rem;">Tap the <strong>Share</strong> button in Safari's bottom toolbar.</p>
                </div>
                <div style="display: flex; gap: 12px; margin-bottom: 12px; align-items: center;">
                    <div style="background: var(--primary-color); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.8rem;">2</div>
                    <p style="margin: 0; font-size: 0.9rem;">Scroll down and select <strong>"Add to Home Screen"</strong>.</p>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <div style="background: var(--primary-color); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.8rem;">3</div>
                    <p style="margin: 0; font-size: 0.9rem;">Tap <strong>"Add"</strong> in the top right corner.</p>
                </div>
            </div>
            
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 20px;">
                Once added, open the app from your home screen to login.
            </p>
        </div>
    `, [
        { text: 'Okay, I will do it', class: 'btn-primary', action: 'close' }
    ]);
    
    showModal(modal);
}

function showManualInstructions() {
    const platform = detectPlatform();
    let msg = platform.isAndroid 
        ? 'Tap the three dots (⋮) in Chrome and select "Install App" or "Add to Home screen".'
        : 'Please use the browser menu to "Install App".';

    alert(msg);
}

// Events
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    showInstallPrompt();
});

window.addEventListener('appinstalled', () => {
    console.log('[PWA] Success: App installed');
    hideEverything();
    showToast('App installed successfully! Welcome to the standalone version.', 'success');
});

// Check on load
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        console.log('[PWA] DOMContentLoaded - Scheduling prompt');
        setTimeout(showInstallPrompt, 1500);
    });
} else {
    console.log('[PWA] DOM already ready - Scheduling prompt');
    setTimeout(showInstallPrompt, 1500);
}

// Periodic check (in case they leave/return)
setInterval(() => {
    const platform = detectPlatform();
    if (platform.isStandalone) {
        hideEverything();
    }
}, 15000); // 15 seconds is enough

console.log('[PWA] Mandatory Install Module loaded');
