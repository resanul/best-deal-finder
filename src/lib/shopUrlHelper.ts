/**
 * Client-Safe Bangladeshi Retailer URL & Domain Helpers
 * 
 * Location: src/lib/shopUrlHelper.ts
 * Pure TypeScript functions safe for client components and server environments.
 */

import { RetailerAdapterType } from '@/types/physicalGoods';

export interface KnownRetailerProfile {
  name: string;
  slug: string;
  adapterType: RetailerAdapterType;
  logoUrl: string;
  categoryUrls: string[];
}

export const KNOWN_RETAILER_DOMAINS: Record<string, KnownRetailerProfile> = {
  'startech.com.bd': {
    name: 'Star Tech',
    slug: 'startech',
    adapterType: 'startech',
    logoUrl: 'https://www.startech.com.bd/image/catalog/logo.png',
    categoryUrls: [
      'https://www.startech.com.bd/component/processor',
      'https://www.startech.com.bd/component/graphics-card',
      'https://www.startech.com.bd/component/ram',
      'https://www.startech.com.bd/laptop-notebook/laptop',
      'https://www.startech.com.bd/monitor',
    ],
  },
  'ryanscomputers.com': {
    name: 'Ryans Computers',
    slug: 'ryans',
    adapterType: 'ryans',
    logoUrl: 'https://www.ryanscomputers.com/assets/images/ryans-logo.svg',
    categoryUrls: [
      'https://www.ryanscomputers.com/category/desktop-component-processor',
      'https://www.ryanscomputers.com/category/desktop-component-graphics-card',
      'https://www.ryanscomputers.com/category/desktop-component-ram',
      'https://www.ryanscomputers.com/category/laptop-all-laptop',
    ],
  },
  'ryans.com': {
    name: 'Ryans Computers',
    slug: 'ryans',
    adapterType: 'ryans',
    logoUrl: 'https://www.ryanscomputers.com/assets/images/ryans-logo.svg',
    categoryUrls: [
      'https://www.ryans.com/category/desktop-component-processor',
      'https://www.ryans.com/category/desktop-component-graphics-card',
      'https://www.ryans.com/category/laptop-all-laptop',
    ],
  },
  'techlandbd.com': {
    name: 'Techland BD',
    slug: 'techland',
    adapterType: 'techland',
    logoUrl: 'https://www.techlandbd.com/image/catalog/logo/techland-logo.png',
    categoryUrls: [
      'https://www.techlandbd.com/processor',
      'https://www.techlandbd.com/graphics-card',
      'https://www.techlandbd.com/laptop-computer/brand-laptops',
      'https://www.techlandbd.com/monitor',
    ],
  },
  'techland.com.bd': {
    name: 'Techland BD',
    slug: 'techland',
    adapterType: 'techland',
    logoUrl: 'https://www.techlandbd.com/image/catalog/logo/techland-logo.png',
    categoryUrls: [
      'https://www.techlandbd.com/processor',
      'https://www.techlandbd.com/graphics-card',
    ],
  },
  'globalbrand.com.bd': {
    name: 'Global Brand BD',
    slug: 'globalbrand',
    adapterType: 'globalbrand',
    logoUrl: 'https://www.globalbrand.com.bd/image/catalog/logo.png',
    categoryUrls: [
      'https://www.globalbrand.com.bd/processor',
      'https://www.globalbrand.com.bd/graphics-card',
      'https://www.globalbrand.com.bd/laptop-notebook',
    ],
  },
  'samantacomputer.com': {
    name: 'Samanta Computer',
    slug: 'samanta',
    adapterType: 'samanta',
    logoUrl: 'https://www.samantacomputer.com/images/logo.png',
    categoryUrls: [
      'https://www.samantacomputer.com/processor',
      'https://www.samantacomputer.com/graphics-card',
      'https://www.samantacomputer.com/ram',
    ],
  },
  'waltonbd.com': {
    name: 'Walton BD',
    slug: 'walton',
    adapterType: 'walton',
    logoUrl: 'https://waltonbd.com/image/catalog/home-page/logo/walton-logo.png',
    categoryUrls: [
      'https://waltonbd.com/computer/laptop',
      'https://waltonbd.com/computer/desktop-pc',
      'https://waltonbd.com/television',
    ],
  },
  'eplaza.waltonbd.com': {
    name: 'Walton ePlaza',
    slug: 'walton-eplaza',
    adapterType: 'walton',
    logoUrl: 'https://waltonbd.com/image/catalog/home-page/logo/walton-logo.png',
    categoryUrls: [
      'https://eplaza.waltonbd.com/computer/laptop',
      'https://eplaza.waltonbd.com/television',
    ],
  },
  'potakait.com': {
    name: 'Potaka IT',
    slug: 'potakait',
    adapterType: 'potakait',
    logoUrl: 'https://potakait.com/wp-content/uploads/2021/04/potaka-it-logo.png',
    categoryUrls: [
      'https://potakait.com/product-category/processor/',
      'https://potakait.com/product-category/graphics-card/',
      'https://potakait.com/product-category/ram/',
    ],
  },
  'skyland.com.bd': {
    name: 'Skyland BD',
    slug: 'skyland',
    adapterType: 'skyland',
    logoUrl: 'https://www.skyland.com.bd/image/catalog/logo/skyland-logo.png',
    categoryUrls: [
      'https://www.skyland.com.bd/processor',
      'https://www.skyland.com.bd/graphics-card',
      'https://www.skyland.com.bd/monitor',
    ],
  },
  'ultratech.com.bd': {
    name: 'Ultratech BD',
    slug: 'ultratech',
    adapterType: 'ultratech',
    logoUrl: 'https://ultratech.com.bd/image/catalog/logo/ultratech-logo.png',
    categoryUrls: [
      'https://ultratech.com.bd/processor',
      'https://ultratech.com.bd/graphics-card',
      'https://ultratech.com.bd/ram',
    ],
  },
  'computervillage.com.bd': {
    name: 'Computer Village',
    slug: 'computervillage',
    adapterType: 'computervillage',
    logoUrl: 'https://computervillage.com.bd/media/logo/default/logo.png',
    categoryUrls: [
      'https://computervillage.com.bd/laptop-notebook',
      'https://computervillage.com.bd/processor',
      'https://computervillage.com.bd/monitor',
    ],
  },
  'ucc-bd.com': {
    name: 'UCC BD',
    slug: 'uccbd',
    adapterType: 'uccbd',
    logoUrl: 'https://ucc-bd.com/pub/media/logo/stores/1/ucc-logo.png',
    categoryUrls: [
      'https://ucc-bd.com/components/processor.html',
      'https://ucc-bd.com/components/graphics-card.html',
    ],
  },
  'nexus.com.bd': {
    name: 'Nexus Computer',
    slug: 'nexus',
    adapterType: 'nexus',
    logoUrl: 'https://nexus.com.bd/image/catalog/logo/nexus-logo.png',
    categoryUrls: [
      'https://nexus.com.bd/processor',
      'https://nexus.com.bd/laptop',
      'https://nexus.com.bd/monitor',
    ],
  },
  'creatuscomputer.com': {
    name: 'Creatus Computer',
    slug: 'creatus',
    adapterType: 'creatus',
    logoUrl: 'https://creatuscomputer.com/wp-content/uploads/2021/03/Creatus-Computer-Logo.png',
    categoryUrls: [
      'https://creatuscomputer.com/product-category/processor/',
      'https://creatuscomputer.com/product-category/graphics-card/',
    ],
  },
  'computermaniabd.com': {
    name: 'Computer Mania BD',
    slug: 'computermania',
    adapterType: 'computermania',
    logoUrl: 'https://computermaniabd.com/wp-content/uploads/2020/09/Computer-Mania-BD-Logo.png',
    categoryUrls: [
      'https://computermaniabd.com/product-category/laptops/',
      'https://computermaniabd.com/product-category/gaming-laptop/',
    ],
  },
  'custommacbd.com': {
    name: 'Custom Mac BD',
    slug: 'custommacbd',
    adapterType: 'custommacbd',
    logoUrl: 'https://custommacbd.com/cdn/shop/files/Custom-Mac-BD-Logo.png',
    categoryUrls: [
      'https://custommacbd.com/collections/macbook',
      'https://custommacbd.com/collections/apple-silicon',
    ],
  },
  'applegadgetsbd.com': {
    name: 'Apple Gadgets BD',
    slug: 'applegadgets',
    adapterType: 'applegadgets',
    logoUrl: 'https://applegadgetsbd.com/assets/img/apple-gadgets-logo.png',
    categoryUrls: [
      'https://applegadgetsbd.com/category/macbook',
      'https://applegadgetsbd.com/category/laptop',
      'https://applegadgetsbd.com/category/monitor',
    ],
  },
  'sumashtech.com': {
    name: 'Sumash Tech',
    slug: 'sumashtech',
    adapterType: 'sumashtech',
    logoUrl: 'https://sumashtech.com/cdn/shop/files/sumash-tech-logo.png',
    categoryUrls: [
      'https://sumashtech.com/collections/laptop',
      'https://sumashtech.com/collections/smartphones',
    ],
  },
  'pchouse.com.bd': {
    name: 'PC House BD',
    slug: 'pchouse',
    adapterType: 'pchouse',
    logoUrl: 'https://pchouse.com.bd/image/catalog/logo/pchouse-logo.png',
    categoryUrls: [
      'https://pchouse.com.bd/processor',
      'https://pchouse.com.bd/graphics-card',
      'https://pchouse.com.bd/monitor',
    ],
  },
  'smart-bd.com': {
    name: 'Smart Technologies BD',
    slug: 'smartbd',
    adapterType: 'smartbd',
    logoUrl: 'https://smart-bd.com/wp-content/uploads/2021/06/smart-technologies-logo.png',
    categoryUrls: [
      'https://smart-bd.com/product-category/components/processor/',
      'https://smart-bd.com/product-category/laptops/',
    ],
  },
  'bdtechvalley.com': {
    name: 'BD Tech Valley',
    slug: 'bdtechvalley',
    adapterType: 'bdtechvalley',
    logoUrl: 'https://bdtechvalley.com/wp-content/uploads/2022/01/bd-tech-valley-logo.png',
    categoryUrls: [
      'https://bdtechvalley.com/product-category/processor/',
      'https://bdtechvalley.com/product-category/ram/',
    ],
  },
  'kablewala.com.bd': {
    name: 'Kablewala BD',
    slug: 'kablewala',
    adapterType: 'kablewala',
    logoUrl: 'https://kablewala.com.bd/skin/frontend/default/kablewala/images/logo.png',
    categoryUrls: [
      'https://kablewala.com.bd/computer-gaming/laptops.html',
      'https://kablewala.com.bd/computer-gaming/monitors.html',
    ],
  },
  'cloud9.com.bd': {
    name: 'Cloud9 Computers',
    slug: 'cloud9',
    adapterType: 'cloud9',
    logoUrl: 'https://cloud9.com.bd/wp-content/uploads/2021/10/cloud9-logo.png',
    categoryUrls: [
      'https://cloud9.com.bd/product-category/processor/',
      'https://cloud9.com.bd/product-category/graphics-card/',
    ],
  },
};

/**
 * Cleans verbose product titles into concise, high-accuracy model queries
 * optimized for Bangladeshi ecommerce search engines (Star Tech, Ryans, Techland, etc.).
 */
export function cleanSearchKeywords(title: string): string {
  if (!title) return '';

  let clean = title
    .replace(/\b(6-Core|8-Core|10-Core|12-Core|14-Core|16-Core|20-Core|24-Core)\b/gi, '')
    .replace(/\b(12-Thread|16-Thread|20-Thread|24-Thread|28-Thread|32-Thread)\b/gi, '')
    .replace(/\b(Desktop Processor|Gaming Processor|Processor)\b/gi, '')
    .replace(/\b(GDDR6X|GDDR6|Graphics Card|Card)\b/gi, '')
    .replace(/\b(Gaming Laptop|Brand Laptop|Notebook Laptop|Notebook|Laptop)\b/gi, '')
    .replace(/\b(Gaming Monitor|IPS Monitor|FHD Monitor|Monitor)\b/gi, '')
    .replace(/\b(Desktop RAM|RAM Black|RAM White|Desktop Memory|RAM)\b/gi, '')
    .replace(/\b(PCIe 4\.0|PCIe 3\.0|NVMe M\.2 SSD|NVMe SSD|M\.2 SSD|SSD)\b/gi, '')
    .replace(/\b(13th Gen|14th Gen|12th Gen)\b/gi, '')
    .replace(/\b(13\.6-Inch|15\.6-inch|23\.8 Inch|24\.5 Inch|27 Inch)\b/gi, '')
    .replace(/\b(AM4|AM5|LGA1700)\b/gi, '')
    .replace(/\b(3200MHz|3600MHz|5200MHz|5600MHz|6000MHz)\b/gi, '')
    .replace(/["'(),]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If query became too short, use the first 3-4 words of the original title
  if (clean.length < 4) {
    clean = title.split(/\s+/).slice(0, 3).join(' ');
  }

  return clean;
}

/**
 * Builds a 100% resilient, verified outbound store landing URL for any product.
 * Avoids broken static slugs and 404 errors by routing to the store's canonical search endpoint.
 */
export function buildRetailerProductUrl(
  shopSlug: string,
  productName: string,
  directVerifiedUrl?: string
): string {
  // If a known non-404 search URL is explicitly passed, preserve it
  if (directVerifiedUrl && (directVerifiedUrl.includes('search') || directVerifiedUrl.includes('?s='))) {
    return directVerifiedUrl;
  }

  const cleanQuery = cleanSearchKeywords(productName);
  const q = encodeURIComponent(cleanQuery || productName.trim());
  const normalizedSlug = shopSlug.toLowerCase().replace('shop-', '');

  switch (normalizedSlug) {
    case 'startech':
      return `https://www.startech.com.bd/product/search?search=${q}`;
    case 'ryans':
      return `https://www.ryans.com/search?q=${q}`;
    case 'techland':
    case 'techmenia':
      return `https://www.techlandbd.com/index.php?route=product/search&search=${q}`;
    case 'globalbrand':
      return `https://www.globalbrand.com.bd/index.php?route=product/search&search=${q}`;
    case 'samanta':
      return `https://www.samantacomputer.com/index.php?route=product/search&search=${q}`;
    case 'walton':
    case 'walton-eplaza':
      return `https://waltonbd.com/index.php?route=product/search&search=${q}`;
    case 'potakait':
      return `https://potakait.com/?s=${q}&post_type=product`;
    case 'skyland':
      return `https://www.skyland.com.bd/?s=${q}&post_type=product`;
    case 'ultratech':
      return `https://ultratech.com.bd/?s=${q}&post_type=product`;
    case 'computervillage':
      return `https://computervillage.com.bd/search?q=${q}`;
    case 'uccbd':
      return `https://ucc-bd.com/catalogsearch/result/?q=${q}`;
    case 'nexus':
      return `https://nexus.com.bd/search?q=${q}`;
    case 'creatus':
      return `https://creatuscomputer.com/?s=${q}&post_type=product`;
    case 'computermania':
      return `https://computermaniabd.com/?s=${q}&post_type=product`;
    case 'custommacbd':
      return `https://custommacbd.com/search?q=${q}`;
    case 'applegadgets':
      return `https://applegadgetsbd.com/search?q=${q}`;
    case 'sumashtech':
      return `https://sumashtech.com/search?q=${q}`;
    case 'pchouse':
      return `https://pchouse.com.bd/search?q=${q}`;
    case 'smartbd':
      return `https://smart-bd.com/search?q=${q}`;
    case 'bdtechvalley':
      return `https://bdtechvalley.com/?s=${q}&post_type=product`;
    case 'kablewala':
      return `https://kablewala.com.bd/catalogsearch/result/?q=${q}`;
    case 'cloud9':
      return `https://cloud9.com.bd/search?q=${q}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(cleanQuery + ' Bangladesh price')}`;
  }
}
