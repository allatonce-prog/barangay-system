// ========================================
// RESIDENT MODULE - Document Requests
// ========================================

// Document types available for request
const DOCUMENT_TYPES = [
    'Barangay Clearance',
    'Certificate of Residency',
    'Certificate of Indigency',
    'Business Permit',
    'Barangay ID',
    'Certificate of Good Moral',
    'Complaint Certificate',
    'Other'
];

// Make globally available
window.DOCUMENT_TYPES = DOCUMENT_TYPES;

// ========================================
// NEW REQUEST MODAL
// ========================================

function showNewRequestModal() {
    const modal = createModal('New Document Request', `
        <form id="newRequestForm" onsubmit="handleNewRequest(event)">
            <div class="form-group">
                <label for="documentType">Document Type *</label>
                <select id="documentType" required>
                    <option value="">Select document type</option>
                    ${DOCUMENT_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="purpose">Purpose *</label>
                <textarea id="purpose" placeholder="Enter the purpose of your request" required></textarea>
            </div>
            
            <div class="form-group">
                <label for="quantity">Quantity</label>
                <input type="number" id="quantity" value="1" min="1" max="10" required>
            </div>
            
            <div class="form-group">
                <label for="additionalInfo">Additional Information</label>
                <textarea id="additionalInfo" placeholder="Any additional details or special requests"></textarea>
            </div>
            
            <div class="form-group">
                <label>Upload Requirements (Optional)</label>
                <div class="file-upload">
                    <input type="file" id="fileUpload" multiple accept="image/*,.pdf" onchange="handleFileSelect(event)">
                    <div class="file-upload-label">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>Click to upload files</span>
                    </div>
                </div>
                <div id="fileList" style="margin-top: var(--spacing-sm);"></div>
            </div>
            
            <div style="background: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-md);">
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">
                    <strong>Note:</strong> Processing time is typically 3-5 business days. You will receive notifications about your request status.
                </p>
            </div>
            
            <div class="modal-footer" style="border: none; padding: var(--spacing-lg) 0 0 0;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Submit Request</button>
            </div>
        </form>
    `, []);

    showModal(modal);
}

// ========================================
// FILE UPLOAD HANDLER
// ========================================

let selectedFiles = [];

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    selectedFiles = files;

    const fileList = document.getElementById('fileList');

    if (files.length === 0) {
        fileList.innerHTML = '';
        return;
    }

    fileList.innerHTML = `
        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
            <strong>Selected files:</strong>
            <ul style="margin: var(--spacing-xs) 0; padding-left: var(--spacing-lg);">
                ${files.map(file => `<li>${file.name} (${formatFileSize(file.size)})</li>`).join('')}
            </ul>
        </div>
    `;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// SUBMIT NEW REQUEST
// ========================================

function handleNewRequest(event) {
    event.preventDefault();

    const documentType = document.getElementById('documentType').value;
    const purpose = document.getElementById('purpose').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value);
    const additionalInfo = document.getElementById('additionalInfo').value.trim();

    // Validate
    if (!documentType || !purpose) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Create request object
    const request = {
        id: `req-${Date.now()}`,
        trackingNumber: generateTrackingNumber(),
        userId: AppState.currentUser.id,
        userName: AppState.currentUser.fullName,
        documentType,
        purpose,
        quantity,
        additionalInfo,
        status: 'pending',
        files: selectedFiles.map(f => f.name), // In production, upload files to server
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
            {
                status: 'pending',
                message: 'Request submitted',
                timestamp: new Date().toISOString()
            }
        ]
    };

    // Save to localStorage
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    requests.push(request);
    localStorage.setItem('requests', JSON.stringify(requests));

    // Create notification for admin
    createNotification({
        userId: 'user-admin',
        title: 'New Document Request',
        message: `${AppState.currentUser.fullName} requested ${documentType}`,
        type: 'info',
        requestId: request.id
    });

    // Create notification for user
    createNotification({
        userId: AppState.currentUser.id,
        title: 'Request Submitted',
        message: `Your request for ${documentType} has been submitted. Tracking #: ${request.trackingNumber}`,
        type: 'success',
        requestId: request.id
    });

    // Show success message
    showToast(`Request submitted successfully! Tracking #: ${request.trackingNumber}`, 'success');

    // Close modal
    closeModal();

    // Reset selected files
    selectedFiles = [];

    // Refresh current page
    navigateToPage(AppState.currentPage);

    // Update notification badge
    updateNotificationBadge();
}

// ========================================
// TRACKING NUMBER GENERATOR
// ========================================

function generateTrackingNumber() {
    const year = new Date().getFullYear();
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const count = requests.length + 1;
    return `REQ-${year}-${String(count).padStart(4, '0')}`;
}

// ========================================
// VIEW REQUEST DETAILS
// ========================================

function viewRequestDetails(requestId) {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const request = requests.find(r => r.id === requestId);

    if (!request) {
        showToast('Request not found', 'error');
        return;
    }

    const modal = createModal('Request Details', `
        <div style="margin-bottom: var(--spacing-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
                <div>
                    <h4 style="margin: 0; color: var(--text-primary);">${request.documentType}</h4>
                    <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">
                        Tracking #: ${request.trackingNumber}
                    </p>
                </div>
                <span class="badge badge-${request.status}">${request.status}</span>
            </div>
        </div>
        
        <div style="background: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg);">
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Purpose:</strong>
                <p style="margin: var(--spacing-xs) 0 0 0;">${request.purpose}</p>
            </div>
            
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Quantity:</strong>
                <p style="margin: var(--spacing-xs) 0 0 0;">${request.quantity}</p>
            </div>
            
            ${request.additionalInfo ? `
                <div style="margin-bottom: var(--spacing-sm);">
                    <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Additional Info:</strong>
                    <p style="margin: var(--spacing-xs) 0 0 0;">${request.additionalInfo}</p>
                </div>
            ` : ''}
            
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Submitted:</strong>
                <p style="margin: var(--spacing-xs) 0 0 0;">${new Date(request.createdAt).toLocaleString()}</p>
            </div>
            
            ${request.files && request.files.length > 0 ? `
                <div>
                    <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Attached Files:</strong>
                    <ul style="margin: var(--spacing-xs) 0 0 0; padding-left: var(--spacing-lg);">
                        ${request.files.map(file => `<li>${file}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
        
        <div>
            <h4 style="margin-bottom: var(--spacing-md);">Timeline</h4>
            <div class="timeline">
                ${request.timeline.map((item, index) => `
                    <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                        <div style="width: 40px; height: 40px; border-radius: var(--radius-full); background: ${index === 0 ? 'var(--primary-color)' : 'var(--bg-tertiary)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${index === 0 ? 'white' : 'var(--text-secondary)'}" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <div style="flex: 1;">
                            <p style="margin: 0; font-weight: 600; text-transform: capitalize;">${item.status}</p>
                            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${item.message}</p>
                            <p style="margin: 0; font-size: var(--font-size-xs); color: var(--text-light);">${new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `, [
        { text: 'Close', class: 'btn-outline', action: 'close' }
    ]);

    showModal(modal);
}

// ========================================
// TRACK REQUEST HANDLER
// ========================================

function handleTrackRequest(event) {
    event.preventDefault();

    const trackingNumber = document.getElementById('trackingNumber').value.trim().toUpperCase();

    if (!trackingNumber) {
        showToast('Please enter a tracking number', 'error');
        return;
    }

    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const request = requests.find(r => r.trackingNumber === trackingNumber);

    const resultContainer = document.getElementById('trackingResult');

    if (!request) {
        resultContainer.innerHTML = `
            <div class="card" style="margin-top: var(--spacing-lg); text-align: center; padding: var(--spacing-xl);">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" style="margin: 0 auto var(--spacing-md);">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3 style="color: var(--text-primary); margin-bottom: var(--spacing-sm);">Request Not Found</h3>
                <p style="color: var(--text-secondary);">No request found with tracking number: ${trackingNumber}</p>
            </div>
        `;
        return;
    }

    resultContainer.innerHTML = `
        <div class="card" style="margin-top: var(--spacing-lg);">
            <div class="card-header">
                <h3 class="card-title">Request Found</h3>
                <span class="badge badge-${request.status}">${request.status}</span>
            </div>
            <div class="card-body">
                <div style="margin-bottom: var(--spacing-md);">
                    <strong>Document Type:</strong> ${request.documentType}
                </div>
                <div style="margin-bottom: var(--spacing-md);">
                    <strong>Submitted by:</strong> ${request.userName}
                </div>
                <div style="margin-bottom: var(--spacing-md);">
                    <strong>Date:</strong> ${new Date(request.createdAt).toLocaleString()}
                </div>
                <button class="btn btn-primary" onclick="viewRequestDetails('${request.id}')">View Full Details</button>
            </div>
        </div>
    `;
}

// Make functions globally available
window.showNewRequestModal = showNewRequestModal;
window.handleFileSelect = handleFileSelect;
window.handleNewRequest = handleNewRequest;
window.viewRequestDetails = viewRequestDetails;
window.handleTrackRequest = handleTrackRequest;
