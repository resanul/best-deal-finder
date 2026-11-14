'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Capacitor } from '@capacitor/core';
import {
  Moon,
  Sun,
  Search,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Store,
  Flame,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

import OnboardingScreen from './OnboardingScreen';
import AuthScreens from './AuthScreens';
import HomeScreen from './HomeScreen';
import ProductDetailScreen from './ProductDetailScreen';
import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';
import OrderSuccessScreen from './OrderSuccessScreen';
import OrdersScreen from './OrdersScreen';
import OrderTrackingScreen from './OrderTrackingScreen';
import ProfileScreen from './ProfileScreen';
import CustomerServiceChat from './CustomerServiceChat';
import LivePromoScreen from './LivePromoScreen';
import WishlistScreen from './WishlistScreen';
import BottomNav from './BottomNav';
import FilterModal from './FilterModal';
import NotificationsDrawer from './NotificationsDrawer';
import Modals from './Modals';
import ScamModal from './ScamModal';
import AdminShopRegistry from './AdminShopRegistry';

export default function DeviceContainer() {
  const {
    screen,
    setScreen,
    catalogMode,
    setCatalogMode,
    adminShopModalOpen,
    setAdminShopModalOpen,
    darkMode,
    toggleDarkMode,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
    setFilterModalOpen,
    scamModalOpen,
    setScamModalOpen,
    t,
  } = useApp();

  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  const renderActiveScreen = () => {
    switch (screen) {
      case 'onboarding':
        return <OnboardingScreen />;
      case 'auth-login':
      case 'auth-signup':
      case 'auth-otp':
      case 'auth-forgot':
        return <AuthScreens />;
      case 'home':
        return <HomeScreen />;
      case 'product-detail':
        return <ProductDetailScreen />;
      case 'cart':
        return <CartScreen />;
      case 'checkout':
        return <CheckoutScreen />;
      case 'order-success':
        return <OrderSuccessScreen />;
      case 'orders':
        return <OrdersScreen />;
      case 'order-tracking':
        return <OrderTrackingScreen />;
      case 'profile':
      case 'edit-profile':
      case 'nid-verify':
        return <ProfileScreen />;
      case 'customer-service':
        return <CustomerServiceChat />;
      case 'live-promo':
        return <LivePromoScreen />;
      case 'wishlist':
        return <WishlistScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${darkMode ? 'dark bg-[#090D16] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* Top Ticker Notification Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-[11px] sm:text-xs py-1.5 px-4 font-semibold text-center flex items-center justify-center gap-2 shadow-xs">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span>
          {language === 'bn'
            ? '🔥 Star Tech, Ryans, Walton, Techland ও ১৭টি ভেরিফাইড বিডি শপের লাইভ দাম তুলনা • ০% স্ক্যাম গ্যারান্টি • বেস্ট ডিল ফাইন্ডার'
            : '🔥 Live price comparison across Star Tech, Ryans, Walton, Techland & 17+ BD stores • 0% Scam Guarantee • Best Deal Finder'}
        </span>
      </div>

      {/* Modern Full-Width Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <button
            onClick={() => setScreen('home')}
            className="flex items-center gap-3 text-left shrink-0 group tap-bounce"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-[#090D16] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  DamKoto
                </span>
                <span className="px-1.5 py-0.5 rounded-lg bg-emerald-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  BD
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 hidden xs:block">
                কম্পিউটার ও ডিজিটাল গুডস প্রাইস কম্প্যারিজম
              </p>
            </div>
          </button>

          {/* Central Live Search Bar (Desktop & Tablet) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'Ryzen 5 5600, RTX 4060, Walton Laptop, Odyssey G5, Netflix খুঁজুন...'
                    : 'Search Ryzen 5, RTX 4060, Walton Laptop, Odyssey G5, Netflix...'
                }
                className="w-full pl-11 pr-24 py-2.5 text-sm rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-12 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
              <button
                onClick={() => setFilterModalOpen(true)}
                className="absolute right-2 top-1.5 px-2.5 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="text-[11px]">Filter</span>
              </button>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Shop Management / Add Shop Button */}
            <button
              onClick={() => setAdminShopModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all tap-bounce shadow-xs"
              title="Add or manage shops"
            >
              <Store className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">শপ রেজিস্ট্রি</span>
              <span className="sm:hidden">শপ</span>
            </button>

            {/* Scam Shield Checker Button */}
            <button
              onClick={() => setScamModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all tap-bounce shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">স্ক্যাম চেকার</span>
              <span className="sm:hidden">চেকার</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-500 text-xs font-bold border border-slate-200 dark:border-slate-800 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'বাং' : 'EN'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 sm:p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-500 border border-slate-200 dark:border-slate-800 transition-colors tap-bounce"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

          </div>
        </div>

        {/* Mobile Search Input (Visible on small screens) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 md:hidden bg-slate-50/50 dark:bg-slate-900/40">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্য বা সাবস্ক্রিপশন খুঁজুন..."
              className="w-full pl-10 pr-20 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
            <button
              onClick={() => setFilterModalOpen(true)}
              className="absolute right-2 top-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>ফিল্টার</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Expansive Responsive Viewport - FULL SCREEN */}
      <main className="w-full flex-1 flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
          {renderActiveScreen()}
        </div>
      </main>

      {/* Full-Width Platform Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] py-10 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-black text-slate-900 dark:text-white">DamKoto BD</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold">VERIFIED</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                বাংলাদেশের বিশ্বস্ত ডিজিটাল গুডস প্রাইস কম্প্যারিজম সার্চ ইঞ্জিন। আমরা লাইভ ডেটা স্ক্র্যাপ ও ট্র্যাক করে ভোক্তাদের সবচেয়ে কম দামে সঠিক পণ্য কিনতে সহায়তা করি।
              </p>
              <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>১৭টি পরীক্ষিত বাংলাদেশি স্টোর • ৭টি স্ক্যাম শপ ব্ল্যাকলিস্টেড</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                জনপ্রিয় ক্যাটাগরি
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li>🎬 ওটিটি ও স্ট্রিমিং (Netflix, Prime)</li>
                <li>🎮 গেমিং টপ-আপ (Free Fire, PUBG)</li>
                <li>💻 সফটওয়্যার লাইসেন্স (Canva, Windows 11)</li>
                <li>🔒 ভিপিএন ও প্রাইভেসি (NordVPN)</li>
                <li>🤖 এআই টুলস (ChatGPT Plus)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                নিরাপত্তা ও পেমেন্ট
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                আমাদের প্রতিটি ভেরিফাইড পার্টনারে bKash, Nagad ও Rocket স্বয়ংক্রিয় পেমেন্ট সাপোর্ট রয়েছে।
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-md bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-extrabold text-[10px]">
                  bKash
                </span>
                <span className="px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-[10px]">
                  Nagad
                </span>
                <span className="px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-extrabold text-[10px]">
                  Rocket
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 DamKoto BD. All rights reserved. Made for Bangladesh 🇧🇩</p>
            <p className="text-[11px]">স্বচ্ছ মূল্য • নিরাপদ ক্রয় • জিরো স্ক্যাম</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Only on mobile) */}
      <div className="block md:hidden">
        <BottomNav />
      </div>

      {/* Global Modals */}
      <FilterModal />
      <NotificationsDrawer />
      <Modals />
      <ScamModal
        isOpen={scamModalOpen}
        onClose={() => setScamModalOpen(false)}
      />

      {/* Admin Shop Registry Modal */}
      {adminShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? 'বাংলাদেশি শপ ম্যানেজমেন্ট ও স্বয়ংক্রিয় স্ক্র্যাপার রেজিস্ট্রি' : 'Shop Registry & Retailer Management'}
                </h3>
              </div>
              <button
                onClick={() => setAdminShopModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminShopRegistry />
          </div>
        </div>
      )}

    </div>
  );
}
