import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { SearchGroundingResult } from '../types';

interface SearchIntelScreenProps {
  onBack: () => void;
  carContext?: string;
}

const PRESET_SEARCHES = [
  'Porsche 992 GT3 RS active aero wing downforce & DRS specs',
  'Brembo GT-R 6-piston big brake kit pricing & rotor diameter',
  'BBS FI-R forged wheels 20x9.5 20x12 fitment & weight',
  'Akrapovic evolution titanium exhaust dyno power gains & decibels',
  'KW V4 Clubsport 3-way coilover suspension spring rates',
  'Liberty Walk widebody kit pricing & installation labor time',
];

export const SearchIntelScreen: React.FC<SearchIntelScreenProps> = ({ onBack, carContext }) => {
  const [query, setQuery] = useState(carContext ? `${carContext} OEM performance specs & aftermarket tuning guide` : '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchGroundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q.trim(),
          carModel: carContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to search Google data');
      }

      setResult({
        query: q.trim(),
        answer: data.answer,
        carModel: carContext,
        groundingChunks: data.groundingChunks || [],
        webSearchQueries: data.webSearchQueries || [],
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      console.error('Search grounding error:', err);
      setError(err.message || 'Failed to fetch search grounded data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-32 flex flex-col">
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
                Live Automotive Intel &amp; Parts Grounding
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
                Google Search Grounded
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Powered by Gemini 3.5 Flash with real-time web verification
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="w-full rounded-3xl bg-[#131620] border border-white/10 p-4 sm:p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-[80px] pointer-events-none" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center mb-4"
        >
          <span className="material-symbols-outlined absolute left-4 text-[#94A3B8] text-[22px]">
            travel_explore
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts, wheel offsets, dyno curves, aftermarket prices..."
            disabled={isLoading}
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-[#0F121C] border border-white/10 text-white placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#2563EB]"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-white/10 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-md"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            <span>Search</span>
          </button>
        </form>

        {/* Preset Chips */}
        <div>
          <span className="text-[11px] font-mono text-[#94A3B8] uppercase block mb-2">
            Trending Live Searches:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_SEARCHES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(preset);
                  handleSearch(preset);
                }}
                disabled={isLoading}
                className="text-left text-xs px-3 py-1.5 rounded-xl bg-[#0F121C] hover:bg-[#1E2230] border border-white/5 text-[#94A3B8] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="w-full rounded-3xl bg-[#131620] border border-[#2563EB]/40 p-8 flex flex-col items-center justify-center text-center shadow-xl mb-6">
          <div className="w-12 h-12 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin mb-4" />
          <p className="text-white font-bold text-base mb-1">
            Grounded Web Verification in Progress...
          </p>
          <p className="text-xs text-[#94A3B8] font-mono max-w-md">
            Querying Google Search index for latest automotive parts, dyno numbers, and OEM specs...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="w-full p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm mb-6 flex items-start gap-3">
          <span className="material-symbols-outlined text-red-400 text-lg mt-0.5">error</span>
          <div>
            <p className="font-bold">Search Grounding Failed</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Search Result */}
      {result && !isLoading && (
        <div className="space-y-6">
          {/* Main Grounded Answer Card */}
          <div className="w-full rounded-3xl bg-[#131620] border border-white/10 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#34D399]">verified</span>
                <h2 className="font-display text-lg font-bold text-white">
                  Verified Automotive Intelligence
                </h2>
              </div>
              <span className="text-xs font-mono text-[#94A3B8]">{result.timestamp}</span>
            </div>

            <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed text-[#E2E8F0]">
              <ReactMarkdown>{result.answer}</ReactMarkdown>
            </div>
          </div>

          {/* Web Citations & Sources Card */}
          {result.groundingChunks && result.groundingChunks.length > 0 && (
            <div className="w-full rounded-3xl bg-[#0F121C] border border-white/10 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#60A5FA] text-base">link</span>
                <h3 className="font-mono text-xs uppercase font-bold text-[#94A3B8] tracking-wider">
                  Google Search Grounding Sources ({result.groundingChunks.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.groundingChunks.map((chunk, idx) => {
                  const uri = chunk.web?.uri;
                  const title = chunk.web?.title || uri || 'Grounded Web Source';
                  return (
                    <a
                      key={idx}
                      href={uri || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[#131620] hover:bg-[#1E2230] border border-white/5 hover:border-[#2563EB]/40 flex items-start gap-2.5 transition-all text-xs group"
                    >
                      <span className="material-symbols-outlined text-[#94A3B8] group-hover:text-[#60A5FA] text-sm mt-0.5">
                        open_in_new
                      </span>
                      <div className="overflow-hidden flex-1">
                        <p className="text-white font-medium truncate group-hover:text-[#60A5FA]">
                          {title}
                        </p>
                        {uri && <p className="text-[#94A3B8] text-[10px] truncate">{uri}</p>}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
