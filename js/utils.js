// ========================================
// ADDITIONAL UTILITY FUNCTIONS
// ========================================

// Convert Firebase Timestamp to JavaScript Date
function convertFirebaseTimestamp(timestamp) {
    if (!timestamp) {
        return new Date(); // Return current date if no timestamp
    }

    // If it's already a Date object
    if (timestamp instanceof Date) {
        return timestamp;
    }

    // If it's a Firebase Timestamp object
    if (timestamp && timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }

    // If it's an object with seconds property (Firestore timestamp format)
    if (timestamp && timestamp.seconds) {
        return new Date(timestamp.seconds * 1000);
    }

    // If it's a string or number, try to parse it
    try {
        return new Date(timestamp);
    } catch (e) {
        console.error('Error converting timestamp:', e);
        return new Date();
    }
}

// Format date for display
function formatDate(timestamp) {
    const date = convertFirebaseTimestamp(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date and time for display
function formatDateTime(timestamp) {
    const date = convertFirebaseTimestamp(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy', 'error');
    }
}

// Make functions globally available
window.convertFirebaseTimestamp = convertFirebaseTimestamp;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.copyToClipboard = copyToClipboard;


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

// ========================================
// CLOUDINARY UPLOAD
// ========================================

const CLOUDINARY_CLOUD_NAME = 'djghkklph';
const CLOUDINARY_API_KEY = '147819183757931';
// WARNING: Exposing secret on client is unsafe, but doing so per user request for this local app
const CLOUDINARY_API_SECRET = '9zwbXpSM1gYCxVWzkNRbC26LkvU';

async function uploadToCloudinary(file) {
    if (!file) return null;

    try {
        showToast('Uploading image...', 'info');

        const timestamp = Math.round((new Date()).getTime() / 1000);

        // Generate signature: SHA1(timestamp=xxxx + secret)
        const strToSign = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
        const signature = CryptoJS.SHA1(strToSign).toString();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', CLOUDINARY_API_KEY);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Upload failed');
        }

        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        showToast('Failed to upload image: ' + error.message, 'error');
        throw error;
    }
}

// Dynamic Greeting based on time of day

function getDigitalGreeting(name) {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour >= 0 && hour < 6) {
        greeting = 'Maayong Kadlawn'; // 12 AM - 5:59 AM
    } else if (hour >= 6 && hour < 12) {
        greeting = 'Maayong Buntag'; // 6 AM - 11:59 AM
    } else if (hour >= 12 && hour < 14) {
        greeting = 'Maayong Udto'; // 12 PM - 1:59 PM
    } else if (hour >= 14 && hour < 17) {
        greeting = 'Maayong Hapon'; // 2 PM - 4:59 PM
    } else {
        greeting = 'Maayong Gabie'; // 5 PM - 11:59 PM
    }

    return `${greeting}, ${name} !`;
}

window.getDigitalGreeting = getDigitalGreeting;
