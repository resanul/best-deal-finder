'use client';

/**
 * Bangladeshi Retailer Brand Logo & Badge Component
 * 
 * Location: src/components/ShopLogo.tsx
 * 
 * Bulletproof rendering:
 * - Attempts to load official logo image
 * - If blocked by hotlinking (403), missing (404), or CORS, instantly renders
 *   a high-contrast, authentic brand gradient badge with shop initials & store icon.
 * - Prevents empty black boxes and broken image icons across dark/light themes.
 */

import React, { useState } from 'react';
import { Store, Laptop, Cpu, ShieldCheck } from 'lucide-react';

export interface ShopBrandConfig {
  name: string;
  shortName: string;
  initials: string;
  gradient: string;
  textColor: string;
  borderColor: string;
  icon?: 'store' | 'laptop' | 'cpu';
}

export const SHOP_BRANDS: Record<string, ShopBrandConfig> = {
  startech: {
    name: 'Star Tech',
    shortName: 'StarTech',
    initials: 'ST',
    gradient: 'from-emerald-600 to-green-800',
    textColor: 'text-white',
    borderColor: 'border-emerald-500/40',
    icon: 'store',
  },
  ryans: {
    name: 'Ryans Computers',
    shortName: 'Ryans',
    initials: 'RC',
    gradient: 'from-amber-500 to-red-600',
    textColor: 'text-white',
    borderColor: 'border-amber-400/40',
    icon: 'laptop',
  },
  techland: {
    name: 'Techland BD',
    shortName: 'Techland',
    initials: 'TL',
    gradient: 'from-rose-600 to-red-800',
    textColor: 'text-white',
    borderColor: 'border-rose-500/40',
    icon: 'cpu',
  },
  globalbrand: {
    name: 'Global Brand BD',
    shortName: 'GlobalBrand',
    initials: 'GB',
    gradient: 'from-blue-700 to-indigo-900',
    textColor: 'text-white',
    borderColor: 'border-blue-500/40',
    icon: 'store',
  },
  samanta: {
    name: 'Samanta Computer',
    shortName: 'Samanta',
    initials: 'SC',
    gradient: 'from-blue-600 to-cyan-700',
    textColor: 'text-white',
    borderColor: 'border-cyan-500/40',
    icon: 'laptop',
  },
  walton: {
    name: 'Walton BD',
    shortName: 'Walton',
    initials: 'WB',
    gradient: 'from-sky-500 to-blue-700',
    textColor: 'text-white',
    borderColor: 'border-sky-400/40',
    icon: 'store',
  },
  potakait: {
    name: 'Potaka IT',
    shortName: 'Potaka IT',
    initials: 'PI',
    gradient: 'from-emerald-700 to-teal-900',
    textColor: 'text-white',
    borderColor: 'border-emerald-400/40',
    icon: 'store',
  },
  skyland: {
    name: 'Skyland BD',
    shortName: 'Skyland',
    initials: 'SK',
    gradient: 'from-cyan-600 to-blue-800',
    textColor: 'text-white',
    borderColor: 'border-cyan-400/40',
    icon: 'cpu',
  },
  ultratech: {
    name: 'Ultratech BD',
    shortName: 'Ultratech',
    initials: 'UT',
    gradient: 'from-purple-600 to-indigo-800',
    textColor: 'text-white',
    borderColor: 'border-purple-400/40',
    icon: 'laptop',
  },
  computervillage: {
    name: 'Computer Village',
    shortName: 'CVillage',
    initials: 'CV',
    gradient: 'from-amber-600 to-orange-800',
    textColor: 'text-white',
    borderColor: 'border-amber-500/40',
    icon: 'store',
  },
  uccbd: {
    name: 'UCC BD',
    shortName: 'UCC',
    initials: 'UCC',
    gradient: 'from-red-600 to-rose-900',
    textColor: 'text-white',
    borderColor: 'border-red-400/40',
    icon: 'cpu',
  },
  nexus: {
    name: 'Nexus Computer',
    shortName: 'Nexus',
    initials: 'NX',
    gradient: 'from-teal-600 to-emerald-800',
    textColor: 'text-white',
    borderColor: 'border-teal-400/40',
    icon: 'store',
  },
  creatus: {
    name: 'Creatus Computer',
    shortName: 'Creatus',
    initials: 'CC',
    gradient: 'from-orange-500 to-red-700',
    textColor: 'text-white',
    borderColor: 'border-orange-400/40',
    icon: 'laptop',
  },
  computermania: {
    name: 'Computer Mania BD',
    shortName: 'Mania',
    initials: 'CM',
    gradient: 'from-red-700 to-zinc-900',
    textColor: 'text-white',
    borderColor: 'border-red-500/40',
    icon: 'laptop',
  },
  custommacbd: {
    name: 'Custom Mac BD',
    shortName: 'CustomMac',
    initials: 'CM',
    gradient: 'from-slate-700 to-zinc-900',
    textColor: 'text-white',
    borderColor: 'border-slate-500/40',
    icon: 'laptop',
  },
  applegadgets: {
    name: 'Apple Gadgets BD',
    shortName: 'AppleGadgets',
    initials: 'AG',
    gradient: 'from-pink-600 to-purple-800',
    textColor: 'text-white',
    borderColor: 'border-pink-400/40',
    icon: 'store',
  },
  sumashtech: {
    name: 'Sumash Tech',
    shortName: 'Sumash',
    initials: 'ST',
    gradient: 'from-indigo-600 to-violet-800',
    textColor: 'text-white',
    borderColor: 'border-indigo-400/40',
    icon: 'store',
  },
  pchouse: {
    name: 'PC House BD',
    shortName: 'PCHouse',
    initials: 'PC',
    gradient: 'from-blue-700 to-slate-900',
    textColor: 'text-white',
    borderColor: 'border-blue-400/40',
    icon: 'cpu',
  },
  smartbd: {
    name: 'Smart Technologies BD',
    shortName: 'SmartTech',
    initials: 'SM',
    gradient: 'from-red-600 to-slate-800',
    textColor: 'text-white',
    borderColor: 'border-red-400/40',
    icon: 'store',
  },
  bdtechvalley: {
    name: 'BD Tech Valley',
    shortName: 'TechValley',
    initials: 'BV',
    gradient: 'from-teal-500 to-emerald-700',
    textColor: 'text-white',
    borderColor: 'border-teal-400/40',
    icon: 'cpu',
  },
  kablewala: {
    name: 'Kablewala BD',
    shortName: 'Kablewala',
    initials: 'KW',
    gradient: 'from-orange-600 to-amber-700',
    textColor: 'text-white',
    borderColor: 'border-orange-400/40',
    icon: 'store',
  },
  cloud9: {
    name: 'Cloud9 Computers',
    shortName: 'Cloud9',
    initials: 'C9',
    gradient: 'from-sky-500 to-indigo-700',
    textColor: 'text-white',
    borderColor: 'border-sky-400/40',
    icon: 'laptop',
  },
};

const DEFAULT_BRAND: ShopBrandConfig = {
  name: 'Retail Store',
  shortName: 'Store',
  initials: 'BD',
  gradient: 'from-emerald-600 to-teal-800',
  textColor: 'text-white',
  borderColor: 'border-emerald-500/40',
  icon: 'store',
};

interface ShopLogoProps {
  shopId?: string;
  shopName?: string;
  logoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showNameFallback?: boolean;
}

export default function ShopLogo({
  shopId,
  shopName,
  logoUrl,
  size = 'md',
  className = '',
  showNameFallback = false,
}: ShopLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);

  // Derive canonical slug key
  const normalizedKey = (shopId || shopName || '')
    .toLowerCase()
    .replace('shop-', '')
    .replace(/[^a-z0-9]/g, '');

  // Look up configured brand styling
  let brand = SHOP_BRANDS[normalizedKey];
  if (!brand) {
    // Attempt fuzzy match by name
    const found = Object.values(SHOP_BRANDS).find(
      (b) =>
        (shopName && b.name.toLowerCase().includes(shopName.toLowerCase())) ||
        (shopName && shopName.toLowerCase().includes(b.name.toLowerCase()))
    );
    brand = found || DEFAULT_BRAND;
  }

  // Size dimensions
  const sizeStyles = {
    xs: {
      box: 'w-6 h-6 rounded-md',
      text: 'text-[9px] font-black',
      icon: 'w-3 h-3',
      imgPad: 'p-0.5',
    },
    sm: {
      box: 'w-8 h-8 rounded-lg',
      text: 'text-[11px] font-black tracking-tight',
      icon: 'w-4 h-4',
      imgPad: 'p-1',
    },
    md: {
      box: 'w-12 h-12 rounded-xl',
      text: 'text-xs sm:text-sm font-black tracking-tight',
      icon: 'w-5 h-5',
      imgPad: 'p-1.5',
    },
    lg: {
      box: 'w-16 h-16 rounded-2xl',
      text: 'text-base font-black tracking-wider',
      icon: 'w-7 h-7',
      imgPad: 'p-2',
    },
    xl: {
      box: 'w-20 h-20 rounded-2xl',
      text: 'text-lg font-black tracking-wider',
      icon: 'w-8 h-8',
      imgPad: 'p-2.5',
    },
  }[size];

  // If remote image is available and hasn't failed, try rendering it
  if (logoUrl && !imageFailed) {
    return (
      <div
        className={`${sizeStyles.box} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 ${sizeStyles.imgPad} flex items-center justify-center shrink-0 shadow-xs overflow-hidden ${className}`}
      >
        <img
          src={logoUrl}
          alt={shopName || brand.name}
          className="max-h-full max-w-full object-contain"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  // Fallback: Vibrant, beautifully styled authentic brand gradient badge
  return (
    <div
      className={`${sizeStyles.box} bg-gradient-to-br ${brand.gradient} ${brand.textColor} border ${brand.borderColor} flex flex-col items-center justify-center shrink-0 shadow-md select-none ${className}`}
      title={shopName || brand.name}
    >
      <span className={`${sizeStyles.text} uppercase drop-shadow-xs font-black`}>
        {brand.initials}
      </span>
      {size === 'lg' || size === 'xl' ? (
        <span className="text-[9px] font-semibold opacity-90 tracking-tight -mt-0.5 max-w-[90%] truncate text-center">
          {brand.shortName}
        </span>
      ) : null}
    </div>
  );
}
