// ========================================
// ADMIN REGISTRATION HANDLER
// ========================================

console.log('Admin registration module loaded');

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    // Count met requirements
    Object.values(requirements).forEach(met => {
        if (met) strength++;
    });

    return {
        strength,
        level: strength <= 2 ? 'weak' : strength <= 3 ? 'medium' : 'strong',
        requirements
    };
}

// Update password strength indicator
document.getElementById('adminPassword')?.addEventListener('input', (e) => {
    const password = e.target.value;
    const result = checkPasswordStrength(password);
    const strengthBar = document.getElementById('passwordStrengthBar');

    // Update strength bar
    strengthBar.className = 'password-strength-bar';
    if (password.length > 0) {
        strengthBar.classList.add(`strength-${result.level}`);
    }

    // Update requirements
    document.getElementById('req-length').className =
        result.requirements.length ? 'requirement met' : 'requirement unmet';
    document.getElementById('req-uppercase').className =
        result.requirements.uppercase ? 'requirement met' : 'requirement unmet';
    document.getElementById('req-number').className =
        result.requirements.number ? 'requirement met' : 'requirement unmet';

    // Update icons
    document.querySelectorAll('.requirement svg').forEach(svg => {
        const parent = svg.parentElement;
        if (parent.classList.contains('met')) {
            svg.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
        } else {
            svg.innerHTML = '<circle cx="12" cy="12" r="10"></circle>';
        }
    });
});

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Admin registration form handler
document.getElementById('adminRegisterForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('adminFullName').value.trim();
    const username = document.getElementById('adminUsername').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const address = document.getElementById('adminAddress').value.trim();
    const password = document.getElementById('adminPassword').value;
    const confirmPassword = document.getElementById('adminConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Validation
    if (!fullName || !username || !email || !password || !confirmPassword) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (!agreeTerms) {
        showToast('Please acknowledge the admin responsibilities', 'error');
        return;
    }

    if (username.length < 4) {
        showToast('Username must be at least 4 characters', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Password validation
    const passwordCheck = checkPasswordStrength(password);
    if (!passwordCheck.requirements.length) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    if (!passwordCheck.requirements.uppercase) {
        showToast('Password must contain at least one uppercase letter', 'error');
        return;
    }

    if (!passwordCheck.requirements.number) {
        showToast('Password must contain at least one number', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span style="display: flex; align-items: center; justify-content: center; gap: 8px;">Creating account...</span>';
    submitBtn.disabled = true;

    try {
        // Register admin user in local database
        const result = await DB.registerUser({
            fullName,
            username,
            email,
            address: address || 'Barangay Office',
            password,
            role: 'admin'
        });

        if (result.success) {
            showToast('Admin account created successfully!', 'success');

            // Clear form
            document.getElementById('adminRegisterForm').reset();

            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            if (result.error.includes('already exists')) {
                showToast('Username or email already exists. Please use different credentials.', 'error');
            } else {
                showToast(result.error || 'Registration failed', 'error');
            }
        }
    } catch (error) {
        console.error('Admin registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Check if DB is initialized
if (typeof DB === 'undefined') {
    console.error('DB not initialized. Make sure db.js is loaded.');
    showToast('Database not ready. Please refresh the page.', 'error');
}

console.log('Admin registration ready');
