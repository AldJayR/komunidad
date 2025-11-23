# Barangay Bulletin Board - MVP Tasks

This task list is derived from the `requirements.md` user stories.

## 1. Project Setup & Configuration
- [x] **Firebase Setup**
    - [x] Create Firebase Project in Console.
    - [x] Enable Authentication (Email/Password).
    - [x] Enable Firestore Database.
    - [ ] Create `barangays` collection with initial data.
- [x] **Angular/Ionic Configuration**
    - [x] Install Firebase/AngularFire dependencies (`npm install firebase @angular/fire`).
    - [x] Configure `environment.ts` and `environment.prod.ts` with Firebase config keys.
    - [x] Install Ionic Storage for offline caching (`npm install @ionic/storage-angular`).
    - [x] Configure `IonicStorageModule` in `main.ts` or `app.module.ts`.

## 2. Services (Core Logic)
- [x] **AuthService**
    - [x] Implement `login(email, password)`.
    - [x] Implement `register(email, password, role, barangayId)`.
    - [x] Implement `logout()`.
    - [x] Implement session persistence (auto-login check).
    - [x] Implement `getUserProfile()` to get role and barangay info.
- [x] **BarangayService**
    - [x] Implement `getBarangays()` to fetch list for registration dropdowns.
- [x] **AnnouncementService**
    - [x] Implement `getAnnouncements(barangayId)` (for Residents).
    - [x] Implement `getMyAnnouncements(officialId)` (for Officials).
    - [x] Implement `createAnnouncement(data)`.
    - [x] Implement `updateAnnouncement(id, data)`.
    - [x] Implement `deleteAnnouncement(id)`.
    - [x] Implement Caching Logic (Save/Load from Storage when offline).

## 3. Authentication UI
- [x] **Login Page**
    - [x] Create UI (Email, Password inputs, Login button).
    - [x] Connect to `AuthService.login`.
    - [x] Handle errors (show toast/alert).
    - [x] Link to Register Page.
- [x] **Register Page**
    - [x] Create UI (Email, Password, Confirm Password).
    - [x] Add Role Selection (Resident vs Official) - *Optional if separate flows preferred*.
    - [x] Add Barangay Selection (Dropdown populated by `BarangayService`).
    - [x] Connect to `AuthService.register`.## 4. Resident Features
- [x] **Resident Dashboard (Home)**
    - [x] Fetch and display list of announcements for user's barangay.
    - [x] Implement Pull-to-Refresh.
    - [x] Display basic details (Title, Category, Date).
- [x] **Announcement Detail View**
    - [x] Create page/modal to show full details.
    - [x] Display Title, Description, Category, Date.

## 5. Barangay Official Features
- [x] **Official Dashboard**
    - [x] Fetch and display list of *own* announcements.
    - [x] Add "Create New" FAB (Floating Action Button).
- [x] **Create/Edit Announcement**
    - [x] Create Form (Title, Description, Category).
    - [x] Implement "Create" logic.
    - [x] Implement "Update" logic (pre-fill form data).
- [x] **Delete Functionality**
    - [x] Add Delete button to list items or detail view.
    - [x] Add Confirmation Alert before deleting.

## 6. Shared / System
- [x] **UI Components**
    - [x] Implement Loading Indicator service/utility.
    - [x] Implement Error Handling service (Toasts/Alerts).
- [x] **Navigation**
    - [x] Configure Routing/Guards (redirect to Login if not auth, redirect to appropriate dashboard based on role).
