import React, { useState } from 'react';
import { AutoMorphLogo } from './AutoMorphLogo';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'studio'>('pro');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div
      id="upgrade-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0F121C] border border-white/10 rounded-[28px] p-6 md:p-8 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 text-white hover:text-[#C084FC] flex items-center justify-center cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <AutoMorphLogo variant="icon" size="md" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
            Upgrade AutoMorphAi Access
          </h2>
          <p className="text-xs md:text-sm text-[#94A3B8]">
            Unlock limitless AI car visualization and photorealistic 4K neural rendering.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Pro */}
          <div
            onClick={() => setSelectedPlan('pro')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'pro'
                ? 'border-[#A855F7] bg-violet-600/15 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-display font-bold text-white">AutoMorph Pro</span>
              <span className="font-label-caps text-[10px] text-[#C084FC] bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30">
                POPULAR
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="font-display text-2xl font-bold text-white">$19</span>
              <span className="text-xs text-[#94A3B8]">/ month</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#CBD5E1]">
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#C084FC]">check</span>
                <span>Unlimited builds</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#C084FC]">check</span>
                <span>4K Master Renders</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#C084FC]">check</span>
                <span>Priority Veo 3.1 &amp; Gemini queue</span>
              </li>
            </ul>
          </div>

          {/* Studio */}
          <div
            onClick={() => setSelectedPlan('studio')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'studio'
                ? 'border-[#38BDF8] bg-sky-600/15 shadow-[0_0_25px_rgba(56,189,248,0.25)]'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-display font-bold text-white">Studio Elite</span>
              <span className="font-label-caps text-[10px] text-[#38BDF8] bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/30">
                COMMERCIAL
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="font-display text-2xl font-bold text-white">$49</span>
              <span className="text-xs text-[#94A3B8]">/ month</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#CBD5E1]">
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#38BDF8]">check</span>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#38BDF8]">check</span>
                <span>Custom CAD &amp; Mesh uploads</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#38BDF8]">check</span>
                <span>Commercial licenses</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <button
          id="btn-confirm-upgrade"
          onClick={handleUpgrade}
          disabled={isProcessing}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#38BDF8] hover:brightness-110 text-white font-bold font-body text-sm transition-all shadow-[0_0_25px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer border border-white/20"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg">sync</span>
              <span>Activating Pro Tier...</span>
            </>
          ) : (
            <>
              <span>Upgrade to {selectedPlan === 'pro' ? 'AutoMorph Pro' : 'Studio Elite'}</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
