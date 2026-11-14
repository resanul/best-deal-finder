'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  Star,
} from 'lucide-react';

export default function OrderTrackingScreen() {
  const { selectedOrder, setScreen, navigateBack } = useApp();

  if (!selectedOrder) {
    return (
      <div className="p-8 text-center">
        <p>No order selected.</p>
        <button
          onClick={() => setScreen('orders')}
          className="mt-4 px-4 py-2 bg-[#007A3D] text-white rounded-xl text-xs"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const steps = [
    { title: 'Order Placed', time: '08:30 PM', completed: true },
    { title: 'Order Confirm', time: '08:35 PM', completed: true },
    { title: 'Pick-up', time: '08:50 PM', completed: true },
    { title: 'Out for Delivery', time: '09:05 PM', active: true, completed: false },
    { title: 'Possible Delivery', time: '09:20 PM', completed: false },
  ];

  return (
    <div className="min-h-full pb-10 bg-[#F4FBF6] dark:bg-[#0B1410] text-neutral-900 dark:text-neutral-100">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#121f18] p-4 flex items-center justify-between border-b border-[#d1ead8] dark:border-[#22382c] sticky top-0 z-20">
        <button
          onClick={navigateBack}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tap-bounce"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold text-neutral-800 dark:text-white">
          Track Order
        </h2>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* Order Item Summary Header */}
        <div className="bg-white dark:bg-[#14231b] p-4 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedOrder.items[0]?.product.image}
              alt="Item"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-mono">
              #{selectedOrder.id}
            </span>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
              {selectedOrder.items[0]?.product.name}
            </h4>
            <p className="text-xs font-black text-[#007A3D] dark:text-emerald-400 mt-0.5">
              ৳{selectedOrder.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Live Delivery Courier Rider Card */}
        {selectedOrder.deliveryRider && (
          <div className="bg-white dark:bg-[#14231b] p-4 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Delivery Courier Partner
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#007A3D] flex items-center justify-center font-bold text-base shadow-xs">
                  🛵
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                    {selectedOrder.deliveryRider.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-neutral-500">
                      {selectedOrder.deliveryRider.vehicle}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-[10px] font-bold text-amber-500 flex items-center">
                      <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                      {selectedOrder.deliveryRider.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`tel:${selectedOrder.deliveryRider.phone}`}
                  className="w-9 h-9 rounded-2xl bg-[#ECFDF5] dark:bg-[#1c3327] text-[#007A3D] flex items-center justify-center tap-bounce shadow-xs"
                  title="Call rider"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setScreen('customer-service')}
                  className="w-9 h-9 rounded-2xl bg-[#ECFDF5] dark:bg-[#1c3327] text-[#007A3D] flex items-center justify-center tap-bounce shadow-xs"
                  title="Support chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Timeline (Figma Status Details) */}
        <div className="bg-white dark:bg-[#14231b] p-5 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs">
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white mb-4">
            Order Status Details
          </h4>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
            {steps.map((st, i) => {
              return (
                <div key={i} className="relative flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs ${
                        st.completed
                          ? 'bg-[#007A3D] text-white'
                          : st.active
                          ? 'bg-amber-500 text-white animate-pulse ring-4 ring-amber-100 dark:ring-amber-950/60'
                          : 'bg-white dark:bg-[#14231b] border-2 border-neutral-300 dark:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      {st.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : st.active ? (
                        <Truck className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-neutral-300" />
                      )}
                    </div>
                    <div>
                      <h5
                        className={`text-xs font-bold ${
                          st.active
                            ? 'text-amber-600 dark:text-amber-400'
                            : st.completed
                            ? 'text-neutral-900 dark:text-white'
                            : 'text-neutral-400'
                        }`}
                      >
                        {st.title}
                      </h5>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {st.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destination Card */}
        <div className="bg-white dark:bg-[#14231b] p-4 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-[#007A3D]" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block">
              Delivery Destination
            </span>
            <p className="text-xs font-bold text-neutral-800 dark:text-white">
              {selectedOrder.shippingAddress.details}, {selectedOrder.shippingAddress.area}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
