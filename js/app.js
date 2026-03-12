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

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (userMenu && !userMenu.contains(e.target) && e.target !== userMenuBtn && !userMenuBtn.contains(e.target)) {
            userMenu.style.display = 'none';
        }

        const navMenuDropdown = document.getElementById('navMenuDropdown');
        const logoBtn = document.getElementById('logoBtn');
        if (navMenuDropdown && !navMenuDropdown.contains(e.target) && e.target !== logoBtn && (!logoBtn || !logoBtn.contains(e.target))) {
            navMenuDropdown.style.display = 'none';
        }
    });

    // Logo navigation toggle
    const logoBtn = document.getElementById('logoBtn');
    if (logoBtn) {
        logoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const navMenuDropdown = document.getElementById('navMenuDropdown');
            if (navMenuDropdown) {
                navMenuDropdown.style.display = navMenuDropdown.style.display === 'none' ? 'block' : 'none';

                // Close user menu if it's open
                if (userMenu && userMenu.style.display === 'block') {
                    userMenu.style.display = 'none';
                }
            }
        });
    }

    // Logo dropdown navigation items
    const navDropdownItems = document.querySelectorAll('.nav-dropdown-item');
    navDropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            navigateToPage(page);

            const navMenuDropdown = document.getElementById('navMenuDropdown');
            if (navMenuDropdown) {
                navMenuDropdown.style.display = 'none';
            }
        });
    });

    // Profile button
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            showProfileModal();
            document.getElementById('userMenu').style.display = 'none';
        });
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showSettingsModal();
            document.getElementById('userMenu').style.display = 'none';
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Digital ID button
    const digitalIdBtn = document.getElementById('digitalIdBtn');
    if (digitalIdBtn) {
        digitalIdBtn.addEventListener('click', () => {
            showDigitalIdModal();
            document.getElementById('userMenu').style.display = 'none';
        });
    }

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
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

    // Navigation Scan Button
    const navScanBtn = document.getElementById('navScanBtn');
    if (navScanBtn) {
        navScanBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showScannerModal();
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
    if (!page) return;
    console.log('Navigating to:', page);

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const itemPage = item.getAttribute('data-page');
        if (itemPage && itemPage === page) {
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
            <h2>${getDigitalGreeting(AppState.currentUser?.fullName || 'Resident')}</h2>
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

        const residentNavDropdown = document.getElementById('residentNavDropdown');
        const adminNavDropdown = document.getElementById('adminNavDropdown');
        if (residentNavDropdown) residentNavDropdown.style.display = 'none';
        if (adminNavDropdown) adminNavDropdown.style.display = 'block';

        navigateToPage('admin-dashboard');
    } else {
        document.getElementById('residentNav').style.display = 'flex';
        document.getElementById('adminNav').style.display = 'none';

        const residentNavDropdown = document.getElementById('residentNavDropdown');
        const adminNavDropdown = document.getElementById('adminNavDropdown');
        if (residentNavDropdown) residentNavDropdown.style.display = 'block';
        if (adminNavDropdown) adminNavDropdown.style.display = 'none';

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

// PWA Install logic moved to pwa-install.js

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

            <div style="display: flex; gap: 15px;">
                <div class="form-group" style="flex: 1;">
                    <label for="profileFirstName">First Name</label>
                    <input type="text" id="profileFirstName" value="${AppState.currentUser.firstName || ''}" required>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label for="profileLastName">Last Name</label>
                    <input type="text" id="profileLastName" value="${AppState.currentUser.lastName || ''}" required>
                </div>
            </div>
            <div class="form-group">
                <label for="profilePhone">Phone No.</label>
                <input type="tel" id="profilePhone" value="${AppState.currentUser.phone || ''}" required>
            </div>
            <div class="form-group">
                <label for="profileDOB">Date of birth</label>
                <input type="date" id="profileDOB" value="${AppState.currentUser.dob || ''}" required>
            </div>
            <div class="form-group">
                <label for="profileGender">Gender</label>
                <select id="profileGender" required>
                    <option value="Male" ${AppState.currentUser.gender === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${AppState.currentUser.gender === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Other" ${AppState.currentUser.gender === 'Other' ? 'selected' : ''}>Other</option>
                </select>
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

// ========================================
// SETTINGS MODAL
// ========================================

function showSettingsModal() {
    const modal = createModal('Settings', `
        <div style="text-align: center; padding: var(--spacing-lg);">
            <div style="width: 80px; height: 80px; margin: 0 auto var(--spacing-lg); background: var(--bg-tertiary); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </div>
            <h3 style="margin-bottom: var(--spacing-sm);">System Reset</h3>
            <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xl);">Clear browser cache and reload the application to get the latest updates and fix sync issues.</p>
            
            <button class="btn btn-primary btn-block" onclick="handleHardReset()" style="margin-bottom: var(--spacing-md); background: var(--primary-gradient); color: white;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Clear Cache & Hard Reset
            </button>
        </div>
    `, [
        { text: 'Close', class: 'btn-outline', action: 'close' }
    ]);

    showModal(modal);
}

function handleHardReset() {
    if (confirm('This will clear all cached files and reload the app. Continue?')) {
        showToast('Resetting system...', 'info');
        if (typeof forceAppUpdate === 'function') {
            forceAppUpdate();
        } else if (window.forceAppUpdate) {
            window.forceAppUpdate();
        } else {
            // Unregister service workers and clear caches
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                }).then(() => {
                    if (window.caches) {
                        caches.keys().then(names => {
                            for (let name of names) caches.delete(name);
                        });
                    }
                    window.location.reload(true);
                });
            } else {
                window.location.reload(true);
            }
        }
    }
}

window.showSettingsModal = showSettingsModal;
window.handleHardReset = handleHardReset;

// ========================================
// DIGITAL ID MODAL
// ========================================

function showDigitalIdModal() {
    const user = AppState.currentUser;
    
    // Check if user has an active digital ID
    if (!user.digitalIdStatus || user.digitalIdStatus === 'none') {
        showDigitalIdApplication();
        return;
    }

    const idData = user.digitalIdData || {};
    const profileImg = idData.idPhoto || user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;
    const idNumber = idData.idNumber || `BG1-${user.id.substring(0, 8).toUpperCase()}`;
    const fullName = idData.fullName || user.fullName;
    const role = idData.role || (user.role === 'admin' ? 'OFFICIAL' : 'RESIDENT');

    const modal = createModal('Digital Barangay ID', `
        <div class="id-card-container">
            <div class="id-card-inner" id="idCard">
                <!-- Front of Card -->
                <div class="id-card-front">
                    <div class="id-card-logo">
                        <img src="logo/BARANGAY.png" alt="Logo">
                        <span>PANTUKAN</span>
                    </div>
                    
                    <div class="id-card-content">
                        <img src="${profileImg}" class="id-photo" alt="Photo">
                        <div class="id-details">
                            <h2>${fullName}</h2>
                            <p>${idNumber}</p>
                            <div class="id-tag">${role}</div>
                        </div>
                    </div>
                    
                    <div style="font-size: 0.55rem; opacity: 0.7; text-align: right; letter-spacing: 0.5px;">
                        VALID UNTIL: ${idData.expiryDate || '12/2026'}
                    </div>
                </div>

                <!-- Back of Card -->
                <div class="id-card-back">
                    <div class="qr-view-container" id="qrCodeContainer"></div>
                    <p class="qr-label">Scan to verify residency</p>
                    <div style="font-size: 0.5rem; text-align: center; opacity: 0.6; padding: 0 1rem; margin-top: 5px;">
                        This digital ID is a valid proof of residency. Present for verification.
                    </div>
                </div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 1rem; color: var(--text-secondary); font-size: 0.8rem;">
            <p>Tap card to flip</p>
            <div style="display: flex; gap: 10px; margin-top: 1rem;">
                <button class="btn btn-outline" style="flex: 1;" onclick="showDigitalIdApplication()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Re-apply
                </button>
                <button class="btn btn-primary" style="flex: 1;" onclick="downloadDigitalId()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Save
                </button>
            </div>
        </div>
    `, []);

    showModal(modal);

    // Add flip logic
    const card = document.getElementById('idCard');
    if (card) {
        card.addEventListener('click', () => {
            card.classList.toggle('is-flipped');
        });
    }

    // Generate QR Code
    setTimeout(() => {
        const qrContainer = document.getElementById('qrCodeContainer');
        if (qrContainer) {
            new QRCode(qrContainer, {
                text: JSON.stringify({
                    id: user.id,
                    type: 'verification',
                    version: '1.0'
                }),
                width: 110,
                height: 110,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        }
    }, 100);
}


async function downloadDigitalId() {
    const cardFront = document.querySelector('.id-card-front');
    if (!cardFront) {
        showToast('ID card not found!', 'error');
        return;
    }

    try {
        showToast('Preparing ID for download...', 'info');

        // Snapshot the front of the card with optimizations
        const canvas = await html2canvas(cardFront, {
            scale: 3, // Ultra-high quality
            useCORS: true,
            allowTaint: false,
            backgroundColor: null,
            logging: false,
            onclone: (clonedDoc) => {
                // Fix: html2canvas does not support backdrop-filter
                const clonedCard = clonedDoc.querySelector('.id-card-front');
                if (clonedCard) {
                    clonedCard.style.backdropFilter = 'none';
                    clonedCard.style.webkitBackdropFilter = 'none';
                    // Re-apply a solid fallback that looks identical
                    clonedCard.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)';
                }
            }
        });

        const image = canvas.toDataURL("image/png", 1.0);
        const filename = `BrgyONE_ID_${AppState.currentUser.fullName.replace(/\s+/g, '_')}.png`;

        // Check if we are on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0);

        if (isMobile && navigator.share && navigator.canShare) {
            try {
                const response = await fetch(image);
                const blob = await response.blob();
                const file = new File([blob], filename, { type: 'image/png' });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Barangay Digital ID',
                        text: 'My official Digital ID from BrgyONE.'
                    });
                    showToast('Shared successfully!', 'success');
                    return;
                }
            } catch (shareErr) {
                console.log('Mobile share failed, falling back to direct download');
            }
        }

        // DIRECT AUTOMATIC DOWNLOAD (Ideal for PC)
        const link = document.createElement('a');
        link.href = image;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            showToast('ID saved to your Downloads!', 'success');
        }, 100);

    } catch (err) {
        console.error('Error saving ID:', err);
        showToast('Failed to generate ID image.', 'error');
    }
}

window.showDigitalIdModal = showDigitalIdModal;

window.downloadDigitalId = downloadDigitalId;

// ========================================
// QR SCANNER & VERIFICATION (GLOBAL)
// ========================================

let html5QrScanner = null;

function showScannerModal() {
    const modal = createModal('Verify Digital ID', `
        <div class="scanner-modal-container">
            <div class="scanner-tabs">
                <button class="scanner-tab active" onclick="switchScannerTab(this, 'scan')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <span>Scan</span>
                </button>
                <button class="scanner-tab" onclick="switchScannerTab(this, 'upload')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>Upload</span>
                </button>
                <button class="scanner-tab" onclick="switchScannerTab(this, 'myqr')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
                    <span>My QR</span>
                </button>
            </div>

            <div id="scanTabContent" class="tab-content active">
                <p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.85rem;">Position the resident's QR code in the frame</p>
                <div id="reader" style="width: 100%; max-width: 320px; margin: 0 auto; border-radius: 1.25rem; overflow: hidden; border: 2px solid var(--primary-color); background: #000;"></div>
            </div>

            <div id="uploadTabContent" class="tab-content">
                <div class="upload-area" onclick="document.getElementById('qrFileInput').click()">
                    <div class="upload-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                    </div>
                    <p style="margin-top: 1rem; font-weight: 700; color: var(--text-primary);">Choose from Gallery</p>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">Select an image with a QR code</p>
                    <input type="file" id="qrFileInput" accept="image/*" style="display: none;" onchange="handleQrFileUpload(this)">
                </div>
            </div>

            <div id="myqrTabContent" class="tab-content">
                <div class="my-qr-tab-content">
                    <div class="my-qr-container">
                        <div id="myQrCodeDisplay"></div>
                    </div>
                    <div class="my-qr-info">
                        <h4 id="myQrName">Member Name</h4>
                        <p id="myQrId">ID: BRGY-001</p>
                    </div>
                </div>
            </div>

            <div id="scannerFeedback" style="margin-top: 1rem; font-weight: 500; font-size: 0.85rem; min-height: 20px;"></div>
            <button class="btn btn-outline btn-block" onclick="stopScannerAndClose()" style="margin-top: 1.5rem; border-radius: 1rem;">Cancel</button>
        </div>
    `, []);

    showModal(modal);

    setTimeout(() => {
        startQrCamera();
    }, 400);
}

function generateMyQrCode() {
    const user = AppState.currentUser;
    if (!user) return;

    const qrContainer = document.getElementById('myQrCodeDisplay');
    const nameDisplay = document.getElementById('myQrName');
    const idDisplay = document.getElementById('myQrId');

    if (qrContainer) qrContainer.innerHTML = '';
    if (nameDisplay) nameDisplay.textContent = user.fullName;
    if (idDisplay) idDisplay.textContent = `ID: BG1-${user.id.substring(0, 8).toUpperCase()}`;

    // Verification data for the QR code
    const verificationData = JSON.stringify({
        type: 'verification',
        id: user.id
    });

    if (qrContainer) {
        new QRCode(qrContainer, {
            text: verificationData,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

function startQrCamera() {
    const readerDiv = document.getElementById('reader');
    if (!readerDiv) return;

    // Reset previous instance if any
    if (html5QrScanner) {
        try {
            html5QrScanner.clear();
        } catch (e) { }
        html5QrScanner = null;
    }

    html5QrScanner = new Html5Qrcode("reader");
    const config = { fps: 15, qrbox: { width: 220, height: 220 } };

    html5QrScanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
            handleScanResult(decodedText);
        },
        (errorMessage) => { }
    ).catch(err => {
        console.error("Scanner error:", err);
        const feedback = document.getElementById('scannerFeedback');
        if (feedback) feedback.innerHTML = `<span style="color: var(--error-color);">Camera failed. You can still use the <b>Upload QR</b> option.</span>`;
    });
}

async function switchScannerTab(btn, tab) {
    console.log('Switching to scanner tab:', tab);

    // Stop camera if switching to upload or if already running
    if (html5QrScanner) {
        try {
            if (html5QrScanner.isScanning) {
                await html5QrScanner.stop();
            }
            html5QrScanner.clear();
            html5QrScanner = null;
        } catch (e) {
            console.log('Error stopping scanner:', e);
            html5QrScanner = null;
        }
    }

    if (tab === 'scan') {
        startQrCamera();
    } else if (tab === 'myqr') {
        generateMyQrCode();
    }

    // Toggle Tab Buttons
    document.querySelectorAll('.scanner-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Toggle Content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const content = document.getElementById(`${tab}TabContent`);
    if (content) content.classList.add('active');

    // Clear feedback
    const feedback = document.getElementById('scannerFeedback');
    if (feedback) feedback.innerHTML = '';
}

async function handleQrFileUpload(input) {
    if (!input.files || !input.files[0]) return;
    const feedback = document.getElementById('scannerFeedback');
    feedback.innerHTML = '<span style="color: var(--primary-color);">Reading QR...</span>';

    try {
        const tempReader = new Html5Qrcode("reader");
        const result = await tempReader.scanImage(input.files[0], true);
        handleScanResult(result);
    } catch (err) {
        feedback.innerHTML = '<span style="color: var(--error-color);">No QR code detected in this photo.</span>';
    }
}

async function stopScannerAndClose() {
    if (html5QrScanner) {
        try {
            if (html5QrScanner.isScanning) {
                await html5QrScanner.stop();
            }
            html5QrScanner.clear();
        } catch (e) {
            console.log('Final stop error:', e);
        }
        html5QrScanner = null;
    }
    closeModal();
}

async function handleScanResult(decodedText) {
    try {
        const data = JSON.parse(decodedText);
        if (data.type === 'verification' && data.id) {
            if (html5QrScanner) {
                await html5QrScanner.stop();
                html5QrScanner = null;
            }
            closeModal();
            showToast('Verifying ID...', 'success');
            setTimeout(() => {
                verifyResidentData(data.id);
            }, 300);
        } else {
            const feedback = document.getElementById('scannerFeedback');
            if (feedback) feedback.innerHTML = `<span style="color: var(--warning-color);">Invalid ID format</span>`;
        }
    } catch (e) {
        const feedback = document.getElementById('scannerFeedback');
        if (feedback) feedback.innerHTML = `<span style="color: var(--error-color);">Invalid QR code</span>`;
    }
}

async function verifyResidentData(userId) {
    try {
        const result = await DB.getData('RESIDENTS', userId);
        if (!result.success || !result.data) {
            showToast('ID not found in our records!', 'error');
            return;
        }

        const res = result.data;
        const profileImg = res.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.fullName)}&background=random`;

        // Fetch activity if admin, otherwise hide sensitive info
        const isAdmin = AppState.currentUser?.role === 'admin';
        let userRequests = [];
        if (isAdmin) {
            const requestsResult = await DB.getAllData('REQUESTS');
            userRequests = requestsResult.success ? requestsResult.data.filter(r => r.userId === userId) : [];
        }

        const modal = createModal('Verified BrgyONE Resident', `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="width: 110px; height: 110px; border-radius: 50%; margin: 0 auto 15px; overflow: hidden; border: 4px solid var(--success-color); box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);">
                    <img src="${profileImg}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <h2 style="margin: 0; color: var(--text-primary); font-size: 1.5rem;">${res.fullName}</h2>
                <div style="display: flex; gap: 6px; justify-content: center; margin-top: 10px;">
                    <span class="badge badge-success" style="padding: 6px 12px; font-size: 0.75rem;">Verified Member</span>
                </div>
            </div>

            <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 1.25rem; margin-bottom: 1.25rem; border: 1px solid var(--border-color);">
                <div style="display: grid; grid-template-columns: 1fr; gap: 0.75rem; text-align: left; font-size: 0.9rem;">
                    <div>
                        <p style="color: var(--text-secondary); margin-bottom: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Resident ID</p>
                        <p style="font-weight: 700; margin: 0; color: var(--primary-color); font-family: monospace;">BG1-${userId.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-secondary); margin-bottom: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Status</p>
                        <p style="font-weight: 600; margin: 0;">Active Member</p>
                    </div>
                </div>
            </div>

            ${isAdmin ? `
                <div style="text-align: left;">
                    <h4 style="margin-bottom: 0.75rem; font-size: 0.9rem; font-weight: 700;">Resident Activity</h4>
                    <div style="max-height: 180px; overflow-y: auto;">
                        ${userRequests.length === 0 ? '<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 1rem;">No history found.</p>' :
                    userRequests.slice(0, 5).sort((a, b) => b.createdAt - a.createdAt).map(req => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                    <div>
                                        <p style="font-size: 0.85rem; font-weight: 600; margin: 0;">${req.documentType}</p>
                                        <p style="font-size: 0.7rem; color: var(--text-secondary); margin: 0;">${new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span class="badge badge-${req.status}" style="font-size: 0.65rem;">${req.status}</span>
                                </div>
                            `).join('')
                }
                    </div>
                </div>
            ` : `
                <div style="text-align: center; padding: 0.5rem; background: rgba(16, 185, 129, 0.1); border-radius: 0.75rem; border: 1px dashed var(--success-color);">
                    <p style="color: var(--success-color); font-size: 0.8rem; font-weight: 600; margin: 0;">Community Verified Identity</p>
                </div>
            `}

            <button class="btn btn-primary btn-block" onclick="closeModal()" style="margin-top: 1.5rem;">Finish Verification</button>
        `, []);

        showModal(modal);
    } catch (error) {
        console.error('Verification error:', error);
        showToast('Error verifying ID.', 'error');
    }
}

window.showScannerModal = showScannerModal;
window.stopScannerAndClose = stopScannerAndClose;
window.handleScanResult = handleScanResult;
window.verifyResidentData = verifyResidentData;

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

    const firstName = document.getElementById('profileFirstName').value.trim();
    const lastName = document.getElementById('profileLastName').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const dob = document.getElementById('profileDOB').value.trim();
    const gender = document.getElementById('profileGender').value;
    const username = document.getElementById('profileUsername').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const address = document.getElementById('profileAddress').value.trim();
    const fileInput = document.getElementById('profileImageInput');

    // Validate inputs
    if (!firstName || !lastName || !username || !email || !address) {
        showToast('All fields are required', 'error');
        return;
    }

    const fullName = `${firstName} ${lastName}`;

    try {
        showToast('Saving profile...', 'info');

        let profileImageUrl = AppState.currentUser.profileImage;

        // Upload image if selected
        if (window.currentCroppedBlob) {
            try {
                const file = new File([window.currentCroppedBlob], "profile_cropped.jpg", { type: "image/jpeg" });
                profileImageUrl = await uploadToCloudinary(file);
            } catch (uploadError) {
                console.error('Upload cropped failed:', uploadError);
                showToast('Failed to upload image', 'warning');
                return;
            }
        }
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
            firstName,
            lastName,
            fullName,
            phone,
            dob,
            gender,
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
window.showSimpleRequestModal = showSimpleRequestModal;
window.handleSimpleRequest = handleSimpleRequest;

// ========================================
// DIGITAL ID APPLICATION FLOW
// ========================================

let facialScanStream = null;
let capturedScanBlob = null;

function showDigitalIdApplication() {
    const user = AppState.currentUser;
    const modal = createModal('Apply for Digital ID', `
        <div style="margin-bottom: 20px;">
            <div class="id-app-section">
                <div class="id-app-section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    Step 1: Facial Scan
                </div>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 15px;">Position your face inside the frame for the biometric ID photo.</p>
                
                <div class="facial-scan-container" id="scanContainer">
                    <div class="camera-preview-wrapper" id="scanWrapper">
                        <video id="facialScanVideo" autoplay playsinline></video>
                        <div class="facial-overlay" id="facialOverlay"></div>
                        <div class="scan-line" id="scanLine"></div>
                        <div class="scan-status-indicator" id="scanStatus">
                            <div class="status-dot" id="statusDot"></div>
                            <span id="statusText">Detecting Face...</span>
                        </div>
                        <img id="scanPreview" class="captured-preview">
                    </div>
                </div>

                <div class="scan-controls">
                    <button id="captureBtn" class="scan-capture-btn" onclick="initiateFacialScanSequence()" title="Start Scan"></button>
                    <button id="retakeBtn" class="btn btn-outline btn-sm" onclick="retakeFacialScan()" style="display: none;">Retake Scan</button>
                </div>
            </div>

            <div class="id-app-section">
                <div class="id-app-section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Step 2: Verify Information
                </div>
                <form id="idAppForm" onsubmit="handleDigitalIdApplication(event)">
                    <div style="display: flex; gap: 10px;">
                        <div class="form-group" style="flex: 1;">
                            <label>First Name</label>
                            <input type="text" id="idFirstName" value="${user.firstName || ''}" required placeholder="First Name">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Last Name</label>
                            <input type="text" id="idLastName" value="${user.lastName || ''}" required placeholder="Last Name">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <div class="form-group" style="flex: 1;">
                            <label>Birthday</label>
                            <input type="date" id="idDob" value="${user.dob || ''}" required>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Gender</label>
                            <select id="idGender" required>
                                <option value="Male" ${user.gender === 'Male' ? 'selected' : ''}>Male</option>
                                <option value="Female" ${user.gender === 'Female' ? 'selected' : ''}>Female</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Barangay</label>
                        <input type="text" id="idBarangay" value="PANTUKAN" required placeholder="Barangay Name">
                    </div>

                    <div class="form-group">
                        <label>Purok , Street</label>
                        <input type="text" id="idPurokStreet" value="${user.address || ''}" required placeholder="Purok #, Street Name">
                    </div>

                    <button type="submit" class="btn btn-primary btn-block" style="margin-top: 15px;" id="submitIdAppBtn">
                        Generate Digital ID
                    </button>
                </form>
            </div>
        </div>
    `, [
        { text: 'Cancel', class: 'btn-outline', action: 'stopFacialScanAndClose' }
    ]);

    showModal(modal);
    startFacialScanStream();
}

async function startFacialScanStream() {
    const video = document.getElementById('facialScanVideo');
    if (!video) return;

    try {
        facialScanStream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'user',
                width: { ideal: 480 },
                height: { ideal: 640 }
            }
        });
        video.srcObject = facialScanStream;
    } catch (err) {
        console.error('Camera access denied:', err);
        showToast('Camera access is required for facial scan', 'error');
    }
}

async function initiateFacialScanSequence() {
    const scanContainer = document.getElementById('scanContainer');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    const captureBtn = document.getElementById('captureBtn');

    if (captureBtn.disabled) return;
    captureBtn.disabled = true;
    captureBtn.style.opacity = '0.5';

    // Start scanning animation
    scanContainer.classList.add('scanning');
    
    // Step 1: Simulated Face Alignment
    statusText.textContent = "ALIGHNING FACE...";
    await new Promise(r => setTimeout(r, 1200));
    
    statusDot.classList.add('active');
    statusText.textContent = "FACE DETECTED";
    statusText.style.color = "#22c55e";
    
    // Step 2: Simulated Scanning/Biometric Analysis
    await new Promise(r => setTimeout(r, 800));
    statusText.textContent = "EXTRACTING BIOMETRICS...";
    
    await new Promise(r => setTimeout(r, 1500));
    
    // Step 3: Automated Capture
    statusText.textContent = "CAPTURING...";
    takeFacialSnapshot();
}

function takeFacialSnapshot() {
    const video = document.getElementById('facialScanVideo');
    const preview = document.getElementById('scanPreview');
    const overlay = document.getElementById('facialOverlay');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const scanContainer = document.getElementById('scanContainer');
    const statusIndicator = document.getElementById('scanStatus');

    if (!video || !video.srcObject) return;

    // Create a canvas to draw the snapshot
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Mirror the draw
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
        capturedScanBlob = blob;
        const url = URL.createObjectURL(blob);
        
        preview.src = url;
        preview.style.display = 'block';
        video.style.display = 'none';
        overlay.style.display = 'none';
        statusIndicator.style.display = 'none';
        scanContainer.classList.remove('scanning');
        
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'block';
        
        showToast('Identification biometric stored!', 'success');
    }, 'image/jpeg', 0.9);
}

function retakeFacialScan() {
    const video = document.getElementById('facialScanVideo');
    const preview = document.getElementById('scanPreview');
    const overlay = document.getElementById('facialOverlay');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const statusIndicator = document.getElementById('scanStatus');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');

    capturedScanBlob = null;
    preview.style.display = 'none';
    video.style.display = 'block';
    overlay.style.display = 'block';
    statusIndicator.style.display = 'flex';
    statusText.textContent = "Detecting Face...";
    statusText.style.color = "white";
    statusDot.classList.remove('active');
    
    captureBtn.style.display = 'flex';
    captureBtn.disabled = false;
    captureBtn.style.opacity = '1';
    retakeBtn.style.display = 'none';
}

function stopFacialScanAndClose() {
    if (facialScanStream) {
        facialScanStream.getTracks().forEach(track => track.stop());
        facialScanStream = null;
    }
    closeModal();
}

async function handleDigitalIdApplication(event) {
    event.preventDefault();

    if (!capturedScanBlob) {
        showToast('Please take a facial scan first', 'warning');
        return;
    }

    const submitBtn = document.getElementById('submitIdAppBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
        showToast('Uploading biometric data...', 'info');
        
        // Upload scan to Cloudinary
        const scanFile = new File([capturedScanBlob], `biometric_id_${AppState.currentUser.id}.jpg`, { type: 'image/jpeg' });
        const scanUrl = await uploadToCloudinary(scanFile);

        const firstName = document.getElementById('idFirstName').value.trim();
        const lastName = document.getElementById('idLastName').value.trim();
        const barangay = document.getElementById('idBarangay').value.trim();
        const purokStreet = document.getElementById('idPurokStreet').value.trim();

        const idData = {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            barangay,
            purokStreet,
            address: `${purokStreet}, ${barangay}`,
            gender: document.getElementById('idGender').value,
            dob: document.getElementById('idDob').value,
            idPhoto: scanUrl,
            idNumber: `BG1-${AppState.currentUser.id.substring(0, 8).toUpperCase()}`,
            expiryDate: '12/2026',
            appliedAt: new Date().toISOString()
        };

        const updates = {
            digitalIdStatus: 'active',
            digitalIdData: idData
        };

        // Update in DB
        const collection = AppState.currentUser.role === 'admin' ? 'ADMIN' : 'RESIDENTS';
        await DB.updateData(collection, AppState.currentUser.id, updates);

        // Update local state
        AppState.currentUser = { ...AppState.currentUser, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));

        showToast('Digital ID generated successfully!', 'success');
        
        stopFacialScanAndClose();
        
        // Finalize by showing the ID
        setTimeout(() => {
            showDigitalIdModal();
        }, 500);

    } catch (error) {
        console.error('ID Application Error:', error);
        showToast('Failed to apply for ID', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

window.showDigitalIdApplication = showDigitalIdApplication;
window.initiateFacialScanSequence = initiateFacialScanSequence;
window.takeFacialSnapshot = takeFacialSnapshot;
window.retakeFacialScan = retakeFacialScan;
window.stopFacialScanAndClose = stopFacialScanAndClose;
window.handleDigitalIdApplication = handleDigitalIdApplication;
window.setupNewRequestButtons = setupNewRequestButtons;

