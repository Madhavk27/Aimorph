import React, { useState } from 'react';
import { BuildItem, CategoryFilter, ModificationShop, PartProduct } from '../types';
import { MODIFICATION_SHOPS, PARTS_PRODUCTS } from '../data/mockData';

interface ExploreScreenProps {
  builds: BuildItem[];
  onSelectBuild: (build: BuildItem) => void;
  onTryBuildInVisualizer: (build: BuildItem) => void;
  onToggleLike: (buildId: string) => void;
}

const CATEGORIES: CategoryFilter[] = [
  'ALL',
  'STEALTH',
  'SPORT',
  'URBAN',
  'OFF-ROAD',
  'PERFORMANCE',
  'LUXURY',
  'JDM',
  'SUV',
];

type TabType = 'builds' | 'shops' | 'parts';

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  builds,
  onSelectBuild,
  onTryBuildInVisualizer,
  onToggleLike,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('builds');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPartCategory, setSelectedPartCategory] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  const filteredBuilds = builds
    .filter((b) => {
      if (activeCategory === 'ALL') return true;
      return (
        b.category === activeCategory ||
        b.tags.some((t) => t.toUpperCase().includes(activeCategory))
      );
    })
    .filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.baseModel.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      );
    });

  const filteredShops = MODIFICATION_SHOPS
    .filter((s) => {
      if (selectedCity === 'ALL') return true;
      return s.city.toLowerCase() === selectedCity.toLowerCase();
    })
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.specialties.some((sp) => sp.toLowerCase().includes(q))
      );
    });

  const filteredParts = PARTS_PRODUCTS
    .filter((p) => {
      if (selectedPartCategory === 'ALL') return true;
      return p.category === selectedPartCategory;
    })
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.fitment.some((f) => f.toLowerCase().includes(q))
      );
    });

  const handleCopy = (e: React.MouseEvent, build: BuildItem) => {
    e.stopPropagation();
    setCopiedId(build.id);
    onTryBuildInVisualizer(build);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-36 flex flex-col">
      {/* Top Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AutoMorph Community &amp; Ecosystem
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Explore AI customized builds, verified tuning workshops, and performance parts.
            </p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center p-1 bg-[#131620] rounded-full border border-white/10 w-fit">
            <button
              onClick={() => setActiveTab('builds')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'builds'
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white shadow-lg'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">directions_car</span>
              <span>Community Builds ({builds.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('shops')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'shops'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#38BDF8] text-white shadow-lg'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span>Mod Shops</span>
            </button>
            <button
              onClick={() => setActiveTab('parts')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'parts'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white shadow-lg'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">speed</span>
              <span>Performance Parts</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'builds'
                  ? 'Search car, style, or creator...'
                  : activeTab === 'shops'
                  ? 'Search tuning shops, city, or specialty (e.g. PPF, Dyno, Turbo)...'
                  : 'Search aftermarket parts, brand (Brembo, Akrapovic, BBS)...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#131620] border border-white/10 text-white placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#2563EB]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ----------------- TAB 1: COMMUNITY BUILDS ----------------- */}
      {activeTab === 'builds' && (
        <>
          {/* Filter Category Chips */}
          <div className="w-full overflow-x-auto no-scrollbar pb-2 mb-6">
            <div className="flex items-center gap-2 w-max">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#38BDF8] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                        : 'bg-[#131620] text-[#94A3B8] border border-white/10 hover:border-violet-500/30 hover:text-white'
                    }`}
                  >
                    {cat === 'ALL' ? '🔥 All Builds' : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Builds Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBuilds.map((build) => (
              <div
                key={build.id}
                onClick={() => onSelectBuild(build)}
                className="group rounded-3xl bg-[#131620] border border-white/10 hover:border-violet-500/50 overflow-hidden shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#0F121C]">
                  <img
                    src={build.modifiedImage}
                    alt={build.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131620] via-transparent to-transparent" />

                  {/* Like Button Badge */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(build.id);
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-white hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-[16px] text-red-500"
                      style={{
                        fontVariationSettings: build.isLiked ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      favorite
                    </span>
                    <span className="text-xs font-mono font-bold">
                      {(build.likes + (build.isLiked ? 1 : 0)).toLocaleString()}
                    </span>
                  </button>

                  {/* Category Tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-violet-600/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                    {build.category || build.tags[0]}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-[#C084FC] transition-colors truncate mb-1">
                    {build.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mb-3 truncate">{build.baseModel}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {build.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-[#94A3B8]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-600/30 flex items-center justify-center text-[10px] font-bold text-[#C084FC]">
                        {build.author.charAt(0)}
                      </div>
                      <span className="text-xs text-[#94A3B8] truncate max-w-[100px]">
                        {build.authorHandle || build.author}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleCopy(e, build)}
                      className="px-3 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/40 text-[#C084FC] hover:bg-violet-600 hover:text-white transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedId === build.id ? 'check' : 'tune'}
                      </span>
                      <span>{copiedId === build.id ? 'Loaded!' : 'Remix'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ----------------- TAB 2: MODIFICATION SHOPS ----------------- */}
      {activeTab === 'shops' && (
        <div className="flex flex-col gap-6">
          {/* City Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {['ALL', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Gurugram'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  selectedCity === city
                    ? 'bg-[#8B5CF6] text-white shadow-lg'
                    : 'bg-[#131620] text-[#94A3B8] border border-white/10 hover:text-white'
                }`}
              >
                📍 {city}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="rounded-3xl bg-[#131620] border border-white/10 hover:border-[#8B5CF6]/50 overflow-hidden shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 w-full bg-[#0F121C] overflow-hidden">
                  <img
                    src={shop.coverImage}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131620] via-transparent to-black/40" />
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    {shop.verified && (
                      <span className="bg-[#2563EB]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        <span>VERIFIED GARAGE</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 text-xs text-amber-400 font-bold font-mono">
                    <span className="material-symbols-outlined text-[14px] text-amber-400">star</span>
                    <span>{shop.rating}</span>
                    <span className="text-[#94A3B8] font-normal">({shop.reviewCount})</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-display text-xl font-bold text-white mb-1">
                    {shop.name}
                  </h3>
                  <p className="text-xs text-[#94A3B8] flex items-center gap-1 mb-4">
                    <span className="material-symbols-outlined text-[14px] text-[#60A5FA]">location_on</span>
                    <span>{shop.location}</span>
                  </p>

                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-2">Specialties</span>
                    <div className="flex flex-wrap gap-1.5">
                      {shop.specialties.map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[#E2E8F0]"
                        >
                          ⚡ {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono text-[#94A3B8]">{shop.phone}</span>
                    <a
                      href={shop.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 text-[#C084FC] hover:bg-[#8B5CF6] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Book Consultation</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: PERFORMANCE PARTS ----------------- */}
      {activeTab === 'parts' && (
        <div className="flex flex-col gap-6">
          {/* Part Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {['ALL', 'BRAKES', 'EXHAUST', 'WHEELS', 'SUSPENSION', 'AERO', 'PERFORMANCE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedPartCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  selectedPartCategory === cat
                    ? 'bg-[#EC4899] text-white shadow-lg'
                    : 'bg-[#131620] text-[#94A3B8] border border-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParts.map((part) => (
              <div
                key={part.id}
                className="rounded-3xl bg-[#131620] border border-white/10 hover:border-[#EC4899]/50 overflow-hidden shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 w-full bg-[#0F121C] overflow-hidden">
                  <img
                    src={part.image}
                    alt={part.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131620] via-transparent to-black/30" />
                  
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono font-bold text-[#F472B6]">
                    {part.category}
                  </div>

                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 text-xs text-amber-400 font-bold font-mono">
                    <span className="material-symbols-outlined text-[14px] text-amber-400">star</span>
                    <span>{part.rating}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                    {part.brand} • {part.partNumber}
                  </span>
                  <h3 className="font-display text-base font-bold text-white mb-2 line-clamp-2">
                    {part.name}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mb-4 line-clamp-2">
                    {part.specDetails}
                  </p>

                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-[#94A3B8] block mb-1">Vehicle Fitment</span>
                    <div className="flex flex-wrap gap-1">
                      {part.fitment.map((fit, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/[0.04] rounded text-[#E2E8F0]">
                          {fit}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#94A3B8] block">MSRP EST.</span>
                      <span className="text-lg font-mono font-extrabold text-white">${part.price.toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => alert(`Part ${part.name} added to build spec inquiry!`)}
                      className="px-4 py-2 rounded-full bg-[#EC4899]/20 border border-[#EC4899]/40 text-[#F472B6] hover:bg-[#EC4899] hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                      <span>Order Part</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


