'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Search, X, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { initialVendors, initialScamStores } from '@/data/digitalGoodsData';
import { isVendorOrDomainBlacklisted } from '@/lib/dataService';

interface ScamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScamModal({ isOpen, onClose }: ScamModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'blacklist' | 'verified'>('blacklist');

  if (!isOpen) return null;

  const isBlacklisted = searchQuery.trim() ? isVendorOrDomainBlacklisted(searchQuery) : false;
  const verifiedMatch = searchQuery.trim()
    ? initialVendors.find(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.domain.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0E1A14] rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <span>বিডি ডিজিটাল শপ ট্রাস্ট ও স্ক্যাম চেকার</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  Scam Shield BD
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                ফেসবুক পেজ বা ওয়েবসাইটের নাম/লিংক দিয়ে প্রতারক শপ যাচাই করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Search & Verify Input */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 bg-emerald-50/40 dark:bg-emerald-950/20">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 block">
            🔍 সন্দেহভাজন পেজ বা শপের নাম/নম্বর দিয়ে চেক করুন:
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="যেমন: SubsBhai, BD Netflix Store, 01833445566..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl bg-white dark:bg-[#15241C] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-neutral-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Real-time verification verdict */}
          {searchQuery.trim().length > 1 && (
            <div className="mt-3">
              {isBlacklisted ? (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-red-700 dark:text-red-300">
                      ⚠️ সতর্কতা: এটি একটি চিহ্নিত স্ক্যাম/প্রতারক শপ!
                    </h4>
                    <p className="text-[11px] text-red-600/90 dark:text-red-400 mt-0.5">
                      ফেসবুক কমিউনিটি ও গ্রাহকদের অসংখ্য অভিযোগ রয়েছে। টাকা নেওয়ার পর অ্যাকাউন্ট ব্লক বা সাপোর্ট বন্ধ করার রেকর্ড পাওয়া গেছে।
                    </p>
                  </div>
                </div>
              ) : verifiedMatch ? (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                      ✓ নিরাপদ ও ভেরিফাইড শপ: {verifiedMatch.name} ({verifiedMatch.domain})
                    </h4>
                    <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400 mt-0.5">
                      ট্রাস্ট স্কোর: {verifiedMatch.trustScore}/100 • ডেলিভারি: {verifiedMatch.deliverySpeed} • পেমেন্ট: {verifiedMatch.paymentMethods.join(', ')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      অপরিচিত শপ / আনভেরিফাইড
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                      আমাদের ভেরিফাইড তালিকায় এই শপটি নেই। অজানা ফেসবুক পেজে ব্যক্তিগত বিকাশ নম্বরে সেন্ড মানি করা থেকে বিরত থাকুন।
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-100 dark:border-neutral-800 px-5 pt-3 bg-neutral-50/30 dark:bg-neutral-900/20">
          <button
            onClick={() => setActiveTab('blacklist')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'blacklist'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ব্ল্যাকলিস্টেড স্ক্যাম শপসমূহ ({initialScamStores.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'verified'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ভেরিফাইড শপসমূহ ({initialVendors.length})</span>
          </button>
        </div>

        {/* Tab content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {activeTab === 'blacklist' ? (
            <div className="space-y-2.5">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                নিচের প্রতিষ্ঠানগুলোকে ফেসবুক গ্রুপ রিপোর্ট ও অভিযোগের ভিত্তিতে ব্ল্যাকলিস্ট করা হয়েছে:
              </p>
              {initialScamStores.map((scam) => (
                <div
                  key={scam.id}
                  className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#122018] border border-red-100 dark:border-red-950/50 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">
                        {scam.domainOrPageName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-extrabold uppercase">
                        {scam.riskTier} RISK
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                      {scam.reason}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] text-neutral-600 dark:text-neutral-400">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">
                        প্ল্যাটফর্ম: {scam.platform}
                      </span>
                      {scam.reportedPhoneNumbers?.map((p: string, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                          📞 {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {initialVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#122018] border border-emerald-100 dark:border-emerald-950/50 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <span>{vendor.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </h4>
                      <p className="text-[11px] text-neutral-400">{vendor.domain}</p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      {vendor.trustScore}/100
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">⚡ {vendor.deliverySpeed}</span>
                    <a
                      href={vendor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 text-center bg-neutral-50/50 dark:bg-neutral-900/30">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-all"
          >
            বন্ধ করুন (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
