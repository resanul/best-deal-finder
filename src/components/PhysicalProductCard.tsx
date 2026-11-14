'use client';

/**
 * Star Tech Style Physical Tech Product Card (.p-item)
 * With Multi-Vendor Price Comparison Overlay
 * 
 * Location: src/components/PhysicalProductCard.tsx
 */

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ProductGroup } from '@/types/physicalGoods';
import { buildRetailerProductUrl } from '@/lib/shopUrlHelper';
import {
  ExternalLink,
  Store,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
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

  // Star Tech direct link (from startech offer)
  const starOffer = product.offers?.find((o) => o.shopId === 'shop-startech');
  const starTechUrl =
    starOffer?.productUrl ||
    buildRetailerProductUrl('startech', product.model || product.canonicalName);

  const handleStarTechBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(starTechUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardClick();
  };

  // Savings amount
  const savingsAmount = product.priceSpreadBDT || (product.maxPrice - product.minPrice);
  const regularPrice = product.maxPrice > product.minPrice ? product.maxPrice : Math.round(product.minPrice * 1.08);

  return (
    <div
      onClick={handleCardClick}
      className="p-item group relative flex flex-col bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#ef4a23] dark:hover:border-[#ef4a23] hover:shadow-xl hover:shadow-[#ef4a23]/10 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* 1. Star Tech Mark Badge (Top Left Save Badge) */}
      {savingsAmount > 0 ? (
        <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-[#ef4a23] text-white text-[10px] font-black tracking-wide shadow-xs flex items-center gap-1">
          <span>Save: {savingsAmount.toLocaleString()}৳</span>
        </div>
      ) : null}

      {/* Brand Tag Top Right */}
      <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
        {product.brand}
      </div>

      {/* 2. Product Image */}
      <div className="p-item-img relative w-full h-44 sm:h-48 bg-white dark:bg-[#0D1321] flex items-center justify-center p-3 overflow-hidden border-b border-slate-100 dark:border-slate-800/80">
        <img
          src={
            product.imageUrl ||
            'https://www.startech.com.bd/image/cache/catalog/home-page/logo/startech-logo.png'
          }
          alt={product.canonicalName}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80';
          }}
        />
      </div>

      {/* 3. Card Details Body */}
      <div className="p-item-details flex-1 flex flex-col p-4">
        
        {/* Category & Availability */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            {product.category}
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            In Stock
          </span>
        </div>

        {/* Product Title */}
        <h4 className="p-item-name text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#ef4a23] transition-colors mb-2.5">
          {product.canonicalName}
        </h4>

        {/* 4. Star Tech Short Description (Key Features Bullets) */}
        {product.specs && Object.keys(product.specs).length > 0 ? (
          <div className="short-description text-[11px] text-slate-600 dark:text-slate-400 space-y-1 mb-3.5 flex-1">
            <ul className="space-y-0.5 list-none">
              {Object.entries(product.specs)
                .slice(0, 3)
                .map(([key, val]) => (
                  <li key={key} className="flex items-start gap-1.5 line-clamp-1">
                    <span className="text-[#ef4a23] text-xs font-black">•</span>
                    <span className="truncate">
                      <strong className="font-semibold text-slate-700 dark:text-slate-300">
                        {key}:
                      </strong>{' '}
                      {val}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* 5. Star Tech Pricing Section */}
        <div className="p-item-price pt-2 border-t border-slate-100 dark:border-slate-800/80 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="price-new text-base sm:text-lg font-black text-[#ef4a23]">
              {Math.round(product.minPrice).toLocaleString()}৳
            </span>
            {regularPrice > product.minPrice ? (
              <span className="price-old text-xs text-slate-400 line-through">
                {regularPrice.toLocaleString()}৳
              </span>
            ) : null}
          </div>

          {/* Multi-Vendor Comparison Micro-Badge */}
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              {product.offerCount} টি দোকানে দাম
            </span>
            {product.bestDealShopName ? (
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                {product.bestDealShopName}-এ সেরা
              </span>
            ) : null}
          </div>
        </div>

        {/* 6. Dual Action Buttons */}
        <div className="actions flex items-center gap-1.5 pt-1">
          <button
            onClick={handleStarTechBuy}
            title="Star Tech-এর আসল ওয়েবসাইটে দেখুন"
            className="flex-1 py-2 px-2.5 rounded-lg bg-[#ef4a23] hover:bg-[#d83f1b] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 tap-bounce"
          >
            <span>Star Tech-এ কিনুন</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={handleCompareClick}
            title="অন্যান্য দোকানে দাম তুলনা করুন"
            className="py-2 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1 tap-bounce border border-slate-200 dark:border-slate-700"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">দাম তুলনা</span>
          </button>
        </div>

      </div>
    </div>
  );
}
