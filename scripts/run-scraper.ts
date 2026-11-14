/**
 * Multi-Vendor Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Standalone CLI Runner & Scheduled Scraping Pipeline
 * 
 * Location: scripts/run-scraper.ts
 * Execution: npx tsx scripts/run-scraper.ts [options]
 * 
 * Supported CLI Options:
 *   --all             Scrape all active tracked shops in tracked_shops
 *   --vendor <slug>   Scrape a specific retailer by slug or 'all'
 *   --limit <number>  Cap number of products scraped per shop (default: 50)
 *   --stealth         Enable human-like jitter delays, Chrome Client Hints emulation & serialized host concurrency
 *   --match           Trigger product matching engine to cluster products into product_groups
 *   --dry-run         Run in memory without modifying the SQLite database
 *   --seed-sample     Seed realistic Bangladeshi physical tech products across all major retailers
 *   --help, -h        Display help and usage instructions
 */

import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import db, { seedDefaultRetailers } from '../src/lib/db';
import { getTrackedShops, getShopById, getShopBySlug, updateShopScrapeStatus } from '../src/lib/shopRegistry';
import { scrapeShop, scrapeAllActiveShops } from '../src/scraper/index';
import { calculateJitterDelay, randomDelay } from '../src/scraper/stealth';
import { generateScrapedProductId } from '../src/scraper/takaFormatter';
import { ScrapedProduct, TrackedShop } from '../src/types/physicalGoods';

// ============================================================================
// 1. CLI INTERFACES & ARGUMENT PARSER
// ============================================================================

export interface ScraperCliOptions {
  all?: boolean;
  vendor?: string;
  limit?: number;
  stealth?: boolean;
  match?: boolean;
  dryRun?: boolean;
  seedSample?: boolean;
  help?: boolean;
}

export function parseCliArgs(args: string[]): { options: ScraperCliOptions; errors: string[] } {
  const options: ScraperCliOptions = {};
  const errors: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--all') {
      options.all = true;
    } else if (arg === '--vendor') {
      const next = args[++i];
      if (!next || next.startsWith('--')) {
        errors.push('Missing required value for --vendor');
      } else {
        options.vendor = next.toLowerCase();
      }
    } else if (arg === '--limit') {
      const next = args[++i];
      const parsed = parseInt(next, 10);
      if (isNaN(parsed) || parsed <= 0) {
        errors.push(`Invalid limit parameter: ${next}. Must be a positive integer.`);
      } else {
        options.limit = parsed;
      }
    } else if (arg === '--stealth') {
      options.stealth = true;
    } else if (arg === '--match') {
      options.match = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--seed-sample') {
      options.seedSample = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      errors.push(`Unknown CLI option: ${arg}`);
    }
  }

  return { options, errors };
}

export function printHelp(): void {
  console.log(`
==============================================================================
  Bangladeshi Physical Tech Price Comparison Scraper CLI Runner
==============================================================================

Usage:
  npx tsx scripts/run-scraper.ts [options]

Options:
  --all             Scrape all active tracked retailers in registry
  --vendor <slug>   Scrape a specific retailer by slug (e.g., startech, ryans, techland, walton, samanta, globalbrand) or 'all'
  --limit <number>  Cap number of products scraped per shop (default: 50)
  --stealth         Enable human-like jitter delays (2000-4500ms), Chrome Client Hints emulation, and serialized domain concurrency
  --match           Trigger product matching engine after scraping to cluster products into product_groups
  --dry-run         Run without modifying the SQLite database
  --seed-sample     Seed realistic Bangladeshi physical tech products across all major retailers
  --help, -h        Display this help message and exit

Examples:
  npx tsx scripts/run-scraper.ts --all --stealth --match
  npx tsx scripts/run-scraper.ts --vendor startech --limit 20
  npx tsx scripts/run-scraper.ts --seed-sample --match
  npx tsx scripts/run-scraper.ts --all --dry-run
`);
}

// ============================================================================
// 2. REALISTIC SAMPLE DATA FOR BANGLADESHI PHYSICAL RETAILERS
// ============================================================================

export interface SampleProductSeed {
  shopSlug: string;
  shopId: string;
  rawTitle: string;
  cleanTitle: string;
  productUrl: string;
  imageUrl: string;
  currentPrice: number;
  originalPrice?: number;
  availability: 'In Stock' | 'Out of Stock' | 'Pre-Order' | 'Upcoming';
  inStock: boolean;
  mpn?: string;
  brand: string;
  category: string;
  specs: Record<string, string>;
}

export const SAMPLE_PRODUCTS: SampleProductSeed[] = [
  // --- AMD Ryzen 5 5600 Desktop Processor (Cross-retailer comparison) ---
  {
    shopSlug: 'startech',
    shopId: 'shop-startech',
    rawTitle: 'AMD Ryzen 5 5600 Processor',
    cleanTitle: 'amd ryzen 5 5600 processor',
    productUrl: 'https://www.startech.com.bd/amd-ryzen-5-5600-processor',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/processor/AMD/ryzen-5-5600/ryzen-5-5600-01-500x500.jpg',
    currentPrice: 13400,
    originalPrice: 14500,
    availability: 'In Stock',
    inStock: true,
    mpn: '100-100000927BOX',
    brand: 'AMD',
    category: 'Processor',
    specs: { Cores: '6', Threads: '12', BaseClock: '3.5GHz', BoostClock: '4.4GHz', Socket: 'AM4' },
  },
  {
    shopSlug: 'ryans',
    shopId: 'shop-ryans',
    rawTitle: 'AMD Ryzen 5 5600 3.5GHz - 4.4GHz 6 Cores 12 Threads AM4 Socket Desktop Processor #100-100000927BOX',
    cleanTitle: 'amd ryzen 5 5600 3.5ghz - 4.4ghz 6 cores 12 threads am4 socket desktop processor',
    productUrl: 'https://www.ryans.com/amd-ryzen-5-5600-desktop-processor-100-100000927box',
    imageUrl: 'https://www.ryans.com/storage/products/main/amd-ryzen-5-5600-desktop-processor-11652784511.webp',
    currentPrice: 13800,
    originalPrice: 14800,
    availability: 'In Stock',
    inStock: true,
    mpn: '100-100000927BOX',
    brand: 'AMD',
    category: 'Processor',
    specs: { Cores: '6', Threads: '12', BaseClock: '3.5GHz', BoostClock: '4.4GHz', Socket: 'AM4' },
  },
  {
    shopSlug: 'techland',
    shopId: 'shop-techland',
    rawTitle: 'AMD Ryzen 5 5600 6-Core 12-Thread AM4 Desktop Processor',
    cleanTitle: 'amd ryzen 5 5600 6-core 12-thread am4 desktop processor',
    productUrl: 'https://www.techlandbd.com/amd-ryzen-5-5600-processor',
    imageUrl: 'https://www.techlandbd.com/image/cache/catalog/Processor/AMD/ryzen-5-5600/amd-ryzen-5-5600-processor-500x500.jpg',
    currentPrice: 13600,
    originalPrice: 14700,
    availability: 'In Stock',
    inStock: true,
    mpn: '100-100000927BOX',
    brand: 'AMD',
    category: 'Processor',
    specs: { Cores: '6', Threads: '12', BaseClock: '3.5GHz', BoostClock: '4.4GHz', Socket: 'AM4' },
  },
  {
    shopSlug: 'samanta',
    shopId: 'shop-samanta',
    rawTitle: 'AMD Ryzen 5 5600 Desktop Processor',
    cleanTitle: 'amd ryzen 5 5600 desktop processor',
    productUrl: 'https://samantacomputer.com/amd-ryzen-5-5600-desktop-processor',
    imageUrl: 'https://samantacomputer.com/assets/products/amd-ryzen-5-5600.jpg',
    currentPrice: 13500,
    originalPrice: 14500,
    availability: 'In Stock',
    inStock: true,
    mpn: '100-100000927BOX',
    brand: 'AMD',
    category: 'Processor',
    specs: { Cores: '6', Threads: '12', BaseClock: '3.5GHz', BoostClock: '4.4GHz', Socket: 'AM4' },
  },

  // --- ZOTAC GAMING GeForce RTX 4060 8GB Twin Edge (Cross-retailer comparison) ---
  {
    shopSlug: 'startech',
    shopId: 'shop-startech',
    rawTitle: 'ZOTAC GAMING GeForce RTX 4060 8GB Twin Edge GDDR6 Graphics Card',
    cleanTitle: 'zotac gaming geforce rtx 4060 8gb twin edge gddr6 graphics card',
    productUrl: 'https://www.startech.com.bd/zotac-gaming-geforce-rtx-4060-8gb-twin-edge-graphics-card',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/graphics-card/zotac/rtx-4060-twin-edge/rtx-4060-twin-edge-01-500x500.jpg',
    currentPrice: 38500,
    originalPrice: 41000,
    availability: 'In Stock',
    inStock: true,
    mpn: 'ZT-D40600E-10M',
    brand: 'Zotac',
    category: 'Graphics Card',
    specs: { GPU: 'RTX 4060', VRAM: '8GB GDDR6', Bus: '128-bit', Interface: 'PCIe 4.0' },
  },
  {
    shopSlug: 'ryans',
    shopId: 'shop-ryans',
    rawTitle: 'Zotac Gaming GeForce RTX 4060 Twin Edge 8GB GDDR6 Graphics Card #ZT-D40600E-10M',
    cleanTitle: 'zotac gaming geforce rtx 4060 twin edge 8gb gddr6 graphics card',
    productUrl: 'https://www.ryans.com/zotac-gaming-geforce-rtx-4060-twin-edge-8gb-graphics-card',
    imageUrl: 'https://www.ryans.com/storage/products/main/zotac-gaming-geforce-rtx-4060-twin-edge-8gb-11689235489.webp',
    currentPrice: 38800,
    originalPrice: 42000,
    availability: 'In Stock',
    inStock: true,
    mpn: 'ZT-D40600E-10M',
    brand: 'Zotac',
    category: 'Graphics Card',
    specs: { GPU: 'RTX 4060', VRAM: '8GB GDDR6', Bus: '128-bit', Interface: 'PCIe 4.0' },
  },
  {
    shopSlug: 'techland',
    shopId: 'shop-techland',
    rawTitle: 'ZOTAC GAMING GeForce RTX 4060 8GB Twin Edge Graphics Card',
    cleanTitle: 'zotac gaming geforce rtx 4060 8gb twin edge graphics card',
    productUrl: 'https://www.techlandbd.com/zotac-geforce-rtx-4060-8gb-twin-edge-graphics-card',
    imageUrl: 'https://www.techlandbd.com/image/cache/catalog/Graphics-Card/ZOTAC/rtx-4060-twin-edge-500x500.jpg',
    currentPrice: 38900,
    originalPrice: 41500,
    availability: 'In Stock',
    inStock: true,
    mpn: 'ZT-D40600E-10M',
    brand: 'Zotac',
    category: 'Graphics Card',
    specs: { GPU: 'RTX 4060', VRAM: '8GB GDDR6', Bus: '128-bit', Interface: 'PCIe 4.0' },
  },
  {
    shopSlug: 'globalbrand',
    shopId: 'shop-globalbrand',
    rawTitle: 'Zotac Gaming GeForce RTX 4060 Twin Edge 8GB GDDR6 Graphics Card',
    cleanTitle: 'zotac gaming geforce rtx 4060 twin edge 8gb gddr6 graphics card',
    productUrl: 'https://www.globalbrand.com.bd/zotac-gaming-geforce-rtx-4060-twin-edge-8gb-gddr6-graphics-card',
    imageUrl: 'https://www.globalbrand.com.bd/image/cache/catalog/product/zotac-rtx-4060-twin-edge-500x500.jpg',
    currentPrice: 39200,
    originalPrice: 42500,
    availability: 'In Stock',
    inStock: true,
    mpn: 'ZT-D40600E-10M',
    brand: 'Zotac',
    category: 'Graphics Card',
    specs: { GPU: 'RTX 4060', VRAM: '8GB GDDR6', Bus: '128-bit', Interface: 'PCIe 4.0' },
  },

  // --- ASUS Dual RTX 4060 (Hard Negative counterpart - must not cluster with ZOTAC) ---
  {
    shopSlug: 'globalbrand',
    shopId: 'shop-globalbrand',
    rawTitle: 'ASUS Dual GeForce RTX 4060 EVO OC Edition 8GB GDDR6 Graphics Card',
    cleanTitle: 'asus dual geforce rtx 4060 evo oc edition 8gb gddr6 graphics card',
    productUrl: 'https://www.globalbrand.com.bd/asus-dual-geforce-rtx-4060-evo-oc-8gb-graphics-card',
    imageUrl: 'https://www.globalbrand.com.bd/image/cache/catalog/product/asus-rtx-4060-dual-evo-500x500.jpg',
    currentPrice: 42500,
    originalPrice: 45000,
    availability: 'In Stock',
    inStock: true,
    brand: 'ASUS',
    category: 'Graphics Card',
    specs: { GPU: 'RTX 4060', VRAM: '8GB GDDR6', Edition: 'OC Edition' },
  },

  // --- Corsair Vengeance LPX 8GB 3200MHz DDR4 RAM (Cross-retailer comparison) ---
  {
    shopSlug: 'startech',
    shopId: 'shop-startech',
    rawTitle: 'Corsair Vengeance LPX 8GB 3200MHz DDR4 Desktop RAM Black',
    cleanTitle: 'corsair vengeance lpx 8gb 3200mhz ddr4 desktop ram black',
    productUrl: 'https://www.startech.com.bd/corsair-vengeance-lpx-8gb-3200mhz-ddr4-desktop-ram',
    imageUrl: 'https://www.startech.com.bd/image/cache/catalog/ram/corsair/vengeance-lpx-8gb-3200mhz/vengeance-lpx-8gb-3200mhz-01-500x500.jpg',
    currentPrice: 2450,
    originalPrice: 2700,
    availability: 'In Stock',
    inStock: true,
    mpn: 'CMK8GX4M1E3200C16',
    brand: 'Corsair',
    category: 'RAM',
    specs: { Capacity: '8GB', Speed: '3200MHz', Type: 'DDR4', Pin: '288-Pin' },
  },
  {
    shopSlug: 'ryans',
    shopId: 'shop-ryans',
    rawTitle: 'Corsair Vengeance LPX 8GB DDR4 3200MHz Black Desktop RAM #CMK8GX4M1E3200C16',
    cleanTitle: 'corsair vengeance lpx 8gb ddr4 3200mhz black desktop ram',
    productUrl: 'https://www.ryans.com/corsair-vengeance-lpx-8gb-ddr4-3200mhz-ram',
    imageUrl: 'https://www.ryans.com/storage/products/main/corsair-vengeance-lpx-8gb-ddr4-3200mhz-black-desktop-ram-11612456789.webp',
    currentPrice: 2500,
    originalPrice: 2800,
    availability: 'In Stock',
    inStock: true,
    mpn: 'CMK8GX4M1E3200C16',
    brand: 'Corsair',
    category: 'RAM',
    specs: { Capacity: '8GB', Speed: '3200MHz', Type: 'DDR4', Pin: '288-Pin' },
  },
  {
    shopSlug: 'techland',
    shopId: 'shop-techland',
    rawTitle: 'Corsair Vengeance LPX 8GB DDR4 3200MHz Desktop RAM',
    cleanTitle: 'corsair vengeance lpx 8gb ddr4 3200mhz desktop ram',
    productUrl: 'https://www.techlandbd.com/corsair-vengeance-lpx-8gb-ddr4-3200mhz-desktop-ram',
    imageUrl: 'https://www.techlandbd.com/image/cache/catalog/RAM/CORSAIR/vengeance-lpx-8gb-3200mhz-500x500.jpg',
    currentPrice: 2475,
    originalPrice: 2750,
    availability: 'In Stock',
    inStock: true,
    mpn: 'CMK8GX4M1E3200C16',
    brand: 'Corsair',
    category: 'RAM',
    specs: { Capacity: '8GB', Speed: '3200MHz', Type: 'DDR4', Pin: '288-Pin' },
  },
  {
    shopSlug: 'samanta',
    shopId: 'shop-samanta',
    rawTitle: 'Corsair Vengeance LPX 8GB DDR4 3200MHz RAM',
    cleanTitle: 'corsair vengeance lpx 8gb ddr4 3200mhz ram',
    productUrl: 'https://samantacomputer.com/corsair-vengeance-lpx-8gb-ddr4-ram',
    imageUrl: 'https://samantacomputer.com/assets/products/corsair-8gb-3200mhz.jpg',
    currentPrice: 2490,
    originalPrice: 2700,
    availability: 'In Stock',
    inStock: true,
    mpn: 'CMK8GX4M1E3200C16',
    brand: 'Corsair',
    category: 'RAM',
    specs: { Capacity: '8GB', Speed: '3200MHz', Type: 'DDR4', Pin: '288-Pin' },
  },

  // --- Walton Electronics (Televisions & Smartphones) ---
  {
    shopSlug: 'walton',
    shopId: 'shop-walton',
    rawTitle: 'Walton W43D210 43 Inch Smart Android TV',
    cleanTitle: 'walton w43d210 43 inch smart android tv',
    productUrl: 'https://waltonbd.com/w43d210-43-inch-smart-tv',
    imageUrl: 'https://waltonbd.com/image/catalog/television/smart-tv/w43d210/w43d210-1.jpg',
    currentPrice: 34900,
    originalPrice: 38500,
    availability: 'In Stock',
    inStock: true,
    brand: 'Walton',
    category: 'Television',
    specs: { ScreenSize: '43 Inch', Resolution: 'FHD 1920x1080', OS: 'Android TV' },
  },
  {
    shopSlug: 'walton',
    shopId: 'shop-walton',
    rawTitle: 'Walton Primo GH11 (3GB/32GB)',
    cleanTitle: 'walton primo gh11 3gb 32gb',
    productUrl: 'https://waltonbd.com/primo-gh11',
    imageUrl: 'https://waltonbd.com/image/catalog/smartphones/primo-gh11/primo-gh11-1.jpg',
    currentPrice: 9499,
    originalPrice: 10499,
    availability: 'In Stock',
    inStock: true,
    brand: 'Walton',
    category: 'Smartphone',
    specs: { RAM: '3GB', Storage: '32GB', Display: '6.52 Inch HD+' },
  },
];

/**
 * Seeds realistic sample products into SQLite database or simulates in dry-run mode.
 */
export async function seedSampleProducts(options: {
  dryRun?: boolean;
  vendor?: string;
  limit?: number;
  targetDb?: Database.Database;
}): Promise<ScrapedProduct[]> {
  const currentDb = options.targetDb || db;
  const now = new Date().toISOString();

  // 1. Ensure default retailers exist
  if (!options.dryRun) {
    seedDefaultRetailers(currentDb);
  }

  // 2. Filter products by vendor if specified
  let itemsToSeed = SAMPLE_PRODUCTS;
  if (options.vendor && options.vendor !== 'all') {
    itemsToSeed = itemsToSeed.filter(item => item.shopSlug === options.vendor);
  }

  // 3. Apply per-vendor limit if specified
  if (options.limit && options.limit > 0) {
    const perShopCount: Record<string, number> = {};
    itemsToSeed = itemsToSeed.filter(item => {
      const current = perShopCount[item.shopSlug] || 0;
      if (current < options.limit!) {
        perShopCount[item.shopSlug] = current + 1;
        return true;
      }
      return false;
    });
  }

  const resultProducts: ScrapedProduct[] = [];

  if (options.dryRun) {
    console.log(`[DRY-RUN] Simulating seed of ${itemsToSeed.length} sample products across retailers...`);
    for (const item of itemsToSeed) {
      resultProducts.push({
        id: generateScrapedProductId(item.shopSlug, item.productUrl),
        shopId: item.shopId,
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
      });
    }
    return resultProducts;
  }

  // Live database persistence
  const checkShopStmt = currentDb.prepare('SELECT id FROM tracked_shops WHERE slug = ?');
  const upsertProductStmt = currentDb.prepare(`
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
      image_url = excluded.image_url,
      current_price = excluded.current_price,
      original_price = excluded.original_price,
      availability = excluded.availability,
      in_stock = excluded.in_stock,
      mpn = excluded.mpn,
      brand = excluded.brand,
      category = excluded.category,
      last_scraped_at = excluded.last_scraped_at
  `);

  const insertHistoryStmt = currentDb.prepare(`
    INSERT INTO price_history (id, scraped_product_id, price, availability, recorded_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const updateShopStmt = currentDb.prepare(`
    UPDATE tracked_shops
    SET last_scrape_status = 'SUCCESS',
        last_scraped_at = ?,
        product_count = (SELECT COUNT(*) FROM scraped_products WHERE shop_id = tracked_shops.id),
        updated_at = ?
    WHERE id = ?
  `);

  const affectedShopIds = new Set<string>();

  const seedTx = currentDb.transaction(() => {
    for (const item of itemsToSeed) {
      const shopRow = checkShopStmt.get(item.shopSlug) as { id: string } | undefined;
      const resolvedShopId = shopRow ? shopRow.id : item.shopId;
      const productId = generateScrapedProductId(item.shopSlug, item.productUrl);

      const productRecord: ScrapedProduct = {
        id: productId,
        shopId: resolvedShopId,
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
        product_group_id: null,
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
        match_confidence: 0.0,
        last_scraped_at: now,
        created_at: now,
      });

      insertHistoryStmt.run(
        `ph-${productRecord.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productRecord.id,
        productRecord.currentPrice,
        productRecord.availability,
        now
      );

      resultProducts.push(productRecord);
      affectedShopIds.add(resolvedShopId);
    }

    for (const shopId of affectedShopIds) {
      updateShopStmt.run(now, now, shopId);
    }
  });

  seedTx();
  return resultProducts;
}

// ============================================================================
// 3. PRODUCT MATCHING ENGINE (INTEGRATION / FALLBACK CLUSTERING)
// ============================================================================

export function sanitizeTitle(raw: string): string {
  return raw
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[®™#]/g, ' ')
    .replace(/\b(?:boxed|with cooler|official warranty|price in bd|desktop|processor|graphics card|ram|ssd)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractMpn(rawTitle: string): string | null {
  const match = rawTitle.match(/#([A-Za-z0-9\-]+)/);
  if (match) return match[1].toUpperCase();

  const amdPart = rawTitle.match(/\b(100-[0-9]{9}[A-Z]{0,3})\b/i);
  if (amdPart) return amdPart[1].toUpperCase();

  const corsairPart = rawTitle.match(/\b(CM[A-Z0-9]{12,16})\b/i);
  if (corsairPart) return corsairPart[1].toUpperCase();

  const zotacPart = rawTitle.match(/\b(ZT-[A-Z0-9\-]{8,14})\b/i);
  if (zotacPart) return zotacPart[1].toUpperCase();

  return null;
}

export function extractModelSignature(rawTitle: string): {
  brand: string | null;
  model: string | null;
  specs: Record<string, string>;
} {
  const lower = rawTitle.toLowerCase();
  let brand: string | null = null;
  const brands = ['amd', 'intel', 'asus', 'msi', 'gigabyte', 'zotac', 'corsair', 'walton', 'samsung', 'kingston'];
  for (const b of brands) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(rawTitle)) {
      brand = b.charAt(0).toUpperCase() + b.slice(1);
      break;
    }
  }

  let model: string | null = null;
  // AMD Ryzen check
  const ryzenMatch = rawTitle.match(/\b(ryzen\s*[3579]\s*(?:pro\s*)?[0-9]{4,5}[a-z]{0,3})\b/i);
  if (ryzenMatch) model = ryzenMatch[1].toUpperCase().replace(/\s+/g, ' ');

  // Intel Core check
  const intelMatch = rawTitle.match(/\b(core\s*i[3579]\s*(?:pro\s*)?[0-9]{4,5}[a-z]{0,3})\b/i);
  if (intelMatch) model = intelMatch[1].toUpperCase().replace(/\s+/g, ' ');

  // NVIDIA GPU check
  const rtxMatch = rawTitle.match(/\b(?:geforce\s*)?(rtx|gtx)\s*([0-9]{3,4}(?:\s*ti)?(?:\s*super)?)\b/i);
  if (rtxMatch) model = `${rtxMatch[1].toUpperCase()} ${rtxMatch[2].toUpperCase()}`.trim();

  // Corsair Vengeance RAM
  if (lower.includes('vengeance lpx')) {
    model = 'Vengeance LPX';
  }

  // Walton models
  const waltonMatch = rawTitle.match(/\b(w[0-9]{2}[a-z0-9\-]+|primo\s*[a-z0-9\-]+)\b/i);
  if (waltonMatch) model = waltonMatch[1].toUpperCase();

  const specs: Record<string, string> = {};
  const ramCap = rawTitle.match(/\b([0-9]{1,3}gb)\b/i);
  if (ramCap) specs.capacity = ramCap[1].toUpperCase();

  const ramSpeed = rawTitle.match(/\b([0-9]{4}mhz)\b/i);
  if (ramSpeed) specs.speed = ramSpeed[1].toUpperCase();

  return { brand, model, specs };
}

/**
 * Checks whether two products represent a hard negative (must NOT be grouped together).
 */
export function isHardNegative(a: { rawTitle: string; brand?: string }, b: { rawTitle: string; brand?: string }): boolean {
  const sigA = extractModelSignature(a.rawTitle);
  const sigB = extractModelSignature(b.rawTitle);

  // 1. Brand Mismatch
  if (sigA.brand && sigB.brand && sigA.brand.toLowerCase() !== sigB.brand.toLowerCase()) {
    return true;
  }

  // 2. CPU / GPU Model Mismatch (e.g. 5600 vs 5600X, 4060 vs 4060 Ti)
  if (sigA.model && sigB.model && sigA.model !== sigB.model) {
    return true;
  }

  // 3. RAM Capacity Mismatch (e.g. 8GB vs 16GB)
  if (sigA.specs.capacity && sigB.specs.capacity && sigA.specs.capacity !== sigB.specs.capacity) {
    return true;
  }

  return false;
}

/**
 * Fallback clustering product matching engine:
 * Groups products into canonical product_groups and updates foreign keys.
 */
export async function runProductMatching(options: {
  dryRun?: boolean;
  targetDb?: Database.Database;
}): Promise<{ groupsCount: number; matchedProductsCount: number }> {
  const currentDb = options.targetDb || db;

  // 1. Check if external M4 matcher is available
  try {
    const matcherPath = path.join(process.cwd(), 'src', 'matcher', 'productMatcher.ts');
    if (fs.existsSync(matcherPath)) {
      const dynamicImport = Function('modulePath', 'return import(modulePath)');
      const matcherModule = await dynamicImport(path.resolve(matcherPath));
      if (typeof matcherModule.matchAllProducts === 'function') {
        const res = await matcherModule.matchAllProducts({ dryRun: options.dryRun });
        return { groupsCount: res.groupsCount || 0, matchedProductsCount: res.matchedProductsCount || 0 };
      }
    }
  } catch {
    // Graceful fallback to built-in matching engine
  }

  // 2. Query all scraped products
  const products = currentDb.prepare(`
    SELECT sp.*, ts.name as shop_name, ts.logo_url as shop_logo
    FROM scraped_products sp
    JOIN tracked_shops ts ON sp.shop_id = ts.id
  `).all() as any[];

  if (products.length === 0) {
    console.log('[Matcher] No scraped products found in database to match.');
    return { groupsCount: 0, matchedProductsCount: 0 };
  }

  // 3. Cluster products by MPN or Brand+Model signature
  const clusters: Map<string, any[]> = new Map();

  for (const p of products) {
    const mpn = p.mpn || extractMpn(p.raw_title);
    const sig = extractModelSignature(p.raw_title);
    let clusterKey: string | null = null;

    if (mpn) {
      clusterKey = `mpn:${p.category || 'tech'}:${mpn}`;
    } else if (sig.brand && sig.model) {
      const specKey = Object.values(sig.specs).sort().join('-');
      clusterKey = `model:${sig.brand.toLowerCase()}:${sig.model.toLowerCase()}:${specKey}`;
    } else {
      // Fallback single product group
      clusterKey = `single:${p.id}`;
    }

    // Check cluster for hard negatives before assigning
    const existingCluster = clusters.get(clusterKey);
    if (existingCluster && existingCluster.length > 0) {
      const hasConflict = existingCluster.some(member => isHardNegative({ rawTitle: member.raw_title, brand: member.brand }, { rawTitle: p.raw_title, brand: p.brand }));
      if (hasConflict) {
        clusterKey = `single:${p.id}`;
      }
    }

    if (!clusters.has(clusterKey)) {
      clusters.set(clusterKey, []);
    }
    clusters.get(clusterKey)!.push(p);
  }

  let groupsCreatedOrUpdated = 0;
  let productsAssigned = 0;
  const now = new Date().toISOString();

  if (options.dryRun) {
    console.log(`[DRY-RUN] Product Matcher: Clustered ${products.length} products into ${clusters.size} canonical groups.`);
    return { groupsCount: clusters.size, matchedProductsCount: products.length };
  }

  const upsertGroupStmt = currentDb.prepare(`
    INSERT INTO product_groups (
      id, canonical_name, slug, brand, category, model, specs_json,
      image_url, min_price, max_price, best_deal_shop_id, best_deal_price,
      best_deal_url, offer_count, in_stock_offer_count, created_at, updated_at
    ) VALUES (
      @id, @canonical_name, @slug, @brand, @category, @model, @specs_json,
      @image_url, @min_price, @max_price, @best_deal_shop_id, @best_deal_price,
      @best_deal_url, @offer_count, @in_stock_offer_count, @created_at, @updated_at
    ) ON CONFLICT(slug) DO UPDATE SET
      canonical_name = excluded.canonical_name,
      min_price = excluded.min_price,
      max_price = excluded.max_price,
      best_deal_shop_id = excluded.best_deal_shop_id,
      best_deal_price = excluded.best_deal_price,
      best_deal_url = excluded.best_deal_url,
      offer_count = excluded.offer_count,
      in_stock_offer_count = excluded.in_stock_offer_count,
      updated_at = excluded.updated_at
  `);

  const updateProductGroupStmt = currentDb.prepare(`
    UPDATE scraped_products
    SET product_group_id = ?, match_confidence = ?
    WHERE id = ?
  `);

  const matchTx = currentDb.transaction(() => {
    for (const [key, clusterItems] of clusters.entries()) {
      // Sort offers: in-stock first, then ascending by current_price
      const inStockOffers = clusterItems.filter(i => i.in_stock === 1);
      const activeOffers = inStockOffers.length > 0 ? inStockOffers : clusterItems;
      activeOffers.sort((a, b) => a.current_price - b.current_price);
      clusterItems.sort((a, b) => a.current_price - b.current_price);

      const bestDeal = activeOffers[0];
      const minPrice = bestDeal.current_price;
      const maxPrice = clusterItems[clusterItems.length - 1].current_price;

      // Select cleanest title for canonical name
      const shortestTitleItem = [...clusterItems].sort((a, b) => a.raw_title.length - b.raw_title.length)[0];
      const canonicalName = shortestTitleItem.raw_title;

      // Generate stable slug
      const slug = canonicalName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `group-${Date.now()}`;

      const groupId = `pg-${slug.slice(0, 48)}`;
      const brand = bestDeal.brand || shortestTitleItem.brand || 'Generic';
      const category = bestDeal.category || shortestTitleItem.category || 'Tech';
      const sig = extractModelSignature(canonicalName);
      const model = sig.model || 'Standard';

      upsertGroupStmt.run({
        id: groupId,
        canonical_name: canonicalName,
        slug,
        brand,
        category,
        model,
        specs_json: JSON.stringify(sig.specs || {}),
        image_url: shortestTitleItem.image_url || '',
        min_price: minPrice,
        max_price: maxPrice,
        best_deal_shop_id: bestDeal.shop_id,
        best_deal_price: minPrice,
        best_deal_url: bestDeal.product_url,
        offer_count: clusterItems.length,
        in_stock_offer_count: inStockOffers.length,
        created_at: now,
        updated_at: now,
      });

      for (const item of clusterItems) {
        const confidence = item.mpn ? 1.0 : (sig.brand && sig.model ? 0.95 : 0.85);
        updateProductGroupStmt.run(groupId, confidence, item.id);
        productsAssigned++;
      }

      groupsCreatedOrUpdated++;
    }
  });

  matchTx();
  console.log(`[Matcher] Successfully clustered ${productsAssigned} products into ${groupsCreatedOrUpdated} canonical product groups.`);
  return { groupsCount: groupsCreatedOrUpdated, matchedProductsCount: productsAssigned };
}

// ============================================================================
// 4. MAIN CLI RUNNER COORDINATOR
// ============================================================================

export async function runCli(args: string[]): Promise<number> {
  const { options, errors } = parseCliArgs(args);

  if (options.help) {
    printHelp();
    return 0;
  }

  if (errors.length > 0) {
    console.error('\x1b[31m[CLI Error]\x1b[0m Invalid arguments provided:');
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    printHelp();
    return 1;
  }

  // Graceful shutdown registration
  let isShuttingDown = false;
  const handleSignal = (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n[Scraper CLI] Interruption signal received (${signal}). Gracefully shutting down...`);
    try {
      if (db && typeof db.close === 'function') {
        db.close();
      }
    } catch {
      // Ignore database close errors on shutdown
    }
    process.exit(130);
  };

  process.once('SIGINT', () => handleSignal('SIGINT'));
  process.once('SIGTERM', () => handleSignal('SIGTERM'));

  console.log('==============================================================================');
  console.log('  BANGLADESHI TECH PRICE COMPARISON SCRAPING & PIPELINE RUNNER');
  console.log('==============================================================================');
  console.log(`Execution Mode : ${options.dryRun ? 'DRY-RUN (No DB modifications)' : 'LIVE EXECUTION'}`);
  console.log(`Stealth Mode   : ${options.stealth ? 'ENABLED (Client Hints + Randomized Jitter)' : 'STANDARD'}`);
  console.log(`Product Limit  : ${options.limit || 50} per shop`);
  console.log(`Product Match  : ${options.match ? 'ENABLED' : 'DISABLED'}`);
  console.log('------------------------------------------------------------------------------');

  // Handle --seed-sample mode
  if (options.seedSample) {
    console.log('[Runner] Seeding realistic sample Bangladeshi physical tech products...');
    const seeded = await seedSampleProducts({
      dryRun: options.dryRun,
      vendor: options.vendor,
      limit: options.limit,
    });
    console.log(`[Runner] Populated ${seeded.length} physical tech products across major retailers.`);

    if (options.match) {
      console.log('[Runner] Triggering product matching engine on seeded catalog...');
      await runProductMatching({ dryRun: options.dryRun });
    }

    console.log('\n[Runner] Sample seeding and pipeline completed successfully.');
    return 0;
  }

  // Handle standard scraping execution
  const activeShops = getTrackedShops({ activeOnly: true });
  let targetShops: TrackedShop[] = [];

  if (options.vendor && options.vendor !== 'all') {
    const singleShop = getShopBySlug(options.vendor) || getShopById(options.vendor);
    if (!singleShop) {
      console.error(`\x1b[31m[Scraper Error]\x1b[0m Retailer with slug or ID "${options.vendor}" was not found in tracked_shops.`);
      return 1;
    }
    targetShops = [singleShop];
  } else {
    // Default or --all
    targetShops = activeShops;
  }

  if (targetShops.length === 0) {
    console.log('[Runner] No active shops found to scrape.');
    return 0;
  }

  console.log(`[Runner] Beginning scrape for ${targetShops.length} shop(s): ${targetShops.map(s => s.name).join(', ')}`);

  let totalScraped = 0;
  let successfulShops = 0;
  let failedShops = 0;

  for (let i = 0; i < targetShops.length; i++) {
    if (isShuttingDown) break;
    const shop = targetShops[i];

    // Inter-shop stealth delay
    if (i > 0 && options.stealth) {
      const delay = calculateJitterDelay(2000, 4500);
      console.log(`[Stealth] Applying ${delay}ms inter-domain jitter before crawling ${shop.name}...`);
      await randomDelay(2000, 4500);
    }

    console.log(`\n[Scraper] [${i + 1}/${targetShops.length}] Crawling ${shop.name} (${shop.domain})...`);

    try {
      const res = await scrapeShop(shop.id, {
        limit: options.limit || 50,
        stealth: options.stealth,
        dryRun: options.dryRun,
        minDelayMs: options.stealth ? 2000 : 1500,
        maxDelayMs: options.stealth ? 4500 : 3000,
      });

      if (res.status === 'SUCCESS') {
        successfulShops++;
        totalScraped += res.itemCount;
        console.log(`  ✓ ${shop.name}: Successfully extracted ${res.itemCount} products (${res.durationMs}ms)`);
      } else {
        failedShops++;
        console.warn(`  ⚠ ${shop.name}: Scrape finished with status ${res.status}. Errors: ${res.errors.join('; ')}`);
      }
    } catch (err: unknown) {
      failedShops++;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${shop.name}: Error encountered during crawl: ${errMsg}`);
      if (!options.dryRun) {
        updateShopScrapeStatus(shop.id, 'FAILED', 0, errMsg);
      }
    }
  }

  console.log('\n------------------------------------------------------------------------------');
  console.log(`Scrape Summary: ${successfulShops} succeeded, ${failedShops} failed | Total products: ${totalScraped}`);

  // Product Matching Gate
  if (options.match && !isShuttingDown) {
    console.log('\n[Runner] Invoking Product Matching & Clustering Engine...');
    await runProductMatching({ dryRun: options.dryRun });
  }

  return 0;
}

// ============================================================================
// 5. DIRECT EXECUTION HANDLER
// ============================================================================

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('run-scraper.ts') || process.argv[1].endsWith('run-scraper.js'));

if (isDirectRun) {
  runCli(process.argv.slice(2))
    .then(exitCode => {
      process.exit(exitCode);
    })
    .catch(err => {
      console.error('Fatal CLI execution exception:', err);
      process.exit(1);
    });
}
