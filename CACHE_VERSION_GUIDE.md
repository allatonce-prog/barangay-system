# 🔄 Cache Version Management Guide

## How It Works

The app now uses **automatic cache versioning** to prevent needing hard refreshes when you update code!

## Quick Start

### When You Make Changes:

1. **Update `js/version.js`** - Change the version number:
   ```javascript
   const APP_VERSION = '2026.01.24.002'; // Increment this!
   ```

2. **That's it!** The service worker will automatically:
   - Create a new cache with the new version
   - Delete old caches
   - Update all users on their next visit

## Version Format

Use this format: `YYYY.MM.DD.BUILD`

Examples:
- `2026.01.24.001` - First build of January 24, 2026
- `2026.01.24.002` - Second build of the same day
- `2026.01.25.001` - First build of January 25, 2026

## What Gets Cached

The following files are automatically cached:
- HTML files (index.html)
- CSS files (styles.css, modern-enhancements.css)  
- JavaScript files (all in js/ folder)
- Manifest file
- Version file (version.js)

## No More Hard Refresh! 🎉

### Before:
- Make code changes
- Users need to press `Ctrl+Shift+R` (hard refresh)
- Or clear cache manually

### After:
- Make code changes
- Update version in `js/version.js`
- Users automatically get new version on next visit!

## Troubleshooting

### If changes still don't appear:

1. **Check version.js** - Make sure you updated the version number
2. **Check console** - Look for: `🚀 BrgyONE v2026.01.24.XXX`
3. **Check service worker** - In DevTools → Application → Service Workers
4. **Force update** - Click "Update" in Service Workers panel

### Cache isn't clearing:

1. Open DevTools
2. Go to Application → Storage
3. Click "Clear site data"
4. Reload the page

## Advanced: Manual Cache Control

If you need to manually bust the cache in code:

```javascript
// Get current version
console.log(window.APP_VERSION);

// Unregister service worker (for debugging)
navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
        registration.unregister();
    }
});

// Clear all caches (for debugging)
caches.keys().then(function(names) {
    for (let name of names) caches.delete(name);
});
```

## Best Practices

1. **Increment on every deployment** - Even small changes
2. **Use build numbers** - Third digit for same-day updates
3. **Document changes** - Keep a changelog if needed
4. **Test locally first** - Always test before deploying

## Example Workflow

```bash
# 1. Make your code changes
# 2. Open js/version.js
# 3. Increment version: 2026.01.24.001 → 2026.01.24.002
# 4. Save and deploy
# 5. Users get updated version automatically!
```

## Benefits

✅ **No hard refresh needed**  
✅ **Automatic cache management**  
✅ **Better user experience**  
✅ **Faster updates**  
✅ **Version tracking**  
✅ **Offline support maintained**

---

**Remember:** Always update `js/version.js` when you make changes!
