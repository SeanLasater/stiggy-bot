// src/database/firestore.ts
import { firestore } from './firebase';
import type { DocumentData } from 'firebase-admin/firestore';

// Collections we'll use
const tunesCollection = firestore.collection('tunes');
const usersCollection = firestore.collection('users');

// Helper types (we'll expand these later)
export interface Tune {
  id?: string;
  car: string;
  track?: string;
  pp: number;
  power: number;
  weight: number;
  authorId: string;
  authorName: string;
  settings: Record<string, any>;
  likes: string[]; // array of user IDs
  createdAt: Date;
  updatedAt: Date;
}

// Save or update a tune
export async function saveTune(tune: Omit<Tune, 'id' | 'createdAt' | 'updatedAt' | 'likes'>): Promise<string> {
  const now = new Date();
  const docRef = await tunesCollection.add({
    ...tune,
    likes: [],
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

// Get a tune by ID
export async function getTune(tuneId: string): Promise<Tune | null> {
  const doc = await tunesCollection.doc(tuneId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Tune;
}

// Get all tunes by a user
export async function getUserTunes(userId: string): Promise<Tune[]> {
  const snapshot = await tunesCollection.where('authorId', '==', userId).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tune));
}

// Like a tune
export async function likeTune(tuneId: string, userId: string): Promise<void> {
  const tuneRef = tunesCollection.doc(tuneId);
  await firestore.runTransaction(async (transaction) => {
    const doc = await transaction.get(tuneRef);
    if (!doc.exists) throw new Error('Tune not found');

    const data = doc.data() as Tune;
    const likes = data.likes || [];

    if (likes.includes(userId)) {
      // Unlike
      transaction.update(tuneRef, {
        likes: likes.filter(id => id !== userId),
        updatedAt: new Date(),
      });
    } else {
      // Like
      transaction.update(tuneRef, {
        likes: [...likes, userId],
        updatedAt: new Date(),
      });
    }
  });
}