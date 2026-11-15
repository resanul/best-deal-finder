'use client';

/**
 * DamKoto BD ("Best Deal Finder") Physical Tech Product Card
 * Multi-Vendor Price Comparison Card with Dynamic Lowest-Price CTA
 * 
 * Location: src/components/PhysicalProductCard.tsx
 */

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ProductGroup } from '@/types/physicalGoods';
import { buildRetailerProductUrl } from '@/lib/shopUrlHelper';
import {
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface PhysicalProductCardProps {
  product: ProductGroup;
}

const DAMKOTO_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" fill="%230F172A"><rect width="300" height="300" fill="%230F172A"/><circle cx="150" cy="130" r="40" fill="%2310B981" opacity="0.2"/><path d="M150 110 L160 135 L185 140 L165 155 L170 180 L150 165 L130 180 L135 155 L115 140 L140 135 Z" fill="%2310B981"/><text x="150" y="215" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">DamKoto BD</text><text x="150" y="235" font-family="sans-serif" font-size="11" fill="%2310B981" text-anchor="middle">Best Deal Finder</text></svg>`;

export default function PhysicalProductCard({ product }: PhysicalProductCardProps) {
  const { setSelectedPhysicalProduct, setScreen } = useApp();

  const handleCardClick = () => {
    setSelectedPhysicalProduct(product);
    setScreen('product-detail');
  };

  // Dynamic lowest price vendor offer resolution
  const bestOffer = product.offers?.find((o) => o.shopId === product.bestDealShopId) || product.offers?.[0];
  const bestDealUrl =
    (bestOffer?.productUrl && !bestOffer.productUrl.includes('item=') && bestOffer.productUrl.startsWith('http')
      ? bestOffer.productUrl
      : undefined) ||
    (product.bestDealUrl && !product.bestDealUrl.includes('item=') && product.bestDealUrl.startsWith('http')
      ? product.bestDealUrl
      : undefined) ||
    (bestOffer?.shopId
      ? buildRetailerProductUrl(
          bestOffer.shopId.replace('shop-', ''),
          product.canonicalName,
          bestOffer?.productUrl,
          product.brand,
          product.model
        )
      : '#');
  const bestDealShopName = product.bestDealShopName || bestOffer?.shopName || 'সেরা ডিল';

  const handleBestDealBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bestDealUrl && bestDealUrl !== '#') {
      window.open(bestDealUrl, '_blank', 'noopener,noreferrer');
    } else {
      handleCardClick();
    }
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
      className="p-item group relative flex flex-col bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* 1. Best Deal Savings Badge (Top Left) */}
      {savingsAmount > 0 ? (
        <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black tracking-wide shadow-xs flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Save: {savingsAmount.toLocaleString()}৳</span>
        </div>
      ) : null}

      {/* Brand Tag Top Right */}
      <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
        {product.brand}
      </div>

      {/* 2. Product Image */}
      <div className="p-item-img relative w-full h-44 sm:h-48 bg-white dark:bg-[#090D16] flex items-center justify-center p-3 overflow-hidden border-b border-slate-100 dark:border-slate-800/80">
        <img
          src={product.imageUrl || DAMKOTO_PLACEHOLDER}
          alt={product.canonicalName}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DAMKOTO_PLACEHOLDER;
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
        <h4 className="p-item-name text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2.5">
          {product.canonicalName}
        </h4>

        {/* 4. Short Description / Specs Bullets */}
        {product.specs && Object.keys(product.specs).length > 0 ? (
          <div className="short-description text-[11px] text-slate-600 dark:text-slate-400 space-y-1 mb-3.5 flex-1">
            <ul className="space-y-0.5 list-none">
              {Object.entries(product.specs)
                .slice(0, 3)
                .map(([key, val]) => (
                  <li key={key} className="flex items-start gap-1.5 line-clamp-1">
                    <span className="text-emerald-500 text-xs font-black">•</span>
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

        {/* 5. Pricing & Comparison Micro-Badge */}
        <div className="p-item-price pt-2 border-t border-slate-100 dark:border-slate-800/80 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="price-new text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
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
            {bestDealShopName ? (
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                {bestDealShopName}-এ সেরা
              </span>
            ) : null}
          </div>
        </div>

        {/* 6. Multi-Vendor Best Deal CTA & Compare Action Buttons */}
        <div className="actions flex items-center gap-1.5 pt-1">
          <button
            onClick={handleBestDealBuy}
            title={`${bestDealShopName}-এর আসল অফার দেখুন`}
            className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 tap-bounce"
          >
            <span className="truncate">{bestDealShopName}-এ কিনুন</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </button>

          <button
            onClick={handleCompareClick}
            title="২২টি দোকানে দাম তুলনা করুন"
            className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1 tap-bounce border border-slate-200 dark:border-slate-700 shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">দাম তুলনা</span>
          </button>
        </div>

      </div>
    </div>
  );
}
