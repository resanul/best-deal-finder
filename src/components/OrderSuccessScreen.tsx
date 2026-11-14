'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, PackageCheck, ArrowRight, Home } from 'lucide-react';

export default function OrderSuccessScreen() {
  const { selectedOrder, setScreen } = useApp();

  return (
    <div className="min-h-[640px] flex flex-col justify-between p-6 bg-white dark:bg-[#101c15] text-center">
      <div className="pt-12">
        {/* Animated Checkmark Badge */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-[#007A3D] animate-bounce">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-[#007A3D]/20 animate-ping" />
        </div>

        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
          Order Successful!
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 max-w-xs mx-auto leading-relaxed">
          Your order has been placed successfully. You will receive real-time updates and notification when rider picks up.
        </p>

        {/* Order Details Receipt Card */}
        {selectedOrder && (
          <div className="mt-6 p-4 rounded-3xl bg-[#F2FAF4] dark:bg-[#16271e] border border-[#d1ead8] dark:border-[#22382c] text-left space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#d1ead8] dark:border-[#22382c]">
              <span className="text-neutral-500">Order ID</span>
              <span className="font-bold text-neutral-800 dark:text-white font-mono">
                #{selectedOrder.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Total Items</span>
              <span className="font-bold text-neutral-800 dark:text-white">
                {selectedOrder.items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Paid via</span>
              <span className="font-bold text-[#007A3D] dark:text-emerald-400">
                {selectedOrder.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Total Paid</span>
              <span className="font-black text-sm text-[#007A3D] dark:text-emerald-400">
                ৳{selectedOrder.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#d1ead8] dark:border-[#22382c]">
              <span className="text-neutral-500">Est. Delivery</span>
              <span className="font-bold text-amber-600">
                {selectedOrder.estimatedDelivery}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pb-4">
        <button
          onClick={() => setScreen('order-tracking')}
          className="w-full py-4 px-6 rounded-2xl bg-[#007A3D] hover:bg-[#006230] text-white font-bold text-sm shadow-lg shadow-[#007A3D]/25 flex items-center justify-center gap-2 tap-bounce transition-all"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Track Order</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        <button
          onClick={() => setScreen('home')}
          className="w-full py-3 px-4 rounded-2xl border border-[#d1ead8] dark:border-[#22382c] text-neutral-700 dark:text-neutral-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#F2FAF4] tap-bounce"
        >
          <Home className="w-4 h-4 text-[#007A3D]" />
          <span>Continue Shopping</span>
        </button>
      </div>
    </div>
  );
}
