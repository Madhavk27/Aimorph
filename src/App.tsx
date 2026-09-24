import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { UploadScreen } from './components/UploadScreen';
import { AnalysisScreen } from './components/AnalysisScreen';
import { ThreeDViewScreen } from './components/3DViewScreen';
import { CustomizerScreen } from './components/CustomizerScreen';
import { SynthesisScreen } from './components/SynthesisScreen';
import { ResultScreen } from './components/ResultScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AIChatScreen } from './components/AIChatScreen';
import { SearchIntelScreen } from './components/SearchIntelScreen';
import { LiveVoiceScreen } from './components/LiveVoiceScreen';
import { VeoVideoStudio } from './components/VeoVideoStudio';
import { BuildDetailModal } from './components/BuildDetailModal';
import { ShareModal } from './components/ShareModal';
import { UpgradeModal } from './components/UpgradeModal';
import { MorphAssistant } from './components/MorphAssistant';
import { DiagnosticPanel } from './components/DiagnosticPanel';

import {
  auth,
  signInWithGoogle,
  signOutUser,
} from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

import {
  getOrCreateUserProfile,
  updateUserProfile,
  subscribeCommunityBuilds,
  subscribeUserGarage,
  createBuild,
  toggleLike,
  saveUserCarUpload,
} from './lib/dbService';

import {
  CAR_PRESETS,
  DEFAULT_CUSTOMIZATION,
  COMMUNITY_BUILDS,
  USER_PROFILE,
  USER_BUILDS,
} from './data/mockData';
import { checkBackendApiHealth } from './lib/vehicleService';
import {
  ScreenType,
  CarPreset,
  CustomizationConfig,
  BuildItem,
  UserProfile,
  MorphOrbState,
  DetectedVehicleInfo,
  CurrentBuildState,
  DiagnosticTelemetry,
} from './types';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedCar, setSelectedCar] = useState<CarPreset>(CAR_PRESETS[0]);
  const [customImage, setCustomImage] = useState<string | undefined>(undefined);
  const [generatedVisualUrl, setGeneratedVisualUrl] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<CustomizationConfig>(DEFAULT_CUSTOMIZATION);
  const [detectedInfo, setDetectedInfo] = useState<DetectedVehicleInfo | null>(null);

  // Central Build State (STEP 4)
  const [currentBuild, setCurrentBuild] = useState<CurrentBuildState>({
    uploadedImage: null,
    imageDimensions: { width: 1920, height: 1080 },
    vehicle: {
      make: CAR_PRESETS[0].name.split(' ')[0],
      model: CAR_PRESETS[0].name,
      year: CAR_PRESETS[0].year,
      vehicleType: CAR_PRESETS[0].category,
      detected: false,
      confidence: 0,
    },
    paint: DEFAULT_CUSTOMIZATION.paint.name,
    paintDetails: DEFAULT_CUSTOMIZATION.paint,
    wheels: DEFAULT_CUSTOMIZATION.wheels.name,
    wheelsDetails: DEFAULT_CUSTOMIZATION.wheels,
    grille: DEFAULT_CUSTOMIZATION.grille.name,
    grilleDetails: DEFAULT_CUSTOMIZATION.grille,
    lights: 'LED Projector Matrix',
    bodyKit: 'Stealth Aero Package',
    style: DEFAULT_CUSTOMIZATION.aesthetic.name,
    aestheticDetails: DEFAULT_CUSTOMIZATION.aesthetic,
    generatedImage: null,
  });

  // Diagnostic Telemetry State (STEP 7)
  const [telemetry, setTelemetry] = useState<DiagnosticTelemetry>({
    uploadStatus: 'idle',
    imageLoaded: false,
    imageDimensions: '0 × 0',
    visionApiStatus: 'Checking...',
    analysisRequestStatus: 'Idle',
    analysisResponseStatus: 'Idle',
    vehicleDetected: 'No',
    detectedMake: 'None',
    detectedModel: 'None',
    customizationState: 'Connected',
    generationApiStatus: 'Checking...',
    lastError: null,
  });

  // MORPH Dedicated Assistant State
  const [isMorphOpen, setIsMorphOpen] = useState<boolean>(false);
  const [morphOrbState, setMorphOrbState] = useState<MorphOrbState>('idle');

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(USER_PROFILE);

  // Community & User Builds State
  const [builds, setBuilds] = useState<BuildItem[]>(COMMUNITY_BUILDS);
  const [userBuilds, setUserBuilds] = useState<BuildItem[]>(USER_BUILDS);

  // Modals state
  const [selectedBuildForModal, setSelectedBuildForModal] = useState<BuildItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check backend health on mount
  const checkBackendHealth = async () => {
    try {
      const health = await checkBackendApiHealth();
      if (health.geminiConfigured) {
        setTelemetry((prev) => ({
          ...prev,
          visionApiStatus: 'Connected',
          generationApiStatus: 'Connected',
          lastError: null,
        }));
      } else {
        setTelemetry((prev) => ({
          ...prev,
          visionApiStatus: 'Not Configured',
          generationApiStatus: 'Not Configured',
          lastError: health.error || 'GEMINI_API_KEY environment variable is not configured in server environment.',
        }));
      }
    } catch (err: any) {
      setTelemetry((prev) => ({
        ...prev,
        visionApiStatus: 'Not Connected',
        generationApiStatus: 'Not Connected',
        lastError: err.message || 'Cannot reach backend /api/health',
      }));
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  // 1. Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load custom profile from Firestore if available
        const profile = await getOrCreateUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        setUserProfile(profile);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore synchronization for community builds
  useEffect(() => {
    const unsubscribe = subscribeCommunityBuilds((liveBuilds) => {
      setBuilds(liveBuilds);
    });
    return () => unsubscribe();
  }, []);

  // 3. Real-time User Garage synchronization
  useEffect(() => {
    const uid = currentUser?.uid;
    if (uid) {
      const unsubscribe = subscribeUserGarage(uid, (garageBuilds) => {
        if (garageBuilds && garageBuilds.length > 0) {
          setUserBuilds(garageBuilds);
        } else {
          setUserBuilds(USER_BUILDS);
        }
      });
      return () => unsubscribe();
    } else {
      setUserBuilds(USER_BUILDS);
    }
  }, [currentUser?.uid]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNavigate = (screen: ScreenType) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentScreen(screen);
  };

  // Google Sign In Handler
  const handleGoogleSignIn = async () => {
    try {
      showToast('Connecting to Google Account...');
      const user = await signInWithGoogle();
      if (user) {
        showToast(`Welcome back, ${user.displayName || 'Creator'}!`);
      }
    } catch (err: any) {
      console.warn('Sign in handler exception:', err);
      showToast('Signed in as Guest Creator!');
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setUserProfile(USER_PROFILE);
      setUserBuilds(USER_BUILDS);
      showToast('Signed out of AutoMorph Garage.');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Preset build clicked from home or explore
  const handleSelectPresetBuild = (buildId: string) => {
    const found = builds.find((b) => b.id === buildId);
    if (found) {
      setSelectedBuildForModal(found);
    }
  };

  // Upload Screen handler
  const handleContinueToAnalysis = async (car: CarPreset, uploadedImg?: string) => {
    setSelectedCar(car);
    setCustomImage(uploadedImg);

    // Update central build state & diagnostic telemetry
    if (uploadedImg) {
      const img = new Image();
      img.onload = () => {
        const dims = { width: img.naturalWidth || 1920, height: img.naturalHeight || 1080 };
        setCurrentBuild((prev) => ({
          ...prev,
          uploadedImage: uploadedImg,
          imageDimensions: dims,
          vehicle: {
            ...prev.vehicle,
            model: car.name,
            make: car.name.split(' ')[0],
          },
        }));
        setTelemetry((prev) => ({
          ...prev,
          uploadStatus: 'loaded',
          imageLoaded: true,
          imageDimensions: `${dims.width} × ${dims.height}`,
        }));
      };
      img.src = uploadedImg;

      // Save to userCarUploads if user uploaded an image
      try {
        await saveUserCarUpload({
          userId: currentUser?.uid || 'guest-tuner',
          carName: car.name,
          imageUrl: uploadedImg,
          detectedModel: car.name,
          status: 'ready',
        });
      } catch (err) {
        console.warn('Upload logging notice:', err);
      }
    } else {
      setCurrentBuild((prev) => ({
        ...prev,
        uploadedImage: car.studioImage || car.stockImage,
        imageDimensions: { width: 1920, height: 1080 },
        vehicle: {
          ...prev.vehicle,
          model: car.name,
          make: car.name.split(' ')[0],
        },
      }));
      setTelemetry((prev) => ({
        ...prev,
        uploadStatus: 'loaded',
        imageLoaded: true,
        imageDimensions: '1920 × 1080',
      }));
    }

    handleNavigate('analysis');
  };

  // Customizer -> Synthesis
  const handleGeneratePreview = () => {
    setMorphOrbState('generating');
    setTelemetry((prev) => ({
      ...prev,
      generationApiStatus: 'Connected',
    }));
    handleNavigate('synthesis');
  };

  // Synthesis complete -> Result
  const handleSynthesisComplete = (generatedImageUrl?: string) => {
    if (generatedImageUrl) {
      setGeneratedVisualUrl(generatedImageUrl);
      setCurrentBuild((prev) => ({
        ...prev,
        generatedImage: generatedImageUrl,
      }));
    }
    setMorphOrbState('completed');
    handleNavigate('result');
  };

  // Save current build to user garage and Firestore
  const handleSaveBuild = async () => {
    const modImg =
      generatedVisualUrl ||
      currentBuild.generatedImage ||
      (config.paint.id === 'obsidian-black'
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBCJkp8Sgcf_VRNXS0ejRskUYBX4PtzwoALfIvGmYkrPqxuXWIlGBBVkmZ5XDpZAAVwTZhMhJNxoasNFvCZlxWl5jJXFgH0OyDVSOub_A9bGzF5i2aTQwzAnXbkLeZZIdwLZ_0yLPI1_MYTkJWgu35023oQ_YZxn-STI2Iwuoj9oTC6imnZYJNwQ3lS4MgIAp2fK_rvKTo9tVKdJ5QAHQo73qjcInHy6BPehRioOxfGEV1HEueNOqtGw'
        : config.paint.id === 'racing-red'
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBud71ysvob4Z5mRBqSZOz2xhLTRgTJSv8pT5zpCjVr1pCbVdEW0skIGqYsz80IyNCIeILZhsboZbxoG22QbPrF9GqPK6a104SZlLDqI6q_1UWPkIw_Ept-fZEiUH_iC2XRSjcax8H4R1OhPk8C2pKLOC2I9_lv_rMto0WS2ng5eFG4DZYE8bPWTgAuXwJU8udmnIldQaj4_sjZUvm6TkM0IxiAp8Cv019ySYfKGxRnSw4TvwrYGQvlTA'
        : config.paint.id === 'metallic-blue'
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaHj1akc_EKHpiNsemAlNX4K04irbeU-V6W-T8yGySuKIr98SUUEhRR6yDe4l2armf5YfBMZckPTxla_5wteHBhP6KhHUoJTZUbnJIqTR6zkL-Amb9_gHh6hD0ORxfPdqkAWNceLS4JlyhyDCpTDkn-vQMcgd2qg83cwXSfqeZi7NzN7T9dwO2ERswtpQoO9C3tpeOnBLkIV3Ncjk-esIzufq0Khkrq3zASdhTkgL_8K68OnKcnoADAg'
        : selectedCar.customizedImages?.['default'] || selectedCar.studioImage);

    const origImg =
      customImage ||
      currentBuild.uploadedImage ||
      selectedCar.stockImage ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCRWEC1Qs6WZEq9EqCXJl9NXqBychO3nQtB_2C19u9a6NDP_reElu8b_Kk5aKrDrBm56QvWTAV2ATUthaeyWtmh0GHToCWYCWHHDLzLfDRJ585Bg9k0emXJ9R36gV3D7oSgh04Hj1ANynyY9JF8_sok_f_7hS2IC7vjyvffnpBkSSRdldLvBEias8KxDUQ7_PDjNHR1dKV99bPmrNMoe_FSVNvCKAVtj5nrseqP71SuS9xUON8I9bttlA';

    const newBuildData: Omit<BuildItem, 'id'> = {
      title: `${selectedCar.name} ${currentBuild.style || config.aesthetic.name}`,
      baseModel: selectedCar.name,
      author: userProfile.name,
      authorHandle: userProfile.handle,
      authorAvatar: userProfile.avatar,
      authorId: currentUser?.uid || 'guest-author',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isPublic: true,
      originalImage: origImg,
      modifiedImage: modImg,
      likes: 1,
      commentsCount: 0,
      isLiked: false,
      isSaved: true,
      category: (selectedCar.category === 'SUV' ? 'SUV' : selectedCar.category === 'OFF-ROAD' ? 'OFF-ROAD' : 'SPORTS') as any,
      tags: [(currentBuild.style || config.aesthetic.name).toUpperCase(), (currentBuild.paint || config.paint.name).toUpperCase(), selectedCar.category],
      config,
      summaryItems: [
        {
          title: `${currentBuild.paint || config.paint.name} Finish`,
          subtitle: `${config.paint.finish} protective coat`,
        },
        {
          title: currentBuild.wheels || config.wheels.name,
          subtitle: `${config.wheels.finish} alloy setup`,
        },
        {
          title: `Grille: ${currentBuild.grille || config.grille.name}`,
          subtitle: config.grille.description,
        },
        {
          title: `${currentBuild.style || config.aesthetic.name} Body Styling`,
          subtitle: config.aesthetic.subtitle,
        },
        {
          title: 'Lowered Sport Stance',
          subtitle: '-1.5" suspension kit',
        },
      ],
    };

    try {
      const docId = await createBuild(newBuildData);
      const fullBuild: BuildItem = { ...newBuildData, id: docId };
      setUserBuilds((prev) => [fullBuild, ...prev]);
      setBuilds((prev) => [fullBuild, ...prev]);
      showToast('✨ Build synced & saved to Firestore Database!');
    } catch (e) {
      const fallbackBuild: BuildItem = { ...newBuildData, id: `build-${Date.now()}` };
      setUserBuilds((prev) => [fallbackBuild, ...prev]);
      setBuilds((prev) => [fallbackBuild, ...prev]);
      showToast('✨ Build saved to local garage!');
    }
  };

  // Try a community build in Visualizer
  const handleTryBuildInVisualizer = (build: BuildItem) => {
    const matchingPreset = CAR_PRESETS.find(
      (p) =>
        p.name.toLowerCase().includes(build.baseModel.toLowerCase()) ||
        build.baseModel.toLowerCase().includes(p.name.toLowerCase())
    );
    if (matchingPreset) {
      setSelectedCar(matchingPreset);
    }
    setCustomImage(build.originalImage);
    setCurrentBuild((prev) => ({
      ...prev,
      uploadedImage: build.originalImage,
      paint: build.config.paint.name,
      wheels: build.config.wheels.name,
      grille: build.config.grille.name,
      style: build.config.aesthetic.name,
    }));
    setConfig(build.config);
    handleNavigate('customize');
    showToast(`Loaded ${build.title} into Studio Visualizer!`);
  };

  // Toggle Like on a build
  const handleToggleLike = async (buildId: string) => {
    const target = builds.find((b) => b.id === buildId);
    const isCurrentlyLiked = Boolean(target?.isLiked);

    setBuilds((prev) =>
      prev.map((b) =>
        b.id === buildId
          ? {
              ...b,
              isLiked: !isCurrentlyLiked,
              likes: !isCurrentlyLiked ? b.likes + 1 : Math.max(0, b.likes - 1),
            }
          : b
      )
    );
    setUserBuilds((prev) =>
      prev.map((b) =>
        b.id === buildId
          ? {
              ...b,
              isLiked: !isCurrentlyLiked,
              likes: !isCurrentlyLiked ? b.likes + 1 : Math.max(0, b.likes - 1),
            }
          : b
      )
    );

    // Sync like with Firestore
    const userId = currentUser?.uid || 'guest-user';
    await toggleLike(userId, buildId, isCurrentlyLiked);
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] text-[#E2E8F0] flex flex-col relative selection:bg-[#2563EB] selection:text-white font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#131620]/95 backdrop-blur-xl border border-[#3B82F6]/50 text-white px-5 py-2.5 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center gap-2.5 text-xs font-mono font-bold animate-fade-in"
        >
          <span className="material-symbols-outlined text-[18px] text-[#60A5FA]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        userProfile={userProfile}
        onNavigate={handleNavigate}
        onVisualizeClick={() => handleNavigate('upload')}
        onCloseClick={() => handleNavigate('home')}
        onCancelScan={() => handleNavigate('upload')}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onOpenMorph={() => setIsMorphOpen(true)}
      />

      {/* Main Screen Router */}
      <main className="flex-1 flex flex-col w-full">
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={handleNavigate}
            onSelectPresetBuild={handleSelectPresetBuild}
          />
        )}

        {currentScreen === 'upload' && (
          <UploadScreen
            onContinueToAnalysis={handleContinueToAnalysis}
            onCancel={() => handleNavigate('home')}
          />
        )}

        {currentScreen === 'analysis' && (
          <AnalysisScreen
            selectedCar={selectedCar}
            customImage={customImage}
            currentBuild={currentBuild}
            onUpdateBuild={(updates) => {
              setCurrentBuild((prev) => ({ ...prev, ...updates }));
            }}
            onUpdateDiagnostics={(diagUpdates) => {
              setTelemetry((prev) => ({ ...prev, ...diagUpdates }));
            }}
            onProceedToCustomize={(info) => {
              if (info) {
                setDetectedInfo(info);
                setCurrentBuild((prev) => ({
                  ...prev,
                  vehicle: {
                    make: info.make,
                    model: info.model,
                    year: info.year,
                    vehicleType: info.vehicleType,
                    detected: true,
                    confidence: info.confidence,
                  },
                }));
              }
              handleNavigate('customize');
            }}
            onOpen3DView={(info) => {
              if (info) {
                setDetectedInfo(info);
                setCurrentBuild((prev) => ({
                  ...prev,
                  vehicle: {
                    make: info.make,
                    model: info.model,
                    year: info.year,
                    vehicleType: info.vehicleType,
                    detected: true,
                    confidence: info.confidence,
                  },
                }));
              }
              handleNavigate('3d-view');
            }}
            onSelectPresetOverride={(preset) => {
              setSelectedCar(preset);
              setCurrentBuild((prev) => ({
                ...prev,
                vehicle: {
                  make: preset.name.split(' ')[0],
                  model: preset.name,
                  year: preset.year,
                  vehicleType: preset.category,
                  detected: true,
                  confidence: 1.0,
                },
              }));
            }}
            onCancel={() => handleNavigate('upload')}
          />
        )}

        {currentScreen === '3d-view' && (
          <ThreeDViewScreen
            selectedCar={selectedCar}
            config={config}
            customImage={customImage}
            detectedInfo={detectedInfo}
            currentBuild={currentBuild}
            onProceedToCustomize={() => handleNavigate('customize')}
            onSwitchTo2D={() => handleNavigate('customize')}
            onOpenMorph={() => setIsMorphOpen(true)}
          />
        )}

        {currentScreen === 'customize' && (
          <CustomizerScreen
            selectedCar={selectedCar}
            config={config}
            currentBuild={currentBuild}
            onChangeConfig={setConfig}
            onUpdateBuild={(updates) => {
              setCurrentBuild((prev) => ({ ...prev, ...updates }));
            }}
            onGeneratePreview={handleGeneratePreview}
            onOpenMorph={() => setIsMorphOpen(true)}
            onOpen3DView={() => handleNavigate('3d-view')}
          />
        )}

        {currentScreen === 'synthesis' && (
          <SynthesisScreen
            currentBuild={currentBuild}
            onComplete={handleSynthesisComplete}
            onModifyAgain={() => handleNavigate('customize')}
            onUpdateDiagnostics={(diag) => {
              setTelemetry((prev) => ({
                ...prev,
                generationApiStatus: diag.generationApiStatus,
                lastError: diag.error || prev.lastError,
              }));
            }}
          />
        )}

        {currentScreen === 'result' && (
          <ResultScreen
            selectedCar={selectedCar}
            config={config}
            originalImage={customImage || currentBuild.uploadedImage || selectedCar.stockImage}
            modifiedImage={generatedVisualUrl || currentBuild.generatedImage || undefined}
            customImage={generatedVisualUrl || currentBuild.generatedImage || customImage}
            onSaveBuild={handleSaveBuild}
            onShare={() => setIsShareModalOpen(true)}
            onTryAnother={() => handleNavigate('customize')}
            onOpenVeoStudio={() => handleNavigate('veo-studio')}
            onOpenGeminiChat={() => handleNavigate('ai-chat')}
            onOpenSearchIntel={() => handleNavigate('search-intel')}
            onOpenMorph={() => setIsMorphOpen(true)}
          />
        )}

        {currentScreen === 'ai-chat' && (
          <AIChatScreen
            onBack={() => handleNavigate('home')}
            carContext={`${currentBuild.vehicle.make} ${currentBuild.vehicle.model} (${currentBuild.paint}, ${currentBuild.wheels})`}
          />
        )}

        {currentScreen === 'search-intel' && (
          <SearchIntelScreen
            onBack={() => handleNavigate('home')}
            carContext={`${currentBuild.vehicle.make} ${currentBuild.vehicle.model}`}
          />
        )}

        {currentScreen === 'live-voice' && (
          <LiveVoiceScreen
            onBack={() => handleNavigate('home')}
            carContext={`${currentBuild.vehicle.make} ${currentBuild.vehicle.model}`}
          />
        )}

        {currentScreen === 'veo-studio' && (
          <VeoVideoStudio
            onBack={() => handleNavigate('home')}
            carImage={generatedVisualUrl || currentBuild.generatedImage || selectedCar.customizedImages?.['default'] || selectedCar.studioImage}
            carName={`${currentBuild.vehicle.make} ${currentBuild.vehicle.model}`}
          />
        )}

        {currentScreen === 'explore' && (
          <ExploreScreen
            builds={builds}
            onSelectBuild={(b) => setSelectedBuildForModal(b)}
            onTryBuildInVisualizer={handleTryBuildInVisualizer}
            onToggleLike={handleToggleLike}
          />
        )}

        {currentScreen === 'my-builds' && (
          <div className="w-full max-w-7xl mx-auto px-5 md:px-16 pt-24 pb-32">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="font-display text-[32px] md:text-[40px] font-bold text-white tracking-tight">
                  My Garage &amp; Builds
                </h1>
                <p className="text-[#94A3B8] text-sm md:text-base">
                  Manage your customized automotive builds, saved concepts, and active renders.
                </p>
              </div>
              <button
                id="btn-new-build"
                onClick={() => handleNavigate('upload')}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-full text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>New Build</span>
              </button>
            </div>

            {userBuilds.length === 0 ? (
              <div className="rounded-3xl p-12 text-center flex flex-col items-center justify-center bg-[#131620] border border-white/10 shadow-xl">
                <span className="material-symbols-outlined text-[54px] text-[#94A3B8] mb-3">
                  garage
                </span>
                <h3 className="font-display text-xl font-bold text-white mb-1">
                  Your Garage is Empty
                </h3>
                <p className="text-sm text-[#94A3B8] mb-6 max-w-sm">
                  Start visualizing your dream ride now. Upload a photo or configure a stock vehicle.
                </p>
                <button
                  onClick={() => handleNavigate('upload')}
                  className="bg-[#2563EB] text-white px-6 py-3 rounded-full text-xs font-bold cursor-pointer"
                >
                  Start First Build
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBuilds.map((build) => (
                  <div
                    key={build.id}
                    onClick={() => setSelectedBuildForModal(build)}
                    className="rounded-3xl overflow-hidden group bg-[#131620] border border-white/10 hover:border-[#2563EB]/50 transition-all duration-300 cursor-pointer shadow-xl"
                  >
                    <div className="relative h-56 w-full bg-[#0F121C] overflow-hidden">
                      <img
                        src={build.modifiedImage}
                        alt={build.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#131620] via-transparent to-black/20" />
                      <div className="absolute top-4 right-4 z-10">
                        <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-[#60A5FA] border border-white/15 font-mono">
                          {build.tags[0] || 'SAVED'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-bold text-white group-hover:text-[#60A5FA] transition-colors mb-1 truncate">
                        {build.title}
                      </h3>
                      <p className="text-xs text-[#94A3B8] mb-4">
                        Base: {build.baseModel} • {build.date}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTryBuildInVisualizer(build);
                          }}
                          className="text-[#60A5FA] hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">tune</span>
                          <span>Re-Customize</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsShareModalOpen(true);
                          }}
                          className="text-[#94A3B8] hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            userProfile={userProfile}
            userBuilds={userBuilds}
            onSelectBuild={(b) => setSelectedBuildForModal(b)}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            onGoogleSignIn={handleGoogleSignIn}
            onSignOut={handleSignOut}
            onUpdateProfile={(updated) => {
              setUserProfile(updated);
              if (currentUser?.uid) {
                updateUserProfile(currentUser.uid, updated);
              }
              showToast('Profile updated and saved!');
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />

      {/* Build Detail Modal */}
      <BuildDetailModal
        build={selectedBuildForModal}
        currentUser={userProfile}
        onClose={() => setSelectedBuildForModal(null)}
        onTryInStudio={handleTryBuildInVisualizer}
        onToggleLike={handleToggleLike}
        onBuildDeleted={(deletedId) => {
          setUserBuilds((prev) => prev.filter((b) => b.id !== deletedId));
          setBuilds((prev) => prev.filter((b) => b.id !== deletedId));
          showToast('Build deleted from garage.');
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        buildTitle={`${selectedCar.name} ${currentBuild.style || config.aesthetic.name}`}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccess={() => {
          setUserProfile((prev) => ({ ...prev, tier: 'AutoMorph Pro Member' }));
          showToast('🎉 Welcome to AutoMorph Pro Tier!');
        }}
      />

      {/* MORPH Dedicated Floating Automotive Assistant */}
      <MorphAssistant
        isOpen={isMorphOpen}
        onToggle={() => setIsMorphOpen(!isMorphOpen)}
        selectedCar={selectedCar}
        customConfig={config}
        onUpdateConfig={(newConfig) => {
          setConfig(newConfig);
          setCurrentBuild((prev) => ({
            ...prev,
            paint: newConfig.paint.name,
            wheels: newConfig.wheels.name,
            grille: newConfig.grille.name,
            style: newConfig.aesthetic.name,
          }));
          showToast(`⚡ MORPH tuned: ${newConfig.paint.name} & ${newConfig.wheels.name}!`);
        }}
        onMorphBuild={(configToMorph) => {
          if (configToMorph) {
            setConfig(configToMorph);
            setCurrentBuild((prev) => ({
              ...prev,
              paint: configToMorph.paint.name,
              wheels: configToMorph.wheels.name,
              grille: configToMorph.grille.name,
              style: configToMorph.aesthetic.name,
            }));
          }
          handleGeneratePreview();
        }}
        onNavigateToStudio={() => handleNavigate('customize')}
        externalOrbState={morphOrbState}
      />

      {/* Developer Diagnostic Telemetry Panel */}
      <DiagnosticPanel
        telemetry={telemetry}
        currentBuild={currentBuild}
        onRefreshHealth={checkBackendHealth}
      />
    </div>
  );
}

export default App;
