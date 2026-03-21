// ========================================
// NOTIFICATIONS MODULE (FIRESTORE REALTIME)
// ========================================

let unsubscribeNotifications = null;

// Start listening to notifications
function startNotificationListener() {
    if (!AppState.currentUser) return;

    // Stop existing listener if any
    stopNotificationListener();

    const userId = AppState.currentUser.id;
    const isAdmin = AppState.currentUser.role === 'admin';

    // Target IDs: User's own ID + 'role:admin' if they are admin
    const targetIds = [userId];
    if (isAdmin) {
        targetIds.push('role:admin');
        targetIds.push('user-admin');
    }

    console.log('[Notifications] Starting listener for:', targetIds);

    const db = firebase.firestore();

    // Subscribe
    // We removed orderBy('createdAt') to avoid index requirements error. We sort client-side.
    unsubscribeNotifications = db.collection('NOTIFICATIONS')
        .where('userId', 'in', targetIds)
        .limit(50)
        .onSnapshot((snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Safety check for date handling
                createdAt: doc.data().createdAt ?
                    (doc.data().createdAt.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt))
                    : new Date()
            }));

            // Client-side sort
            notifications.sort((a, b) => b.createdAt - a.createdAt);

            AppState.notifications = notifications;
            updateNotificationBadge();

            // If the notifications modal is currently open, refresh it
            const listContainer = document.getElementById('notificationsListContainer');
            if (listContainer) {
                renderNotificationsList(listContainer);
            }

        }, (error) => {
            console.error('[Notifications] Listener error:', error);
        });
}

function stopNotificationListener() {
    if (unsubscribeNotifications) {
        unsubscribeNotifications();
        unsubscribeNotifications = null;
    }
}

function updateNotificationBadge() {
    if (!AppState.notifications) return;

    const unreadCount = AppState.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');

    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'block';

            // Add pulse effect momentarily
            badge.style.animation = 'none';
            badge.offsetHeight; /* trigger reflow */
            badge.style.animation = 'pulse 2s infinite';
        } else {
            badge.style.display = 'none';
        }
    }
}

function showNotifications() {
    if (!AppState.notifications) {
        startNotificationListener(); // Try to start if not running
        return;
    }

    // We render the container first
    const modal = createModal('Notifications', `
        <div id="notificationsListContainer" style="max-height: 60vh; overflow-y: auto;">
            <!-- Content injected via JS -->
        </div>
        <div id="notificationsActions" style="padding: var(--spacing-md); border-top: 1px solid var(--border-color); text-align: center; display: none;">
            <button class="btn btn-sm btn-outline" onclick="markAllAsRead()">Mark all as read</button>
        </div>
    `, [
        { text: 'Close', class: 'btn-outline', action: 'close' }
    ]);

    showModal(modal);

    // Now render content
    const container = document.getElementById('notificationsListContainer');
    if (container) renderNotificationsList(container);
}

function renderNotificationsList(container) {
    const notifications = AppState.notifications || [];

    if (notifications.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: var(--spacing-xl); color: var(--text-secondary);">No notifications</div>';
        const actions = document.getElementById('notificationsActions');
        if (actions) actions.style.display = 'none';
        return;
    }

    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? 'read' : 'unread'}" 
             onclick="handleNotificationClick('${notif.id}', '${notif.requestId}')"
             style="padding: var(--spacing-md); border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background var(--transition-fast); ${!notif.read ? 'background: rgba(37, 99, 235, 0.05);' : ''}">
            <div style="display: flex; align-items: start; gap: var(--spacing-md);">
                <div style="width: 40px; height: 40px; border-radius: var(--radius-full); background: ${getNotificationColor(notif.type)}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${getNotificationIcon(notif.type)}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                        <h4 style="margin: 0; font-size: var(--font-size-base); font-weight: 600; color: var(--text-primary);">
                            ${notif.title}
                        </h4>
                        ${!notif.read ? '<div style="width: 8px; height: 8px; border-radius: var(--radius-full); background: var(--primary-color);"></div>' : ''}
                    </div>
                    <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${notif.message}
                    </p>
                    <p style="margin: var(--spacing-xs) 0 0 0; font-size: var(--font-size-xs); color: var(--text-light);">
                        ${formatNotificationTime(notif.createdAt)}
                    </p>
                </div>
            </div>
        </div>
    `).join('');

    // Update actions visibility
    const hasUnread = notifications.some(n => !n.read);
    const actions = document.getElementById('notificationsActions');
    if (actions) actions.style.display = hasUnread ? 'block' : 'none';
}

async function handleNotificationClick(notificationId, requestId) {
    // 1. Mark as read in Firestore
    try {
        await DB.updateData('NOTIFICATIONS', notificationId, { read: true });

        // Optimistic update
        const notif = AppState.notifications.find(n => n.id === notificationId);
        if (notif) notif.read = true;
        updateNotificationBadge();

        // Refresh list if open
        const container = document.getElementById('notificationsListContainer');
        if (container) renderNotificationsList(container);

    } catch (e) {
        console.error('Error marking read:', e);
    }

    closeModal();

    // 2. Navigate
    if (requestId && requestId !== 'null' && requestId !== 'undefined') {
        const isAdmin = AppState.currentUser.role === 'admin';

        if (isAdmin) {
            // Admin: always use viewAdminRequestDetails (it reads ALL requests)
            // viewRequestDetails is a resident function — it only finds the user's OWN requests
            navigateToPage('admin-requests');
            setTimeout(() => {
                if (window.viewAdminRequestDetails) {
                    window.viewAdminRequestDetails(requestId);
                }
            }, 700); // slightly longer timeout to let admin-requests page finish loading
        } else {
            // Resident: use their own request detail viewer
            if (window.viewRequestDetails) window.viewRequestDetails(requestId);
        }
    }
}

async function markAllAsRead() {
    if (!AppState.currentUser) return;

    const unread = AppState.notifications.filter(n => !n.read);
    const batch = firebase.firestore().batch();

    unread.forEach(n => {
        const ref = firebase.firestore().collection('NOTIFICATIONS').doc(n.id);
        batch.update(ref, { read: true });
    });

    try {
        await batch.commit();
        showToast('All marked as read', 'success');

        // Optimistic
        AppState.notifications.forEach(n => n.read = true);
        updateNotificationBadge();
        closeModal();
    } catch (e) {
        showToast('Failed to mark all read', 'error');
    }
}

// Helpers (Color/Icon/Time)
function getNotificationColor(type) {
    const colors = {
        'info': 'rgba(37, 99, 235, 0.1)',
        'success': 'rgba(16, 185, 129, 0.1)',
        'warning': 'rgba(245, 158, 11, 0.1)',
        'error': 'rgba(239, 68, 68, 0.1)'
    };
    return colors[type] || colors.info;
}

function getNotificationIcon(type) {
    const icons = {
        'info': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        'success': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        'warning': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning-color)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        'error': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
    };
    return icons[type] || icons.info;
}

function formatNotificationTime(timestamp) {
    if (!timestamp) return '';
    const now = new Date();
    const notifTime = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return notifTime.toLocaleDateString();
}

// Exports
window.startNotificationListener = startNotificationListener;
window.stopNotificationListener = stopNotificationListener;
window.loadNotifications = startNotificationListener;
window.showNotifications = showNotifications;
window.handleNotificationClick = handleNotificationClick;
window.markAllAsRead = markAllAsRead;
