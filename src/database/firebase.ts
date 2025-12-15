// src/database/firebase.ts
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load the service account key (safe because it's gitignored)
const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Initialize only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin initialized successfully');
} else {
  console.log('Firebase Admin already initialized');
}

export default admin;
export const firestore = admin.firestore();