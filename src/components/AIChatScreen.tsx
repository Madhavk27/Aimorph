import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../types';

interface AIChatScreenProps {
  onBack: () => void;
  carContext?: string;
}

const ROLES = [
  {
    id: 'master-tuner',
    name: 'Master Tuner',
    icon: 'build',
    desc: 'General build architect & performance specialist',
  },
  {
    id: 'aero-engineer',
    name: 'Aero Dynamicist',
    icon: 'air',
    desc: 'Downforce, CFD, splitters, diffusers & wings',
  },
  {
    id: 'ecu-specialist',
    name: 'ECU & Dyno Pro',
    icon: 'speed',
    desc: 'Boost mapping, fuel trims, turbo & horsepower',
  },
  {
    id: 'concierge',
    name: 'Bespoke Concierge',
    icon: 'palette',
    desc: 'Paint-to-Sample, carbon weave & luxury specs',
  },
];

const MODELS = [
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'Recommended',
    desc: 'Balanced speed & automotive intelligence',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    badge: 'Deep Reasoning',
    desc: 'Complex track physics & engineering math',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    badge: 'Fastest',
    desc: 'Instant replies & quick parts lookup',
  },
];

const SUGGESTIONS = [
  'What wheel offset & tire size gives flush fitment on a Porsche 911 GT3?',
  'Explain the downforce benefits of a chassis-mounted swan-neck rear wing.',
  'How much horsepower gain can I expect from a Stage 2 ECU flash with downpipes?',
  'Recommend the best ceramic brake upgrade vs steel rotors for track endurance.',
];

export const AIChatScreen: React.FC<AIChatScreenProps> = ({ onBack, carContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm **AutoMorphAi's Master Automotive Engineer**. ${
        carContext ? `I see you're working on the **${carContext}**.` : ''
      }\n\nAsk me anything about aerodynamics, engine tuning, wheel fitments, suspension geometry, or bespoke styling. How can I assist your build today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedRole, setSelectedRole] = useState('master-tuner');
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          model: selectedModel,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      const modelMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        text: data.text || 'No response received from automotive AI.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || selectedModel,
        roleType: selectedRole as any,
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        text: `⚠️ **Error communicating with Gemini:** ${err.message || 'Please check your connection and API configuration.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-32 flex flex-col h-[90vh]">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
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
                Gemini AI Tuning Engineer
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#2563EB]/20 text-[#60A5FA] border border-[#3B82F6]/30 text-[10px] font-mono font-bold uppercase">
                Multi-Turn
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Powered by Google Gemini 3.1 &amp; 3.5 Pro/Flash
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome-reset',
                role: 'model',
                text: 'Chat history cleared. How can I assist your vehicle tuning project now?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
          title="Clear Conversation"
        >
          <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Selectors Bar: Role & Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 shrink-0">
        {/* Role Selector */}
        <div className="flex items-center gap-2 bg-[#131620] border border-white/10 rounded-xl px-3 py-1.5">
          <span className="material-symbols-outlined text-[#60A5FA] text-[18px]">psychology</span>
          <div className="flex-1">
            <label className="text-[10px] font-mono text-[#94A3B8] uppercase block">AI Specialist Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#131620] text-white">
                  {r.name} — {r.desc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2 bg-[#131620] border border-white/10 rounded-xl px-3 py-1.5">
          <span className="material-symbols-outlined text-[#A78BFA] text-[18px]">smart_toy</span>
          <div className="flex-1">
            <label className="text-[10px] font-mono text-[#94A3B8] uppercase block">Gemini Engine</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#131620] text-white">
                  {m.name} ({m.badge})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-4 scroll-smooth">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  isUser
                    ? 'bg-[#2563EB] text-white border-[#3B82F6]'
                    : 'bg-[#1E2230] text-[#60A5FA] border-white/10 shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isUser ? 'person' : 'engineering'}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg ${
                  isUser
                    ? 'bg-[#2563EB] text-white rounded-tr-none'
                    : 'bg-[#131620] border border-white/10 text-white rounded-tl-none'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/5">
                    <span className="text-[10px] font-mono text-[#60A5FA] uppercase font-bold">
                      {ROLES.find((r) => r.id === (msg.roleType || selectedRole))?.name || 'Chief Engineer'}
                    </span>
                    {msg.modelUsed && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#94A3B8]">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span className="text-[10px] text-[#94A3B8] ml-auto font-mono">{msg.timestamp}</span>
                  </div>
                )}

                <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-sm">
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  )}
                </div>

                {isUser && (
                  <div className="text-[9px] text-white/70 text-right mt-1 font-mono">{msg.timestamp}</div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1E2230] border border-white/10 flex items-center justify-center text-[#60A5FA] animate-pulse">
              <span className="material-symbols-outlined text-[16px]">engineering</span>
            </div>
            <div className="bg-[#131620] border border-white/10 rounded-2xl rounded-tl-none p-4 text-white flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs text-[#94A3B8] font-mono">
                Calculating automotive engineering response with {selectedModel}...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset prompt pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 shrink-0">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full bg-[#131620] hover:bg-[#1E2230] border border-white/10 text-[11px] text-[#94A3B8] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask tuning questions, fitment numbers, ECU stages, aero math..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-[#131620] border border-white/10 text-white placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#2563EB] shadow-xl disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 w-9 h-9 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
