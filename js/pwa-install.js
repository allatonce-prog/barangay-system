// ========================================
// PWA INSTALL PROMPT
// ========================================

let deferredInstallPrompt = null;
let installPromptShown = false;

// Detect platform
function detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    // Android detection
    const isAndroid = /android/i.test(userAgent);
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
        || window.navigator.standalone 
        || document.referrer.includes('android-app://');
    
    return {
        isIOS,
        isAndroid,
        isStandalone,
        isMobile: isIOS || isAndroid
    };
}

// Show install prompt
function showInstallPrompt() {
    const platform = detectPlatform();
    
    // Don't show if already installed or already shown
    if (platform.isStandalone || installPromptShown) {
        return;
    }
    
    // Check if user has dismissed it before
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        
        // Show again after 7 days
        if (daysSinceDismissed < 7) {
            return;
        }
    }
    
    const promptElement = document.getElementById('installPrompt');
    const installButton = document.getElementById('installButton');
    const messageElement = document.getElementById('installPromptMessage');
    
    if (!promptElement) return;
    
    // Customize message based on platform
    if (platform.isIOS) {
        messageElement.textContent = 'Tap Share (⬆️) then "Add to Home Screen"';
        installButton.textContent = 'Show Me How';
        installButton.onclick = showIOSInstructions;
    } else if (platform.isAndroid && deferredInstallPrompt) {
        messageElement.textContent = 'Add this app to your home screen for quick access';
        installButton.textContent = 'Install App';
        installButton.onclick = handleAndroidInstall;
    } else if (platform.isMobile) {
        messageElement.textContent = 'Add this app to your home screen for quick access';
        installButton.textContent = 'Learn More';
        installButton.onclick = showGeneralInstructions;
    } else {
        // Desktop - don't show or show different message
        return;
    }
    
    // Show the prompt after a short delay
    setTimeout(() => {
        promptElement.style.display = 'block';
        installPromptShown = true;
    }, 2000); // Show after 2 seconds
}

// Handle Android install
async function handleAndroidInstall() {
    if (!deferredInstallPrompt) {
        showToast('Installation not available', 'info');
        return;
    }
    
    // Show the install prompt
    deferredInstallPrompt.prompt();
    
    // Wait for the user to respond
    const { outcome } = await deferredInstallPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        showToast('App is being installed...', 'success');
    } else {
        console.log('User dismissed the install prompt');
    }
    
    // Clear the deferred prompt
    deferredInstallPrompt = null;
    
    // Hide the prompt
    closeInstallPrompt();
}

// Show iOS instructions
function showIOSInstructions() {
    const modal = createModal('Install on iOS', `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: var(--spacing-lg);">📱</div>
            <h3 style="margin-bottom: var(--spacing-lg);">How to Install</h3>
        </div>
        
        <div style="background: var(--bg-secondary); padding: var(--spacing-lg); border-radius: var(--radius-lg); margin-bottom: var(--spacing-md);">
            <div style="display: flex; align-items: start; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 700;">1</div>
                <div>
                    <strong>Tap the Share button</strong>
                    <p style="margin: var(--spacing-xs) 0 0 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
                        Look for the share icon (⬆️) at the bottom of Safari
                    </p>
                </div>
            </div>
            
            <div style="display: flex; align-items: start; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 700;">2</div>
                <div>
                    <strong>Select "Add to Home Screen"</strong>
                    <p style="margin: var(--spacing-xs) 0 0 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
                        Scroll down in the share menu and tap this option
                    </p>
                </div>
            </div>
            
            <div style="display: flex; align-items: start; gap: var(--spacing-md);">
                <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 700;">3</div>
                <div>
                    <strong>Tap "Add"</strong>
                    <p style="margin: var(--spacing-xs) 0 0 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
                        Confirm to add the app to your home screen
                    </p>
                </div>
            </div>
        </div>
        
        <div style="background: rgba(37, 99, 235, 0.1); padding: var(--spacing-md); border-radius: var(--radius-md);">
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">
                <strong>Note:</strong> This feature only works in Safari browser on iOS devices.
            </p>
        </div>
    `, [
        { text: 'Got it!', class: 'btn-primary', action: 'close' }
    ]);
    
    showModal(modal);
    closeInstallPrompt();
}

// Show general instructions
function showGeneralInstructions() {
    const modal = createModal('Install App', `
        <div style="text-align: center; margin-bottom: var(--spacing-lg);">
            <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">📲</div>
            <p style="color: var(--text-secondary);">
                Add this app to your home screen for a better experience
            </p>
        </div>
        
        <div style="background: var(--bg-secondary); padding: var(--spacing-lg); border-radius: var(--radius-lg);">
            <h4 style="margin: 0 0 var(--spacing-md) 0;">Benefits:</h4>
            <ul style="margin: 0; padding-left: var(--spacing-lg); color: var(--text-secondary);">
                <li>Quick access from home screen</li>
                <li>Works offline</li>
                <li>Full-screen experience</li>
                <li>Faster loading</li>
            </ul>
        </div>
    `, [
        { text: 'Close', class: 'btn-outline', action: 'close' }
    ]);
    
    showModal(modal);
    closeInstallPrompt();
}

// Close install prompt
function closeInstallPrompt() {
    const promptElement = document.getElementById('installPrompt');
    if (promptElement) {
        promptElement.style.display = 'none';
    }
    
    // Remember that user dismissed it
    localStorage.setItem('installPromptDismissed', Date.now().toString());
}

// Listen for beforeinstallprompt event (Android/Desktop)
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] beforeinstallprompt event fired');
    
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    
    // Save the event for later use
    deferredInstallPrompt = e;
    
    // Show custom install prompt
    showInstallPrompt();
});

// Listen for app installed event
window.addEventListener('appinstalled', () => {
    console.log('[PWA] App was installed');
    showToast('App installed successfully! 🎉', 'success');
    
    // Clear the deferred prompt
    deferredInstallPrompt = null;
    
    // Hide the install prompt
    closeInstallPrompt();
});

// Check if app is already installed
window.addEventListener('DOMContentLoaded', () => {
    const platform = detectPlatform();
    
    // If not standalone and not dismissed recently, show prompt
    if (!platform.isStandalone) {
        // Show prompt after app loads
        setTimeout(() => {
            showInstallPrompt();
        }, 3000); // Wait 3 seconds after page load
    }
});

// Handle login page install button
document.addEventListener('DOMContentLoaded', () => {
    const loginInstallBtn = document.getElementById('loginInstallBtn');
    
    if (loginInstallBtn) {
        loginInstallBtn.addEventListener('click', () => {
            console.log('[PWA Install] Login install button clicked');
            const platform = detectPlatform();
            
            if (platform.isIOS) {
                showIOSInstructions();
            } else if (deferredPrompt) {
                // Show native install prompt for Android
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('[PWA Install] User accepted the install prompt');
                    } else {
                        console.log('[PWA Install] User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                });
            } else {
                // Fallback - show instructions
                showIOSInstructions();
            }
        });
    }
});

// Make functions globally available
window.showInstallPrompt = showInstallPrompt;
window.closeInstallPrompt = closeInstallPrompt;

console.log('[PWA Install] Module loaded');
