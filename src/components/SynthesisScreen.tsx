import React, { useState, useEffect, useRef } from 'react';
import { CurrentBuildState } from '../types';
import { generateVehicleVisualization } from '../lib/vehicleService';

interface SynthesisScreenProps {
  currentBuild: CurrentBuildState;
  onComplete: (generatedImageUrl: string) => void;
  onModifyAgain: () => void;
  onUpdateDiagnostics?: (info: {
    generationApiStatus: 'Connected' | 'Not Connected';
    error: string | null;
  }) => void;
}

const MESSAGES = [
  'Synthesizing aero package & body curvature...',
  'Applying metallic reflections & paint coat...',
  'Fitting custom forged wheels & brake fitment...',
  'Rendering photorealistic studio lighting...',
];

export const SynthesisScreen: React.FC<SynthesisScreenProps> = ({
  currentBuild,
  onComplete,
  onModifyAgain,
  onUpdateDiagnostics,
}) => {
  const [progress, setProgress] = useState<number>(20);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Cycle through visual progress messages
    const messageInterval = setInterval(() => {
      if (isMountedRef.current) {
        setActiveMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        setProgress((prev) => Math.min(prev + 15, 90));
      }
    }, 1200);

    const performGeneration = async () => {
      setIsGenerating(true);
      setGenerationError(null);

      try {
        const result = await generateVehicleVisualization(currentBuild);

        if (!isMountedRef.current) return;

        setProgress(100);
        setIsGenerating(false);
        clearInterval(messageInterval);

        onUpdateDiagnostics?.({
          generationApiStatus: 'Connected',
          error: null,
        });

        // Small delay to let user see 100% complete
        setTimeout(() => {
          if (isMountedRef.current) {
            onComplete(result.imageUrl);
          }
        }, 600);
      } catch (err: any) {
        if (!isMountedRef.current) return;

        clearInterval(messageInterval);
        setIsGenerating(false);
        const errMsg =
          err.message ||
          'AI generation failed. Server GEMINI_API_KEY may not be configured.';
        setGenerationError(errMsg);

        onUpdateDiagnostics?.({
          generationApiStatus: 'Not Connected',
          error: errMsg,
        });
      }
    };

    performGeneration();

    return () => {
      isMountedRef.current = false;
      clearInterval(messageInterval);
    };
  }, [currentBuild]);

  const circumference = 283;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-28 flex flex-col items-center justify-center min-h-[85vh]">
      {/* Screen Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onModifyAgain}
          className="w-10 h-10 rounded-full bg-[#1E2230] border border-white/10 flex items-center justify-center text-white hover:bg-[#282E42] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            Generating AI Preview
          </h1>
          <p className="text-xs text-[#94A3B8]">AutoMorph AI Vision Generator</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Center Synthesis Canvas */}
      <div className="w-full rounded-3xl bg-[#131620] border border-[#3B82F6]/30 overflow-hidden relative shadow-[0_0_60px_rgba(37,99,235,0.2)] p-6 sm:p-10 flex flex-col items-center justify-center mb-8">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#2563EB]/20 rounded-full blur-[80px] pointer-events-none" />

        {/* Circular Progress Ring */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center rounded-full bg-[#0F121C] border border-white/10 shadow-2xl mb-8">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-[#1E2230]"
              cx="50"
              cy="50"
              fill="none"
              r="45"
              stroke="currentColor"
              strokeWidth="4"
            />
            <circle
              className="text-[#3B82F6] transition-all duration-300 ease-out"
              cx="50"
              cy="50"
              fill="none"
              r="45"
              stroke="url(#blue-gradient)"
              strokeLinecap="round"
              strokeWidth="4.5"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
            <defs>
              <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Info */}
          <div className="flex flex-col items-center justify-center z-10">
            <span className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {progress}%
            </span>
            <span className="text-[10px] font-mono text-[#60A5FA] tracking-widest uppercase mt-1">
              {isGenerating ? 'SYNTHESIZING' : generationError ? 'ERROR' : 'COMPLETE'}
            </span>
          </div>
        </div>

        {/* Status Message / Error Message */}
        {generationError ? (
          <div className="flex flex-col items-center text-center z-10 max-w-md p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>Generation Error</span>
            </div>
            <p className="font-mono text-slate-300 break-words">{generationError}</p>
            <p className="text-slate-400 text-[11px] pt-1">
              You can adjust your build parameters or continue working with the real-time 3D and 2D canvas.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center z-10 max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-ping" />
              <span className="text-xs font-bold text-[#60A5FA] uppercase tracking-wider font-mono">
                BUILD DNA ACTIVE
              </span>
            </div>
            <p className="text-white font-semibold text-base sm:text-lg mb-1 h-7">
              {MESSAGES[activeMessageIndex]}
            </p>
            <p className="text-xs text-[#94A3B8]">
              {currentBuild.paint} • {currentBuild.wheels} • {currentBuild.grille} • {currentBuild.style}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
        <button
          onClick={onModifyAgain}
          className="w-full py-3.5 rounded-full bg-[#1E2230] border border-white/10 text-white font-semibold text-sm hover:bg-[#282E42] transition-colors cursor-pointer"
        >
          {generationError ? 'Back to Customizer' : 'Cancel & Adjust'}
        </button>
        {generationError && (
          <button
            onClick={() => {
              // Fallback to studio preview if user wants to see the composed design
              onComplete(currentBuild.uploadedImage || '');
            }}
            className="w-full py-3.5 rounded-full bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1D4ED8] transition-colors cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            View in Studio
          </button>
        )}
      </div>
    </div>
  );
};
