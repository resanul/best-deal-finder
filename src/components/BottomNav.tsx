'use client';

import React, { useSyncExternalStore } from 'react';
import { useApp } from '@/context/AppContext';
import { Home, Layers, ShieldCheck, Heart } from 'lucide-react';
import { ScreenType } from '@/types/ecom';

const emptySubscribe = () => () => {};

export default function BottomNav() {
  const { screen, setScreen, setScamModalOpen, setFilterModalOpen, wishlist } = useApp();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const hideOnScreens: ScreenType[] = [
    'onboarding',
    'auth-login',
    'auth-signup',
    'auth-otp',
    'auth-forgot',
  ];

  if (hideOnScreens.includes(screen)) {
    return null;
  }

  const navItems = [
    {
      id: 'home',
      label: 'হোম',
      icon: Home,
      isActive: screen === 'home',
      action: () => setScreen('home'),
    },
    {
      id: 'categories',
      label: 'ক্যাটাগরি',
      icon: Layers,
      isActive: false,
      action: () => setFilterModalOpen(true),
    },
    {
      id: 'scam-shield',
      label: 'স্ক্যাম চেকার',
      icon: ShieldCheck,
      isActive: false,
      badge: 'PRO',
      action: () => setScamModalOpen(true),
    },
    {
      id: 'wishlist',
      label: 'পছন্দ',
      icon: Heart,
      badge: mounted && wishlist.length > 0 ? wishlist.length : undefined,
      isActive: screen === 'wishlist',
      action: () => setScreen('wishlist'),
    },
  ];

  return (
    <nav 
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 transition-colors duration-200 md:hidden"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl tap-bounce transition-all ${
                item.isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${item.isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-3 min-w-[16px] h-[16px] px-1 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 font-semibold tracking-tight">
                {item.label}
              </span>
              {item.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
