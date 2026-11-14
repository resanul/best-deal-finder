'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { X, Bell, Tag, Truck, ShieldCheck, CheckCheck } from 'lucide-react';

export default function NotificationsDrawer() {
  const {
    notificationsDrawerOpen,
    setNotificationsDrawerOpen,
    notifications,
    markNotifsAsRead,
    setScreen,
  } = useApp();

  if (!notificationsDrawerOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'promo':
        return <Tag className="w-4 h-4 text-[#EA580C]" />;
      case 'order':
        return <Truck className="w-4 h-4 text-[#007A3D]" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#121f18] h-full shadow-2xl flex flex-col border-l border-[#d1ead8] dark:border-[#22382c] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#d1ead8] dark:border-[#22382c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ECFDF5] dark:bg-[#1c3327] flex items-center justify-center text-[#007A3D]">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-lg text-neutral-800 dark:text-neutral-100">
              Notifications
            </h2>
          </div>
          <button
            onClick={() => setNotificationsDrawerOpen(false)}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 tap-bounce"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 bg-[#F4FBF6] dark:bg-[#0c1611] flex items-center justify-between text-xs text-neutral-500">
          <span>{notifications.length} notifications</span>
          <button
            onClick={markNotifsAsRead}
            className="flex items-center gap-1 text-[#007A3D] dark:text-emerald-400 font-medium hover:underline tap-bounce"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.type === 'order') setScreen('orders');
                if (item.type === 'promo') setScreen('home');
                setNotificationsDrawerOpen(false);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer tap-bounce ${
                item.unread
                  ? 'bg-[#F2FAF4] dark:bg-[#172920] border-[#007A3D]/30 shadow-xs'
                  : 'bg-white dark:bg-[#15231b] border-neutral-100 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white dark:bg-[#1b2d23] shadow-xs mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
