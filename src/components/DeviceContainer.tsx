'use client';

/**
 * Star Tech Authentic Device Container
 * Full-screen Star Tech theme (#081621 header, #f2f4f8 body, #ef4a23 accents)
 * 
 * Location: src/components/DeviceContainer.tsx
 */

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  Store,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
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
import StarTechHeader from './StarTechHeader';

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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${darkMode ? 'dark bg-[#081621] text-slate-100' : 'bg-[#f2f4f8] text-[#081621]'}`}>
      
      {/* 1. Star Tech Authentic Header & Category Navigation Bar */}
      <StarTechHeader
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setScreen('home');
        }}
        onOpenMobileFilters={() => setFilterModalOpen(true)}
        onOpenShopsModal={() => setAdminShopModalOpen(true)}
        onOpenScamModal={() => setScamModalOpen(true)}
      />

      {/* 2. Main Star Tech Full-Width Catalog Viewport */}
      <main className="w-full flex-1 flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1">
          {renderActiveScreen()}
        </div>
      </main>

      {/* 3. Star Tech Authentic Deep Navy Footer */}
      <footer className="w-full bg-[#081621] text-white border-t border-[#142636] pt-12 pb-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-8 border-b border-[#142636]">
            
            {/* Column 1: Star Tech Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#ef4a23] flex items-center justify-center p-1">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>
                </div>
                <span className="text-xl font-black text-white font-sans uppercase">
                  STAR <span className="text-[#ef4a23]">TECH</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                বাংলাদেশের শীর্ষস্থানীয় কম্পিউটার, ল্যাপটপ, গেমিং ও কম্পোনেন্ট রিটেইলার। Star Tech, Ryans, Walton, Techland সহ ২২+ দোকানের লাইভ প্রাইস কম্প্যারিজম সিস্টেম।
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#ef4a23]">
                <ShieldCheck className="w-4 h-4" />
                <span>১০০% জেনুইন প্রোডাক্ট • অফিসিয়াল ওয়ারেন্টি</span>
              </div>
            </div>

            {/* Column 2: Support & Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                সাপোর্ট ও যোগাযোগ
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#ef4a23]" />
                  <span>16793 (সকাল ৯টা - রাত ৮টা)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#ef4a23]" />
                  <span>info@startech.com.bd</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#ef4a23]" />
                  <span>ঢাকা, চট্টগ্রাম, রাজশাহী, রংপুর ও খুলনা শাখা</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#ef4a23]" />
                  <span>সপ্তাহে ৭ দিন খোলা</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Verified 22 BD Tech Retailers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  ২২টি পার্টনার রিটেইলার
                </h4>
                <button
                  onClick={() => setAdminShopModalOpen(true)}
                  className="text-[11px] text-[#ef4a23] hover:underline"
                >
                  শপ রেজিস্ট্রি
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Star Tech, Ryans, Techland, Walton BD, Samanta Computer, Global Brand, Potaka IT, Ultratech, Creatus, PC House, Binary Logic...
              </p>
              <button
                onClick={() => setAdminShopModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
              >
                <Store className="w-3.5 h-3.5 text-[#ef4a23]" />
                <span>দোকান যুক্ত করুন / ম্যানেজ করুন</span>
              </button>
            </div>

            {/* Column 4: Payment & Security */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                নিরাপদ পেমেন্ট পার্টনার
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                প্রতিটি ভেরিফাইড দোকানে ক্যাশ অন ডেলিভারি এবং অনলাইন এমএফএস পেমেন্ট সুবিধা রয়েছে।
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-pink-900/50 text-pink-300 font-black text-[11px] border border-pink-700/50">
                  bKash
                </span>
                <span className="px-2.5 py-1 rounded-md bg-orange-900/50 text-orange-300 font-black text-[11px] border border-orange-700/50">
                  Nagad
                </span>
                <span className="px-2.5 py-1 rounded-md bg-purple-900/50 text-purple-300 font-black text-[11px] border border-purple-700/50">
                  Rocket
                </span>
                <span className="px-2.5 py-1 rounded-md bg-blue-900/50 text-blue-300 font-black text-[11px] border border-blue-700/50">
                  VISA
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 Star Tech & Engineering Ltd | Best Deal Finder BD. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Terms and Conditions</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Star Point Policy</span>
            </div>
          </div>

        </div>
      </footer>

      {/* 4. Mobile Bottom Navigation */}
      <div className="block md:hidden">
        <BottomNav />
      </div>

      {/* 5. Modals */}
      <FilterModal />
      <NotificationsDrawer />
      <Modals />
      <ScamModal
        isOpen={scamModalOpen}
        onClose={() => setScamModalOpen(false)}
      />

      {/* Admin Shop Registry Modal */}
      {adminShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#081621] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#ef4a23]" />
                <h3 className="text-base sm:text-lg font-black text-[#081621] dark:text-white">
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
