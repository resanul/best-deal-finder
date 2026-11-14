'use client';

/**
 * Star Tech Authentic Header & Category Navigation Bar
 * Exact Star Tech dark navy theme (#081621), red accent (#ef4a23), and multi-vendor comparison.
 * 
 * Location: src/components/StarTechHeader.tsx
 */

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Zap,
  Flame,
  Wrench,
  Store,
  ShieldCheck,
  Moon,
  Sun,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export interface StarTechHeaderProps {
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

export default function StarTechHeader({
  onOpenMobileFilters,
  onOpenShopsModal,
  onOpenScamModal,
  activeCategory,
  onSelectCategory,
}: StarTechHeaderProps) {
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
    <header className="w-full bg-[#081621] text-white sticky top-0 z-50 shadow-md">
      
      {/* 1. Star Tech Top Ticker / Notice Bar */}
      <div className="bg-[#0b1b28] border-b border-[#142636] py-1 px-4 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4a23] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4a23]"></span>
            </span>
            <span className="truncate">
              {language === 'bn'
                ? 'Star Tech, Ryans, Walton, Techland সহ ২২+ ভেরিফাইড বিডি টেক শপের লাইভ দাম তুলনা • ০% স্ক্যাম গ্যারান্টি'
                : 'Star Tech, Ryans, Walton, Techland & 22+ BD Stores Live Price Comparison & Best Deal Finder'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-400 shrink-0">
            <span>হেল্পলাইন: 16793 (9 AM - 8 PM)</span>
            <span>•</span>
            <span className="text-[#ef4a23] font-bold">১০,০০০+ জেনুইন টেক প্রোডাক্ট</span>
          </div>
        </div>
      </div>

      {/* 2. Main Star Tech Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4 sm:gap-6">
        
        {/* Star Tech Logo */}
        <button
          onClick={() => {
            onSelectCategory('All');
            setScreen('home');
          }}
          className="flex items-center gap-2.5 text-left shrink-0 group tap-bounce"
        >
          {/* Authentic Star Tech 4-point star SVG icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-tr from-[#ef4a23] to-[#ff6b4a] flex items-center justify-center p-1.5 shadow-md shadow-[#ef4a23]/30">
            <svg
              viewBox="0 0 24 24"
              className="w-full h-full fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans uppercase">
                STAR <span className="text-[#ef4a23]">TECH</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-sm bg-[#ef4a23] text-white text-[9px] font-black uppercase tracking-wider">
                COMPARE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden xs:block">
              {language === 'bn' ? '২২টি টেক শপের লাইভ দাম তুলনা' : 'Multi-Vendor Price Comparison'}
            </p>
          </div>
        </button>

        {/* Central Search Bar (Exact Star Tech styling: White input + Red button) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-2">
          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'Ryzen 5 5600, RTX 4060, Walton Laptop, Odyssey G5...'
                  : 'Search Ryzen 5, RTX 4060, Walton Laptop, Odyssey G5...'
              }
              className="w-full h-10 pl-4 pr-24 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#ef4a23] shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-14 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <button
              className="absolute right-0 top-0 bottom-0 px-4 rounded-r-full bg-[#ef4a23] hover:bg-[#d63b17] text-white flex items-center justify-center transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Star Tech Header Right Quick Action Links */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Offers */}
          <button
            onClick={() => onSelectCategory('All')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-white transition-colors text-xs font-bold tap-bounce"
          >
            <Zap className="w-4 h-4 text-[#ef4a23]" />
            <div className="text-left leading-tight">
              <span className="block text-[11px] font-bold">Offers</span>
              <span className="text-[9px] text-slate-400 font-normal">অফার</span>
            </div>
          </button>

          {/* Deals / Happy Hour */}
          <button
            onClick={() => onSelectCategory('All')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-white transition-colors text-xs font-bold tap-bounce"
          >
            <Flame className="w-4 h-4 text-[#ef4a23]" />
            <div className="text-left leading-tight">
              <span className="block text-[11px] font-bold">Happy Hour</span>
              <span className="text-[9px] text-slate-400 font-normal">সেরা ডিল</span>
            </div>
          </button>

          {/* PC Builder */}
          <button
            onClick={() => onSelectCategory('Processors')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-xs font-bold tap-bounce border border-white/10"
          >
            <Wrench className="w-3.5 h-3.5 text-[#ef4a23]" />
            <div className="text-left leading-tight">
              <span className="block text-[11px] font-bold">PC Builder</span>
              <span className="text-[9px] text-slate-400 font-normal">পিসি বিল্ড</span>
            </div>
          </button>

          {/* 22 BD Shops Modal Trigger */}
          <button
            onClick={onOpenShopsModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#ef4a23]/15 hover:bg-[#ef4a23]/25 text-[#ff6b4a] border border-[#ef4a23]/30 transition-colors text-xs font-bold tap-bounce"
            title="Manage or view 22 BD shops"
          >
            <Store className="w-3.5 h-3.5 text-[#ef4a23]" />
            <span className="hidden sm:inline">২২টি শপ</span>
            <span className="sm:hidden">শপস</span>
          </button>

          {/* Scam Shield Checker */}
          <button
            onClick={onOpenScamModal}
            className="hidden xs:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-white/10 text-emerald-400 transition-colors text-xs font-bold tap-bounce"
            title="Scam Shield Checker"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
            className="md:hidden p-2 rounded-lg bg-[#ef4a23] text-white tap-bounce flex items-center justify-center"
            title="Open Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* 3. Mobile Search Bar (Only on small screens) */}
      <div className="p-3 bg-[#0a1824] border-t border-[#142636] md:hidden">
        <div className="relative w-full flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ryzen, RTX, Laptop, Monitor খুঁজুন..."
            className="w-full h-9 pl-3 pr-20 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:outline-hidden"
          />
          <button
            className="absolute right-0 top-0 bottom-0 px-3 rounded-r-lg bg-[#ef4a23] text-white flex items-center justify-center"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Horizontal Category Strip (Exact Star Tech Main Navigation Bar) */}
      <nav className="border-t border-[#142636] bg-[#081621] overflow-x-auto no-scrollbar">
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
                    ? 'border-[#ef4a23] text-[#ef4a23] bg-white/5'
                    : 'border-transparent text-slate-200 hover:text-white hover:bg-white/5'
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
