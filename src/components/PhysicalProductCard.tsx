'use client';

/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Physical Tech Product Card Component
 * 
 * Location: src/components/PhysicalProductCard.tsx
 */

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ProductGroup } from '@/types/physicalGoods';
import {
  ExternalLink,
  Store,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface PhysicalProductCardProps {
  product: ProductGroup;
}

export default function PhysicalProductCard({ product }: PhysicalProductCardProps) {
  const { setSelectedPhysicalProduct, setScreen, language } = useApp();

  const handleCardClick = () => {
    setSelectedPhysicalProduct(product);
    setScreen('product-detail');
  };

  const handleDirectBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.bestDealUrl) {
      window.open(product.bestDealUrl, '_blank', 'noopener,noreferrer');
    } else {
      handleCardClick();
    }
  };

  const formattedMinPrice = `৳${Math.round(product.minPrice).toLocaleString()}`;
  const formattedMaxPrice = `৳${Math.round(product.maxPrice).toLocaleString()}`;
  const priceDisplay =
    product.minPrice === product.maxPrice
      ? formattedMinPrice
      : `${formattedMinPrice} – ${formattedMaxPrice}`;

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white dark:bg-[#0D1321] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Top Badge: Savings or Best Deal */}
      {product.savingsPercent && product.savingsPercent > 0 ? (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow-md shadow-emerald-500/20">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>
            {language === 'bn'
              ? `৳${product.priceSpreadBDT?.toLocaleString()} ছাড় (${product.savingsPercent}%)`
              : `Save ৳${product.priceSpreadBDT?.toLocaleString()} (${product.savingsPercent}%)`}
          </span>
        </div>
      ) : null}

      {/* Brand Tag Top Right */}
      <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider">
        {product.brand}
      </div>

      {/* Product Image */}
      <div className="relative w-full h-48 sm:h-52 bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80'}
          alt={product.canonicalName}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col p-4 sm:p-5">
        
        {/* Category & Shop Count */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {product.category}
          </span>
          <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">
            <Store className="w-3 h-3 text-slate-400" />
            {product.offerCount} {language === 'bn' ? 'দোকানে দাম' : 'Shops'}
          </span>
        </div>

        {/* Product Canonical Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-500 transition-colors mb-2.5">
          {product.canonicalName}
        </h3>

        {/* Specs Highlights */}
        {product.specs && Object.keys(product.specs).length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {Object.entries(product.specs).slice(0, 2).map(([key, value]) => (
              <span
                key={key}
                className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
              >
                <strong className="font-semibold text-slate-700 dark:text-slate-200">{key}:</strong> {value}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          
          {/* Price Range */}
          <div>
            <div className="text-[11px] font-medium text-slate-400">
              {language === 'bn' ? 'বাজার মূল্য সীমা' : 'Price Range'}
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {priceDisplay}
            </div>
          </div>

          {/* Best Deal Shop Banner */}
          {product.bestDealShopName ? (
            <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  <span>{language === 'bn' ? 'সেরা ডিল' : 'Best Deal'}</span>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {product.bestDealShopName}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                  ৳{Math.round(product.bestDealPrice).toLocaleString()}
                </div>
              </div>
            </div>
          ) : null}

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCardClick}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{language === 'bn' ? 'সব দাম দেখুন' : 'Compare All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {product.bestDealUrl ? (
              <button
                onClick={handleDirectBuy}
                title={`Buy directly on ${product.bestDealShopName}`}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm shadow-emerald-600/20"
              >
                <span>{language === 'bn' ? 'কিনুন' : 'Buy'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

        </div>

      </div>
    </div>
  );
}
