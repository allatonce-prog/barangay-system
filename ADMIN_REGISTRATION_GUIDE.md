# Admin Registration Guide

## Overview
A separate, secure registration page specifically for creating administrator accounts with enhanced security features.

## Access the Page
👉 **URL:** `register-admin.html`

Example: `http://localhost:5500/register-admin.html`

## Features

### 🛡️ Enhanced Security
- **Password Requirements:**
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - Real-time strength indicator

### ✨ User Experience
- **Live Password Validation:**
  - Visual strength meter (Weak/Medium/Strong)
  - Checkmarks for met requirements
  - Color-coded feedback

- **Security Notice:**
  - Clear warning about admin responsibilities
  - Acknowledgment checkbox required

- **Professional Design:**
  - Purple gradient theme
  - Admin badge indicator
  - Animated form elements

### 🎯 Form Fields
1. **Full Name** (required)
2. **Username** (required, min 4 characters)
3. **Email Address** (required, validated)
4. **Office Location** (optional, defaults to "Barangay Office")
5. **Password** (required, with strength validation)
6. **Confirm Password** (required, must match)
7. **Terms Acknowledgment** (required checkbox)

## Password Strength Requirements

| Requirement | Description | Visual Indicator |
|-------------|-------------|------------------|
| ✅ Length | At least 8 characters | Checkmark when met |
| ✅ Uppercase | One uppercase letter (A-Z) | Checkmark when met |
| ✅ Number | One number (0-9) | Checkmark when met |

### Strength Levels:
- 🔴 **Weak** (0-2 requirements) - Red bar
- 🟡 **Medium** (3 requirements) - Yellow bar
- 🟢 **Strong** (4+ requirements) - Green bar

## How to Use

### 1. Access the Page
Open `register-admin.html` in your browser

### 2. Fill Out the Form
- Enter your full name
- Choose a unique username (min 4 chars)
- Provide a valid email address
- Create a strong password
- Confirm your password
- Acknowledge admin responsibilities

### 3. Submit
Click "Create Admin Account" button

### 4. Success
- Success message appears
- Automatically redirected to login page after 2 seconds
- Login with your new admin credentials

## Validation Rules

### Username
```javascript
- Minimum: 4 characters
- Must be unique
- Case-sensitive
```

### Email
```javascript
- Must be valid email format
- Must be unique
- Example: admin@example.com
```

### Password
```javascript
- Minimum: 8 characters
- Must include: 1 uppercase letter
- Must include: 1 number
- Recommended: include special characters
```

## Security Features

### 1. Input Validation
- Real-time password strength checking
- Email format validation
- Duplicate username/email prevention

### 2. Visual Feedback
- Color-coded password strength
- Live requirement checking
- Clear error messages

### 3. Secure Storage
- Passwords are hashed before storage
- Stored in local IndexedDB
- No plain-text passwords

### 4. User Awareness
- Security notice displayed
- Admin responsibilities acknowledgment
- Professional admin badge

## File Structure

```
register-admin.html          # Main registration page
js/register-admin.js         # Registration logic
js/db.js                     # Database operations
js/version.js                # Version control
css/styles.css               # Base styles
css/modern-enhancements.css  # Enhanced styling
```

## After Registration

Once successfully registered:
1. ✅ Account created with role: `admin`
2. ✅ Redirected to login page
3. ✅ Can login with: `username` + `password`
4. ✅ Full admin access to system

## Admin Capabilities

Admins can:
- ✅ View all requests from residents
- ✅ Approve/reject requests
- ✅ Create announcements
- ✅ Manage appointments
- ✅ View reports and analytics
- ✅ Access admin dashboard

## Default Admin Account

The system creates one default admin on first launch:
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@brgyone.local`

⚠️ **Security Note:** Change default credentials after first login!

## Troubleshooting

### "Username already exists"
- Try a different username
- Usernames are unique across the system

### "Email already exists"
- Use a different email address
- Each email can only be used once

### "Password too weak"
- Ensure you meet all requirements:
  - ✅ At least 8 characters
  - ✅ One uppercase letter
  - ✅ One number

### "Database not ready"
- Refresh the page
- Clear browser cache if issue persists

## Best Practices

### 1. Strong Passwords
```
❌ Bad: admin123
❌ Bad: password
✅ Good: Admin@2026!
✅ Good: Brgy1Admin#
```

### 2. Unique Credentials
- Don't reuse passwords
- Use organization email
- Choose professional username

### 3. Security
- Keep credentials confidential
- Don't share admin accounts
- Change password regularly

## Integration

### Link from Main Page
Add this to your login page:

```html
<a href="register-admin.html">Create Admin Account</a>
```

### Or Direct Access
```
http://yourdomain.com/register-admin.html
```

## Success Flow

```
1. Fill form → 2. Validate → 3. Check uniqueness → 4. Hash password
    ↓
5. Save to DB → 6. Show success → 7. Redirect to login
```

## Error Handling

The system handles:
- ✅ Empty required fields
- ✅ Invalid email format
- ✅ Password mismatch
- ✅ Weak passwords
- ✅ Duplicate credentials
- ✅ Database errors

---

## Quick Links

- **Admin Registration:** `register-admin.html`
- **Main Login:** `index.html`
- **Version Info:** Check console for version number

**Current Version:** v2026.01.24.003
