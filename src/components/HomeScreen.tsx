'use client';

/**
 * Bangladeshi Multi-Vendor Price Comparison Platform
 * Dual-Engine Home Screen (Physical Tech & Electronics + Digital Subscriptions)
 * 
 * Location: src/components/HomeScreen.tsx
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Zap,
  Sparkles,
  ExternalLink,
  Store,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Cpu,
  Monitor,
  Laptop,
  Layers,
  HardDrive,
  PlusCircle,
  TrendingDown,
  Building2,
  Info,
  ShoppingBag,
} from 'lucide-react';
import { ProductCategory, SortOption } from '@/types/digitalGoods';
import {
  getProducts,
  getTrendingProducts,
  getVendors,
  getScamRegistry,
} from '@/lib/dataService';
import {
  getPhysicalProductGroups,
  getTrackedRetailers,
  getShopProducts,
} from '@/lib/physicalDataService';
import ProductCard from './ProductCard';
import PhysicalProductCard from './PhysicalProductCard';
import ShopLogo from './ShopLogo';
import { buildRetailerProductUrl } from '@/lib/shopUrlHelper';

interface DigitalCategoryPill {
  id: ProductCategory | 'All';
  name: string;
  nameBn: string;
  icon: string;
}

interface PhysicalCategoryPill {
  id: string;
  name: string;
  nameBn: string;
  icon: React.ReactNode;
}

const DIGITAL_CATEGORIES: DigitalCategoryPill[] = [
  { id: 'All', name: 'All Categories', nameBn: 'সকল প্রোডাক্ট', icon: '🌐' },
  { id: 'OTT', name: 'OTT & Streaming', nameBn: '🎬 ওটিটি ও স্ট্রিমিং', icon: '🎬' },
  { id: 'Gaming', name: 'Gaming Top-up', nameBn: '🎮 গেমিং টপ-আপ', icon: '🎮' },
  { id: 'Software', name: 'Software Keys', nameBn: '💻 সফটওয়্যার লাইসেন্স', icon: '💻' },
  { id: 'VPN', name: 'VPN & Privacy', nameBn: '🔒 ভিপিএন ও প্রাইভেসি', icon: '🔒' },
  { id: 'Gift Card', name: 'Gift Cards', nameBn: '🎁 গিফট কার্ড', icon: '🎁' },
  { id: 'AI Tools', name: 'AI & Productivity', nameBn: '🤖 এআই ও টুলস', icon: '🤖' },
];

const PHYSICAL_CATEGORIES: PhysicalCategoryPill[] = [
  { id: 'All', name: 'All Tech Products', nameBn: 'সকল টেক প্রোডাক্ট', icon: <Layers className="w-4 h-4" /> },
  { id: 'Processors', name: 'Processors / CPUs', nameBn: '💻 প্রসেসর (CPU)', icon: <Cpu className="w-4 h-4" /> },
  { id: 'Graphics Cards', name: 'Graphics Cards / GPUs', nameBn: '🎮 গ্রাফিক্স কার্ড (GPU)', icon: <Zap className="w-4 h-4" /> },
  { id: 'Laptops', name: 'Laptops & Notebooks', nameBn: '💼 ল্যাপটপ', icon: <Laptop className="w-4 h-4" /> },
  { id: 'Monitors', name: 'Gaming & Work Monitors', nameBn: '🖥️ মনিটর', icon: <Monitor className="w-4 h-4" /> },
  { id: 'Components', name: 'Components & Storage', nameBn: '⚡ কম্পোনেন্টস (RAM, SSD, MB, PSU)', icon: <HardDrive className="w-4 h-4" /> },
];

export default function HomeScreen() {
  const {
    catalogMode,
    setCatalogMode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    sortBy,
    setSortBy,
    inStockOnly,
    verifiedOnly,
    setFilterModalOpen,
    scamModalOpen,
    setScamModalOpen,
    setAdminShopModalOpen,
    resetFilters,
    setSelectedPhysicalProduct,
    setScreen,
    language,
    t,
  } = useApp();

  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedShopId, setSelectedShopId] = useState<string>('All');
  const [techSortBy, setTechSortBy] = useState<'deals' | 'price-low' | 'price-high' | 'name'>('deals');
  const [physicalSubTab, setPhysicalSubTab] = useState<'comparison' | 'by-shop'>('comparison');
  const [activeShopCatalogId, setActiveShopCatalogId] = useState<string>('shop-startech');

  // 1. Data Retrieval
  const trackedRetailers = useMemo(() => getTrackedRetailers(), []);
  const verifiedDigitalVendors = useMemo(() => getVendors(), []);
  const scamRegistry = useMemo(() => getScamRegistry(), []);
  const trendingDigitalProducts = useMemo(() => getTrendingProducts(8), []);

  // Per-Shop Catalog Query
  const activeShopData = useMemo(() => {
    return getShopProducts(activeShopCatalogId);
  }, [activeShopCatalogId]);

  // 2. Physical Tech Query
  const physicalProducts = useMemo(() => {
    return getPhysicalProductGroups({
      category: selectedCategory === 'all' || selectedCategory === 'All' ? undefined : selectedCategory,
      brand: selectedBrand === 'All' ? undefined : selectedBrand,
      shopId: selectedShopId === 'All' ? undefined : selectedShopId,
      search: searchQuery,
      sortBy: techSortBy,
    });
  }, [selectedCategory, selectedBrand, selectedShopId, searchQuery, techSortBy]);

  // 3. Digital Goods Query
  const currentDigitalCategory = useMemo(() => {
    if (!selectedCategory || selectedCategory.toLowerCase() === 'all') return 'All';
    const found = DIGITAL_CATEGORIES.find(c => c.id.toLowerCase() === selectedCategory.toLowerCase());
    return found ? found.id : 'All';
  }, [selectedCategory]);

  const digitalProducts = useMemo(() => {
    return getProducts({
      category: currentDigitalCategory,
      search: searchQuery,
      minPrice: priceRange ? priceRange[0] : undefined,
      maxPrice: priceRange ? priceRange[1] : undefined,
      inStockOnly: inStockOnly,
      sortBy: (sortBy as SortOption) || 'popular',
    });
  }, [currentDigitalCategory, searchQuery, priceRange, inStockOnly, sortBy]);

  return (
    <div className="space-y-8 sm:space-y-12">
      
      {/* =========================================================================
          TOP MASTER CATALOG MODE SWITCHER (Physical Tech vs Digital Goods)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 sm:p-2.5 rounded-3xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-inner">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
          
          {/* Main Part: Physical Tech Shops */}
          <button
            onClick={() => {
              setCatalogMode('physical');
              setSelectedCategory('All');
            }}
            className={`flex-1 py-3 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 transition-all duration-300 tap-bounce ${
              catalogMode === 'physical'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <div className="text-left leading-tight">
              <span className="block font-black">
                {language === 'bn' ? '💻 কম্পিউটার ও টেক শপস' : '💻 Tech & Electronics Shops'}
              </span>
              <span className="text-[10px] sm:text-[11px] opacity-80 font-medium hidden xs:block">
                Star Tech, Ryans, Walton, Techland, Global Brand...
              </span>
            </div>
            {catalogMode === 'physical' && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider ml-auto hidden md:inline">
                {language === 'bn' ? 'প্রধান' : 'Main'}
              </span>
            )}
          </button>

          {/* Secondary Part: Digital Products */}
          <button
            onClick={() => {
              setCatalogMode('digital');
              setSelectedCategory('All');
            }}
            className={`flex-1 py-3 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 transition-all duration-300 tap-bounce ${
              catalogMode === 'digital'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <div className="text-left leading-tight">
              <span className="block font-black">
                {language === 'bn' ? '🎬 ডিজিটাল সাবস্ক্রিপশন' : '🎬 Digital Subscriptions'}
              </span>
              <span className="text-[10px] sm:text-[11px] opacity-80 font-medium hidden xs:block">
                Netflix, Spotify, Windows 11, Canva, Free Fire...
              </span>
            </div>
          </button>

        </div>

        {/* Shop Admin & URL Registration Trigger */}
        <button
          onClick={() => setAdminShopModalOpen(true)}
          className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex items-center justify-center gap-2 transition-all shrink-0 tap-bounce"
        >
          <Building2 className="w-4 h-4" />
          <span>{language === 'bn' ? 'দোকান যুক্ত করুন / শপ ম্যানেজমেন্ট' : 'Add Shop / Registry'}</span>
        </button>
      </div>

      {/* =========================================================================
          PHYSICAL TECH CATALOG VIEW (The Main Part requested by User)
         ========================================================================= */}
      {catalogMode === 'physical' && (
        <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-300">
          
          {/* 1. Physical Tech Hero Banner */}
          <section className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-10 lg:p-12 text-white overflow-hidden shadow-2xl border border-slate-800/80">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>
                  {language === 'bn'
                    ? 'বাংলাদেশের বিশ্বস্ত কম্পিউটার শপগুলোর লাইভ দাম তুলনা'
                    : "Bangladesh's #1 Multi-Vendor Computer & Tech Price Comparison"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight sm:leading-tight tracking-tight">
                {language === 'bn'
                  ? 'স্টার টেক, রায়ান্স, ওয়ালটন ও টেকল্যান্ডের সেরা ডিল এক জায়গায়'
                  : 'Star Tech, Ryans, Walton, Techland & Samanta. Buy at Best Deal.'}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 mt-3 sm:mt-4 leading-relaxed max-w-2xl font-normal">
                {language === 'bn'
                  ? 'প্রসেসর, গ্রাফিক্স কার্ড, ল্যাপটপ, মনিটর ও র‍্যামের দাম দেশের শীর্ষ দোকানগুলোর সাথে লাইভ তুলনা করুন। দৈনিক স্বয়ংক্রিয় স্ক্র্যাপারের মাধ্যমে সঠিক দাম জানুন এবং সেরা সাশ্রয়ে কিনুন।'
                  : 'Compare real-time prices for CPUs, GPUs, Laptops, Monitors & SSDs across top Bangladeshi retailers. Find the lowest verified rate and direct checkout links instantly.'}
              </p>

              {/* Verified Retailers Quick Grid Header & Badges */}
              <div className="flex items-center justify-between mt-6 sm:mt-8 mb-3">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? '২২টি শীর্ষ বাংলাদেশি কম্পিউটার ও গ্যাজেট শপ' : '22 Verified Bangladeshi Tech Retailers'}</span>
                </div>
                <button
                  onClick={() => setPhysicalSubTab('by-shop')}
                  className="text-xs font-bold text-white hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>{language === 'bn' ? 'সকল ২২টি শপ ক্যাটালগ দেখুন' : 'Browse All 22 Shops'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {trackedRetailers.slice(0, 6).map((shop) => (
                  <div
                    key={shop.id}
                    onClick={() => {
                      setActiveShopCatalogId(shop.id);
                      setPhysicalSubTab('by-shop');
                    }}
                    className={`p-3 rounded-2xl border backdrop-blur-md cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                      activeShopCatalogId === shop.id && physicalSubTab === 'by-shop'
                        ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <ShopLogo
                      shopId={shop.id}
                      shopName={shop.name}
                      logoUrl={shop.logoUrl}
                      size="sm"
                    />
                    <span className="text-xs font-bold text-white truncate max-w-full">
                      {shop.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {shop.productCount.toLocaleString()}+ পণ্য
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-6 sm:mt-8">
                <button
                  onClick={() => setAdminShopModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 tap-bounce transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{language === 'bn' ? '🔗 নতুন শপ লিঙ্ক যুক্ত করুন' : 'Add Any Shop Website Link'}</span>
                </button>

                <button
                  onClick={() => setPhysicalSubTab('by-shop')}
                  className="px-5 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 border border-emerald-500/30 backdrop-blur-md transition-all tap-bounce"
                >
                  <Store className="w-4 h-4" />
                  <span>{language === 'bn' ? '🏪 দোকান অনুযায়ী পণ্য তালিকা' : 'Browse by Store'}</span>
                </button>

                <a
                  href="#tech-catalog"
                  onClick={() => setPhysicalSubTab('comparison')}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold flex items-center gap-2 border border-white/15 backdrop-blur-md transition-all tap-bounce"
                >
                  <span>{language === 'bn' ? '🔥 সেরা টেক ডিলসমূহ' : 'View Best Deals'}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

          {/* Sub-view Switcher: Comparison Matrix vs Per-Shop Catalog */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPhysicalSubTab('comparison')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all tap-bounce ${
                  physicalSubTab === 'comparison'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{language === 'bn' ? '📊 সকল পণ্যের দাম তুলনা' : 'Multi-Vendor Comparison'}</span>
              </button>

              <button
                onClick={() => setPhysicalSubTab('by-shop')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all tap-bounce ${
                  physicalSubTab === 'by-shop'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>{language === 'bn' ? '🏪 দোকান অনুযায়ী পণ্য তালিকা (২২টি শপ)' : 'Browse by Individual Shop (22 Shops)'}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black">
                  22
                </span>
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 hidden md:block">
              {physicalSubTab === 'comparison'
                ? (language === 'bn' ? 'সকল শীর্ষ দোকানের লাইভ দামের পার্থক্য দেখুন' : 'Compare live prices across all BD retailers')
                : (language === 'bn' ? 'যেকোনো নির্দিষ্ট দোকানের ক্যাটালগ দেখুন এবং অন্যান্য দোকানের সাথে তুলনা করুন' : 'Browse individual shop catalog & compare prices')}
            </div>
          </div>

          {/* =========================================================================
              VIEW 1: DEDICATED PER-SHOP PRODUCT LISTING
             ========================================================================= */}
          {physicalSubTab === 'by-shop' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Shop Selector Ribbon (22 Bangladeshi Shops) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>{language === 'bn' ? 'দোকান নির্বাচন করুন (২২টি শীর্ষ শপ)' : 'Select Shop (22 Verified BD Stores)'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {trackedRetailers.length} টি শপ তালিকাভুক্ত
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {trackedRetailers.map((shop) => {
                    const isSelected = activeShopCatalogId === shop.id;
                    return (
                      <button
                        key={shop.id}
                        onClick={() => setActiveShopCatalogId(shop.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all tap-bounce shrink-0 border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/40'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <ShopLogo
                          shopId={shop.id}
                          shopName={shop.name}
                          logoUrl={shop.logoUrl}
                          size="xs"
                        />
                        <span>{shop.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Shop Profile Banner */}
              {activeShopData.shop && (
                <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <ShopLogo
                      shopId={activeShopData.shop.id}
                      shopName={activeShopData.shop.name}
                      logoUrl={activeShopData.shop.logoUrl}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                          {activeShopData.shop.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {language === 'bn' ? 'যাচাইকৃত শপ' : 'Verified Retailer'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {activeShopData.totalProducts} টি পণ্য তালিকাভুক্ত • ডোমেইন: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeShopData.shop.domain}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <a
                      href={activeShopData.shop.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <span>{language === 'bn' ? 'মূল ওয়েবসাইট দেখুন' : 'Visit Official Store'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Products in this Shop */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-500" />
                    <span>
                      {activeShopData.shop?.name} - {language === 'bn' ? 'এর পণ্য তালিকা' : 'Product Catalog'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {activeShopData.items.length} টি
                    </span>
                  </h3>
                  <div className="text-xs text-slate-400 hidden sm:block">
                    {language === 'bn'
                      ? "পণ্যটির পাশে 'অন্যান্য দোকানে দাম তুলনা করুন' বাটনে ক্লিক করে সব দোকানের দাম দেখতে পারবেন"
                      : "Click 'Compare Across All Shops' on any item to view multi-vendor deals"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {activeShopData.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex flex-col bg-white dark:bg-[#0D1321] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      {/* Product Image */}
                      <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center p-4">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.canonicalName}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-black uppercase">
                          {item.product.brand}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex-1 flex flex-col p-4">
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                          {item.product.category}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug mb-3">
                          {item.product.canonicalName}
                        </h4>

                        {/* Store Price & Diff */}
                        <div className="mt-auto space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {activeShopData.shop?.name} - {language === 'bn' ? 'বর্তমান মূল্য' : 'Store Price'}
                            </div>
                            <div className="text-lg font-black text-slate-900 dark:text-white">
                              ৳{Math.round(item.shopOffer.priceBDT).toLocaleString()}
                            </div>
                          </div>

                          {/* Lowest Price or Difference Banner */}
                          {item.isCheapestInBD ? (
                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{language === 'bn' ? '🏆 দেশের সর্বনিম্ন রেট!' : 'Lowest Price in BD!'}</span>
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>
                                {language === 'bn'
                                  ? `অন্য দোকানে ৳${item.priceDiffFromLowest.toLocaleString()} কমে পাবেন`
                                  : `Save ৳${item.priceDiffFromLowest.toLocaleString()} at other store`}
                              </span>
                            </div>
                          )}

                          {/* Dual Action Buttons: Compare vs Buy Now */}
                          <div className="flex flex-col gap-2 pt-2">
                            <button
                              onClick={() => {
                                setSelectedPhysicalProduct(item.product);
                                setScreen('product-detail');
                              }}
                              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5 tap-bounce"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? '⚡ অন্যান্য দোকানে দাম তুলনা করুন' : 'Compare Across 22 Shops'}</span>
                            </button>

                            <a
                              href={buildRetailerProductUrl(
                                activeShopData.shop?.slug || 'generic',
                                item.product.model || item.product.canonicalName
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 tap-bounce"
                            >
                              <span>{language === 'bn' ? `${activeShopData.shop?.name} থেকে কিনুন` : 'Buy on Shop'}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: MULTI-VENDOR COMPARISON MATRIX
             ========================================================================= */}
          {physicalSubTab === 'comparison' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* 2. Physical Categories Filter */}
              <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'bn' ? 'হার্ডওয়্যার ক্যাটাগরি' : 'Browse Hardware Categories'}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {PHYSICAL_CATEGORIES.length - 1} টি
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {PHYSICAL_CATEGORIES.map((cat) => {
                const isActive = (selectedCategory || 'All').toLowerCase() === cat.id.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id === 'All' ? 'all' : cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 tap-bounce shrink-0 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/50'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {cat.icon}
                    <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Tech Catalog Grid & Filter Bar */}
          <section id="tech-catalog" className="space-y-6 pt-2">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'bn' ? 'লাইভ টেক প্রাইস কম্প্যারিজম' : 'Live Tech Price Comparison'}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    {physicalProducts.length} টি পণ্য তালিকাভুক্ত
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {searchQuery ? `"${searchQuery}" এর ফলাফল` : 'Star Tech, Ryans, Walton, Techland ও Samanta এর লাইভ দামের পার্থক্য'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                
                {/* Brand Filter */}
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="All">সকল ব্র্যান্ড (All Brands)</option>
                  <option value="AMD">AMD</option>
                  <option value="Intel">Intel</option>
                  <option value="Walton">Walton</option>
                  <option value="Zotac">Zotac</option>
                  <option value="Acer">Acer</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Gigabyte">Gigabyte</option>
                  <option value="Corsair">Corsair</option>
                  <option value="Kingston">Kingston</option>
                </select>

                {/* Sort Option */}
                <select
                  value={techSortBy}
                  onChange={(e) => setTechSortBy(e.target.value as 'deals' | 'price-low' | 'price-high' | 'name')}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="deals">সর্বোচ্চ ছাড় / সেরা ডিল (Best Deals)</option>
                  <option value="price-low">কম দাম আগে (Lowest Price)</option>
                  <option value="price-high">বেশি দাম আগে (Highest Price)</option>
                  <option value="name">নাম অনুযায়ী (Name)</option>
                </select>

                {(searchQuery || selectedCategory !== 'all' || selectedBrand !== 'All' || selectedShopId !== 'All') && (
                  <button
                    onClick={() => {
                      resetFilters();
                      setSelectedBrand('All');
                      setSelectedShopId('All');
                    }}
                    className="py-1.5 px-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
                  >
                    রিসেট
                  </button>
                )}
              </div>
            </div>

            {/* Product Cards Grid */}
            {physicalProducts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <Cpu className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">কোনো টেক প্রোডাক্ট মেলেনি</h3>
                <p className="text-xs text-slate-500 mt-1">ফিল্টার রিসেট করে আবার চেষ্টা করুন।</p>
                <button
                  onClick={() => {
                    resetFilters();
                    setSelectedBrand('All');
                    setSelectedShopId('All');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all"
                >
                  সকল পণ্য দেখুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {physicalProducts.map((product) => (
                  <PhysicalProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

          </section>
        </div>
      )}

          {/* 4. Dynamic Shop Onboarding Banner */}
          <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-900/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {language === 'bn'
                    ? 'আপনার পছন্দের কোনো দোকানের দাম তালিকায় দেখতে চান?'
                    : 'Want to track another Bangladeshi electronics shop?'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
                  {language === 'bn'
                    ? 'যেকোনো দোকানের ওয়েবসাইট লিঙ্ক দিন (উদাঃ waltonbd.com বা যেকোনো কম্পিউটার শপ)। আমাদের স্বয়ংক্রিয় স্ক্র্যাপার স্বয়ংক্রিয়ভাবে CMS শনাক্ত করবে এবং নিয়মিত দাম আপডেট রাখবে।'
                    : 'Submit any retail website URL. Our background engine detects the store CMS (WooCommerce, Shopify, OpenCart) and tracks pricing automatically.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setAdminShopModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shrink-0 tap-bounce shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'bn' ? 'শপ লিঙ্ক যুক্ত করুন' : 'Add Shop URL Now'}</span>
            </button>
          </section>

        </div>
      )}

      {/* =========================================================================
          DIGITAL SUBSCRIPTIONS CATALOG VIEW (Netflix, Spotify, Windows, etc.)
         ========================================================================= */}
      {catalogMode === 'digital' && (
        <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-300">
          
          {/* Digital Hero Banner */}
          <section className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-6 sm:p-10 lg:p-12 text-white overflow-hidden shadow-2xl border border-indigo-900/40">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{language === 'bn' ? 'ডিজিটাল পণ্য ও ওটিটি সাবস্ক্রিপশন' : "Digital Subscriptions & Game Top-ups"}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                {language === 'bn'
                  ? 'সেরা মূল্যে ডিজিটাল পণ্য কিনুন, প্রতারণা এড়ান'
                  : 'Compare Prices Across Verified Digital BD Stores.'}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed max-w-2xl font-normal">
                {language === 'bn'
                  ? 'Netflix, Spotify, Free Fire, Windows 11 ও Canva Pro সাবস্ক্রিপশন ১৭টি ভেরিফাইড বাংলাদেশি স্টোর থেকে তুলনা করুন। ইনস্ট্যান্ট bKash/Nagad ডেলিভারি।'
                  : 'Compare OTT accounts, gaming top-ups, software keys & VPNs across 17+ verified stores with instant MFS delivery.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-6 sm:mt-8">
                <button
                  onClick={() => setScamModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 tap-bounce transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{language === 'bn' ? '🛡️ ফেসবুক স্ক্যাম চেকার (Scam Shield)' : 'Check Suspicious Stores'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Digital Categories */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {DIGITAL_CATEGORIES.map((cat) => {
                const isActive = currentDigitalCategory.toLowerCase() === cat.id.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id === 'All' ? 'all' : cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 tap-bounce shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/50'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Digital Products Grid */}
          <section className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {digitalProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

        </div>
      )}

    </div>
  );
}
