import React from 'react';

interface AutoMorphLogoProps {
  variant?: 'full' | 'header' | 'icon' | 'hero';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtext?: boolean;
}

export const AutoMorphLogo: React.FC<AutoMorphLogoProps> = ({
  variant = 'header',
  className = '',
  size = 'md',
  showSubtext = true,
}) => {
  // SVG Emblem component with exact visual elements from the official brand logo:
  // - Metallic brushed chrome stylized 'A'
  // - Inner 3D faceted 'M' monogram
  // - Speedometer gauge halo in neon purple/blue
  // - Supercar silhouette with ice-blue LED light signature
  // - Magenta/purple pixelated speed trail fragments
  const EmblemIcon = ({ iconSize = 40 }: { iconSize?: number }) => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
    >
      <defs>
        {/* Metallic chrome linear gradients */}
        <linearGradient id="chrome-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#CBD5E1" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="75%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        <linearGradient id="chrome-grad-dark" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="45%" stopColor="#64748B" />
          <stop offset="70%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>

        <linearGradient id="neon-purple-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        <linearGradient id="purple-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>

        {/* Outer Glow filter */}
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Speedometer Halo Ring */}
      <circle
        cx="100"
        cy="95"
        r="75"
        stroke="url(#neon-purple-blue)"
        strokeWidth="3"
        strokeDasharray="4 6"
        opacity="0.85"
      />
      <path
        d="M 40 130 A 75 75 0 1 1 165 125"
        stroke="url(#neon-purple-blue)"
        strokeWidth="4"
        fill="none"
        filter="url(#neon-glow)"
      />

      {/* Speedometer tick marks */}
      <line x1="100" y1="20" x2="100" y2="28" stroke="#A855F7" strokeWidth="2" />
      <line x1="60" y1="35" x2="65" y2="42" stroke="#818CF8" strokeWidth="1.5" />
      <line x1="140" y1="35" x2="135" y2="42" stroke="#60A5FA" strokeWidth="1.5" />
      <line x1="30" y1="75" x2="38" y2="78" stroke="#C084FC" strokeWidth="1.5" />
      <line x1="170" y1="75" x2="162" y2="78" stroke="#38BDF8" strokeWidth="1.5" />

      {/* Hypercar Silhouette on Right Side */}
      <path
        d="M105 70 C125 70, 142 75, 155 86 C168 97, 172 110, 170 120 C168 123, 140 124, 130 124 C120 124, 110 122, 105 120 Z"
        fill="#090B10"
        stroke="url(#chrome-grad-1)"
        strokeWidth="1.5"
        opacity="0.95"
      />
      {/* Car Roof & Window line */}
      <path
        d="M115 70 C130 71, 146 76, 154 84 C145 84, 130 83, 120 83 Z"
        fill="#1E293B"
        stroke="#60A5FA"
        strokeWidth="1"
        opacity="0.8"
      />
      {/* Ice-Blue LED Headlight Signature */}
      <path
        d="M152 98 C160 97, 166 99, 168 104 C163 103, 155 102, 150 102 Z"
        fill="#38BDF8"
        filter="url(#neon-glow)"
      />
      <path
        d="M148 104 C158 103, 164 106, 166 110 C160 109, 152 108, 146 108 Z"
        fill="#60A5FA"
      />

      {/* Magenta & Violet Pixelated Speed Trails (Left) */}
      <rect x="25" y="96" width="7" height="7" fill="#C084FC" opacity="0.9" />
      <rect x="35" y="92" width="8" height="8" fill="#A855F7" opacity="0.95" />
      <rect x="46" y="86" width="9" height="9" fill="#818CF8" />
      <rect x="30" y="108" width="6" height="6" fill="#A855F7" opacity="0.7" />
      <rect x="40" y="104" width="7" height="7" fill="#6366F1" opacity="0.85" />
      <rect x="52" y="78" width="8" height="8" fill="#C084FC" />
      <rect x="62" y="70" width="9" height="9" fill="#A855F7" />
      <rect x="74" y="60" width="8" height="8" fill="#818CF8" />

      {/* Main Metallic Stylized 'A' Frame */}
      {/* Left leg of A */}
      <path
        d="M98 32 L40 148 L65 148 L100 75 L110 95 L125 80 Z"
        fill="url(#chrome-grad-1)"
        stroke="#475569"
        strokeWidth="1"
      />
      {/* Right leg of A */}
      <path
        d="M102 32 L160 148 L135 148 L100 75 L90 95 L75 80 Z"
        fill="url(#chrome-grad-dark)"
        stroke="#1E293B"
        strokeWidth="1"
      />

      {/* Center Beveled Faceted 'M' Monogram (Sharp 3D Metallic Chevron) */}
      <path
        d="M75 125 L100 85 L125 125 L100 108 Z"
        fill="url(#chrome-grad-1)"
        stroke="#FFFFFF"
        strokeWidth="1"
      />
      <path
        d="M75 125 L100 108 L100 138 Z"
        fill="url(#chrome-grad-dark)"
      />
      <path
        d="M125 125 L100 108 L100 138 Z"
        fill="url(#chrome-grad-1)"
      />

      {/* Specular Chrome Highlights */}
      <path
        d="M98 32 L102 32 L60 144 L56 144 Z"
        fill="#FFFFFF"
        opacity="0.7"
      />
      <path
        d="M98 32 L128 85 L124 88 L98 36 Z"
        fill="#FFFFFF"
        opacity="0.6"
      />
      {/* Neon Edge Sheen */}
      <path
        d="M100 32 L160 148"
        stroke="#A855F7"
        strokeWidth="2.5"
        filter="url(#neon-glow)"
        opacity="0.9"
      />
    </svg>
  );

  if (variant === 'icon') {
    const iconDimension =
      size === 'sm' ? 32 : size === 'lg' ? 64 : size === 'xl' ? 96 : 44;
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <EmblemIcon iconSize={iconDimension} />
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <EmblemIcon iconSize={38} />
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span className="font-display font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
              AUTO
            </span>
            <span className="font-display font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#818CF8] to-[#C084FC] drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]">
              M
            </span>
            <span className="font-display font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400">
              ORPH
            </span>
            <span className="font-display font-black text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] to-[#C084FC] ml-0.5 drop-shadow-[0_0_10px_rgba(129,140,248,0.7)]">
              Ai
            </span>
            <span className="text-[9px] font-mono text-[#A855F7] ml-1 font-bold">TM</span>
          </div>
          {showSubtext && (
            <span className="text-[8.5px] font-mono text-[#94A3B8] tracking-[0.18em] -mt-1 uppercase">
              Visualize • Customize • Drive
            </span>
          )}
        </div>
      </div>
    );
  }

  // Hero & Full Brand Identity Lockup
  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      <div className="relative mb-3 flex items-center justify-center">
        {/* Ambient Neon Atmosphere behind emblem */}
        <div className="absolute w-40 h-40 bg-gradient-to-r from-[#8B5CF6]/30 via-[#3B82F6]/20 to-[#C084FC]/30 rounded-full blur-[40px] pointer-events-none" />
        <EmblemIcon
          iconSize={size === 'xl' ? 140 : size === 'lg' ? 110 : 80}
        />
      </div>

      {/* Main Stylized Wordmark: AUTOMorphAi */}
      <div className="flex items-baseline justify-center tracking-tight leading-none">
        <span className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_4px_15px_rgba(255,255,255,0.25)]">
          AUTO
        </span>
        <span className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#C084FC] via-[#A855F7] to-[#7C3AED] drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
          M
        </span>
        <span className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_4px_15px_rgba(255,255,255,0.25)]">
          ORPH
        </span>
        <span className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] via-[#A855F7] to-[#E879F9] ml-1 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
          Ai
        </span>
        <span className="text-xs font-mono text-[#A855F7] ml-1.5 font-bold self-start mt-1">
          TM
        </span>
      </div>

      {/* Brand Subtitle Bar */}
      <div className="flex items-center gap-3 mt-2 mb-2 text-[#94A3B8] font-mono text-xs sm:text-sm tracking-[0.25em] uppercase">
        <span className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#8B5CF6]" />
        <span>Visualize</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] shadow-[0_0_6px_#A855F7]" />
        <span>Customize</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_6px_#38BDF8]" />
        <span>Drive</span>
        <span className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#38BDF8]" />
      </div>

      {/* Official Tagline */}
      <p className="text-xs sm:text-sm font-mono tracking-[0.3em] text-[#E2E8F0] uppercase font-semibold mt-1">
        Your Car. Your Vision.
      </p>
    </div>
  );
};
