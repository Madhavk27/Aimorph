import React, { useState, useEffect, useRef } from 'react';
import {
  CarPreset,
  CustomizationConfig,
  MorphOrbState,
  MorphMessage,
  MorphRecommendation,
} from '../types';
import {
  PAINT_COLORS,
  WHEEL_OPTIONS,
  AESTHETIC_OPTIONS,
} from '../data/mockData';

interface MorphAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedCar: CarPreset;
  customConfig: CustomizationConfig;
  onUpdateConfig: (newConfig: CustomizationConfig) => void;
  onMorphBuild: (configToMorph?: CustomizationConfig) => void;
  onNavigateToStudio?: () => void;
  externalOrbState?: MorphOrbState;
}

export const MorphAssistant: React.FC<MorphAssistantProps> = ({
  isOpen,
  onToggle,
  selectedCar,
  customConfig,
  onUpdateConfig,
  onMorphBuild,
  onNavigateToStudio,
  externalOrbState = 'idle',
}) => {
  const [orbState, setOrbState] = useState<MorphOrbState>(externalOrbState);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState<MorphMessage[]>([
    {
      id: 'welcome',
      role: 'morph',
      text: `Hey. I’m **MORPH**, your AI automotive design assistant.\n\n*“Imagine it. I’ll morph it.”*\n\nWe’re currently working with your **${selectedCar.name}**. What are we building today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      buildDna: `${selectedCar.name} • ${customConfig.paint.name} • ${customConfig.wheels.name.split(' ')[0]} • ${customConfig.aesthetic.name} Package`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync external state changes
  useEffect(() => {
    if (externalOrbState !== 'idle') {
      setOrbState(externalOrbState);
    }
  }, [externalOrbState]);

  // Voice synthesis helper
  const speakMorphVoice = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      // Clean markdown stars/formatting for clean spoken audio
      const cleanText = text
        .replace(/[*_#`~]/g, '')
        .replace(/•/g, ',')
        .replace(/✦/g, '')
        .replace(/🔥|🖤|⚡|🏔️|🎨|🛞|💎/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = 0.92; // Medium-low pitch
      utterance.rate = 1.02; // Confident, natural tempo

      // Pick natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Neural') ||
            v.name.includes('Google') ||
            v.name.includes('Daniel') ||
            v.name.includes('Alex'))
      );
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis notice:', e);
    }
  };

  // Web Speech API for voice mic input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        if (spokenText) {
          handleSendQuery(spokenText);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setOrbState('idle');
      };

      recognition.onerror = () => {
        setIsListening(false);
        setOrbState('idle');
      };

      recognitionRef.current = recognition;
    }
  }, [selectedCar, customConfig]);

  const toggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      setOrbState('idle');
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setOrbState('listening');
        } catch (e) {
          console.warn('Mic start notice:', e);
        }
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, orbState]);

  // Handle Natural Language Request to MORPH
  const handleSendQuery = async (queryText?: string) => {
    const prompt = (queryText || inputText).trim();
    if (!prompt) return;

    const userMessage: MorphMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setOrbState('thinking');

    try {
      const res = await fetch('/api/morph/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          carName: selectedCar.name,
          currentConfig: customConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'MORPH failed to analyze vision.');
      }

      const rec = data.recommendation;
      const reaction = data.reaction || 'That stance works. 🔥 Your preview is ready.';
      const voiceText = data.voiceText || reaction;

      // Match configs to actual database options
      const matchedPaint =
        PAINT_COLORS.find((p) => p.id === rec?.paintId || p.name.toLowerCase().includes(rec?.paintName?.toLowerCase())) ||
        PAINT_COLORS[1];

      const matchedWheels =
        WHEEL_OPTIONS.find((w) => w.id === rec?.wheelsId || w.name.toLowerCase().includes(rec?.wheelsName?.toLowerCase())) ||
        WHEEL_OPTIONS[1];

      const matchedAesthetic =
        AESTHETIC_OPTIONS.find((a) => a.id === rec?.aeroId || a.name.toLowerCase().includes(rec?.aeroPackage?.toLowerCase())) ||
        AESTHETIC_OPTIONS[1];

      const configUpdates: Partial<CustomizationConfig> = {
        paint: matchedPaint,
        wheels: matchedWheels,
        aesthetic: matchedAesthetic,
        suspensionLowering: rec?.stance || customConfig.suspensionLowering || '-25mm Lowered',
        customNotes: `MORPH Blueprint: ${rec?.packageStyle || 'Custom Spec'} with ${rec?.grilleAero || 'Black Accents'}`,
      };

      const morphRec: MorphRecommendation = {
        paintName: rec?.paintName || matchedPaint.name,
        paintHex: rec?.paintHex || matchedPaint.hex,
        paintId: matchedPaint.id,
        wheelsName: rec?.wheelsName || matchedWheels.name,
        wheelsSize: rec?.wheelsSize || matchedWheels.size,
        wheelsId: matchedWheels.id,
        aeroPackage: rec?.aeroPackage || matchedAesthetic.name,
        aeroId: matchedAesthetic.id,
        grilleAero: rec?.grilleAero || 'Gloss Black Aero Trim',
        stance: rec?.stance || 'Subtle Lowered Stance',
        packageStyle: rec?.packageStyle || 'Premium Street Package',
        buildDna: rec?.buildDna || `${selectedCar.name} • ${matchedPaint.name} • ${matchedWheels.name.split(' ')[0]} • ${matchedAesthetic.name}`,
        rationale: rec?.rationale || 'Engineered for optimal curb appeal and aggressive street posture.',
        reaction: reaction,
        configUpdates,
      };

      const morphMessage: MorphMessage = {
        id: `morph-${Date.now()}`,
        role: 'morph',
        text: reaction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendation: morphRec,
        buildDna: morphRec.buildDna,
        isActionable: true,
      };

      setMessages((prev) => [...prev, morphMessage]);
      setOrbState('completed');
      speakMorphVoice(voiceText);

      // Auto-revert completed state after 4 seconds to idle
      setTimeout(() => {
        setOrbState('idle');
      }, 4000);
    } catch (err: any) {
      console.warn('MORPH fallback handling:', err);
      // Confident fallback in character
      const fallbackRec: MorphRecommendation = {
        paintName: 'Obsidian Black',
        paintHex: '#0A0A0B',
        paintId: 'obsidian-black',
        wheelsName: '19" Sport Alloy Wheels',
        wheelsSize: '19 Inch',
        wheelsId: 'sport-19',
        aeroPackage: 'Sport',
        aeroId: 'sport',
        grilleAero: 'Gloss Black Honeycomb Grille',
        stance: 'Subtle Lowered Stance (-25mm)',
        packageStyle: 'Premium Street Package',
        buildDna: `${selectedCar.name} • Obsidian Black • 19” Sport • Sport Package`,
        rationale: 'Balanced aggressive posture with deep metallic finish.',
        reaction: 'That stance works. 🔥 Here is the recommended Build DNA.',
        configUpdates: {
          paint: PAINT_COLORS[1],
          wheels: WHEEL_OPTIONS[1],
          aesthetic: AESTHETIC_OPTIONS[1],
        },
      };

      const fallbackMsg: MorphMessage = {
        id: `morph-${Date.now()}`,
        role: 'morph',
        text: `That stance works. 🔥 Here is the recommended **Build DNA** for your **${selectedCar.name}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendation: fallbackRec,
        buildDna: fallbackRec.buildDna,
        isActionable: true,
      };

      setMessages((prev) => [...prev, fallbackMsg]);
      setOrbState('idle');
      speakMorphVoice('That stance works. Your preview is ready.');
    }
  };

  // Quick Action Buttons
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'colour':
        handleSendQuery(`Morph, show me the best bold paint finish for my ${selectedCar.name}.`);
        break;
      case 'wheels':
        handleSendQuery(`Morph, let's fix the stance. Pick a high-end forged wheel style for my ${selectedCar.name}.`);
        break;
      case 'sporty':
        handleSendQuery(`Morph, make my ${selectedCar.name} look more aggressive with lowered track stance and aero splitters.`);
        break;
      case 'blackout':
        handleSendQuery(`Morph, blackout everything on my ${selectedCar.name}. Total stealth shadowline treatment.`);
        break;
      case 'offroad':
        handleSendQuery(`Morph, make my ${selectedCar.name} rugged and trail-ready with lift kit, beadlock wheels, and armor.`);
        break;
      case 'luxury':
        handleSendQuery(`Morph, give my ${selectedCar.name} an executive VIP spec with chrome delete and turbine wheels.`);
        break;
    }
  };

  // Apply Blueprint to Studio
  const handleApplyToStudio = (rec: MorphRecommendation) => {
    const updated: CustomizationConfig = {
      ...customConfig,
      ...rec.configUpdates,
    };
    onUpdateConfig(updated);
    speakMorphVoice('Applied to Studio. Config updated.');

    setMessages((prev) => [
      ...prev,
      {
        id: `morph-applied-${Date.now()}`,
        role: 'morph',
        text: `✓ Applied **${rec.buildDna}** to your active Studio blueprint.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Generate Build (Morph Vision)
  const handleMorphNow = (rec: MorphRecommendation) => {
    const updated: CustomizationConfig = {
      ...customConfig,
      ...rec.configUpdates,
    };
    onUpdateConfig(updated);
    setOrbState('generating');
    speakMorphVoice('Morphing your build vision now.');
    onMorphBuild(updated);
  };

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* 1. Floating Glowing Purple/Blue AI Orb Button        */}
      {/* ---------------------------------------------------- */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-3">
        <button
          id="btn-morph-floating-orb"
          onClick={onToggle}
          aria-label="Open MORPH AI Assistant"
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0E111B]/95 border border-[#8B5CF6]/40 hover:border-[#C084FC] text-white shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:shadow-[0_0_35px_rgba(192,132,252,0.6)] backdrop-blur-xl transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {/* Animated Glowing Orb Core */}
          <div className="relative w-7 h-7 rounded-full flex items-center justify-center">
            {/* Outer pulse wave */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#8B5CF6] via-[#6366F1] to-[#38BDF8] blur-[3px] opacity-80 transition-all ${
                orbState === 'listening'
                  ? 'animate-ping scale-125'
                  : orbState === 'thinking'
                  ? 'animate-spin'
                  : orbState === 'generating'
                  ? 'animate-pulse scale-110'
                  : 'group-hover:scale-115'
              }`}
            />

            {/* Inner Core */}
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] flex items-center justify-center shadow-inner">
              {orbState === 'listening' && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
              )}
              {orbState === 'thinking' && (
                <span className="material-symbols-outlined text-[14px] text-white animate-spin">
                  progress_activity
                </span>
              )}
              {orbState === 'generating' && (
                <span className="material-symbols-outlined text-[14px] text-[#FDE047] animate-pulse">
                  auto_awesome
                </span>
              )}
              {orbState === 'completed' && (
                <span className="material-symbols-outlined text-[14px] text-emerald-300">
                  check
                </span>
              )}
              {orbState === 'idle' && (
                <span className="text-[12px] font-bold text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]">
                  ✦
                </span>
              )}
            </div>
          </div>

          {/* Orb Status Label */}
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wider bg-gradient-to-r from-white via-[#E9D5FF] to-[#A5B4FC] bg-clip-text text-transparent flex items-center gap-1">
              <span>✦ MORPH</span>
            </span>
            <span className="text-[10px] font-mono text-[#94A3B8] group-hover:text-[#C084FC] transition-colors leading-none">
              {orbState === 'listening'
                ? '◉ Listening…'
                : orbState === 'thinking'
                ? '◌ Thinking…'
                : orbState === 'generating'
                ? '✦ Morphing…'
                : orbState === 'completed'
                ? '✓ Build Ready'
                : 'Automotive AI'}
            </span>
          </div>

          {/* Notification Dot */}
          <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. Slide-Over Glassmorphic MORPH Panel              */}
      {/* ---------------------------------------------------- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300 animate-fadeIn">
          {/* Backdrop dismiss */}
          <div className="flex-1 hidden sm:block cursor-pointer" onClick={onToggle} />

          <div
            id="morph-assistant-panel"
            className="w-full sm:w-[460px] md:w-[500px] h-full bg-[#0B0D14]/95 sm:border-l border-violet-500/30 flex flex-col shadow-[0_0_60px_rgba(139,92,246,0.3)] backdrop-blur-2xl z-10"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-b from-[#171A29]/90 to-transparent">
              <div className="flex items-center gap-3">
                {/* Glowing Orb Avatar */}
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#6366F1] to-[#38BDF8] p-[2px] shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                  <div className="w-full h-full rounded-full bg-[#0B0D14] flex items-center justify-center">
                    <span className="text-[#C084FC] text-sm font-black animate-pulse">✦</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-white tracking-wide">
                      ✦ MORPH
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-[#C084FC] border border-violet-500/40 text-[9px] font-mono font-bold uppercase tracking-wider">
                      Automotive AI
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] italic">
                    “Imagine it. I’ll morph it.”
                  </p>
                </div>
              </div>

              {/* Action icons */}
              <div className="flex items-center gap-1.5">
                {/* Voice toggle */}
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  title={voiceEnabled ? 'Mute MORPH Voice' : 'Enable MORPH Voice'}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                    voiceEnabled
                      ? 'bg-violet-500/20 text-[#C084FC] border-violet-500/40'
                      : 'bg-white/5 text-[#94A3B8] border-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {voiceEnabled ? 'volume_up' : 'volume_off'}
                  </span>
                </button>

                {/* Close Panel */}
                <button
                  onClick={onToggle}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Active Context Banner */}
            <div className="px-4 py-2.5 bg-[#131622] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase shrink-0">
                  Target Vehicle:
                </span>
                <span className="text-xs font-bold text-white truncate">
                  {selectedCar.name} ({selectedCar.year})
                </span>
              </div>
              {onNavigateToStudio && (
                <button
                  onClick={() => {
                    onNavigateToStudio();
                    onToggle();
                  }}
                  className="text-[10px] font-mono text-[#C084FC] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Open Studio</span>
                  <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                </button>
              )}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {/* MORPH Greeting Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-900/30 to-indigo-900/30 border border-violet-500/20 text-xs text-white">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-[#E9D5FF]">
                  <span className="material-symbols-outlined text-[16px] text-[#C084FC]">auto_awesome</span>
                  <span>What are we building today?</span>
                </div>
                <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                  Tell me your concept, aesthetic, or specific parts. I’ll dial in the stance, wheels, and aero specs instantly.
                </p>
              </div>

              {/* Quick Action Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider block">
                  Quick Mod Directions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleQuickAction('colour')}
                    className="px-2.5 py-1 rounded-full bg-[#171A29] hover:bg-violet-900/30 border border-white/10 hover:border-violet-500/50 text-[11px] font-medium text-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>🎨 Change Colour</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('wheels')}
                    className="px-2.5 py-1 rounded-full bg-[#171A29] hover:bg-violet-900/30 border border-white/10 hover:border-violet-500/50 text-[11px] font-medium text-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>🛞 Change Wheels</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('sporty')}
                    className="px-2.5 py-1 rounded-full bg-[#171A29] hover:bg-violet-900/30 border border-white/10 hover:border-violet-500/50 text-[11px] font-medium text-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>⚡ Make It Sporty</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('blackout')}
                    className="px-2.5 py-1 rounded-full bg-[#171A29] hover:bg-violet-900/30 border border-white/10 hover:border-violet-500/50 text-[11px] font-medium text-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>🖤 Blackout Everything</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('offroad')}
                    className="px-2.5 py-1 rounded-full bg-[#171A29] hover:bg-violet-900/30 border border-white/10 hover:border-violet-500/50 text-[11px] font-medium text-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>🏔️ Make It Off-Road</span>
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#7C3AED] text-white rounded-tr-none shadow-lg'
                          : 'bg-[#131622] border border-white/10 text-white rounded-tl-none shadow-md'
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-white/5">
                          <span className="text-[#C084FC] font-black text-[10px]">✦ MORPH</span>
                          <span className="text-[10px] text-[#94A3B8] font-mono ml-auto">
                            {msg.timestamp}
                          </span>
                        </div>
                      )}

                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* Structured MORPH Recommendation Card */}
                      {msg.recommendation && (
                        <div className="mt-3 p-3.5 rounded-xl bg-[#0B0D14]/90 border border-violet-500/30 space-y-2.5">
                          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C084FC] flex items-center gap-1">
                              <span>✦ MORPH'S RECOMMENDATION</span>
                            </span>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              Ready
                            </span>
                          </div>

                          {/* Recommendation Bullets */}
                          <ul className="space-y-1.5 text-xs text-[#E2E8F0]">
                            <li className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/30"
                                style={{ backgroundColor: msg.recommendation.paintHex }}
                              />
                              <span className="font-bold text-white">Paint Finish:</span>
                              <span className="text-[#A5B4FC]">{msg.recommendation.paintName}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px] text-[#38BDF8]">
                                radio_button_checked
                              </span>
                              <span className="font-bold text-white">Forged Wheels:</span>
                              <span className="text-[#A5B4FC]">{msg.recommendation.wheelsName}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px] text-[#C084FC]">
                                grid_view
                              </span>
                              <span className="font-bold text-white">Grille &amp; Aero:</span>
                              <span className="text-[#A5B4FC]">{msg.recommendation.grilleAero}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px] text-[#F43F5E]">
                                height
                              </span>
                              <span className="font-bold text-white">Stance:</span>
                              <span className="text-[#A5B4FC]">{msg.recommendation.stance}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px] text-[#EAB308]">
                                style
                              </span>
                              <span className="font-bold text-white">Package:</span>
                              <span className="text-[#A5B4FC]">{msg.recommendation.packageStyle}</span>
                            </li>
                          </ul>

                          {/* BUILD DNA Capsule */}
                          <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[9px] font-mono text-[#94A3B8] uppercase block mb-0.5">
                              BUILD DNA
                            </span>
                            <p className="font-mono text-[11px] text-[#E9D5FF] font-semibold tracking-wide">
                              {msg.recommendation.buildDna}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleApplyToStudio(msg.recommendation!)}
                              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[14px]">tune</span>
                              <span>Apply to Studio</span>
                            </button>

                            <button
                              onClick={() => handleMorphNow(msg.recommendation!)}
                              className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#38BDF8] hover:brightness-110 text-white text-xs font-black shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 border border-white/20"
                            >
                              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                              <span>Generate Build</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Thinking Indicator */}
              {orbState === 'thinking' && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#131622] border border-violet-500/40 flex items-center justify-center text-[#C084FC] animate-spin">
                    <span className="material-symbols-outlined text-[14px]">progress_activity</span>
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-[#131622] border border-white/10 text-xs text-[#94A3B8] font-mono flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#C084FC] animate-pulse" />
                    <span>MORPH is architecting your build spec…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer Prompt Input & Voice Controls */}
            <div className="p-4 border-t border-white/10 bg-[#0E111B]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery();
                }}
                className="relative flex items-center gap-2"
              >
                {/* Voice Mic Button */}
                <button
                  type="button"
                  onClick={toggleMic}
                  title={isListening ? 'Stop Listening' : 'Speak to MORPH'}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-[#C084FC]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isListening ? 'mic' : 'mic_none'}
                  </span>
                </button>

                {/* Input text */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tell MORPH what you want…"
                  disabled={orbState === 'thinking'}
                  className="flex-1 pl-4 pr-10 py-2.5 rounded-xl bg-[#171A29] border border-white/10 text-white placeholder-[#94A3B8] text-xs sm:text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || orbState === 'thinking'}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md active:scale-95 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>

              {/* Disclaimer */}
              <div className="mt-2 text-center">
                <span className="text-[10px] font-mono text-[#64748B]">
                  AI Visualization • AutoMorph Automotive Intelligence
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
