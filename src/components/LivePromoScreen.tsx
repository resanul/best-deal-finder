'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Radio, Gift, CheckCircle2, Sparkles, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LivePromoScreen() {
  const { navigateBack, setScreen, applyVoucher } = useApp();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const quiz = {
    question: 'What is the signature ingredient in our best-selling Red Chilly Chips?',
    options: [
      'A) Kashmiri Red Chilli & Sea Salt',
      'B) Artificial Chili Powder',
      'C) Black Peppercorn Only',
      'D) White Wasabi Extract',
    ],
    correctIndex: 0,
    prizeCode: 'RAMADAN30',
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    if (selectedOption === quiz.correctIndex) {
      applyVoucher('SAVE30');
      try {
        confetti({ particleCount: 80, spread: 60 });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-full pb-10 bg-[#F4FBF6] dark:bg-[#0B1410] text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <div className="bg-white dark:bg-[#121f18] p-4 flex items-center justify-between border-b border-[#d1ead8] dark:border-[#22382c] sticky top-0 z-20">
        <button
          onClick={navigateBack}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tap-bounce"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-xs">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Halal Live Stream</span>
        </div>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* Live Video Mock */}
        <div className="relative w-full h-52 rounded-3xl overflow-hidden bg-black shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
            alt="Live host"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wide uppercase">
              LIVE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold">
              👁 1,429 watching
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs flex items-center justify-between">
            <div>
              <p className="font-bold">Organic Farm Harvest Special</p>
              <p className="text-[10px] text-white/70">Host: Chef Farhan</p>
            </div>
            <button
              onClick={() => setScreen('cart')}
              className="px-3 py-1.5 bg-[#007A3D] text-white text-xs font-bold rounded-xl tap-bounce"
            >
              Shop Deals
            </button>
          </div>
        </div>

        {/* Live Quiz Card (Figma Row 08) */}
        {!submitted ? (
          <div className="bg-white dark:bg-[#14231b] p-5 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-[#EA580C]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#EA580C]">
                Interactive Live Quiz • Win 30% Off
              </h3>
            </div>

            <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug mb-4">
              {quiz.question}
            </h4>

            <div className="space-y-2.5 mb-5">
              {quiz.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full p-3.5 rounded-2xl text-left text-xs font-semibold border transition-all tap-bounce ${
                    selectedOption === idx
                      ? 'bg-[#F2FAF4] dark:bg-[#172920] border-[#007A3D] text-[#007A3D] dark:text-emerald-400 font-bold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-[#F4FBF6]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="w-full py-3.5 rounded-2xl bg-[#007A3D] text-white text-xs font-bold shadow-md tap-bounce disabled:opacity-40"
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#14231b] p-6 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#007A3D] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Thanks for Joining!
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              You answered correctly! 30% Discount voucher code &ldquo;SAVE30&rdquo; has been applied to your cart.
            </p>
            <button
              onClick={() => setScreen('cart')}
              className="mt-5 w-full py-3.5 rounded-2xl bg-[#007A3D] text-white text-xs font-bold tap-bounce shadow-md"
            >
              Go to Cart &amp; Redeem
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
