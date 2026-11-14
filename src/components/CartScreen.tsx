'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  ArrowRight,
  HeartHandshake,
  Check,
} from 'lucide-react';

export default function CartScreen() {
  const {
    cart,
    updateCartQuantity,
    setRemoveCartModalItem,
    cartTotal,
    isDonating,
    setIsDonating,
    donationAmount,
    setDonationAmount,
    voucherCode,
    voucherDiscount,
    applyVoucher,
    setScreen,
    setDonateModalOpen,
  } = useApp();

  const [inputCode, setInputCode] = useState(voucherCode || '');

  const deliveryFee = cartTotal > 500 ? 0 : 40;
  const donation = isDonating ? donationAmount : 0;
  const grandTotal = Math.max(0, cartTotal + deliveryFee + donation - voucherDiscount);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode) return;
    applyVoucher(inputCode);
  };

  return (
    <div className="min-h-full pb-8 bg-[#F4FBF6] dark:bg-[#0B1410] text-neutral-900 dark:text-neutral-100">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#121f18] p-4 flex items-center justify-between border-b border-[#d1ead8] dark:border-[#22382c] sticky top-0 z-20">
        <button
          onClick={() => setScreen('home')}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tap-bounce"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold text-neutral-800 dark:text-white">
          My Cart ({cart.length})
        </h2>
        <div className="w-8" />
      </div>

      {cart.length === 0 ? (
        <div className="p-8 text-center my-12">
          <div className="w-20 h-20 rounded-full bg-[#ECFDF5] dark:bg-[#1c3327] flex items-center justify-center text-4xl mx-auto mb-4">
            🛒
          </div>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
            Your Cart is Empty
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 mb-6">
            Looks like you haven&apos;t added any groceries or snacks to your cart yet.
          </p>
          <button
            onClick={() => setScreen('home')}
            className="px-6 py-3 rounded-2xl bg-[#007A3D] text-white font-semibold text-xs shadow-md tap-bounce"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Cart Items List */}
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white dark:bg-[#14231b] p-3.5 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs flex items-center gap-3"
              >
                {/* Product thumbnail */}
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400">
                    {item.product.weight}
                  </p>
                  <p className="text-xs font-black text-[#007A3D] dark:text-emerald-400 mt-1">
                    ৳{(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => setRemoveCartModalItem(item)}
                    className="p-1 text-neutral-400 hover:text-red-500 tap-bounce"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2 bg-[#F2FAF4] dark:bg-[#172920] px-2 py-1 rounded-xl border border-[#d1ead8] dark:border-[#22382c]">
                    <button
                      onClick={() => {
                        if (item.quantity === 1) {
                          setRemoveCartModalItem(item);
                        } else {
                          updateCartQuantity(item.product.id, -1);
                        }
                      }}
                      className="text-neutral-600 dark:text-neutral-300 hover:text-black tap-bounce"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-neutral-800 dark:text-white w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, 1)}
                      className="text-[#007A3D] hover:text-[#006230] tap-bounce"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charity Donation Option (Figma Feature) */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[#11241b] dark:to-[#172e22] border border-emerald-200 dark:border-emerald-900/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#007A3D] text-white">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                    Join us with giving
                  </h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Sponsor emergency food relief for needy families
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isDonating}
                onChange={(e) => setIsDonating(e.target.checked)}
                className="w-4 h-4 rounded text-[#007A3D] focus:ring-[#007A3D] mt-1"
              />
            </div>

            {isDonating && (
              <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  Select Donation:
                </span>
                <div className="flex gap-1.5">
                  {[20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setDonationAmount(amt)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        donationAmount === amt
                          ? 'bg-[#007A3D] text-white shadow-xs'
                          : 'bg-white dark:bg-[#121f18] text-neutral-700 dark:text-neutral-300 border border-emerald-200'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Voucher Promo Code */}
          <div className="bg-white dark:bg-[#14231b] p-3.5 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs">
            <form onSubmit={handleApplyVoucher} className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <Tag className="w-4 h-4 absolute left-3 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Enter Voucher (e.g. SAVE30)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-xs font-semibold text-neutral-900 dark:text-white uppercase placeholder:normal-case focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#007A3D] text-white text-xs font-bold rounded-2xl tap-bounce hover:bg-[#006230]"
              >
                Apply
              </button>
            </form>

            {voucherDiscount > 0 && (
              <div className="mt-2 text-xs font-semibold text-[#007A3D] dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Voucher &ldquo;{voucherCode}&rdquo; applied (-৳{voucherDiscount})
              </div>
            )}
          </div>

          {/* Pricing Breakdown (Figma Order List Summary) */}
          <div className="bg-white dark:bg-[#14231b] p-4 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold text-neutral-800 dark:text-white mb-2">
              Order Summary
            </h4>

            <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
              <span>Item Subtotal</span>
              <span className="font-semibold text-neutral-800 dark:text-white">
                ৳{cartTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
              <span>Delivery Fee</span>
              <span className="font-semibold text-neutral-800 dark:text-white">
                {deliveryFee === 0 ? (
                  <span className="text-[#007A3D] font-bold">FREE</span>
                ) : (
                  `৳${deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>

            {isDonating && (
              <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
                <span>Charity Giving</span>
                <span className="font-semibold text-emerald-600">
                  +৳{donation.toFixed(2)}
                </span>
              </div>
            )}

            {voucherDiscount > 0 && (
              <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
                <span>Voucher Discount</span>
                <span className="font-semibold text-[#EA580C]">
                  -৳{voucherDiscount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-sm font-bold">
              <span className="text-neutral-900 dark:text-white">Total</span>
              <span className="text-base text-[#007A3D] dark:text-emerald-400 font-black">
                ৳{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={() => setScreen('checkout')}
            className="w-full py-4 px-6 rounded-2xl bg-[#007A3D] hover:bg-[#006230] text-white font-bold text-sm shadow-lg shadow-[#007A3D]/25 flex items-center justify-between tap-bounce transition-all"
          >
            <span>Proceed to Checkout</span>
            <div className="flex items-center gap-2">
              <span>৳{grandTotal.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
