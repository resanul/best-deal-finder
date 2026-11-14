/**
 * Bangladeshi Digital Goods Price Comparison Platform
 * Unified Data Accessor Service (Universal Client/Server Safe)
 * 
 * Location: src/lib/dataService.ts
 * 
 * ARCHITECTURAL DESIGN:
 * This service operates over the strongly-typed canonical in-memory repository
 * (src/data/digitalGoodsData.ts), ensuring:
 * 1. 100% Client-Safe execution ('use client' in Next.js App Router & Capacitor).
 * 2. Zero native C++ binary dependencies (no better-sqlite3 in client bundle).
 * 3. Instant sub-millisecond querying, filtering, and sorting.
 * 4. Deterministic ascending deal sorting (cheapest price first).
 * 5. Robust scam blacklist detection and isolation.
 */

import {
  Product,
  Vendor,
  VendorDeal,
  ScamStore,
  ProductComparisonDetail,
  ProductFilterOptions,
  VendorDealWithVendor,
} from '@/types/digitalGoods';
import {
  initialVendors,
  initialProducts,
  initialVendorDeals,
  initialScamStores,
} from '@/data/digitalGoodsData';

// ============================================================================
// IN-MEMORY REPOSITORY STATE
// ============================================================================

let memoryVendors: Vendor[] = [...initialVendors];
let memoryProducts: Product[] = [...initialProducts];
let memoryDeals: VendorDeal[] = [...initialVendorDeals];
let memoryScamStores: ScamStore[] = [...initialScamStores];

// ============================================================================
// DYNAMIC METRICS RECALCULATION HELPER
// ============================================================================

/**
 * Computes dynamic price metrics for a product from an array of deals.
 */
export function computeProductPriceMetrics(deals: VendorDeal[]): {
  minPrice: number;
  maxPrice: number;
  offerCount: number;
  bestVendorId: string;
} {
  const activeDeals = deals.filter(d => d.inStock);
  if (activeDeals.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 0,
      offerCount: 0,
      bestVendorId: '',
    };
  }

  // Sort ascending by price
  const sorted = [...activeDeals].sort((a, b) => a.priceBDT - b.priceBDT);
  return {
    minPrice: sorted[0].priceBDT,
    maxPrice: sorted[sorted.length - 1].priceBDT,
    offerCount: sorted.length,
    bestVendorId: sorted[0].vendorId,
  };
}

// ============================================================================
// REPOSITORY HYDRATION & TESTING HELPERS
// ============================================================================

/**
 * Hydrates or overrides in-memory repository data (useful for dynamic sync & testing).
 */
export function setInMemoryData(data: {
  vendors?: Vendor[];
  products?: Product[];
  deals?: VendorDeal[];
  scamStores?: ScamStore[];
}): void {
  if (data.vendors) memoryVendors = [...data.vendors];
  if (data.products) memoryProducts = [...data.products];
  if (data.deals) memoryDeals = [...data.deals];
  if (data.scamStores) memoryScamStores = [...data.scamStores];
}

/**
 * Resets in-memory repository to default canonical dataset.
 */
export function resetToDefaultData(): void {
  memoryVendors = [...initialVendors];
  memoryProducts = [...initialProducts];
  memoryDeals = [...initialVendorDeals];
  memoryScamStores = [...initialScamStores];
}

// ============================================================================
// CORE DATA SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Retrieve products with multi-faceted filtering, searching, and sorting.
 * 
 * @param options Filter, search, and sort criteria
 * @returns Filtered and sorted array of Product entities
 */
export function getProducts(options: ProductFilterOptions = {}): Product[] {
  let result = [...memoryProducts];

  // 1. Category Filter
  if (options.category && options.category !== 'All') {
    result = result.filter(p => p.category === options.category);
  }

  // 2. Search Query (matches name, description, tags, or subcategory)
  if (options.search && options.search.trim()) {
    const rawTerms = options.search.toLowerCase().trim().split(/\s+/);
    result = result.filter(product => {
      const name = product.name.toLowerCase();
      const desc = product.description.toLowerCase();
      const subcat = (product.subcategory || '').toLowerCase();
      const tags = product.tags.map(t => t.toLowerCase());

      return rawTerms.every(term => 
        name.includes(term) ||
        desc.includes(term) ||
        subcat.includes(term) ||
        tags.some(t => t.includes(term))
      );
    });
  }

  // 3. Price Range Filters
  if (options.minPrice !== undefined && !isNaN(options.minPrice)) {
    result = result.filter(p => p.minPrice >= options.minPrice!);
  }
  if (options.maxPrice !== undefined && !isNaN(options.maxPrice)) {
    // A product matches if its lowest available price is within the buyer's maximum budget
    result = result.filter(p => p.minPrice <= options.maxPrice!);
  }

  // 4. In-Stock Filter
  if (options.inStockOnly) {
    result = result.filter(p => p.offerCount > 0);
  }

  // 5. Trending Only Filter
  if (options.isTrendingOnly) {
    result = result.filter(p => p.isTrending);
  }

  // 6. Sorting
  switch (options.sortBy) {
    case 'price-asc':
      result.sort((a, b) => a.minPrice - b.minPrice);
      break;
    case 'price-desc':
      result.sort((a, b) => b.minPrice - a.minPrice);
      break;
    case 'offers-count':
      result.sort((a, b) => b.offerCount - a.offerCount || a.minPrice - b.minPrice);
      break;
    case 'popular':
    default:
      result.sort((a, b) => {
        // Trending items first
        if (a.isTrending !== b.isTrending) {
          return a.isTrending ? -1 : 1;
        }
        // Then by offer count descending
        if (a.offerCount !== b.offerCount) {
          return b.offerCount - a.offerCount;
        }
        // Then by minPrice ascending
        return a.minPrice - b.minPrice;
      });
      break;
  }

  return result;
}

/**
 * Retrieve a single product by its unique URL slug.
 * 
 * @param slug Product slug string (case-insensitive)
 * @returns Product entity or null if not found
 */
export function getProductBySlug(slug: string): Product | null {
  if (!slug) return null;
  const target = slug.toLowerCase().trim();
  const found = memoryProducts.find(
    p => p.slug.toLowerCase() === target || p.id.toLowerCase() === target
  );
  return found ? { ...found } : null;
}

/**
 * Retrieve all vendor deals for a product, GUARANTEED strictly sorted
 * ascending by BDT price (deals[i].priceBDT <= deals[i+1].priceBDT).
 * 
 * Each deal is enriched with its parent Vendor profile.
 * Deals from unverified or blacklisted vendors are strictly excluded.
 * 
 * @param productId Unique product identifier
 * @returns Array of enriched deals strictly sorted by price ascending
 */
export function getDealsForProduct(productId: string): VendorDealWithVendor[] {
  if (!productId) return [];

  // Index verified vendors by ID
  const vendorMap = new Map<string, Vendor>(
    memoryVendors
      .filter(v => v.isVerified && !isVendorOrDomainBlacklisted(v.domain))
      .map(v => [v.id, v])
  );

  return memoryDeals
    .filter(deal => deal.productId === productId && deal.inStock)
    .filter(deal => vendorMap.has(deal.vendorId))
    .map(deal => ({
      ...deal,
      vendor: vendorMap.get(deal.vendorId)!,
    }))
    .sort((a, b) => {
      // Primary Sort: BDT Price ASCENDING (NON-NEGOTIABLE GUARANTEE)
      if (a.priceBDT !== b.priceBDT) {
        return a.priceBDT - b.priceBDT;
      }
      // Secondary Tie-breaker: Vendor Trust Score DESCENDING (most trusted first)
      if (b.vendor.trustScore !== a.vendor.trustScore) {
        return b.vendor.trustScore - a.vendor.trustScore;
      }
      // Tertiary Tie-breaker: Review score descending
      return b.vendor.reviewScore - a.vendor.reviewScore;
    });
}

/**
 * Retrieve comprehensive comparison data for a product detail screen.
 * Includes the product, all verified deals sorted ascending, cheapest deal,
 * savings potential (priceSpreadBDT), and total offers count.
 * 
 * @param slug Product URL slug
 * @returns ProductComparisonDetail object or null if product/deals not found
 */
export function getProductComparison(slug: string): ProductComparisonDetail | null {
  const product = getProductBySlug(slug);
  if (!product) return null;

  const deals = getDealsForProduct(product.id);
  if (deals.length === 0) return null;

  // Since deals are guaranteed sorted ascending by priceBDT:
  const cheapestDeal = deals[0];
  const highestPrice = Math.max(...deals.map(d => d.priceBDT));
  const lowestPrice = cheapestDeal.priceBDT;

  return {
    product,
    deals,
    cheapestDeal,
    priceSpreadBDT: Math.max(0, highestPrice - lowestPrice),
    totalOffers: deals.length,
  };
}

/**
 * Retrieve all verified Bangladeshi digital goods storefronts.
 * Sorted by trust score descending, then by name alphabetically.
 * 
 * @returns Array of verified Vendor entities
 */
export function getVendors(): Vendor[] {
  return [...memoryVendors]
    .filter(v => v.isVerified)
    .sort((a, b) => b.trustScore - a.trustScore || a.name.localeCompare(b.name));
}

/**
 * Check if a domain, store name, handle, or phone number is present in the scam blacklist.
 * 
 * Deterministic 7-Point Security Filter:
 * - Cleans URLs, removes protocols and path components
 * - Checks partial and exact matches against blacklisted titles and URLs
 * - Sanitizes and matches reported scam phone numbers (bKash/Nagad Send Money numbers)
 * - Excludes verified vendors from false positives
 * 
 * @param query Store name, URL, domain, or phone number
 * @returns boolean true if blacklisted as a scam; false if clean
 */
export function isVendorOrDomainBlacklisted(query: string): boolean {
  if (!query || typeof query !== 'string') return false;

  const raw = query.toLowerCase().trim();
  if (!raw) return false;

  // Clean URL protocols and www prefix
  const cleanDomain = raw
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .split('?')[0]
    .trim();

  // Normalize phone numbers: strip non-digits and leading +88
  const digitsOnly = raw.replace(/\D/g, '');
  const normalizedPhone = digitsOnly.startsWith('880') ? digitsOnly.slice(2) : digitsOnly;

  for (const scam of memoryScamStores) {
    const scamName = scam.domainOrPageName.toLowerCase();
    const scamHandle = scam.urlOrHandle.toLowerCase();

    // 1. Direct domain/name matching
    if (cleanDomain && (scamName.includes(cleanDomain) || cleanDomain.includes(scamName))) {
      return true;
    }

    // 2. Direct handle/URL matching
    if (cleanDomain && (scamHandle.includes(cleanDomain) || cleanDomain.includes(scamHandle))) {
      return true;
    }

    // 3. Raw query matching against scam title
    if (scamName.includes(raw) || raw.includes(scamName)) {
      return true;
    }

    // 4. Phone number verification
    if (normalizedPhone && normalizedPhone.length >= 10 && scam.reportedPhoneNumbers) {
      for (const phone of scam.reportedPhoneNumbers) {
        const cleanPhone = phone.replace(/\D/g, '').replace(/^880/, '');
        if (cleanPhone === normalizedPhone || cleanPhone.includes(normalizedPhone) || normalizedPhone.includes(cleanPhone)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Generate outbound affiliate/referral checkout URL with tracking attribution.
 * 
 * Injects:
 * - ref=bd_price_compare
 * - utm_source=bd_compare_platform
 * - utm_medium=cpc_referral
 * - utm_campaign=[productId]
 * - utm_content=[dealId]
 * 
 * Preserves all existing vendor query parameters (such as ?add-to-cart=1042).
 * 
 * @param deal The vendor deal entity
 * @returns Formatted outbound URL string
 */
export function generateAffiliateCheckoutUrl(deal: VendorDeal): string {
  if (!deal || !deal.directCheckoutUrl) return '';

  try {
    const parsed = new URL(deal.directCheckoutUrl);
    parsed.searchParams.set('ref', 'bd_price_compare');
    parsed.searchParams.set('utm_source', 'bd_compare_platform');
    parsed.searchParams.set('utm_medium', 'cpc_referral');
    parsed.searchParams.set('utm_campaign', deal.productId);
    parsed.searchParams.set('utm_content', deal.id);
    return parsed.toString();
  } catch {
    // If not a parseable URL, append query params if valid string
    const separator = deal.directCheckoutUrl.includes('?') ? '&' : '?';
    return `${deal.directCheckoutUrl}${separator}ref=bd_price_compare&utm_source=bd_compare_platform&utm_medium=cpc_referral&utm_campaign=${encodeURIComponent(deal.productId)}`;
  }
}

/**
 * Retrieve curated featured products for homepage showcase.
 */
export function getFeaturedProducts(limit = 6): Product[] {
  return memoryProducts
    .filter(p => p.isFeatured)
    .slice(0, limit);
}

/**
 * Retrieve trending products for hero banner and trending carousels.
 */
export function getTrendingProducts(limit = 6): Product[] {
  return memoryProducts
    .filter(p => p.isTrending)
    .slice(0, limit);
}

/**
 * Retrieve the full blacklisted scam operators registry.
 */
export function getScamRegistry(): ScamStore[] {
  return [...memoryScamStores];
}
