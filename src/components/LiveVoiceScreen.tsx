import React, { useState, useEffect, useRef } from 'react';

interface LiveVoiceScreenProps {
  onBack: () => void;
  carContext?: string;
}

const VOICES = [
  { id: 'Puck', name: 'Puck', desc: 'Energetic Track Engineer' },
  { id: 'Aoede', name: 'Aoede', desc: 'Refined Design Director' },
  { id: 'Charon', name: 'Charon', desc: 'Deep Pit Chief' },
];

export const LiveVoiceScreen: React.FC<LiveVoiceScreenProps> = ({ onBack, carContext }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState(
    `AutoMorph Radio Check: Connected to Live Voice API. Press & hold or tap the mic to speak to your Chief Race Engineer.`
  );
  const [audioWaves, setAudioWaves] = useState<number[]>([15, 25, 45, 60, 30, 20, 50, 75, 40, 20]);

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition notice:', err);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Audio wave pulsing effect
  useEffect(() => {
    let interval: any;
    if (isListening || isPlayingAudio) {
      interval = setInterval(() => {
        setAudioWaves(
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 80) + 15)
        );
      }, 100);
    } else {
      setAudioWaves([20, 25, 30, 35, 30, 25, 20, 25, 30, 25, 20, 15]);
    }
    return () => clearInterval(interval);
  }, [isListening, isPlayingAudio]);

  const toggleMic = () => {
    if (isListening) {
      // Stop and submit
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      if (transcript.trim()) {
        sendVoiceMessage(transcript);
      }
    } else {
      // Start listening
      setTranscript('');
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition start exception:', e);
        }
      }
    }
  };

  const sendVoiceMessage = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/gemini/voice-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          voice: selectedVoice,
          carContext: carContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Voice error');

      setAiResponse(data.spokenText || 'All systems verified.');

      // If audio returned, play it
      if (data.audioBase64) {
        const audioSrc = `data:${data.audioMime || 'audio/mp3'};base64,${data.audioBase64}`;
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = audioSrc;
          audioPlayerRef.current.play().catch((e) => console.warn('Audio play error:', e));
          setIsPlayingAudio(true);
        }
      }
    } catch (err: any) {
      console.error('Voice send error:', err);
      setAiResponse(`Radio interference: ${err.message || 'Voice transmission failed'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-32 flex flex-col items-center justify-center min-h-[85vh]">
      {/* Hidden audio player */}
      <audio
        ref={audioPlayerRef}
        onEnded={() => setIsPlayingAudio(false)}
        className="hidden"
      />

      {/* Screen Header Bar */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#1E2230] border border-white/10 flex items-center justify-center text-white hover:bg-[#282E42] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            Gemini Live Voice Intercom
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Real-time Voice Conversation Engine (gemini-3.1-flash-live-preview)
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Voice Controls Selector */}
      <div className="flex items-center gap-2 mb-8 bg-[#131620] border border-white/10 p-1.5 rounded-full">
        {VOICES.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVoice(v.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedVoice === v.id
                ? 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            {v.name}
          </button>
        ))}
      </div>

      {/* Main Glowing Cockpit Audio Visualizer */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#0F121C] border border-[#2563EB]/30 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(37,99,235,0.25)] mb-8 p-6">
        {/* Animated outer glowing pulse ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-[#60A5FA] transition-all duration-700 pointer-events-none ${
            isListening
              ? 'scale-110 opacity-80 animate-ping'
              : isPlayingAudio
              ? 'scale-105 opacity-60'
              : 'scale-100 opacity-20'
          }`}
        />

        {/* Central Audio Waveform Bars */}
        <div className="flex items-center justify-center gap-1.5 h-20 mb-4">
          {audioWaves.map((height, idx) => (
            <div
              key={idx}
              className="w-2 bg-gradient-to-t from-[#2563EB] to-[#60A5FA] rounded-full transition-all duration-100"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {/* Center Microphone Action Button */}
        <button
          id="btn-voice-mic"
          onClick={toggleMic}
          className={`w-18 h-18 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer active:scale-95 ${
            isListening
              ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.7)] animate-pulse'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_0_30px_rgba(37,99,235,0.6)]'
          }`}
        >
          <span className="material-symbols-outlined text-[32px]">
            {isListening ? 'mic' : 'mic_none'}
          </span>
        </button>

        <span className="mt-3 text-[11px] font-mono uppercase tracking-widest text-[#60A5FA] font-bold">
          {isListening
            ? 'LISTENING...'
            : isProcessing
            ? 'GEMINI COMPUTING...'
            : isPlayingAudio
            ? 'AUDIO TRANSMITTING...'
            : 'TAP TO TALK'}
        </span>
      </div>

      {/* Real-time Subtitles / Telemetry Box */}
      <div className="w-full max-w-xl rounded-3xl bg-[#131620] border border-white/10 p-6 shadow-xl text-center space-y-3">
        {transcript && (
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-left">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase block mb-1">
              You Said:
            </span>
            <p className="text-white text-sm italic font-medium">"{transcript}"</p>
          </div>
        )}

        <div className="p-3 rounded-xl bg-[#0F121C] border border-[#2563EB]/20 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-[#60A5FA] uppercase font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] animate-ping" />
              AutoMorph Radio ({selectedVoice}):
            </span>
            {isPlayingAudio && (
              <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">volume_up</span>
                Playing Voice
              </span>
            )}
          </div>
          <p className="text-[#E2E8F0] text-sm leading-relaxed">{aiResponse}</p>
        </div>

        {/* Quick Voice Prompt Shortcuts */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {[
            'Is my aero setup balanced for high-speed corners?',
            'What wheel fitment do you recommend?',
            'Perform pre-race vehicle health inspection.',
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => {
                setTranscript(promptText);
                sendVoiceMessage(promptText);
              }}
              disabled={isProcessing}
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#94A3B8] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              "{promptText}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
