'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { X, SlidersHorizontal, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { ProductCategory } from '@/types/digitalGoods';

const DIGITAL_CATEGORIES: { id: ProductCategory | 'all'; name: string; icon: string }[] = [
  { id: 'all', name: 'All Categories', icon: '🌐' },
  { id: 'OTT', name: 'OTT & Streaming', icon: '🎬' },
  { id: 'Gaming', name: 'Gaming Top-up', icon: '🎮' },
  { id: 'Software', name: 'Software Keys', icon: '💻' },
  { id: 'VPN', name: 'VPN & Privacy', icon: '🔒' },
  { id: 'Gift Card', name: 'Gift Cards', icon: '🎁' },
  { id: 'AI Tools', name: 'AI & Productivity', icon: '🤖' },
];

export default function FilterModal() {
  const {
    filterModalOpen,
    setFilterModalOpen,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    inStockOnly,
    setInStockOnly,
    verifiedOnly,
    setVerifiedOnly,
    resetFilters,
  } = useApp();

  if (!filterModalOpen) return null;

  const currentCategory = selectedCategory || 'all';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#121f18] rounded-t-[32px] sm:rounded-3xl p-5 border border-[#d1ead8] dark:border-[#22382c] shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#007A3D] dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Filter &amp; Sort Digital Goods
            </h3>
          </div>
          <button
            onClick={() => setFilterModalOpen(false)}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 tap-bounce"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Digital Categories */}
        <div>
          <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Category
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {DIGITAL_CATEGORIES.map((cat) => {
              const isSelected =
                cat.id === 'all'
                  ? currentCategory === 'all' || currentCategory === 'All'
                  : currentCategory.toLowerCase() === cat.id.toLowerCase();

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all tap-bounce ${
                    isSelected
                      ? 'bg-[#007A3D] text-white shadow-xs'
                      : 'bg-[#F2FAF4] dark:bg-[#172920] text-neutral-700 dark:text-neutral-300 border border-[#d1ead8] dark:border-[#22382c]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range Slider (৳50 to ৳15,000) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Maximum Price (BDT)
            </h4>
            <span className="text-xs font-black text-[#007A3D] dark:text-emerald-400">
              ৳{priceRange ? priceRange[0] : 50} - ৳{priceRange ? priceRange[1] : 15000}
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={15000}
            step={50}
            value={priceRange ? priceRange[1] : 15000}
            onChange={(e) => setPriceRange([priceRange ? priceRange[0] : 50, parseInt(e.target.value)])}
            className="w-full accent-[#007A3D] cursor-pointer"
          />

          {/* Quick Price Filter Pills */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
            {[200, 500, 1000, 3000, 15000].map((cap) => (
              <button
                key={cap}
                onClick={() => setPriceRange([50, cap])}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  priceRange && priceRange[1] === cap
                    ? 'border-[#007A3D] bg-emerald-50 text-[#007A3D] dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
                }`}
              >
                {cap === 15000 ? 'Any Price' : `< ৳${cap.toLocaleString()}`}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles: Verified Only & In Stock Only */}
        <div className="space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            Trust &amp; Availability
          </h4>

          {/* Verified Sellers Toggle */}
          <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F8FCF9] dark:bg-[#16271e] border border-[#d1ead8]/60 dark:border-[#22382c]/60 cursor-pointer">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#007A3D] dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                  Verified Stores Only
                </span>
                <span className="text-[10px] text-neutral-400">
                  Filter out unvetted or flagged sellers
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="w-4 h-4 accent-[#007A3D] rounded-sm cursor-pointer"
            />
          </label>

          {/* In Stock Only Toggle */}
          <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F8FCF9] dark:bg-[#16271e] border border-[#d1ead8]/60 dark:border-[#22382c]/60 cursor-pointer">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                  In Stock Deals Only
                </span>
                <span className="text-[10px] text-neutral-400">
                  Hide out-of-stock variations
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-[#007A3D] rounded-sm cursor-pointer"
            />
          </label>
        </div>

        {/* Sort Options */}
        <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Sort Deals By
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setSortBy('popular')}
              className={`p-2 rounded-xl border text-left font-semibold ${
                sortBy === 'popular'
                  ? 'border-[#007A3D] bg-[#F2FAF4] dark:bg-[#172920] text-[#007A3D] dark:text-emerald-400'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              🔥 Most Popular
            </button>
            <button
              onClick={() => setSortBy('price-asc')}
              className={`p-2 rounded-xl border text-left font-semibold ${
                sortBy === 'price-asc'
                  ? 'border-[#007A3D] bg-[#F2FAF4] dark:bg-[#172920] text-[#007A3D] dark:text-emerald-400'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              💵 Lowest Price First
            </button>
            <button
              onClick={() => setSortBy('price-desc')}
              className={`p-2 rounded-xl border text-left font-semibold ${
                sortBy === 'price-desc'
                  ? 'border-[#007A3D] bg-[#F2FAF4] dark:bg-[#172920] text-[#007A3D] dark:text-emerald-400'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              💎 Highest Price First
            </button>
            <button
              onClick={() => setSortBy('offers-count')}
              className={`p-2 rounded-xl border text-left font-semibold ${
                sortBy === 'offers-count'
                  ? 'border-[#007A3D] bg-[#F2FAF4] dark:bg-[#172920] text-[#007A3D] dark:text-emerald-400'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              🏬 Most Store Deals
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={resetFilters}
            className="flex-1 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 tap-bounce flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={() => setFilterModalOpen(false)}
            className="flex-1 py-3 rounded-2xl bg-[#007A3D] hover:bg-[#006230] text-white text-xs font-bold shadow-md tap-bounce transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
