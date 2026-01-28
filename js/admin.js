// ADMIN MODULE - Request Management
// ========================================

console.log('Admin module loaded');

// ========================================

// Use global DOCUMENT_TYPES from resident.js or define if missing
if (typeof DOCUMENT_TYPES === 'undefined') {
    window.DOCUMENT_TYPES = [
        'Barangay Clearance',
        'Certificate of Residency',
        'Certificate of Indigency',
        'Business Permit',
        'Certificate of Good Moral Character'
    ];
}

// ========================================
// ADMIN DASHBOARD
// ========================================

async function loadAdminDashboard(container) {
    try {
        // Get data from database
        const requestsResult = await DB.getAllData('REQUESTS');
        const allRequests = requestsResult.success ? requestsResult.data : [];

        const usersResult = await DB.getAllData('RESIDENTS');
        const residents = usersResult.success ? usersResult.data : [];

        // Calculate statistics
        const totalRequests = allRequests.length;
        const pendingRequests = allRequests.filter(r => r.status === 'pending').length;
        const processingRequests = allRequests.filter(r => r.status === 'processing').length;
        const completedRequests = allRequests.filter(r => r.status === 'completed').length;
        const rejectedRequests = allRequests.filter(r => r.status === 'rejected').length;
        const totalResidents = residents.length;

        // Get recent requests
        // Sort by createdAt descending
        allRequests.sort((a, b) => {
            const dateA = convertFirebaseTimestamp(a.createdAt).getTime();
            const dateB = convertFirebaseTimestamp(b.createdAt).getTime();
            return dateB - dateA;
        });
        const recentRequests = allRequests.slice(0, 5);

        container.innerHTML = `
            <div class="page-header">
                <h2>${getDigitalGreeting(AppState.currentUser?.fullName || 'Admin')}</h2>
                <p>Manage document requests and view statistics</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-value">${totalRequests}</div>
                    <div class="stat-label">Total Requests</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon warning">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-value">${pendingRequests}</div>
                    <div class="stat-label">Pending</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-value">${processingRequests}</div>
                    <div class="stat-label">Processing</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon success">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-value">${completedRequests}</div>
                    <div class="stat-label">Completed</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon danger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-value">${rejectedRequests}</div>
                    <div class="stat-label">Rejected</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-value">${totalResidents}</div>
                    <div class="stat-label">Residents</div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Recent Requests</h3>
                </div>
                <div class="card-body">
                    ${recentRequests.length === 0 ?
                '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No requests yet</p>' :
                `<div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tracking #</th>
                                        <th>Resident</th>
                                        <th>Document</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentRequests.map(req => `
                                        <tr>
                                            <td><strong>${req.trackingNumber}</strong></td>
                                            <td>${req.userName}</td>
                                            <td>${req.documentType}</td>
                                            <td>${req.createdAt ? formatDateTime(req.createdAt) : 'N/A'}</td>
                                            <td><span class="badge badge-${req.status}">${req.status}</span></td>
                                            <td>
                                                <button class="btn btn-sm btn-outline" onclick="viewAdminRequestDetails('${req.id}')">Manage</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>`
            }
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        container.innerHTML = '<p style="color: var(--error-color);">Error loading dashboard. Please try again.</p>';
    }
}

// ========================================
// ADMIN REQUESTS PAGE
// ========================================

async function loadAdminRequests(container) {
    console.log('Loading Admin Requests page...');

    container.innerHTML = `
        <div class="page-header">
            <h2>Manage Requests</h2>
            <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap; align-items: center;">
                <div style="position: relative; flex: 1; min-width: 200px;">
                    <input type="text" id="requestSearch" placeholder="Search name or tracking #..." 
                        onkeyup="filterRequests()"
                        style="width: 100%; padding: var(--spacing-sm) var(--spacing-md); padding-left: 36px; border: 2px solid var(--border-color); border-radius: var(--radius-md);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                
                <select id="statusFilter" onchange="filterRequests()" style="padding: var(--spacing-sm) var(--spacing-md); border: 2px solid var(--border-color); border-radius: var(--radius-md);">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
        </div>
        
        <div class="card">
            <div class="card-body">
                <div id="adminRequestsList">
                    <div style="text-align: center; padding: var(--spacing-xl);">
                        <div class="spinner" style="margin: 0 auto;"></div>
                        <p style="margin-top: var(--spacing-md); color: var(--text-secondary);">Loading requests...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    try {
        const result = await DB.getAllData('REQUESTS');
        let allRequests = result.success ? result.data : [];

        // Custom sort: Pending first, then by date desc, completed/rejected last
        allRequests.sort((a, b) => {
            const statusOrder = { 'pending': 1, 'processing': 2, 'approved': 3, 'completed': 4, 'rejected': 5 };
            const statusA = statusOrder[a.status] || 99;
            const statusB = statusOrder[b.status] || 99;

            if (statusA !== statusB) {
                return statusA - statusB; // Lower status value comes first
            }
            // If same status, sort by date desc (newest first)
            const dateA = convertFirebaseTimestamp(a.createdAt).getTime();
            const dateB = convertFirebaseTimestamp(b.createdAt).getTime();
            return dateB - dateA;
        });

        // Store in global or closure for filtering without refetching? 
        // For simplicity, we'll re-fetch or store in DOM. 
        // Let's attach to window temporarily for filtering
        window.currentAdminRequests = allRequests;

        displayAdminRequests(allRequests);
    } catch (error) {
        console.error('Error loading requests:', error);
        document.getElementById('adminRequestsList').innerHTML = '<p style="text-align: center; color: var(--error-color);">Error loading requests</p>';
    }
}

function displayAdminRequests(requests) {
    const container = document.getElementById('adminRequestsList');

    if (!requests || requests.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No requests found</p>';
        return;
    }

    container.innerHTML = `
        <div style="display: grid; gap: var(--spacing-md); grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
            ${requests.map(req => `
                <div class="card" onclick="viewAdminRequestDetails('${req.id}')" style="cursor: pointer; transition: transform 0.2s; margin-bottom: 0;">
                    <div class="card-body">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-sm);">
                            <div>
                                <div style="display: flex; align-items: center; gap: var(--spacing-xs); margin-bottom: 4px;">
                                    <span style="font-family: monospace; background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-size: 0.8em;">${req.trackingNumber}</span>
                                </div>
                                <h4 style="margin: 0; color: var(--text-primary); font-size: 1.1em;">${req.documentType}</h4>
                            </div>
                            <span class="badge badge-${req.status}">${req.status}</span>
                        </div>
                        
                        <div style="margin-top: var(--spacing-md);">
                            <div style="display: flex; align-items: center; gap: var(--spacing-xs); margin-bottom: var(--spacing-xs); color: var(--text-secondary); font-size: 0.9em;">
                                <span>👤 ${req.userName}</span>
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.9em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: var(--spacing-sm);">
                                ${req.purpose}
                            </div>
                            <div style="font-size: 0.8em; color: var(--text-light); text-align: right;">
                                ${formatDateTime(req.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function filterRequests() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchText = document.getElementById('requestSearch')?.value.toLowerCase().trim() || '';
    const allRequests = window.currentAdminRequests || [];

    const filtered = allRequests.filter(req => {
        // Status filter
        const statusMatch = statusFilter === 'all' || req.status === statusFilter;

        // Search filter
        const searchMatch = !searchText ||
            (req.trackingNumber && req.trackingNumber.toLowerCase().includes(searchText)) ||
            (req.userName && req.userName.toLowerCase().includes(searchText)) ||
            (req.documentType && req.documentType.toLowerCase().includes(searchText));

        return statusMatch && searchMatch;
    });

    displayAdminRequests(filtered);
}

// ========================================
// VIEW & MANAGE REQUEST DETAILS (ADMIN)
// ========================================

async function viewAdminRequestDetails(requestId) {
    try {
        const result = await DB.getData('REQUESTS', requestId);

        if (!result.success) {
            showToast('Request not found', 'error');
            return;
        }

        const request = result.data;

        const modal = createModal('Manage Request', `
            <div style="margin-bottom: var(--spacing-lg);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
                    <div>
                        <h4 style="margin: 0; color: var(--text-primary);">${request.documentType}</h4>
                        <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
                            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">Tracking #:</p>
                            <code style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: var(--radius-sm); font-size: var(--font-size-sm); color: var(--primary-color); cursor: pointer;" 
                                onclick="copyToClipboard('${request.trackingNumber}')" title="Click to copy">
                                ${request.trackingNumber}
                            </code>
                        </div>
                    </div>
                    <span class="badge badge-${request.status}">${request.status}</span>
                </div>
            </div>
            
            <div style="background: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg);">
                <div style="margin-bottom: var(--spacing-sm);">
                    <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Resident:</strong>
                    <p style="margin: var(--spacing-xs) 0 0 0;">${request.userName}</p>
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
                
                ${request.files && request.files.length > 0 ? `
                    <div>
                        <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Attached Files:</strong>
                        <ul style="margin: var(--spacing-xs) 0 0 0; padding-left: var(--spacing-lg);">
                            ${request.files.map(file => `<li>${file}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
            
            ${request.status === 'pending' ? `
                <div style="margin-bottom: var(--spacing-lg);">
                    <h4 style="margin-bottom: var(--spacing-md);">Update Status</h4>
                    <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="updateRequestStatus('${request.id}', 'processing')">
                            Start Processing
                        </button>
                        <button class="btn btn-secondary" onclick="updateRequestStatus('${request.id}', 'approved')">
                            Approve
                        </button>
                        <button class="btn btn-danger" onclick="showRejectModal('${request.id}')">
                            Reject
                        </button>
                    </div>
                </div>
            ` : ''}
            
            ${request.status === 'processing' || request.status === 'approved' ? `
                <div style="margin-bottom: var(--spacing-lg);">
                    <h4 style="margin-bottom: var(--spacing-md);">Update Status</h4>
                    <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
                        <button class="btn btn-success" onclick="updateRequestStatus('${request.id}', 'completed')">
                            Mark as Completed
                        </button>
                        <button class="btn btn-danger" onclick="showRejectModal('${request.id}')">
                            Reject
                        </button>
                    </div>
                </div>
            ` : ''}
            
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
                                <p style="margin: 0; font-size: var(--font-size-xs); color: var(--text-light);">${formatDateTime(item.timestamp)}</p>
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
        console.error('Error viewing request:', error);
        showToast('Error loading request details', 'error');
    }
}

// ========================================
// UPDATE REQUEST STATUS
// ========================================

async function updateRequestStatus(requestId, newStatus) {
    try {
        const result = await DB.getData('REQUESTS', requestId);
        if (!result.success) {
            showToast('Request not found', 'error');
            return;
        }

        const request = result.data;
        const statusMessages = {
            'processing': 'Request is being processed',
            'approved': 'Request has been approved',
            'completed': 'Document is ready for pickup',
            'rejected': 'Request has been rejected'
        };

        const timelineItem = {
            status: newStatus,
            message: statusMessages[newStatus] || `Status updated to ${newStatus}`,
            timestamp: new Date().toISOString()
        };

        // Update in Firebase
        const updates = {
            status: newStatus,
            timeline: [timelineItem, ...request.timeline] // Prepend to timeline
        };

        await DB.updateData('REQUESTS', requestId, updates);

        // Create notification for resident
        await DB.createNotification({
            userId: request.userId,
            title: 'Request Status Updated',
            message: `Your request for ${request.documentType} is now ${newStatus}`,
            type: newStatus === 'completed' ? 'success' : 'info',
            requestId: request.id
        });

        // Show success message
        showToast(`Request status updated to ${newStatus}`, 'success');

        // Close modal and refresh
        closeModal();

        // Refresh whatever page we are on
        if (AppState.currentPage === 'admin-requests') {
            loadAdminRequests(document.getElementById('mainContent'));
        } else {
            loadAdminDashboard(document.getElementById('mainContent'));
        }

    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Failed to update status', 'error');
    }
}

// ========================================
// REJECT REQUEST MODAL
// ========================================

function showRejectModal(requestId) {
    const modal = createModal('Reject Request', `
        <form id="rejectForm" onsubmit="handleRejectRequest(event, '${requestId}')">
            <div class="form-group">
                <label for="rejectReason">Reason for Rejection *</label>
                <textarea id="rejectReason" placeholder="Please provide a reason for rejection" required style="min-height: 120px;"></textarea>
            </div>
            <div class="modal-footer" style="border: none; padding: var(--spacing-lg) 0 0 0;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-danger">Reject Request</button>
            </div>
        </form>
    `, []);

    showModal(modal);
}

async function handleRejectRequest(event, requestId) {
    event.preventDefault();

    const reason = document.getElementById('rejectReason').value.trim();

    if (!reason) {
        showToast('Please provide a reason', 'error');
        return;
    }

    try {
        const result = await DB.getData('REQUESTS', requestId);
        if (!result.success) {
            showToast('Request not found', 'error');
            return;
        }

        const request = result.data;

        const timelineItem = {
            status: 'rejected',
            message: `Request rejected: ${reason}`,
            timestamp: new Date().toISOString()
        };

        const updates = {
            status: 'rejected',
            rejectionReason: reason,
            timeline: [timelineItem, ...request.timeline]
        };

        await DB.updateData('REQUESTS', requestId, updates);

        // Notify resident
        await DB.createNotification({
            userId: request.userId,
            title: 'Request Rejected',
            message: `Your request for ${request.documentType} has been rejected. Reason: ${reason}`,
            type: 'error',
            requestId: request.id
        });

        showToast('Request rejected', 'success');
        closeModal();

        if (AppState.currentPage === 'admin-requests') {
            loadAdminRequests(document.getElementById('mainContent'));
        } else {
            loadAdminDashboard(document.getElementById('mainContent'));
        }

    } catch (error) {
        console.error('Error rejecting request:', error);
        showToast('Failed to reject request', 'error');
    }
}

// ========================================
// ADMIN REPORTS PAGE
// ========================================

async function loadAdminReports(container) {
    container.innerHTML = `
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h2>Reports & Analytics</h2>
                <p>View statistics and generate reports</p>
            </div>
            <button class="btn btn-outline" onclick="window.print()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Print
            </button>
        </div>
        
        <div id="reportsContent" style="padding-bottom: 120px;">
            <div style="text-align: center; padding: var(--spacing-xl);">
                 <div class="spinner" style="margin: 0 auto;"></div>
                 <p style="margin-top: var(--spacing-md); color: var(--text-secondary);">Generating reports...</p>
            </div>
        </div>
    `;

    try {
        const result = await DB.getAllData('REQUESTS');
        const allRequests = result.success ? result.data : [];

        // Calculate statistics by document type
        const documentStats = {};

        // Use global DOCUMENT_TYPES if available, else fallback
        const docTypes = (typeof DOCUMENT_TYPES !== 'undefined') ? DOCUMENT_TYPES : (window.DOCUMENT_TYPES || []);

        docTypes.forEach(type => {
            documentStats[type] = allRequests.filter(r => r.documentType === type).length;
        });

        // Calculate Stats by Status
        const statusStats = {
            pending: allRequests.filter(r => r.status === 'pending').length,
            processing: allRequests.filter(r => r.status === 'processing').length,
            completed: allRequests.filter(r => r.status === 'completed').length,
            rejected: allRequests.filter(r => r.status === 'rejected').length
        };

        // Calculate monthly statistics
        const monthlyStats = {};
        allRequests.forEach(req => {
            const date = convertFirebaseTimestamp(req.createdAt);
            const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            monthlyStats[month] = (monthlyStats[month] || 0) + 1;
        });

        const reportsContent = document.getElementById('reportsContent');
        reportsContent.innerHTML = `
            <!-- STATUS OVERVIEW -->
            <div class="card" style="margin-bottom: var(--spacing-lg);">
                <div class="card-header">
                    <h3 class="card-title">Request Status Overview</h3>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--spacing-md);">
                        <div style="background: var(--bg-tertiary); padding: var(--spacing-md); border-radius: var(--radius-md); text-align: center; border-left: 4px solid var(--warning-color);">
                            <div style="font-size: 2em; font-weight: bold; color: var(--text-primary);">${statusStats.pending}</div>
                            <div style="color: var(--text-secondary); font-size: 0.9em;">Pending</div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: var(--spacing-md); border-radius: var(--radius-md); text-align: center; border-left: 4px solid var(--primary-color);">
                            <div style="font-size: 2em; font-weight: bold; color: var(--text-primary);">${statusStats.processing}</div>
                            <div style="color: var(--text-secondary); font-size: 0.9em;">Processing</div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: var(--spacing-md); border-radius: var(--radius-md); text-align: center; border-left: 4px solid var(--success-color);">
                            <div style="font-size: 2em; font-weight: bold; color: var(--text-primary);">${statusStats.completed}</div>
                            <div style="color: var(--text-secondary); font-size: 0.9em;">Completed</div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: var(--spacing-md); border-radius: var(--radius-md); text-align: center; border-left: 4px solid var(--danger-color);">
                            <div style="font-size: 2em; font-weight: bold; color: var(--text-primary);">${statusStats.rejected}</div>
                            <div style="color: var(--text-secondary); font-size: 0.9em;">Rejected</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Requests by Document Type</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Document Type</th>
                                    <th>Total Requests</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(documentStats).map(([type, count]) => `
                                    <tr>
                                        <td>${type}</td>
                                        <td><strong>${count}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Monthly Requests</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Total Requests</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(monthlyStats).reverse().map(([month, count]) => `
                                    <tr>
                                        <td>${month}</td>
                                        <td><strong>${count}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading reports:', error);
        container.innerHTML = '<p style="color: var(--error-color);">Error generating reports</p>';
    }
}

// Make functions globally available
window.loadAdminDashboard = loadAdminDashboard;
window.loadAdminRequests = loadAdminRequests;
window.loadAdminReports = loadAdminReports;
window.viewAdminRequestDetails = viewAdminRequestDetails;
window.updateRequestStatus = updateRequestStatus;
window.showRejectModal = showRejectModal;
window.handleRejectRequest = handleRejectRequest;
window.filterRequests = filterRequests;

console.log('✅ Admin module functions exported:', {
    loadAdminDashboard: typeof loadAdminDashboard,
    loadAdminRequests: typeof loadAdminRequests,
    loadAdminReports: typeof loadAdminReports
});
