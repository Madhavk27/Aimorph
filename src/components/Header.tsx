import React from 'react';
import { ScreenType, UserProfile } from '../types';
import { AutoMorphLogo } from './AutoMorphLogo';

interface HeaderProps {
  currentScreen: ScreenType;
  userProfile?: UserProfile | null;
  onNavigate: (screen: ScreenType) => void;
  onVisualizeClick?: () => void;
  onCloseClick?: () => void;
  onCancelScan?: () => void;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
  onOpenMorph?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  userProfile,
  onNavigate,
  onVisualizeClick,
  onCloseClick,
  onCancelScan,
  onGoogleSignIn,
  onSignOut,
  onOpenMorph,
}) => {
  const isVisualizerActive = [
    'upload',
    'analysis',
    'customize',
    'synthesis',
    'result',
  ].includes(currentScreen);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0B0D14]/90 backdrop-blur-2xl border-b border-white/10 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 w-full max-w-7xl mx-auto">
        {/* Brand Anchor with Official AutoMorphAi Logo */}
        <button
          id="header-brand-logo"
          onClick={() => onNavigate('home')}
          className="flex items-center text-left group focus:outline-none cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
        >
          <AutoMorphLogo variant="header" showSubtext={true} />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          <button
            onClick={() => onNavigate('upload')}
            className={`text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              isVisualizerActive
                ? 'text-[#C084FC] font-bold drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">auto_fix_high</span>
            <span>Studio</span>
          </button>
          <button
            onClick={() => onNavigate('explore')}
            className={`text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              currentScreen === 'explore'
                ? 'text-[#C084FC] font-bold drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">explore</span>
            <span>Explore</span>
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              currentScreen === 'profile'
                ? 'text-[#C084FC] font-bold drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">directions_car</span>
            <span>Garage</span>
          </button>
          <button
            onClick={() => onNavigate('search-intel')}
            className={`text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              currentScreen === 'search-intel'
                ? 'text-[#38BDF8] font-bold drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#38BDF8]">travel_explore</span>
            <span>Parts Intel</span>
          </button>
          <button
            onClick={() => onNavigate('veo-studio')}
            className={`text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              currentScreen === 'veo-studio'
                ? 'text-[#E879F9] font-bold drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#E879F9]">movie</span>
            <span>Veo 3.1</span>
          </button>
        </nav>

        {/* Right Actions Bar */}
        <div className="flex items-center gap-3">
          {/* MORPH AI Assistant Quick Button */}
          <button
            id="header-morph-btn"
            onClick={onOpenMorph || (() => onNavigate('ai-chat'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-950/80 to-indigo-950/80 border border-violet-500/40 text-xs font-black text-white hover:border-[#C084FC] hover:shadow-[0_0_15px_rgba(192,132,252,0.5)] transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.2)] active:scale-95"
            title="Open MORPH Automotive Design Assistant"
          >
            <span className="text-[#C084FC] font-black text-xs">✦</span>
            <span className="bg-gradient-to-r from-white to-[#E9D5FF] bg-clip-text text-transparent">MORPH</span>
          </button>

          {/* User Auth */}
          {userProfile?.email ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1 rounded-full bg-white/5 hover:bg-white/10 border border-violet-500/30 hover:border-violet-500/60 transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                title="View Profile"
              >
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#A855F7]"
                />
                <span className="hidden sm:inline text-xs font-bold text-white pr-2">
                  {userProfile.name.split(' ')[0]}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#A855F7]/50"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.4 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Sign In</span>
            </button>
          )}

          {/* Visualize CTA */}
          {currentScreen === 'upload' ? (
            <button
              onClick={onCloseClick || (() => onNavigate('home'))}
              className="text-xs text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white/5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span className="hidden sm:inline">Close</span>
            </button>
          ) : (
            <button
              onClick={onVisualizeClick || (() => onNavigate('upload'))}
              className="text-white hover:brightness-110 transition-all text-xs font-bold flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#38BDF8] shadow-[0_0_20px_rgba(139,92,246,0.5)] active:scale-95 cursor-pointer border border-white/20"
            >
              <span>Visualize Now</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
