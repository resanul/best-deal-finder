'use client';

/**
 * DamKoto BD ("Best Deal Finder") Product Filter Sidebar
 * Advanced interactive multi-faceted sidebar filters.
 * 
 * Location: src/components/ProductFilterSidebar.tsx
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
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Ban,
} from 'lucide-react';
import { getTrackedRetailers } from '@/lib/physicalDataService';
import { INITIAL_PHYSICAL_PRODUCTS } from '@/data/physicalGoodsData';
import ShopLogo from './ShopLogo';

export interface ProductFilterSidebarProps {
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

interface CategoryGroup {
  id: string;
  nameBn: string;
  nameEn: string;
  children: {
    id: string;
    nameBn: string;
    nameEn: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'components-group',
    nameBn: 'পিসি কম্পোনেন্টস ও হার্ডওয়্যার',
    nameEn: 'PC Components & Hardware',
    children: [
      { id: 'Processors', nameBn: 'প্রসেসর (Processor)', nameEn: 'Processors / CPUs', icon: Cpu },
      { id: 'Graphics Cards', nameBn: 'গ্রাফিক্স কার্ড (GPU)', nameEn: 'Graphics Cards', icon: Zap },
      { id: 'Motherboard', nameBn: 'মাদারবোর্ড (Motherboard)', nameEn: 'Motherboards', icon: HardDrive },
      { id: 'RAM', nameBn: 'র‍্যাম (Desktop RAM)', nameEn: 'RAM (Memory)', icon: HardDrive },
      { id: 'SSD', nameBn: 'এসএসডি ও স্টোরেজ', nameEn: 'SSD & Storage', icon: HardDrive },
      { id: 'PowerSupply', nameBn: 'পাওয়ার সাপ্লাই (PSU)', nameEn: 'Power Supply', icon: Zap },
    ],
  },
  {
    id: 'laptops-group',
    nameBn: 'কম্পিউটার ও ল্যাপটপ',
    nameEn: 'Computers & Laptops',
    children: [
      { id: 'Laptops', nameBn: 'ল্যাপটপ (Laptop)', nameEn: 'Laptops & Notebooks', icon: Laptop },
    ],
  },
  {
    id: 'displays-group',
    nameBn: 'ডিসপ্লে ও মনিটর',
    nameEn: 'Displays & Monitors',
    children: [
      { id: 'Monitors', nameBn: 'মনিটর (Monitor)', nameEn: 'Monitors', icon: Monitor },
    ],
  },
  {
    id: 'digital-group',
    nameBn: 'ডিজিটাল পণ্য ও সেবা',
    nameEn: 'Digital Goods & Subscriptions',
    children: [
      { id: 'Digital', nameBn: 'ডিজিটাল সাবস্ক্রিপশন', nameEn: 'Digital Subscriptions', icon: Tag },
    ],
  },
];

const PRICE_BRACKETS = [
  { label: '< ৳১০k', min: 0, max: 10000 },
  { label: '৳১০k - ৳২৫k', min: 10000, max: 25000 },
  { label: '৳২৫k - ৳৫০k', min: 25000, max: 50000 },
  { label: '৳৫০k - ৳১০০k', min: 50000, max: 100000 },
  { label: '৳১০০k+', min: 100000, max: 350000 },
];

export default function ProductFilterSidebar({
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
}: ProductFilterSidebarProps) {
  const [brandSearch, setBrandSearch] = useState('');
  const [shopSearch, setShopSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Tracked BD Retailers
  const allRetailers = useMemo(() => getTrackedRetailers(), []);

  // Compute exact product counts available per shop from INITIAL_PHYSICAL_PRODUCTS
  const shopProductCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    INITIAL_PHYSICAL_PRODUCTS.forEach((product) => {
      product.offers?.forEach((offer) => {
        if (offer.shopId) {
          counts[offer.shopId] = (counts[offer.shopId] || 0) + 1;
        }
      });
    });
    return counts;
  }, []);

  // Compute accurate stock metrics
  const stockStats = useMemo(() => {
    let inStock = 0;
    let outOfStock = 0;
    let preOrder = 0;

    INITIAL_PHYSICAL_PRODUCTS.forEach((p) => {
      if (p.inStockOfferCount > 0) {
        inStock++;
      } else {
        outOfStock++;
      }
      if (p.offers?.some((o) => o.availability?.toLowerCase().includes('pre-order') || o.availability?.toLowerCase().includes('upcoming'))) {
        preOrder++;
      }
    });

    return { inStock, outOfStock, preOrder };
  }, []);

  // Toggle group collapse
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Dual price slider handlers
  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), priceRange[1] - 1000);
    onPriceChange(Math.max(0, newMin), priceRange[1]);
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), priceRange[0] + 1000);
    onPriceChange(priceRange[0], Math.min(350000, newMax));
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
    selectedCategory !== 'All' && selectedCategory !== 'all' ||
    selectedBrands.length > 0 ||
    selectedShopIds.length > 0 ||
    inStockOnly ||
    priceRange[0] > 0 ||
    priceRange[1] < 350000;

  return (
    <aside className="w-full space-y-3.5 select-none text-slate-800 dark:text-slate-200">
      
      {/* 0. Filter Header Bar (with Reset Button) */}
      <div className="ws-box p-3.5 flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0F172A] shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider block leading-tight">
              ফিল্টার
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Smart Deal Filters</span>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetAll}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>সব মুছুন</span>
          </button>
        )}
      </div>

      {/* 1. Dynamic Dual Price Range Filter Box */}
      <div className="ws-box p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0F172A] space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
            <span>Price Range</span>
            <span className="text-[10px] text-slate-400 font-normal">মূল্য পরিসীমা</span>
          </h4>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            ৳{priceRange[0].toLocaleString()} - ৳{priceRange[1].toLocaleString()}
          </span>
        </div>

        {/* Dual Interactive Sliders */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>Min: ৳{priceRange[0].toLocaleString()}</span>
            <span>Max: ৳{priceRange[1].toLocaleString()}</span>
          </div>
          <div className="relative pt-1 pb-1">
            <input
              type="range"
              min={0}
              max={350000}
              step={1000}
              value={priceRange[0]}
              onChange={handleMinSliderChange}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
              title="Minimum Price"
            />
            <input
              type="range"
              min={0}
              max={350000}
              step={1000}
              value={priceRange[1]}
              onChange={handleMaxSliderChange}
              className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none mt-1"
              title="Maximum Price"
            />
          </div>
        </div>

        {/* Quick Price Bracket Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] text-slate-400 font-semibold block">দ্রুত বাজেট নির্বাচন:</span>
          <div className="flex flex-wrap gap-1">
            {PRICE_BRACKETS.map((bracket) => {
              const isActive = priceRange[0] === bracket.min && priceRange[1] === bracket.max;
              return (
                <button
                  key={bracket.label}
                  onClick={() => onPriceChange(bracket.min, bracket.max)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {bracket.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Min / Max BDT Inputs */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Min (৳)</label>
            <input
              type="number"
              min={0}
              max={350000}
              value={priceRange[0]}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                onPriceChange(val, Math.max(val, priceRange[1]));
              }}
              className="w-full py-1.5 px-2 text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Max (৳)</label>
            <input
              type="number"
              min={0}
              max={350000}
              value={priceRange[1]}
              onChange={(e) => {
                const val = Math.min(350000, Number(e.target.value));
                onPriceChange(Math.min(priceRange[0], val), val);
              }}
              className="w-full py-1.5 px-2 text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Stock Availability Filter Box */}
      <div className="ws-box p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0F172A] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
            <span>Availability</span>
            <span className="text-[10px] text-slate-400 font-normal">স্টক প্রাপ্যতা</span>
          </h4>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onToggleInStock(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded-sm cursor-pointer"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>In Stock (স্টকে আছে)</span>
              </span>
            </div>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
              {stockStats.inStock}
            </span>
          </label>

          <label className={`flex items-center justify-between p-1.5 rounded-lg ${stockStats.outOfStock === 0 ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer'} transition-colors`}>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={false}
                disabled={stockStats.outOfStock === 0}
                onChange={() => {}}
                className="w-4 h-4 accent-emerald-600 rounded-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Ban className="w-3.5 h-3.5 text-slate-400" />
                <span>Out of Stock (স্টক আউট)</span>
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {stockStats.outOfStock}
            </span>
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 accent-emerald-600 rounded-sm opacity-50 cursor-not-allowed"
              />
              <span className="font-medium text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Pre Order (প্রি-অর্ডার)</span>
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {stockStats.preOrder}
            </span>
          </label>
        </div>
      </div>

      {/* 3. Hierarchical Category Tree Navigation (2-Tier Collapsible) */}
      <div className="ws-box p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0F172A] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
            <span>Categories</span>
            <span className="text-[10px] text-slate-400 font-normal">ক্যাটাগরি ট্রি</span>
          </h4>
        </div>

        {/* All Products Item */}
        <button
          onClick={() => onSelectCategory('All')}
          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
            selectedCategory === 'All' || selectedCategory === 'all'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">সকল প্রোডাক্ট (All Products)</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 shrink-0 ${
              selectedCategory === 'All' || selectedCategory === 'all'
                ? 'bg-white/25 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* 2-Tier Collapsible Category Groups */}
        <div className="space-y-2 pt-1 text-xs">
          {CATEGORY_GROUPS.map((group) => {
            const isCollapsed = !!collapsedGroups[group.id];
            const groupTotalCount = group.children.reduce(
              (acc, child) => acc + (categoryCounts[child.id] || 0),
              0
            );

            return (
              <div key={group.id} className="border border-slate-100 dark:border-slate-800/80 rounded-lg overflow-hidden">
                {/* Group Header (Collapsible) */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between p-2 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors font-bold text-slate-900 dark:text-slate-200"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate text-xs">{group.nameBn}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 ml-1 shrink-0">
                    {groupTotalCount}
                  </span>
                </button>

                {/* Sub-categories */}
                {!isCollapsed && (
                  <div className="p-1 space-y-0.5 bg-white dark:bg-[#0F172A]">
                    {group.children.map((child) => {
                      const isSelected = selectedCategory.toLowerCase() === child.id.toLowerCase();
                      const count = categoryCounts[child.id] || 0;
                      const Icon = child.icon;

                      return (
                        <button
                          key={child.id}
                          onClick={() => onSelectCategory(child.id)}
                          className={`w-full flex items-center justify-between p-1.5 pl-4 rounded-md text-left transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold shadow-xs'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Icon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSelected ? 'text-white' : 'text-emerald-500'
                              }`}
                            />
                            <span className="truncate text-[11px]">{child.nameBn}</span>
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
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Brand Filter Box with Live Search & Dynamic Badges */}
      <div className="ws-box p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0F172A] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
            <span>Brand</span>
            <span className="text-[10px] text-slate-400 font-normal">ব্র্যান্ড</span>
          </h4>
          {selectedBrands.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
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
            placeholder="Search Brand (AMD, Intel, ASUS...)"
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
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
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleBrand(brand)}
                      className="w-4 h-4 accent-emerald-600 rounded-sm cursor-pointer"
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

      {/* 5. 22 Verified BD Retailers Filter with Shop Logos & Exact Matching Item Counts */}
      <div className="ws-box p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0F172A] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
            <span>Verified Retailers</span>
            <span className="text-[10px] text-slate-400 font-normal">২২টি শপ</span>
          </h4>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            {allRetailers.length} টি ভেরিফাইড
          </span>
        </div>

        {/* Shop Search Input */}
        <div className="relative">
          <input
            type="text"
            value={shopSearch}
            onChange={(e) => setShopSearch(e.target.value)}
            placeholder="Search Shop (Star Tech, Ryans, Techland...)"
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
        </div>

        {/* Scrollable Shop List with Real Shop Logos & Comparison Matches */}
        <div className="max-h-56 overflow-y-auto space-y-1 text-xs pr-1">
          {visibleShops.map((shop) => {
            const isChecked = selectedShopIds.includes(shop.id);
            const matchesCount = shopProductCounts[shop.id] || 0;

            return (
              <label
                key={shop.id}
                className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleShopId(shop.id)}
                    className="w-4 h-4 accent-emerald-600 rounded-sm cursor-pointer"
                  />
                  <div className="shrink-0">
                    <ShopLogo
                      shopId={shop.id}
                      shopName={shop.name}
                      size="xs"
                    />
                  </div>
                  <span className="truncate text-[11px]">{shop.name}</span>
                </div>
                <div className="text-right shrink-0 ml-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {matchesCount} টি ডিল
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Clear All Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onResetAll}
          className="w-full py-2.5 rounded-xl border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>সকল ফিল্টার রিসেট করুন (Clear All)</span>
        </button>
      )}

    </aside>
  );
}
