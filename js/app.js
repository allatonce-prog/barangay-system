// ========================================
// MAIN APP LOGIC
// ========================================

// Global state management
const AppState = {
    currentUser: null,
    currentPage: 'home',
    notifications: [],
    requests: []
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('App initializing...');

    // Simulate loading
    setTimeout(() => {
        initializeApp();
    }, 1500);
});

function initializeApp() {
    // Hide loading screen
    document.getElementById('loadingScreen').style.display = 'none';

    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');

    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
        showApp();
    } else {
        showLoginScreen();
    }

    // Setup event listeners
    setupEventListeners();

    // Check for PWA install prompt
    setupPWAInstall();
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // User menu toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');

    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (userMenu && !userMenu.contains(e.target) && e.target !== userMenuBtn) {
            userMenu.style.display = 'none';
        }
    });

    // Profile button
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            showProfileModal();
            document.getElementById('userMenu').style.display = 'none';
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            navigateToPage(page);
        });
    });

    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            console.log('Notification button clicked');
            if (typeof showNotifications === 'function') {
                showNotifications();
            } else {
                console.error('showNotifications function not found');
            }
        });
    }
}

// ========================================
// NAVIGATION
// ========================================

function navigateToPage(page) {
    console.log('Navigating to:', page);

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });

    // Update current page
    AppState.currentPage = page;

    // Load page content
    loadPageContent(page);
}

function loadPageContent(page) {
    const mainContent = document.querySelector('.main-content');

    // Route to appropriate page handler
    switch (page) {
        case 'home':
            loadHomePage(mainContent);
            break;
        case 'requests':
            loadRequestsPage(mainContent);
            break;
        case 'track':
            loadTrackPage(mainContent);
            break;
        case 'appointments':
            if (typeof loadAppointmentsPage === 'function') {
                loadAppointmentsPage(mainContent);
            } else {
                mainContent.innerHTML = '<div class="card"><p>Appointments feature coming soon!</p></div>';
            }
            break;
        case 'payments':
            if (typeof loadPaymentHistory === 'function') {
                loadPaymentHistory(mainContent);
            } else {
                mainContent.innerHTML = '<div class="card"><p>Payment history feature coming soon!</p></div>';
            }
            break;
        case 'announcements':
            if (typeof loadAnnouncementsPage === 'function') {
                loadAnnouncementsPage(mainContent);
            } else {
                mainContent.innerHTML = '<div class="card"><p>Announcements feature coming soon!</p></div>';
            }
            break;
        case 'reports':
            if (typeof loadReportsPage === 'function') {
                loadReportsPage(mainContent);
            } else {
                mainContent.innerHTML = '<div class="card"><p>Reports feature coming soon!</p></div>';
            }
            break;
        case 'more':
            loadMorePage(mainContent);
            break;
        case 'admin-dashboard':
            if (typeof loadAdminDashboard === 'function') {
                loadAdminDashboard(mainContent);
            } else {
                mainContent.innerHTML = '<div class="card"><p>Loading admin dashboard...</p></div>';
                console.error('loadAdminDashboard function not found');
            }
            break;
        case 'admin-requests':
            if (typeof loadAdminRequests === 'function') {
                loadAdminRequests(mainContent);
            } else {
                mainContent.innerHTML = '<div class="card"><p>Loading admin requests...</p></div>';
                console.error('loadAdminRequests function not found');
            }
            break;
        case 'admin-reports':
            if (typeof loadAdminReports === 'function') {
                loadAdminReports(mainContent);
            } else {
                mainContent.innerHTML = '<div class="card"><p>Loading admin reports...</p></div>';
                console.error('loadAdminReports function not found');
            }
            break;
        default:
            loadHomePage(mainContent);
    }
}

// ========================================
// MORE PAGE - Additional Features
// ========================================

function loadMorePage(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2>More Services</h2>
            <p>Access additional features and services</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md);">
            <button class="card" onclick="navigateToPage('announcements')" style="cursor: pointer; border: none; text-align: center; padding: var(--spacing-xl); transition: transform var(--transition-fast);" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="font-size: 3rem; margin-bottom: var(--spacing-sm);">📢</div>
                <h4 style="margin: 0; color: var(--text-primary);">Announcements</h4>
                <p style="margin: var(--spacing-xs) 0 0 0; font-size: var(--font-size-sm); color: var(--text-secondary);">Latest news</p>
            </button>
            
            <button class="card" onclick="navigateToPage('reports')" style="cursor: pointer; border: none; text-align: center; padding: var(--spacing-xl); transition: transform var(--transition-fast);" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="font-size: 3rem; margin-bottom: var(--spacing-sm);">📝</div>
                <h4 style="margin: 0; color: var(--text-primary);">Report Issue</h4>
                <p style="margin: var(--spacing-xs) 0 0 0; font-size: var(--font-size-sm); color: var(--text-secondary);">Submit feedback</p>
            </button>
            
            <button class="card" onclick="navigateToPage('payments')" style="cursor: pointer; border: none; text-align: center; padding: var(--spacing-xl); transition: transform var(--transition-fast);" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="font-size: 3rem; margin-bottom: var(--spacing-sm);">💳</div>
                <h4 style="margin: 0; color: var(--text-primary);">Payments</h4>
                <p style="margin: var(--spacing-xs) 0 0 0; font-size: var(--font-size-sm); color: var(--text-secondary);">Payment history</p>
            </button>
            
            <button class="card" onclick="navigateToPage('appointments')" style="cursor: pointer; border: none; text-align: center; padding: var(--spacing-xl); transition: transform var(--transition-fast);" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="font-size: 3rem; margin-bottom: var(--spacing-sm);">📅</div>
                <h4 style="margin: 0; color: var(--text-primary);">Appointments</h4>
                <p style="margin: var(--spacing-xs) 0 0 0; font-size: var(--font-size-sm); color: var(--text-secondary);">My appointments</p>
            </button>
        </div>
        
        <div class="card" style="margin-top: var(--spacing-lg);">
            <div class="card-header">
                <h3 class="card-title">Community Directory</h3>
            </div>
            <div class="card-body">
                <div style="display: grid; gap: var(--spacing-md);">
                    <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <h4 style="margin: 0 0 var(--spacing-xs) 0;">Barangay Hall</h4>
                        <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">📞 (123) 456-7890</p>
                        <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">📧 barangay@pantukan.gov</p>
                    </div>
                    <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <h4 style="margin: 0 0 var(--spacing-xs) 0;'>Health Center</h4>
                        <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">📞 (123) 456-7891</p>
                        <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">⏰ Mon-Fri: 8AM-5PM</p>
                    </div>
                    <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <h4 style="margin: 0 0 var(--spacing-xs) 0;'>Police Station</h4>
                        <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">📞 911 / (123) 456-7892</p>
                        <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">🚔 24/7 Emergency</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// PAGE LOADERS - RESIDENT MODULE
// ========================================

function loadHomePage(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2>Welcome, ${AppState.currentUser.fullName}!</h2>
            <p>Request your barangay documents easily and track their status</p>
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
                <div class="stat-value" id="totalRequests">0</div>
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
                <div class="stat-value" id="pendingRequests">0</div>
                <div class="stat-label">Pending</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </div>
                <div class="stat-value" id="completedRequests">0</div>
                <div class="stat-label">Completed</div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Quick Actions</h3>
            </div>
            <div class="card-body">
                <div class="quick-actions">
                    <button class="btn btn-primary btn-block" onclick="showNewRequestModal()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Document Request
                    </button>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Recent Requests</h3>
            </div>
            <div class="card-body">
                <div id="recentRequestsList"></div>
            </div>
        </div>
    `;

    // Load user statistics
    updateUserStats();
    loadRecentRequests();
}

function loadRequestsPage(container) {
    console.log('[App] Loading requests page...');
    
    container.innerHTML = `
        <div class="page-header">
            <h2>My Requests</h2>
            <button class="btn btn-primary" onclick="showNewRequestModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                New Request
            </button>
        </div>
        
        <div class="card">
            <div class="card-body">
                <div id="requestsList"></div>
            </div>
        </div>
    `;

    displayUserRequests();
}

function displayUserRequests() {
    console.log('[App] Displaying user requests...');
    const requestsList = document.getElementById('requestsList');
    
    if (!requestsList) {
        console.error('[App] requestsList element not found');
        return;
    }
    
    const userRequests = getUserRequests();
    console.log('[App] User requests:', userRequests);

    if (userRequests.length === 0) {
        requestsList.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-2xl); color: var(--text-secondary);">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: var(--spacing-md); opacity: 0.3;">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <p>No requests yet. Click "New Request" to get started!</p>
            </div>
        `;
        return;
    }

    const requestsHTML = userRequests.map(request => `
        <div class="request-item" style="padding: var(--spacing-md); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: var(--spacing-md); cursor: pointer; transition: all var(--transition-fast);" 
             onclick="viewRequestDetails('${request.id}')"
             onmouseover="this.style.borderColor='var(--primary-color)'; this.style.boxShadow='var(--shadow-md)'"
             onmouseout="this.style.borderColor='var(--border-color)'; this.style.boxShadow='none'">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-sm);">
                <div>
                    <h4 style="margin: 0; color: var(--text-primary);">${request.documentType}</h4>
                    <p style="margin: var(--spacing-xs) 0 0 0; font-size: var(--font-size-sm); color: var(--text-secondary);">
                        Tracking: ${request.trackingNumber}
                    </p>
                </div>
                <span class="badge badge-${request.status}">${request.status}</span>
            </div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">
                Submitted: ${new Date(request.createdAt).toLocaleDateString()}
            </p>
        </div>
    `).join('');

    requestsList.innerHTML = requestsHTML;
}

function loadTrackPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2>Track Request</h2>
            <p>Enter your tracking number to check status</p>
        </div>
        
        <div class="card">
            <div class="card-body">
                <form id="trackForm" onsubmit="handleTrackRequest(event)">
                    <div class="form-group">
                        <label for="trackingNumber">Tracking Number</label>
                        <input type="text" id="trackingNumber" placeholder="e.g., REQ-2026-001" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Track Request</button>
                </form>
            </div>
        </div>
        
        <div id="trackingResult"></div>
    `;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    // Update user info in header
    document.getElementById('userName').textContent = AppState.currentUser.fullName;
    document.getElementById('userRole').textContent = AppState.currentUser.role;

    // Show appropriate navigation
    if (AppState.currentUser.role === 'admin') {
        document.getElementById('residentNav').style.display = 'none';
        document.getElementById('adminNav').style.display = 'flex';
        navigateToPage('admin-dashboard');
    } else {
        document.getElementById('residentNav').style.display = 'flex';
        document.getElementById('adminNav').style.display = 'none';
        navigateToPage('home');
    }

    // Load notifications
    loadNotifications();
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('app').style.display = 'none';
}

function handleLogout() {
    AppState.currentUser = null;
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully', 'success');
    showLoginScreen();
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function updateUserStats() {
    const userRequests = getUserRequests();

    document.getElementById('totalRequests').textContent = userRequests.length;
    document.getElementById('pendingRequests').textContent =
        userRequests.filter(r => r.status === 'pending').length;
    document.getElementById('completedRequests').textContent =
        userRequests.filter(r => r.status === 'completed').length;
}

function getUserRequests() {
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    return allRequests.filter(r => r.userId === AppState.currentUser.id);
}

function loadRecentRequests() {
    const requests = getUserRequests().slice(0, 5);
    const container = document.getElementById('recentRequestsList');

    if (requests.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No requests yet</p>';
        return;
    }

    container.innerHTML = requests.map(req => `
        <div class="card" style="margin-bottom: var(--spacing-sm);">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${req.documentType}</strong>
                        <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">
                            ${req.trackingNumber}
                        </p>
                    </div>
                    <span class="badge badge-${req.status}">${req.status}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function loadAllRequests() {
    const requests = getUserRequests();
    const container = document.getElementById('requestsList');

    if (requests.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: var(--spacing-xl);">No requests found. Create your first request!</p>';
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Tracking #</th>
                        <th>Document Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(req => `
                        <tr>
                            <td><strong>${req.trackingNumber}</strong></td>
                            <td>${req.documentType}</td>
                            <td>${new Date(req.createdAt).toLocaleDateString()}</td>
                            <td><span class="badge badge-${req.status}">${req.status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="viewRequestDetails('${req.id}')">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ========================================
// PWA INSTALL PROMPT
// ========================================

let deferredPrompt;

function setupPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('PWA install prompt available');

        // Show install button if needed
        showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        showToast('App installed successfully!', 'success');
        deferredPrompt = null;
    });
}

function showInstallPrompt() {
    // You can show a custom install button here
    // For now, we'll just log it
    console.log('App can be installed');
}

// ========================================
// PROFILE MODAL
// ========================================

function showProfileModal() {
    const modal = createModal('Profile', `
        <form id="profileForm" onsubmit="handleProfileUpdate(event)">
            <div class="form-group">
                <label for="profileFullName">Full Name</label>
                <input type="text" id="profileFullName" value="${AppState.currentUser.fullName}" required>
            </div>
            <div class="form-group">
                <label for="profileUsername">Username</label>
                <input type="text" id="profileUsername" value="${AppState.currentUser.username}" required>
            </div>
            <div class="form-group">
                <label for="profileEmail">Email</label>
                <input type="email" id="profileEmail" value="${AppState.currentUser.email}" required>
            </div>
            <div class="form-group">
                <label for="profileAddress">Address</label>
                <input type="text" id="profileAddress" value="${AppState.currentUser.address || ''}" required>
            </div>
            <div class="form-group">
                <label>Role</label>
                <input type="text" value="${AppState.currentUser.role}" readonly style="text-transform: capitalize; background: var(--bg-secondary); cursor: not-allowed;">
            </div>
            <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-lg);">
                <button type="submit" class="btn btn-primary" style="flex: 1;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Save Changes
                </button>
                <button type="button" class="btn btn-outline" onclick="closeModal()" style="flex: 1;">Cancel</button>
            </div>
        </form>
    `);

    showModal(modal);
}

function handleProfileUpdate(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('profileFullName').value.trim();
    const username = document.getElementById('profileUsername').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const address = document.getElementById('profileAddress').value.trim();
    
    // Validate inputs
    if (!fullName || !username || !email || !address) {
        showToast('All fields are required', 'error');
        return;
    }
    
    // Check if username is already taken by another user
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const usernameTaken = allUsers.some(u => 
        u.username === username && u.id !== AppState.currentUser.id
    );
    
    if (usernameTaken) {
        showToast('Username is already taken', 'error');
        return;
    }
    
    // Update current user
    AppState.currentUser.fullName = fullName;
    AppState.currentUser.username = username;
    AppState.currentUser.email = email;
    AppState.currentUser.address = address;
    
    // Update in localStorage users array
    const userIndex = allUsers.findIndex(u => u.id === AppState.currentUser.id);
    if (userIndex !== -1) {
        allUsers[userIndex] = AppState.currentUser;
        localStorage.setItem('users', JSON.stringify(allUsers));
    }
    
    // Update current user session
    localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
    
    // Update UI
    document.getElementById('userName').textContent = fullName;
    
    // Close modal and show success
    closeModal();
    showToast('Profile updated successfully!', 'success');
}

// ========================================
// MODAL UTILITIES
// ========================================

function createModal(title, content, buttons = []) {
    return `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttons.length > 0 ? `
                    <div class="modal-footer">
                        ${buttons.map(btn => `
                            <button class="btn ${btn.class}" onclick="${btn.action === 'close' ? 'closeModal()' : btn.action}">${btn.text}</button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function showModal(modalHTML) {
    const container = document.getElementById('modalContainer');
    container.innerHTML = modalHTML;

    // Close on overlay click
    const overlay = document.getElementById('modalOverlay');
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });
}

function closeModal() {
    const container = document.getElementById('modalContainer');
    container.innerHTML = '';
}

// Make functions globally available
window.navigateToPage = navigateToPage;
window.showProfileModal = showProfileModal;
window.handleProfileUpdate = handleProfileUpdate;
window.closeModal = closeModal;
window.showModal = showModal;
window.createModal = createModal;
window.showToast = showToast;
