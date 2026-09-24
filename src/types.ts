export type ScreenType =
  | 'home'
  | 'upload'
  | 'analysis'
  | '3d-view'
  | 'customize'
  | 'synthesis'
  | 'result'
  | 'explore'
  | 'my-builds'
  | 'profile'
  | 'ai-chat'
  | 'search-intel'
  | 'live-voice'
  | 'veo-studio';

export type CategoryFilter =
  | 'ALL'
  | 'STEALTH'
  | 'SPORT'
  | 'SPORTS'
  | 'URBAN'
  | 'OFF-ROAD'
  | 'PERFORMANCE'
  | 'LUXURY'
  | 'JDM'
  | 'SUV';

export interface PaintColorOption {
  id: string;
  name: string;
  hex: string;
  finish: string;
  ringClass?: string;
  price?: number;
}

export interface WheelOption {
  id: string;
  name: string;
  size: string;
  description: string;
  finish: string;
  price?: number;
}

export interface GrilleOption {
  id: string;
  name: string;
  type: 'factory' | 'blacked-out' | 'sport';
  description: string;
  finish: string;
}

export interface AestheticOption {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  features: string[];
  price?: number;
}

export interface StructuredVehicleAnalysis {
  vehicleDetected: boolean;
  make: string;
  model: string;
  vehicleType: string;
  confidence: number;
  visibleParts: string[];
  modelUsed?: string;
  error?: string;
}

export interface DetectedVehicleInfo {
  isVehicle: boolean;
  confidence: number;
  make: string;
  model: string;
  modelIdentified: boolean;
  year?: string;
  vehicleType: string;
  bodyShape?: string;
  colorDetected?: string;
  visibleParts?: string[] | {
    grille?: string;
    wheels?: string;
    headlights?: string;
    stance?: string;
    bodyCondition?: string;
  };
  cameraAngle?: string;
  summary?: string;
  error?: string;
}

export interface CurrentBuildState {
  uploadedImage: string | null;
  imageDimensions?: { width: number; height: number };
  vehicle: {
    make: string;
    model: string;
    year?: string;
    vehicleType?: string;
    detected: boolean;
    confidence?: number;
    visibleParts?: string[];
  };
  paint: string; // e.g. "Obsidian Black"
  paintDetails: PaintColorOption;
  wheels: string; // e.g. "Forged Sport"
  wheelsDetails: WheelOption;
  grille: string; // e.g. "Blacked Out Grille"
  grilleDetails: GrilleOption;
  lights: string; // e.g. "Matrix LED Headlights"
  headlights?: string;
  tint?: string;
  rideHeight?: string;
  spoiler?: string;
  roof?: string;
  mirrors?: string;
  exhaust?: string;
  offroad?: string;
  bodyKit: string; // e.g. "Aero Widebody Kit"
  style: string; // e.g. "Stealth Matte"
  aestheticDetails: AestheticOption;
  customPrompt?: string;
  generatedImage: string | null;
}

export interface DiagnosticTelemetry {
  uploadStatus: 'idle' | 'loaded';
  imageLoaded: boolean;
  imageDimensions: string;
  visionApiStatus: 'Connected' | 'Not Connected' | 'Not Configured' | 'Checking...';
  analysisRequestStatus: 'Idle' | 'Sent' | 'Failed' | 'In-Flight';
  analysisResponseStatus: 'Idle' | 'Received' | 'Failed' | 'Error';
  vehicleDetected: 'Yes' | 'No' | 'Not Checked';
  detectedMake?: string;
  detectedModel?: string;
  customizationState: 'Connected' | 'Disconnected';
  generationApiStatus: 'Connected' | 'Not Connected' | 'Not Configured' | 'Checking...';
  lastError: string | null;
  timestamp?: string;
}

export interface CustomizationConfig {
  baseVehicleName: string;
  baseVehicleYear?: string;
  paint: PaintColorOption;
  wheels: WheelOption;
  grille: GrilleOption;
  aesthetic: AestheticOption;
  brakeCalipers?: string;
  windowTint?: string;
  exhaust?: string;
  suspensionLowering?: string;
  customNotes?: string;
  promptOverride?: string;
}

export interface CarPreset {
  id: string;
  name: string;
  year: string;
  category: 'SUV' | 'SPORTS' | 'JDM' | 'LUXURY' | 'OFF-ROAD';
  stockImage: string;
  studioImage: string;
  analyzingImage: string;
  customizedImages?: Record<string, string>;
  defaultConfig: CustomizationConfig;
  specs: {
    engine: string;
    drivetrain: string;
    power: string;
    curbWeight: string;
  };
  basePrice?: string;
  isFeatured?: boolean;
}

export interface UserCarUpload {
  id: string;
  userId: string;
  carName: string;
  imageUrl: string;
  detectedModel?: string;
  status: 'scanned' | 'ready' | 'processing';
  createdAt: string;
}

export interface BuildItem {
  id: string;
  title: string;
  baseModel: string;
  author: string;
  authorHandle?: string;
  authorAvatar?: string;
  authorId?: string;
  date: string;
  likes: number;
  commentsCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isPublic: boolean;
  category: CategoryFilter;
  tags: string[];
  originalImage: string;
  modifiedImage: string;
  videoUrl?: string;
  prompt?: string;
  config: CustomizationConfig;
  summaryItems: { title: string; subtitle: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedBuildItem {
  id: string;
  userId: string;
  buildId: string;
  savedAt: string;
  buildSnapshot?: Partial<BuildItem>;
}

export interface BuildComment {
  id: string;
  buildId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  authorHandle?: string;
  text: string;
  createdAt: string;
}

export interface BuildLike {
  id: string;
  userId: string;
  buildId: string;
  createdAt: string;
}

export interface ModificationShop {
  id: string;
  name: string;
  city: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  verified: boolean;
  phone?: string;
  website?: string;
  avatar?: string;
  coverImage: string;
  badges?: string[];
}

export interface PartProduct {
  id: string;
  name: string;
  brand: string;
  partNumber?: string;
  category: 'EXHAUST' | 'WHEELS' | 'SUSPENSION' | 'AERO' | 'PERFORMANCE' | 'BRAKES' | 'LIGHTING';
  price: number;
  rating: number;
  reviewsCount?: number;
  image: string;
  fitment: string[];
  inStock: boolean;
  specDetails?: string;
}

export interface UserProfile {
  uid?: string;
  email?: string;
  name: string;
  handle: string;
  tier: string;
  since: string;
  avatar: string;
  bio?: string;
  stats: {
    created: number;
    saved: number;
    shared: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  roleType?: 'master-tuner' | 'aero-engineer' | 'ecu-specialist' | 'concierge';
}

export interface SearchGroundingResult {
  query: string;
  answer: string;
  carModel?: string;
  groundingChunks: {
    web?: {
      uri: string;
      title: string;
    };
  }[];
  webSearchQueries: string[];
  timestamp: string;
}

export type MorphOrbState = 'idle' | 'listening' | 'thinking' | 'generating' | 'completed';

export interface MorphRecommendation {
  paintName: string;
  paintHex: string;
  paintId?: string;
  wheelsName: string;
  wheelsSize?: string;
  wheelsId?: string;
  aeroPackage: string;
  aeroId?: string;
  grilleAero?: string;
  stance?: string;
  packageStyle?: string;
  buildDna: string;
  rationale?: string;
  reaction: string;
  configUpdates: Partial<CustomizationConfig>;
}

export interface MorphMessage {
  id: string;
  role: 'user' | 'morph';
  text: string;
  timestamp: string;
  recommendation?: MorphRecommendation;
  buildDna?: string;
  isActionable?: boolean;
}

