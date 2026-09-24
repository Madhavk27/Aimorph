import React from 'react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const isVisualizerActive = [
    'upload',
    'analysis',
    'customize',
    'synthesis',
    'result',
  ].includes(currentScreen);

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-[#0F121C]/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl flex justify-around items-center h-20 px-2 transition-all duration-300"
    >
      {/* Home */}
      <button
        id="bottom-nav-home"
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-95 py-1.5 px-3 rounded-2xl cursor-pointer ${
          currentScreen === 'home'
            ? 'text-[#C084FC] bg-violet-600/20 shadow-[0_0_12px_rgba(168,85,247,0.3)] border border-violet-500/30'
            : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] mb-0.5"
          style={{ fontVariationSettings: currentScreen === 'home' ? "'FILL' 1" : "'FILL' 0" }}
        >
          home
        </span>
        <span className="text-[10px] font-bold">Home</span>
      </button>

      {/* Studio / Visualizer */}
      <button
        id="bottom-nav-visualizer"
        onClick={() => onNavigate('upload')}
        className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-95 py-1.5 px-3 rounded-2xl cursor-pointer ${
          isVisualizerActive
            ? 'text-[#C084FC] bg-violet-600/20 shadow-[0_0_12px_rgba(168,85,247,0.3)] border border-violet-500/30'
            : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] mb-0.5"
          style={{ fontVariationSettings: isVisualizerActive ? "'FILL' 1" : "'FILL' 0" }}
        >
          auto_fix_high
        </span>
        <span className="text-[10px] font-bold">Studio</span>
      </button>

      {/* Gemini AI Tuner Chat */}
      <button
        id="bottom-nav-ai-chat"
        onClick={() => onNavigate('ai-chat')}
        className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-95 py-1.5 px-3 rounded-2xl cursor-pointer ${
          currentScreen === 'ai-chat'
            ? 'text-[#A855F7] bg-violet-600/20 shadow-[0_0_12px_rgba(168,85,247,0.3)] border border-violet-500/30'
            : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] mb-0.5"
          style={{ fontVariationSettings: currentScreen === 'ai-chat' ? "'FILL' 1" : "'FILL' 0" }}
        >
          smart_toy
        </span>
        <span className="text-[10px] font-bold">AI Tuner</span>
      </button>

      {/* Live Voice */}
      <button
        id="bottom-nav-live-voice"
        onClick={() => onNavigate('live-voice')}
        className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-95 py-1.5 px-3 rounded-2xl cursor-pointer ${
          currentScreen === 'live-voice'
            ? 'text-[#38BDF8] bg-sky-600/20 shadow-[0_0_12px_rgba(56,189,248,0.3)] border border-sky-500/30'
            : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] mb-0.5"
          style={{ fontVariationSettings: currentScreen === 'live-voice' ? "'FILL' 1" : "'FILL' 0" }}
        >
          mic
        </span>
        <span className="text-[10px] font-bold">Live Voice</span>
      </button>

      {/* Garage / Profile */}
      <button
        id="bottom-nav-profile"
        onClick={() => onNavigate('profile')}
        className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-95 py-1.5 px-3 rounded-2xl cursor-pointer ${
          ['profile', 'my-builds'].includes(currentScreen)
            ? 'text-[#C084FC] bg-violet-600/20 shadow-[0_0_12px_rgba(168,85,247,0.3)] border border-violet-500/30'
            : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] mb-0.5"
          style={{
            fontVariationSettings: ['profile', 'my-builds'].includes(currentScreen)
              ? "'FILL' 1"
              : "'FILL' 0",
          }}
        >
          directions_car
        </span>
        <span className="text-[10px] font-bold">Garage</span>
      </button>
    </nav>
  );
};
