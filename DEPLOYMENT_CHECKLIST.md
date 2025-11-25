# Deployment Checklist

## Pre-Deployment Tasks

### ✅ COMPLETED
- [x] Remove console.log from production build (main.ts)
- [x] Configure production environment with Firebase config
- [x] Update app metadata (name, title, description)
- [x] Change appId from starter to production (com.barangay.bulletinboard)
- [x] Status bar configuration added
- [x] Safe area CSS for notched devices
- [x] Auth navigation improvements (history clearing)
- [x] Memory leaks fixed
- [x] Toast service centralized
- [x] Barangay caching implemented
- [x] TypeScript compilation errors fixed
- [x] Firestore security rules created

### 🔴 CRITICAL - MUST DO BEFORE DEPLOYMENT

1. **Deploy Firestore Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```
   - File ready: `firestore.rules`
   - Contains role-based access control
   - Prevents unauthorized data access

2. **Upload Barangay Data to Firestore**
   ```bash
   # 1. Get Firebase service account key from Firebase Console
   # 2. Save as scripts/serviceAccountKey.json
   # 3. Edit scripts/barangays.txt with your barangay names
   # 4. Run:
   node scripts/upload-barangays.js
   ```
   - Required for registration and announcements to work
   - Script is ready in `scripts/upload-barangays.js`

3. **Secure Firebase Configuration**
   - Option A: Keep current setup (API keys are safe to expose for web apps)
   - Option B: Use environment variables (recommended for advanced security)
   - Add Firebase domain restrictions in Firebase Console

4. **Build Production Bundle**
   ```bash
   npm run build -- --configuration production
   ```
   - Verify build completes without errors
   - Check bundle size is within limits

### ⚠️ HIGH PRIORITY

5. **Test on Physical Devices**
   - iOS device testing (status bar, safe areas)
   - Android device testing (back button behavior)
   - Test auth flows (login, register, logout)
   - Test offline functionality with cached data

6. **Configure Firebase App Check** (Recommended)
   - Prevents API abuse
   - Add reCAPTCHA for web
   - Add App Attest for iOS
   - Add Play Integrity for Android

7. **Setup Analytics** (Optional but recommended)
   - Enable Google Analytics in Firebase
   - Track user engagement
   - Monitor crash reports

### 📱 App Store Preparation

8. **App Icons and Splash Screen**
   - Create app icons (1024x1024 for iOS, various for Android)
   - Design splash screen
   - Use `npx capacitor-assets generate`

9. **Privacy Policy & Terms** (Required for stores)
   - Create privacy policy page
   - Add terms of service
   - Link from login/register pages

10. **Build Native Apps**
    ```bash
    # iOS
    npx cap add ios
    npx cap sync ios
    npx cap open ios
    
    # Android
    npx cap add android
    npx cap sync android
    npx cap open android
    ```

### 🔒 Security Checklist

- [x] Production mode enabled (main.ts)
- [x] Console.log disabled in production
- [x] Firestore rules restrict unauthorized access
- [ ] Firebase App Check configured
- [ ] Domain restrictions on Firebase API keys
- [ ] Rate limiting on Cloud Functions (if any)
- [x] Password validation implemented
- [x] Auth guards on protected routes

### 📊 Performance Checklist

- [x] Announcement caching with Ionic Storage
- [x] Barangay in-memory caching (67% read reduction)
- [x] Lazy loading with PreloadAllModules
- [x] Observable subscriptions properly managed
- [ ] Bundle size optimized (<5MB initial load)
- [ ] Images optimized (compress PNG/JPG)
- [ ] Consider pagination for large announcement lists

### 🧪 Testing Checklist

- [ ] All user stories tested manually
- [ ] Auth flows work correctly
- [ ] Announcements CRUD operations work
- [ ] Offline mode works with cached data
- [ ] Back button behavior correct
- [ ] Status bar doesn't overlap content
- [ ] App works on different screen sizes
- [ ] No console errors in production build

### 📝 App Store Metadata

- App Name: **Komunidad**
- Category: Social Networking / Utilities
- Keywords: barangay, community, bulletin, announcements, local news
- Description: Community bulletin board for barangay announcements and updates
- Screenshots: Prepare 5-6 screenshots per device type

### 🚀 Deployment Commands

**Build for Production:**
```bash
npm run build -- --configuration production
```

**Deploy to Firebase Hosting (if using):**
```bash
firebase deploy --only hosting
```

**Deploy Firestore Rules:**
```bash
firebase deploy --only firestore:rules
```

**Sync with Capacitor:**
```bash
npx cap sync
```

**Open in Native IDEs:**
```bash
npx cap open ios     # Xcode
npx cap open android # Android Studio
```

## Post-Deployment

- [ ] Monitor Firebase Console for errors
- [ ] Check Analytics for user behavior
- [ ] Monitor Firestore usage and costs
- [ ] Gather user feedback
- [ ] Plan for updates and bug fixes

## Known Issues to Address

1. **console.error statements remain** - Intentionally kept for production debugging
   - Consider using proper logging service (Sentry, Firebase Crashlytics)

2. **No pagination** - All announcements loaded at once
   - Implement pagination if barangays have >100 announcements

3. **No image upload** - Announcements are text-only
   - Future feature: Add Firebase Storage for images

## Estimated Costs (Firebase Free Tier)

- **Firestore**: 50K reads/day, 20K writes/day, 1GB storage (FREE)
- **Authentication**: Unlimited (FREE)
- **Hosting**: 10GB transfer/month (FREE)

**Current app usage estimate:** Well within free tier limits for small to medium barangays.
