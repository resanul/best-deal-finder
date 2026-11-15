'use client';

/**
 * DamKoto BD ("Best Deal Finder") Authentic Header & Category Navigation Bar
 * Independent multi-vendor price comparison and deal finder platform.
 * 
 * Location: src/components/DamKotoHeader.tsx
 */

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Zap,
  Flame,
  Store,
  ShieldCheck,
  Moon,
  Sun,
  X,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

export interface DamKotoHeaderProps {
  onOpenMobileFilters?: () => void;
  onOpenShopsModal?: () => void;
  onOpenScamModal?: () => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const NAV_CATEGORIES = [
  { id: 'All', label: 'All Products', labelBn: 'সকল পণ্য' },
  { id: 'Processors', label: 'Processor', labelBn: 'প্রসেসর' },
  { id: 'Graphics Cards', label: 'Graphics Card', labelBn: 'গ্রাফিক্স কার্ড' },
  { id: 'Motherboard', label: 'Motherboard', labelBn: 'মাদারবোর্ড' },
  { id: 'RAM', label: 'RAM', labelBn: 'র‍্যাম' },
  { id: 'SSD', label: 'SSD & Storage', labelBn: 'স্টোরেজ' },
  { id: 'PowerSupply', label: 'Power Supply', labelBn: 'পাওয়ার সাপ্লাই' },
  { id: 'Laptops', label: 'Laptop', labelBn: 'ল্যাপটপ' },
  { id: 'Monitors', label: 'Monitor', labelBn: 'মনিটর' },
  { id: 'Digital', label: 'Digital Goods', labelBn: 'ডিজিটাল গুডস' },
];

export default function DamKotoHeader({
  onOpenMobileFilters,
  onOpenShopsModal,
  onOpenScamModal,
  activeCategory,
  onSelectCategory,
}: DamKotoHeaderProps) {
  const {
    searchQuery,
    setSearchQuery,
    setScreen,
    darkMode,
    toggleDarkMode,
    language,
    setLanguage,
  } = useApp();

  return (
    <header className="w-full bg-[#090D16] text-white sticky top-0 z-50 shadow-lg border-b border-slate-800/80">
      
      {/* 1. DamKoto BD Live Announcement & Trust Ticker */}
      <div className="bg-[#05080F] border-b border-slate-800/60 py-1.5 px-4 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="truncate">
              {language === 'bn'
                ? 'DamKoto BD • Star Tech, Ryans, Techland, Walton সহ ২২+ ভেরিফাইড বিডি টেক শপের লাইভ দাম তুলনা • ০% স্ক্যাম গ্যারান্টি'
                : 'DamKoto BD • Compare live prices across Star Tech, Ryans, Techland, Walton & 22+ verified BD tech shops • 0% Scam Guarantee'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-400 shrink-0 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '১০০% স্বাধীন প্ল্যাটফর্ম' : '100% Unbiased Comparator'}</span>
            </span>
            <span>•</span>
            <span className="text-teal-400 font-bold">২২+ শীর্ষ পার্টনার শপ</span>
          </div>
        </div>
      </div>

      {/* 2. Main DamKoto BD Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* DamKoto BD Brand Logo */}
        <button
          onClick={() => {
            onSelectCategory('All');
            setScreen('home');
          }}
          className="flex items-center gap-2.5 text-left shrink-0 group tap-bounce"
        >
          {/* Authentic DamKoto BD Icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center p-1.5 shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400/30">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                DamKoto <span className="text-emerald-400">BD</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                BEST DEAL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden xs:block">
              {language === 'bn' ? 'বাংলাদেশের সেরা টেক ও ডিজিটাল মূল্য তুলনা' : 'Multi-Vendor Tech Price Comparison'}
            </p>
          </div>
        </button>

        {/* Central Search Bar */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-2">
          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'Ryzen 5 5600, RTX 4060, Walton Laptop, Odyssey G5, Netflix 4K...'
                  : 'Search Ryzen 5, RTX 4060, Walton Laptop, Odyssey G5, Netflix...'
              }
              className="w-full h-10 pl-4 pr-24 rounded-full bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-400 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-14 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <button
              className="absolute right-0 top-0 bottom-0 px-4 rounded-r-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center transition-all shadow-xs"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DamKoto BD Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Top Deals */}
          <button
            onClick={() => onSelectCategory('All')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-white transition-colors text-xs font-bold tap-bounce"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <div className="text-left leading-tight">
              <span className="block text-[11px] font-bold">Top Deals</span>
              <span className="text-[9px] text-slate-400 font-normal">সেরা ডিল</span>
            </div>
          </button>

          {/* Happy Hour / Flash Deals */}
          <button
            onClick={() => onSelectCategory('All')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-white transition-colors text-xs font-bold tap-bounce"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <div className="text-left leading-tight">
              <span className="block text-[11px] font-bold">Price Drop</span>
              <span className="text-[9px] text-slate-400 font-normal">দাম কমেছে</span>
            </div>
          </button>

          {/* 22 BD Shops Modal Trigger */}
          <button
            onClick={onOpenShopsModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors text-xs font-bold tap-bounce"
            title="Manage or view 22 BD shops"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">২২টি শপ</span>
            <span className="sm:hidden">শপস</span>
          </button>

          {/* Scam Shield Checker */}
          <button
            onClick={onOpenScamModal}
            className="hidden xs:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors text-xs font-bold tap-bounce"
            title="Scam Shield Checker"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">স্ক্যাম চেকার</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
            title="Change Language"
          >
            <span>{language === 'en' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Filter Trigger Button */}
          <button
            onClick={onOpenMobileFilters}
            className="md:hidden p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white tap-bounce flex items-center justify-center transition-colors"
            title="Open Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* 3. Mobile Search Bar (Only on small screens) */}
      <div className="p-3 bg-[#070b13] border-t border-slate-800 md:hidden">
        <div className="relative w-full flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ryzen, RTX, Laptop, Monitor খুঁজুন..."
            className="w-full h-9 pl-3 pr-20 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
          />
          <button
            className="absolute right-0 top-0 bottom-0 px-3 rounded-r-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Horizontal Category Strip */}
      <nav className="border-t border-slate-800/80 bg-[#090D16] overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 sm:gap-2">
          {NAV_CATEGORIES.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setScreen('home');
                }}
                className={`py-2.5 px-3 sm:px-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{language === 'bn' ? cat.labelBn : cat.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </header>
  );
}
