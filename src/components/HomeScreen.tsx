import React from 'react';
import { ScreenType } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSelectPresetBuild: (buildId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onSelectPresetBuild,
}) => {
  return (
    <div className="w-full flex flex-col items-center bg-[#07090E] min-h-screen text-slate-100">
      {/* 1. HERO SECTION (2-Column Studio Layout matching Screenshot) */}
      <section
        id="hero-section"
        className="relative w-full overflow-hidden pt-20 md:pt-24 pb-8 px-4 sm:px-6 md:px-10 lg:px-12 max-w-7xl mx-auto"
      >
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-[#7C3AED]/20 via-[#6366F1]/15 to-[#38BDF8]/15 rounded-full blur-[130px] pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-5 flex flex-col items-start text-left z-10">
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121520] border border-white/10 text-white text-xs font-mono font-medium tracking-wider mb-5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse shadow-[0_0_8px_#A855F7]" />
              <span className="text-slate-300">AI AUTOMOTIVE DESIGN STUDIO</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[54px] leading-[1.06] tracking-tight text-white mb-4">
              YOUR CAR.
              <br />
              <span className="bg-gradient-to-r from-[#A855F7] via-[#818CF8] to-[#38BDF8] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]">
                YOUR VISION.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="font-body text-[#94A3B8] text-sm sm:text-base leading-relaxed max-w-md mb-7">
              AI-powered visualization that lets you preview, customize and perfect your dream build before you build it.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto mb-8">
              <button
                id="hero-cta-studio"
                onClick={() => onNavigate('upload')}
                className="px-7 py-3.5 rounded-full font-bold text-white text-sm bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#38BDF8] hover:brightness-110 transition-all duration-300 shadow-[0_0_25px_rgba(139,92,246,0.45)] flex items-center justify-center gap-2 active:scale-95 cursor-pointer border border-white/20"
              >
                <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                <span>Launch Studio</span>
              </button>

              <button
                id="hero-cta-explore"
                onClick={() => onNavigate('explore')}
                className="px-6 py-3.5 rounded-full font-semibold text-[#E2E8F0] text-sm bg-[#121520] border border-white/10 hover:bg-[#1A1E2E] hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                <span>Explore Builds</span>
              </button>
            </div>

            {/* Social Proof Badges */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5 w-full max-w-md">
              <span className="text-[11px] font-semibold text-[#64748B] tracking-wider font-mono uppercase">
                TRUSTED BY 25K+ CAR ENTHUSIASTS
              </span>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#07090E] object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="User 1"
                  />
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#07090E] object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="User 2"
                  />
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#07090E] object-cover"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="User 3"
                  />
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#07090E] object-cover"
                    src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="User 4"
                  />
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#07090E] object-cover"
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="User 5"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#FBBF24]">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-[15px] leading-none"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-white font-bold text-xs">4.9/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Cinematic Car Visual Studio */}
          <div className="lg:col-span-7 relative flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] rounded-3xl overflow-hidden border border-white/10 bg-[#0A0C12] shadow-[0_20px_60px_rgba(0,0,0,0.9)] group">
              {/* Left Vertical Neon Tube */}
              <div className="absolute top-6 bottom-6 left-6 w-1.5 bg-[#A855F7] rounded-full shadow-[0_0_20px_#A855F7,0_0_40px_#A855F7] opacity-90 z-20" />
              {/* Right Vertical Neon Tube */}
              <div className="absolute top-6 bottom-6 right-6 w-1.5 bg-[#818CF8] rounded-full shadow-[0_0_20px_#818CF8,0_0_40px_#818CF8] opacity-90 z-20" />

              {/* Wet Studio Floor Reflection Glow */}
              <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-[#7C3AED]/20 via-[#6366F1]/10 to-transparent z-10 pointer-events-none" />

              {/* Hero Car Visual (Black Coupe with Aggressive Styling) */}
              <img
                src="https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1600&q=85"
                alt="Automotive AI Studio Visualization"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-105"
              />

              {/* Overlay Studio Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E]/90 via-transparent to-black/25 pointer-events-none" />

              {/* License Plate Badge on Car */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md px-3.5 py-1 rounded-md border border-white/20 flex items-center gap-1.5 shadow-2xl z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping" />
                <span className="font-mono text-[11px] font-bold tracking-widest text-white">
                  AUTOMORPH AI
                </span>
              </div>
            </div>

            {/* Floating Stats Bar Anchored Right Across Bottom of Hero */}
            <div className="w-full mt-4 bg-[#121520]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
              {/* Stat 1 */}
              <div className="flex items-center gap-3 p-1.5 justify-center sm:justify-start">
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-[#C084FC] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-display font-extrabold text-lg leading-tight">25K+</span>
                  <span className="text-[11px] text-[#94A3B8]">Builds Visualized</span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-3 p-1.5 pt-3 md:pt-1.5 justify-center sm:justify-start md:pl-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[#818CF8] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-display font-extrabold text-lg leading-tight">150K+</span>
                  <span className="text-[11px] text-[#94A3B8]">Mod Combinations</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-3 p-1.5 pt-3 md:pt-1.5 justify-center sm:justify-start md:pl-4">
                <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">award_star</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-display font-extrabold text-lg leading-tight">98%</span>
                  <span className="text-[11px] text-[#94A3B8]">Satisfaction Rate</span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="flex items-center gap-3 p-1.5 pt-3 md:pt-1.5 justify-center sm:justify-start md:pl-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-[#34D399] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">timer</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-display font-extrabold text-lg leading-tight">10s</span>
                  <span className="text-[11px] text-[#94A3B8]">Avg. Render Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURE CARDS & HOW IT WORKS (Matches Screenshot Grid) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12 mb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 4 Studio Feature Cards (Left 7 cols on Desktop) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: AI Tuner Chat */}
            <button
              onClick={() => onNavigate('ai-chat')}
              className="p-4 rounded-2xl bg-[#121520] border border-white/10 hover:border-violet-500/50 transition-all text-left group shadow-lg cursor-pointer hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-[#C084FC] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-violet-500/30">
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </div>
                <h4 className="font-display font-bold text-white text-sm mb-1 group-hover:text-[#C084FC] transition-colors">
                  AI Tuner Chat
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-3">
                  Multi-turn advisor for dyno, turbo, aero &amp; builds.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#C084FC] font-semibold mt-3">
                <span>Chat Now</span>
                <span className="material-symbols-outlined text-[13px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>

            {/* Card 2: Live Voice Comms */}
            <button
              onClick={() => onNavigate('live-voice')}
              className="p-4 rounded-2xl bg-[#121520] border border-white/10 hover:border-sky-500/50 transition-all text-left group shadow-lg cursor-pointer hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-sky-600/20 text-[#38BDF8] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-sky-500/30">
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                </div>
                <h4 className="font-display font-bold text-white text-sm mb-1 group-hover:text-[#38BDF8] transition-colors">
                  Live Voice Comms
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-3">
                  Hands-free pit crew audio, real-time diagnostics &amp; support.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#38BDF8] font-semibold mt-3">
                <span>Connect</span>
                <span className="material-symbols-outlined text-[13px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>

            {/* Card 3: Parts Intel Search */}
            <button
              onClick={() => onNavigate('search-intel')}
              className="p-4 rounded-2xl bg-[#121520] border border-white/10 hover:border-emerald-500/50 transition-all text-left group shadow-lg cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-[#34D399] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-emerald-500/30">
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </div>
                <h4 className="font-display font-bold text-white text-sm mb-1 group-hover:text-[#34D399] transition-colors">
                  Parts Intel Search
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-3">
                  Real prices, part numbers &amp; fitment from trusted sources.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#34D399] font-semibold mt-3">
                <span>Search Parts</span>
                <span className="material-symbols-outlined text-[13px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>

            {/* Card 4: Veo 3.1 Video */}
            <button
              onClick={() => onNavigate('veo-studio')}
              className="p-4 rounded-2xl bg-[#121520] border border-white/10 hover:border-fuchsia-500/50 transition-all text-left group shadow-lg cursor-pointer hover:shadow-[0_0_20px_rgba(232,121,249,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-fuchsia-600/20 text-[#F472B6] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-fuchsia-500/30">
                  <span className="material-symbols-outlined text-[18px]">movie</span>
                </div>
                <h4 className="font-display font-bold text-white text-sm mb-1 group-hover:text-[#F472B6] transition-colors">
                  Veo 3.1 Video
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-3">
                  Cinematic 4K shots &amp; motion videos of your dream build.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#F472B6] font-semibold mt-3">
                <span>Create Video</span>
                <span className="material-symbols-outlined text-[13px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>
          </div>

          {/* How It Works Container (Right 5 cols on Desktop) */}
          <div className="lg:col-span-5 bg-[#121520] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
              <h3 className="font-mono text-xs tracking-widest text-[#E2E8F0] font-bold uppercase">
                HOW IT WORKS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
              {/* Step 1 */}
              <div
                onClick={() => onNavigate('upload')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-[#C084FC] shrink-0">
                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                </div>
                <div className="min-w-0">
                  <h5 className="font-display font-bold text-white text-xs">1. Upload</h5>
                  <p className="text-[10px] text-[#94A3B8] truncate">Upload or select your car</p>
                </div>
              </div>

              {/* Step 2 */}
              <div
                onClick={() => onNavigate('customize')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-[#818CF8] shrink-0">
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                </div>
                <div className="min-w-0">
                  <h5 className="font-display font-bold text-white text-xs">2. Customize</h5>
                  <p className="text-[10px] text-[#94A3B8] truncate">Choose mods, style &amp; parts</p>
                </div>
              </div>

              {/* Step 3 */}
              <div
                onClick={() => onNavigate('upload')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-[#38BDF8] shrink-0">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                </div>
                <div className="min-w-0">
                  <h5 className="font-display font-bold text-white text-xs">3. Visualize</h5>
                  <p className="text-[10px] text-[#94A3B8] truncate">Get ultra-realistic preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRENDING BUILDS SECTION (Matches Screenshot Exactly) */}
      <section className="w-full py-8 px-4 sm:px-6 md:px-10 lg:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[#EF4444] material-symbols-outlined text-lg">local_fire_department</span>
            <h2 className="font-display text-sm sm:text-base font-bold text-white tracking-wider uppercase font-mono">
              TRENDING BUILDS
            </h2>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-white font-medium transition-colors cursor-pointer"
          >
            <span>View All Builds</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* 5-Card Responsive Row with Arrow Navigation */}
        <div className="relative group/carousel">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1: Stealth G63 */}
            <div
              onClick={() => onSelectPresetBuild('build-stealth-g63')}
              className="rounded-2xl overflow-hidden bg-[#121520] border border-white/10 hover:border-violet-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
            >
              <div className="h-40 overflow-hidden relative bg-black">
                <img
                  src="https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=85"
                  alt="Stealth G63 - Mercedes-AMG G63"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono font-bold text-white border border-white/15">
                  STEALTH
                </div>
              </div>
              <div className="p-3.5">
                <h4 className="font-display font-bold text-white text-sm mb-0.5 group-hover:text-[#C084FC] transition-colors truncate">
                  Stealth G63
                </h4>
                <div className="flex justify-between items-center text-xs text-[#94A3B8]">
                  <span className="truncate text-[11px]">Mercedes-AMG G63</span>
                  <span className="flex items-center gap-1 text-slate-300 text-[11px] shrink-0">
                    <span className="material-symbols-outlined text-[13px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                    <span>2.3K</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Midnight 911 Turbo S */}
            <div
              onClick={() => onSelectPresetBuild('build-midnight-911')}
              className="rounded-2xl overflow-hidden bg-[#121520] border border-white/10 hover:border-sky-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
            >
              <div className="h-40 overflow-hidden relative bg-black">
                <img
                  src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=85"
                  alt="Midnight 911 Turbo S - Porsche 911 Turbo S"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-sky-950/90 text-[#38BDF8] backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-sky-500/30">
                  SPORT
                </div>
              </div>
              <div className="p-3.5">
                <h4 className="font-display font-bold text-white text-sm mb-0.5 group-hover:text-[#38BDF8] transition-colors truncate">
                  Midnight 911 Turbo S
                </h4>
                <div className="flex justify-between items-center text-xs text-[#94A3B8]">
                  <span className="truncate text-[11px]">Porsche 911 Turbo S</span>
                  <span className="flex items-center gap-1 text-slate-300 text-[11px] shrink-0">
                    <span className="material-symbols-outlined text-[13px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                    <span>2.1K</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Urban Range Rover */}
            <div
              onClick={() => onSelectPresetBuild('build-range-rover-urban')}
              className="rounded-2xl overflow-hidden bg-[#121520] border border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
            >
              <div className="h-40 overflow-hidden relative bg-black">
                <img
                  src="https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=85"
                  alt="Urban Range Rover - Range Rover Sport"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-emerald-950/90 text-[#34D399] backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-emerald-500/30">
                  URBAN
                </div>
              </div>
              <div className="p-3.5">
                <h4 className="font-display font-bold text-white text-sm mb-0.5 group-hover:text-[#34D399] transition-colors truncate">
                  Urban Range Rover
                </h4>
                <div className="flex justify-between items-center text-xs text-[#94A3B8]">
                  <span className="truncate text-[11px]">Range Rover Sport</span>
                  <span className="flex items-center gap-1 text-slate-300 text-[11px] shrink-0">
                    <span className="material-symbols-outlined text-[13px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                    <span>1.8K</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Overland Beast */}
            <div
              onClick={() => onSelectPresetBuild('build-overland-beast')}
              className="rounded-2xl overflow-hidden bg-[#121520] border border-white/10 hover:border-amber-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
            >
              <div className="h-40 overflow-hidden relative bg-black">
                <img
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85"
                  alt="Overland Beast - Toyota Land Cruiser"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-amber-950/90 text-[#FBBF24] backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-amber-500/30">
                  OFF-ROAD
                </div>
              </div>
              <div className="p-3.5">
                <h4 className="font-display font-bold text-white text-sm mb-0.5 group-hover:text-[#FBBF24] transition-colors truncate">
                  Overland Beast
                </h4>
                <div className="flex justify-between items-center text-xs text-[#94A3B8]">
                  <span className="truncate text-[11px]">Toyota Land Cruiser</span>
                  <span className="flex items-center gap-1 text-slate-300 text-[11px] shrink-0">
                    <span className="material-symbols-outlined text-[13px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                    <span>2.0K</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 5: Shadow Mustang GT */}
            <div
              onClick={() => onSelectPresetBuild('build-shadow-mustang')}
              className="rounded-2xl overflow-hidden bg-[#121520] border border-white/10 hover:border-violet-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
            >
              <div className="h-40 overflow-hidden relative bg-black">
                <img
                  src="https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=85"
                  alt="Shadow Mustang GT - Ford Mustang GT"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-purple-950/90 text-[#C084FC] backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-purple-500/30">
                  PERFORMANCE
                </div>
              </div>
              <div className="p-3.5">
                <h4 className="font-display font-bold text-white text-sm mb-0.5 group-hover:text-[#C084FC] transition-colors truncate">
                  Shadow Mustang GT
                </h4>
                <div className="flex justify-between items-center text-xs text-[#94A3B8]">
                  <span className="truncate text-[11px]">Ford Mustang GT</span>
                  <span className="flex items-center gap-1 text-slate-300 text-[11px] shrink-0">
                    <span className="material-symbols-outlined text-[13px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                    <span>2.7K</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Navigation Arrow Button */}
          <button
            onClick={() => onNavigate('explore')}
            className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#121520] border border-white/20 text-white items-center justify-center shadow-2xl hover:bg-white/10 hover:scale-110 transition-all cursor-pointer z-30"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      </section>
    </div>
  );
};
