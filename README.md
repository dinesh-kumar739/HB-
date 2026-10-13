# HB+ Auth

Cross-platform app (Expo + React Native + React Native Web) with Google login restricted to `@hbplus.fit` email accounts. One codebase runs on web, Android and iOS.

Live demo: https://hbplush.netlify.app

## Tech stack
React Native (Expo), Expo Router, React Native Web, Google OAuth 2.0, Firebase Authentication, Cloud Firestore.

## Folder structure
```
src/
  app/                  routes: _layout.tsx, index.tsx, login.tsx, dashboard.tsx
  components/           GoogleButton, HoverCard, Logo
  config/firebase.ts    Firebase setup
  context/AuthContext.tsx   login, logout, domain check, role
  services/domain.ts    domain validation
  services/useGoogleNative*.ts   Google sign-in for mobile
  theme/index.ts        colors and spacing
```
Firebase Authentication and Firestore act as the backend, so no custom server is required.

## Setup
1. `npm install`
2. Create a Firebase project, enable Authentication with the Google provider, and create a Firestore database.
3. Add a Web app in Firebase and copy its config values.
4. Create a `.env` file in the project root:
```
EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```
5. In Firebase Authentication > Settings > Authorized domains, add `localhost` and the deployed domain.
6. Publish the Firestore rules given below.
7. Run `npx expo start` and press `w` for web.

## Authentication flow
1. The user taps Login with Google and picks an account in the Google popup.
2. Google authenticates the user and returns to Firebase Authentication.
3. `onAuthStateChanged` in `AuthContext` receives the user and checks the email domain.
4. If the domain is allowed, the user document is created or updated in Firestore, the role is loaded and the user is taken to the dashboard.
5. Otherwise the user is signed out immediately and sees: "Access restricted. Please login using your official domain email."
6. Logout signs the user out and the dashboard becomes unreachable again.

## How domain restriction works
- `isAllowedEmail()` in `src/services/domain.ts` compares the exact text after the last `@` with `hbplus.fit`.
- The `hd` parameter sent to Google only filters the account chooser and is not trusted.
- Firestore rules check `request.auth.token.email` and `email_verified` on the server side, so an account outside the domain cannot read or write data even if the client is modified.

## Protected routes
`Stack.Protected` in `src/app/_layout.tsx` exposes `/login` only to logged-out users and `/dashboard` only to logged-in users. Opening `/dashboard` directly without a session redirects to the login page.

## Roles
New users are stored in `users/{uid}` with `role: "user"`. An admin is created by changing the `role` field to `admin` in the Firebase console. Firestore rules stop users from changing their own role. Admins see an extra admin panel on the dashboard.

## Token handling
Tokens are managed by the Firebase SDK, which stores the session and refreshes it automatically. The app never stores tokens manually and never logs them. No secrets are committed; configuration is read from `.env`, which is git-ignored. Access is enforced on the client (route guards and domain check) and on the server side (Firestore rules). A custom backend that verifies ID tokens with `firebase-admin` and issues HttpOnly cookies can be added for stricter enforcement.

## Platform status
The web version is deployed and tested. The mobile Google sign-in code is included (`useGoogleNative.native.ts`) but needs Android and iOS OAuth client IDs and a development build, and has not been tested on a device.

## Firestore rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function allowedDomain() {
      return request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email.matches('.*@hbplus[.]fit$');
    }
    match /users/{uid} {
      allow read: if allowedDomain() && request.auth.uid == uid;
      allow create: if allowedDomain() && request.auth.uid == uid && request.resource.data.role == 'user';
      allow update: if allowedDomain() && request.auth.uid == uid && request.resource.data.role == resource.data.role;
      allow delete: if false;
    }
  }
}
```