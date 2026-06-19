# Firebase setup

1. Create a Firebase project and add a Web app.
2. Enable Authentication providers: Google and Email/Password.
3. Create a Cloud Firestore database.
4. Add `profound-syrniki-51a45e.netlify.app` to Authentication authorized domains.
5. Replace the empty values in `firebase-config.js` with the Web app configuration.
6. Publish `firestore.rules` in Firestore Rules.
7. Redeploy the site.

Each signed-in user stores one document at `users/{uid}`. Firestore rules restrict access to the matching authenticated user.
