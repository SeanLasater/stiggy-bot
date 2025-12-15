// src/database/test-firebase.ts
import { firestore } from './firebase';

async function testFirebase() {
  try {
    // Write a tiny test document
    await firestore.collection('test').doc('connection').set({
      message: 'Stiggy is alive!',
      timestamp: new Date().toISOString(),
    });

    // Read it back
    const doc = await firestore.collection('test').doc('connection').get();
    if (doc.exists) {
      console.log('Firebase connection successful!');
      console.log('Data:', doc.data());
    }

    // Clean up
    await firestore.collection('test').doc('connection').delete();
    console.log('Test document cleaned up');
    process.exit(0);
  } catch (error) {
    console.error('Firebase test failed:', error);
    process.exit(1);
  }
}

testFirebase();