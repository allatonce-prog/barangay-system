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

async function initializeApp() {
    // Hide loading screen
    document.getElementById('loadingScreen').style.display = 'none';

    // Check if user is logged in with local storage
    try {
        // Check localStorage for saved session
        const savedUser = localStorage.getItem('currentUser');
        const user = savedUser ? JSON.parse(savedUser) : null;

        if (user) {
            AppState.currentUser = user;
            showApp();
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Error checking user session:', error);
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

    // New request button - setup dynamically
    setTimeout(() => {
        setupNewRequestButtons();
    }, 100);
}

// ========================================
// NEW REQUEST BUTTON SETUP
// ========================================

function setupNewRequestButtons() {
    const newRequestBtns = document.querySelectorAll('#newRequestBtn');
    newRequestBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Try multiple approaches to find the function
            if (typeof showNewRequestModal === 'function') {
                showNewRequestModal();
            } else if (window.showNewRequestModal && typeof window.showNewRequestModal === 'function') {
                window.showNewRequestModal();
            } else {
                // Use our simple modal
                showSimpleRequestModal();
            }
        });
    });
}

// ========================================
// SIMPLE REQUEST MODAL
// ========================================

function showSimpleRequestModal() {
    const modal = createModal('New Document Request', `
        <form id="simpleRequestForm" onsubmit="handleSimpleRequest(event)">
            <div class="form-group">
                <label for="documentType">Document Type *</label>
                <select id="documentType" required>
                    <option value="">Select document type</option>
                    <option value="Barangay Clearance">Barangay Clearance</option>
                    <option value="Certificate of Residency">Certificate of Residency</option>
                    <option value="Certificate of Indigency">Certificate of Indigency</option>
                    <option value="Cedula">Cedula</option>
                    <option value="Barangay ID">Barangay ID</option>
                    <option value="Other">Other</option>
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
            
            <div class="modal-footer" style="border: none; padding: var(--spacing-lg) 0 0 0;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Submit Request</button>
            </div>
        </form>
    `, []);

    showModal(modal);
}

async function handleSimpleRequest(event) {
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

    // Show loading
    showToast('Submitting request...', 'info');

    try {
        // Create request object
        const requestData = {
            trackingNumber: `REQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            userId: AppState.currentUser.uid,
            userName: AppState.currentUser.fullName,
            documentType,
            purpose,
            quantity,
            additionalInfo,
            files: [],
            timeline: [
                {
                    status: 'pending',
                    message: 'Request submitted',
                    timestamp: new Date().toISOString()
                }
            ]
        };

        // Save to local database
        const result = await DB.createRequest(requestData);

        if (result.success) {
            showToast('Request submitted successfully!', 'success');
            closeModal();

            // Refresh requests list if on requests page
            if (AppState.currentPage === 'requests') {
                displayUserRequests();
            }
        } else {
            throw new Error(result.error || 'Failed to save request');
        }
    } catch (error) {
        console.error('Request submission failed:', error);
        showToast('Failed to submit request: ' + error.message, 'error');
    }

    // Reset form
    document.getElementById('simpleRequestForm').reset();
}

// ========================================
// NAVIGATION
// ========================================

async function navigateToPage(page) {
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
    await loadPageContent(page);
}

async function loadPageContent(page) {
    const mainContent = document.querySelector('.main-content');

    // Route to appropriate page handler
    switch (page) {
        case 'home':
            await loadHomePage(mainContent);
            break;
        case 'requests':
            await loadRequestsPage(mainContent);
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
                // Try again after a short delay (script might still be loading)
                console.warn('loadAdminDashboard not ready, retrying...');
                mainContent.innerHTML = '<div class="card"><p>Loading admin dashboard...</p></div>';
                setTimeout(() => {
                    if (typeof loadAdminDashboard === 'function') {
                        loadAdminDashboard(mainContent);
                    } else {
                        console.error('loadAdminDashboard function not found after retry');
                        mainContent.innerHTML = '<div class="card"><p style="color: var(--danger-color);">Error: Admin module not loaded. Please refresh the page.</p></div>';
                    }
                }, 500);
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
        case 'admin-announcements':
            if (typeof loadAdminAnnouncementsPage === 'function') {
                loadAdminAnnouncementsPage(mainContent);
            } else {
                mainContent.innerHTML = '<div class="card"><p>Loading admin announcements...</p></div>';
                console.error('loadAdminAnnouncementsPage function not found');
            }
            break;
        default:
            await loadHomePage(mainContent);
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

async function loadHomePage(container) {
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
                    <button class="btn btn-primary btn-block" id="newRequestBtn">
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
    await updateUserStats();
    await loadRecentRequests();

    // Setup new request button
    setTimeout(() => {
        setupNewRequestButtons();
    }, 100);
}

async function loadRequestsPage(container) {
    console.log('[App] Loading requests page...');

    container.innerHTML = `
        <div class="page-header">
            <h2>My Requests</h2>
            <button class="btn btn-primary" id="newRequestBtn">
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

    await displayUserRequests();

    // Setup new request button
    setTimeout(() => {
        setupNewRequestButtons();
    }, 100);
}

async function displayUserRequests() {
    console.log('[App] Displaying user requests...');
    const requestsList = document.getElementById('requestsList');

    if (!requestsList) {
        console.error('[App] requestsList element not found');
        return;
    }

    try {
        const userRequests = await getUserRequests();
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
                    Submitted: ${formatDate(request.createdAt)}
                </p>
            </div>
        `).join('');

        requestsList.innerHTML = requestsHTML;
    } catch (error) {
        console.error('[App] Error displaying user requests:', error);
        requestsList.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-xl); color: var(--text-secondary);">
                <p>Error loading requests. Please try again.</p>
            </div>
        `;
    }
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

    // Update Avatar
    const profileImage = AppState.currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(AppState.currentUser.fullName)}&background=random`;
    const avatars = document.querySelectorAll('.user-avatar, .user-avatar-large');
    avatars.forEach(container => {
        container.innerHTML = `<img src="${profileImage}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    });

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

async function handleLogout() {
    try {
        // Clear local storage
        // Clear local storage
        localStorage.removeItem('currentUser');
        AppState.currentUser = null;

        // Stop realtime listener
        if (window.stopNotificationListener) window.stopNotificationListener();
        const result = { success: true };

        if (result.success) {
            showToast('Logged out successfully', 'success');
            showLoginScreen();
        } else {
            showToast('Logout failed', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed', 'error');
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

async function updateUserStats() {
    const userRequests = await getUserRequests();

    document.getElementById('totalRequests').textContent = userRequests.length;
    document.getElementById('pendingRequests').textContent =
        userRequests.filter(r => r.status === 'pending').length;
    document.getElementById('completedRequests').textContent =
        userRequests.filter(r => r.status === 'completed').length;
}

async function getUserRequests() {
    try {
        const result = await DB.getUserRequests(AppState.currentUser.id);
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error getting user requests:', error);
        return [];
    }
}

async function loadRecentRequests() {
    const requests = await getUserRequests();
    const recentRequests = requests.slice(0, 5);
    const container = document.getElementById('recentRequestsList');

    if (recentRequests.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No requests yet</p>';
        return;
    }

    container.innerHTML = recentRequests.map(req => `
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
    const currentImage = AppState.currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(AppState.currentUser.fullName)}&background=random`;

    const modal = createModal('Profile', `
        <form id="profileForm" onsubmit="handleProfileUpdate(event)">
            <div style="text-align: center; margin-bottom: var(--spacing-lg);">
                <div style="width: 120px; height: 120px; border-radius: 50%; background: var(--bg-tertiary); margin: 0 auto 10px auto; overflow: hidden; position: relative; border: 3px solid var(--primary-color);">
                    <img id="profilePreview" src="${currentImage}" 
                         style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <label for="profileImageInput" class="btn btn-sm btn-outline" style="cursor: pointer;">
                    Change Photo
                </label>
                <input type="file" id="profileImageInput" accept="image/*" style="display: none;" onchange="previewProfileImage(this)">
            </div>

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

// CROPPER VARIABLES
let cropperInstance = null;
window.currentCroppedBlob = null;

function previewProfileImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            showCropModal(e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}
window.previewProfileImage = previewProfileImage;

function showCropModal(imageUrl) {
    // Remove existing if any
    const existing = document.getElementById('cropModal');
    if (existing) existing.remove();

    const cropModalHtml = `
        <div id="cropModal" style="position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;">
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; width: 90%; max-width: 500px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;">
                <h3 style="color: var(--text-primary); margin: 0 0 15px 0;">Adjust Photo</h3>
                <div style="flex: 1; min-height: 300px; max-height: 50vh; background: #000; overflow: hidden; position: relative; border-radius: 8px;">
                    <img id="imageToCrop" src="${imageUrl}" style="max-width: 100%; display: block;">
                </div>
                <div style="margin-top: 15px; text-align: center; color: var(--text-secondary); font-size: 0.9em;">
                    Drag to move. Scroll to zoom.
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
                    <button type="button" class="btn btn-outline" onclick="closeCropModal()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="confirmCrop()">Set Profile Picture</button>
                </div>
            </div>
        </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = cropModalHtml;
    document.body.appendChild(div.firstElementChild);

    const image = document.getElementById('imageToCrop');
    cropperInstance = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        background: false,
        guides: true
    });
}
window.showCropModal = showCropModal;

function closeCropModal() {
    const modal = document.getElementById('cropModal');
    if (modal) modal.remove();
    if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
    }
}
window.closeCropModal = closeCropModal;

function confirmCrop() {
    if (!cropperInstance) return;

    cropperInstance.getCroppedCanvas({
        width: 400,
        height: 400,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    }).toBlob((blob) => {
        window.currentCroppedBlob = blob;

        // Update Preview
        const previewUrl = URL.createObjectURL(blob);
        document.getElementById('profilePreview').src = previewUrl;

        closeCropModal();
        showToast('Photo cropped!', 'success');
    }, 'image/jpeg', 0.9);
}
window.confirmCrop = confirmCrop;

async function handleProfileUpdate(event) {
    event.preventDefault();

    const fullName = document.getElementById('profileFullName').value.trim();
    const username = document.getElementById('profileUsername').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const address = document.getElementById('profileAddress').value.trim();
    const fileInput = document.getElementById('profileImageInput');

    // Validate inputs
    if (!fullName || !username || !email || !address) {
        showToast('All fields are required', 'error');
        return;
    }

    try {
        showToast('Saving profile...', 'info');

        let profileImageUrl = AppState.currentUser.profileImage;

        // Upload image if selected
        // Check for cropped blob first
        if (window.currentCroppedBlob) {
            try {
                // Upload the blob
                const file = new File([window.currentCroppedBlob], "profile_cropped.jpg", { type: "image/jpeg" });
                profileImageUrl = await uploadToCloudinary(file);
            } catch (uploadError) {
                console.error('Upload cropped failed:', uploadError);
                showToast('Failed to upload image', 'warning');
                return;
            }
        }
        // Fallback to original file input if no crop happened
        else if (fileInput.files.length > 0) {
            try {
                profileImageUrl = await uploadToCloudinary(fileInput.files[0]);
            } catch (uploadError) {
                console.error('Upload failed:', uploadError);
                showToast('Failed to upload image', 'warning');
                return;
            }
        }

        const updates = {
            fullName,
            username,
            email,
            address,
            profileImage: profileImageUrl,
            updatedAt: new Date().toISOString()
        };

        // Update in Firebase
        const collection = AppState.currentUser.role === 'admin' ? 'ADMIN' : 'RESIDENTS';

        await DB.updateData(collection, AppState.currentUser.id, updates);

        // Update local state
        AppState.currentUser = { ...AppState.currentUser, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));

        // Update UI Manually
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = fullName;

        if (profileImageUrl) {
            const avatars = document.querySelectorAll('.user-avatar, .user-avatar-large');
            avatars.forEach(container => {
                container.innerHTML = `<img src="${profileImageUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            });
        }

        showToast('Profile updated successfully', 'success');
        closeModal();

    } catch (error) {
        console.error('Profile update error:', error);

        // Fallback for collection mismatch
        if (error.message && error.message.includes('No document to update')) {
            try {
                const otherCollection = AppState.currentUser.role === 'admin' ? 'RESIDENTS' : 'ADMIN';
                console.log(`Retrying update in ${otherCollection}...`);
                await DB.updateData(otherCollection, AppState.currentUser.id, updates);

                // If successful:
                AppState.currentUser = { ...AppState.currentUser, ...updates };
                localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));

                // Update UI
                const userNameEl = document.getElementById('userName');
                if (userNameEl) userNameEl.textContent = fullName;
                if (profileImageUrl) {
                    const avatars = document.querySelectorAll('.user-avatar, .user-avatar-large');
                    avatars.forEach(container => {
                        container.innerHTML = `<img src="${profileImageUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                    });
                }

                showToast('Profile updated successfully', 'success');
                closeModal();
                return;
            } catch (retryError) {
                console.error('Retry failed:', retryError);
            }
        }

        showToast('Failed to update profile: ' + error.message, 'error');
    }
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
window.setupNewRequestButtons = setupNewRequestButtons;
window.showSimpleRequestModal = showSimpleRequestModal;
window.handleSimpleRequest = handleSimpleRequest;
