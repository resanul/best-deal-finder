'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistScreen() {
  const { wishlist, products, toggleWishlist, addToCart, setScreen, setSelectedProduct } = useApp();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-full pb-10 bg-[#F4FBF6] dark:bg-[#0B1410] text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <div className="bg-white dark:bg-[#121f18] p-4 flex items-center justify-between border-b border-[#d1ead8] dark:border-[#22382c] sticky top-0 z-20">
        <button
          onClick={() => setScreen('home')}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tap-bounce"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold text-neutral-800 dark:text-white">
          My Wishlist ({wishlistedProducts.length})
        </h2>
        <div className="w-8" />
      </div>

      <div className="p-4">
        {wishlistedProducts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#14231b] rounded-3xl border border-[#d1ead8] dark:border-[#22382c] my-8">
            <Heart className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
            <h4 className="text-sm font-bold text-neutral-800 dark:text-white">
              No Wishlisted Items
            </h4>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              Tap the heart icon on any product to save it here for later.
            </p>
            <button
              onClick={() => setScreen('home')}
              className="px-4 py-2 bg-[#007A3D] text-white rounded-xl text-xs font-semibold tap-bounce"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-[#14231b] rounded-3xl p-3 border border-[#d1ead8] dark:border-[#22382c] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => {
                      setSelectedProduct(product);
                      setScreen('product-detail');
                    }}
                    className="relative w-full h-32 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-2 cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {product.weight}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-black text-[#007A3D] dark:text-emerald-400">
                    ৳{product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#007A3D] text-white text-[10px] font-bold flex items-center gap-1 tap-bounce"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
