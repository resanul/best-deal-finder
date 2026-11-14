/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Scraper Subsystem Type Definitions & Interfaces
 * 
 * Location: src/scraper/types.ts
 */

import {
  TrackedShop,
  RetailerAdapterType,
  ScrapeStatus,
  ProductAvailability,
  ScrapedProduct,
} from '@/types/physicalGoods';

export type {
  TrackedShop,
  RetailerAdapterType,
  ScrapeStatus,
  ProductAvailability,
  ScrapedProduct,
};

/**
 * Raw scraped product item extracted from HTML or API before database persistence.
 */
export interface ScrapedItem {
  id?: string;
  shopId?: string;
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
  specs?: Record<string, string>;
  lastScrapedAt?: string;
}

/**
 * Common interface for all retailer adapters (dedicated & generic).
 */
export interface RetailerAdapter {
  readonly name: string;
  readonly adapterType: RetailerAdapterType;
  canHandle(urlOrDomain: string): boolean;
  parseHtml(html: string, contextUrl?: string): ScrapedItem[];
  scrapeUrl(url: string, options?: ScrapeOptions): Promise<ScrapeResult>;
}

/**
 * Scraping execution options.
 */
export interface ScrapeOptions {
  stealth?: boolean;
  limit?: number;
  timeoutMs?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
  maxRetries?: number;
  dryRun?: boolean;
  mockHtml?: string;
}

/**
 * Scraping result for a single shop.
 */
export interface ScrapeResult {
  shopId: string;
  shopName: string;
  adapterType: RetailerAdapterType;
  status: ScrapeStatus;
  items: ScrapedProduct[];
  itemCount: number;
  errors: string[];
  durationMs: number;
  scrapedAt: string;
}

/**
 * Scraping result for a batch crawl across multiple shops.
 */
export interface BatchScrapeResult {
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  totalShops: number;
  successfulShops: number;
  failedShops: number;
  totalProductsScraped: number;
  results: ScrapeResult[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

/**
 * HTTP Client response from stealth fetch.
 */
export interface StealthFetchResult {
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
  html: string;
  headers: Record<string, string>;
  isChallenge: boolean;
  retries: number;
  delayAppliedMs: number;
}
