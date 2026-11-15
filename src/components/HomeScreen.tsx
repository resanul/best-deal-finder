'use client';

/**
 * DamKoto BD ("Best Deal Finder") Catalog & Multi-Vendor Comparison Screen
 * 2-Column Responsive Layout: Left Advanced Filters + Right Multi-Store Product Grid
 * 
 * Location: src/components/HomeScreen.tsx
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  SlidersHorizontal,
  ChevronRight,
  Home as HomeIcon,
  CheckCircle2,
  Cpu,
  X,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Store,
} from 'lucide-react';
import {
  getPhysicalProductGroups,
  getTrackedRetailers,
} from '@/lib/physicalDataService';
import { INITIAL_PHYSICAL_PRODUCTS } from '@/data/physicalGoodsData';
import { getProducts } from '@/lib/dataService';
import PhysicalProductCard from './PhysicalProductCard';
import ProductCard from './ProductCard';
import ProductFilterSidebar from './ProductFilterSidebar';

export default function HomeScreen() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    inStockOnly,
    setInStockOnly,
    resetFilters,
    language,
    filterModalOpen,
    setFilterModalOpen,
  } = useApp();

  // Local filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedShopIds, setSelectedShopIds] = useState<string[]>([]);
  const [techSortBy, setTechSortBy] = useState<'deals' | 'price-low' | 'price-high' | 'name'>('deals');
  const [itemsPerPage, setItemsPerPage] = useState<number>(24);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Retailer metadata lookup
  const allRetailers = useMemo(() => getTrackedRetailers(), []);
  const shopNameMap = useMemo(() => new Map(allRetailers.map((s) => [s.id, s.name])), [allRetailers]);

  // Unified mobile filter drawer visibility
  const isMobileDrawerOpen = mobileFilterOpen || (filterModalOpen && selectedCategory.toLowerCase() !== 'digital');
  const handleCloseMobileDrawer = () => {
    setMobileFilterOpen(false);
    setFilterModalOpen(false);
  };

  // Dynamic Brand & Category counts computed across physical products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: INITIAL_PHYSICAL_PRODUCTS.length,
      Processors: 0,
      'Graphics Cards': 0,
      Motherboard: 0,
      RAM: 0,
      SSD: 0,
      PowerSupply: 0,
      Laptops: 0,
      Monitors: 0,
      Digital: 12,
    };

    INITIAL_PHYSICAL_PRODUCTS.forEach((p) => {
      const cat = p.category;
      const name = p.canonicalName.toLowerCase();
      if (cat === 'Processors') counts.Processors++;
      else if (cat === 'Graphics Cards') counts['Graphics Cards']++;
      else if (cat === 'Laptops') counts.Laptops++;
      else if (cat === 'Monitors') counts.Monitors++;
      else if (cat === 'Components') {
        if (name.includes('ram')) counts.RAM++;
        else if ((name.includes('ssd') || name.includes('m.2') || name.includes('nvme')) && !name.includes('motherboard') && !name.includes('board')) counts.SSD++;
        else if (name.includes('motherboard') || name.includes('board')) counts.Motherboard++;
        else if (name.includes('power supply') || name.includes('psu') || name.includes('watt') || name.includes('80 plus')) counts.PowerSupply++;
      }
    });

    return counts;
  }, []);

  // Context-aware dynamic brand counts based on active category
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const catLower = selectedCategory.toLowerCase();

    INITIAL_PHYSICAL_PRODUCTS.forEach((p) => {
      let matchesCat = true;
      if (catLower !== 'all') {
        const pCat = p.category.toLowerCase();
        const pName = p.canonicalName.toLowerCase();
        if (catLower === 'processors') matchesCat = pCat === 'processors';
        else if (catLower === 'graphics cards') matchesCat = pCat === 'graphics cards';
        else if (catLower === 'laptops') matchesCat = pCat === 'laptops';
        else if (catLower === 'monitors') matchesCat = pCat === 'monitors';
        else if (catLower === 'ram') matchesCat = pCat === 'components' && pName.includes('ram');
        else if (catLower === 'ssd') matchesCat = pCat === 'components' && !pName.includes('motherboard') && !pName.includes('board') && (pName.includes('ssd') || pName.includes('m.2') || pName.includes('nvme'));
        else if (catLower === 'motherboard') matchesCat = pCat === 'components' && (pName.includes('motherboard') || pName.includes('board'));
        else if (catLower === 'powersupply') matchesCat = pCat === 'components' && (pName.includes('power supply') || pName.includes('psu') || pName.includes('watt'));
        else matchesCat = pCat === catLower;
      }

      if (matchesCat && p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });

    return counts;
  }, [selectedCategory]);

  // Filtered physical products query
  const filteredPhysicalProducts = useMemo(() => {
    return getPhysicalProductGroups({
      category: selectedCategory === 'All' || selectedCategory === 'all' ? undefined : selectedCategory,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
      shopIds: selectedShopIds.length > 0 ? selectedShopIds : undefined,
      search: searchQuery,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 350000 ? priceRange[1] : undefined,
      inStockOnly: inStockOnly,
      sortBy: techSortBy,
    });
  }, [selectedCategory, selectedBrands, selectedShopIds, searchQuery, priceRange, inStockOnly, techSortBy]);

  // Digital products query (when Digital category is selected)
  const isDigitalMode = selectedCategory.toLowerCase() === 'digital';
  const digitalProducts = useMemo(() => {
    if (!isDigitalMode) return [];
    return getProducts({
      search: searchQuery,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 350000 ? priceRange[1] : undefined,
      inStockOnly: inStockOnly,
    });
  }, [isDigitalMode, searchQuery, priceRange, inStockOnly]);

  const totalResultsCount = isDigitalMode
    ? digitalProducts.length
    : filteredPhysicalProducts.length;

  // Safe pagination calculation without cascading render side-effects
  const totalPages = Math.max(1, Math.ceil(totalResultsCount / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  // Pagination slice
  const displayedPhysicalProducts = useMemo(() => {
    if (itemsPerPage >= 999) return filteredPhysicalProducts;
    const startIndex = (safePage - 1) * itemsPerPage;
    return filteredPhysicalProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPhysicalProducts, safePage, itemsPerPage]);

  // Handler functions
  const handleToggleBrand = (brand: string) => {
    setCurrentPage(1);
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleToggleShopId = (shopId: string) => {
    setCurrentPage(1);
    setSelectedShopIds((prev) =>
      prev.includes(shopId) ? prev.filter((s) => s !== shopId) : [...prev, shopId]
    );
  };

  const handleResetAllFilters = () => {
    setCurrentPage(1);
    resetFilters();
    setSelectedBrands([]);
    setSelectedShopIds([]);
    setSelectedCategory('All');
    setPriceRange([0, 350000]);
    setInStockOnly(false);
  };

  // Human-friendly category title
  const categoryTitle = useMemo(() => {
    switch (selectedCategory.toLowerCase()) {
      case 'processors':
        return language === 'bn' ? 'প্রসেসর / CPU লাইভ প্রাইস কম্প্যারিজম' : 'Processor Live Price Comparison';
      case 'graphics cards':
        return language === 'bn' ? 'গ্রাফিক্স কার্ড / GPU লাইভ প্রাইস কম্প্যারিজম' : 'Graphics Card Live Price Comparison';
      case 'motherboard':
        return language === 'bn' ? 'মাদারবোর্ড লাইভ প্রাইস কম্প্যারিজম' : 'Motherboard Live Price Comparison';
      case 'ram':
        return language === 'bn' ? 'ডেস্কটপ র‍্যাম লাইভ প্রাইস কম্প্যারিজম' : 'Desktop RAM Live Price Comparison';
      case 'ssd':
        return language === 'bn' ? 'এসএসডি ও স্টোরেজ লাইভ প্রাইস কম্প্যারিজম' : 'SSD & Storage Live Price Comparison';
      case 'powersupply':
        return language === 'bn' ? 'পাওয়ার সাপ্লাই (PSU) লাইভ প্রাইস কম্প্যারিজম' : 'Power Supply Live Price Comparison';
      case 'laptops':
        return language === 'bn' ? 'ল্যাপটপ লাইভ প্রাইস কম্প্যারিজম' : 'Laptop Live Price Comparison';
      case 'monitors':
        return language === 'bn' ? 'মনিটর লাইভ প্রাইস কম্প্যারিজম' : 'Monitor Live Price Comparison';
      case 'digital':
        return language === 'bn' ? 'ডিজিটাল সাবস্ক্রিপশন ও সফটওয়্যার কি' : 'Digital Subscriptions & Software Keys';
      default:
        return language === 'bn'
          ? 'কম্পিউটার ও টেক প্রোডাক্টস লাইভ প্রাইস কম্প্যারিজম'
          : 'Computer & Tech Products in Bangladesh';
    }
  }, [selectedCategory, language]);

  return (
    <div className="w-full space-y-5">
      
      {/* 1. DamKoto BD Hero & Live Comparison Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1528] to-emerald-950 p-5 sm:p-6 border border-emerald-500/20 shadow-xl text-white">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'bn' ? 'দামকত বিডি — স্বাধীন ও নিরপেক্ষ টেক প্রাইস ট্র্যাকার' : 'DamKoto BD — Unbiased Live Price Comparison'}</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            {language === 'bn'
              ? '২২+ শীর্ষ দোকানে লাইভ দাম যাচাই করে সবচেয়ে সাশ্রয়ী মূল্যে কিনুন'
              : 'Compare Live Prices Across 22+ Verified BD Tech Stores & Save'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {language === 'bn'
              ? 'Star Tech, Ryans, Techland, Walton, Samanta সহ শীর্ষস্থানীয় বাংলাদেশি শপগুলোর রিয়েল-টাইম অফার এবং ০% স্ক্যাম গ্যারান্টি।'
              : 'Unbiased price comparison covering Star Tech, Ryans, Techland, Walton, Samanta and all verified BD tech retailers.'}
          </p>

          {/* Value Props Row */}
          <div className="pt-1 flex items-center gap-3 sm:gap-6 flex-wrap text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>২২+ ভেরিফাইড শপ</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-teal-300">
              <TrendingDown className="w-4 h-4 text-teal-300" />
              <span>সর্বনিম্ন মূল্য গ্যারান্টি</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>জিরো স্ক্যাম প্রোটেকশন</span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
      </div>

      {/* 2. DamKoto Breadcrumbs Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 py-1 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedBrands([]);
              setSelectedShopIds([]);
            }}
            className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">Catalog</span>

          {selectedCategory !== 'All' && selectedCategory !== 'all' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedCategory}</span>
            </>
          )}

          {searchQuery && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-200 font-semibold italic">&ldquo;{searchQuery}&rdquo;</span>
            </>
          )}
        </div>

        {/* 22 Verified BD Shops Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>২২টি শীর্ষ দোকানে লাইভ দাম যাচাইকৃত</span>
        </div>
      </div>

      {/* 3. Main 2-Column Layout (Left Sidebar + Right Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================================================
            LEFT COLUMN: DAMKOTO BD FILTER SIDEBAR (lg:col-span-3)
           ========================================================================= */}
        <div className="hidden lg:block lg:col-span-3 sticky top-36 space-y-4">
          <ProductFilterSidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedBrands={selectedBrands}
            onToggleBrand={handleToggleBrand}
            priceRange={priceRange}
            onPriceChange={(min, max) => setPriceRange([min, max])}
            inStockOnly={inStockOnly}
            onToggleInStock={setInStockOnly}
            selectedShopIds={selectedShopIds}
            onToggleShopId={handleToggleShopId}
            onResetAll={handleResetAllFilters}
            categoryCounts={categoryCounts}
            brandCounts={brandCounts}
            totalCount={INITIAL_PHYSICAL_PRODUCTS.length}
          />
        </div>

        {/* =========================================================================
            RIGHT COLUMN: PRODUCT CATALOG & SORT TOOLBAR (lg:col-span-9)
           ========================================================================= */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Top Header & Item Count Banner */}
          <div className="ws-box p-4 sm:p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0F172A] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {categoryTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Star Tech, Ryans, Techland, Walton, Samanta সহ ২২+ দোকানে লাইভ দামের পার্থক্য ও সেরা অফার
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {totalResultsCount} টি প্রোডাক্ট
                </span>
                
                {/* Mobile Filter Toggle Button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs tap-bounce transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>ফিল্টার</span>
                </button>
              </div>
            </div>

            {/* Active Filter Chips */}
            {(selectedCategory !== 'All' && selectedCategory !== 'all' || selectedBrands.length > 0 || selectedShopIds.length > 0 || searchQuery || inStockOnly || priceRange[0] > 0 || priceRange[1] < 350000) && (
              <div className="flex items-center gap-1.5 flex-wrap pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">সক্রিয় ফিল্টার:</span>

                {selectedCategory !== 'All' && selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                    <span>ক্যাটাগরি: {selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('All')} className="hover:text-emerald-800 dark:hover:text-emerald-200">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedBrands.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700"
                  >
                    <span>{b}</span>
                    <button onClick={() => handleToggleBrand(b)} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {selectedShopIds.map((shopId) => {
                  const shopName = shopNameMap.get(shopId) || shopId;
                  return (
                    <span
                      key={shopId}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800"
                    >
                      <span>শপ: {shopName}</span>
                      <button onClick={() => handleToggleShopId(shopId)} className="hover:text-emerald-800 dark:hover:text-emerald-200">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                    <span>স্টকে আছে</span>
                    <button onClick={() => setInStockOnly(false)} className="hover:text-emerald-800 dark:hover:text-emerald-200">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {(priceRange[0] > 0 || priceRange[1] < 350000) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 font-bold border border-teal-200 dark:border-teal-800">
                    <span>বাজেট: ৳{priceRange[0].toLocaleString()} - ৳{priceRange[1].toLocaleString()}</span>
                    <button onClick={() => setPriceRange([0, 350000])} className="hover:text-teal-800 dark:hover:text-teal-200">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <span>&ldquo;{searchQuery}&rdquo;</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetAllFilters}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline ml-auto"
                >
                  সব মুছুন (Reset)
                </button>
              </div>
            )}
          </div>

          {/* Top Sort & Items-per-page Control Bar */}
          <div className="ws-box p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0F172A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 font-medium">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, totalResultsCount)} of {totalResultsCount} items
            </div>

            <div className="flex items-center gap-3 justify-end flex-wrap">
              {/* Show items per page */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={999}>All ({totalResultsCount})</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Sort By:</span>
                <select
                  value={techSortBy}
                  onChange={(e) => setTechSortBy(e.target.value as 'deals' | 'price-low' | 'price-high' | 'name')}
                  className="py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="deals">সর্বোচ্চ ছাড় / সেরা ডিল (Best Deals)</option>
                  <option value="price-low">দাম: কম থেকে বেশি (Price Low &gt; High)</option>
                  <option value="price-high">দাম: বেশি থেকে কম (Price High &gt; Low)</option>
                  <option value="name">নাম অনুযায়ী (Name A &gt; Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* =========================================================================
              PRODUCT GRID (DamKoto BD 4-Column Responsive Grid)
             ========================================================================= */}
          {totalResultsCount === 0 ? (
            <div className="ws-box p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0F172A] shadow-xs">
              <Cpu className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 mt-1">
                আপনার দেওয়া ফিল্টারে কোনো টেক পণ্য মেলেনি। ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।
              </p>
              <button
                onClick={handleResetAllFilters}
                className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                সকল ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : isDigitalMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {digitalProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedPhysicalProducts.map((product) => (
                <PhysicalProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalResultsCount > itemsPerPage && itemsPerPage < 999 && (
            <div className="ws-box p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0F172A] flex items-center justify-center gap-2 shadow-xs">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Previous
              </button>

              {Array.from(
                { length: Math.ceil(totalResultsCount / itemsPerPage) },
                (_, i) => i + 1
              ).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === num
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                disabled={currentPage >= Math.ceil(totalResultsCount / itemsPerPage)}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Unified Responsive Slide-Out Mobile Filter Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in">
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-[#090D16] p-4 overflow-y-auto space-y-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  ফিল্টার মেন্যু
                </h3>
              </div>
              <button
                onClick={handleCloseMobileDrawer}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ProductFilterSidebar
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  handleCloseMobileDrawer();
                }}
                selectedBrands={selectedBrands}
                onToggleBrand={handleToggleBrand}
                priceRange={priceRange}
                onPriceChange={(min, max) => setPriceRange([min, max])}
                inStockOnly={inStockOnly}
                onToggleInStock={setInStockOnly}
                selectedShopIds={selectedShopIds}
                onToggleShopId={handleToggleShopId}
                onResetAll={handleResetAllFilters}
                categoryCounts={categoryCounts}
                brandCounts={brandCounts}
                totalCount={INITIAL_PHYSICAL_PRODUCTS.length}
              />
            </div>

            <button
              onClick={handleCloseMobileDrawer}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold sticky bottom-0 shadow-lg transition-colors"
            >
              ফিল্টার প্রয়োগ করুন ({totalResultsCount} টি রেজাল্ট)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
