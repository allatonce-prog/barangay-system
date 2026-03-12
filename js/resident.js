// ========================================
// RESIDENT MODULE - Document Requests
// ========================================

// Document types available for request
const DOCUMENT_TYPES = [
    'Barangay Clearance',
    'Certificate of Residency',
    'Certificate of Indigency',
    'Cedula',
    'Complaint Certificate',
    'Other'
];

// Make globally available
window.DOCUMENT_TYPES = DOCUMENT_TYPES;

// ========================================
// NEW REQUEST MODAL
// ========================================

function showNewRequestModal() {
    const user = AppState.currentUser || {};
    const modal = createModal('New Document Request', `
        <form id="newRequestForm" onsubmit="handleNewRequest(event)">
            <div style="display: flex; gap: 15px;">
                <div class="form-group" style="flex: 1;">
                    <label for="reqFirstName">First Name *</label>
                    <input type="text" id="reqFirstName" value="${user.firstName || ''}" required placeholder="First Name">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label for="reqLastName">Last Name *</label>
                    <input type="text" id="reqLastName" value="${user.lastName || ''}" required placeholder="Last Name">
                </div>
            </div>
            
            <div class="form-group">
                <label for="reqAddress">Address *</label>
                <input type="text" id="reqAddress" value="${user.address || ''}" required placeholder="Your full address">
            </div>
            
            <div class="form-group">
                <label for="reqPhone">Phone Number *</label>
                <input type="tel" id="reqPhone" value="${user.phone || ''}" required placeholder="09xxxxxxxxx">
            </div>

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
                <label for="validId">Valid ID Image * (Required)</label>
                <div class="file-upload">
                    <input type="file" id="validId" accept="image/*" required onchange="handleFileSelect(event)">
                    <div class="file-upload-label" id="fileList">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>Click to upload Valid ID</span>
                    </div>
                </div>
            </div>
            
            <div style="background: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-md);">
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">
                    You will receive a notification about your request status
                </p>
            </div>
            
            <div class="modal-footer" style="border: none; padding: var(--spacing-lg) 0 0 0;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="submitReqBtn">Submit Request</button>
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

async function handleNewRequest(event) {
    event.preventDefault();

    const firstName = document.getElementById('reqFirstName').value.trim();
    const lastName = document.getElementById('reqLastName').value.trim();
    const address = document.getElementById('reqAddress').value.trim();
    const phone = document.getElementById('reqPhone').value.trim();
    const documentType = document.getElementById('documentType').value;
    const purpose = document.getElementById('purpose').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value);
    const additionalInfo = document.getElementById('additionalInfo').value.trim();
    const idFile = document.getElementById('validId').files[0];

    // Validate
    if (!firstName || !lastName || !address || !phone || !documentType || !purpose) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (!idFile) {
        showToast('Valid ID image is required', 'error');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitReqBtn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Uploading ID...';
    submitBtn.disabled = true;

    try {
        // Upload ID to Cloudinary
        const idImageUrl = await uploadToCloudinary(idFile);

        submitBtn.textContent = 'Submitting...';

        // Generate tracking number
        const trackingNumber = await generateTrackingNumber();

        // Create request object
        const request = {
            trackingNumber: trackingNumber,
            userId: AppState.currentUser.id,
            userName: `${firstName} ${lastName}`,
            firstName,
            lastName,
            address,
            phone,
            documentType,
            purpose,
            quantity,
            additionalInfo,
            validIdImageUrl: idImageUrl,
            timeline: [
                {
                    status: 'pending',
                    message: 'Request submitted with Valid ID',
                    timestamp: new Date().toISOString()
                }
            ]
        };

        // Save to local database
        const result = await DB.createRequest(request);

        if (result.success) {
            request.id = result.id;



            // Show success message
            showToast('Request submitted successfully!', 'success');

            // Reset form before closing modal
            const form = document.getElementById('newRequestForm');
            if (form) {
                form.reset();
                selectedFiles = [];
            }

            // Close modal
            closeModal();

            // Navigate to requests page to see the new request
            navigateToPage('requests');
        } else {
            showToast(result.error || 'Failed to submit request', 'error');
        }
    } catch (error) {
        console.error('Submit request error:', error);
        showToast('Failed to submit request', 'error');
    }
}

// ========================================
// TRACKING NUMBER GENERATOR
// ========================================

async function generateTrackingNumber() {
    const year = new Date().getFullYear();
    const result = await DB.getAllData('REQUESTS');
    const requests = result.success ? result.data : [];
    const count = requests.length + 1;
    return `REQ-${year}-${String(count).padStart(4, '0')}`;
}

// ========================================
// VIEW REQUEST DETAILS
// ========================================

async function viewRequestDetails(requestId) {
    try {
        // Get request from database
        const result = await DB.getData('REQUESTS', requestId);

        if (!result.success) {
            showToast('Request not found', 'error');
            return;
        }

        const request = result.data;

        const modal = createModal('Request Details', `
            <div style="margin-bottom: var(--spacing-lg);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-md);">
                    <div>
                        <h4 style="margin: 0; color: var(--text-primary); margin-bottom: var(--spacing-xs);">${request.documentType}</h4>
                        <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
                            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">Tracking #:</p>
                            <code style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: var(--radius-sm); font-size: var(--font-size-sm); color: var(--primary-color); cursor: pointer;" 
                                  onclick="copyToClipboard('${request.trackingNumber}')" 
                                  title="Click to copy">
                                ${request.trackingNumber}
                            </code>
                            <button onclick="copyToClipboard('${request.trackingNumber}')" class="btn-icon" style="padding: 4px; width: 24px; height: 24px; min-width: 24px;" title="Copy to clipboard">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <span class="badge badge-${request.status}">${request.status}</span>
                </div>
            </div>
            
            <div style="background: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg);">
                <div style="margin-bottom: var(--spacing-sm);">
                    <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Requester Name:</strong>
                    <p style="margin: var(--spacing-xs) 0 0 0;">${request.userName || (request.firstName + ' ' + request.lastName)}</p>
                </div>

                <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-sm);">
                    <div style="flex: 1;">
                        <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Phone:</strong>
                        <p style="margin: var(--spacing-xs) 0 0 0;">${request.phone || 'N/A'}</p>
                    </div>
                </div>

                <div style="margin-bottom: var(--spacing-sm);">
                    <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Address:</strong>
                    <p style="margin: var(--spacing-xs) 0 0 0;">${request.address || 'N/A'}</p>
                </div>
                
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
                    <p style="margin: var(--spacing-xs) 0 0 0;">${formatDateTime(request.createdAt)}</p>
                </div>
                
                ${request.validIdImageUrl ? `
                    <div style="margin-top: var(--spacing-md);">
                        <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Valid ID Attached:</strong>
                        <div style="margin-top: var(--spacing-xs); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; background: var(--bg-tertiary);">
                            <img src="${request.validIdImageUrl}" alt="Valid ID" style="width: 100%; max-height: 200px; object-fit: contain;">
                        </div>
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
    } catch (error) {
        console.error('Error viewing request details:', error);
        showToast('Failed to load request details', 'error');
    }
}

// ========================================
// TRACK REQUEST HANDLER
// ========================================

async function handleTrackRequest(event) {
    event.preventDefault();

    const trackingNumber = document.getElementById('trackingNumber').value.trim().toUpperCase();

    if (!trackingNumber) {
        showToast('Please enter a tracking number', 'error');
        return;
    }

    // Show loading state
    const resultContainer = document.getElementById('trackingResult');
    resultContainer.innerHTML = `
        <div style="text-align: center; padding: var(--spacing-xl);">
            <div class="spinner" style="margin: 0 auto;"></div>
            <p style="margin-top: var(--spacing-md); color: var(--text-secondary);">Searching...</p>
        </div>
    `;

    // Query database
    const result = await DB.getAllData('REQUESTS');
    const requests = result.success ? result.data : [];
    const request = requests.find(r => r.trackingNumber === trackingNumber);

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
                    <strong>Date:</strong> ${formatDateTime(request.createdAt)}
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
