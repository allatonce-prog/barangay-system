// ========================================
// AUTHENTICATION MODULE
// ========================================

// Initialize demo users
function initializeDemoUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Add default admin if no users exist
    if (users.length === 0) {
        const defaultUsers = [
            {
                id: 'user-admin',
                username: 'admin',
                password: 'admin123', // In production, use proper password hashing
                fullName: 'Admin User',
                email: 'admin@barangay.gov',
                role: 'admin',
                address: 'Barangay Hall',
                createdAt: new Date().toISOString()
            },
            {
                id: 'user-resident',
                username: 'resident',
                password: 'resident123',
                fullName: 'Juan Dela Cruz',
                email: 'juan@example.com',
                role: 'resident',
                address: 'Purok 1, Barangay Pantukan',
                createdAt: new Date().toISOString()
            }
        ];

        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// Initialize users on load
initializeDemoUsers();

// ========================================
// LOGIN HANDLER
// ========================================

document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validate inputs
    if (!username || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Get users from storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Find user
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Remove password from stored user object
        const { password, ...userWithoutPassword } = user;

        // Save current user
        AppState.currentUser = userWithoutPassword;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

        // Show success message
        showToast(`Welcome back, ${user.fullName}!`, 'success');

        // Show app
        setTimeout(() => {
            showApp();
        }, 500);
    } else {
        showToast('Invalid username or password', 'error');
    }
});

// ========================================
// REGISTRATION HANDLER
// ========================================

document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('regFullName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const address = document.getElementById('regAddress').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validation
    if (!fullName || !username || !email || !address || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if username already exists
    if (users.some(u => u.username === username)) {
        showToast('Username already exists', 'error');
        return;
    }

    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: `user-${Date.now()}`,
        username,
        password, // In production, hash this password
        fullName,
        email,
        address,
        role: 'resident',
        createdAt: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Show success message
    showToast('Registration successful! Please login.', 'success');

    // Clear form
    document.getElementById('registerForm').reset();

    // Switch to login screen
    setTimeout(() => {
        showLoginScreen();
    }, 1500);
});

// ========================================
// SCREEN SWITCHING
// ========================================

document.getElementById('showRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'flex';
});

document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
});

// ========================================
// PASSWORD VISIBILITY TOGGLE (Optional Enhancement)
// ========================================

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Make function globally available
window.togglePasswordVisibility = togglePasswordVisibility;
