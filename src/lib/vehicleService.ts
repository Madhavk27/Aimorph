import { CurrentBuildState, StructuredVehicleAnalysis } from '../types';

export interface ApiHealthStatus {
  hasKey: boolean;
  geminiConfigured: boolean;
  status: string;
  error?: string;
}

/**
 * Safe fetch utility that inspects content-type, status, and prevents HTML JSON parse errors
 */
async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const endpoint = url;
  const method = options?.method || 'GET';
  
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (networkErr: any) {
    const errorMsg = networkErr.message || 'Network request failed';
    console.error(`[API Network Error] ${method} ${endpoint}:`, errorMsg);
    throw new Error(`Unable to reach backend API (${endpoint}): ${errorMsg}`);
  }

  const status = response.status;
  const contentType = response.headers.get('content-type') || '';

  // Log in development for tracing
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.log(`[API Trace] ${method} ${endpoint} -> HTTP ${status} (${contentType || 'no content-type'})`);
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${status}: ${response.statusText || 'Request failed'}`;
    if (contentType.includes('application/json')) {
      try {
        const jsonErr = await response.json();
        errorDetail = jsonErr.error || jsonErr.message || errorDetail;
      } catch {
        // fallback
      }
    } else {
      try {
        const rawText = await response.text();
        if (rawText && !rawText.trim().startsWith('<!')) {
          errorDetail = rawText.slice(0, 180);
        } else if (rawText.trim().startsWith('<!')) {
          errorDetail = `Backend route returned HTML (${status}) instead of JSON. Check backend server endpoints.`;
        }
      } catch {
        // fallback
      }
    }

    console.error(`[API Error Response] ${method} ${endpoint} -> ${status}:`, errorDetail);
    throw new Error(errorDetail);
  }

  if (!contentType.includes('application/json')) {
    const preview = await response.text().catch(() => '');
    const isHtml = preview.trim().startsWith('<!') || preview.includes('<html');
    const msg = isHtml
      ? `API endpoint returned HTML instead of JSON. Ensure the backend server is running and route is registered.`
      : `API endpoint returned invalid content-type (${contentType || 'unknown'}).`;
    console.error(`[API Invalid Content-Type] ${method} ${endpoint}:`, msg);
    throw new Error(msg);
  }

  try {
    const data = await response.json();
    return data as T;
  } catch (jsonParseErr: any) {
    console.error(`[API JSON Parse Error] ${method} ${endpoint}:`, jsonParseErr.message);
    throw new Error(`Failed to parse JSON response from ${endpoint}: ${jsonParseErr.message}`);
  }
}

/**
 * Check backend Gemini API connectivity safely
 */
export async function checkBackendApiHealth(): Promise<ApiHealthStatus> {
  try {
    const data = await safeFetchJson<{
      status: string;
      hasKey?: boolean;
      geminiConfigured?: boolean;
    }>('/api/health');

    const isConfigured = Boolean(data.hasKey || data.geminiConfigured);
    return {
      hasKey: isConfigured,
      geminiConfigured: isConfigured,
      status: data.status || 'ok',
    };
  } catch (err: any) {
    return {
      hasKey: false,
      geminiConfigured: false,
      status: 'error',
      error: err.message || 'Offline or unconfigured',
    };
  }
}

/**
 * Real Multimodal Vehicle Vision Analysis
 * Sends actual image (base64 or URL) to Vision Model
 */
export async function analyzeVehicleImage(
  imageOrUrl: string
): Promise<StructuredVehicleAnalysis> {
  if (!imageOrUrl) {
    throw new Error('No image provided for vehicle analysis.');
  }

  const isBase64 = imageOrUrl.startsWith('data:image/');
  const payload = isBase64
    ? { image: imageOrUrl }
    : { imageUrl: imageOrUrl };

  const responseJson = await safeFetchJson<{
    vehicleDetected?: boolean;
    make?: string;
    model?: string;
    vehicleType?: string;
    confidence?: number;
    visibleParts?: string[];
    modelUsed?: string;
    error?: string;
  }>('/api/gemini/analyze-vehicle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!responseJson) {
    throw new Error('Received an empty response from vehicle analysis API.');
  }

  return {
    vehicleDetected: Boolean(responseJson.vehicleDetected),
    make: responseJson.make || (responseJson.vehicleDetected ? 'Unknown' : 'Unknown'),
    model: responseJson.model || (responseJson.vehicleDetected ? 'Unknown' : 'Unknown'),
    vehicleType: responseJson.vehicleType || 'Vehicle',
    confidence: typeof responseJson.confidence === 'number' ? responseJson.confidence : 0.9,
    visibleParts: Array.isArray(responseJson.visibleParts)
      ? responseJson.visibleParts
      : ['headlights', 'grille', 'wheels', 'body'],
    modelUsed: responseJson.modelUsed || responseJson.model,
  };
}

export interface VehicleModificationRequest {
  type:
    | 'paint'
    | 'wheels'
    | 'grille'
    | 'headlights'
    | 'tint'
    | 'rideHeight'
    | 'bodyKit'
    | 'spoiler'
    | 'roof'
    | 'mirrors'
    | 'exhaust'
    | 'offroad'
    | 'full';
  name: string;
  details?: any;
  instruction?: string;
}

// In-memory cache for modification previews to guarantee instant responsive switching
const modificationCache = new Map<string, string>();

/**
 * Generate a unique deterministic cache key for a given car and modification state
 */
function getModificationCacheKey(
  baseImage: string,
  modification: VehicleModificationRequest,
  build: CurrentBuildState
): string {
  const imageHash = baseImage.length > 200 ? `${baseImage.slice(0, 100)}_${baseImage.slice(-50)}` : baseImage;
  return `${imageHash}_${modification.type}_${modification.name}_${build.paint}_${build.wheels}_${build.grille}_${build.style}`;
}

/**
 * Real Vehicle Modification Pipeline
 * Applies localized modification to the uploaded car while preserving the base vehicle.
 */
export async function applyVehicleModification(
  image: string,
  modification: VehicleModificationRequest,
  build: CurrentBuildState
): Promise<{ imageUrl: string; model?: string; cached?: boolean }> {
  if (!image) {
    throw new Error('Base vehicle image is required for modification.');
  }

  const cacheKey = getModificationCacheKey(image, modification, build);

  // Return cached render immediately if available
  if (modificationCache.has(cacheKey)) {
    return {
      imageUrl: modificationCache.get(cacheKey)!,
      cached: true,
      model: 'cached',
    };
  }

  const vehicleDesc =
    build.vehicle.make !== 'Unknown' && build.vehicle.model !== 'Unknown'
      ? `${build.vehicle.make} ${build.vehicle.model}`
      : 'custom vehicle';

  const payload = {
    baseImage: image,
    modificationType: modification.type,
    modificationValue: modification.name,
    vehicle: build.vehicle,
    buildDna: {
      vehicle: vehicleDesc,
      paint: build.paint,
      wheels: build.wheels,
      grille: build.grille,
      style: build.style,
      headlights: build.headlights,
      tint: build.tint,
      rideHeight: build.rideHeight,
      spoiler: build.spoiler,
      roof: build.roof,
      mirrors: build.mirrors,
      exhaust: build.exhaust,
      offroad: build.offroad,
      bodyKit: build.bodyKit,
    },
    instructionOverride: modification.instruction,
  };

  const data = await safeFetchJson<{
    imageUrl?: string;
    model?: string;
    error?: string;
  }>('/api/gemini/modify-vehicle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!data?.imageUrl) {
    throw new Error('Visual editing API did not return an image URL.');
  }

  // Cache the generated image
  modificationCache.set(cacheKey, data.imageUrl);

  return {
    imageUrl: data.imageUrl,
    model: data.model,
    cached: false,
  };
}

/**
 * Isolated AI Vehicle Preview Generation
 * Sends:
 * 1. Original uploaded image
 * 2. Detected vehicle information
 * 3. Current Build DNA
 * 4. Explicit instruction to preserve the original vehicle
 */
export async function generateVehicleVisualization(
  build: CurrentBuildState
): Promise<{ imageUrl: string; model?: string }> {
  const vehicleDesc =
    build.vehicle.make !== 'Unknown' && build.vehicle.model !== 'Unknown'
      ? `${build.vehicle.make} ${build.vehicle.model}`
      : build.vehicle.vehicleType !== 'Vehicle'
      ? build.vehicle.vehicleType
      : 'custom vehicle';

  const partsList = [
    `Paint Color & Finish: ${build.paint} (${build.paintDetails.finish})`,
    `Wheels & Fitment: ${build.wheels} (${build.wheelsDetails.size}, ${build.wheelsDetails.finish})`,
    `Grille Setup: ${build.grille} (${build.grilleDetails.finish})`,
    `Aesthetic Body Styling: ${build.style} (${build.aestheticDetails.description})`,
    `Lights: ${build.lights}`,
    `Body Fitment: ${build.bodyKit}`,
  ].join('; ');

  const prompt = `Render a photorealistic, studio-lit automotive showcase of a ${vehicleDesc} with the following custom tuning build: ${partsList}. Preserve the exact body lines, silhouette, chassis, and perspective of the base vehicle.`;

  const payload = {
    prompt,
    baseImage: build.uploadedImage || undefined,
    vehicleInfo: build.vehicle,
    buildDna: {
      vehicle: vehicleDesc,
      paint: build.paint,
      wheels: build.wheels,
      grille: build.grille,
      style: build.style,
      lights: build.lights,
      bodyKit: build.bodyKit,
    },
    aspectRatio: '16:9',
  };

  const data = await safeFetchJson<{
    imageUrl?: string;
    model?: string;
    error?: string;
  }>('/api/gemini/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!data?.imageUrl) {
    throw new Error('AI generation API did not return an image URL.');
  }

  return {
    imageUrl: data.imageUrl,
    model: data.model,
  };
}
