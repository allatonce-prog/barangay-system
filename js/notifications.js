// ========================================
// NOTIFICATIONS MODULE
// ========================================

// ========================================
// CREATE NOTIFICATION
// ========================================

function createNotification(notification) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

    const newNotification = {
        id: `notif-${Date.now()}`,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info', // info, success, warning, error
        requestId: notification.requestId || null,
        read: false,
        createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotification);

    // Keep only last 50 notifications per user
    const userNotifications = notifications.filter(n => n.userId === notification.userId);
    if (userNotifications.length > 50) {
        const toRemove = userNotifications.slice(50);
        toRemove.forEach(notif => {
            const index = notifications.findIndex(n => n.id === notif.id);
            if (index > -1) {
                notifications.splice(index, 1);
            }
        });
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Update badge if notification is for current user
    if (AppState.currentUser && notification.userId === AppState.currentUser.id) {
        updateNotificationBadge();
    }
}

// ========================================
// LOAD NOTIFICATIONS
// ========================================

function loadNotifications() {
    if (!AppState.currentUser) return;

    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const userNotifications = allNotifications.filter(n => n.userId === AppState.currentUser.id);

    AppState.notifications = userNotifications;
    updateNotificationBadge();
}

// ========================================
// UPDATE NOTIFICATION BADGE
// ========================================

function updateNotificationBadge() {
    if (!AppState.currentUser) return;

    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const unreadCount = allNotifications.filter(n =>
        n.userId === AppState.currentUser.id && !n.read
    ).length;

    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// ========================================
// SHOW NOTIFICATIONS PANEL
// ========================================

function showNotifications() {
    if (!AppState.currentUser) return;

    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const userNotifications = allNotifications.filter(n => n.userId === AppState.currentUser.id);

    const notificationsList = userNotifications.length === 0
        ? '<div style="text-align: center; padding: var(--spacing-xl); color: var(--text-secondary);">No notifications</div>'
        : userNotifications.map(notif => `
            <div class="notification-item ${notif.read ? 'read' : 'unread'}" 
                 onclick="handleNotificationClick('${notif.id}')"
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

    const modal = createModal('Notifications', `
        <div style="max-height: 60vh; overflow-y: auto;">
            ${notificationsList}
        </div>
        ${userNotifications.filter(n => !n.read).length > 0 ? `
            <div style="padding: var(--spacing-md); border-top: 1px solid var(--border-color); text-align: center;">
                <button class="btn btn-sm btn-outline" onclick="markAllAsRead()">Mark all as read</button>
            </div>
        ` : ''}
    `, [
        { text: 'Close', class: 'btn-outline', action: 'close' }
    ]);

    showModal(modal);
}

// ========================================
// HANDLE NOTIFICATION CLICK
// ========================================

function handleNotificationClick(notificationId) {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notifIndex = allNotifications.findIndex(n => n.id === notificationId);

    if (notifIndex === -1) return;

    const notification = allNotifications[notifIndex];

    // Mark as read
    notification.read = true;
    allNotifications[notifIndex] = notification;
    localStorage.setItem('notifications', JSON.stringify(allNotifications));

    // Update badge
    updateNotificationBadge();

    // Close modal
    closeModal();

    // Navigate to related request if available
    if (notification.requestId) {
        if (AppState.currentUser.role === 'admin') {
            navigateToPage('admin-requests');
            setTimeout(() => {
                viewAdminRequestDetails(notification.requestId);
            }, 300);
        } else {
            navigateToPage('requests');
            setTimeout(() => {
                viewRequestDetails(notification.requestId);
            }, 300);
        }
    }
}

// ========================================
// MARK ALL AS READ
// ========================================

function markAllAsRead() {
    if (!AppState.currentUser) return;

    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');

    allNotifications.forEach(notif => {
        if (notif.userId === AppState.currentUser.id) {
            notif.read = true;
        }
    });

    localStorage.setItem('notifications', JSON.stringify(allNotifications));
    updateNotificationBadge();

    showToast('All notifications marked as read', 'success');
    closeModal();
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

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
    const now = new Date();
    const notifTime = new Date(timestamp);
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

// Make functions globally available
window.createNotification = createNotification;
window.loadNotifications = loadNotifications;
window.updateNotificationBadge = updateNotificationBadge;
window.showNotifications = showNotifications;
window.handleNotificationClick = handleNotificationClick;
window.markAllAsRead = markAllAsRead;
