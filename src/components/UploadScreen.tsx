import React, { useState, useRef } from 'react';
import { CAR_PRESETS } from '../data/mockData';
import { CarPreset } from '../types';

interface UploadScreenProps {
  onContinueToAnalysis: (selectedCar: CarPreset, customImage?: string) => void;
  onCancel: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  onContinueToAnalysis,
  onCancel,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<CarPreset>(CAR_PRESETS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setUploadedImage(dataUrl);
        // Automatic analysis immediately after upload
        onContinueToAnalysis(selectedPreset, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSelectDefaultDemo = (presetToLoad?: CarPreset) => {
    const targetPreset = presetToLoad || selectedPreset;
    const demoImg =
      targetPreset.stockImage ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBCJkp8Sgcf_VRNXS0ejRskUYBX4PtzwoALfIvGmYkrPqxuXWIlGBBVkmZ5XDpZAAVwTZhMhJNxoasNFvCZlxWl5jJXFgH0OyDVSOub_A9bGzF5i2aTQwzAnXbkLeZZIdwLZ_0yLPI1_MYTkJWgu35023oQ_YZxn-STI2Iwuoj9oTC6imnZYJNwQ3lS4MgIAp2fK_rvKTo9tVKdJ5QAHQo73qjcInHy6BPehRioOxfGEV1HEueNOqtGw';
    setSelectedPreset(targetPreset);
    setUploadedImage(demoImg);
    onContinueToAnalysis(targetPreset, demoImg);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-28 flex flex-col">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Screen Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-[#1E2230] border border-white/10 flex items-center justify-center text-white hover:bg-[#282E42] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
          Upload Your Car
        </h1>
        <button
          onClick={() => handleSelectDefaultDemo()}
          className="w-10 h-10 rounded-full bg-[#1E2230] border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
          title="Sample Quick Load"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </button>
      </div>

      {/* Main Upload Box */}
      <div className="w-full flex flex-col gap-6">
        {!uploadedImage ? (
          /* Empty Drag & Drop State */
          <div
            id="upload-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full min-h-[320px] sm:min-h-[360px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 sm:p-8 transition-all duration-300 cursor-pointer relative overflow-hidden bg-[#131620]/60 backdrop-blur-md ${
              isDragOver
                ? 'border-[#60A5FA] bg-[#2563EB]/10'
                : 'border-[#333D55] hover:border-[#60A5FA]/60 hover:bg-[#131620]'
            }`}
          >
            {/* Ambient inner glow */}
            <div className="w-20 h-20 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <span className="material-symbols-outlined text-[36px] text-[#60A5FA]">
                cloud_upload
              </span>
            </div>

            <h3 className="font-display text-lg font-bold text-white mb-1">
              Drop your photo here
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] mb-6 text-center">
              or browse from your device
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs z-10">
              <button
                type="button"
                id="btn-upload-photo"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex-1 py-3 px-5 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:from-[#4338CA] hover:to-[#1D4ED8] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">photo_library</span>
                <span>Browse Files</span>
              </button>
              <button
                type="button"
                id="btn-take-photo"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="flex-1 py-3 px-5 rounded-full font-semibold text-xs sm:text-sm text-white bg-[#1E2230] border border-white/10 hover:bg-[#282E42] flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                <span>Take Photo</span>
              </button>
            </div>
          </div>
        ) : (
          /* Uploaded Photo Preview State */
          <div className="w-full rounded-3xl overflow-hidden bg-[#131620] border border-white/10 relative shadow-2xl">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black/50 overflow-hidden flex items-center justify-center">
              <img
                src={uploadedImage}
                alt="Uploaded Car Preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 right-4">
                <button
                  id="btn-delete-upload"
                  onClick={() => setUploadedImage(null)}
                  className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white font-medium">Ready for AI Analysis</span>
              </div>
            </div>

            {/* Analyze CTA */}
            <div className="p-5 border-t border-white/5 flex justify-end">
              <button
                id="btn-analyze-vehicle"
                onClick={() => onContinueToAnalysis(selectedPreset, uploadedImage)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#38BDF8] hover:brightness-110 transition-all shadow-[0_0_25px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2 active:scale-95 text-sm cursor-pointer border border-white/20"
              >
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                <span>Analyze Vehicle</span>
              </button>
            </div>
          </div>
        )}

        {/* PHOTO GUIDELINES Section */}
        <div className="w-full bg-[#131620]/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
          <h4 className="font-label-caps text-xs tracking-wider text-[#94A3B8] font-bold mb-3.5">
            PHOTO GUIDELINES
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#E2E8F0]">
              <span className="material-symbols-outlined text-green-400 text-[18px]">
                check_circle
              </span>
              <span>Front 3/4 angle works best</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#E2E8F0]">
              <span className="material-symbols-outlined text-green-400 text-[18px]">
                check_circle
              </span>
              <span>Good lighting, no harsh shadows</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#E2E8F0]">
              <span className="material-symbols-outlined text-green-400 text-[18px]">
                check_circle
              </span>
              <span>Full car visible in frame</span>
            </div>
          </div>
        </div>

        {/* Sample Cars Quick Selector */}
        <div className="w-full flex flex-col gap-3">
          <p className="text-xs font-semibold text-[#94A3B8]">Or try a sample car:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CAR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  handleSelectDefaultDemo(preset);
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedPreset.id === preset.id && uploadedImage === preset.stockImage
                    ? 'bg-[#2563EB]/15 border-[#60A5FA]'
                    : 'bg-[#131620]/60 border-white/5 hover:border-white/20'
                }`}
              >
                <img
                  src={preset.stockImage}
                  alt={preset.name}
                  className="w-12 h-10 rounded-xl object-cover bg-black"
                />
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{preset.name}</p>
                  <p className="text-[11px] text-[#94A3B8]">{preset.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
