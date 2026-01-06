// ========================================
// ADDITIONAL UTILITY FUNCTIONS
// ========================================

// Emergency SOS Function
function showEmergencyModal() {
    const modal = createModal('Emergency SOS', `
        <div style="text-align: center; margin-bottom: var(--spacing-lg);">
            <div style="width: 100px; height: 100px; margin: 0 auto var(--spacing-md); background: var(--danger-color); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            </div>
            <h3 style="color: var(--danger-color); margin-bottom: var(--spacing-sm);">Emergency Alert</h3>
            <p style="color: var(--text-secondary);">This will send an emergency alert to barangay officials.</p>
        </div>
        
        <div class="form-group">
            <label>Emergency Type</label>
            <select id="emergencyType">
                <option value="medical">Medical Emergency</option>
                <option value="fire">Fire</option>
                <option value="crime">Crime/Violence</option>
                <option value="disaster">Natural Disaster</option>
                <option value="other">Other Emergency</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Brief Description</label>
            <textarea id="emergencyDesc" placeholder="Describe the emergency situation"></textarea>
        </div>
    `, [
        { text: 'Cancel', class: 'btn-outline', action: 'close' },
        { text: 'Send SOS Alert', class: 'btn-danger', action: 'handleEmergencyAlert()' }
    ]);

    showModal(modal);
}

function handleEmergencyAlert() {
    const type = document.getElementById('emergencyType').value;
    const description = document.getElementById('emergencyDesc').value;

    showToast('Emergency alert sent! Help is on the way.', 'warning');
    closeModal();

    createNotification({
        userId: 'user-admin',
        title: '🚨 EMERGENCY ALERT',
        message: `${AppState.currentUser.fullName} reported ${type} emergency`,
        type: 'error'
    });
}

// Make functions globally available
window.showEmergencyModal = showEmergencyModal;
window.handleEmergencyAlert = handleEmergencyAlert;
