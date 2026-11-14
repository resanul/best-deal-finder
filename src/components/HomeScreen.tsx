'use client';

/**
 * Star Tech Authentic Catalog & Multi-Vendor Comparison Screen
 * 2-Column Star Tech Layout: Left Sidebar Filters + Right Product Grid
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
} from 'lucide-react';
import {
  getPhysicalProductGroups,
} from '@/lib/physicalDataService';
import { INITIAL_PHYSICAL_PRODUCTS } from '@/data/physicalGoodsData';
import { getProducts } from '@/lib/dataService';
import PhysicalProductCard from './PhysicalProductCard';
import ProductCard from './ProductCard';
import StarTechFilterSidebar from './StarTechFilterSidebar';

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
  } = useApp();

  // Local filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedShopIds, setSelectedShopIds] = useState<string[]>([]);
  const [techSortBy, setTechSortBy] = useState<'deals' | 'price-low' | 'price-high' | 'name'>('deals');
  const [itemsPerPage, setItemsPerPage] = useState<number>(24);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Dynamic Brand & Category counts computed across all physical products
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
        else if (name.includes('ssd') || name.includes('m.2') || name.includes('nvme')) counts.SSD++;
        else if (name.includes('motherboard') || name.includes('board')) counts.Motherboard++;
        else if (name.includes('power supply') || name.includes('psu') || name.includes('watt') || name.includes('80 plus')) counts.PowerSupply++;
      }
    });

    return counts;
  }, []);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    INITIAL_PHYSICAL_PRODUCTS.forEach((p) => {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });
    return counts;
  }, []);

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
        return language === 'bn' ? 'প্রসেসর / CPU প্রাইস ইন বাংলাদেশ' : 'Processor Price in Bangladesh';
      case 'graphics cards':
        return language === 'bn' ? 'গ্রাফিক্স কার্ড / GPU প্রাইস ইন বাংলাদেশ' : 'Graphics Card Price in Bangladesh';
      case 'motherboard':
        return language === 'bn' ? 'মাদারবোর্ড প্রাইস ইন বাংলাদেশ' : 'Motherboard Price in Bangladesh';
      case 'ram':
        return language === 'bn' ? 'ডেস্কটপ র‍্যাম প্রাইস ইন বাংলাদেশ' : 'Desktop RAM Price in Bangladesh';
      case 'ssd':
        return language === 'bn' ? 'এসএসডি ও স্টোরেজ প্রাইস ইন বাংলাদেশ' : 'SSD & Storage Price in Bangladesh';
      case 'powersupply':
        return language === 'bn' ? 'পাওয়ার সাপ্লাই (PSU) প্রাইস ইন বাংলাদেশ' : 'Power Supply Price in Bangladesh';
      case 'laptops':
        return language === 'bn' ? 'ল্যাপটপ প্রাইস ইন বাংলাদেশ' : 'Laptop Price in Bangladesh';
      case 'monitors':
        return language === 'bn' ? 'মনিটর প্রাইস ইন বাংলাদেশ' : 'Monitor Price in Bangladesh';
      case 'digital':
        return language === 'bn' ? 'ডিজিটাল সাবস্ক্রিপশন ও সফটওয়্যার কি' : 'Digital Subscriptions & Software Keys';
      default:
        return language === 'bn'
          ? 'কম্পিউটার ও টেক প্রোডাক্টস প্রাইস ইন বাংলাদেশ'
          : 'Computer & Tech Products in Bangladesh';
    }
  }, [selectedCategory, language]);

  return (
    <div className="w-full space-y-4">
      
      {/* 1. Star Tech Authentic Breadcrumbs Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 py-1 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedBrands([]);
            }}
            className="flex items-center gap-1 hover:text-[#ef4a23] transition-colors"
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">Component</span>

          {selectedCategory !== 'All' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-[#ef4a23] font-bold">{selectedCategory}</span>
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
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Star Tech সহ ২২টি শীর্ষ দোকানে লাইভ দাম যাচাইকৃত</span>
        </div>
      </div>

      {/* 2. Main 2-Column Layout (Left Sidebar + Right Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================================================
            LEFT COLUMN: STAR TECH FILTER SIDEBAR (lg:col-span-3)
           ========================================================================= */}
        <div className="hidden lg:block lg:col-span-3 sticky top-36 space-y-4">
          <StarTechFilterSidebar
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
          <div className="ws-box p-4 sm:p-5 border border-[#eceff1] dark:border-[#1a2b3c] rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-[#081621] dark:text-white tracking-tight">
                  {categoryTitle}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Star Tech, Ryans, Walton, Techland ও Samanta এর লাইভ দামের পার্থক্য ও সেরা অফার
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {totalResultsCount} টি প্রোডাক্ট
                </span>
                
                {/* Mobile Filter Toggle Button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ef4a23] text-white text-xs font-bold shadow-xs tap-bounce"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>ফিল্টার</span>
                </button>
              </div>
            </div>

            {/* Active Filter Chips */}
            {(selectedCategory !== 'All' || selectedBrands.length > 0 || selectedShopIds.length > 0 || searchQuery || inStockOnly) && (
              <div className="flex items-center gap-1.5 flex-wrap pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">সক্রিয় ফিল্টার:</span>

                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#ef4a23] font-bold border border-rose-200 dark:border-rose-900">
                    <span>ক্যাটাগরি: {selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('All')} className="hover:text-red-700">
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
                    <button onClick={() => handleToggleBrand(b)} className="hover:text-[#ef4a23]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200">
                    <span>স্টকে আছে</span>
                    <button onClick={() => setInStockOnly(false)} className="hover:text-emerald-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <span>&ldquo;{searchQuery}&rdquo;</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-[#ef4a23]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetAllFilters}
                  className="text-[11px] font-bold text-[#ef4a23] hover:underline ml-auto"
                >
                  সব মুছুন (Reset)
                </button>
              </div>
            )}
          </div>

          {/* Top Sort & Items-per-page Control Bar (Exact Star Tech styling) */}
          <div className="ws-box p-3 border border-[#eceff1] dark:border-[#1a2b3c] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
                  className="py-1 px-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
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
                  className="py-1 px-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#ef4a23]"
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
              PRODUCT GRID (Star Tech authentic 4-column layout)
             ========================================================================= */}
          {totalResultsCount === 0 ? (
            <div className="ws-box p-12 text-center border border-[#eceff1] dark:border-[#1a2b3c] rounded-lg">
              <Cpu className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#081621] dark:text-white">কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 mt-1">
                আপনার দেওয়া ফিল্টারে কোনো টেক পণ্য মেলেনি। ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।
              </p>
              <button
                onClick={handleResetAllFilters}
                className="mt-4 px-5 py-2 rounded-md bg-[#ef4a23] hover:bg-[#d63b17] text-white text-xs font-bold transition-all shadow-xs"
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
            <div className="ws-box p-4 border border-[#eceff1] dark:border-[#1a2b3c] rounded-lg flex items-center justify-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
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
                  className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${
                    currentPage === num
                      ? 'bg-[#ef4a23] text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                disabled={currentPage >= Math.ceil(totalResultsCount / itemsPerPage)}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Slide-Out Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in">
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-[#081621] p-4 overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-[#081621] dark:text-white uppercase tracking-wider">
                ফিল্টার মেন্যু
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <StarTechFilterSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setMobileFilterOpen(false);
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

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 rounded-lg bg-[#ef4a23] text-white text-xs font-bold sticky bottom-0 shadow-lg"
            >
              ফিল্টার বন্ধ করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
