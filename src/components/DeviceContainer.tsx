'use client';

/**
 * DamKoto BD ("Best Deal Finder") Device Container
 * Modern responsive application shell with independent multi-vendor identity.
 * 
 * Location: src/components/DeviceContainer.tsx
 */

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  Store,
  X,
  Mail,
  Sparkles,
  HelpCircle,
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
import DamKotoHeader from './DamKotoHeader';

export default function DeviceContainer() {
  const {
    screen,
    setScreen,
    adminShopModalOpen,
    setAdminShopModalOpen,
    darkMode,
    language,
    selectedCategory,
    setSelectedCategory,
    setFilterModalOpen,
    scamModalOpen,
    setScamModalOpen,
  } = useApp();

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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${darkMode ? 'dark bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-[#0F172A]'}`}>
      
      {/* 1. DamKoto BD Header & Category Navigation Bar */}
      <DamKotoHeader
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setScreen('home');
        }}
        onOpenMobileFilters={() => setFilterModalOpen(true)}
        onOpenShopsModal={() => setAdminShopModalOpen(true)}
        onOpenScamModal={() => setScamModalOpen(true)}
      />

      {/* 2. Main Full-Width Catalog Viewport */}
      <main className="w-full flex-1 flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1">
          {renderActiveScreen()}
        </div>
      </main>

      {/* 3. DamKoto BD Authentic Dark Footer */}
      <footer className="w-full bg-[#070B14] text-white border-t border-slate-800/80 pt-12 pb-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-8 border-b border-slate-800/80">
            
            {/* Column 1: DamKoto BD Mission & Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center p-1.5 shadow-md shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-white stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xl font-black text-white font-sans tracking-tight">
                    DamKoto <span className="text-emerald-400">BD</span>
                  </span>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider -mt-0.5">
                    Best Deal Finder
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'bn'
                  ? 'দামকত বিডি (DamKoto BD) বাংলাদেশের স্বাধীন ও নিরপেক্ষ টেক ও ডিজিটাল মূল্য তুলনা প্ল্যাটফর্ম। Star Tech, Ryans, Techland, Walton সহ ২২+ বিশ্বস্ত রিটেইলারের লাইভ অফার এক ক্লিকেই।'
                  : 'DamKoto BD is an independent price comparison and best deal platform for Bangladesh. Live prices across Star Tech, Ryans, Techland, Walton and 22+ verified shops.'}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>১০০% স্বাধীন প্রাইস ট্র্যাকিং • ০% স্ক্যাম গ্যারান্টি</span>
              </div>
            </div>

            {/* Column 2: Platform Links & Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                {language === 'bn' ? 'প্ল্যাটফর্ম ও সাপোর্ট' : 'Platform & Support'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'bn' ? 'কিভাবে মূল্য তুলনা কাজ করে' : 'How Price Comparison Works'}</span>
                </li>
                <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors" onClick={() => setScamModalOpen(true)}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'bn' ? 'Scam Shield BD (শপ ভেরিফিকেশন)' : 'Scam Shield BD Verification'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>support@damkoto.com.bd</span>
                </li>
                <li className="text-[11px] text-slate-500">
                  <span>২৪/৭ স্বয়ংক্রিয় লাইভ স্ক্র্যাপার ও দাম ট্র্যাকার</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Verified 22 BD Tech Retailers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  {language === 'bn' ? '২২টি পার্টনার রিটেইলার' : '22 Partner Retailers'}
                </h4>
                <button
                  onClick={() => setAdminShopModalOpen(true)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  {language === 'bn' ? 'রেজিস্ট্রি' : 'Registry'}
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Star Tech, Ryans, Techland, Walton BD, Samanta Computer, Global Brand, Potaka IT, Skyland, Ultratech, UCC, Computer Village...
              </p>
              <button
                onClick={() => setAdminShopModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'bn' ? 'দোকান রেজিস্ট্রি ও লাইভ স্ট্যাটাস' : 'Shop Registry & Live Status'}</span>
              </button>
            </div>

            {/* Column 4: Payment & Security */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                {language === 'bn' ? 'নিরাপদ পেমেন্ট ও নিশ্চয়তা' : 'Secure Payment & Protection'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'bn'
                  ? 'প্রতিটি ভেরিফাইড দোকানে ক্যাশ অন ডেলিভারি এবং অনলাইন এমএফএস গেটওয়ের মাধ্যমে ১০০% নিরাপদ লেনদেন।'
                  : 'Cash on delivery and secure digital MFS payments supported across all verified partner shops.'}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 rounded-md bg-pink-950/60 text-pink-300 font-bold text-[11px] border border-pink-800/40">
                  bKash
                </span>
                <span className="px-2.5 py-1 rounded-md bg-orange-950/60 text-orange-300 font-bold text-[11px] border border-orange-800/40">
                  Nagad
                </span>
                <span className="px-2.5 py-1 rounded-md bg-purple-950/60 text-purple-300 font-bold text-[11px] border border-purple-800/40">
                  Rocket
                </span>
                <span className="px-2.5 py-1 rounded-md bg-blue-950/60 text-blue-300 font-bold text-[11px] border border-blue-800/40">
                  VISA / MC
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 DamKoto BD (Best Deal Finder). All rights reserved.</p>
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] flex-wrap">
              <span className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-emerald-400 cursor-pointer transition-colors">Terms and Conditions</span>
              <span>•</span>
              <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => setScamModalOpen(true)}>
                Scam Shield BD
              </span>
              <span>•</span>
              <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => setAdminShopModalOpen(true)}>
                Shop Registry
              </span>
            </div>
          </div>

        </div>
      </footer>

      {/* 4. Mobile Bottom Navigation */}
      <div className="block md:hidden">
        <BottomNav />
      </div>

      {/* 5. Modals */}
      {selectedCategory.toLowerCase() === 'digital' && <FilterModal />}
      <NotificationsDrawer />
      <Modals />
      <ScamModal
        isOpen={scamModalOpen}
        onClose={() => setScamModalOpen(false)}
      />

      {/* Admin Shop Registry Modal */}
      {adminShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#090D16] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white">
                  {language === 'bn' ? 'বাংলাদেশি শপ ম্যানেজমেন্ট ও স্বয়ংক্রিয় স্ক্র্যাপার রেজিস্ট্রি' : 'Shop Registry & Retailer Management'}
                </h3>
              </div>
              <button
                onClick={() => setAdminShopModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
