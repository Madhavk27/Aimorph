import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { BuildItem, UserProfile } from '../types';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with custom database ID specified in config
export const db: Firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      // Sync user profile to Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email || '',
          name: user.displayName || 'Creator',
          handle: `@${(user.displayName || 'tuner').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          avatar:
            user.photoURL ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          tier: 'AutoMorph Pro',
          bio: 'Automotive Enthusiast & AI Car Designer',
          stats: { created: 1, saved: 0, shared: 0 },
          createdAt: new Date().toISOString(),
        });
      }
    }
    return user;
  } catch (error: any) {
    console.warn('Google sign-in error:', error);
    // If popup blocked or cancelled, try anonymous
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
      throw error;
    }
    throw error;
  }
}

export async function signInDemoGuest() {
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.error('Anonymous sign-in error:', err);
    throw err;
  }
}

export async function signOutUser() {
  await signOut(auth);
}

export async function syncUserProfile(
  userId: string,
  profile: Partial<UserProfile>
) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, profile, { merge: true });
  } catch (e) {
    console.error('Failed to sync profile to firestore:', e);
  }
}

export async function fetchUserFromFirestore(
  userId: string
): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (e) {
    console.warn('Could not fetch user profile from firestore:', e);
  }
  return null;
}

export async function saveBuildToFirestore(build: Omit<BuildItem, 'id'> & { id?: string }): Promise<string> {
  try {
    const buildsCol = collection(db, 'builds');
    const docRef = await addDoc(buildsCol, {
      ...build,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (e) {
    console.error('Failed to save build to firestore:', e);
    throw e;
  }
}

export async function toggleLikeInFirestore(buildId: string, incrementVal: number) {
  try {
    const buildRef = doc(db, 'builds', buildId);
    await updateDoc(buildRef, {
      likes: increment(incrementVal),
    });
  } catch (e) {
    console.warn('Could not increment likes in firestore:', e);
  }
}
