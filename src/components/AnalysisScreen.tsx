import React, { useState, useEffect } from 'react';
import { CarPreset, DetectedVehicleInfo, StructuredVehicleAnalysis, CurrentBuildState } from '../types';
import { CAR_PRESETS } from '../data/mockData';
import { analyzeVehicleImage } from '../lib/vehicleService';

interface AnalysisScreenProps {
  selectedCar: CarPreset;
  customImage?: string;
  currentBuild?: CurrentBuildState;
  onUpdateBuild?: (updates: Partial<CurrentBuildState>) => void;
  onProceedToCustomize: (detectedCarInfo?: DetectedVehicleInfo) => void;
  onOpen3DView?: (detectedCarInfo?: DetectedVehicleInfo) => void;
  onCancel: () => void;
  onSelectPresetOverride?: (preset: CarPreset) => void;
  onUpdateDiagnostics?: (info: {
    analysisRequestStatus: 'Sent' | 'Failed' | 'In-Flight' | 'Idle';
    analysisResponseStatus: 'Idle' | 'Received' | 'Failed' | 'Error';
    vehicleDetected: 'Yes' | 'No';
    detectedMake: string;
    detectedModel: string;
    lastError: string | null;
  }) => void;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  selectedCar,
  customImage,
  currentBuild,
  onUpdateBuild,
  onProceedToCustomize,
  onOpen3DView,
  onCancel,
  onSelectPresetOverride,
  onUpdateDiagnostics,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(20);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<StructuredVehicleAnalysis | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>('Analyzing your vehicle…');
  const [showManualSelection, setShowManualSelection] = useState<boolean>(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setProgress(30);
    setAnalysisStep('Analyzing your vehicle…');

    onUpdateDiagnostics?.({
      analysisRequestStatus: 'In-Flight',
      analysisResponseStatus: 'Idle',
      vehicleDetected: 'No',
      detectedMake: 'Unknown',
      detectedModel: 'Unknown',
      lastError: null,
    });

    const imagePayload = customImage || currentBuild?.uploadedImage || selectedCar.analyzingImage || selectedCar.studioImage;

    try {
      setProgress(60);
      setAnalysisStep('Extracting make, model & visible parts…');

      const result = await analyzeVehicleImage(imagePayload);
      setProgress(100);
      setIsAnalyzing(false);
      setAnalysisData(result);

      if (!result.vehicleDetected) {
        setAnalysisError('No vehicle detected in the provided image.');
        onUpdateDiagnostics?.({
          analysisRequestStatus: 'Sent',
          analysisResponseStatus: 'Received',
          vehicleDetected: 'No',
          detectedMake: result.make,
          detectedModel: result.model,
          lastError: 'No vehicle detected in image',
        });
      } else {
        onUpdateDiagnostics?.({
          analysisRequestStatus: 'Sent',
          analysisResponseStatus: 'Received',
          vehicleDetected: 'Yes',
          detectedMake: result.make,
          detectedModel: result.model,
          lastError: null,
        });

        onUpdateBuild?.({
          vehicle: {
            make: result.make,
            model: result.model,
            vehicleType: result.vehicleType,
            detected: true,
            confidence: result.confidence,
            visibleParts: result.visibleParts,
          },
        });
      }
    } catch (err: any) {
      console.error('Vision analysis error:', err);
      setIsAnalyzing(false);
      setProgress(100);
      const errMsg = err.message || 'Vehicle analysis failed. Vision API may be unavailable.';
      setAnalysisError(errMsg);
      onUpdateDiagnostics?.({
        analysisRequestStatus: 'Failed',
        analysisResponseStatus: 'Error',
        vehicleDetected: 'No',
        detectedMake: 'Unknown',
        detectedModel: 'Unknown',
        lastError: errMsg,
      });
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [customImage, selectedCar]);

  const handleManualSelectCar = (preset: CarPreset) => {
    if (onSelectPresetOverride) {
      onSelectPresetOverride(preset);
    }
    const manualResult: StructuredVehicleAnalysis = {
      vehicleDetected: true,
      make: preset.name.split(' ')[0] || preset.name,
      model: preset.name,
      vehicleType: preset.category,
      confidence: 1.0,
      visibleParts: ['headlights', 'grille', 'wheels', 'body'],
      modelUsed: 'manual-selection',
    };
    setAnalysisData(manualResult);
    setShowManualSelection(false);
    setAnalysisError(null);
  };

  const currentDetectedInfo: DetectedVehicleInfo | undefined = analysisData
    ? {
        isVehicle: analysisData.vehicleDetected,
        confidence: Math.round(
          analysisData.confidence > 1 ? analysisData.confidence : analysisData.confidence * 100
        ),
        make: analysisData.make,
        model: analysisData.model,
        modelIdentified: analysisData.make !== 'Unknown' && analysisData.model !== 'Unknown',
        vehicleType: analysisData.vehicleType,
        visibleParts: analysisData.visibleParts,
        summary: `Vehicle detected: ${analysisData.make} ${analysisData.model} (${analysisData.vehicleType})`,
      }
    : undefined;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-36 flex flex-col">
      {/* Screen Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-[#1E2230] border border-white/10 flex items-center justify-center text-white hover:bg-[#282E42] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            Vehicle Detection &amp; Vision Analysis
          </h1>
          <p className="text-xs text-[#94A3B8]">AutoMorph AI Vision Engine</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#2563EB]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#60A5FA] font-mono text-xs font-bold">
          {progress}%
        </div>
      </div>

      {/* Main HUD Scanner Box */}
      <div className="w-full rounded-3xl overflow-hidden bg-[#131620] border border-[#2563EB]/40 relative shadow-[0_0_50px_rgba(37,99,235,0.15)] mb-6">
        {/* HUD Frame Corner Accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#60A5FA] z-20" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#60A5FA] z-20" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#60A5FA] z-20" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#60A5FA] z-20" />

        {/* Top Status Header */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 flex items-center gap-2 shadow-lg">
          <span
            className={`w-2 h-2 rounded-full ${
              isAnalyzing ? 'bg-[#60A5FA] animate-ping' : analysisData?.vehicleDetected ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
          <span className="text-[11px] font-mono text-white tracking-wider uppercase font-bold">
            {isAnalyzing
              ? 'Analyzing your vehicle…'
              : analysisData?.vehicleDetected
              ? 'Vehicle detected'
              : 'Analysis Complete'}
          </span>
        </div>

        {/* Viewport with vehicle image and laser */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-gradient-to-b from-[#0B0D14] to-[#131620] flex items-center justify-center p-6 overflow-hidden">
          {/* Laser Scanline (active while analyzing) */}
          {isAnalyzing && <div className="hud-scan-line z-20" />}

          {/* Grid Background Pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none z-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <img
            src={
              customImage ||
              selectedCar.analyzingImage ||
              selectedCar.studioImage
            }
            alt="Uploaded Car"
            className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] relative z-10"
          />
        </div>
      </div>

      {/* Progress & Processing State Banner */}
      {isAnalyzing && (
        <div className="w-full bg-[#131620]/90 border border-white/10 rounded-2xl p-5 mb-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-ping" />
              <p className="text-sm font-bold text-white">Analyzing your vehicle…</p>
            </div>
            <span className="text-xs font-mono text-[#60A5FA] font-bold">{progress}%</span>
          </div>

          <div className="w-full bg-[#1E2230] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#60A5FA] transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Detection Results Card */}
      {!isAnalyzing && analysisData && (
        <div className="w-full bg-[#131620]/90 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl mb-6 shadow-xl space-y-5">
          {/* Header Status */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-0.5">
                ANALYSIS OUTCOME
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {analysisData.vehicleDetected ? (
                  <>
                    <span className="material-symbols-outlined text-emerald-400 text-[22px]">
                      verified
                    </span>
                    <span>Vehicle detected</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-amber-400 text-[22px]">
                      warning
                    </span>
                    <span>No vehicle detected</span>
                  </>
                )}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-[#94A3B8] block">Confidence</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                {Math.round(
                  analysisData.confidence > 1 ? analysisData.confidence : analysisData.confidence * 100
                )}
                % Score
              </span>
            </div>
          </div>

          {/* If Vehicle is Detected: Display Make, Model, Body Type, Detection Confidence */}
          {analysisData.vehicleDetected ? (
            <>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-[#94A3B8]">Make &amp; Model</p>
                  <p className="text-lg font-bold text-white">
                    {analysisData.make !== 'Unknown' || analysisData.model !== 'Unknown'
                      ? `${analysisData.make} ${analysisData.model}`
                      : 'Make / Model: Unknown'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-[#2563EB]/20 text-[#60A5FA] border border-[#3B82F6]/40 px-3 py-1 rounded-full">
                    {analysisData.vehicleType || 'Vehicle'}
                  </span>
                </div>
              </div>

              {/* Detected Visible Parts */}
              <div>
                <h3 className="font-label-caps text-xs tracking-wider text-[#94A3B8] font-bold mb-3">
                  DETECTED VISIBLE COMPONENTS
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {analysisData.visibleParts.map((part, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-[#0F121C] border border-white/5 flex items-center gap-2 text-xs"
                    >
                      <span className="material-symbols-outlined text-[#60A5FA] text-[18px]">
                        check_circle
                      </span>
                      <span className="font-medium text-slate-200 capitalize">{part}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <p className="font-bold text-sm">No vehicle detected</p>
              <p className="text-[#94A3B8]">
                Please upload a clear vehicle photo, or select a model from the catalog below.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Analysis Error View */}
      {analysisError && !isAnalyzing && (
        <div className="w-full p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs mb-6 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>Analysis Error Details</span>
          </div>
          <p className="font-mono bg-black/40 p-2.5 rounded-lg text-slate-300 break-words">
            {analysisError}
          </p>
          <div className="flex gap-3 pt-1">
            <button
              onClick={runAnalysis}
              className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={() => setShowManualSelection(true)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Continue Manually
            </button>
          </div>
        </div>
      )}

      {/* Manual Selection Fallback Drawer */}
      {showManualSelection && (
        <div className="w-full bg-[#131620] border border-white/15 rounded-2xl p-5 mb-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">
              Select Vehicle from AutoMorph Catalog
            </h3>
            <button
              onClick={() => setShowManualSelection(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CAR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleManualSelectCar(preset)}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#0F121C] hover:bg-[#1E2230] border border-white/10 transition-all cursor-pointer text-left"
              >
                <img
                  src={preset.stockImage}
                  alt={preset.name}
                  className="w-12 h-10 rounded-lg object-cover bg-black"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{preset.name}</p>
                  <p className="text-[10px] text-[#94A3B8]">{preset.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Try Again / Try Another Image */}
        <button
          onClick={analysisError ? runAnalysis : onCancel}
          className="w-full sm:w-1/2 py-4 rounded-full bg-[#1E2230] hover:bg-[#282E42] border border-white/10 text-white font-bold text-sm transition-all cursor-pointer"
        >
          {analysisError ? 'Try Again' : 'Upload Another Image'}
        </button>

        {/* Continue Manually toggle */}
        {!analysisData?.vehicleDetected && !showManualSelection && (
          <button
            onClick={() => setShowManualSelection(true)}
            className="w-full sm:w-1/2 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition-all cursor-pointer"
          >
            Continue Manually
          </button>
        )}

        {/* 3D Preview Button */}
        {analysisData?.vehicleDetected && onOpen3DView && (
          <button
            id="btn-open-3d-preview"
            onClick={() => onOpen3DView(currentDetectedInfo)}
            className="w-full sm:w-1/2 py-4 rounded-full bg-[#1E2230] hover:bg-[#282E42] border border-violet-500/40 text-[#C084FC] hover:text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
          >
            <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
            <span>Inspect in 3D Preview</span>
          </button>
        )}

        {/* Proceed to Customize CTA */}
        {analysisData?.vehicleDetected && (
          <button
            id="btn-proceed-customize"
            onClick={() => onProceedToCustomize(currentDetectedInfo)}
            className="w-full sm:w-1/2 py-4 rounded-full font-bold text-white text-base bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:from-[#4338CA] hover:to-[#1D4ED8] transition-all shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <span>Proceed to Studio</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
};

