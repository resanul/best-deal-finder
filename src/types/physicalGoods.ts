/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Domain Models, SQLite Row Types, and Registry Interfaces
 * 
 * Location: src/types/physicalGoods.ts
 */

// ============================================================================
// 1. RETAILER & SHOP REGISTRY TYPES
// ============================================================================

export type RetailerAdapterType =
  | 'startech'
  | 'ryans'
  | 'globalbrand'
  | 'samanta'
  | 'walton'
  | 'techland'
  | 'generic';

export type ScrapeStatus = 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface TrackedShop {
  id: string;
  name: string;
  slug: string;
  domain: string;
  baseUrl: string;
  logoUrl: string;
  adapterType: RetailerAdapterType;
  isTracked: boolean;
  scrapeIntervalHours: number;
  rateLimitDelayMs: number;
  categoryUrls: string[];
  lastScrapedAt?: string;
  lastScrapeStatus: ScrapeStatus;
  productCount: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackedShopRow {
  id: string;
  name: string;
  slug: string;
  domain: string;
  base_url: string;
  logo_url: string;
  adapter_type: string;
  is_tracked: number;
  scrape_interval_hours: number;
  rate_limit_delay_ms: number;
  category_urls: string;
  last_scraped_at: string | null;
  last_scrape_status: string;
  product_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopRegistrationInput {
  url: string;
  name?: string;
  scrapeIntervalHours?: number;
  rateLimitDelayMs?: number;
  categoryUrls?: string[];
  logoUrl?: string;
}

export type CMSEngine = 'woocommerce' | 'shopify' | 'opencart' | 'vike' | 'custom' | 'unknown';

export interface CMSDetectionResult {
  adapterType: RetailerAdapterType;
  engine: CMSEngine;
  shopName: string;
  domain: string;
  baseUrl: string;
  isKnownRetailer: boolean;
  confidence: number;
  indicators: string[];
}

export interface ShopMetrics {
  totalShops: number;
  activeShops: number;
  pausedShops: number;
  knownRetailers: number;
  genericShops: number;
  totalProductsScraped: number;
}

// ============================================================================
// 2. SCRAPED PRODUCT TYPES
// ============================================================================

export type ProductAvailability = 'In Stock' | 'Out of Stock' | 'Pre-Order' | 'Upcoming';

export interface ScrapedProduct {
  id: string;
  shopId: string;
  productGroupId?: string;
  rawTitle: string;
  cleanTitle: string;
  productUrl: string;
  imageUrl?: string;
  currentPrice: number;
  originalPrice?: number;
  availability: ProductAvailability;
  inStock: boolean;
  mpn?: string;
  brand?: string;
  category?: string;
  matchConfidence?: number;
  specs?: Record<string, string>;
  lastScrapedAt?: string;
  createdAt?: string;
}

export interface ScrapedProductRow {
  id: string;
  shop_id: string;
  product_group_id: string | null;
  raw_title: string;
  clean_title: string;
  product_url: string;
  image_url: string | null;
  current_price: number;
  original_price: number | null;
  availability: string;
  in_stock: number;
  mpn: string | null;
  brand: string | null;
  category: string | null;
  match_confidence: number | null;
  last_scraped_at: string;
  created_at: string;
}

// ============================================================================
// 3. CANONICAL PRODUCT GROUP & OFFERS
// ============================================================================

export interface ProductGroup {
  id: string;
  canonicalName: string;
  slug: string;
  brand: string;
  category: string;
  model: string;
  specs: Record<string, string>;
  imageUrl: string;
  minPrice: number;
  maxPrice: number;
  bestDealShopId?: string;
  bestDealShopName?: string;
  bestDealPrice: number;
  bestDealUrl?: string;
  priceSpreadBDT?: number;
  savingsPercent?: number;
  offerCount: number;
  inStockOfferCount: number;
  offers?: VendorOffer[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductGroupRow {
  id: string;
  canonical_name: string;
  slug: string;
  brand: string;
  category: string;
  model: string;
  specs_json: string;
  image_url: string;
  min_price: number;
  max_price: number;
  best_deal_shop_id: string | null;
  best_deal_price: number;
  best_deal_url: string | null;
  offer_count: number;
  in_stock_offer_count: number;
  created_at: string;
  updated_at: string;
}

export interface VendorOffer {
  id: string;
  shopId: string;
  shopName: string;
  shopLogo: string;
  productUrl: string;
  priceBDT: number;
  originalPriceBDT?: number;
  priceDiffFromBest: number;
  availability: string;
  inStock: boolean;
  warranty?: string;
  lastVerifiedAt: string;
}

// ============================================================================
// 4. PRICE HISTORY & UNMATCHED QUEUE
// ============================================================================

export interface PriceHistoryRecord {
  id: string;
  scrapedProductId: string;
  price: number;
  availability: string;
  recordedAt: string;
}

export interface PriceHistoryRow {
  id: string;
  scraped_product_id: string;
  price: number;
  availability: string;
  recorded_at: string;
}

export type UnmatchedStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UnmatchedQueueItem {
  id: string;
  scrapedProductId: string;
  suggestedGroupId?: string;
  similarityScore: number;
  status: UnmatchedStatus;
  reviewedAt?: string;
  createdAt: string;
}

export interface UnmatchedQueueRow {
  id: string;
  scraped_product_id: string;
  suggested_group_id: string | null;
  similarity_score: number;
  status: string;
  reviewed_at: string | null;
  created_at: string;
}
