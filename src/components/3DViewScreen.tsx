import React, { useState, useRef } from 'react';
import { CarPreset, CustomizationConfig, DetectedVehicleInfo, CurrentBuildState } from '../types';
import { ThreeCarCanvas } from './ThreeCarCanvas';

interface ThreeDViewScreenProps {
  selectedCar: CarPreset;
  config: CustomizationConfig;
  customImage?: string;
  detectedInfo?: DetectedVehicleInfo | null;
  currentBuild?: CurrentBuildState;
  onProceedToCustomize: () => void;
  onSwitchTo2D: () => void;
  onOpenMorph?: () => void;
}

export const ThreeDViewScreen: React.FC<ThreeDViewScreenProps> = ({
  selectedCar,
  config,
  customImage,
  detectedInfo,
  currentBuild,
  onProceedToCustomize,
  onSwitchTo2D,
  onOpenMorph,
}) => {
  // 3D camera & lighting state
  const [rotationAngle, setRotationAngle] = useState<number>(45);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lightingPreset, setLightingPreset] = useState<'studio' | 'cyberpunk' | 'golden' | 'showroom'>('studio');
  const [activeAnglePreset, setActiveAnglePreset] = useState<'front34' | 'side' | 'rear34' | 'top' | 'grille'>('front34');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset to default 3D camera
  const handleResetCamera = () => {
    setRotationAngle(45);
    setActiveAnglePreset('front34');
    setIsAutoRotating(false);
  };

  // Select angle preset
  const handleSelectAnglePreset = (preset: 'front34' | 'side' | 'rear34' | 'top' | 'grille') => {
    setActiveAnglePreset(preset);
    switch (preset) {
      case 'front34':
        setRotationAngle(45);
        break;
      case 'side':
        setRotationAngle(90);
        break;
      case 'rear34':
        setRotationAngle(150);
        break;
      case 'top':
        setRotationAngle(45);
        break;
      case 'grille':
        setRotationAngle(0);
        break;
    }
  };

  // Background lighting style calculation
  const getLightingStyle = () => {
    switch (lightingPreset) {
      case 'cyberpunk':
        return 'from-[#1A0B2E] via-[#0D1117] to-[#05050A] shadow-[inset_0_0_80px_rgba(168,85,247,0.3)]';
      case 'golden':
        return 'from-[#2E1807] via-[#141416] to-[#0A0A0E] shadow-[inset_0_0_80px_rgba(245,158,11,0.25)]';
      case 'showroom':
        return 'from-[#182032] via-[#0F1420] to-[#0B0D14] shadow-[inset_0_0_80px_rgba(96,165,250,0.25)]';
      case 'studio':
      default:
        return 'from-[#121624] via-[#0B0D14] to-[#05060A] shadow-[inset_0_0_80px_rgba(37,99,235,0.2)]';
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-36 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-[#0B0D14] max-w-none p-6 overflow-y-auto' : ''}`}>
      {/* Screen Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#C084FC] text-[10px] font-mono font-bold tracking-wide uppercase">
              Three.js WebGL Engine
            </span>
            <span className="text-xs font-mono text-[#94A3B8]">
              Interactive 3D Preview (Build DNA Synced)
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{currentBuild?.vehicle.make && currentBuild?.vehicle.model ? `${currentBuild.vehicle.make} ${currentBuild.vehicle.model}` : selectedCar.name}</span>
            <span className="text-xs text-[#60A5FA] font-mono font-normal">
              ({detectedInfo?.year || currentBuild?.vehicle.year || selectedCar.year || '2024'})
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch to 2D view button */}
          <button
            onClick={onSwitchTo2D}
            className="px-3.5 py-2 rounded-xl bg-[#1E2230] hover:bg-[#282E42] border border-white/10 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
            <span>2D Visualizer</span>
          </button>

          {/* Talk to MORPH */}
          {onOpenMorph && (
            <button
              onClick={onOpenMorph}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            >
              <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
              <span>Talk to MORPH</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 3D Viewport Box */}
      <div
        ref={containerRef}
        className={`w-full rounded-3xl border border-white/15 relative overflow-hidden bg-gradient-to-b ${getLightingStyle()} transition-all duration-500 shadow-2xl mb-6 select-none`}
      >
        {/* Top Badges & Notice */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 flex items-center gap-2 shadow-lg w-fit pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-white">
              INTERACTIVE 3D PREVIEW
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#94A3B8] px-1 bg-black/60 backdrop-blur-sm rounded-md w-fit">
            Drag to orbit • Scroll to zoom • {Math.round(rotationAngle)}°
          </span>
        </div>

        {/* Top Right Tool Bar (Auto-rotate, Wireframe, Reset, Fullscreen) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Turntable Auto-Rotate Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoRotating(!isAutoRotating);
            }}
            title="Auto Rotate Turntable"
            className={`px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
              isAutoRotating
                ? 'bg-[#3B82F6] text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                : 'bg-black/60 text-[#94A3B8] border-white/15 hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${isAutoRotating ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isAutoRotating ? 'Turntable Active' : 'Auto Rotate'}</span>
          </button>

          {/* Wireframe toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowWireframe(!showWireframe);
            }}
            className={`px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
              showWireframe
                ? 'bg-[#8B5CF6] text-white border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.6)]'
                : 'bg-black/60 text-[#94A3B8] border-white/15 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_4x4</span>
            <span>{showWireframe ? 'Wireframe ON' : 'Mesh View'}</span>
          </button>

          {/* Reset Camera */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleResetCamera();
            }}
            title="Reset 3D Camera"
            className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white hover:bg-black/90 flex items-center justify-center transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(!isFullscreen);
            }}
            title="Fullscreen Toggle"
            className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white hover:bg-black/90 flex items-center justify-center transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>

        {/* Center 3D Three.js WebGL Stage */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center overflow-hidden">
          <ThreeCarCanvas
            currentBuild={currentBuild}
            config={config}
            lightingPreset={lightingPreset}
            showWireframe={showWireframe}
            isAutoRotating={isAutoRotating}
            activeAnglePreset={activeAnglePreset}
            onRotationChange={(ang) => setRotationAngle(ang)}
          />
        </div>

        {/* Bottom Interactive HUD Bar */}
        <div className="p-4 sm:p-5 bg-[#0B0D14]/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
          {/* Angle Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase shrink-0 mr-1">
              Angle:
            </span>
            {[
              { id: 'front34', label: 'Front 3/4' },
              { id: 'side', label: 'Side' },
              { id: 'rear34', label: 'Rear 3/4' },
              { id: 'top', label: 'Top' },
              { id: 'grille', label: 'Grille Zoom' },
            ].map((ang) => (
              <button
                key={ang.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAnglePreset(ang.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
                  activeAnglePreset === ang.id
                    ? 'bg-[#2563EB] text-white shadow-md'
                    : 'bg-white/5 text-[#94A3B8] hover:text-white'
                }`}
              >
                {ang.label}
              </button>
            ))}
          </div>

          {/* Lighting Presets */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase shrink-0 mr-1">
              Lighting:
            </span>
            {[
              { id: 'studio', label: 'Studio Neon', color: '#3B82F6' },
              { id: 'cyberpunk', label: 'Cyberpunk', color: '#A855F7' },
              { id: 'golden', label: 'Golden Hour', color: '#F59E0B' },
              { id: 'showroom', label: 'Showroom', color: '#E2E8F0' },
            ].map((lit) => (
              <button
                key={lit.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightingPreset(lit.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                  lightingPreset === lit.id
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'bg-white/5 border-white/5 text-[#94A3B8] hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: lit.color }}
                />
                <span>{lit.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Geometry & Specs Card */}
      <div className="bg-[#131620]/90 border border-white/10 rounded-2xl p-5 mb-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-label-caps text-xs tracking-wider text-[#94A3B8] font-bold">
            BUILD DNA &amp; 3D SPATIAL TELEMETRY
          </h3>
          <span className="text-xs font-mono text-[#60A5FA]">
            {detectedInfo?.vehicleType || currentBuild?.vehicle.vehicleType || selectedCar.category}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[#94A3B8] text-[11px]">Chassis / Geometry</p>
            <p className="font-bold text-white mt-0.5 truncate">
              {currentBuild?.bodyKit || 'Aerodynamic Wedge Coupe'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[#94A3B8] text-[11px]">Grille Spec</p>
            <p className="font-bold text-white mt-0.5 truncate">
              {currentBuild?.grille || config.grille.name}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[#94A3B8] text-[11px]">Wheel Setup</p>
            <p className="font-bold text-white mt-0.5 truncate">
              {currentBuild?.wheels || config.wheels.name}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[#94A3B8] text-[11px]">3D Paint Material</p>
            <p className="font-bold text-white mt-0.5 truncate">
              {currentBuild?.paint || config.paint.name}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onSwitchTo2D}
          className="w-full sm:w-1/3 py-4 rounded-full bg-[#1E2230] hover:bg-[#282E42] border border-white/10 text-white font-bold text-sm transition-all cursor-pointer"
        >
          Back to 2D Visualizer
        </button>

        <button
          id="btn-3d-proceed-customize"
          onClick={onProceedToCustomize}
          className="w-full sm:w-2/3 py-4 rounded-full font-bold text-white text-base bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:from-[#4338CA] hover:to-[#1D4ED8] transition-all shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          <span>Proceed to Customize Studio</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
