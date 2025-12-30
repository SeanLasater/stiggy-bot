import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// On Cloud Run/GCP: Automatically uses default service account (no JSON needed)
// Locally: For testing, run `gcloud auth application-default login` or set GOOGLE_APPLICATION_CREDENTIALS env var
if (!admin.apps.length) {
  admin.initializeApp();  // Parameter-less init detects GCP environment automatically
}

export const auth = admin.auth();
export const firestore = admin.firestore();

// Optional: Enhance Firestore settings for better performance
firestore.settings({
  ignoreUndefinedProperties: true,  // Prevents errors with undefined fields
});

export default admin;