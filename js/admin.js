// ADMIN MODULE - Request Management
// ========================================

console.log('Admin module loaded');

// ========================================

// ========================================
// ADMIN DASHBOARD
// ========================================

function loadAdminDashboard(container) {
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');

    // Calculate statistics
    const totalRequests = allRequests.length;
    const pendingRequests = allRequests.filter(r => r.status === 'pending').length;
    const processingRequests = allRequests.filter(r => r.status === 'processing').length;
    const completedRequests = allRequests.filter(r => r.status === 'completed').length;
    const rejectedRequests = allRequests.filter(r => r.status === 'rejected').length;
    const totalResidents = allUsers.filter(u => u.role === 'resident').length;

    // Get recent requests
    const recentRequests = allRequests.slice(-5).reverse();

    container.innerHTML = `
        <div class="page-header">
            <h2>Admin Dashboard</h2>
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
                                        <td>${new Date(req.createdAt).toLocaleDateString()}</td>
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
}

// ========================================
// ADMIN REQUESTS PAGE
// ========================================

function loadAdminRequests(container) {
    console.log('Loading Admin Requests page...');
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');

    container.innerHTML = `
        <div class="page-header">
            <h2>Manage Requests</h2>
            <div style="display: flex; gap: var(--spacing-sm);">
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
                <div id="adminRequestsList"></div>
            </div>
        </div>
    `;

    displayAdminRequests(allRequests);
}

function displayAdminRequests(requests) {
    const container = document.getElementById('adminRequestsList');

    if (requests.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No requests found</p>';
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Tracking #</th>
                        <th>Resident</th>
                        <th>Document Type</th>
                        <th>Purpose</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(req => `
                        <tr>
                            <td><strong>${req.trackingNumber}</strong></td>
                            <td>${req.userName}</td>
                            <td>${req.documentType}</td>
                            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${req.purpose}</td>
                            <td>${new Date(req.createdAt).toLocaleDateString()}</td>
                            <td><span class="badge badge-${req.status}">${req.status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="viewAdminRequestDetails('${req.id}')">Manage</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function filterRequests() {
    const filter = document.getElementById('statusFilter').value;
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');

    const filtered = filter === 'all'
        ? allRequests
        : allRequests.filter(r => r.status === filter);

    displayAdminRequests(filtered);
}

// ========================================
// VIEW & MANAGE REQUEST DETAILS (ADMIN)
// ========================================

function viewAdminRequestDetails(requestId) {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const request = requests.find(r => r.id === requestId);

    if (!request) {
        showToast('Request not found', 'error');
        return;
    }

    const modal = createModal('Manage Request', `
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
// UPDATE REQUEST STATUS
// ========================================

function updateRequestStatus(requestId, newStatus) {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const requestIndex = requests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
        showToast('Request not found', 'error');
        return;
    }

    const request = requests[requestIndex];

    // Update status
    request.status = newStatus;
    request.updatedAt = new Date().toISOString();

    // Add to timeline
    const statusMessages = {
        'processing': 'Request is being processed',
        'approved': 'Request has been approved',
        'completed': 'Document is ready for pickup',
        'rejected': 'Request has been rejected'
    };

    request.timeline.unshift({
        status: newStatus,
        message: statusMessages[newStatus] || `Status updated to ${newStatus}`,
        timestamp: new Date().toISOString()
    });

    // Save updated requests
    requests[requestIndex] = request;
    localStorage.setItem('requests', JSON.stringify(requests));

    // Create notification for resident
    createNotification({
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
    navigateToPage(AppState.currentPage);
    updateNotificationBadge();
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

function handleRejectRequest(event, requestId) {
    event.preventDefault();

    const reason = document.getElementById('rejectReason').value.trim();

    if (!reason) {
        showToast('Please provide a reason', 'error');
        return;
    }

    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const requestIndex = requests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
        showToast('Request not found', 'error');
        return;
    }

    const request = requests[requestIndex];

    // Update status
    request.status = 'rejected';
    request.updatedAt = new Date().toISOString();
    request.rejectionReason = reason;

    // Add to timeline
    request.timeline.unshift({
        status: 'rejected',
        message: `Request rejected: ${reason}`,
        timestamp: new Date().toISOString()
    });

    // Save
    requests[requestIndex] = request;
    localStorage.setItem('requests', JSON.stringify(requests));

    // Notify resident
    createNotification({
        userId: request.userId,
        title: 'Request Rejected',
        message: `Your request for ${request.documentType} has been rejected. Reason: ${reason}`,
        type: 'error',
        requestId: request.id
    });

    showToast('Request rejected', 'success');
    closeModal();
    navigateToPage(AppState.currentPage);
    updateNotificationBadge();
}

// ========================================
// ADMIN REPORTS PAGE
// ========================================

function loadAdminReports(container) {
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');

    // Calculate statistics by document type
    const documentStats = {};
    DOCUMENT_TYPES.forEach(type => {
        documentStats[type] = allRequests.filter(r => r.documentType === type).length;
    });

    // Calculate monthly statistics
    const monthlyStats = {};
    allRequests.forEach(req => {
        const month = new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    container.innerHTML = `
        <div class="page-header">
            <h2>Reports & Analytics</h2>
            <p>View statistics and generate reports</p>
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
