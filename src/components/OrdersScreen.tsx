'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Clock, CheckCircle2, ChevronRight, Star, Package } from 'lucide-react';
import { Order } from '@/types/ecom';

export default function OrdersScreen() {
  const {
    orders,
    setSelectedOrder,
    setScreen,
    setRatingModalOrder,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Active' | 'Completed'>('Active');

  const filteredOrders = orders.filter((o) =>
    activeTab === 'Active' ? o.status === 'Active' : o.status === 'Completed'
  );

  const handleTrack = (order: Order) => {
    setSelectedOrder(order);
    setScreen('order-tracking');
  };

  return (
    <div className="min-h-full pb-10 bg-[#F4FBF6] dark:bg-[#0B1410] text-neutral-900 dark:text-neutral-100">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#121f18] p-4 flex items-center justify-between border-b border-[#d1ead8] dark:border-[#22382c] sticky top-0 z-20">
        <button
          onClick={() => setScreen('home')}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tap-bounce"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold text-neutral-800 dark:text-white">
          My Order
        </h2>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* Active vs Completed Tabs (Figma Row 05) */}
        <div className="flex rounded-2xl bg-white dark:bg-[#14231b] p-1 border border-[#d1ead8] dark:border-[#22382c]">
          <button
            onClick={() => setActiveTab('Active')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all tap-bounce ${
              activeTab === 'Active'
                ? 'bg-[#007A3D] text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('Completed')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all tap-bounce ${
              activeTab === 'Completed'
                ? 'bg-[#007A3D] text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#14231b] rounded-3xl border border-[#d1ead8] dark:border-[#22382c] my-6">
            <Package className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
            <h4 className="text-sm font-bold text-neutral-800 dark:text-white">
              No {activeTab} Orders
            </h4>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              You don&apos;t have any {activeTab.toLowerCase()} orders right now.
            </p>
            <button
              onClick={() => setScreen('home')}
              className="px-4 py-2 bg-[#007A3D] text-white rounded-xl text-xs font-semibold tap-bounce"
            >
              Order Now
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredOrders.map((order) => {
              const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-[#14231b] p-4 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs space-y-3"
                >
                  {/* Order Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">
                        Order No
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                        #{order.id}
                      </h4>
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {order.date}
                    </span>
                  </div>

                  {/* Item Preview */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.items[0]?.product.image}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-neutral-800 dark:text-white truncate">
                        {order.items[0]?.product.name}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </h5>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Total Quantity: {totalQty}
                      </p>
                      <p className="text-xs font-black text-[#007A3D] dark:text-emerald-400 mt-1">
                        ৳{order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex gap-2">
                    {order.status === 'Active' ? (
                      <button
                        onClick={() => handleTrack(order)}
                        className="w-full py-2.5 rounded-2xl bg-[#007A3D] hover:bg-[#006230] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs tap-bounce"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Track Order
                      </button>
                    ) : (
                      <div className="flex w-full gap-2">
                        <button
                          onClick={() => handleTrack(order)}
                          className="flex-1 py-2 rounded-2xl border border-[#d1ead8] dark:border-[#22382c] text-xs font-semibold text-neutral-700 dark:text-neutral-300 tap-bounce"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => setRatingModalOrder(order)}
                          className="flex-1 py-2 rounded-2xl bg-[#007A3D] text-white text-xs font-bold flex items-center justify-center gap-1 tap-bounce"
                        >
                          <Star className="w-3 h-3 fill-current" />
                          Give Rating
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
