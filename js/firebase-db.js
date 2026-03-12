// ========================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ========================================

// Firebase SDK imports (using compat version for easier integration)
// These are loaded via script tags in index.html

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDwoXff-8_zsTL5k3oZz-yYML36kMlYL8s",
    authDomain: "grade12-brgyone.firebaseapp.com",
    projectId: "grade12-brgyone",
    storageBucket: "grade12-brgyone.firebasestorage.app",
    messagingSenderId: "435059519611",
    appId: "1:435059519611:web:4259a009581b5b4c0e72de"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
const auth = firebase.auth();

console.log('🔥 Firebase initialized successfully');

// ========================================
// FIRESTORE COLLECTIONS
// ========================================

const COLLECTIONS = {
    RESIDENTS: 'RESIDENTS',
    ADMIN: 'ADMIN',
    REQUESTS: 'REQUESTS',
    ANNOUNCEMENT: 'ANNOUNCEMENT'
};

// ========================================
// DATABASE HELPERS - FIREBASE VERSION
// ========================================

// Generate unique ID
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ========================================
// USER MANAGEMENT (RESIDENTS & ADMIN)
// ========================================

async function registerUser(userData) {
    try {
        const collection = userData.role === 'admin' ? COLLECTIONS.ADMIN : COLLECTIONS.RESIDENTS;

        // Check if username already exists
        const usernameQuery = await db.collection(collection)
            .where('username', '==', userData.username)
            .get();

        if (!usernameQuery.empty) {
            return { success: false, error: 'Username already exists' };
        }

        // Check if email already exists
        const emailQuery = await db.collection(collection)
            .where('email', '==', userData.email)
            .get();

        if (!emailQuery.empty) {
            return { success: false, error: 'Email already exists' };
        }

        // Create user document
        const userId = generateId();
        const newUser = {
            id: userId,
            username: userData.username,
            email: userData.email,
            password: btoa(userData.password), // Simple encoding (use proper hashing in production)
            fullName: userData.fullName,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            dob: userData.dob,
            address: userData.address,
            role: userData.role || 'resident',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection(collection).doc(userId).set(newUser);

        return { success: true, id: userId, data: newUser };
    } catch (error) {
        console.error('Error registering user:', error);
        return { success: false, error: error.message };
    }
}

async function loginUser(usernameOrEmail, password) {
    try {
        const encodedPassword = btoa(password);

        // Try to find user in RESIDENTS first
        let userQuery = await db.collection(COLLECTIONS.RESIDENTS)
            .where('username', '==', usernameOrEmail)
            .limit(1)
            .get();

        // If not found by username, try email
        if (userQuery.empty) {
            userQuery = await db.collection(COLLECTIONS.RESIDENTS)
                .where('email', '==', usernameOrEmail)
                .limit(1)
                .get();
        }

        // If still not found, check ADMIN collection
        if (userQuery.empty) {
            userQuery = await db.collection(COLLECTIONS.ADMIN)
                .where('username', '==', usernameOrEmail)
                .limit(1)
                .get();

            if (userQuery.empty) {
                userQuery = await db.collection(COLLECTIONS.ADMIN)
                    .where('email', '==', usernameOrEmail)
                    .limit(1)
                    .get();
            }
        }

        if (userQuery.empty) {
            return { success: false, error: 'User not found' };
        }

        const userDoc = userQuery.docs[0];
        const user = { id: userDoc.id, ...userDoc.data() };

        // Verify password
        if (user.password !== encodedPassword) {
            return { success: false, error: 'Invalid password' };
        }

        // Remove password from returned user
        const { password: userPassword, ...userWithoutPassword } = user;

        return { success: true, user: userWithoutPassword };
    } catch (error) {
        console.error('Error logging in:', error);
        return { success: false, error: error.message };
    }
}

async function getUserByUsernameOrEmail(username, email) {
    try {
        // Check RESIDENTS
        let query = await db.collection(COLLECTIONS.RESIDENTS)
            .where('username', '==', username)
            .limit(1)
            .get();

        if (!query.empty) {
            return { id: query.docs[0].id, ...query.docs[0].data() };
        }

        query = await db.collection(COLLECTIONS.RESIDENTS)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (!query.empty) {
            return { id: query.docs[0].id, ...query.docs[0].data() };
        }

        // Check ADMIN
        query = await db.collection(COLLECTIONS.ADMIN)
            .where('username', '==', username)
            .limit(1)
            .get();

        if (!query.empty) {
            return { id: query.docs[0].id, ...query.docs[0].data() };
        }

        query = await db.collection(COLLECTIONS.ADMIN)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (!query.empty) {
            return { id: query.docs[0].id, ...query.docs[0].data() };
        }

        return null;
    } catch (error) {
        console.error('Error finding user:', error);
        return null;
    }
}

// ========================================
// REQUEST MANAGEMENT
// ========================================

async function createRequest(requestData) {
    try {
        const requestId = generateId();
        const request = {
            id: requestId,
            ...requestData,
            status: requestData.status || 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection(COLLECTIONS.REQUESTS).doc(requestId).set(request);

        // Notify Admin(s)
        // We target 'role:admin' so all admins can subscribe to this
        await createNotification({
            userId: 'role:admin',
            title: 'New Document Request',
            message: `${requestData.userName || requestData.fullName} requested ${requestData.documentType}`,
            type: 'info',
            requestId: requestId,
            link: 'admin-requests'
        });

        return { success: true, id: requestId, data: request };
    } catch (error) {
        console.error('Error creating request:', error);
        return { success: false, error: error.message };
    }
}

async function getUserRequests(userId) {
    try {
        const snapshot = await db.collection(COLLECTIONS.REQUESTS)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, data: requests };
    } catch (error) {
        console.error('Error getting user requests:', error);
        return { success: false, error: error.message, data: [] };
    }
}

async function getAllData(collectionName, filters = {}) {
    try {
        let query = db.collection(collectionName);

        // Apply filters
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== undefined && value !== null) {
                query = query.where(key, '==', value);
            }
        });

        const snapshot = await query.get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, data };
    } catch (error) {
        console.error(`Error getting data from ${collectionName}:`, error);
        return { success: false, error: error.message, data: [] };
    }
}

async function getData(collectionName, id) {
    try {
        const doc = await db.collection(collectionName).doc(id).get();
        if (doc.exists) {
            return { success: true, data: { id: doc.id, ...doc.data() } };
        } else {
            return { success: false, error: 'Document not found' };
        }
    } catch (error) {
        console.error(`Error getting document from ${collectionName}:`, error);
        return { success: false, error: error.message };
    }
}

async function updateData(collectionName, id, updates) {
    try {
        await db.collection(collectionName).doc(id).update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error(`Error updating data in ${collectionName}:`, error);
        return { success: false, error: error.message };
    }
}

async function deleteData(collectionName, id) {
    try {
        await db.collection(collectionName).doc(id).delete();
        return { success: true };
    } catch (error) {
        console.error(`Error deleting data from ${collectionName}:`, error);
        return { success: false, error: error.message };
    }
}

async function updateRequestStatus(requestId, status, adminNotes = '') {
    return await updateData(COLLECTIONS.REQUESTS, requestId, { status, adminNotes });
}

// ========================================
// ANNOUNCEMENT MANAGEMENT
// ========================================

async function createAnnouncement(announcementData) {
    try {
        const announcementId = generateId();
        const announcement = {
            id: announcementId,
            ...announcementData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection(COLLECTIONS.ANNOUNCEMENT).doc(announcementId).set(announcement);

        return { success: true, id: announcementId, data: announcement };
    } catch (error) {
        console.error('Error creating announcement:', error);
        return { success: false, error: error.message };
    }
}

async function getAnnouncements() {
    try {
        const snapshot = await db.collection(COLLECTIONS.ANNOUNCEMENT)
            .orderBy('createdAt', 'desc')
            .get();

        const announcements = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, data: announcements };
    } catch (error) {
        console.error('Error getting announcements:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// ========================================
// APPOINTMENT MANAGEMENT
// ========================================

async function createAppointment(appointmentData) {
    try {
        const appointmentId = generateId();
        const appointment = {
            id: appointmentId,
            ...appointmentData,
            status: appointmentData.status || 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('APPOINTMENTS').doc(appointmentId).set(appointment);

        return { success: true, id: appointmentId, data: appointment };
    } catch (error) {
        console.error('Error creating appointment:', error);
        return { success: false, error: error.message };
    }
}

async function getUserAppointments(userId) {
    try {
        const snapshot = await db.collection('APPOINTMENTS')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const appointments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, data: appointments };
    } catch (error) {
        console.error('Error getting user appointments:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// ========================================
// PAYMENT MANAGEMENT
// ========================================

async function createPayment(paymentData) {
    try {
        const paymentId = generateId();
        const payment = {
            id: paymentId,
            ...paymentData,
            status: paymentData.status || 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('PAYMENTS').doc(paymentId).set(payment);

        return { success: true, id: paymentId, data: payment };
    } catch (error) {
        console.error('Error creating payment:', error);
        return { success: false, error: error.message };
    }
}

async function getUserPayments(userId) {
    try {
        const snapshot = await db.collection('PAYMENTS')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const payments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, data: payments };
    } catch (error) {
        console.error('Error getting user payments:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// ========================================
// NOTIFICATION MANAGEMENT
// ========================================

async function createNotification(notificationData) {
    try {
        const notificationId = generateId();
        const notification = {
            id: notificationId,
            ...notificationData,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('NOTIFICATIONS').doc(notificationId).set(notification);

        return { success: true, id: notificationId, data: notification };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, error: error.message };
    }
}

async function getUserNotifications(userId) {
    try {
        const snapshot = await db.collection('NOTIFICATIONS')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, data: notifications };
    } catch (error) {
        console.error('Error getting user notifications:', error);
        return { success: false, error: error.message, data: [] };
    }
}

async function markNotificationAsRead(notificationId) {
    return await updateData('NOTIFICATIONS', notificationId, {
        read: true,
        readAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// ========================================
// CREATE DEFAULT ADMIN
// ========================================

async function createDefaultAdmin() {
    try {
        // Check if any admin exists
        const adminSnapshot = await db.collection(COLLECTIONS.ADMIN).limit(1).get();

        if (adminSnapshot.empty) {
            console.log('Creating default admin user...');
            await registerUser({
                username: 'admin',
                email: 'admin@brgyone.local',
                password: 'admin123',
                fullName: 'Admin User',
                address: 'Barangay Office',
                role: 'admin'
            });
            console.log('✅ Default admin created (username: admin, password: admin123)');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
}

// Initialize default admin
createDefaultAdmin();

// ========================================
// EXPORT TO WINDOW
// ========================================

window.DB = {
    // Core operations
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
    generateId,

    // Direct Firestore access
    firestore: db,
    auth: auth,
    collections: COLLECTIONS
};

console.log('✅ Firebase DB module ready');
