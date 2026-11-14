'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, HeartHandshake, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function OnboardingScreen() {
  const { setScreen } = useApp();
  const [step, setStep] = useState(0); // 0: Splash, 1: Welcome Bismillah, 2: Slide 1, 3: Slide 2, 4: Slide 3

  const slides = [
    {
      title: 'Easily order your product & get delivered',
      subtitle: 'Order your favorite products from local certified halal farmers and stores with 30-minute doorstep delivery.',
      icon: ShoppingBag,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80',
      badge: 'Fast Delivery',
    },
    {
      title: 'Donate Product to give discounts to all users',
      subtitle: 'Share your blessing with the community. Sponsor essentials for needy families while unlocking loyalty perks.',
      icon: HeartHandshake,
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=700&q=80',
      badge: 'Charity & Giving',
    },
    {
      title: 'Communicate with your friends easily',
      subtitle: 'Connect with 24/7 dedicated customer care and share recipe grocery lists directly with family.',
      icon: MessageCircle,
      image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=700&q=80',
      badge: '24/7 Live Care',
    },
  ];

  // Splash Screen
  if (step === 0) {
    return (
      <div 
        onClick={() => setStep(1)}
        className="min-h-[640px] flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#F2FAF4] to-[#ECFDF5] dark:from-[#0c1611] dark:to-[#12241b] text-center cursor-pointer select-none"
      >
        <div className="pt-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#007A3D] dark:text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> 100% Halal Certified
          </span>
          <div className="relative mx-auto w-24 h-24 rounded-3xl bg-[#007A3D] flex items-center justify-center shadow-xl shadow-[#007A3D]/25 mb-4 transform hover:scale-105 transition-transform">
            <ShoppingBag className="w-12 h-12 text-white" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EA580C] border-2 border-white dark:border-[#12241b]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#007A3D] dark:text-emerald-400">
            Shop Online
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            Daily Fresh Grocery & Halal Essentials
          </p>
        </div>

        <div className="w-full max-w-xs pb-6">
          <div className="w-8 h-8 mx-auto border-3 border-[#007A3D] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-neutral-400">Tap anywhere to start</p>
        </div>
      </div>
    );
  }

  // Welcome Screen (Figma Bismillah card)
  if (step === 1) {
    return (
      <div className="min-h-[640px] flex flex-col justify-between p-6 bg-gradient-to-b from-[#ECFDF5] to-[#F2FAF4] dark:from-[#0d1813] dark:to-[#14231b] text-center">
        <div className="pt-8">
          <div className="mx-auto w-40 h-40 rounded-full bg-gradient-to-tr from-[#EA580C]/20 to-[#007A3D]/20 flex items-center justify-center p-4 mb-6 shadow-inner">
            <div className="w-32 h-32 rounded-full bg-white dark:bg-[#16271e] shadow-lg flex flex-col items-center justify-center p-3">
              <span className="text-3xl">🌙</span>
              <span className="text-xs font-semibold text-[#007A3D] mt-1">HALAL SHOP</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h2>
          <p className="text-lg font-semibold text-[#007A3D] dark:text-emerald-400 mb-2">
            Bismillahir Rahmanir Rahim
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs mx-auto leading-relaxed">
            Welcome to the trusted marketplace for fresh, pure, and blessed everyday groceries.
          </p>
        </div>

        <div className="space-y-3 pb-4">
          <button
            onClick={() => setStep(2)}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#007A3D] hover:bg-[#006432] text-white font-semibold text-sm shadow-lg shadow-[#007A3D]/25 flex items-center justify-center gap-2 tap-bounce transition-all"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScreen('home')}
            className="w-full py-2.5 text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 font-medium tap-bounce"
          >
            Skip to Store
          </button>
        </div>
      </div>
    );
  }

  // Carousel Slides (step 2, 3, 4 -> index 0, 1, 2)
  const currentSlideIndex = step - 2;
  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="min-h-[640px] flex flex-col justify-between bg-white dark:bg-[#101c15] p-6">
      {/* Top Bar with Skip */}
      <div className="flex items-center justify-between pt-2">
        <span className="px-3 py-1 rounded-full bg-[#ECFDF5] dark:bg-[#1c3327] text-[#007A3D] dark:text-emerald-400 text-xs font-semibold">
          {currentSlide.badge}
        </span>
        <button
          onClick={() => setScreen('home')}
          className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 tap-bounce"
        >
          Skip
        </button>
      </div>

      {/* Main Visual */}
      <div className="py-6 flex flex-col items-center">
        <div className="relative w-full max-w-xs h-64 rounded-3xl overflow-hidden shadow-xl mb-6 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <h3 className="text-xl font-bold text-neutral-900 dark:text-white text-center leading-snug px-2 mb-2">
          {currentSlide.title}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center max-w-xs leading-relaxed">
          {currentSlide.subtitle}
        </p>

        {/* Dots Indicator */}
        <div className="flex items-center gap-1.5 mt-6">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlideIndex
                  ? 'w-6 bg-[#007A3D]'
                  : 'w-2 bg-neutral-200 dark:bg-neutral-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-2">
        <button
          onClick={() => {
            if (currentSlideIndex < slides.length - 1) {
              setStep((s) => s + 1);
            } else {
              setScreen('auth-login');
            }
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#007A3D] hover:bg-[#006432] text-white font-semibold text-sm shadow-lg shadow-[#007A3D]/25 flex items-center justify-center gap-2 tap-bounce transition-all"
        >
          {currentSlideIndex === slides.length - 1 ? 'Join Now' : 'Continue'}
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setScreen('home')}
          className="w-full py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 tap-bounce"
        >
          Explore as Guest
        </button>
      </div>
    </div>
  );
}
