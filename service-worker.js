// ========================================
// SERVICE WORKER - Offline Caching & PWA
// ========================================

// Import version configuration
importScripts('./js/version.js');

// Use version-based cache name (automatically updates when version.js changes)
const CACHE_NAME = `brgyone-v${self.APP_VERSION || '1.0.0'}`;
const CACHE_ASSETS = [
    './',
    './index.html',
    './register-admin.html',
    './css/styles.css',
    './css/modern-enhancements.css',
    './js/version.js',
    './js/firebase-db.js',
    './js/app.js',
    './js/auth.js',
    './js/register-admin.js',
    './js/resident.js',
    './js/admin.js',
    './js/notifications.js',
    './js/appointments.js',
    './js/payments.js',
    './js/announcements.js',
    './js/reports.js',
    './js/utils.js',
    './js/pwa-install.js',
    './manifest.json'
];

// Install Event - Cache resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing version:', self.APP_VERSION || '1.0.0');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating version:', self.APP_VERSION || '1.0.0');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete - Now using:', CACHE_NAME);
                return self.clients.claim();
            })
    );
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                // Make network request
                return fetch(fetchRequest)
                    .then((response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the new response
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', error);
                        // You can return a custom offline page here
                        return new Response('Offline - Please check your connection', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background Sync - For offline request submissions
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-requests') {
        event.waitUntil(syncRequests());
    }
});

// Function to sync pending requests when online
async function syncRequests() {
    try {
        // Get pending requests from IndexedDB or localStorage
        const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');

        if (pendingRequests.length === 0) {
            console.log('[Service Worker] No pending requests to sync');
            return;
        }

        console.log('[Service Worker] Syncing', pendingRequests.length, 'pending requests');

        // Process each pending request
        for (const request of pendingRequests) {
            try {
                // Send request to server
                const response = await fetch('/api/requests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                });

                if (response.ok) {
                    console.log('[Service Worker] Request synced successfully:', request.id);
                    // Remove from pending list
                    const index = pendingRequests.indexOf(request);
                    if (index > -1) {
                        pendingRequests.splice(index, 1);
                    }
                }
            } catch (error) {
                console.error('[Service Worker] Failed to sync request:', error);
            }
        }

        // Update pending requests in storage
        localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));

        console.log('[Service Worker] Sync complete');
    } catch (error) {
        console.error('[Service Worker] Sync failed:', error);
    }
}

// Push Notification Event
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/icons/icon-72x72.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/icon-72x72.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('BrgyONE', options)
    );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message Event - Communication with main app
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => cache.addAll(event.data.urls))
        );
    }
});
