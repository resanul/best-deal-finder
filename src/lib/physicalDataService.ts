/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Client-Safe Data Accessor & Query Service
 * 
 * Location: src/lib/physicalDataService.ts
 * Covers: Star Tech, Ryans, Global Brand, Samanta, Walton, Techland
 */

import { ProductGroup, TrackedShop } from '@/types/physicalGoods';
import {
  INITIAL_PHYSICAL_PRODUCTS,
  TRACKED_RETAILERS,
} from '@/data/physicalGoodsData';

const memoryPhysicalProducts: ProductGroup[] = [...INITIAL_PHYSICAL_PRODUCTS];
const memoryRetailers: TrackedShop[] = [...TRACKED_RETAILERS];

export interface PhysicalFilterOptions {
  category?: string;
  subCategory?: string;
  brand?: string;
  brands?: string[];
  shopId?: string;
  shopIds?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  availability?: string[];
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

  // 2. Category & Subcategory Filter
  if (options.category && options.category.toLowerCase() !== 'all') {
    const cat = options.category.toLowerCase();
    
    // Sub-component mapping
    if (cat === 'ram') {
      list = list.filter((p) => p.canonicalName.toLowerCase().includes('ram'));
    } else if (cat === 'ssd' || cat === 'storage') {
      list = list.filter((p) => {
        const n = p.canonicalName.toLowerCase();
        return n.includes('ssd') || n.includes('m.2') || n.includes('nvme') || n.includes('hard disk');
      });
    } else if (cat === 'motherboard') {
      list = list.filter((p) => {
        const n = p.canonicalName.toLowerCase();
        return n.includes('motherboard') || n.includes('board');
      });
    } else if (cat === 'powersupply' || cat === 'power supply' || cat === 'psu') {
      list = list.filter((p) => {
        const n = p.canonicalName.toLowerCase();
        return n.includes('power supply') || n.includes('psu') || n.includes('watt') || n.includes('80 plus');
      });
    } else {
      list = list.filter((p) => p.category.toLowerCase() === cat);
    }
  }

  // 3. Single Brand Filter
  if (options.brand && options.brand.toLowerCase() !== 'all') {
    const b = options.brand.toLowerCase();
    list = list.filter((p) => p.brand.toLowerCase() === b);
  }

  // 3.1 Multiple Brands Filter
  if (options.brands && options.brands.length > 0) {
    const lowerBrands = options.brands.map((b) => b.toLowerCase());
    list = list.filter((p) => lowerBrands.includes(p.brand.toLowerCase()));
  }

  // 4. Single Shop Filter
  if (options.shopId && options.shopId.toLowerCase() !== 'all') {
    list = list.filter((p) =>
      p.offers?.some((o) => o.shopId === options.shopId)
    );
  }

  // 4.1 Multiple Shops Filter
  if (options.shopIds && options.shopIds.length > 0) {
    list = list.filter((p) =>
      p.offers?.some((o) => options.shopIds!.includes(o.shopId))
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

  // 6.1 Availability Array
  if (options.availability && options.availability.length > 0) {
    // If 'in-stock' is selected
    if (options.availability.includes('in-stock') && !options.availability.includes('pre-order')) {
      list = list.filter((p) => p.inStockOfferCount > 0);
    }
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
 * Retrieve a retailer by ID or slug.
 */
export function getRetailerById(shopId: string): TrackedShop | null {
  return memoryRetailers.find((s) => s.id === shopId || s.slug === shopId) || null;
}

/**
 * Retrieve all products offered by a specific shop with per-shop details.
 */
export function getShopProducts(shopId: string) {
  const shop = getRetailerById(shopId);
  const products = memoryPhysicalProducts.filter((p) =>
    p.offers?.some((o) => o.shopId === shopId)
  );

  const shopOfferItems = products.map((p) => {
    const offer = (p.offers || []).find((o) => o.shopId === shopId)!;
    const isCheapestInBD = offer.priceBDT === p.minPrice;
    const priceDiffFromLowest = offer.priceBDT - p.minPrice;

    return {
      product: p,
      shopOffer: offer,
      isCheapestInBD,
      priceDiffFromLowest,
      competingShopsCount: p.offerCount,
    };
  });

  return {
    shop,
    items: shopOfferItems,
    totalProducts: shopOfferItems.length,
  };
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
