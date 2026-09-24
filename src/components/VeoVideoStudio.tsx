import React, { useState, useEffect, useRef } from 'react';

interface VeoVideoStudioProps {
  onBack: () => void;
  carImage?: string;
  carName?: string;
}

const VIDEO_STYLES = [
  {
    id: 'rolling',
    title: 'Sunset Rolling Shot',
    prompt: 'Cinematic 4K rolling highway tracking shot during golden hour sunset, reflections glinting off widebody fender flares, spinning wheels with motion blur, camera tracking closely beside driver side.',
  },
  {
    id: 'track',
    title: 'Nürburgring Apex Attack',
    prompt: 'Aggressive track attack shot apexing a high-speed corner, tire smoke, carbon fiber wing vibrating with downforce, dramatic low-angle track camera.',
  },
  {
    id: 'studio-turntable',
    title: 'Dark Studio 360 Turntable',
    prompt: 'Rotating turntable in a dark sci-fi showroom with overhead strip LED lights reflecting over glossy paint, slow 360 orbit reveal.',
  },
  {
    id: 'neon-city',
    title: 'Cyberpunk Neon Cruising',
    prompt: 'Cruising through rain-soaked Tokyo streets at night, neon billboard reflections on wet asphalt and metallic clearcoat, glowing tail lights.',
  },
];

export const VeoVideoStudio: React.FC<VeoVideoStudioProps> = ({
  onBack,
  carImage,
  carName = 'Custom Vehicle',
}) => {
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState(
    `Cinematic 4K rolling tracking shot of ${carName} on a coastal highway at golden hour, sharp metallic paint highlights and motion blurred deep dish wheels.`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleGenerateVideo = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setProgressStage('Initializing Veo 3.1 neural video generation pipeline...');

    try {
      const res = await fetch('/api/gemini/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          baseImage: carImage || undefined,
          aspectRatio: aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start video generation');

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setIsGenerating(false);
        return;
      }

      if (data.operationName) {
        setProgressStage('Synthesizing high-frame-rate 3D motion & specular lighting...');

        // Start polling status
        const opName = data.operationName;
        let pollCount = 0;

        pollIntervalRef.current = setInterval(async () => {
          pollCount++;
          if (pollCount > 30) {
            clearInterval(pollIntervalRef.current);
            setIsGenerating(false);
            setError('Video generation timed out. Please try again.');
            return;
          }

          if (pollCount === 3) setProgressStage('Rendering temporal continuity & rolling physics...');
          if (pollCount === 6) setProgressStage('Applying photorealistic reflections & motion blur...');
          if (pollCount === 10) setProgressStage('Finalizing 4K MP4 stream encoding...');

          try {
            const statusRes = await fetch(
              `/api/gemini/video-status?operationName=${encodeURIComponent(opName)}`
            );
            const statusData = await statusRes.json();

            if (statusData.done) {
              clearInterval(pollIntervalRef.current);
              setIsGenerating(false);
              if (statusData.videoUri || statusData.downloadUrl) {
                setVideoUrl(statusData.downloadUrl || statusData.videoUri);
              } else if (statusData.error) {
                setError(statusData.error);
              }
            }
          } catch (e: any) {
            console.warn('Poll error:', e);
          }
        }, 5000);
      }
    } catch (err: any) {
      console.error('Video error:', err);
      setIsGenerating(false);
      setError(err.message || 'Veo video generation failed');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-36 flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1E2230] border border-white/10 flex items-center justify-center text-white hover:bg-[#282E42] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                Veo 3.1 AI Video Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/30 text-[10px] font-mono font-bold uppercase">
                veo-3.1-fast-generate-preview
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Animate vehicle builds into cinematic 4K rolling video clips
            </p>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Video Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div
            className={`w-full rounded-3xl bg-[#0F121C] border border-white/10 overflow-hidden relative shadow-2xl flex items-center justify-center ${
              aspectRatio === '9:16' ? 'aspect-[9/16] max-w-sm mx-auto' : 'aspect-video'
            }`}
          >
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : carImage && !isGenerating ? (
              <div className="relative w-full h-full">
                <img src={carImage} alt={carName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#2563EB]/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-3 shadow-xl">
                    <span className="material-symbols-outlined text-[32px]">movie</span>
                  </div>
                  <p className="text-white font-bold text-base">Ready to Animate</p>
                  <p className="text-xs text-[#94A3B8] max-w-xs mt-1">
                    Select a cinematic camera style or enter a custom motion prompt.
                  </p>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mb-4 shadow-[0_0_30px_rgba(139,92,246,0.5)]" />
                <p className="text-white font-bold text-base mb-1">Rendering Veo Motion Scene</p>
                <p className="text-xs text-[#C4B5FD] font-mono max-w-xs">{progressStage}</p>
              </div>
            ) : (
              <div className="text-center p-8 text-[#94A3B8]">
                <span className="material-symbols-outlined text-4xl mb-2">videocam</span>
                <p className="text-white font-bold text-sm">No source car selected</p>
              </div>
            )}
          </div>

          {videoUrl && (
            <div className="flex items-center gap-3 mt-4">
              <a
                href={videoUrl}
                download="automorph-veo-video.mp4"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download 4K Video</span>
              </a>
              <button
                onClick={() => setVideoUrl(null)}
                className="px-4 py-3 rounded-xl bg-[#1E2230] hover:bg-[#282E42] border border-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Regenerate
              </button>
            </div>
          )}
        </div>

        {/* Right Configuration Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Aspect Ratio Switcher */}
          <div className="bg-[#131620] border border-white/10 rounded-2xl p-4">
            <label className="text-[10px] font-mono text-[#94A3B8] uppercase block mb-2 font-bold">
              Video Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  aspectRatio === '16:9'
                    ? 'bg-[#2563EB] text-white shadow-md'
                    : 'bg-[#0F121C] text-[#94A3B8] border border-white/5 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">crop_16_9</span>
                <span>16:9 Landscape</span>
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  aspectRatio === '9:16'
                    ? 'bg-[#2563EB] text-white shadow-md'
                    : 'bg-[#0F121C] text-[#94A3B8] border border-white/5 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">crop_portrait</span>
                <span>9:16 Reels/TikTok</span>
              </button>
            </div>
          </div>

          {/* Preset Styles */}
          <div className="bg-[#131620] border border-white/10 rounded-2xl p-4">
            <label className="text-[10px] font-mono text-[#94A3B8] uppercase block mb-2 font-bold">
              Cinematic Camera Presets
            </label>
            <div className="space-y-2">
              {VIDEO_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setPrompt(style.prompt)}
                  disabled={isGenerating}
                  className="w-full p-2.5 rounded-xl bg-[#0F121C] hover:bg-[#1E2230] border border-white/5 text-left transition-colors cursor-pointer group"
                >
                  <p className="text-white text-xs font-bold group-hover:text-[#60A5FA]">
                    {style.title}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] line-clamp-1 mt-0.5">{style.prompt}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Box & CTA */}
          <div className="bg-[#131620] border border-white/10 rounded-2xl p-4">
            <label className="text-[10px] font-mono text-[#94A3B8] uppercase block mb-2 font-bold">
              Veo Motion Prompt
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="w-full p-3 rounded-xl bg-[#0F121C] border border-white/10 text-white text-xs placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] resize-none mb-3"
              placeholder="Describe camera movement, lighting, vehicle speed..."
            />

            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

            <button
              onClick={handleGenerateVideo}
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isGenerating ? 'sync' : 'auto_videocam'}
              </span>
              <span>{isGenerating ? 'Rendering Video...' : 'Generate Veo 3.1 Video'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
