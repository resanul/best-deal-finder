'use client';

/**
 * Star Tech Authentic Left Sidebar Filter Component (.ws-box)
 * Exact Star Tech Bangladesh filter styling and interaction patterns.
 * 
 * Location: src/components/StarTechFilterSidebar.tsx
 */

import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Search,
  Sliders,
  Tag,
  Layers,
  Cpu,
  Monitor,
  Laptop,
  HardDrive,
  Zap,
} from 'lucide-react';
import { getTrackedRetailers } from '@/lib/physicalDataService';

export interface StarTechFilterSidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  priceRange: [number, number];
  onPriceChange: (min: number, max: number) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  selectedShopIds: string[];
  onToggleShopId: (shopId: string) => void;
  onResetAll: () => void;
  categoryCounts: Record<string, number>;
  brandCounts: Record<string, number>;
  totalCount: number;
}

const CATEGORY_ITEMS = [
  { id: 'All', nameBn: 'সকল প্রোডাক্ট', nameEn: 'All Products', icon: Layers },
  { id: 'Processors', nameBn: 'প্রসেসর (Processor)', nameEn: 'Processors / CPUs', icon: Cpu },
  { id: 'Graphics Cards', nameBn: 'গ্রাফিক্স কার্ড (GPU)', nameEn: 'Graphics Cards', icon: Zap },
  { id: 'Motherboard', nameBn: 'মাদারবোর্ড (Motherboard)', nameEn: 'Motherboards', icon: HardDrive },
  { id: 'RAM', nameBn: 'র‍্যাম (Desktop RAM)', nameEn: 'RAM (Memory)', icon: HardDrive },
  { id: 'SSD', nameBn: 'এসএসডি ও স্টোরেজ', nameEn: 'SSD & Storage', icon: HardDrive },
  { id: 'PowerSupply', nameBn: 'পাওয়ার সাপ্লাই (PSU)', nameEn: 'Power Supply', icon: Zap },
  { id: 'Laptops', nameBn: 'ল্যাপটপ (Laptop)', nameEn: 'Laptops & Notebooks', icon: Laptop },
  { id: 'Monitors', nameBn: 'মনিটর (Monitor)', nameEn: 'Monitors', icon: Monitor },
  { id: 'Digital', nameBn: 'ডিজিটাল সাবস্ক্রিপশন', nameEn: 'Digital Subscriptions', icon: Tag },
];

export default function StarTechFilterSidebar({
  selectedCategory,
  onSelectCategory,
  selectedBrands,
  onToggleBrand,
  priceRange,
  onPriceChange,
  inStockOnly,
  onToggleInStock,
  selectedShopIds,
  onToggleShopId,
  onResetAll,
  categoryCounts,
  brandCounts,
  totalCount,
}: StarTechFilterSidebarProps) {
  const [brandSearch, setBrandSearch] = useState('');
  const [shopSearch, setShopSearch] = useState('');

  // Tracked BD Retailers
  const allRetailers = useMemo(() => getTrackedRetailers(), []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onPriceChange(priceRange[0], val);
  };

  // Filtered brands based on search input
  const allBrandEntries = useMemo(() => {
    return Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);
  }, [brandCounts]);

  const visibleBrands = useMemo(() => {
    if (!brandSearch.trim()) return allBrandEntries;
    const q = brandSearch.toLowerCase();
    return allBrandEntries.filter(([brand]) => brand.toLowerCase().includes(q));
  }, [allBrandEntries, brandSearch]);

  // Filtered shops based on search
  const visibleShops = useMemo(() => {
    if (!shopSearch.trim()) return allRetailers;
    const q = shopSearch.toLowerCase();
    return allRetailers.filter((s) => s.name.toLowerCase().includes(q));
  }, [allRetailers, shopSearch]);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedBrands.length > 0 ||
    selectedShopIds.length > 0 ||
    inStockOnly ||
    priceRange[0] > 0 ||
    priceRange[1] < 350000;

  return (
    <aside className="w-full space-y-3.5 select-none text-slate-800 dark:text-slate-200">
      
      {/* 0. Filter Header Bar (with Reset Button) */}
      <div className="ws-box p-3.5 flex items-center justify-between border border-[#eceff1] dark:border-[#1a2b3c] rounded-lg">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#ef4a23]" />
          <span className="font-bold text-sm text-[#081621] dark:text-white uppercase tracking-wider">
            ফিল্টার (Filters)
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetAll}
            className="flex items-center gap-1 text-[11px] font-bold text-[#ef4a23] hover:text-[#d63b17] bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>সব মুছুন</span>
          </button>
        )}
      </div>

      {/* 1. Price Range Filter Box (Exact Star Tech styling) */}
      <div className="ws-box p-4 border border-[#eceff1] dark:border-[#1a2b3c] rounded-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-black uppercase text-[#081621] dark:text-white tracking-wider flex items-center gap-1.5">
            <span>Price Range</span>
            <span className="text-[10px] text-slate-400 font-normal">মূল্য পরিসীমা</span>
          </h4>
        </div>

        {/* Dual Slider Bar */}
        <div className="pt-2">
          <input
            type="range"
            min={0}
            max={350000}
            step={2000}
            value={priceRange[1]}
            onChange={handleSliderChange}
            className="w-full accent-[#ef4a23] cursor-pointer"
          />
        </div>

        {/* Min / Max BDT Inputs */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Min (৳)</label>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => onPriceChange(Number(e.target.value), priceRange[1])}
              className="w-full py-1.5 px-2 text-xs font-bold rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#081621] dark:text-white focus:outline-hidden focus:border-[#ef4a23]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Max (৳)</label>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => onPriceChange(priceRange[0], Number(e.target.value))}
              className="w-full py-1.5 px-2 text-xs font-bold rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#081621] dark:text-white focus:outline-hidden focus:border-[#ef4a23]"
            />
          </div>
        </div>
      </div>

      {/* 2. Availability Filter Box */}
      <div className="ws-box p-4 border border-[#eceff1] dark:border-[#1a2b3c] rounded-lg space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-black uppercase text-[#081621] dark:text-white tracking-wider flex items-center gap-1.5">
            <span>Availability</span>
            <span className="text-[10px] text-slate-400 font-normal">স্টক প্রাপ্যতা</span>
          </h4>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="flex items-center justify-between p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onToggleInStock(e.target.checked)}
                className="w-4 h-4 accent-[#ef4a23] rounded-xs cursor-pointer"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">In Stock (স্টকে আছে)</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {totalCount}
            </span>
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 accent-[#ef4a23] rounded-xs opacity-50 cursor-not-allowed"
              />
              <span className="font-medium text-slate-400">Pre Order (প্রি-অর্ডার)</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">১২</span>
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 accent-[#ef4a23] rounded-xs opacity-50 cursor-not-allowed"
              />
              <span className="font-medium text-slate-400">Up Coming (শীঘ্রই আসছে)</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">৮</span>
          </label>
        </div>
      </div>

      {/* 3. Category Filter Box */}
      <div className="ws-box p-4 border border-[#eceff1] dark:border-[#1a2b3c] rounded-lg space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-black uppercase text-[#081621] dark:text-white tracking-wider flex items-center gap-1.5">
            <span>Categories</span>
            <span className="text-[10px] text-slate-400 font-normal">ক্যাটাগরি</span>
          </h4>
        </div>

        <div className="space-y-1 text-xs">
          {CATEGORY_ITEMS.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            const count = categoryCounts[cat.id] || (cat.id === 'All' ? totalCount : 0);
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                  isSelected
                    ? 'bg-[#ef4a23] text-white font-bold shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[#ef4a23]'}`} />
                  <span className="truncate">{cat.nameBn}</span>
                </div>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 shrink-0 ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Brand Filter Box (Exact Star Tech Brand Filter with internal search) */}
      <div className="ws-box p-4 border border-[#eceff1] dark:border-[#1a2b3c] rounded-lg space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-black uppercase text-[#081621] dark:text-white tracking-wider flex items-center gap-1.5">
            <span>Brand</span>
            <span className="text-[10px] text-slate-400 font-normal">ব্র্যান্ড</span>
          </h4>
          {selectedBrands.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#ef4a23] text-white text-[10px] font-bold">
              {selectedBrands.length} টি সিলেক্টেড
            </span>
          )}
        </div>

        {/* Brand Search Input */}
        <div className="relative">
          <input
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Search Brand..."
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#081621] dark:text-white focus:outline-hidden focus:border-[#ef4a23]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
        </div>

        {/* Scrollable Brand List */}
        <div className="max-h-56 overflow-y-auto space-y-1 text-xs pr-1">
          {visibleBrands.length === 0 ? (
            <div className="text-[11px] text-slate-400 py-2 text-center">কোনো ব্র্যান্ড মেলেনি</div>
          ) : (
            visibleBrands.map(([brand, count]) => {
              const isChecked = selectedBrands.includes(brand);
              return (
                <label
                  key={brand}
                  className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-[#ef4a23] font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleBrand(brand)}
                      className="w-4 h-4 accent-[#ef4a23] rounded-xs cursor-pointer"
                    />
                    <span className="truncate">{brand}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 ml-1">
                    {count}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Compare Retailers (Multi-Store Filter - Our Special Feature) */}
      <div className="ws-box p-4 border border-[#eceff1] dark:border-[#1a2b3c] rounded-lg space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-black uppercase text-[#081621] dark:text-white tracking-wider flex items-center gap-1.5">
            <span>Compare Shops</span>
            <span className="text-[10px] text-slate-400 font-normal">দোকান ফিল্টার</span>
          </h4>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            ২২টি শপ
          </span>
        </div>

        {/* Shop Search Input */}
        <div className="relative">
          <input
            type="text"
            value={shopSearch}
            onChange={(e) => setShopSearch(e.target.value)}
            placeholder="Search Shop (Star Tech, Ryans...)"
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#081621] dark:text-white focus:outline-hidden focus:border-[#ef4a23]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
        </div>

        {/* Scrollable Shop List */}
        <div className="max-h-48 overflow-y-auto space-y-1 text-xs pr-1">
          {visibleShops.map((shop) => {
            const isChecked = selectedShopIds.includes(shop.id);
            return (
              <label
                key={shop.id}
                className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-[#ef4a23] font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleShopId(shop.id)}
                    className="w-4 h-4 accent-[#ef4a23] rounded-xs cursor-pointer"
                  />
                  <span className="truncate">{shop.name}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {shop.productCount.toLocaleString()}+
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Clear All Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onResetAll}
          className="w-full py-2.5 rounded-lg border-2 border-[#ef4a23] text-[#ef4a23] hover:bg-[#ef4a23] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>সকল ফিল্টার রিসেট করুন (Clear All)</span>
        </button>
      )}

    </aside>
  );
}
