// ========================================
// ANNOUNCEMENTS & ALERTS MODULE
// ========================================

// Announcement categories
const ANNOUNCEMENT_CATEGORIES = [
    'General',
    'Emergency',
    'Event',
    'Health',
    'Safety',
    'Infrastructure',
    'Policy'
];

// ========================================
// LOAD ANNOUNCEMENTS PAGE
// ========================================

async function loadAnnouncementsPage(container) {
    try {
        // Get announcements from local database
        const result = await DB.getAnnouncements();
        const announcements = result.success ? result.data : [];

        container.innerHTML = `
            <div class="page-header">
                <h2>Announcements & Alerts</h2>
                <p>Stay updated with barangay news and alerts</p>
            </div>
            
            <div style="margin-bottom: var(--spacing-lg);">
                <select id="categoryFilter" onchange="filterAnnouncements()" style="padding: var(--spacing-sm) var(--spacing-md); border: 2px solid var(--border-color); border-radius: var(--radius-md); width: 100%; max-width: 300px;">
                    <option value="all">All Categories</option>
                    ${ANNOUNCEMENT_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </div>
            
            <div id="announcementsList">
                ${renderAnnouncements(announcements)}
            </div>
        `;

    } catch (error) {
        console.error('Error loading announcements:', error);
        container.innerHTML = '<p style="color: var(--error-color);">Error loading announcements. Please try again.</p>';
    }
}



function renderAnnouncements(announcements) {
    if (announcements.length === 0) {
        return '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No announcements</p>';
    }

    return announcements.map(announcement => `
        <div class="card" style="margin-bottom: var(--spacing-md); border-left: 4px solid ${getCategoryColor(announcement.category)};">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-md);">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs);">
                            <span class="badge" style="background: ${getCategoryColor(announcement.category)}; color: white;">
                                ${announcement.category}
                            </span>
                            ${announcement.priority === 'high' ? '<span class="badge badge-danger">Urgent</span>' : ''}
                        </div>
                        <h3 style="margin: 0 0 var(--spacing-xs) 0; color: var(--text-primary);">${announcement.title}</h3>
                        <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">
                            ${new Date(announcement.createdAt).toLocaleString()}
                        </p>
                    </div>
                    ${announcement.icon ? `<div style="font-size: 2rem;">${announcement.icon}</div>` : ''}
                </div>
                
                <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md); line-height: 1.6;">
                    ${announcement.content}
                </p>
                
                ${announcement.location ? `
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); color: var(--text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--spacing-sm);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${announcement.location}
                    </div>
                ` : ''}
                
                ${announcement.eventDate ? `
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); color: var(--text-secondary); font-size: var(--font-size-sm);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${new Date(announcement.eventDate).toLocaleDateString()}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getCategoryColor(category) {
    const colors = {
        'General': '#6b7280',
        'Emergency': '#ef4444',
        'Event': '#8b5cf6',
        'Health': '#10b981',
        'Safety': '#f59e0b',
        'Infrastructure': '#3b82f6',
        'Policy': '#6366f1'
    };
    return colors[category] || colors.General;
}

async function filterAnnouncements() {
    const filter = document.getElementById('categoryFilter').value;
    const result = await DB.getAnnouncements();
    const allAnnouncements = result.success ? result.data : [];

    const filtered = filter === 'all'
        ? allAnnouncements
        : allAnnouncements.filter(a => a.category === filter);

    document.getElementById('announcementsList').innerHTML = renderAnnouncements(filtered);
}

// ========================================
// INITIALIZE SAMPLE ANNOUNCEMENTS
// ========================================

function initializeSampleAnnouncements() {
    const sampleAnnouncements = [
        {
            id: 'ann-1',
            title: 'Community Clean-Up Drive',
            content: 'Join us this Saturday for our monthly community clean-up drive. Let\'s work together to keep our barangay clean and beautiful. Bring your own cleaning materials. Snacks will be provided.',
            category: 'Event',
            priority: 'normal',
            icon: '🧹',
            location: 'Barangay Hall',
            eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'ann-2',
            title: 'Free Medical Check-Up',
            content: 'The barangay health center will be conducting free medical check-ups and consultations. Blood pressure monitoring, blood sugar testing, and general health consultation available. First come, first served.',
            category: 'Health',
            priority: 'normal',
            icon: '🏥',
            location: 'Barangay Health Center',
            eventDate: new Date(Date.now() + 86400000 * 3).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            id: 'ann-3',
            title: 'Road Repair Schedule',
            content: 'Road repair and maintenance will be conducted on Main Street. Expect temporary road closures and traffic rerouting. Please use alternative routes during the repair period.',
            category: 'Infrastructure',
            priority: 'high',
            icon: '🚧',
            location: 'Main Street',
            eventDate: new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
            id: 'ann-4',
            title: 'New Operating Hours',
            content: 'Effective immediately, the barangay hall will have new operating hours: Monday to Friday, 8:00 AM to 5:00 PM. We will be closed on weekends and holidays.',
            category: 'Policy',
            priority: 'normal',
            icon: '⏰',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        }
    ];

    localStorage.setItem('announcements', JSON.stringify(sampleAnnouncements));
}

// ========================================
// ADMIN: CREATE ANNOUNCEMENT
// ========================================

function showCreateAnnouncementModal() {
    const modal = createModal('Create Announcement', `
        <form id="announcementForm" onsubmit="handleCreateAnnouncement(event)">
            <div class="form-group">
                <label for="annTitle">Title *</label>
                <input type="text" id="annTitle" required placeholder="Announcement title">
            </div>
            
            <div class="form-group">
                <label for="annCategory">Category *</label>
                <select id="annCategory" required>
                    <option value="">Select category</option>
                    ${ANNOUNCEMENT_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="annPriority">Priority *</label>
                <select id="annPriority" required>
                    <option value="normal">Normal</option>
                    <option value="high">High (Urgent)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="annContent">Content *</label>
                <textarea id="annContent" required placeholder="Announcement details" style="min-height: 120px;"></textarea>
            </div>
            
            <div class="form-group">
                <label for="annLocation">Location (Optional)</label>
                <input type="text" id="annLocation" placeholder="Event or relevant location">
            </div>
            
            <div class="form-group">
                <label for="annEventDate">Event Date (Optional)</label>
                <input type="date" id="annEventDate" min="${new Date().toISOString().split('T')[0]}">
            </div>
            
            <div class="form-group">
                <label for="annIcon">Icon (Optional)</label>
                <input type="text" id="annIcon" placeholder="Emoji icon (e.g., 📢, 🎉, ⚠️)" maxlength="2">
            </div>
            
            <div class="modal-footer" style="border: none; padding: var(--spacing-lg) 0 0 0;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Publish Announcement</button>
            </div>
        </form>
    `, []);

    showModal(modal);
}

async function handleCreateAnnouncement(event) {
    event.preventDefault();

    const announcement = {
        title: document.getElementById('annTitle').value.trim(),
        category: document.getElementById('annCategory').value,
        priority: document.getElementById('annPriority').value,
        content: document.getElementById('annContent').value.trim(),
        location: document.getElementById('annLocation').value.trim() || null,
        eventDate: document.getElementById('annEventDate').value || null,
        icon: document.getElementById('annIcon').value.trim() || null,
        createdBy: AppState.currentUser.id,
        createdByName: AppState.currentUser.fullName
    };

    try {
        // Create announcement in local database
        const result = await DB.createAnnouncement(announcement);

        if (result.success) {
            showToast('Announcement published successfully', 'success');
            closeModal();
            navigateToPage(AppState.currentPage);
        } else {
            showToast(result.error || 'Failed to create announcement', 'error');
        }
    } catch (error) {
        console.error('Create announcement error:', error);
        showToast('Failed to create announcement', 'error');
    }
}



// ========================================
// ADMIN: MANAGE ANNOUNCEMENTS PAGE
// ========================================

async function loadAdminAnnouncementsPage(container) {
    try {
        // Get announcements from local database
        const result = await DB.getAnnouncements();
        const announcements = result.success ? result.data : [];

        container.innerHTML = `
            <div class="page-header">
                <h2>Manage Announcements</h2>
                <p>Create and manage barangay announcements</p>
                <button class="btn btn-primary" onclick="showCreateAnnouncementModal()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Create Announcement
                </button>
            </div>
            
            <div id="adminAnnouncementsList">
                ${renderAdminAnnouncements(announcements)}
            </div>
        `;

    } catch (error) {
        console.error('Error loading admin announcements:', error);
        container.innerHTML = '<p style="color: var(--error-color);">Error loading announcements. Please try again.</p>';
    }
}

function renderAdminAnnouncements(announcements) {
    if (announcements.length === 0) {
        return '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No announcements</p>';
    }

    return announcements.map(announcement => `
        <div class="card" style="margin-bottom: var(--spacing-md); border-left: 4px solid ${getCategoryColor(announcement.category)};">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-md);">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs);">
                            <span class="badge" style="background: ${getCategoryColor(announcement.category)}; color: white;">
                                ${announcement.category}
                            </span>
                            ${announcement.priority === 'high' ? '<span class="badge badge-danger">Urgent</span>' : ''}
                        </div>
                        <h3 style="margin: 0 0 var(--spacing-xs) 0; color: var(--text-primary);">${announcement.title}</h3>
                        <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">
                            ${new Date(announcement.createdAt).toLocaleString()}
                        </p>
                    </div>
                    ${announcement.icon ? `<div style="font-size: 2rem;">${announcement.icon}</div>` : ''}
                </div>
                
                <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md); line-height: 1.6;">
                    ${announcement.content}
                </p>
                
                ${announcement.location ? `
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); color: var(--text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--spacing-sm);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${announcement.location}
                    </div>
                ` : ''}
                
                ${announcement.eventDate ? `
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); color: var(--text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--spacing-md);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${new Date(announcement.eventDate).toLocaleDateString()}
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: var(--spacing-sm); justify-content: flex-end;">
                    <button class="btn btn-sm btn-outline" onclick="deleteAnnouncement('${announcement.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function filterAdminAnnouncements() {
    const filter = document.getElementById('adminCategoryFilter').value;
    const result = await DB.getAnnouncements();
    const allAnnouncements = result.success ? result.data : [];

    const filtered = filter === 'all'
        ? allAnnouncements
        : allAnnouncements.filter(a => a.category === filter);

    document.getElementById('adminAnnouncementsList').innerHTML = renderAdminAnnouncements(filtered);
}

async function deleteAnnouncement(announcementId) {
    if (confirm('Are you sure you want to delete this announcement?')) {
        const result = await DB.deleteData('announcements', announcementId);

        if (result.success) {
            showToast('Announcement deleted successfully', 'success');
            navigateToPage('admin-announcements');
        } else {
            showToast('Failed to delete announcement', 'error');
        }
    }
}

// Make functions globally available
window.loadAnnouncementsPage = loadAnnouncementsPage;
window.loadAdminAnnouncementsPage = loadAdminAnnouncementsPage;
window.filterAnnouncements = filterAnnouncements;
window.filterAdminAnnouncements = filterAdminAnnouncements;
window.showCreateAnnouncementModal = showCreateAnnouncementModal;
window.handleCreateAnnouncement = handleCreateAnnouncement;
window.deleteAnnouncement = deleteAnnouncement;
