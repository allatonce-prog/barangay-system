# 📱 iOS PWA Installation Guide

## How to Install on iPhone/iPad

### Step 1: Open in Safari
1. Open **Safari** browser on your iOS device
2. Navigate to your GitHub Pages URL: `https://[your-username].github.io/barangay-system/`

> ⚠️ **Important**: You MUST use Safari browser. Chrome and other browsers on iOS don't support PWA installation.

### Step 2: Add to Home Screen
1. Tap the **Share** button (square with arrow pointing up) at the bottom of Safari
2. Scroll down and tap **"Add to Home Screen"**
3. Edit the name if desired (default: "Barangay DRS")
4. Tap **"Add"** in the top right corner

### Step 3: Launch the App
1. Find the **Barangay DRS** icon on your home screen
2. Tap to open - it will launch in full-screen mode without Safari UI
3. The app will work offline after first load

---

## ✅ Features on iOS

- **Standalone Mode**: Opens without Safari browser UI
- **Home Screen Icon**: Custom app icon
- **Offline Support**: Works without internet after initial load
- **Full Screen**: Immersive app experience
- **Fast Loading**: Cached resources for instant access

---

## 🔧 Troubleshooting

### App doesn't appear on home screen
- Make sure you used Safari browser
- Try clearing Safari cache and repeat steps
- Ensure you tapped "Add" after "Add to Home Screen"

### App shows Safari UI
- Delete the app from home screen
- Reinstall following the steps above
- Make sure `apple-mobile-web-app-capable` meta tag is present

### Offline mode not working
- Open the app at least once while online
- Service worker needs to cache resources first
- Check if you have enough storage space

---

## 📋 GitHub Pages Deployment

### Update your repository name in URLs
If your GitHub repo is named differently, update these files:

1. **manifest.json**: Update `start_url` and `scope` if needed
2. **service-worker.js**: Already uses relative paths (no changes needed)
3. **index.html**: Already configured with relative paths

### Deploy to GitHub Pages
```bash
# Push to GitHub
git add .
git commit -m "iOS PWA support added"
git push origin main

# Enable GitHub Pages
# Go to: Settings → Pages → Source: main branch → Save
```

Your app will be available at:
`https://[your-username].github.io/barangay-system/`

---

## 🎯 Best Practices

1. **Always test in Safari** on actual iOS device
2. **Clear cache** between tests during development
3. **Use HTTPS** (GitHub Pages provides this automatically)
4. **Provide icons** in multiple sizes (already included)
5. **Test offline** by enabling Airplane Mode

---

## 📱 Supported iOS Versions

- iOS 11.3+ (PWA support introduced)
- iOS 13+ (Better PWA support)
- iOS 14+ (Recommended for best experience)

---

## 🚀 Quick Start

```bash
# 1. Push to GitHub
git push origin main

# 2. Enable GitHub Pages in repository settings

# 3. Open on iOS Safari:
https://[your-username].github.io/barangay-system/

# 4. Tap Share → Add to Home Screen

# 5. Launch from home screen!
```

---

**Enjoy your Barangay DRS app on iOS! 🎉**
