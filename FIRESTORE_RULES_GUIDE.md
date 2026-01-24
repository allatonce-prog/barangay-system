# 🔐 Firestore Security Rules Setup

## 📋 **Quick Setup (Development)**

### **Step 1: Go to Firebase Console**
1. Open: https://console.firebase.google.com/
2. Select your project: **grade12-brgyone**
3. Click **Firestore Database** in left sidebar
4. Click **Rules** tab at the top

### **Step 2: Copy & Paste These Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all read/write for testing
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### **Step 3: Publish**
1. Click **Publish** button
2. Wait for "Rules published successfully" message
3. Done! ✅

---

## 🎯 **Collections That Will Work**

With these rules, your app can now:

✅ **RESIDENTS** - Create, read, update, delete resident accounts  
✅ **ADMIN** - Create, read, update, delete admin accounts  
✅ **REQUESTS** - Create, read, update, delete requests  
✅ **ANNOUNCEMENT** - Create, read, update, delete announcements  
✅ **APPOINTMENTS** - Create, read, update, delete appointments  
✅ **PAYMENTS** - Create, read, update, delete payments  
✅ **NOTIFICATIONS** - Create, read, update, delete notifications  

---

## ⚠️ **IMPORTANT SECURITY WARNING**

### **Current Rules (Development):**
```javascript
match /{document=**} {
  allow read, write: if true;  // ⚠️ ANYONE can access!
}
```

**This means:**
- ❌ NO authentication required
- ❌ NO security
- ❌ Anyone with your Firebase config can read/write ALL data
- ✅ Perfect for testing/development
- ❌ DO NOT use in production!

---

## 🔒 **Production Rules (Secure)**

When you're ready to go live, replace with these secure rules:

### **Option 1: Copy from `firestore.rules` file**
1. Open the `firestore.rules` file in your project
2. Find the commented production rules section
3. Copy those rules
4. Paste in Firebase Console → Rules
5. Publish

### **Option 2: Use Firebase CLI**
```bash
firebase deploy --only firestore:rules
```

---

## 📊 **Rule Breakdown (Production)**

### **RESIDENTS Collection**
- ✅ **Create**: Anyone (for registration)
- ✅ **Read**: Own data + Admins
- ✅ **Update**: Own data + Admins
- ✅ **Delete**: Admins only

### **ADMIN Collection**
- ✅ **Create**: Admins only
- ✅ **Read**: Admins only
- ✅ **Update**: Own data + Admins
- ✅ **Delete**: Admins only

### **REQUESTS Collection**
- ✅ **Create**: Authenticated users
- ✅ **Read**: Own requests + Admins
- ✅ **Update**: Admins only
- ✅ **Delete**: Admins only

### **ANNOUNCEMENT Collection**
- ✅ **Create**: Admins only
- ✅ **Read**: Everyone
- ✅ **Update**: Admins only
- ✅ **Delete**: Admins only

### **APPOINTMENTS Collection**
- ✅ **Create**: Authenticated users
- ✅ **Read**: Own appointments + Admins
- ✅ **Update**: Own appointments + Admins
- ✅ **Delete**: Admins only

### **PAYMENTS Collection**
- ✅ **Create**: Authenticated users
- ✅ **Read**: Own payments + Admins
- ✅ **Update**: Admins only
- ✅ **Delete**: Admins only

### **NOTIFICATIONS Collection**
- ✅ **Create**: Authenticated users
- ✅ **Read**: Own notifications + Admins
- ✅ **Update**: Own notifications + Admins
- ✅ **Delete**: Own notifications + Admins

---

## 🧪 **Testing Your Rules**

### **1. Check in Firebase Console:**
Go to: **Firestore Database → Rules**

Should see:
```
✅ Rules published successfully
Last published: [timestamp]
```

### **2. Test in Your App:**
1. Open `clear-cache.html` → Clear cache
2. Register a new user → Check Firestore for new document
3. Login → Should work
4. Create a request → Check Firestore
5. Check console for any permission errors

### **3. Monitor Access:**
Go to: **Firestore Database → Usage**
- See read/write counts
- Monitor for unusual activity

---

## 🚨 **Common Issues**

### **"Missing or insufficient permissions"**
**Solution:** Make sure rules are published correctly
```javascript
// Check you have this line:
match /{document=**} {
  allow read, write: if true;
}
```

### **Rules won't publish**
**Solution:** Check for syntax errors
- Make sure `rules_version = '2';` is at the top
- Check all brackets are closed
- Look for typos

### **App can't read/write data**
**Solution:** 
1. Check Firebase config in `firebase-db.js` is correct
2. Make sure collections exist in Firestore
3. Check browser console for errors
4. Verify rules are published

---

## 📋 **Quick Checklist**

Before your app works, make sure:

- ✅ Firebase rules are published
- ✅ Collections created (RESIDENTS, ADMIN, REQUESTS, ANNOUNCEMENT)
- ✅ Firebase config is correct in `firebase-db.js`
- ✅ Cache is cleared (`clear-cache.html`)
- ✅ Internet connection is active
- ✅ No console errors

---

## 🔄 **Switching Between Dev and Production**

### **For Development (Testing):**
```javascript
match /{document=**} {
  allow read, write: if true;
}
```

### **For Production (Live):**
```javascript
// Use the detailed rules from firestore.rules file
// See production section above
```

---

## 📞 **Need Help?**

If something isn't working:

1. Check Firebase Console → Rules → Make sure published
2. Check browser console for errors
3. Check Firestore Console → Data → See if documents are created
4. Clear cache and try again
5. Check `FIREBASE_SETUP.md` for more details

---

## ✅ **You're All Set!**

Your Firestore rules are ready for:
- ✅ User registration (RESIDENTS, ADMIN)
- ✅ User login
- ✅ Creating requests
- ✅ Managing announcements
- ✅ Appointments & Payments
- ✅ Notifications

**Just publish the rules and start testing!** 🚀
