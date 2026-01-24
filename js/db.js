// ========================================
// LOCAL-FIRST DATABASE (IndexedDB)
// ========================================

const DB_NAME = 'BrgyONEDB';
const DB_VERSION = 1;

let db = null;

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // User store
            if (!database.objectStoreNames.contains('users')) {
                const userStore = database.createObjectStore('users', { keyPath: 'id' });
                userStore.createIndex('username', 'username', { unique: true });
                userStore.createIndex('email', 'email', { unique: true });
            }

            // Requests store
            if (!database.objectStoreNames.contains('requests')) {
                const requestStore = database.createObjectStore('requests', { keyPath: 'id' });
                requestStore.createIndex('userId', 'userId', { unique: false });
                requestStore.createIndex('status', 'status', { unique: false });
                requestStore.createIndex('createdAt', 'createdAt', { unique: false });
            }

            // Announcements store
            if (!database.objectStoreNames.contains('announcements')) {
                const announcementStore = database.createObjectStore('announcements', { keyPath: 'id' });
                announcementStore.createIndex('createdAt', 'createdAt', { unique: false });
                announcementStore.createIndex('priority', 'priority', { unique: false });
            }

            // Appointments store
            if (!database.objectStoreNames.contains('appointments')) {
                const appointmentStore = database.createObjectStore('appointments', { keyPath: 'id' });
                appointmentStore.createIndex('userId', 'userId', { unique: false });
                appointmentStore.createIndex('date', 'date', { unique: false });
                appointmentStore.createIndex('status', 'status', { unique: false });
            }

            // Payments store
            if (!database.objectStoreNames.contains('payments')) {
                const paymentStore = database.createObjectStore('payments', { keyPath: 'id' });
                paymentStore.createIndex('requestId', 'requestId', { unique: false });
                paymentStore.createIndex('userId', 'userId', { unique: false });
                paymentStore.createIndex('status', 'status', { unique: false });
            }

            // Notifications store
            if (!database.objectStoreNames.contains('notifications')) {
                const notificationStore = database.createObjectStore('notifications', { keyPath: 'id' });
                notificationStore.createIndex('userId', 'userId', { unique: false });
                notificationStore.createIndex('read', 'read', { unique: false });
                notificationStore.createIndex('createdAt', 'createdAt', { unique: false });
            }
        };
    });
}

// ========================================
// DATABASE HELPERS
// ========================================

// Generic function to add data to a store
async function addData(storeName, data) {
    try {
        if (!db) await initDB();

        // Generate ID if not exists
        if (!data.id) {
            data.id = generateId();
        }

        // Add timestamps
        if (!data.createdAt) {
            data.createdAt = new Date().toISOString();
        }

        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        await store.add(data);

        return { success: true, id: data.id, data };
    } catch (error) {
        console.error(`Error adding data to ${storeName}:`, error);
        return { success: false, error: error.message };
    }
}

// Generic function to get all data from a store
async function getAllData(storeName, filters = {}) {
    try {
        if (!db) await initDB();

        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                let results = request.result || [];

                // Apply filters
                if (filters) {
                    Object.keys(filters).forEach(key => {
                        const value = filters[key];
                        if (value !== undefined && value !== null) {
                            results = results.filter(item => item[key] === value);
                        }
                    });
                }

                resolve({ success: true, data: results });
            };
            request.onerror = () => reject({ success: false, error: request.error });
        });
    } catch (error) {
        console.error(`Error getting data from ${storeName}:`, error);
        return { success: false, error: error.message, data: [] };
    }
}

// Generic function to get single data by ID
async function getData(storeName, id) {
    try {
        if (!db) await initDB();

        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve({ success: true, data: request.result });
            };
            request.onerror = () => reject({ success: false, error: request.error });
        });
    } catch (error) {
        console.error(`Error getting data from ${storeName}:`, error);
        return { success: false, error: error.message };
    }
}

// Generic function to update data
async function updateData(storeName, id, updates) {
    try {
        if (!db) await initDB();

        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const getRequest = store.get(id);

        return new Promise((resolve, reject) => {
            getRequest.onsuccess = () => {
                const data = getRequest.result;
                if (!data) {
                    reject({ success: false, error: 'Data not found' });
                    return;
                }

                // Merge updates
                const updatedData = { ...data, ...updates, updatedAt: new Date().toISOString() };
                const putRequest = store.put(updatedData);

                putRequest.onsuccess = () => {
                    resolve({ success: true, data: updatedData });
                };
                putRequest.onerror = () => {
                    reject({ success: false, error: putRequest.error });
                };
            };
            getRequest.onerror = () => {
                reject({ success: false, error: getRequest.error });
            };
        });
    } catch (error) {
        console.error(`Error updating data in ${storeName}:`, error);
        return { success: false, error: error.message };
    }
}

// Generic function to delete data
async function deleteData(storeName, id) {
    try {
        if (!db) await initDB();

        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        await store.delete(id);

        return { success: true };
    } catch (error) {
        console.error(`Error deleting data from ${storeName}:`, error);
        return { success: false, error: error.message };
    }
}

// ========================================
// USER MANAGEMENT
// ========================================

async function registerUser(userData) {
    try {
        // Check if username or email already exists
        const existingUser = await getUserByUsernameOrEmail(userData.username, userData.email);
        if (existingUser) {
            return { success: false, error: 'Username or email already exists' };
        }

        const newUser = {
            id: generateId(),
            username: userData.username,
            email: userData.email,
            password: await hashPassword(userData.password), // In production, hash on server
            fullName: userData.fullName,
            address: userData.address,
            role: userData.role || 'resident',
            createdAt: new Date().toISOString()
        };

        return await addData('users', newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        return { success: false, error: error.message };
    }
}

async function loginUser(usernameOrEmail, password) {
    try {
        const user = await getUserByUsernameOrEmail(usernameOrEmail, usernameOrEmail);

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return { success: false, error: 'Invalid password' };
        }

        // Remove password from returned user
        const { password: _, ...userWithoutPassword } = user;

        return { success: true, user: userWithoutPassword };
    } catch (error) {
        console.error('Error logging in:', error);
        return { success: false, error: error.message };
    }
}

async function getUserByUsernameOrEmail(username, email) {
    try {
        if (!db) await initDB();

        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const allUsers = await store.getAll();

        return new Promise((resolve) => {
            allUsers.onsuccess = () => {
                const users = allUsers.result || [];
                const user = users.find(u => u.username === username || u.email === email);
                resolve(user || null);
            };
            allUsers.onerror = () => resolve(null);
        });
    } catch (error) {
        console.error('Error finding user:', error);
        return null;
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Simple password hashing (use bcrypt in production)
async function hashPassword(password) {
    // For demo purposes - in production use proper hashing like bcrypt
    return btoa(password);
}

async function verifyPassword(password, hash) {
    // For demo purposes - in production use proper verification
    return btoa(password) === hash;
}

// ========================================
// REQUEST MANAGEMENT
// ========================================

async function createRequest(requestData) {
    const request = {
        ...requestData,
        id: generateId(),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    return await addData('requests', request);
}

async function getUserRequests(userId) {
    return await getAllData('requests', { userId });
}

async function updateRequestStatus(requestId, status, adminNotes = '') {
    return await updateData('requests', requestId, { status, adminNotes });
}

// ========================================
// ANNOUNCEMENT MANAGEMENT
// ========================================

async function createAnnouncement(announcementData) {
    const announcement = {
        ...announcementData,
        id: generateId(),
        createdAt: new Date().toISOString()
    };

    return await addData('announcements', announcement);
}

async function getAnnouncements() {
    const result = await getAllData('announcements');
    if (result.success) {
        // Sort by createdAt descending
        result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
}

// ========================================
// APPOINTMENT MANAGEMENT
// ========================================

async function createAppointment(appointmentData) {
    const appointment = {
        ...appointmentData,
        id: generateId(),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    return await addData('appointments', appointment);
}

async function getUserAppointments(userId) {
    return await getAllData('appointments', { userId });
}

// ========================================
// PAYMENT MANAGEMENT
// ========================================

async function createPayment(paymentData) {
    const payment = {
        ...paymentData,
        id: generateId(),
        status: paymentData.status || 'pending',
        createdAt: new Date().toISOString()
    };

    return await addData('payments', payment);
}

async function getUserPayments(userId) {
    return await getAllData('payments', { userId });
}

// ========================================
// NOTIFICATION MANAGEMENT
// ========================================

async function createNotification(notificationData) {
    const notification = {
        ...notificationData,
        id: generateId(),
        read: false,
        createdAt: new Date().toISOString()
    };

    return await addData('notifications', notification);
}

async function getUserNotifications(userId) {
    const result = await getAllData('notifications', { userId });
    if (result.success) {
        // Sort by createdAt descending
        result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
}

async function markNotificationAsRead(notificationId) {
    return await updateData('notifications', notificationId, { read: true, readAt: new Date().toISOString() });
}

// ========================================
// INITIALIZE ON LOAD
// ========================================

// Initialize database when script loads
initDB().then(() => {
    console.log('Local database initialized successfully');

    // Create default admin user if no users exist
    createDefaultAdmin();
}).catch(error => {
    console.error('Failed to initialize database:', error);
});

// Create default admin user
async function createDefaultAdmin() {
    try {
        const result = await getAllData('users');
        if (result.success && result.data.length === 0) {
            console.log('Creating default admin user...');
            await registerUser({
                username: 'admin',
                email: 'admin@brgyone.local',
                password: 'admin123',
                fullName: 'Admin User',
                address: 'Barangay Office',
                role: 'admin'
            });
            console.log('Default admin user created (username: admin, password: admin123)');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
}

// Export functions to window for global access
window.DB = {
    // Core operations
    addData,
    getAllData,
    getData,
    updateData,
    deleteData,

    // User operations
    registerUser,
    loginUser,
    getUserByUsernameOrEmail,

    // Request operations
    createRequest,
    getUserRequests,
    updateRequestStatus,

    // Announcement operations
    createAnnouncement,
    getAnnouncements,
    updateData: updateData, // For updating announcements
    deleteData: deleteData, // For deleting announcements

    // Appointment operations
    createAppointment,
    getUserAppointments,

    // Payment operations
    createPayment,
    getUserPayments,

    // Notification operations
    createNotification,
    getUserNotifications,
    markNotificationAsRead,

    // Utilities
    generateId
};
