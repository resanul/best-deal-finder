'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Zap, Clock, ChevronRight, Plus, Star, Heart } from 'lucide-react';
import { Product } from '@/types/ecom';

export default function FlashSaleSection() {
  const { products, setSelectedProduct, setScreen, addToCart, isWishlisted, toggleWishlist } = useApp();

  // 6 hour countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.filter((p) => p.isFlashSale);

  const formatDigit = (num: number) => String(num).padStart(2, '0');

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setScreen('product-detail');
  };

  return (
    <div className="bg-white dark:bg-[#121f18] rounded-3xl p-4 sm:p-5 border border-[#d1ead8] dark:border-[#22382c] shadow-xs">
      {/* Header with Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 text-white text-xs font-black tracking-wide uppercase shadow-xs">
            <Zap className="w-4 h-4 fill-current animate-bounce" />
            <span>Flash Sale</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Ending in:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-neutral-900 dark:text-white">
              <span className="px-1.5 py-0.5 rounded-md bg-neutral-900 text-white text-[11px]">
                {formatDigit(timeLeft.hours)}
              </span>
              <span>:</span>
              <span className="px-1.5 py-0.5 rounded-md bg-neutral-900 text-white text-[11px]">
                {formatDigit(timeLeft.minutes)}
              </span>
              <span>:</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#EA580C] text-white text-[11px]">
                {formatDigit(timeLeft.seconds)}
              </span>
            </div>
          </div>
        </div>

        <span className="text-xs font-bold text-[#007A3D] dark:text-emerald-400 flex items-center gap-0.5 cursor-pointer hover:underline">
          Shop All Deals <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Flash Sale Product Cards Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
        {flashProducts.map((product) => {
          const discountPercent = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 20;
          const soldPercent = Math.min(85, Math.round((product.soldCount / (product.soldCount + product.stock)) * 100));
          const wishlisted = isWishlisted(product.id);

          return (
            <div
              key={product.id}
              className="group bg-[#F8FCF9] dark:bg-[#16271e] rounded-2xl p-2.5 sm:p-3 border border-[#d1ead8]/60 dark:border-[#22382c] flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div
                  className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 mb-2 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#EA580C] text-white text-[9px] font-black">
                    -{discountPercent}%
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors ${
                      wishlisted
                        ? 'bg-red-50 text-red-500'
                        : 'bg-white/80 dark:bg-black/60 text-neutral-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${wishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="cursor-pointer" onClick={() => handleProductClick(product)}>
                  <p className="text-[10px] text-neutral-400 font-semibold">{product.brand}</p>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-[#007A3D]">
                    {product.name}
                  </h4>
                </div>

                {/* Price */}
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xs font-black text-[#007A3D] dark:text-emerald-400">
                    ৳{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-neutral-400 line-through">
                      ৳{product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Stock progress bar */}
                <div className="mt-2">
                  <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-[#EA580C] rounded-full"
                      style={{ width: `${soldPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-0.5 font-medium">
                    <span>{product.soldCount} sold</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Only {product.stock} left</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => addToCart(product, 1)}
                className="w-full mt-2.5 py-1.5 rounded-xl bg-[#007A3D] hover:bg-[#006230] text-white text-[11px] font-bold flex items-center justify-center gap-1 tap-bounce shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
