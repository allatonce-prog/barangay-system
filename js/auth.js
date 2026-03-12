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

    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const dob = document.getElementById('regDOB').value;
    const gender = document.getElementById('regGender').value;
    const fullName = `${firstName} ${lastName}`;
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const address = document.getElementById('regAddress').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validation
    if (!firstName || !lastName || !phone || !dob || !gender || !username || !email || !address || !password || !confirmPassword) {
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
            firstName,
            lastName,
            phone,
            dob,
            gender,
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

function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        if (button) {
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            `;
        }
    } else {
        input.type = 'password';
        if (button) {
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            `;
        }
    }
}

// Make function globally available
window.togglePasswordVisibility = togglePasswordVisibility;
