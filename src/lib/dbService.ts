import {
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
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  UserProfile,
  CarPreset,
  UserCarUpload,
  BuildItem,
  SavedBuildItem,
  BuildComment,
  ModificationShop,
  PartProduct,
} from '../types';
import {
  CAR_PRESETS,
  COMMUNITY_BUILDS,
  MODIFICATION_SHOPS,
  PARTS_PRODUCTS,
  INITIAL_COMMENTS,
  USER_PROFILE,
} from '../data/mockData';

// ----------------------------------------------------
// 1. Users Collection
// ----------------------------------------------------
export async function getOrCreateUserProfile(userId: string, userAuthData: { email?: string | null; displayName?: string | null; photoURL?: string | null }): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return { ...snap.data(), uid: userId } as UserProfile;
    }
    
    // Create new profile in Firestore
    const newProfile: UserProfile = {
      uid: userId,
      email: userAuthData.email || '',
      name: userAuthData.displayName || 'Tuner Creator',
      handle: `@${(userAuthData.displayName || 'tuner').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      tier: 'AutoMorph Pro',
      since: new Date().getFullYear().toString(),
      avatar: userAuthData.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      bio: 'Automotive Enthusiast & AI Car Designer',
      stats: { created: 1, saved: 0, shared: 0 },
    };

    await setDoc(userRef, {
      ...newProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return newProfile;
  } catch (error) {
    console.warn('Using fallback user profile due to Firestore error:', error);
    return {
      uid: userId,
      email: userAuthData.email || '',
      name: userAuthData.displayName || USER_PROFILE.name,
      handle: userAuthData.displayName ? `@${userAuthData.displayName.toLowerCase().replace(/\s+/g, '')}` : USER_PROFILE.handle,
      tier: USER_PROFILE.tier,
      since: USER_PROFILE.since,
      avatar: userAuthData.photoURL || USER_PROFILE.avatar,
      bio: USER_PROFILE.bio,
      stats: USER_PROFILE.stats,
    };
  }
}

export async function updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Failed to update user profile in Firestore:', error);
  }
}

// ----------------------------------------------------
// 2. Cars Collection (Presets & Catalog)
// ----------------------------------------------------
export async function getCarsCatalog(): Promise<CarPreset[]> {
  try {
    const carsCol = collection(db, 'cars');
    const snapshot = await getDocs(carsCol);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CarPreset));
    }
  } catch (err) {
    console.warn('Could not fetch cars catalog from Firestore, falling back to presets:', err);
  }
  return CAR_PRESETS;
}

// ----------------------------------------------------
// 3. User Car Uploads Collection
// ----------------------------------------------------
export async function saveUserCarUpload(upload: Omit<UserCarUpload, 'id' | 'createdAt'>): Promise<string> {
  try {
    const uploadsCol = collection(db, 'userCarUploads');
    const docRef = await addDoc(uploadsCol, {
      ...upload,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    console.error('Failed to save user car upload:', err);
    return `upload-${Date.now()}`;
  }
}

export function subscribeUserUploads(userId: string, callback: (uploads: UserCarUpload[]) => void): Unsubscribe {
  try {
    const q = query(
      collection(db, 'userCarUploads'),
      where('userId', '==', userId),
      limit(20)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const uploads = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserCarUpload));
        callback(uploads);
      },
      (error) => {
        console.warn('User uploads subscription error:', error);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// ----------------------------------------------------
// 4. Builds Collection (AI Generated & User Garage)
// ----------------------------------------------------
export async function createBuild(buildData: Omit<BuildItem, 'id'> & { id?: string }): Promise<string> {
  try {
    const buildsCol = collection(db, 'builds');
    const timestamp = new Date().toISOString();
    const docRef = await addDoc(buildsCol, {
      ...buildData,
      likes: buildData.likes || 1,
      commentsCount: buildData.commentsCount || 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Also update user's creation stats in background
    if (buildData.authorId && buildData.authorId !== 'guest-author') {
      try {
        const userRef = doc(db, 'users', buildData.authorId);
        await updateDoc(userRef, {
          'stats.created': increment(1),
          updatedAt: timestamp,
        });
      } catch (_) {}
    }

    return docRef.id;
  } catch (err) {
    console.error('Failed to create build in Firestore:', err);
    throw err;
  }
}

export async function deleteBuild(buildId: string, authorId: string): Promise<boolean> {
  try {
    const buildRef = doc(db, 'builds', buildId);
    await deleteDoc(buildRef);
    
    // Decrement user created stats
    if (authorId && authorId !== 'guest-author') {
      try {
        const userRef = doc(db, 'users', authorId);
        await updateDoc(userRef, {
          'stats.created': increment(-1),
        });
      } catch (_) {}
    }
    return true;
  } catch (err) {
    console.error('Failed to delete build from Firestore:', err);
    return false;
  }
}

export async function toggleBuildVisibility(buildId: string, isPublic: boolean): Promise<void> {
  try {
    const buildRef = doc(db, 'builds', buildId);
    await updateDoc(buildRef, {
      isPublic,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to update build visibility:', err);
  }
}

export function subscribeCommunityBuilds(callback: (builds: BuildItem[]) => void): Unsubscribe {
  try {
    const q = query(
      collection(db, 'builds'),
      where('isPublic', '==', true),
      limit(30)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched: BuildItem[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: data.title || 'Custom Build',
              baseModel: data.baseModel || 'Sports Car',
              author: data.authorName || data.author || 'Tuner',
              authorHandle: data.authorHandle || '@tuner',
              authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
              authorId: data.authorId,
              date: data.createdAt
                ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : data.date || 'Recent',
              likes: data.likes || 1,
              commentsCount: data.commentsCount || 0,
              isLiked: false,
              isPublic: true,
              category: data.category || 'SPORTS',
              tags: data.tags || ['CUSTOM', 'AI'],
              originalImage: data.originalImage,
              modifiedImage: data.modifiedImage,
              videoUrl: data.videoUrl,
              prompt: data.prompt,
              config: data.config,
              summaryItems: data.summaryItems || [],
              createdAt: data.createdAt,
            };
          });

          // Merge with sample builds if needed
          const combined = [
            ...fetched,
            ...COMMUNITY_BUILDS.filter((cb) => !fetched.some((fb) => fb.title === cb.title)),
          ];
          callback(combined);
        } else {
          callback(COMMUNITY_BUILDS);
        }
      },
      (error) => {
        console.warn('Community builds snapshot subscription error:', error);
        callback(COMMUNITY_BUILDS);
      }
    );
  } catch (e) {
    callback(COMMUNITY_BUILDS);
    return () => {};
  }
}

export function subscribeUserGarage(userId: string, callback: (builds: BuildItem[]) => void): Unsubscribe {
  if (!userId) {
    callback([]);
    return () => {};
  }
  try {
    const q = query(
      collection(db, 'builds'),
      where('authorId', '==', userId),
      limit(50)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const userBuilds: BuildItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || 'Custom Garage Build',
            baseModel: data.baseModel || 'Vehicle',
            author: data.authorName || data.author || 'Me',
            authorHandle: data.authorHandle || '@me',
            authorAvatar: data.authorAvatar,
            authorId: data.authorId,
            date: data.createdAt
              ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recent',
            likes: data.likes || 1,
            commentsCount: data.commentsCount || 0,
            isLiked: false,
            isSaved: true,
            isPublic: data.isPublic !== false,
            category: data.category || 'SPORTS',
            tags: data.tags || ['GARAGE', 'MY BUILD'],
            originalImage: data.originalImage,
            modifiedImage: data.modifiedImage,
            videoUrl: data.videoUrl,
            prompt: data.prompt,
            config: data.config,
            summaryItems: data.summaryItems || [],
            createdAt: data.createdAt,
          };
        });
        callback(userBuilds);
      },
      (error) => {
        console.warn('Garage subscription notice:', error);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// ----------------------------------------------------
// 5. Likes Collection & Counters
// ----------------------------------------------------
export async function toggleLike(userId: string, buildId: string, isCurrentlyLiked: boolean): Promise<boolean> {
  const likeDocId = `${userId}_${buildId}`;
  const likeRef = doc(db, 'likes', likeDocId);
  const buildRef = doc(db, 'builds', buildId);

  try {
    if (isCurrentlyLiked) {
      // Unlike
      await deleteDoc(likeRef);
      try {
        await updateDoc(buildRef, { likes: increment(-1) });
      } catch (_) {}
      return false;
    } else {
      // Like
      await setDoc(likeRef, {
        userId,
        buildId,
        createdAt: new Date().toISOString(),
      });
      try {
        await updateDoc(buildRef, { likes: increment(1) });
      } catch (_) {}
      return true;
    }
  } catch (error) {
    console.warn('Like toggle warning (using client-side update):', error);
    return !isCurrentlyLiked;
  }
}

// ----------------------------------------------------
// 6. Comments Collection
// ----------------------------------------------------
export function subscribeComments(buildId: string, callback: (comments: BuildComment[]) => void): Unsubscribe {
  try {
    const q = query(
      collection(db, 'comments'),
      where('buildId', '==', buildId),
      limit(50)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const comments: BuildComment[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          } as BuildComment));
          callback(comments);
        } else {
          // Fallback to initial comments matching buildId
          const mockMatch = INITIAL_COMMENTS.filter((c) => c.buildId === buildId);
          callback(mockMatch);
        }
      },
      (error) => {
        console.warn('Comments subscription warning:', error);
        callback(INITIAL_COMMENTS.filter((c) => c.buildId === buildId));
      }
    );
  } catch (e) {
    callback(INITIAL_COMMENTS.filter((c) => c.buildId === buildId));
    return () => {};
  }
}

export async function addComment(comment: Omit<BuildComment, 'id' | 'createdAt'>): Promise<string> {
  try {
    const commentsCol = collection(db, 'comments');
    const docRef = await addDoc(commentsCol, {
      ...comment,
      createdAt: new Date().toISOString(),
    });

    // Increment commentsCount in the build
    try {
      const buildRef = doc(db, 'builds', comment.buildId);
      await updateDoc(buildRef, {
        commentsCount: increment(1),
      });
    } catch (_) {}

    return docRef.id;
  } catch (err) {
    console.error('Failed to post comment:', err);
    throw err;
  }
}

// ----------------------------------------------------
// 7. Modification Shops & Parts Products
// ----------------------------------------------------
export async function getModificationShops(): Promise<ModificationShop[]> {
  try {
    const shopsCol = collection(db, 'modificationShops');
    const snap = await getDocs(shopsCol);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ModificationShop));
    }
  } catch (e) {
    console.warn('Using local modification shops:', e);
  }
  return MODIFICATION_SHOPS;
}

export async function getPartsProducts(): Promise<PartProduct[]> {
  try {
    const partsCol = collection(db, 'partsProducts');
    const snap = await getDocs(partsCol);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PartProduct));
    }
  } catch (e) {
    console.warn('Using local parts products:', e);
  }
  return PARTS_PRODUCTS;
}
