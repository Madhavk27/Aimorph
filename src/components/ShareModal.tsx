import React, { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildTitle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, buildTitle }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const shareUrl = window.location.href;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="share-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#1c1b1b] border border-white/10 rounded-[24px] p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#007BFF]">ios_share</span>
            <h3 className="font-display text-lg font-bold text-white">Share Your Build</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#201F1F] text-white hover:text-[#adc7ff] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <p className="text-sm text-[#c1c6d7] mb-6">
          Showcase <span className="text-white font-medium">"{buildTitle}"</span> with friends or the
          car enthusiast community.
        </p>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 bg-[#131313] border border-white/10 rounded-xl p-2 mb-6">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent text-xs text-[#c1c6d7] flex-1 px-2 focus:outline-none truncate"
          />
          <button
            onClick={handleCopyLink}
            className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-4 py-2 rounded-lg font-label-caps text-xs font-bold transition-all shrink-0 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => {
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my custom car build on AutoMorphAi!`)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
            }}
            className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all text-xs font-medium text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#C084FC]">tag</span>
            <span>X / Twitter</span>
          </button>

          <button
            onClick={() => {
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my custom car build on AutoMorphAi: ${shareUrl}`)}`, '_blank');
            }}
            className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all text-xs font-medium text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#34D399]">chat</span>
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all text-xs font-medium text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#38BDF8]">link</span>
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
