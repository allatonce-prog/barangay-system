// ========================================
// FEEDBACK & REPORTING MODULE
// ========================================

// Report categories
const REPORT_CATEGORIES = [
    'Street Lighting',
    'Road Damage',
    'Garbage Collection',
    'Water Supply',
    'Drainage',
    'Noise Complaint',
    'Safety Concern',
    'Other'
];

// Report priority levels
const PRIORITY_LEVELS = [
    { value: 'low', label: 'Low', color: '#6b7280' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' }
];

// ========================================
// LOAD REPORTS PAGE
// ========================================

function loadReportsPage(container) {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]')
        .filter(r => r.userId === AppState.currentUser.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = `
        <div class="page-header">
            <h2>My Reports</h2>
            <button class="btn btn-primary" onclick="showReportModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Submit Report
            </button>
        </div>
        
        <div class="card">
            <div class="card-body">
                ${reports.length === 0 ?
            '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No reports submitted yet</p>' :
            renderReportsList(reports)
        }
            </div>
        </div>
    `;
}

function renderReportsList(reports) {
    return `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Reference</th>
                        <th>Category</th>
                        <th>Subject</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${reports.map(report => `
                        <tr>
                            <td><strong>${report.referenceNumber}</strong></td>
                            <td>${report.category}</td>
                            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${report.subject}</td>
                            <td><span class="badge" style="background: ${getPriorityColor(report.priority)}; color: white;">${report.priority}</span></td>
                            <td><span class="badge badge-${report.status}">${report.status}</span></td>
                            <td>${new Date(report.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="viewReportDetails('${report.id}')">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function getPriorityColor(priority) {
    const level = PRIORITY_LEVELS.find(p => p.value === priority);
    return level ? level.color : '#6b7280';
}

// ========================================
// SHOW REPORT MODAL
// ========================================

function showReportModal() {
    const modal = createModal('Submit Report', `
        <form id="reportForm" onsubmit="handleReportSubmission(event)">
            <div class="form-group">
                <label for="reportCategory">Category *</label>
                <select id="reportCategory" required>
                    <option value="">Select category</option>
                    ${REPORT_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="reportSubject">Subject *</label>
                <input type="text" id="reportSubject" required placeholder="Brief description of the issue">
            </div>
            
            <div class="form-group">
                <label for="reportPriority">Priority Level *</label>
                <select id="reportPriority" required>
                    ${PRIORITY_LEVELS.map(level => `
                        <option value="${level.value}">${level.label}</option>
                    `).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="reportLocation">Location *</label>
                <input type="text" id="reportLocation" required placeholder="Where is this issue located?">
            </div>
            
            <div class="form-group">
                <label for="reportDescription">Detailed Description *</label>
                <textarea id="reportDescription" required placeholder="Provide detailed information about the issue" style="min-height: 120px;"></textarea>
            </div>
            
            <div class="form-group">
                <label>Upload Photos/Videos (Optional)</label>
                <div class="file-upload">
                    <input type="file" id="reportFiles" multiple accept="image/*,video/*" onchange="handleReportFileSelect(event)">
                    <div class="file-upload-label">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span>Click to upload evidence</span>
                    </div>
                </div>
                <div id="reportFileList" style="margin-top: var(--spacing-sm);"></div>
            </div>
            
            <div style="background: rgba(37, 99, 235, 0.1); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-md);">
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">
                    <strong>Note:</strong> Your report will be reviewed by barangay officials. You will receive updates on the progress.
                </p>
            </div>
            
            <div class="modal-footer" style="border: none; padding: var(--spacing-lg) 0 0 0;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Submit Report</button>
            </div>
        </form>
    `, []);

    showModal(modal);
}

let reportFiles = [];

function handleReportFileSelect(event) {
    const files = Array.from(event.target.files);
    reportFiles = files;

    const fileList = document.getElementById('reportFileList');

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

// ========================================
// HANDLE REPORT SUBMISSION
// ========================================

function handleReportSubmission(event) {
    event.preventDefault();

    const report = {
        id: `report-${Date.now()}`,
        referenceNumber: generateReportReference(),
        userId: AppState.currentUser.id,
        userName: AppState.currentUser.fullName,
        category: document.getElementById('reportCategory').value,
        subject: document.getElementById('reportSubject').value.trim(),
        priority: document.getElementById('reportPriority').value,
        location: document.getElementById('reportLocation').value.trim(),
        description: document.getElementById('reportDescription').value.trim(),
        files: reportFiles.map(f => f.name),
        status: 'pending', // pending, investigating, in-progress, resolved, closed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
            {
                status: 'pending',
                message: 'Report submitted and awaiting review',
                timestamp: new Date().toISOString()
            }
        ]
    };

    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.push(report);
    localStorage.setItem('reports', JSON.stringify(reports));

    // Create notifications
    createNotification({
        userId: AppState.currentUser.id,
        title: 'Report Submitted',
        message: `Your report about "${report.subject}" has been submitted. Reference: ${report.referenceNumber}`,
        type: 'success',
        reportId: report.id
    });

    createNotification({
        userId: 'user-admin',
        title: 'New Report Submitted',
        message: `${AppState.currentUser.fullName} reported: ${report.subject}`,
        type: report.priority === 'high' ? 'warning' : 'info',
        reportId: report.id
    });

    showToast(`Report submitted! Reference: ${report.referenceNumber}`, 'success');
    closeModal();
    reportFiles = [];
    navigateToPage(AppState.currentPage);
    updateNotificationBadge();
}

function generateReportReference() {
    const year = new Date().getFullYear();
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const count = reports.length + 1;
    return `RPT-${year}-${String(count).padStart(4, '0')}`;
}

// ========================================
// VIEW REPORT DETAILS
// ========================================

function viewReportDetails(reportId) {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const report = reports.find(r => r.id === reportId);

    if (!report) {
        showToast('Report not found', 'error');
        return;
    }

    const modal = createModal('Report Details', `
        <div style="margin-bottom: var(--spacing-lg);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-md);">
                <div>
                    <h4 style="margin: 0; color: var(--text-primary);">${report.subject}</h4>
                    <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">
                        Reference: ${report.referenceNumber}
                    </p>
                </div>
                <div style="display: flex; gap: var(--spacing-xs); flex-direction: column; align-items: flex-end;">
                    <span class="badge badge-${report.status}">${report.status}</span>
                    <span class="badge" style="background: ${getPriorityColor(report.priority)}; color: white;">${report.priority} priority</span>
                </div>
            </div>
        </div>
        
        <div style="background: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg);">
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Category:</strong>
                <p style="margin: var(--spacing-xs) 0 0 0;">${report.category}</p>
            </div>
            
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Location:</strong>
                <p style="margin: var(--spacing-xs) 0 0 0;">${report.location}</p>
            </div>
            
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Description:</strong>
                <p style="margin: var(--spacing-xs) 0 0 0;">${report.description}</p>
            </div>
            
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Submitted:</strong>
                <p style="margin: var(--spacing-xs) 0 0 0;">${new Date(report.createdAt).toLocaleString()}</p>
            </div>
            
            ${report.files && report.files.length > 0 ? `
                <div>
                    <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Attached Files:</strong>
                    <ul style="margin: var(--spacing-xs) 0 0 0; padding-left: var(--spacing-lg);">
                        ${report.files.map(file => `<li>${file}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
        
        <div>
            <h4 style="margin-bottom: var(--spacing-md);">Progress Timeline</h4>
            <div class="timeline">
                ${report.timeline.map((item, index) => `
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

// Make functions globally available
window.loadReportsPage = loadReportsPage;
window.showReportModal = showReportModal;
window.handleReportFileSelect = handleReportFileSelect;
window.handleReportSubmission = handleReportSubmission;
window.viewReportDetails = viewReportDetails;
