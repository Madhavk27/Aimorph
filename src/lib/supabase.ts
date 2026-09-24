import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CurrentBuildState, UserProfile, SavedBuildItem, BuildItem, BuildComment } from '../types';

// Environment variables for Supabase Free tier
const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '';
const SUPABASE_ANON_KEY = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Check if Supabase client credentials are fully configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('your-supabase-project') &&
    SUPABASE_URL.startsWith('https://')
  );
}

/**
 * Get or initialize the Supabase client safely
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  if (isSupabaseConfigured()) {
    try {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

// ----------------------------------------------------
// Image Compression Utility (Client-side ₹0 Cost)
// ----------------------------------------------------
/**
 * Compresses an image data URL or Blob before storage upload to save storage space and bandwidth
 */
export async function compressImageForUpload(
  imageDataOrUrl: string,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.82
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Scale down proportionally if larger than maximum constraints
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available for compression'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create compressed image blob'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = (e) => reject(new Error('Failed to load image for compression'));
    img.src = imageDataOrUrl;
  });
}

// ----------------------------------------------------
// Supabase Storage: User-Specific Vehicle Assets
// Structure: cars/{user_id}/{car_id}/original
//            cars/{user_id}/{car_id}/generated
// ----------------------------------------------------
export async function uploadVehicleImageToSupabase(params: {
  userId: string;
  carId: string;
  imageDataOrUrl: string;
  type: 'original' | 'generated';
}): Promise<{ url: string; path: string } | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('[Supabase Storage] Supabase credentials not set, returning local data URL');
    return { url: params.imageDataOrUrl, path: `local/${params.type}` };
  }

  try {
    // Compress image blob to stay well under free tier storage limits
    const compressedBlob = await compressImageForUpload(params.imageDataOrUrl);
    const timestamp = Date.now();
    const filePath = `${params.userId}/${params.carId}/${params.type}_${timestamp}.jpg`;

    const { data, error } = await supabase.storage
      .from('cars')
      .upload(filePath, compressedBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn('[Supabase Storage Upload Error]', error.message);
      return { url: params.imageDataOrUrl, path: filePath };
    }

    const { data: publicUrlData } = supabase.storage
      .from('cars')
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error('[Supabase Storage Exception]', err);
    return { url: params.imageDataOrUrl, path: `fallback/${params.type}` };
  }
}

// ----------------------------------------------------
// Supabase Database: Builds & Build DNA
// ----------------------------------------------------
export interface SupabaseBuildRecord {
  id?: string;
  user_id: string;
  car_id: string;
  vehicle_make: string;
  vehicle_model: string;
  original_image_url: string;
  generated_image_url?: string;
  paint: string;
  wheels: string;
  grille: string;
  lights: string;
  body_kit: string;
  ride_height: string;
  style: string;
  build_dna: string;
  created_at?: string;
}

export async function saveBuildToSupabase(
  build: CurrentBuildState,
  userId: string,
  carId: string,
  originalUrl?: string,
  generatedUrl?: string
): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const buildDnaString = `${build.vehicle.make} ${build.vehicle.model} • ${build.paint} • ${build.wheels} • ${build.style}`;

    const payload: SupabaseBuildRecord = {
      user_id: userId,
      car_id: carId,
      vehicle_make: build.vehicle.make || 'Custom',
      vehicle_model: build.vehicle.model || 'Vehicle',
      original_image_url: originalUrl || build.uploadedImage || '',
      generated_image_url: generatedUrl || build.generatedImage || undefined,
      paint: build.paint,
      wheels: build.wheels,
      grille: build.grille,
      lights: build.lights,
      body_kit: build.bodyKit,
      ride_height: build.rideHeight,
      style: build.style,
      build_dna: buildDnaString,
    };

    const { data, error } = await supabase
      .from('builds')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      console.warn('[Supabase Save Build Error]', error.message);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('[Supabase Save Build Exception]', err);
    return null;
  }
}

export async function getUserBuildsFromSupabase(userId: string): Promise<SupabaseBuildRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('builds')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Fetch Builds Error]', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Supabase Fetch Builds Exception]', err);
    return [];
  }
}

// ----------------------------------------------------
// Supabase Community Posts & Comments
// ----------------------------------------------------
export async function getCommunityPostsFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, profiles(name, avatar, handle)')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.warn('[Supabase Community Error]', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Supabase Community Exception]', err);
    return null;
  }
}
