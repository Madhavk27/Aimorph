import React, { useState, useEffect, useRef } from 'react';
import {
  PAINT_COLORS,
  WHEEL_OPTIONS,
  GRILLE_OPTIONS,
  AESTHETIC_OPTIONS,
  HEADLIGHT_OPTIONS,
  TINT_OPTIONS,
  RIDE_HEIGHT_OPTIONS,
  BODYKIT_OPTIONS,
  SPOILER_OPTIONS,
  ROOF_OPTIONS,
  MIRROR_OPTIONS,
  EXHAUST_OPTIONS,
  OFFROAD_OPTIONS,
} from '../data/mockData';
import {
  CarPreset,
  CustomizationConfig,
  PaintColorOption,
  WheelOption,
  GrilleOption,
  AestheticOption,
  CurrentBuildState,
} from '../types';
import {
  applyVehicleModification,
  VehicleModificationRequest,
  checkBackendApiHealth,
} from '../lib/vehicleService';

interface CustomizerScreenProps {
  selectedCar: CarPreset;
  config: CustomizationConfig;
  currentBuild?: CurrentBuildState;
  onChangeConfig: (newConfig: CustomizationConfig) => void;
  onUpdateBuild?: (updates: Partial<CurrentBuildState>) => void;
  onGeneratePreview: () => void;
  onCustomAIGenerate?: (prompt: string) => void;
  onOpenMorph?: () => void;
  onOpen3DView?: () => void;
}

type PreviewLayoutMode = 'side-by-side' | 'split-slider' | 'single';

type CustomizerTab =
  | 'paint'
  | 'wheels'
  | 'grille'
  | 'aesthetic'
  | 'headlights'
  | 'tint'
  | 'rideHeight'
  | 'bodyKit'
  | 'spoiler'
  | 'roof'
  | 'mirrors'
  | 'exhaust'
  | 'offroad';

export const CustomizerScreen: React.FC<CustomizerScreenProps> = ({
  selectedCar,
  config,
  currentBuild,
  onChangeConfig,
  onUpdateBuild,
  onGeneratePreview,
  onOpenMorph,
  onOpen3DView,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCustomPromptMode, setIsCustomPromptMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<CustomizerTab>('paint');
  const [previewMode, setPreviewMode] = useState<PreviewLayoutMode>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Live Modification Pipeline State
  const [isModifying, setIsModifying] = useState<boolean>(false);
  const [modifyingLabel, setModifyingLabel] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiConfigured, setApiConfigured] = useState<boolean>(true);
  const [lastModifiedPart, setLastModifiedPart] = useState<string | null>(null);

  const vehicleName =
    currentBuild?.vehicle.make && currentBuild?.vehicle.model
      ? `${currentBuild.vehicle.make} ${currentBuild.vehicle.model}`
      : selectedCar.name;

  const [customPrompt, setCustomPrompt] = useState<string>(
    `Matte stealth black ${vehicleName} with blacked-out grille, widebody fender flares, forged bronze wheels, carbon fiber GT wing, lowered suspension, and neon underglow.`
  );

  // Get original base image
  const getOriginalBaseImage = (): string => {
    return (
      currentBuild?.uploadedImage ||
      selectedCar.customizedImages?.['default'] ||
      selectedCar.studioImage ||
      selectedCar.stockImage
    );
  };

  // Get active rendered preview image
  const getRenderedImage = (): string => {
    if (currentBuild?.generatedImage) {
      return currentBuild.generatedImage;
    }
    if (currentBuild?.uploadedImage) {
      return currentBuild.uploadedImage;
    }

    // Default preset lookups for un-uploaded cars
    if (config.paint.id === 'obsidian-black') {
      return (
        selectedCar.customizedImages?.['obsidian-black'] ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCBCJkp8Sgcf_VRNXS0ejRskUYBX4PtzwoALfIvGmYkrPqxuXWIlGBBVkmZ5XDpZAAVwTZhMhJNxoasNFvCZlxWl5jJXFgH0OyDVSOub_A9bGzF5i2aTQwzAnXbkLeZZIdwLZ_0yLPI1_MYTkJWgu35023oQ_YZxn-STI2Iwuoj9oTC6imnZYJNwQ3lS4MgIAp2fK_rvKTo9tVKdJ5QAHQo73qjcInHy6BPehRioOxfGEV1HEueNOqtGw'
      );
    }
    if (config.paint.id === 'racing-red') {
      return (
        selectedCar.customizedImages?.['racing-red'] ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBud71ysvob4Z5mRBqSZOz2xhLTRgTJSv8pT5zpCjVr1pCbVdEW0skIGqYsz80IyNCIeILZhsboZbxoG22QbPrF9GqPK6a104SZlLDqI6q_1UWPkIw_Ept-fZEiUH_iC2XRSjcax8H4R1OhPk8C2pKLOC2I9_lv_rMto0WS2ng5eFG4DZYE8bPWTgAuXwJU8udmnIldQaj4_sjZUvm6TkM0IxiAp8Cv019ySYfKGxRnSw4TvwrYGQvlTA'
      );
    }
    if (config.paint.id === 'metallic-blue') {
      return (
        selectedCar.customizedImages?.['metallic-blue'] ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBaHj1akc_EKHpiNsemAlNX4K04irbeU-V6W-T8yGySuKIr98SUUEhRR6yDe4l2armf5YfBMZckPTxla_5wteHBhP6KhHUoJTZUbnJIqTR6zkL-Amb9_gHh6hD0ORxfPdqkAWNceLS4JlyhyDCpTDkn-vQMcgd2qg83cwXSfqeZi7NzN7T9dwO2ERswtpQoO9C3tpeOnBLkIV3Ncjk-esIzufq0Khkrq3zASdhTkgL_8K68OnKcnoADAg'
      );
    }
    return selectedCar.customizedImages?.['default'] || selectedCar.studioImage;
  };

  // Check health on mount
  useEffect(() => {
    checkBackendApiHealth().then((health) => {
      setApiConfigured(health.geminiConfigured);
    });
  }, []);

  // Centralized modification handler driving real visualization pipeline
  const executeModification = async (
    mod: VehicleModificationRequest,
    updatedBuildUpdates: Partial<CurrentBuildState>
  ) => {
    const originalImg = getOriginalBaseImage();
    const currentBuildSnapshot: CurrentBuildState = {
      ...(currentBuild || {
        uploadedImage: null,
        vehicle: {
          make: selectedCar.name.split(' ')[0],
          model: selectedCar.name,
          detected: false,
        },
        paint: config.paint.name,
        paintDetails: config.paint,
        wheels: config.wheels.name,
        wheelsDetails: config.wheels,
        grille: config.grille.name,
        grilleDetails: config.grille,
        lights: 'LED Projector Matrix',
        bodyKit: 'Clean Trim',
        style: config.aesthetic.name,
        aestheticDetails: config.aesthetic,
        generatedImage: null,
      }),
      ...updatedBuildUpdates,
    };

    // 1. Immediately update Build DNA and local build state
    onUpdateBuild?.(updatedBuildUpdates);
    setLastModifiedPart(mod.name);
    setApiError(null);

    // 2. If it's returning to stock factory white or initial state
    if (mod.type === 'paint' && mod.name === 'Factory White' && !currentBuild?.uploadedImage) {
      onUpdateBuild?.({
        generatedImage: selectedCar.customizedImages?.['default'] || selectedCar.studioImage,
      });
      return;
    }

    // 3. Trigger localized image editing pipeline
    setIsModifying(true);
    setModifyingLabel(`Rendering ${mod.name}...`);

    try {
      const result = await applyVehicleModification(originalImg, mod, currentBuildSnapshot);

      if (result?.imageUrl) {
        onUpdateBuild?.({
          generatedImage: result.imageUrl,
        });
        setApiConfigured(true);
      }
    } catch (err: any) {
      console.warn('Vehicle modification API warning:', err.message);
      const isConfigError =
        err.message?.includes('not connected') ||
        err.message?.includes('GEMINI_API_KEY') ||
        err.message?.includes('503');

      if (isConfigError) {
        setApiConfigured(false);
        setApiError('Visual editing API not connected. Configure Image Editing API.');
      } else {
        setApiError(`Visual modification notice: ${err.message || 'Processing update'}`);
      }
    } finally {
      setIsModifying(false);
      setModifyingLabel('');
    }
  };

  // Modification Trigger Helpers
  const handleSelectPaint = (paint: PaintColorOption) => {
    onChangeConfig({ ...config, paint });
    executeModification(
      {
        type: 'paint',
        name: paint.name,
        details: paint,
        instruction: `Edit ONLY the vehicle paint. Change the body paint to glossy ${paint.name} (${paint.finish}). Preserve the exact ${vehicleName} model, body geometry, wheels, headlights, windows, environment, reflections, and camera angle. Do not modify anything else.`,
      },
      {
        paint: paint.name,
        paintDetails: paint,
      }
    );
  };

  const handleSelectWheels = (wheels: WheelOption) => {
    onChangeConfig({ ...config, wheels });
    executeModification(
      {
        type: 'wheels',
        name: wheels.name,
        details: wheels,
        instruction: `Edit ONLY the wheels. Replace the existing wheel design with ${wheels.name} (${wheels.size}, ${wheels.finish}) while preserving the exact vehicle, body, tires, camera angle, and environment.`,
      },
      {
        wheels: wheels.name,
        wheelsDetails: wheels,
      }
    );
  };

  const handleSelectGrille = (grille: GrilleOption) => {
    onChangeConfig({ ...config, grille });
    executeModification(
      {
        type: 'grille',
        name: grille.name,
        details: grille,
        instruction: `Edit ONLY the front grille. Replace the front grille with ${grille.name} (${grille.finish}) while preserving the rest of the car, headlights, bumper, paint, and background.`,
      },
      {
        grille: grille.name,
        grilleDetails: grille,
      }
    );
  };

  const handleSelectAesthetic = (aesthetic: AestheticOption) => {
    onChangeConfig({ ...config, aesthetic });
    executeModification(
      {
        type: 'full',
        name: aesthetic.name,
        details: aesthetic,
        instruction: `Apply ${aesthetic.name} style package (${aesthetic.description}) to this ${vehicleName}. Maintain exact vehicle body structure while updating aero accents.`,
      },
      {
        style: aesthetic.name,
        aestheticDetails: aesthetic,
      }
    );
  };

  const handleSelectHeadlights = (opt: { id: string; name: string; type: string }) => {
    executeModification(
      {
        type: 'headlights',
        name: opt.name,
        instruction: `Edit ONLY the headlights. Upgrade to ${opt.name} (${opt.type}) while preserving the vehicle body, paint, and background.`,
      },
      { headlights: opt.name, lights: opt.name }
    );
  };

  const handleSelectTint = (opt: { id: string; name: string; percent: string }) => {
    executeModification(
      {
        type: 'tint',
        name: opt.name,
        instruction: `Edit ONLY the window glass. Apply ${opt.name} (${opt.percent}) privacy window tint while preserving the vehicle paint, wheels, and background.`,
      },
      { tint: opt.name }
    );
  };

  const handleSelectRideHeight = (opt: { id: string; name: string; desc: string }) => {
    executeModification(
      {
        type: 'rideHeight',
        name: opt.name,
        instruction: `Edit ONLY the suspension stance. Adjust the vehicle stance to ${opt.name} (${opt.desc}) while keeping the exact body and wheel geometry.`,
      },
      { rideHeight: opt.name }
    );
  };

  const handleSelectBodyKit = (opt: { id: string; name: string; desc: string }) => {
    executeModification(
      {
        type: 'bodyKit',
        name: opt.name,
        instruction: `Apply ${opt.name} (${opt.desc}) aerodynamic styling to this ${vehicleName} while keeping original vehicle identity.`,
      },
      { bodyKit: opt.name }
    );
  };

  const handleSelectSpoiler = (opt: { id: string; name: string; desc: string }) => {
    executeModification(
      {
        type: 'spoiler',
        name: opt.name,
        instruction: `Add a ${opt.name} (${opt.desc}) on the rear trunk while preserving the rest of the car and camera perspective.`,
      },
      { spoiler: opt.name }
    );
  };

  const handleSelectRoof = (opt: { id: string; name: string; desc: string }) => {
    executeModification(
      {
        type: 'roof',
        name: opt.name,
        instruction: `Change the roof color/finish to ${opt.name} (${opt.desc}) while preserving the rest of the car.`,
      },
      { roof: opt.name }
    );
  };

  const handleSelectMirrors = (opt: { id: string; name: string; desc: string }) => {
    executeModification(
      {
        type: 'mirrors',
        name: opt.name,
        instruction: `Modify the side mirror caps to ${opt.name} (${opt.desc}) while preserving the rest of the car.`,
      },
      { mirrors: opt.name }
    );
  };

  const handleSelectExhaust = (opt: { id: string; name: string; desc: string }) => {
    executeModification(
      {
        type: 'exhaust',
        name: opt.name,
        instruction: `Modify the rear exhaust tips to ${opt.name} (${opt.desc}).`,
      },
      { exhaust: opt.name }
    );
  };

  const handleSelectOffroad = (opt: { id: string; name: string; desc: string }) => {
    executeModification(
      {
        type: 'offroad',
        name: opt.name,
        instruction: `Add ${opt.name} (${opt.desc}) rugged off-road enhancements to this ${vehicleName}.`,
      },
      { offroad: opt.name }
    );
  };

  // Interactive Split Slider Mouse/Touch Handlers
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseDown = () => setIsDraggingSlider(true);
  const handleMouseUp = () => setIsDraggingSlider(false);

  const handleGenerate = () => {
    if (isCustomPromptMode && customPrompt.trim()) {
      onChangeConfig({
        ...config,
        promptOverride: customPrompt.trim(),
      });
      onUpdateBuild?.({
        customPrompt: customPrompt.trim(),
      });
    } else {
      onChangeConfig({
        ...config,
        promptOverride: undefined,
      });
      onUpdateBuild?.({
        customPrompt: undefined,
      });
    }
    onGeneratePreview();
  };

  const activePaint = currentBuild?.paint || config.paint.name;
  const activeWheels = currentBuild?.wheels || config.wheels.name;
  const activeGrille = currentBuild?.grille || config.grille.name;
  const activeStyle = currentBuild?.style || config.aesthetic.name;

  const buildDnaString = `${vehicleName} • ${activePaint} • ${activeWheels.split(' ')[0]} • ${activeGrille} • ${activeStyle} Spec`;

  const originalImg = getOriginalBaseImage();
  const currentRenderedImg = getRenderedImage();

  return (
    <div
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-36 flex flex-col"
      onMouseMove={(e) => isDraggingSlider && handleSliderMove(e.clientX)}
      onMouseUp={handleMouseUp}
      onTouchMove={(e) => isDraggingSlider && e.touches[0] && handleSliderMove(e.touches[0].clientX)}
      onTouchEnd={handleMouseUp}
    >
      {/* Screen Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
              AutoMorph Customizer Studio
            </h1>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
              Live Morph
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Select modifications to immediately morph your uploaded car with real identity preservation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpen3DView && (
            <button
              onClick={onOpen3DView}
              className="px-3 py-1.5 rounded-xl bg-[#1E2230] hover:bg-[#282E42] border border-violet-500/30 text-xs font-bold text-[#C084FC] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
            >
              <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
              <span>3D Preview</span>
            </button>
          )}
          <span className="text-xs font-mono text-[#60A5FA] bg-[#2563EB]/15 border border-[#3B82F6]/30 px-3 py-1.5 rounded-full font-bold truncate max-w-[200px]">
            {vehicleName}
          </span>
        </div>
      </div>

      {/* VIEWPORT CONTROLS BAR: Side-by-Side vs Slider vs Single View */}
      <div className="flex items-center justify-between gap-2 mb-3 bg-[#0F121C] border border-white/10 p-1.5 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold text-[#94A3B8] px-2 hidden sm:inline">
            PREVIEW:
          </span>
          <button
            onClick={() => setPreviewMode('side-by-side')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              previewMode === 'side-by-side'
                ? 'bg-[#2563EB] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">compare</span>
            <span>Side-by-Side</span>
          </button>
          <button
            onClick={() => setPreviewMode('split-slider')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              previewMode === 'split-slider'
                ? 'bg-[#2563EB] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">splitscreen</span>
            <span>Split Slider</span>
          </button>
          <button
            onClick={() => setPreviewMode('single')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              previewMode === 'single'
                ? 'bg-[#2563EB] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">crop_free</span>
            <span>Current Build Focus</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isModifying && (
            <div className="flex items-center gap-2 bg-violet-950/80 border border-violet-500/40 px-3 py-1 rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#C084FC] animate-ping" />
              <span className="text-[10px] font-mono text-[#E9D5FF] font-bold">
                {modifyingLabel || 'Morphing car...'}
              </span>
            </div>
          )}
          <button
            onClick={() => setIsFullscreen(true)}
            title="Fullscreen View"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">fullscreen</span>
          </button>
        </div>
      </div>

      {/* =======================================================
          MAIN REALTIME CAR VIEWPORT - SUPPORTS 3 MODES
      ======================================================= */}
      {previewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* PANEL 1: ORIGINAL VEHICLE */}
          <div className="rounded-3xl overflow-hidden bg-[#131620] border border-white/10 relative shadow-2xl flex flex-col group">
            <div className="p-3 bg-[#0B0D14] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  [ ORIGINAL CAR ]
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8] bg-white/5 px-2 py-0.5 rounded-full">
                Factory Base
              </span>
            </div>
            <div className="relative aspect-[16/10] w-full bg-gradient-to-b from-[#0F121C] to-[#131620] flex items-center justify-center p-3">
              <img
                src={originalImg}
                alt="Original Vehicle Base"
                className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
              />
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-[#CBD5E1] space-y-0.5 shadow-lg">
                <div className="font-bold text-white">{vehicleName}</div>
                <div className="text-[10px] text-[#94A3B8]">
                  Factory Paint • OEM Wheels • Factory Grille
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 2: CURRENT BUILD (LIVE MORPHED) */}
          <div className="rounded-3xl overflow-hidden bg-[#131620] border border-[#3B82F6]/40 relative shadow-[0_0_30px_rgba(37,99,235,0.2)] flex flex-col group">
            <div className="p-3 bg-[#0B0D14] border-b border-[#3B82F6]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse" />
                <span className="text-xs font-mono font-bold text-[#60A5FA] uppercase tracking-wider">
                  [ CURRENT BUILD ]
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isModifying ? (
                  <span className="text-[10px] font-mono text-[#C084FC] bg-violet-950/70 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    Updating preview...
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Visual Active
                  </span>
                )}
              </div>
            </div>

            <div className="relative aspect-[16/10] w-full bg-gradient-to-b from-[#0F121C] to-[#131620] flex items-center justify-center p-3">
              <img
                src={currentRenderedImg}
                alt="Current Customized Build"
                className={`w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] transition-all duration-300 ${
                  isModifying ? 'opacity-50 blur-[2px]' : 'opacity-100'
                }`}
              />

              {/* Shimmer Overlay when modifying */}
              {isModifying && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 z-20">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center animate-spin">
                    <span className="material-symbols-outlined text-white text-xl">auto_fix_high</span>
                  </div>
                  <p className="text-xs font-mono text-white font-bold tracking-wide">
                    {modifyingLabel || 'Applying localized modification...'}
                  </p>
                  <p className="text-[10px] text-[#94A3B8]">Preserving chassis geometry &amp; reflections</p>
                </div>
              )}

              {/* Spec Pill on Image */}
              <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#3B82F6]/30 flex items-center gap-2.5 shadow-xl">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                  style={{ backgroundColor: config.paint.hex }}
                />
                <div className="text-[11px] font-mono leading-tight">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{activePaint}</span>
                    <span className="text-[#60A5FA]">•</span>
                    <span>{activeWheels.split(' ')[0]}</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8]">
                    {activeGrille} • {activeStyle}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewMode === 'split-slider' && (
        <div className="w-full rounded-3xl overflow-hidden bg-[#131620] border border-white/10 relative shadow-2xl mb-4 select-none">
          <div
            ref={sliderContainerRef}
            className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-gradient-to-b from-[#0F121C] to-[#131620] overflow-hidden cursor-ew-resize"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            {/* Modified Build Image (Full Canvas Behind) */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={currentRenderedImg}
                alt="Current Customized Build"
                className={`w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] ${
                  isModifying ? 'opacity-40' : 'opacity-100'
                }`}
              />
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#3B82F6]/40 text-xs font-mono text-[#60A5FA] font-bold">
                [ CURRENT BUILD ] {activePaint}
              </div>
            </div>

            {/* Original Vehicle Image (Clipped overlay on Left) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center p-4"
                style={{ width: sliderContainerRef.current?.offsetWidth || '100%' }}
              >
                <img
                  src={originalImg}
                  alt="Original Car Base"
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                />
              </div>
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono text-white font-bold">
                [ ORIGINAL CAR ]
              </div>
            </div>

            {/* Draggable Divider Line & Handle */}
            <div
              className="absolute inset-y-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-30"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#2563EB] border-2 border-white flex items-center justify-center text-white shadow-xl cursor-ew-resize">
                <span className="material-symbols-outlined text-[16px]">unfold_more</span>
              </div>
            </div>

            {/* Loading Indicator */}
            {isModifying && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-40">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center animate-spin">
                  <span className="material-symbols-outlined text-white text-lg">auto_fix_high</span>
                </div>
                <span className="text-xs font-mono text-white font-bold">
                  {modifyingLabel || 'Morphing visualization...'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {previewMode === 'single' && (
        <div className="w-full rounded-3xl overflow-hidden bg-[#131620] border border-white/10 relative shadow-2xl mb-4 group">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-gradient-to-b from-[#0F121C] to-[#131620] flex items-center justify-center p-4">
            <img
              src={currentRenderedImg}
              alt={`${vehicleName} Customized Preview`}
              className={`w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] transition-all duration-300 ${
                isModifying ? 'opacity-40 blur-[2px]' : 'opacity-100'
              }`}
            />

            {isModifying && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center animate-spin">
                  <span className="material-symbols-outlined text-white text-xl">auto_fix_high</span>
                </div>
                <p className="text-xs font-mono text-white font-bold">
                  {modifyingLabel || 'Morphing vehicle visualization...'}
                </p>
              </div>
            )}

            {/* Floating Pill on image with color indicator */}
            <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 flex items-center gap-2 shadow-lg">
              <span
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: config.paint.hex }}
              />
              <span className="text-xs font-bold text-white">
                {activeStyle} • {activePaint} • {activeGrille}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* API Unconfigured / Error Fallback Notice (Requirement 12) */}
      {(!apiConfigured || apiError) && (
        <div className="mb-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-[20px]">
              warning
            </span>
            <div>
              <span className="text-xs font-bold text-amber-200 block">
                Visual editing API not connected
              </span>
              <p className="text-[11px] text-[#CBD5E1]">
                Build DNA updates active. To enable localized AI vehicle inpainting, configure GEMINI_API_KEY.
              </p>
            </div>
          </div>
          <button
            onClick={() => checkBackendApiHealth().then((h) => setApiConfigured(h.geminiConfigured))}
            className="text-[10px] font-mono text-amber-300 bg-amber-900/60 hover:bg-amber-800/80 px-3 py-1.5 rounded-xl border border-amber-500/40 transition-colors cursor-pointer shrink-0"
          >
            Check API Status
          </button>
        </div>
      )}

      {/* LIVE BUILD DNA BANNER */}
      <div className="mb-5 bg-[#0B0D14]/90 border border-[#3B82F6]/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse shrink-0" />
          <div>
            <span className="text-[9px] font-mono text-[#94A3B8] uppercase block tracking-wider font-bold">
              CURRENT BUILD DNA
            </span>
            <p className="font-mono text-xs sm:text-sm font-bold text-[#E9D5FF] tracking-wide">
              {buildDnaString}
            </p>
          </div>
        </div>
        {lastModifiedPart && (
          <div className="text-[10px] font-mono text-[#60A5FA] bg-[#2563EB]/15 px-2.5 py-1 rounded-full border border-[#3B82F6]/30 shrink-0">
            Last Morph: {lastModifiedPart}
          </div>
        )}
      </div>

      {/* MORPH AI Assistant Prompt Banner */}
      <div className="mb-5 bg-gradient-to-r from-[#171A29] via-[#1E1B4B]/70 to-[#0F172A] border border-violet-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(139,92,246,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] shrink-0">
            <span className="text-base font-black">✦</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wide">✦ MORPH ASSISTANT</span>
              <span className="text-[9px] font-mono text-[#C084FC] uppercase bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              “Imagine it. I’ll morph it.” Let MORPH configure wheel offset, grille de-chroming, and aero package.
            </p>
          </div>
        </div>

        {onOpenMorph && (
          <button
            type="button"
            onClick={onOpenMorph}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#38BDF8] hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.4)] active:scale-95 shrink-0 border border-white/20"
          >
            <span className="material-symbols-outlined text-[15px]">auto_fix_high</span>
            <span>Talk to MORPH</span>
          </button>
        )}
      </div>

      {/* Mode Switch: Studio Controls vs Custom Natural Language Prompt */}
      <div className="flex items-center gap-3 mb-5 bg-[#131620] border border-white/10 p-1.5 rounded-2xl">
        <button
          onClick={() => setIsCustomPromptMode(false)}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            !isCustomPromptMode
              ? 'bg-[#2563EB] text-white shadow-lg'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Studio Component Controls</span>
        </button>
        <button
          onClick={() => setIsCustomPromptMode(true)}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isCustomPromptMode
              ? 'bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] text-white shadow-lg'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">image_edit_auto</span>
          <span>Custom Prompt (Gemini AI)</span>
        </button>
      </div>

      {isCustomPromptMode ? (
        /* Custom Prompt Generator Studio */
        <div className="bg-[#131620]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8B5CF6]">auto_awesome</span>
              <h3 className="font-display text-sm font-bold text-white">
                Customize with Gemini AI Image Preview
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#C4B5FD] bg-[#8B5CF6]/20 px-2 py-0.5 rounded-full border border-[#8B5CF6]/30">
              gemini-3.1-flash-image
            </span>
          </div>

          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Enter detailed automotive modifications in natural language. AutoMorph will synthesize
            body kits, widebody arches, carbon spoilers, wheel styles, custom paint wraps, and studio lighting.
          </p>

          <textarea
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={`e.g. Satin Nardo grey ${vehicleName} with carbon fiber bonnet, forged BBS wheels, track splitter...`}
            className="w-full p-3.5 rounded-xl bg-[#0F121C] border border-white/15 text-white text-xs placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] resize-none shadow-inner"
          />

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
              Quick Prompt Inspirations:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Matte Military Green widebody with bronze centerlock wheels & GT wing',
                'Liquid Chrome mirror wrap with lowered air suspension and deep lip forged rims',
                'Cyberpunk style with glowing LED intake accents and dark forged carbon diffuser',
              ].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCustomPrompt(p)}
                  className="text-[11px] px-3 py-1.5 rounded-xl bg-[#0F121C] hover:bg-[#1E2230] border border-white/5 text-[#94A3B8] hover:text-white transition-colors cursor-pointer text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Studio Customization Categories */
        <div className="flex flex-col gap-5 w-full">
          {/* Quick Category Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'paint', label: 'Paint Color', icon: 'palette' },
              { id: 'wheels', label: 'Wheels & Rims', icon: 'tire_repair' },
              { id: 'grille', label: 'Front Grille', icon: 'grid_view' },
              { id: 'aesthetic', label: 'Aero & Vibe', icon: 'sports_motorsports' },
              { id: 'headlights', label: 'Headlights', icon: 'highlight' },
              { id: 'tint', label: 'Window Tint', icon: 'tonality' },
              { id: 'rideHeight', label: 'Ride Height', icon: 'height' },
              { id: 'bodyKit', label: 'Body Kit', icon: 'directions_car' },
              { id: 'spoiler', label: 'Spoiler & Wing', icon: 'flight' },
              { id: 'roof', label: 'Roof Finish', icon: 'roofing' },
              { id: 'mirrors', label: 'Mirrors', icon: 'flip' },
              { id: 'exhaust', label: 'Exhaust', icon: 'air' },
              { id: 'offroad', label: 'Off-Road Kit', icon: 'landscape' },
            ].map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id as CustomizerTab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-md'
                      : 'bg-[#131620] text-[#94A3B8] hover:text-white border border-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section 1: PAINT COLOR */}
          <div className="bg-[#131620]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
                <h3 className="font-label-caps text-xs tracking-wider text-[#94A3B8] font-bold">
                  1. PAINT COLOR &amp; FINISH
                </h3>
              </div>
              <span className="text-xs font-semibold text-white">
                {config.paint.name} <span className="text-[#94A3B8]">({config.paint.finish})</span>
              </span>
            </div>

            <div className="flex items-center gap-3.5 overflow-x-auto pb-2 no-scrollbar">
              {PAINT_COLORS.map((paint) => {
                const isSelected = config.paint.id === paint.id;
                return (
                  <button
                    key={paint.id}
                    onClick={() => handleSelectPaint(paint)}
                    className={`w-12 h-12 rounded-2xl shrink-0 transition-all duration-300 relative flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#60A5FA] ring-offset-3 ring-offset-[#131620] scale-110 shadow-lg'
                        : 'border border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: paint.hex }}
                    title={`${paint.name} (${paint.finish})`}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-white text-base font-bold drop-shadow">
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: WHEEL STYLE */}
          <div className="bg-[#131620]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
                <h3 className="font-label-caps text-xs tracking-wider text-[#94A3B8] font-bold">
                  2. WHEEL DESIGN &amp; FITMENT
                </h3>
              </div>
              <span className="text-xs font-semibold text-white">{config.wheels.name}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WHEEL_OPTIONS.map((wheel) => {
                const isSelected = config.wheels.id === wheel.id;
                return (
                  <button
                    key={wheel.id}
                    onClick={() => handleSelectWheels(wheel)}
                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2563EB]/15 border-[#60A5FA] shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#60A5FA] rotate-45' : 'border-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${
                          isSelected ? 'bg-[#60A5FA]' : 'bg-white/20'
                        }`}
                      />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#E2E8F0]'}`}>
                        {wheel.name}
                      </p>
                      <p className="text-[10px] text-[#94A3B8]">{wheel.finish}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: GRILLE & FRONT FASCIA */}
          <div className="bg-[#131620]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
                <h3 className="font-label-caps text-xs tracking-wider text-[#94A3B8] font-bold">
                  3. GRILLE SPECIFICATION
                </h3>
              </div>
              <span className="text-xs font-semibold text-white">{config.grille.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {GRILLE_OPTIONS.map((grille) => {
                const isSelected = config.grille.id === grille.id;
                return (
                  <button
                    key={grille.id}
                    onClick={() => handleSelectGrille(grille)}
                    className={`p-3.5 rounded-xl border flex flex-col gap-1.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2563EB]/15 border-[#60A5FA] shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{grille.name}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#60A5FA] text-[18px]">
                          check_circle
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-tight">
                      {grille.description}
                    </p>
                    <span className="text-[10px] font-mono text-[#60A5FA] mt-1">
                      {grille.finish}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: AESTHETIC VIBE / STYLE */}
          <div className="bg-[#131620]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
                <h3 className="font-label-caps text-xs tracking-wider text-[#94A3B8] font-bold">
                  4. AESTHETIC VIBE &amp; AERO
                </h3>
              </div>
              <span className="text-xs font-semibold text-white">{config.aesthetic.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AESTHETIC_OPTIONS.map((aesthetic) => {
                const isSelected = config.aesthetic.id === aesthetic.id;
                return (
                  <button
                    key={aesthetic.id}
                    onClick={() => handleSelectAesthetic(aesthetic)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#2563EB]/15 border-[#60A5FA] shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#2563EB]/30 text-[#60A5FA]'
                            : 'bg-white/5 text-[#94A3B8]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {aesthetic.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">
                          {aesthetic.name}
                        </p>
                        <p className="text-[11px] text-[#94A3B8]">{aesthetic.subtitle}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[#60A5FA] text-[20px]">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: ADVANCED MODIFICATIONS (Headlights, Tint, Ride Height, Spoilers, etc.) */}
          <div className="bg-[#131620]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]" />
              <h3 className="font-label-caps text-xs tracking-wider text-[#94A3B8] font-bold">
                5. MODIFICATION CATALOG (LIGHTS, TINT, STANCE, ROOF, EXHAUST)
              </h3>
            </div>

            {/* Sub-grid for additional functional modifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Headlights */}
              <div className="p-3 bg-[#0F121C] rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase block font-bold">
                  Headlights Optics
                </span>
                <div className="space-y-1.5">
                  {HEADLIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectHeadlights(opt)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        currentBuild?.headlights === opt.name
                          ? 'bg-[#2563EB]/25 text-white border border-[#60A5FA]/40'
                          : 'bg-white/[0.02] text-[#CBD5E1] hover:bg-white/5'
                      }`}
                    >
                      <span>{opt.name}</span>
                      <span className="text-[9px] text-[#94A3B8]">{opt.type.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Window Tint */}
              <div className="p-3 bg-[#0F121C] rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase block font-bold">
                  Window Tint Privacy
                </span>
                <div className="space-y-1.5">
                  {TINT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectTint(opt)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        currentBuild?.tint === opt.name
                          ? 'bg-[#2563EB]/25 text-white border border-[#60A5FA]/40'
                          : 'bg-white/[0.02] text-[#CBD5E1] hover:bg-white/5'
                      }`}
                    >
                      <span>{opt.name}</span>
                      <span className="text-[9px] text-[#94A3B8]">{opt.percent}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ride Height */}
              <div className="p-3 bg-[#0F121C] rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase block font-bold">
                  Suspension Stance
                </span>
                <div className="space-y-1.5">
                  {RIDE_HEIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectRideHeight(opt)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        currentBuild?.rideHeight === opt.name
                          ? 'bg-[#2563EB]/25 text-white border border-[#60A5FA]/40'
                          : 'bg-white/[0.02] text-[#CBD5E1] hover:bg-white/5'
                      }`}
                    >
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Kit */}
              <div className="p-3 bg-[#0F121C] rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase block font-bold">
                  Body Kit &amp; Flares
                </span>
                <div className="space-y-1.5">
                  {BODYKIT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectBodyKit(opt)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        currentBuild?.bodyKit === opt.name
                          ? 'bg-[#2563EB]/25 text-white border border-[#60A5FA]/40'
                          : 'bg-white/[0.02] text-[#CBD5E1] hover:bg-white/5'
                      }`}
                    >
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Spoiler */}
              <div className="p-3 bg-[#0F121C] rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase block font-bold">
                  Rear Spoiler / Wing
                </span>
                <div className="space-y-1.5">
                  {SPOILER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectSpoiler(opt)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        currentBuild?.spoiler === opt.name
                          ? 'bg-[#2563EB]/25 text-white border border-[#60A5FA]/40'
                          : 'bg-white/[0.02] text-[#CBD5E1] hover:bg-white/5'
                      }`}
                    >
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Roof & Mirrors */}
              <div className="p-3 bg-[#0F121C] rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase block font-bold">
                  Roof &amp; Mirror Accents
                </span>
                <div className="space-y-1.5">
                  {ROOF_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectRoof(opt)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        currentBuild?.roof === opt.name
                          ? 'bg-[#2563EB]/25 text-white border border-[#60A5FA]/40'
                          : 'bg-white/[0.02] text-[#CBD5E1] hover:bg-white/5'
                      }`}
                    >
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exhaust */}
              <div className="p-3 bg-[#0F121C] rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase block font-bold">
                  Exhaust System
                </span>
                <div className="space-y-1.5">
                  {EXHAUST_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectExhaust(opt)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        currentBuild?.exhaust === opt.name
                          ? 'bg-[#2563EB]/25 text-white border border-[#60A5FA]/40'
                          : 'bg-white/[0.02] text-[#CBD5E1] hover:bg-white/5'
                      }`}
                    >
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Off-Road Package */}
              <div className="p-3 bg-[#0F121C] rounded-xl border border-white/5 space-y-2 sm:col-span-2">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase block font-bold">
                  Overland &amp; Off-Road Package
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {OFFROAD_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOffroad(opt)}
                      className={`text-left p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        currentBuild?.offroad === opt.name
                          ? 'bg-[#2563EB]/25 text-white border border-[#60A5FA]/40'
                          : 'bg-white/[0.02] text-[#CBD5E1] hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Generate Button */}
      <div className="fixed bottom-4 left-0 w-full px-4 sm:px-6 z-40 max-w-5xl mx-auto right-0">
        <button
          id="btn-generate-ai-preview"
          onClick={handleGenerate}
          className="w-full py-4 rounded-full font-bold text-white text-sm sm:text-base bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-[#60A5FA] hover:from-[#4338CA] hover:to-[#1D4ED8] transition-all shadow-[0_0_35px_rgba(79,70,229,0.6)] flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          <span>
            {isCustomPromptMode ? 'Generate with Gemini AI' : 'Generate Full AI 8K Studio Showcase'}
          </span>
        </button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          id="fullscreen-preview-modal"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md"
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <img
            src={currentRenderedImg}
            alt="Fullscreen Car Preview"
            className="max-w-6xl max-h-[85vh] w-full object-contain rounded-2xl drop-shadow-[0_0_50px_rgba(0,123,255,0.3)]"
          />
          <div className="mt-4 font-mono text-[#93C5FD] text-sm text-center">
            {buildDnaString}
          </div>
        </div>
      )}
    </div>
  );
};
