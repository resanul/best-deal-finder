/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Client-Safe Data Accessor & Query Service
 * 
 * Location: src/lib/physicalDataService.ts
 * Covers: Star Tech, Ryans, Global Brand, Samanta, Walton, Techland
 */

import { ProductGroup, VendorOffer, TrackedShop } from '@/types/physicalGoods';
import {
  INITIAL_PHYSICAL_PRODUCTS,
  TRACKED_RETAILERS,
} from '@/data/physicalGoodsData';

let memoryPhysicalProducts: ProductGroup[] = [...INITIAL_PHYSICAL_PRODUCTS];
let memoryRetailers: TrackedShop[] = [...TRACKED_RETAILERS];

export interface PhysicalFilterOptions {
  category?: string;
  brand?: string;
  shopId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'popular' | 'deals' | 'price-low' | 'price-high' | 'name';
}

/**
 * Retrieve physical tech product groups with filtering, search, and sorting.
 */
export function getPhysicalProductGroups(options?: PhysicalFilterOptions): ProductGroup[] {
  let list = [...memoryPhysicalProducts];

  if (!options) return list;

  // 1. Search Query (matches canonicalName, brand, model, specs)
  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter((p) => {
      const matchName = p.canonicalName.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchModel = p.model.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchSpecs = Object.values(p.specs || {}).some((v) =>
        v.toLowerCase().includes(q)
      );
      return matchName || matchBrand || matchModel || matchCat || matchSpecs;
    });
  }

  // 2. Category Filter
  if (options.category && options.category.toLowerCase() !== 'all') {
    const cat = options.category.toLowerCase();
    list = list.filter((p) => p.category.toLowerCase() === cat);
  }

  // 3. Brand Filter
  if (options.brand && options.brand.toLowerCase() !== 'all') {
    const b = options.brand.toLowerCase();
    list = list.filter((p) => p.brand.toLowerCase() === b);
  }

  // 4. Shop Filter
  if (options.shopId && options.shopId.toLowerCase() !== 'all') {
    list = list.filter((p) =>
      p.offers?.some((o) => o.shopId === options.shopId)
    );
  }

  // 5. Price Range
  if (typeof options.minPrice === 'number' && options.minPrice > 0) {
    list = list.filter((p) => p.minPrice >= options.minPrice!);
  }
  if (typeof options.maxPrice === 'number' && options.maxPrice > 0) {
    list = list.filter((p) => p.minPrice <= options.maxPrice!);
  }

  // 6. In Stock Only
  if (options.inStockOnly) {
    list = list.filter((p) => p.inStockOfferCount > 0);
  }

  // 7. Sorting
  const sortBy = options.sortBy || 'deals';
  list.sort((a, b) => {
    switch (sortBy) {
      case 'deals':
      case 'popular':
        // Sort by biggest savings / price spread
        return (b.priceSpreadBDT || 0) - (a.priceSpreadBDT || 0);
      case 'price-low':
        return a.minPrice - b.minPrice;
      case 'price-high':
        return b.minPrice - a.minPrice;
      case 'name':
        return a.canonicalName.localeCompare(b.canonicalName);
      default:
        return 0;
    }
  });

  return list;
}

/**
 * Retrieve a single product group by its slug or ID.
 */
export function getPhysicalProductBySlug(slug: string): ProductGroup | null {
  const p = memoryPhysicalProducts.find(
    (item) => item.slug === slug || item.id === slug
  );
  if (!p) return null;

  // Return a cloned copy with offers sorted ascending by price
  const offers = [...(p.offers || [])].sort((a, b) => a.priceBDT - b.priceBDT);
  return {
    ...p,
    offers,
  };
}

/**
 * Retrieve all tracked retailers.
 */
export function getTrackedRetailers(): TrackedShop[] {
  return [...memoryRetailers];
}

/**
 * Dynamically register a new shop in client memory (alongside backend SQLite persistence).
 */
export function addMemoryRetailer(shop: TrackedShop): void {
  const exists = memoryRetailers.find((s) => s.domain === shop.domain);
  if (!exists) {
    memoryRetailers.unshift(shop);
  }
}
