'use client';

/**
 * Admin Shop Registry & Vendor Management Dashboard
 * 
 * Location: src/components/AdminShopRegistry.tsx
 * Framework: React 19, Tailwind CSS v4, Lucide React
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Store,
  Globe,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  PauseCircle,
  ExternalLink,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Filter,
  Check,
  Radio,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  TrackedShop,
  ShopMetrics,
  RetailerAdapterType,
} from '@/types/physicalGoods';
import { TRACKED_RETAILERS } from '@/data/physicalGoodsData';
import ShopLogo from './ShopLogo';

interface AdminShopRegistryProps {
  initialShops?: TrackedShop[];
  initialMetrics?: ShopMetrics;
  onShopSelect?: (shop: TrackedShop) => void;
}

const DEFAULT_METRICS: ShopMetrics = {
  totalShops: TRACKED_RETAILERS.length,
  activeShops: TRACKED_RETAILERS.filter((s) => s.isTracked).length,
  pausedShops: TRACKED_RETAILERS.filter((s) => !s.isTracked).length,
  knownRetailers: TRACKED_RETAILERS.filter((s) => s.adapterType !== 'generic').length,
  genericShops: TRACKED_RETAILERS.filter((s) => s.adapterType === 'generic').length,
  totalProductsScraped: TRACKED_RETAILERS.reduce((acc, s) => acc + (s.productCount || 0), 0),
};

const ADAPTER_BADGES: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  startech: {
    label: 'Star Tech',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  ryans: {
    label: 'Ryans',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  globalbrand: {
    label: 'Global Brand',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
  },
  samanta: {
    label: 'Samanta',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  walton: {
    label: 'Walton BD',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
  },
  techland: {
    label: 'Techland BD',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
  generic: {
    label: 'Generic Store',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
  },
};

export default function AdminShopRegistry({
  initialShops,
  initialMetrics,
  onShopSelect,
}: AdminShopRegistryProps) {
  // Data State
  const [shops, setShops] = useState<TrackedShop[]>(
    initialShops && initialShops.length > 0 ? initialShops : TRACKED_RETAILERS
  );
  const [metrics, setMetrics] = useState<ShopMetrics>(
    initialMetrics || DEFAULT_METRICS
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialShops && TRACKED_RETAILERS.length === 0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Form State
  const [inputUrl, setInputUrl] = useState<string>('');
  const [inputName, setInputName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formFeedback, setFormFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [adapterFilter, setAdapterFilter] = useState<string>('all');
  const [deletingShopId, setDeletingShopId] = useState<string | null>(null);

  // Load shops and metrics from API with TRACKED_RETAILERS fallback
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/shops');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.shops?.length > 0) {
          setShops(data.shops);
          if (data.metrics) setMetrics(data.metrics);
        } else {
          setShops(TRACKED_RETAILERS);
          setMetrics(DEFAULT_METRICS);
        }
      } else {
        setShops(TRACKED_RETAILERS);
        setMetrics(DEFAULT_METRICS);
      }
    } catch (err) {
      console.warn('API unreachable, falling back to TRACKED_RETAILERS:', err);
      setShops(TRACKED_RETAILERS);
      setMetrics(DEFAULT_METRICS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    if (!initialShops || initialShops.length === 0) {
      fetch('/api/shops')
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (isSubscribed && data.success && data.shops?.length > 0) {
            setShops(data.shops);
            if (data.metrics) setMetrics(data.metrics);
          } else if (isSubscribed) {
            setShops(TRACKED_RETAILERS);
            setMetrics(DEFAULT_METRICS);
          }
        })
        .catch((err) => {
          if (isSubscribed) {
            console.warn('Static export / API unavailable, using TRACKED_RETAILERS fallback:', err);
            setShops(TRACKED_RETAILERS);
            setMetrics(DEFAULT_METRICS);
          }
        })
        .finally(() => {
          if (isSubscribed) {
            setIsLoading(false);
          }
        });
    }
    return () => {
      isSubscribed = false;
    };
  }, [initialShops]);

  // Real-time URL preview classifier
  const detectedPreview = useMemo(() => {
    const raw = inputUrl.trim().toLowerCase();
    if (!raw) return null;

    if (raw.includes('startech.com.bd')) {
      return {
        name: 'Star Tech',
        adapter: 'startech' as RetailerAdapterType,
        isKnown: true,
      };
    }
    if (raw.includes('ryanscomputers.com') || raw.includes('ryans.com')) {
      return {
        name: 'Ryans Computers',
        adapter: 'ryans' as RetailerAdapterType,
        isKnown: true,
      };
    }
    if (raw.includes('globalbrand.com.bd')) {
      return {
        name: 'Global Brand',
        adapter: 'globalbrand' as RetailerAdapterType,
        isKnown: true,
      };
    }
    if (raw.includes('samantacomputer.com')) {
      return {
        name: 'Samanta Computer',
        adapter: 'samanta' as RetailerAdapterType,
        isKnown: true,
      };
    }
    if (raw.includes('waltonbd.com')) {
      return {
        name: 'Walton',
        adapter: 'walton' as RetailerAdapterType,
        isKnown: true,
      };
    }
    if (raw.includes('techlandbd.com') || raw.includes('techmenia.com.bd')) {
      return {
        name: 'Techland BD',
        adapter: 'techland' as RetailerAdapterType,
        isKnown: true,
      };
    }

    if (raw.includes('.') && raw.length > 4) {
      return {
        name: 'Generic E-Commerce Store',
        adapter: 'generic' as RetailerAdapterType,
        isKnown: false,
      };
    }

    return null;
  }, [inputUrl]);

  // Register New Shop
  const handleRegisterShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsSubmitting(true);
    setFormFeedback(null);

    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputUrl.trim(),
          name: inputName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormFeedback({
          type: 'success',
          message: data.message || `Shop "${data.shop.name}" registered successfully!`,
        });
        setInputUrl('');
        setInputName('');
        await refreshData();
      } else {
        setFormFeedback({
          type: 'error',
          message: data.error || 'Failed to register shop.',
        });
      }
    } catch (err: unknown) {
      setFormFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Network error while registering shop.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Tracking Status
  const handleToggleTracking = async (shop: TrackedShop) => {
    setActionLoadingId(shop.id);
    try {
      const res = await fetch(`/api/shops/${shop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggle: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.shop) {
          setShops((prev) =>
            prev.map((s) => (s.id === shop.id ? data.shop : s))
          );
          setMetrics((prev) => ({
            ...prev,
            activeShops: data.shop.isTracked
              ? prev.activeShops + 1
              : prev.activeShops - 1,
            pausedShops: data.shop.isTracked
              ? prev.pausedShops - 1
              : prev.pausedShops + 1,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to toggle tracking:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Shop
  const handleDeleteShop = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/shops/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setShops((prev) => prev.filter((s) => s.id !== id));
        setDeletingShopId(null);
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to delete shop:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Shops
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      // Status filter
      if (statusFilter === 'active' && !shop.isTracked) return false;
      if (statusFilter === 'paused' && shop.isTracked) return false;

      // Adapter filter
      if (adapterFilter !== 'all' && shop.adapterType !== adapterFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          shop.name.toLowerCase().includes(q) ||
          shop.domain.toLowerCase().includes(q) ||
          shop.adapterType.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [shops, statusFilter, adapterFilter, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER & DASHBOARD METRICS BAR                             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Store className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Vendor Management & Shop Registry
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure tracked Bangladeshi physical tech retailers and dynamic generic e-commerce stores.
          </p>
        </div>

        <button
          onClick={refreshData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors disabled:opacity-50"
          title="Refresh Registry Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Shops</span>
            <Store className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {metrics.totalShops || shops.length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-medium">Active Crawl</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {metrics.activeShops}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-medium">Paused</span>
            <PauseCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {metrics.pausedShops}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-medium">BD Retailers</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-400">
            {metrics.knownRetailers}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-medium">Generic CMS</span>
            <Globe className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-400">
            {metrics.genericShops}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Scraped Offers</span>
            <ShoppingBag className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {metrics.totalProductsScraped.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. REGISTER NEW SHOP BY URL FORM                              */}
      {/* ------------------------------------------------------------- */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">
              Register New Shop by URL
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Auto-detects Star Tech, Ryans, Walton, Techland, WooCommerce & Shopify
          </span>
        </div>

        <form onSubmit={handleRegisterShop} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Shop Website URL <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="https://www.startech.com.bd or https://any-gadget-shop.com"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Display Name <span className="text-slate-500">(Optional override)</span>
              </label>
              <input
                type="text"
                placeholder={detectedPreview?.name || 'e.g. Star Tech Dhaka'}
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Instant Detection Preview Badge */}
          {detectedPreview && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium">Detection Result:</span>
              {detectedPreview.isKnown ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Known Bangladeshi Retailer: {detectedPreview.name} ({detectedPreview.adapter} adapter)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                  <Globe className="w-3.5 h-3.5" />
                  Generic E-Commerce Store (Auto-detecting CMS on save)
                </span>
              )}
            </div>
          )}

          {/* Feedback Alerts */}
          {formFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                formFeedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }`}
            >
              {formFeedback.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{formFeedback.message}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !inputUrl.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Probing & Registering...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Add Shop to Tracking
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SEARCH & FILTER CONTROLS                                   */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search shops by name, domain, or adapter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({shops.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({shops.filter((s) => s.isTracked).length})
          </button>
          <button
            onClick={() => setStatusFilter('paused')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'paused'
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paused ({shops.filter((s) => !s.isTracked).length})
          </button>
        </div>

        {/* Adapter Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={adapterFilter}
            onChange={(e) => setAdapterFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 py-1.5 px-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Adapters</option>
            <option value="startech">Star Tech</option>
            <option value="ryans">Ryans</option>
            <option value="globalbrand">Global Brand</option>
            <option value="samanta">Samanta</option>
            <option value="walton">Walton</option>
            <option value="techland">Techland</option>
            <option value="generic">Generic</option>
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. TRACKED SHOPS TABLE & CARDS                                */}
      {/* ------------------------------------------------------------- */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
          <p className="text-sm">Loading tracked shop registry...</p>
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Store className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-medium text-slate-300">No shops found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or filter settings above.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-3 px-4">Shop & Domain</th>
                  <th className="py-3 px-4">Scraper Adapter</th>
                  <th className="py-3 px-4">Tracking Status</th>
                  <th className="py-3 px-4">Last Scraped</th>
                  <th className="py-3 px-4 text-center">Offers Found</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredShops.map((shop) => {
                  const badge = ADAPTER_BADGES[shop.adapterType] || ADAPTER_BADGES.generic;
                  const isActionLoading = actionLoadingId === shop.id;

                  return (
                    <tr
                      key={shop.id}
                      className="hover:bg-slate-800/30 transition-colors"
                      onClick={() => onShopSelect && onShopSelect(shop)}
                    >
                      {/* Name & Domain */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <ShopLogo
                            shopId={shop.id}
                            shopName={shop.name}
                            logoUrl={shop.logoUrl}
                            size="sm"
                          />
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {shop.name}
                              <a
                                href={shop.baseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-emerald-400 transition-colors"
                                title="Visit website"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="text-slate-400 text-[11px] font-mono">
                              {shop.domain}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Adapter */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Active Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTracking(shop);
                          }}
                          disabled={isActionLoading}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            shop.isTracked
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {shop.isTracked ? (
                            <>
                              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                              Active
                            </>
                          ) : (
                            <>
                              <PauseCircle className="w-3 h-3 text-slate-500" />
                              Paused
                            </>
                          )}
                        </button>
                      </td>

                      {/* Last Scraped */}
                      <td className="py-3.5 px-4 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {shop.lastScrapedAt
                              ? new Date(shop.lastScrapedAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Not yet scraped'}
                          </span>
                        </div>
                        {shop.errorMessage && (
                          <div className="text-rose-400 text-[10px] mt-0.5 truncate max-w-xs">
                            {shop.errorMessage}
                          </div>
                        )}
                      </td>

                      {/* Product Count */}
                      <td className="py-3.5 px-4 text-center font-medium text-slate-200">
                        {shop.productCount.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {deletingShopId === shop.id ? (
                          <div className="inline-flex items-center gap-1 bg-rose-950/80 p-1 rounded-lg border border-rose-800">
                            <span className="text-[10px] text-rose-300 px-1">Delete?</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteShop(shop.id);
                              }}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-medium"
                            >
                              Yes
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingShopId(null);
                              }}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingShopId(shop.id);
                            }}
                            disabled={isActionLoading}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete shop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Stack (< 768px) */}
          <div className="block md:hidden divide-y divide-slate-800">
            {filteredShops.map((shop) => {
              const badge = ADAPTER_BADGES[shop.adapterType] || ADAPTER_BADGES.generic;

              return (
                <div
                  key={shop.id}
                  className="p-4 space-y-3"
                  onClick={() => onShopSelect && onShopSelect(shop)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {shop.name}
                        <a
                          href={shop.baseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-emerald-400"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {shop.domain}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <div>
                      Offers: <span className="text-white font-medium">{shop.productCount}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTracking(shop);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        shop.isTracked
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {shop.isTracked ? 'Active' : 'Paused'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
