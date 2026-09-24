import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CustomizationConfig, CarPreset } from '../types';

interface ResultScreenProps {
  selectedCar: CarPreset;
  config: CustomizationConfig;
  customImage?: string;
  originalImage?: string;
  modifiedImage?: string;
  onSaveBuild: () => void;
  onShare: () => void;
  onTryAnother: () => void;
  onOpenVeoStudio?: () => void;
  onOpenGeminiChat?: () => void;
  onOpenSearchIntel?: () => void;
  onOpenMorph?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  selectedCar,
  config,
  customImage,
  originalImage: explicitOriginal,
  modifiedImage: explicitModified,
  onSaveBuild,
  onShare,
  onTryAnother,
  onOpenVeoStudio,
  onOpenGeminiChat,
  onOpenSearchIntel,
  onOpenMorph,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  const buildDna = `${selectedCar.name} • ${config.paint.name} • ${config.wheels.name.split(' ')[0]} • ${config.aesthetic.name} Package`;

  // Original image (Before)
  const originalImage =
    explicitOriginal ||
    selectedCar.stockImage ||
    customImage ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCRWEC1Qs6WZEq9EqCXJl9NXqBychO3nQtB_2C19u9a6NDP_reElu8b_Kk5aKrDrBm56QvWTAV2ATUthaeyWtmh0GHToCWYCWHHDLzLfDRJ585Bg9k0emXJ9R36gV3D7oSgh04Hj1ANynyY9JF8_sok_f_7hS2IC7vjyvffnpBkSSRdldLvBEias8KxDUQ7_PDjNHR1dKV99bPmrNMoe_FSVNvCKAVtj5nrseqP71SuS9xUON8I9bttlA';

  // Modified image (After)
  const modifiedImage =
    explicitModified ||
    (config.promptOverride && customImage
      ? customImage
      : config.paint.id === 'obsidian-black'
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBCJkp8Sgcf_VRNXS0ejRskUYBX4PtzwoALfIvGmYkrPqxuXWIlGBBVkmZ5XDpZAAVwTZhMhJNxoasNFvCZlxWl5jJXFgH0OyDVSOub_A9bGzF5i2aTQwzAnXbkLeZZIdwLZ_0yLPI1_MYTkJWgu35023oQ_YZxn-STI2Iwuoj9oTC6imnZYJNwQ3lS4MgIAp2fK_rvKTo9tVKdJ5QAHQo73qjcInHy6BPehRioOxfGEV1HEueNOqtGw'
      : config.paint.id === 'racing-red'
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBud71ysvob4Z5mRBqSZOz2xhLTRgTJSv8pT5zpCjVr1pCbVdEW0skIGqYsz80IyNCIeILZhsboZbxoG22QbPrF9GqPK6a104SZlLDqI6q_1UWPkIw_Ept-fZEiUH_iC2XRSjcax8H4R1OhPk8C2pKLOC2I9_lv_rMto0WS2ng5eFG4DZYE8bPWTgAuXwJU8udmnIldQaj4_sjZUvm6TkM0IxiAp8Cv019ySYfKGxRnSw4TvwrYGQvlTA'
      : config.paint.id === 'metallic-blue'
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaHj1akc_EKHpiNsemAlNX4K04irbeU-V6W-T8yGySuKIr98SUUEhRR6yDe4l2armf5YfBMZckPTxla_5wteHBhP6KhHUoJTZUbnJIqTR6zkL-Amb9_gHh6hD0ORxfPdqkAWNceLS4JlyhyDCpTDkn-vQMcgd2qg83cwXSfqeZi7NzN7T9dwO2ERswtpQoO9C3tpeOnBLkIV3Ncjk-esIzufq0Khkrq3zASdhTkgL_8K68OnKcnoADAg'
      : customImage ||
        selectedCar.customizedImages?.['default'] ||
        selectedCar.studioImage);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [handleMouseMove, handleTouchMove, handleEnd]);

  const handleSave = () => {
    setIsSaved(true);
    onSaveBuild();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-36 flex flex-col">
      {/* Screen Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onTryAnother}
          className="w-10 h-10 rounded-full bg-[#1E2230] border border-white/10 flex items-center justify-center text-white hover:bg-[#282E42] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            Your Custom Build
          </h1>
          <p className="text-xs text-[#94A3B8]">{selectedCar.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="w-10 h-10 rounded-full bg-[#1E2230] border border-white/10 flex items-center justify-center text-white hover:bg-[#282E42] transition-colors cursor-pointer"
            title="Share"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
          </button>
        </div>
      </div>

      {/* Before / After Comparison Slider */}
      <div
        ref={containerRef}
        id="compare-slider-container"
        onMouseDown={(e) => {
          isDraggingRef.current = true;
          updatePosition(e.clientX);
        }}
        onTouchStart={(e) => {
          isDraggingRef.current = true;
          updatePosition(e.touches[0].clientX);
        }}
        className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-[#0F121C] border border-[#2563EB]/30 relative shadow-2xl mb-6 select-none cursor-ew-resize group"
      >
        {/* Background Layer: Modified / Custom After */}
        <div className="absolute inset-0 w-full h-full bg-[#0F121C] flex items-center justify-center p-4">
          <img
            src={modifiedImage}
            alt="Custom Build After"
            className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
          />
          <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-violet-600/90 to-blue-600/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold text-white font-mono tracking-wide">AI VISUALIZATION</span>
          </div>
        </div>

        {/* Foreground Layer: Original / Stock Before (Clipped) */}
        <div
          className="absolute inset-y-0 left-0 h-full overflow-hidden z-10 border-r-2 border-[#60A5FA] shadow-[0_0_20px_#3B82F6]"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="relative h-full flex items-center justify-center p-4 bg-[#0F121C]"
            style={{ width: containerRef.current?.offsetWidth || '100%' }}
          >
            <img
              src={originalImage}
              alt="Stock Build Before"
              className="w-full h-full object-contain max-w-none filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
              style={{
                width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
              }}
            />
            <div className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-lg">
              <span className="text-[11px] font-bold text-[#94A3B8] font-mono">STOCK BLUEPRINT</span>
            </div>
          </div>
        </div>

        {/* Interactive Drag Handle */}
        <div
          className="absolute inset-y-0 z-30 pointer-events-none -ml-[18px]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-9 h-9 bg-white text-[#0B0D14] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.8)] border-2 border-[#60A5FA]">
            <span className="material-symbols-outlined text-base font-bold">swap_horiz</span>
          </div>
        </div>
      </div>

      {/* MORPH Design Assessment Banner */}
      <div className="bg-gradient-to-r from-[#171A29] via-[#1E1B4B]/80 to-[#0F172A] border border-violet-500/30 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] shrink-0">
            <span className="text-lg font-black">✦</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wider">✦ MORPH CRITIQUE</span>
              <span className="text-[10px] font-mono text-[#38BDF8] bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                BUILD DNA: {selectedCar.name}
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">
              “That stance works. 🔥 Your preview is ready. Want to push it further?”
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenMorph}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#38BDF8] hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)] active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
          <span>Ask MORPH to Push It Further</span>
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <button
          id="btn-save-build"
          onClick={handleSave}
          className={`py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
            isSaved
              ? 'bg-green-600 text-white shadow-green-600/30'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSaved ? 'check_circle' : 'bookmark'}
          </span>
          <span>{isSaved ? 'Saved in Garage' : 'Save Build'}</span>
        </button>

        <button
          onClick={onShare}
          className="py-3.5 px-4 rounded-2xl font-semibold text-sm bg-[#1E2230] hover:bg-[#282E42] border border-white/10 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">ios_share</span>
          <span>Share Build</span>
        </button>

        <button
          onClick={onTryAnother}
          className="col-span-2 sm:col-span-1 py-3.5 px-4 rounded-2xl font-semibold text-sm bg-[#1E2230] hover:bg-[#282E42] border border-white/10 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
          <span>New Build</span>
        </button>
      </div>

      {/* AI Supercharging Tools Banner (Veo Video, Gemini Chat, Google Search Grounding) */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#1E2230] to-[#0F172A] border border-[#6366F1]/30 p-5 mb-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#A5B4FC]">bolt</span>
          <h3 className="font-display text-sm font-bold text-white tracking-wide">
            Next-Gen Gemini Capabilities for This Build
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Veo Video */}
          <button
            onClick={onOpenVeoStudio}
            className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-[#8B5CF6]/20 border border-white/10 hover:border-[#8B5CF6]/50 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#C4B5FD] text-lg group-hover:scale-110 transition-transform">
                movie
              </span>
              <span className="text-xs font-bold text-white">Animate Video</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Render 4K rolling video with Veo 3.1
            </p>
          </button>

          {/* Gemini Tuner Chat */}
          <button
            onClick={onOpenGeminiChat}
            className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-[#2563EB]/20 border border-white/10 hover:border-[#3B82F6]/50 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#60A5FA] text-lg group-hover:scale-110 transition-transform">
                chat
              </span>
              <span className="text-xs font-bold text-white">Consult Tuner</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Multi-turn chat on aero, dyno &amp; fitment
            </p>
          </button>

          {/* Search Grounding */}
          <button
            onClick={onOpenSearchIntel}
            className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-[#10B981]/20 border border-white/10 hover:border-[#10B981]/50 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#34D399] text-lg group-hover:scale-110 transition-transform">
                travel_explore
              </span>
              <span className="text-xs font-bold text-white">Parts Grounding</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Google search real prices &amp; fitment specs
            </p>
          </button>
        </div>
      </div>

      {/* Modification Specs Card */}
      <div className="w-full bg-[#131620]/90 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <h3 className="font-label-caps text-xs tracking-wider text-[#94A3B8] font-bold mb-4">
          MODIFICATION SPECIFICATIONS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Paint */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center shrink-0 shadow"
              style={{ backgroundColor: config.paint.hex }}
            >
              <span className="material-symbols-outlined text-white text-base">format_paint</span>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Paint Finish</p>
              <p className="text-sm font-bold text-white">
                {config.paint.name}{' '}
                <span className="text-xs text-[#60A5FA]">({config.paint.finish})</span>
              </p>
            </div>
          </div>

          {/* Wheels */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/20 text-[#60A5FA] border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">radio_button_unchecked</span>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Wheels &amp; Fitment</p>
              <p className="text-sm font-bold text-white">
                {config.wheels.name}{' '}
                <span className="text-xs text-[#60A5FA]">({config.wheels.finish})</span>
              </p>
            </div>
          </div>

          {/* Aesthetic */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#818CF8]/20 text-[#A5B4FC] border border-[#818CF8]/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">{config.aesthetic.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Aero Package</p>
              <p className="text-sm font-bold text-white">{config.aesthetic.name}</p>
            </div>
          </div>

          {/* Stance */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C084FC]/20 text-[#E9D5FF] border border-[#C084FC]/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">straighten</span>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Suspension &amp; Stance</p>
              <p className="text-sm font-bold text-white">-30mm Sport Drop</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
