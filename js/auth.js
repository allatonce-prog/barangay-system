// ========================================
// AUTHENTICATION MODULE
// ========================================

// ========================================
// LOGIN HANDLER
// =========================================

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.getElementById('loginUsername').placeholder = 'Enter your email or username';
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validate inputs
    if (!username || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
        // Use the input directly (could be username or email)
        const identifier = username;

        console.log('Attempting login with identifier:', identifier);
        const result = await DB.loginUser(identifier, password);

        if (result.success && result.user) {
            // Save current user to AppState and localStorage
            AppState.currentUser = result.user;
            localStorage.setItem('currentUser', JSON.stringify(result.user));

            // Show success message
            showToast(`Welcome back, ${result.user.fullName || 'User'}!`, 'success');

            // Show app
            setTimeout(() => {
                showApp();
            }, 500);
        } else {

            // Show specific error message for wrong credentials
            const errorMsg = (result.error || '').toLowerCase();

            if (errorMsg.includes('password') || errorMsg.includes('credential')) {
                showToast('Incorrect password. Please check your password and try again.', 'error');
            } else if (errorMsg.includes('not found') || errorMsg.includes('no user')) {
                showToast('Account not registered. Please check your email or username.', 'error');
            } else if (errorMsg.includes('too many requests')) {
                showToast('Too many failed attempts. Please try again later.', 'error');
            } else {
                showToast(result.error || 'Login failed. Please try again.', 'error');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// ========================================
// REGISTRATION HANDLER
// ========================================

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
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

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;

    try {
        // Register user in local database
        const result = await DB.registerUser({
            fullName,
            username,
            email,
            address,
            password
        });

        if (result.success) {
            // Show success message
            showToast('Registration successful! Please login.', 'success');

            // Clear form
            document.getElementById('registerForm').reset();

            // Switch to login screen
            setTimeout(() => {
                showLoginScreen();
            }, 1500);
        } else {
            showToast(result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
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
