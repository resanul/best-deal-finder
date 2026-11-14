'use client';

import React from 'react';
import { Product } from '@/types/digitalGoods';
import { Store, Zap, ArrowRight, Flame, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function formatPriceBadge(minPrice: number, maxPrice: number): string {
  if (minPrice <= 0 && maxPrice <= 0) return '৳0';
  if (minPrice === maxPrice || maxPrice <= minPrice) {
    return `৳${Math.round(minPrice)}`;
  }
  return `৳${Math.round(minPrice)} – ৳${Math.round(maxPrice)}`;
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { setSelectedProduct, setSelectedProductSlug, setScreen, language, t } = useApp();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setSelectedProduct(product as any);
      setSelectedProductSlug(product.slug);
      setScreen('product-detail');
    }
  };

  const priceBadgeText = formatPriceBadge(product.minPrice, product.maxPrice);
  const hasSavings = product.maxPrice > product.minPrice;
  const savingsBDT = product.maxPrice - product.minPrice;
  const isInstant =
    product.tags.some((tg) => tg.toLowerCase().includes('instant')) ||
    product.category === 'Gaming';

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Thumbnail & Badges */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/80 mb-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="%230F172A" width="300" height="200"/><text fill="%2310B981" font-family="sans-serif" font-size="20" font-weight="bold" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle">DamKoto BD</text></svg>';
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
            {product.isTrending ? (
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                <Flame className="w-3 h-3 fill-current" />
                HOT
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-emerald-400 text-[10px] font-bold">
                ✓ Verified
              </span>
            )}

            <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-bold border border-white/10 shadow-xs">
              {product.category}
            </span>
          </div>

          {/* Bottom Overlay Badges */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
            {isInstant && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                <Zap className="w-3 h-3 text-emerald-400 fill-current" />
                ইনস্ট্যান্ট ডেলিভারি
              </span>
            )}
            {hasSavings && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 text-[10px] font-black ml-auto shadow-xs">
                ৳{savingsBDT} সেভ
              </span>
            )}
          </div>
        </div>

        {/* Product Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {product.tags.slice(0, 3).map((tg, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
            >
              {tg}
            </span>
          ))}
        </div>
      </div>

      {/* Pricing & Deals Section */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        
        {/* Store Count & Best Price Pill */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
            <Store className="w-3 h-3 text-emerald-500" />
            <span>{product.offerCount} টি শপে বিক্রি হচ্ছে</span>
          </span>

          <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
            সর্বনিম্ন: ৳{product.minPrice}
          </span>
        </div>

        {/* Big BDT Price Range Display */}
        <div className="mb-3">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            {language === 'bn' ? 'মূল্য সীমা (Price Range)' : 'Price Range'}
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            <span className="text-emerald-600 dark:text-emerald-400">{priceBadgeText}</span>
          </div>
        </div>

        {/* Compare Deals Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 group-hover:shadow-emerald-600/30 tap-bounce transition-all"
        >
          <span>{language === 'bn' ? 'দামের তুলনা দেখুন' : 'Compare Deals'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
