'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Trash2,
  HeartHandshake,
  MapPin,
  Star,
  LogOut,
  Check,
} from 'lucide-react';

export default function Modals() {
  const {
    removeCartModalItem,
    setRemoveCartModalItem,
    removeFromCart,
    donateModalOpen,
    setDonateModalOpen,
    isDonating,
    setIsDonating,
    donationAmount,
    setDonationAmount,
    addressModalOpen,
    setAddressModalOpen,
    addAddress,
    logoutModalOpen,
    setLogoutModalOpen,
    setScreen,
    ratingModalOrder,
    setRatingModalOrder,
    addOrderReview,
    toastMessage,
  } = useApp();

  // Add Address Form
  const [addrType, setAddrType] = useState<'Home' | 'Apartment' | 'Office'>('Home');
  const [addrRegion, setAddrRegion] = useState('Dhaka North');
  const [addrCity, setAddrCity] = useState('Dhaka');
  const [addrArea, setAddrArea] = useState('Banani');
  const [addrDetails, setAddrDetails] = useState('');
  const [addrPhone, setAddrPhone] = useState('+880 1819-284920');

  // Rating Form
  const [stars, setStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  return (
    <>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-neutral-900/95 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Remove From Cart Modal (Figma Row 04) */}
      {removeCartModalItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-[#121f18] rounded-3xl p-5 border border-[#d1ead8] dark:border-[#22382c] shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-500 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Remove From Cart?
            </h3>
            <p className="text-xs text-neutral-500 mt-1 mb-4">
              Are you sure you want to remove &ldquo;{removeCartModalItem.product.name}&rdquo;?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setRemoveCartModalItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 tap-bounce"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeFromCart(removeCartModalItem.product.id);
                  setRemoveCartModalItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold tap-bounce"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Donate Product Modal (Figma Row 04) */}
      {donateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-[#121f18] rounded-3xl p-5 border border-[#d1ead8] dark:border-[#22382c] shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#007A3D] mx-auto flex items-center justify-center mb-3">
              <HeartHandshake className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Join Us with Giving
            </h3>
            <p className="text-xs text-neutral-500 mt-1 mb-4">
              Your donation supplies food baskets to families in need across Bangladesh.
            </p>

            <div className="flex justify-center gap-2 mb-4">
              {[20, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setDonationAmount(amt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    donationAmount === amt
                      ? 'bg-[#007A3D] text-white shadow-xs'
                      : 'bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDonateModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-600"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setIsDonating(true);
                  setDonateModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#007A3D] text-white text-xs font-bold tap-bounce"
              >
                Donate ৳{donationAmount}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add Address Modal (Figma Row 04) */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#121f18] rounded-3xl p-5 border border-[#d1ead8] dark:border-[#22382c] shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#007A3D]" /> Add Delivery Address
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-1 rounded-full text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Address Type */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                Address Type
              </label>
              <div className="flex gap-2">
                {(['Home', 'Apartment', 'Office'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAddrType(type)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                      addrType === type
                        ? 'bg-[#007A3D] text-white shadow-xs'
                        : 'bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Region / City / Area */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-neutral-500">Region</label>
                <input
                  type="text"
                  value={addrRegion}
                  onChange={(e) => setAddrRegion(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] font-semibold text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-neutral-500">Area</label>
                <input
                  type="text"
                  value={addrArea}
                  onChange={(e) => setAddrArea(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] font-semibold text-xs"
                />
              </div>
            </div>

            {/* Address Details */}
            <div>
              <label className="text-[10px] font-semibold text-neutral-500">
                Address Details (House, Road, Flat No)
              </label>
              <textarea
                value={addrDetails}
                onChange={(e) => setAddrDetails(e.target.value)}
                placeholder="e.g. House 24, Road 11, Block E"
                rows={2}
                className="w-full mt-1 p-2 rounded-xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-xs focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-[10px] font-semibold text-neutral-500">Phone</label>
              <input
                type="text"
                value={addrPhone}
                onChange={(e) => setAddrPhone(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-xs"
              />
            </div>

            <button
              onClick={() => {
                if (!addrDetails.trim()) return;
                addAddress({
                  type: addrType,
                  name: addrType,
                  details: addrDetails,
                  area: addrArea,
                  city: addrCity,
                  region: addrRegion,
                  isDefault: true,
                  phone: addrPhone,
                });
                setAddressModalOpen(false);
              }}
              className="w-full py-3 rounded-2xl bg-[#007A3D] text-white text-xs font-bold shadow-md tap-bounce"
            >
              Save Address
            </button>
          </div>
        </div>
      )}

      {/* 4. Rating & Review Modal (Figma Row 05) */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-[#121f18] rounded-3xl p-5 border border-[#d1ead8] dark:border-[#22382c] shadow-2xl text-center space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Give Rating
            </h3>
            <p className="text-xs text-neutral-500 font-mono">
              Order #{ratingModalOrder.id}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              How was your order experience?
            </p>

            {/* Star selector */}
            <div className="flex justify-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setStars(s)}
                  className={`text-2xl tap-bounce ${
                    s <= stars ? 'text-amber-400' : 'text-neutral-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              placeholder="Write feedback..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-xs focus:outline-none"
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setRatingModalOrder(null)}
                className="flex-1 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addOrderReview(
                    ratingModalOrder.items[0]?.product.id || 'prod-1',
                    stars,
                    ratingComment || 'Great service and fresh quality products!'
                  );
                  setRatingModalOrder(null);
                }}
                className="flex-1 py-2 rounded-xl bg-[#007A3D] text-white text-xs font-bold tap-bounce"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Logout Confirmation Modal (Figma Row 06) */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-[#121f18] rounded-3xl p-5 border border-[#d1ead8] dark:border-[#22382c] shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-500 mx-auto flex items-center justify-center mb-3">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Log Out
            </h3>
            <p className="text-xs text-neutral-500 mt-1 mb-4">
              Are you sure you want to log out from your account?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 tap-bounce"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setLogoutModalOpen(false);
                  setScreen('auth-login');
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold tap-bounce"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
