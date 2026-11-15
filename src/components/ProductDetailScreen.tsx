'use client';

/**
 * Bangladeshi Multi-Vendor Price Comparison Platform
 * Dual-Engine Product Detail & Offer Comparison Screen
 * 
 * Location: src/components/ProductDetailScreen.tsx
 * Supports:
 * - Physical Tech & Electronics (Star Tech, Ryans, Techland, Walton, Global Brand, Samanta)
 * - Digital Goods & Subscriptions (Netflix, Spotify, Windows 11, Canva...)
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  getProductComparison,
  generateAffiliateCheckoutUrl,
} from '@/lib/dataService';
import { buildRetailerProductUrl } from '@/lib/shopUrlHelper';
import ShopLogo from './ShopLogo';
import {
  ProductComparisonDetail,
  PaymentMethod,
} from '@/types/digitalGoods';
import {
  ArrowLeft,
  Heart,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Clock,
  Trophy,
  Sparkles,
  Info,
  Check,
  Tag,
  Star,
  Store,
  ChevronRight,
  TrendingDown,
  Layers,
  Cpu,
  ShoppingBag,
} from 'lucide-react';

export default function ProductDetailScreen() {
  const {
    catalogMode,
    selectedPhysicalProduct,
    selectedProduct,
    selectedProductSlug,
    navigateBack,
    setScreen,
    toggleWishlist,
    isWishlisted,
    showToast,
    language,
    t,
  } = useApp();

  const isPhysical = catalogMode === 'physical' && selectedPhysicalProduct;

  // Digital comparison query
  const productSlug = useMemo(() => {
    if (selectedProductSlug) return selectedProductSlug;
    if (selectedProduct) {
      if ('slug' in selectedProduct && selectedProduct.slug) {
        return selectedProduct.slug;
      }
      return selectedProduct.id || 'netflix-premium-4k';
    }
    return 'netflix-premium-4k';
  }, [selectedProductSlug, selectedProduct]);

  const digitalComparison: ProductComparisonDetail | null = useMemo(() => {
    return getProductComparison(productSlug) || getProductComparison('netflix-premium-4k');
  }, [productSlug]);

  // Digital filter & sort state
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'trust-desc' | 'speed'>('price-asc');

  // =========================================================================
  // VIEW A: PHYSICAL TECH PRODUCT COMPARISON DETAIL
  // =========================================================================
  if (isPhysical && selectedPhysicalProduct) {
    const product = selectedPhysicalProduct;
    const offers = product.offers || [];
    const bestOffer = offers[0] || null;

    const handleSharePhysical = () => {
      if (typeof window !== 'undefined' && navigator.share) {
        navigator.share({
          title: product.canonicalName,
          text: `${product.canonicalName} সর্বনিম্ন ৳${Math.round(product.minPrice).toLocaleString()} টাকায় কিনুন DamKoto BD থেকে!`,
          url: window.location.href,
        }).catch(() => {});
      } else {
        showToast('প্রোডাক্ট কম্প্যারিজম লিংক কপি করা হয়েছে!');
      }
    };

    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        
        {/* 1. Breadcrumb Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={navigateBack}
              className="flex items-center gap-1 font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors tap-bounce"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'bn' ? 'টেক ক্যাটালগে ফিরুন' : 'Back to Tech Catalog'}</span>
            </button>
            <span>/</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{product.category}</span>
            <span>/</span>
            <span className="truncate max-w-[200px] sm:max-w-md">{product.canonicalName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSharePhysical}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors tap-bounce"
              title="শেয়ার করুন"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Hero Overview & Live Price Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
          
          {/* Left Column: Image & Quick Specs (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative w-full h-72 sm:h-80 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-6 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80'}
                alt={product.canonicalName}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80';
                }}
              />

              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                {product.brand}
              </span>

              {product.inStockOfferCount > 0 ? (
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'স্টকে আছে' : 'In Stock'}</span>
                </span>
              ) : null}
            </div>

            {/* Hardware Specifications Card */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span>{language === 'bn' ? 'টেকনিক্যাল স্পেসিফিকেশন' : 'Key Specifications'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block font-medium uppercase">{key}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Best Deal (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase">
                  {product.category}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-emerald-500" />
                  {offers.length} {language === 'bn' ? 'টি বিশ্বস্ত দোকানে পাওয়া যাচ্ছে' : 'Verified BD Shops Selling'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {product.canonicalName}
              </h1>

              {/* Price Spread & Best Deal Highlight Banner */}
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/10 border border-emerald-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {language === 'bn' ? 'সর্বনিম্ন যাচাইকৃত মূল্য (Best Deal)' : 'Lowest Verified Price'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                        ৳{Math.round(product.minPrice).toLocaleString()}
                      </span>
                      {product.maxPrice > product.minPrice && (
                        <span className="text-sm font-semibold text-slate-400 line-through">
                          ৳{Math.round(product.maxPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {language === 'bn' ? 'দোকান:' : 'At'}{' '}
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">
                        {product.bestDealShopName}
                      </strong>
                    </p>
                  </div>

                  {product.savingsPercent && product.savingsPercent > 0 ? (
                    <div className="px-4 py-3 rounded-xl bg-emerald-500 text-white text-center shadow-lg shadow-emerald-500/20 shrink-0">
                      <div className="text-lg font-black leading-none">
                        ৳{product.priceSpreadBDT?.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-90 mt-0.5">
                        {language === 'bn' ? 'পর্যন্ত সাশ্রয়' : 'Max Savings'} ({product.savingsPercent}%)
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

            </div>

            {/* Direct Best Deal CTA */}
            {bestOffer && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <a
                  href={buildRetailerProductUrl(
                    bestOffer.shopId.replace('shop-', ''),
                    product.canonicalName,
                    bestOffer.productUrl,
                    product.brand,
                    product.model
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 tap-bounce transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {language === 'bn'
                      ? `${bestOffer.shopName} থেকে কিনুন (৳${Math.round(bestOffer.priceBDT).toLocaleString()})`
                      : `Buy on ${bestOffer.shopName} (৳${Math.round(bestOffer.priceBDT).toLocaleString()})`}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 3. Multi-Vendor Price Comparison Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-500" />
                <span>{language === 'bn' ? 'সকল দোকানের লাইভ দামের তালিকা' : 'All Retailers Deal Comparison Matrix'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'সবচেয়ে কম দাম থেকে বেশি দাম ক্রমানুসারে সাজানো হয়েছে'
                  : 'Sorted ascending by price (Lowest price deal ranked #1)'}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {offers.length} {language === 'bn' ? 'টি শপ' : 'Stores'}
            </span>
          </div>

          <div className="space-y-3">
            {offers.map((offer, index) => {
              const isCheapest = index === 0;
              const priceDiff = offer.priceBDT - product.minPrice;

              return (
                <div
                  key={offer.id || offer.shopId}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCheapest
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400/80 dark:border-emerald-700/60 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Shop Info */}
                  <div className="flex items-center gap-3.5">
                    <ShopLogo
                      shopId={offer.shopId}
                      shopName={offer.shopName}
                      logoUrl={offer.shopLogo}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {offer.shopName}
                        </h4>
                        {isCheapest && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            {language === 'bn' ? 'সেরা ডিল' : 'Best Price'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-medium">{offer.warranty || 'Official Warranty'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          {offer.availability || 'In Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        ৳{Math.round(offer.priceBDT).toLocaleString()}
                      </div>
                      <div className="text-[11px] font-semibold">
                        {isCheapest ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {language === 'bn' ? '✓ সর্বনিম্ন রেট' : 'Lowest Price!'}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            +{priceDiff.toLocaleString()} BDT
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={buildRetailerProductUrl(
                        offer.shopId.replace('shop-', ''),
                        product.canonicalName,
                        offer.productUrl,
                        product.brand,
                        product.model
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all tap-bounce ${
                        isCheapest
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span>{language === 'bn' ? 'দোকানে কিনুন' : 'Buy on Shop'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    );
  }

  // =========================================================================
  // VIEW B: DIGITAL GOODS COMPARISON DETAIL (Netflix, Spotify, Windows, etc.)
  // =========================================================================
  if (!digitalComparison) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
        <button
          onClick={navigateBack}
          className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
        >
          ক্যাটালগে ফিরে যান
        </button>
      </div>
    );
  }

  const { product, deals, cheapestDeal, priceSpreadBDT, totalOffers } = digitalComparison;
  const wishlisted = isWishlisted(product.id);
  const availablePlans = Array.from(new Set(deals.map((d) => d.planName)));

  const displayedDeals = deals
    .filter((d) => (selectedPlan === 'all' ? true : d.planName === selectedPlan))
    .sort((a, b) => {
      if (sortBy === 'trust-desc') {
        return b.vendor.trustScore - a.vendor.trustScore || a.priceBDT - b.priceBDT;
      }
      return a.priceBDT - b.priceBDT;
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={navigateBack}
            className="flex items-center gap-1 font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors tap-bounce"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ক্যাটালগে ফিরুন</span>
          </button>
          <span>/</span>
          <span className="font-semibold text-emerald-600">{product.category}</span>
          <span>/</span>
          <span className="truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="lg:col-span-5 space-y-4">
          <div className="relative w-full h-72 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
              {product.description}
            </p>
            <div className="mt-6 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs font-bold text-emerald-600 uppercase">সর্বনিম্ন রেট</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ৳{cheapestDeal.priceBDT}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-3">
        {displayedDeals.map((deal) => (
          <div key={deal.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{deal.vendor.name}</h4>
              <p className="text-xs text-slate-500">{deal.planName} • {deal.duration}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-black text-base text-slate-900 dark:text-white">৳{deal.priceBDT}</div>
              </div>
              <a
                href={deal.directCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                কিনুন ↗
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
