# Barangay Document Request System (PWA)

A modern, mobile-responsive Progressive Web App for managing barangay document requests and community services.

## 🚀 Features

### For Residents
- **User Profile & Authentication**
  - Secure account creation with Name, Address, and Barangay ID
  - Profile management with transaction history
  
- **Document Request System**
  - Request various barangay documents (Clearance, Certificates, Permits, etc.)
  - Upload supporting documents
  - Track request status in real-time
  - Digital certificates with QR code verification
  
- **Appointment Scheduling**
  - Book appointments with barangay officials
  - Real-time availability checking
  - Appointment reminders and notifications
  
- **Payment Integration**
  - Pay fees online (GCash, PayMaya, Credit/Debit cards)
  - Digital receipts
  - Transaction history
  
- **Community Services**
  - Barangay announcements and alerts
  - Emergency assistance (SOS button)
  - Feedback and reporting system
  - Community directory and events calendar
  
- **Notifications**
  - Real-time push notifications
  - Status updates on requests
  - Emergency alerts

### For Administrators
- **Dashboard & Analytics**
  - Real-time statistics and metrics
  - Request monitoring and management
  - Service time analysis
  
- **Request Management**
  - Approve/reject document requests
  - Update request status
  - View resident information
  
- **Reports & Analytics**
  - Document type statistics
  - Monthly request trends
  - Performance metrics

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Installable**: Add to home screen on mobile devices
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Fast Loading**: Service Worker caching for instant load times
- **Push Notifications**: Real-time updates even when app is closed

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (No frameworks)
- **Storage**: LocalStorage (for demo - use backend API in production)
- **PWA**: Service Worker, Web App Manifest
- **Design**: Modern, minimalistic UI with CSS variables

## 📦 Installation

1. **Clone or download the project**
   ```bash
   cd e:\PANTUKAN
   ```

2. **Serve the application**
   
   Option 1 - Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Option 2 - Using Node.js:
   ```bash
   npx serve
   ```
   
   Option 3 - Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

4. **Install as PWA**
   - On mobile: Tap "Add to Home Screen"
   - On desktop: Click install icon in address bar

## 🔐 Demo Credentials

### Admin Account
- Username: `admin`
- Password: `admin123`

### Resident Account
- Username: `resident`
- Password: `resident123`

## 📁 Project Structure

```
e:\PANTUKAN\
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── service-worker.js       # Service Worker for offline support
├── css/
│   └── styles.css         # All styles with design tokens
├── js/
│   ├── app.js             # Core application logic
│   ├── auth.js            # Authentication module
│   ├── resident.js        # Resident features
│   ├── admin.js           # Admin features
│   └── notifications.js   # Notification system
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## 🎨 Design Features

- **Modern UI**: Clean, minimalistic design
- **Color Palette**: Professional blue gradient theme
- **Responsive**: Mobile-first approach
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: ARIA labels, keyboard navigation, focus states

## 🔄 Upcoming Features

- Facial recognition for verification
- QR code scanning
- Multilingual support (Filipino, English, local dialects)
- Real-time chat with officials
- Advanced analytics dashboard
- Export reports to PDF/Excel
- SMS notifications
- Geolocation services

## 📝 Usage Guide

### Creating a New Account
1. Click "Register" on login screen
2. Fill in your details
3. Submit to create account
4. Login with your credentials

### Requesting a Document
1. Login to your account
2. Navigate to "Requests" tab
3. Click "New Request"
4. Select document type and fill details
5. Upload requirements (optional)
6. Submit request
7. Track status in "Track" tab

### Managing Requests (Admin)
1. Login with admin credentials
2. View dashboard statistics
3. Navigate to "Requests" tab
4. Click "Manage" on any request
5. Approve, process, or reject
6. View reports in "Reports" tab

## 🔒 Security Notes

**Important**: This is a demo application using localStorage. For production:
- Implement proper backend API
- Use secure authentication (JWT, OAuth)
- Hash passwords (bcrypt, argon2)
- Use HTTPS
- Implement CSRF protection
- Add rate limiting
- Use proper database (PostgreSQL, MySQL)

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is for educational and demonstration purposes.

## 👥 Credits

Developed for Barangay Pantukan
Built with vanilla JavaScript, HTML, and CSS

## 🐛 Known Issues

- Icons need to be properly sized (currently using placeholder)
- Payment integration is simulated
- No actual backend server
- Limited to localStorage (not suitable for production)

## 💡 Tips

- Use Chrome DevTools to test PWA features
- Test offline mode by disabling network in DevTools
- Clear localStorage to reset demo data
- Check Application tab in DevTools for Service Worker status

---

**Version**: 1.0.0  
**Last Updated**: January 2026
