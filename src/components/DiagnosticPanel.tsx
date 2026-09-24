import React, { useState } from 'react';
import { DiagnosticTelemetry, CurrentBuildState } from '../types';

interface DiagnosticPanelProps {
  telemetry: DiagnosticTelemetry;
  currentBuild: CurrentBuildState;
  onRefreshHealth?: () => void;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  telemetry,
  currentBuild,
  onRefreshHealth,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div
      id="dev-diagnostic-panel"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 font-mono text-xs max-w-sm w-[92vw] sm:w-[360px] bg-[#0c101c]/95 backdrop-blur-xl border border-[#3B82F6]/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-[#E2E8F0] overflow-hidden transition-all duration-300"
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-3.5 py-2.5 bg-[#131a2e]/90 border-b border-white/10 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                telemetry.visionApiStatus === 'Connected' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                telemetry.visionApiStatus === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="font-bold tracking-wider text-[11px] text-white flex items-center gap-1.5">
            <span className="text-[#60A5FA]">SYS DIAGNOSTICS</span>
            <span className="text-[10px] text-slate-400 font-normal">v2.4</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshHealth && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefreshHealth();
              }}
              title="Ping Backend API"
              className="text-[#94A3B8] hover:text-white p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
            </button>
          )}
          <span className="material-symbols-outlined text-[16px] text-[#94A3B8]">
            {isExpanded ? 'expand_more' : 'expand_less'}
          </span>
        </div>
      </div>

      {/* Content Body */}
      {isExpanded && (
        <div className="p-3.5 space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar">
          {/* Status Matrix */}
          <div className="space-y-1.5 bg-[#070a14]/60 p-2.5 rounded-xl border border-white/5">
            {/* Upload */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Upload:</span>
              <span className="font-bold flex items-center gap-1">
                {telemetry.uploadStatus === 'loaded' ? (
                  <span className="text-emerald-400">✓ Loaded</span>
                ) : (
                  <span className="text-slate-500">○ Pending</span>
                )}
              </span>
            </div>

            {/* Image loaded */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Image loaded:</span>
              <span className="font-bold">
                {telemetry.imageLoaded ? (
                  <span className="text-emerald-400">✓ Yes</span>
                ) : (
                  <span className="text-slate-500">✗ No</span>
                )}
              </span>
            </div>

            {/* Image size */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Image size:</span>
              <span className="text-slate-200 font-medium">{telemetry.imageDimensions}</span>
            </div>

            {/* Vision API */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Vision API:</span>
              <span
                className={`font-bold ${
                  telemetry.visionApiStatus === 'Connected'
                    ? 'text-emerald-400'
                    : telemetry.visionApiStatus === 'Checking...'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {telemetry.visionApiStatus}
              </span>
            </div>

            {/* Analysis request */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Analysis request:</span>
              <span
                className={`font-semibold ${
                  telemetry.analysisRequestStatus === 'Sent'
                    ? 'text-emerald-400'
                    : telemetry.analysisRequestStatus === 'In-Flight'
                    ? 'text-sky-400 animate-pulse'
                    : telemetry.analysisRequestStatus === 'Failed'
                    ? 'text-rose-400'
                    : 'text-slate-500'
                }`}
              >
                {telemetry.analysisRequestStatus}
              </span>
            </div>

            {/* Analysis response */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Analysis response:</span>
              <span
                className={`font-semibold ${
                  telemetry.analysisResponseStatus === 'Received'
                    ? 'text-emerald-400'
                    : telemetry.analysisResponseStatus === 'Failed' ||
                      telemetry.analysisResponseStatus === 'Error'
                    ? 'text-rose-400'
                    : 'text-slate-500'
                }`}
              >
                {telemetry.analysisResponseStatus}
              </span>
            </div>

            {/* Vehicle detected */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Vehicle detected:</span>
              <span
                className={`font-bold ${
                  telemetry.vehicleDetected === 'Yes'
                    ? 'text-emerald-400'
                    : telemetry.vehicleDetected === 'No'
                    ? 'text-rose-400'
                    : 'text-slate-500'
                }`}
              >
                {telemetry.vehicleDetected}
                {telemetry.vehicleDetected === 'Yes' &&
                  ` (${telemetry.detectedMake} ${telemetry.detectedModel})`}
              </span>
            </div>

            {/* Customization state */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Customization state:</span>
              <span className="text-emerald-400 font-bold">
                {telemetry.customizationState}
              </span>
            </div>

            {/* Generation API */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Generation API:</span>
              <span
                className={`font-bold ${
                  telemetry.generationApiStatus === 'Connected'
                    ? 'text-emerald-400'
                    : telemetry.generationApiStatus === 'Checking...'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {telemetry.generationApiStatus}
              </span>
            </div>
          </div>

          {/* Current Build State Live Inspection */}
          <div className="p-2 bg-[#131620] rounded-xl border border-white/5 text-[11px] space-y-1">
            <div className="text-[#60A5FA] font-bold uppercase tracking-wider text-[10px]">
              Active Build State (Central)
            </div>
            <div className="truncate text-slate-300">
              <span className="text-slate-500">Paint:</span> {currentBuild.paint}
            </div>
            <div className="truncate text-slate-300">
              <span className="text-slate-500">Wheels:</span> {currentBuild.wheels}
            </div>
            <div className="truncate text-slate-300">
              <span className="text-slate-500">Grille:</span> {currentBuild.grille}
            </div>
            <div className="truncate text-slate-300">
              <span className="text-slate-500">Style:</span> {currentBuild.style}
            </div>
          </div>

          {/* Error display if any */}
          {telemetry.lastError && (
            <div className="p-2 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-[10px] break-words">
              <span className="font-bold text-rose-400">Last Error:</span> {telemetry.lastError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
