/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Main Scraping Engine & Retailer Adapter Coordinator
 * 
 * Location: src/scraper/index.ts
 */

import db from '@/lib/db';
import {
  getTrackedShops,
  getShopById,
  getShopBySlug,
  updateShopScrapeStatus,
} from '@/lib/shopRegistry';
import {
  TrackedShop,
  RetailerAdapterType,
  RetailerAdapter,
  ScrapeOptions,
  ScrapeResult,
  BatchScrapeResult,
  ScrapedItem,
  ScrapedProduct,
} from './types';
import { StarTechAdapter } from './adapters/startech';
import { RyansAdapter } from './adapters/ryans';
import { GlobalBrandAdapter } from './adapters/globalbrand';
import { SamantaAdapter } from './adapters/samanta';
import { WaltonAdapter } from './adapters/walton';
import { TechlandAdapter } from './adapters/techland';
import { GenericAdapter } from './adapters/generic';
import { generateScrapedProductId } from './takaFormatter';
import { randomDelay } from './stealth';

// ============================================================================
// 1. ADAPTER REGISTRY
// ============================================================================

const adapterRegistry: Record<RetailerAdapterType, RetailerAdapter> = {
  startech: new StarTechAdapter(),
  ryans: new RyansAdapter(),
  globalbrand: new GlobalBrandAdapter(),
  samanta: new SamantaAdapter(),
  walton: new WaltonAdapter(),
  techland: new TechlandAdapter(),
  generic: new GenericAdapter(),
};

/**
 * Returns the appropriate RetailerAdapter for the given adapter type.
 * Falls back to GenericAdapter if type is not recognized.
 */
export function getAdapter(type: RetailerAdapterType): RetailerAdapter {
  return adapterRegistry[type] || adapterRegistry.generic;
}

// ============================================================================
// 2. DATABASE PERSISTENCE FOR SCRAPED PRODUCTS & PRICE HISTORY
// ============================================================================

/**
 * Persists parsed scraped items into SQLite tables `scraped_products` and `price_history`.
 */
export function persistScrapedProducts(
  shop: TrackedShop,
  items: ScrapedItem[]
): ScrapedProduct[] {
  const now = new Date().toISOString();
  const savedProducts: ScrapedProduct[] = [];

  const checkStmt = db.prepare('SELECT id, product_group_id FROM scraped_products WHERE product_url = ?');
  const upsertProductStmt = db.prepare(`
    INSERT INTO scraped_products (
      id, shop_id, product_group_id, raw_title, clean_title,
      product_url, image_url, current_price, original_price,
      availability, in_stock, mpn, brand, category,
      match_confidence, last_scraped_at, created_at
    ) VALUES (
      @id, @shop_id, @product_group_id, @raw_title, @clean_title,
      @product_url, @image_url, @current_price, @original_price,
      @availability, @in_stock, @mpn, @brand, @category,
      @match_confidence, @last_scraped_at, @created_at
    ) ON CONFLICT(product_url) DO UPDATE SET
      raw_title = excluded.raw_title,
      clean_title = excluded.clean_title,
      image_url = COALESCE(excluded.image_url, scraped_products.image_url),
      current_price = excluded.current_price,
      original_price = excluded.original_price,
      availability = excluded.availability,
      in_stock = excluded.in_stock,
      mpn = COALESCE(excluded.mpn, scraped_products.mpn),
      brand = COALESCE(excluded.brand, scraped_products.brand),
      category = COALESCE(excluded.category, scraped_products.category),
      last_scraped_at = excluded.last_scraped_at
  `);

  const insertHistoryStmt = db.prepare(`
    INSERT INTO price_history (
      id, scraped_product_id, price, availability, recorded_at
    ) VALUES (
      ?, ?, ?, ?, ?
    )
  `);

  const persistTx = db.transaction((productList: ScrapedItem[]) => {
    for (const item of productList) {
      const existing = checkStmt.get(item.productUrl) as { id: string; product_group_id: string | null } | undefined;
      const id = existing ? existing.id : (item.id || generateScrapedProductId(shop.slug, item.productUrl));
      const productGroupId = existing?.product_group_id || undefined;

      const productRecord: ScrapedProduct = {
        id,
        shopId: shop.id,
        productGroupId,
        rawTitle: item.rawTitle,
        cleanTitle: item.cleanTitle,
        productUrl: item.productUrl,
        imageUrl: item.imageUrl,
        currentPrice: item.currentPrice,
        originalPrice: item.originalPrice,
        availability: item.availability,
        inStock: item.inStock,
        mpn: item.mpn,
        brand: item.brand,
        category: item.category,
        specs: item.specs,
        matchConfidence: 0.0,
        lastScrapedAt: now,
        createdAt: now,
      };

      upsertProductStmt.run({
        id: productRecord.id,
        shop_id: productRecord.shopId,
        product_group_id: productRecord.productGroupId || null,
        raw_title: productRecord.rawTitle,
        clean_title: productRecord.cleanTitle,
        product_url: productRecord.productUrl,
        image_url: productRecord.imageUrl || null,
        current_price: productRecord.currentPrice,
        original_price: productRecord.originalPrice ?? null,
        availability: productRecord.availability,
        in_stock: productRecord.inStock ? 1 : 0,
        mpn: productRecord.mpn || null,
        brand: productRecord.brand || null,
        category: productRecord.category || null,
        match_confidence: productRecord.matchConfidence || 0.0,
        last_scraped_at: productRecord.lastScrapedAt,
        created_at: productRecord.createdAt,
      });

      // Record price history entry
      const historyId = `ph-${productRecord.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      insertHistoryStmt.run(
        historyId,
        productRecord.id,
        productRecord.currentPrice,
        productRecord.availability,
        now
      );

      savedProducts.push(productRecord);
    }
  });

  persistTx(items);
  return savedProducts;
}

// ============================================================================
// 3. MAIN SCRAPING COORDINATOR
// ============================================================================

/**
 * Executes a scrape cycle for a single shop identified by shop ID or slug.
 */
export async function scrapeShop(
  shopIdOrSlug: string,
  options: ScrapeOptions = {}
): Promise<ScrapeResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  // 1. Resolve TrackedShop
  let shop: TrackedShop | null = getShopById(shopIdOrSlug);
  if (!shop) {
    shop = getShopBySlug(shopIdOrSlug);
  }

  if (!shop) {
    return {
      shopId: shopIdOrSlug,
      shopName: 'Unknown Shop',
      adapterType: 'generic',
      status: 'FAILED',
      items: [],
      itemCount: 0,
      errors: [`Shop with ID or slug "${shopIdOrSlug}" not found in registry`],
      durationMs: Date.now() - startTime,
      scrapedAt: new Date().toISOString(),
    };
  }

  // 2. Update status to RUNNING if not a dry run
  if (!options.dryRun) {
    updateShopScrapeStatus(shop.id, 'RUNNING');
  }

  const adapter = getAdapter(shop.adapterType);
  const targetUrls = shop.categoryUrls && shop.categoryUrls.length > 0
    ? shop.categoryUrls
    : [shop.baseUrl];

  const allScrapedItems: ScrapedItem[] = [];

  try {
    if (options.mockHtml) {
      // Offline fixture mode
      const items = adapter.parseHtml(options.mockHtml, targetUrls[0]);
      allScrapedItems.push(...items);
    } else {
      // Live crawl across target category URLs
      for (const targetUrl of targetUrls) {
        if (options.limit && allScrapedItems.length >= options.limit) {
          break;
        }

        const res = await adapter.scrapeUrl(targetUrl, options);
        if (res.errors && res.errors.length > 0) {
          errors.push(...res.errors);
        }

        for (const item of res.items) {
          allScrapedItems.push(item);
          if (options.limit && allScrapedItems.length >= options.limit) {
            break;
          }
        }
      }
    }
  } catch (err: unknown) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  // Deduplicate items by product URL
  const seenUrls = new Set<string>();
  const uniqueItems = allScrapedItems.filter(item => {
    if (seenUrls.has(item.productUrl)) return false;
    seenUrls.add(item.productUrl);
    return true;
  });

  const finalItems = options.limit && options.limit > 0
    ? uniqueItems.slice(0, options.limit)
    : uniqueItems;

  let savedProducts: ScrapedProduct[] = [];

  if (!options.dryRun && finalItems.length > 0) {
    savedProducts = persistScrapedProducts(shop, finalItems);
  } else {
    savedProducts = finalItems.map(item => ({
      id: item.id || generateScrapedProductId(shop.slug, item.productUrl),
      shopId: shop.id,
      rawTitle: item.rawTitle,
      cleanTitle: item.cleanTitle,
      productUrl: item.productUrl,
      imageUrl: item.imageUrl,
      currentPrice: item.currentPrice,
      originalPrice: item.originalPrice,
      availability: item.availability,
      inStock: item.inStock,
      brand: item.brand,
      mpn: item.mpn,
      category: item.category,
      specs: item.specs,
      lastScrapedAt: new Date().toISOString(),
    }));
  }

  const status = errors.length === 0 ? 'SUCCESS' : (savedProducts.length > 0 ? 'SUCCESS' : 'FAILED');

  // Update shop scrape status in registry
  if (!options.dryRun) {
    updateShopScrapeStatus(
      shop.id,
      status,
      savedProducts.length,
      errors.length > 0 ? errors.join('; ') : undefined
    );
  }

  return {
    shopId: shop.id,
    shopName: shop.name,
    adapterType: shop.adapterType,
    status,
    items: savedProducts,
    itemCount: savedProducts.length,
    errors,
    durationMs: Date.now() - startTime,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Scrapes all active (is_tracked = 1) shops in sequence with randomized jitter delays.
 */
export async function scrapeAllActiveShops(
  options: ScrapeOptions = {}
): Promise<BatchScrapeResult> {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();

  const activeShops = getTrackedShops({ activeOnly: true });
  const results: ScrapeResult[] = [];
  let successfulShops = 0;
  let failedShops = 0;
  let totalProductsScraped = 0;

  for (let i = 0; i < activeShops.length; i++) {
    const shop = activeShops[i];

    // Inter-shop jitter delay to prevent multi-domain traffic bursts
    if (i > 0 && options.stealth !== false && !options.mockHtml) {
      await randomDelay(options.minDelayMs || 1500, options.maxDelayMs || 4500);
    }

    try {
      const res = await scrapeShop(shop.id, options);
      results.push(res);

      if (res.status === 'SUCCESS') {
        successfulShops++;
        totalProductsScraped += res.itemCount;
      } else {
        failedShops++;
      }
    } catch (err: unknown) {
      failedShops++;
      results.push({
        shopId: shop.id,
        shopName: shop.name,
        adapterType: shop.adapterType,
        status: 'FAILED',
        items: [],
        itemCount: 0,
        errors: [err instanceof Error ? err.message : String(err)],
        durationMs: 0,
        scrapedAt: new Date().toISOString(),
      });
    }
  }

  const batchStatus =
    failedShops === 0
      ? 'SUCCESS'
      : successfulShops > 0
      ? 'PARTIAL'
      : 'FAILED';

  return {
    status: batchStatus,
    totalShops: activeShops.length,
    successfulShops,
    failedShops,
    totalProductsScraped,
    results,
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
  };
}
