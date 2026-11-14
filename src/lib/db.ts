/**
 * Bangladeshi Digital Goods Price Comparison Platform
 * SQLite Persistence Layer & Type-Safe Database Accessors
 * 
 * Location: src/lib/db.ts
 * Driver: better-sqlite3
 * 
 * SERVER-ONLY MODULE NOTICE:
 * This file uses 'better-sqlite3', a native C++ Node.js addon.
 * It must ONLY be imported in server-side contexts:
 * - Next.js Route Handlers (app/api/.../route.ts)
 * - Next.js Server Components / Server Actions
 * - CLI seeding & test scripts (scripts/seed-digital-goods.ts, scripts/verify-data.ts)
 * 
 * For client components ('use client'), access data via src/lib/dataService.ts
 * which operates over the typed in-memory store src/data/digitalGoodsData.ts.
 */

import Database from 'better-sqlite3';
import path from 'path';
import {
  Vendor,
  Product,
  VendorDeal,
  ScamStore,
  ProductComparisonDetail,
  ProductFilterOptions,
  VendorRow,
  ProductRow,
  VendorDealRow,
  ScamStoreRow,
  PaymentMethod,
  ProductCategory,
  StockStatus,
  DealType,
  DeliveryType,
  ScamPlatform,
  RiskTier,
} from '@/types/digitalGoods';
import {
  TrackedShop,
  TrackedShopRow,
  RetailerAdapterType,
  ScrapeStatus,
  ScrapedProduct,
  ScrapedProductRow,
  ProductGroup,
  ProductGroupRow,
  ProductAvailability,
} from '@/types/physicalGoods';

const dbPath = path.join(process.cwd(), 'ecom.db');
const db: Database.Database = new Database(dbPath);

// Enable WAL mode for high concurrency & foreign key constraints
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============================================================================
// SCHEMA INITIALIZATION & MIGRATION
// ============================================================================

/**
 * Initializes or migrates the SQLite schema.
 * Automatically cleans up legacy grocery tables if present.
 */
export function initDatabase(): void {
  // Check if legacy grocery schema exists in 'products' table
  try {
    const tableInfo = db.prepare("PRAGMA table_info(products)").all() as { name: string }[];
    const hasLegacyColumns = tableInfo.some(col => col.name === 'brand' || col.name === 'weight');
    
    if (hasLegacyColumns) {
      // Clean drop legacy grocery tables to allow clean digital goods creation
      db.exec(`
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS reviews;
        DROP TABLE IF EXISTS vouchers;
        DROP TABLE IF EXISTS vendor_deals;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS vendors;
        DROP TABLE IF EXISTS scam_stores;
      `);
    }
  } catch {
    // Table doesn't exist yet, continue
  }

  // Execute DDL for normalized digital goods tables
  db.exec(`
    -- 1. Vendors Table
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      domain TEXT NOT NULL UNIQUE,
      website_url TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 1,
      trust_score INTEGER NOT NULL CHECK(trust_score BETWEEN 1 AND 100),
      scam_report_count INTEGER NOT NULL DEFAULT 0,
      payment_methods TEXT NOT NULL,
      review_score REAL NOT NULL CHECK(review_score BETWEEN 0.0 AND 5.0),
      total_reviews INTEGER NOT NULL DEFAULT 0,
      delivery_speed TEXT NOT NULL,
      support_channel TEXT NOT NULL,
      has_automated_gateway INTEGER NOT NULL DEFAULT 1,
      has_dbid INTEGER NOT NULL DEFAULT 0,
      trade_license_no TEXT,
      established_year INTEGER NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);
    CREATE INDEX IF NOT EXISTS idx_vendors_verified ON vendors(is_verified);
    CREATE INDEX IF NOT EXISTS idx_vendors_trust ON vendors(trust_score DESC);

    -- 2. Products Table
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      subcategory TEXT,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      tags TEXT NOT NULL,
      is_trending INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      min_price REAL NOT NULL DEFAULT 0,
      max_price REAL NOT NULL DEFAULT 0,
      offer_count INTEGER NOT NULL DEFAULT 0,
      best_vendor_id TEXT,
      features TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (best_vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_trending ON products(is_trending);
    CREATE INDEX IF NOT EXISTS idx_products_min_price ON products(min_price);

    -- 3. Vendor Deals Table
    CREATE TABLE IF NOT EXISTS vendor_deals (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      vendor_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      duration TEXT NOT NULL,
      price_bdt REAL NOT NULL CHECK(price_bdt >= 0),
      original_price_bdt REAL,
      discount_percent INTEGER,
      in_stock INTEGER NOT NULL DEFAULT 1,
      stock_status TEXT NOT NULL DEFAULT 'In Stock',
      direct_checkout_url TEXT NOT NULL,
      deal_type TEXT NOT NULL DEFAULT 'Recommended',
      delivery_type TEXT NOT NULL DEFAULT 'Instant Automated',
      warranty_policy TEXT NOT NULL,
      verified_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_deals_product ON vendor_deals(product_id);
    CREATE INDEX IF NOT EXISTS idx_deals_vendor ON vendor_deals(vendor_id);
    CREATE INDEX IF NOT EXISTS idx_deals_price ON vendor_deals(product_id, price_bdt ASC);
    CREATE INDEX IF NOT EXISTS idx_deals_stock ON vendor_deals(in_stock);

    -- 4. Scam Blacklist Registry Table
    CREATE TABLE IF NOT EXISTS scam_stores (
      id TEXT PRIMARY KEY,
      domain_or_page_name TEXT NOT NULL,
      platform TEXT NOT NULL,
      url_or_handle TEXT NOT NULL,
      reason TEXT NOT NULL,
      flagged_date TEXT NOT NULL,
      evidence_summary TEXT NOT NULL,
      risk_tier TEXT NOT NULL CHECK(risk_tier IN ('CRITICAL', 'HIGH', 'MODERATE')),
      reported_phone_numbers TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_scam_name ON scam_stores(domain_or_page_name);
    CREATE INDEX IF NOT EXISTS idx_scam_platform ON scam_stores(platform);

    -- 5. Tracked Shops Table (Physical Retailers & Generic Stores)
    CREATE TABLE IF NOT EXISTS tracked_shops (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      domain TEXT NOT NULL UNIQUE,
      base_url TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      adapter_type TEXT NOT NULL,
      is_tracked INTEGER NOT NULL DEFAULT 1,
      scrape_interval_hours INTEGER NOT NULL DEFAULT 24,
      rate_limit_delay_ms INTEGER NOT NULL DEFAULT 2500,
      category_urls TEXT NOT NULL,
      last_scraped_at TEXT,
      last_scrape_status TEXT NOT NULL DEFAULT 'IDLE',
      product_count INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tracked_shops_active ON tracked_shops(is_tracked);
    CREATE INDEX IF NOT EXISTS idx_tracked_shops_domain ON tracked_shops(domain);
    CREATE INDEX IF NOT EXISTS idx_tracked_shops_slug ON tracked_shops(slug);

    -- 6. Canonical Product Groups Table
    CREATE TABLE IF NOT EXISTS product_groups (
      id TEXT PRIMARY KEY,
      canonical_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      model TEXT NOT NULL,
      specs_json TEXT NOT NULL,
      image_url TEXT NOT NULL,
      min_price REAL NOT NULL DEFAULT 0,
      max_price REAL NOT NULL DEFAULT 0,
      best_deal_shop_id TEXT,
      best_deal_price REAL NOT NULL DEFAULT 0,
      best_deal_url TEXT,
      offer_count INTEGER NOT NULL DEFAULT 0,
      in_stock_offer_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (best_deal_shop_id) REFERENCES tracked_shops(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_product_groups_slug ON product_groups(slug);
    CREATE INDEX IF NOT EXISTS idx_product_groups_category ON product_groups(category);
    CREATE INDEX IF NOT EXISTS idx_product_groups_brand ON product_groups(brand);
    CREATE INDEX IF NOT EXISTS idx_product_groups_min_price ON product_groups(min_price);

    -- 7. Scraped Products Table (Raw Snapshot per Shop)
    CREATE TABLE IF NOT EXISTS scraped_products (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      product_group_id TEXT,
      raw_title TEXT NOT NULL,
      clean_title TEXT NOT NULL,
      product_url TEXT NOT NULL UNIQUE,
      image_url TEXT,
      current_price REAL NOT NULL,
      original_price REAL,
      availability TEXT NOT NULL DEFAULT 'In Stock',
      in_stock INTEGER NOT NULL DEFAULT 1,
      mpn TEXT,
      brand TEXT,
      category TEXT,
      match_confidence REAL DEFAULT 0.0,
      last_scraped_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (shop_id) REFERENCES tracked_shops(id) ON DELETE CASCADE,
      FOREIGN KEY (product_group_id) REFERENCES product_groups(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_scraped_shop ON scraped_products(shop_id);
    CREATE INDEX IF NOT EXISTS idx_scraped_group ON scraped_products(product_group_id);
    CREATE INDEX IF NOT EXISTS idx_scraped_price ON scraped_products(product_group_id, current_price ASC);
    CREATE INDEX IF NOT EXISTS idx_scraped_url ON scraped_products(product_url);

    -- 8. Price History Table
    CREATE TABLE IF NOT EXISTS price_history (
      id TEXT PRIMARY KEY,
      scraped_product_id TEXT NOT NULL,
      price REAL NOT NULL,
      availability TEXT NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (scraped_product_id) REFERENCES scraped_products(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_history_product_date ON price_history(scraped_product_id, recorded_at);

    -- 9. Unmatched Queue Table
    CREATE TABLE IF NOT EXISTS unmatched_queue (
      id TEXT PRIMARY KEY,
      scraped_product_id TEXT NOT NULL,
      suggested_group_id TEXT,
      similarity_score REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      reviewed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (scraped_product_id) REFERENCES scraped_products(id) ON DELETE CASCADE,
      FOREIGN KEY (suggested_group_id) REFERENCES product_groups(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_unmatched_status ON unmatched_queue(status);
  `);

  // Pre-seed default Bangladeshi retailers
  seedDefaultRetailers(db);
}

// Default Bangladeshi physical electronics retailers (22 Major Verified Retailers)
export const defaultRetailerShops: TrackedShop[] = [
  {
    id: 'shop-startech',
    name: 'Star Tech',
    slug: 'startech',
    domain: 'startech.com.bd',
    baseUrl: 'https://www.startech.com.bd',
    logoUrl: 'https://www.startech.com.bd/image/catalog/logo.png',
    adapterType: 'startech',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2500,
    categoryUrls: [
      'https://www.startech.com.bd/component/processor',
      'https://www.startech.com.bd/component/graphics-card',
      'https://www.startech.com.bd/component/ram',
      'https://www.startech.com.bd/laptop-notebook/laptop',
      'https://www.startech.com.bd/monitor',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 4200,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-ryans',
    name: 'Ryans Computers',
    slug: 'ryans',
    domain: 'ryanscomputers.com',
    baseUrl: 'https://www.ryans.com',
    logoUrl: 'https://www.ryanscomputers.com/assets/images/ryans-logo.svg',
    adapterType: 'ryans',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 3000,
    categoryUrls: [
      'https://www.ryanscomputers.com/category/desktop-component-processor',
      'https://www.ryanscomputers.com/category/desktop-component-graphics-card',
      'https://www.ryanscomputers.com/category/desktop-component-ram',
      'https://www.ryanscomputers.com/category/laptop-all-laptop',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 3850,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-techland',
    name: 'Techland BD',
    slug: 'techland',
    domain: 'techlandbd.com',
    baseUrl: 'https://www.techlandbd.com',
    logoUrl: 'https://www.techlandbd.com/image/catalog/logo/techland-logo.png',
    adapterType: 'techland',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2500,
    categoryUrls: [
      'https://www.techlandbd.com/processor',
      'https://www.techlandbd.com/graphics-card',
      'https://www.techlandbd.com/laptop-computer/brand-laptops',
      'https://www.techlandbd.com/monitor',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 3100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-globalbrand',
    name: 'Global Brand BD',
    slug: 'globalbrand',
    domain: 'globalbrand.com.bd',
    baseUrl: 'https://www.globalbrand.com.bd',
    logoUrl: 'https://www.globalbrand.com.bd/image/catalog/logo.png',
    adapterType: 'globalbrand',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2500,
    categoryUrls: [
      'https://www.globalbrand.com.bd/processor',
      'https://www.globalbrand.com.bd/graphics-card',
      'https://www.globalbrand.com.bd/laptop-notebook',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 2200,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-samanta',
    name: 'Samanta Computer',
    slug: 'samanta',
    domain: 'samantacomputer.com',
    baseUrl: 'https://www.samantacomputer.com',
    logoUrl: 'https://www.samantacomputer.com/images/logo.png',
    adapterType: 'samanta',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://www.samantacomputer.com/processor',
      'https://www.samantacomputer.com/graphics-card',
      'https://www.samantacomputer.com/ram',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 1600,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-walton',
    name: 'Walton BD',
    slug: 'walton',
    domain: 'waltonbd.com',
    baseUrl: 'https://waltonbd.com',
    logoUrl: 'https://waltonbd.com/image/catalog/home-page/logo/walton-logo.png',
    adapterType: 'walton',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2500,
    categoryUrls: [
      'https://waltonbd.com/computer/laptop',
      'https://waltonbd.com/computer/desktop-pc',
      'https://waltonbd.com/television',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 950,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-potakait',
    name: 'Potaka IT',
    slug: 'potakait',
    domain: 'potakait.com',
    baseUrl: 'https://potakait.com',
    logoUrl: 'https://potakait.com/wp-content/uploads/2021/04/potaka-it-logo.png',
    adapterType: 'potakait',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://potakait.com/product-category/processor/',
      'https://potakait.com/product-category/graphics-card/',
      'https://potakait.com/product-category/ram/',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 1250,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-skyland',
    name: 'Skyland BD',
    slug: 'skyland',
    domain: 'skyland.com.bd',
    baseUrl: 'https://www.skyland.com.bd',
    logoUrl: 'https://www.skyland.com.bd/image/catalog/logo/skyland-logo.png',
    adapterType: 'skyland',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://www.skyland.com.bd/processor',
      'https://www.skyland.com.bd/graphics-card',
      'https://www.skyland.com.bd/monitor',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 1800,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-ultratech',
    name: 'Ultratech BD',
    slug: 'ultratech',
    domain: 'ultratech.com.bd',
    baseUrl: 'https://ultratech.com.bd',
    logoUrl: 'https://ultratech.com.bd/image/catalog/logo/ultratech-logo.png',
    adapterType: 'ultratech',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2500,
    categoryUrls: [
      'https://ultratech.com.bd/processor',
      'https://ultratech.com.bd/graphics-card',
      'https://ultratech.com.bd/ram',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 1450,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-computervillage',
    name: 'Computer Village',
    slug: 'computervillage',
    domain: 'computervillage.com.bd',
    baseUrl: 'https://computervillage.com.bd',
    logoUrl: 'https://computervillage.com.bd/media/logo/default/logo.png',
    adapterType: 'computervillage',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2500,
    categoryUrls: [
      'https://computervillage.com.bd/laptop-notebook',
      'https://computervillage.com.bd/processor',
      'https://computervillage.com.bd/monitor',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 2600,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-uccbd',
    name: 'UCC BD',
    slug: 'uccbd',
    domain: 'ucc-bd.com',
    baseUrl: 'https://ucc-bd.com',
    logoUrl: 'https://ucc-bd.com/pub/media/logo/stores/1/ucc-logo.png',
    adapterType: 'uccbd',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2500,
    categoryUrls: [
      'https://ucc-bd.com/components/processor.html',
      'https://ucc-bd.com/components/graphics-card.html',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 1350,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-nexus',
    name: 'Nexus Computer',
    slug: 'nexus',
    domain: 'nexus.com.bd',
    baseUrl: 'https://nexus.com.bd',
    logoUrl: 'https://nexus.com.bd/image/catalog/logo/nexus-logo.png',
    adapterType: 'nexus',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://nexus.com.bd/processor',
      'https://nexus.com.bd/laptop',
      'https://nexus.com.bd/monitor',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 1900,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-creatus',
    name: 'Creatus Computer',
    slug: 'creatus',
    domain: 'creatuscomputer.com',
    baseUrl: 'https://creatuscomputer.com',
    logoUrl: 'https://creatuscomputer.com/wp-content/uploads/2021/03/Creatus-Computer-Logo.png',
    adapterType: 'creatus',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://creatuscomputer.com/product-category/processor/',
      'https://creatuscomputer.com/product-category/graphics-card/',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 1100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-computermania',
    name: 'Computer Mania BD',
    slug: 'computermania',
    domain: 'computermaniabd.com',
    baseUrl: 'https://computermaniabd.com',
    logoUrl: 'https://computermaniabd.com/wp-content/uploads/2020/09/Computer-Mania-BD-Logo.png',
    adapterType: 'computermania',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://computermaniabd.com/product-category/laptops/',
      'https://computermaniabd.com/product-category/gaming-laptop/',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 1400,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-custommacbd',
    name: 'Custom Mac BD',
    slug: 'custommacbd',
    domain: 'custommacbd.com',
    baseUrl: 'https://custommacbd.com',
    logoUrl: 'https://custommacbd.com/cdn/shop/files/Custom-Mac-BD-Logo.png',
    adapterType: 'custommacbd',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://custommacbd.com/collections/macbook',
      'https://custommacbd.com/collections/apple-silicon',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 820,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-applegadgets',
    name: 'Apple Gadgets BD',
    slug: 'applegadgets',
    domain: 'applegadgetsbd.com',
    baseUrl: 'https://applegadgetsbd.com',
    logoUrl: 'https://applegadgetsbd.com/assets/img/apple-gadgets-logo.png',
    adapterType: 'applegadgets',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://applegadgetsbd.com/category/macbook',
      'https://applegadgetsbd.com/category/laptop',
      'https://applegadgetsbd.com/category/monitor',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 2300,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-sumashtech',
    name: 'Sumash Tech',
    slug: 'sumashtech',
    domain: 'sumashtech.com',
    baseUrl: 'https://sumashtech.com',
    logoUrl: 'https://sumashtech.com/cdn/shop/files/sumash-tech-logo.png',
    adapterType: 'sumashtech',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://sumashtech.com/collections/laptop',
      'https://sumashtech.com/collections/smartphones',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 1750,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-pchouse',
    name: 'PC House BD',
    slug: 'pchouse',
    domain: 'pchouse.com.bd',
    baseUrl: 'https://pchouse.com.bd',
    logoUrl: 'https://pchouse.com.bd/image/catalog/logo/pchouse-logo.png',
    adapterType: 'pchouse',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://pchouse.com.bd/processor',
      'https://pchouse.com.bd/graphics-card',
      'https://pchouse.com.bd/monitor',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 1550,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-smartbd',
    name: 'Smart Technologies BD',
    slug: 'smartbd',
    domain: 'smart-bd.com',
    baseUrl: 'https://smart-bd.com',
    logoUrl: 'https://smart-bd.com/wp-content/uploads/2021/06/smart-technologies-logo.png',
    adapterType: 'smartbd',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2500,
    categoryUrls: [
      'https://smart-bd.com/product-category/components/processor/',
      'https://smart-bd.com/product-category/laptops/',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 2900,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-bdtechvalley',
    name: 'BD Tech Valley',
    slug: 'bdtechvalley',
    domain: 'bdtechvalley.com',
    baseUrl: 'https://bdtechvalley.com',
    logoUrl: 'https://bdtechvalley.com/wp-content/uploads/2022/01/bd-tech-valley-logo.png',
    adapterType: 'bdtechvalley',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://bdtechvalley.com/product-category/processor/',
      'https://bdtechvalley.com/product-category/ram/',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 980,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-kablewala',
    name: 'Kablewala BD',
    slug: 'kablewala',
    domain: 'kablewala.com.bd',
    baseUrl: 'https://kablewala.com.bd',
    logoUrl: 'https://kablewala.com.bd/skin/frontend/default/kablewala/images/logo.png',
    adapterType: 'kablewala',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://kablewala.com.bd/computer-gaming/laptops.html',
      'https://kablewala.com.bd/computer-gaming/monitors.html',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 1650,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
  {
    id: 'shop-cloud9',
    name: 'Cloud9 Computers',
    slug: 'cloud9',
    domain: 'cloud9.com.bd',
    baseUrl: 'https://cloud9.com.bd',
    logoUrl: 'https://cloud9.com.bd/wp-content/uploads/2021/10/cloud9-logo.png',
    adapterType: 'cloud9',
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2000,
    categoryUrls: [
      'https://cloud9.com.bd/product-category/processor/',
      'https://cloud9.com.bd/product-category/graphics-card/',
    ],
    lastScrapeStatus: 'SUCCESS',
    productCount: 750,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-14T06:00:00.000Z',
  },
];

// ============================================================================
// PHYSICAL GOODS ROW TRANSFORMERS
// ============================================================================

export function rowToTrackedShop(row: TrackedShopRow): TrackedShop {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    domain: row.domain,
    baseUrl: row.base_url,
    logoUrl: row.logo_url,
    adapterType: row.adapter_type as RetailerAdapterType,
    isTracked: row.is_tracked === 1,
    scrapeIntervalHours: row.scrape_interval_hours,
    rateLimitDelayMs: row.rate_limit_delay_ms,
    categoryUrls: row.category_urls ? JSON.parse(row.category_urls) : [],
    lastScrapedAt: row.last_scraped_at || undefined,
    lastScrapeStatus: (row.last_scrape_status as ScrapeStatus) || 'IDLE',
    productCount: row.product_count,
    errorMessage: row.error_message || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function shopToRow(shop: TrackedShop): TrackedShopRow {
  return {
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    domain: shop.domain,
    base_url: shop.baseUrl,
    logo_url: shop.logoUrl,
    adapter_type: shop.adapterType,
    is_tracked: shop.isTracked ? 1 : 0,
    scrape_interval_hours: shop.scrapeIntervalHours,
    rate_limit_delay_ms: shop.rateLimitDelayMs,
    category_urls: JSON.stringify(shop.categoryUrls || []),
    last_scraped_at: shop.lastScrapedAt || null,
    last_scrape_status: shop.lastScrapeStatus || 'IDLE',
    product_count: shop.productCount || 0,
    error_message: shop.errorMessage || null,
    created_at: shop.createdAt || new Date().toISOString(),
    updated_at: shop.updatedAt || new Date().toISOString(),
  };
}

export function rowToProductGroup(row: ProductGroupRow): ProductGroup {
  return {
    id: row.id,
    canonicalName: row.canonical_name,
    slug: row.slug,
    brand: row.brand,
    category: row.category,
    model: row.model,
    specs: row.specs_json ? JSON.parse(row.specs_json) : {},
    imageUrl: row.image_url,
    minPrice: row.min_price,
    maxPrice: row.max_price,
    bestDealShopId: row.best_deal_shop_id || undefined,
    bestDealPrice: row.best_deal_price,
    bestDealUrl: row.best_deal_url || undefined,
    offerCount: row.offer_count,
    inStockOfferCount: row.in_stock_offer_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function productGroupToRow(pg: ProductGroup): ProductGroupRow {
  return {
    id: pg.id,
    canonical_name: pg.canonicalName,
    slug: pg.slug,
    brand: pg.brand,
    category: pg.category,
    model: pg.model,
    specs_json: JSON.stringify(pg.specs || {}),
    image_url: pg.imageUrl,
    min_price: pg.minPrice,
    max_price: pg.maxPrice,
    best_deal_shop_id: pg.bestDealShopId || null,
    best_deal_price: pg.bestDealPrice,
    best_deal_url: pg.bestDealUrl || null,
    offer_count: pg.offerCount,
    in_stock_offer_count: pg.inStockOfferCount,
    created_at: pg.createdAt || new Date().toISOString(),
    updated_at: pg.updatedAt || new Date().toISOString(),
  };
}

export function rowToScrapedProduct(row: ScrapedProductRow): ScrapedProduct {
  return {
    id: row.id,
    shopId: row.shop_id,
    productGroupId: row.product_group_id || undefined,
    rawTitle: row.raw_title,
    cleanTitle: row.clean_title,
    productUrl: row.product_url,
    imageUrl: row.image_url || undefined,
    currentPrice: row.current_price,
    originalPrice: row.original_price ?? undefined,
    availability: row.availability as ProductAvailability,
    inStock: row.in_stock === 1,
    mpn: row.mpn || undefined,
    brand: row.brand || undefined,
    category: row.category || undefined,
    matchConfidence: row.match_confidence ?? undefined,
    lastScrapedAt: row.last_scraped_at,
    createdAt: row.created_at,
  };
}

export function scrapedProductToRow(sp: ScrapedProduct): ScrapedProductRow {
  return {
    id: sp.id,
    shop_id: sp.shopId,
    product_group_id: sp.productGroupId || null,
    raw_title: sp.rawTitle,
    clean_title: sp.cleanTitle,
    product_url: sp.productUrl,
    image_url: sp.imageUrl || null,
    current_price: sp.currentPrice,
    original_price: sp.originalPrice ?? null,
    availability: sp.availability,
    in_stock: sp.inStock ? 1 : 0,
    mpn: sp.mpn || null,
    brand: sp.brand || null,
    category: sp.category || null,
    match_confidence: sp.matchConfidence ?? null,
    last_scraped_at: sp.lastScrapedAt || new Date().toISOString(),
    created_at: sp.createdAt || new Date().toISOString(),
  };
}

/**
 * Pre-seeds default Bangladeshi retailers into tracked_shops if not already present.
 */
export function seedDefaultRetailers(targetDb: Database.Database = db): void {
  const insertStmt = targetDb.prepare(`
    INSERT OR IGNORE INTO tracked_shops (
      id, name, slug, domain, base_url, logo_url, adapter_type,
      is_tracked, scrape_interval_hours, rate_limit_delay_ms, category_urls,
      last_scraped_at, last_scrape_status, product_count, error_message, created_at, updated_at
    ) VALUES (
      @id, @name, @slug, @domain, @base_url, @logo_url, @adapter_type,
      @is_tracked, @scrape_interval_hours, @rate_limit_delay_ms, @category_urls,
      @last_scraped_at, @last_scrape_status, @product_count, @error_message, @created_at, @updated_at
    )
  `);

  const runSeeding = targetDb.transaction(() => {
    for (const shop of defaultRetailerShops) {
      insertStmt.run(shopToRow(shop));
    }
  });

  runSeeding();
}

// Auto-initialize schema on module load
initDatabase();

/**
 * Reset all digital and physical tables completely.
 */
export function resetDatabase(): void {
  db.exec(`
    DROP TABLE IF EXISTS unmatched_queue;
    DROP TABLE IF EXISTS price_history;
    DROP TABLE IF EXISTS scraped_products;
    DROP TABLE IF EXISTS product_groups;
    DROP TABLE IF EXISTS tracked_shops;
    DROP TABLE IF EXISTS vendor_deals;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS vendors;
    DROP TABLE IF EXISTS scam_stores;
  `);
  initDatabase();
}

// ============================================================================
// ROW TRANSFORMERS (SQLite Row <-> Domain Entity)
// ============================================================================

export function rowToVendor(row: VendorRow): Vendor {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    domain: row.domain,
    websiteUrl: row.website_url,
    logoUrl: row.logo_url,
    isVerified: row.is_verified === 1,
    trustScore: row.trust_score,
    scamReportCount: row.scam_report_count,
    paymentMethods: JSON.parse(row.payment_methods) as PaymentMethod[],
    reviewScore: row.review_score,
    totalReviews: row.total_reviews,
    deliverySpeed: row.delivery_speed,
    supportChannel: row.support_channel,
    hasAutomatedGateway: row.has_automated_gateway === 1,
    hasDBID: row.has_dbid === 1,
    tradeLicenseNo: row.trade_license_no || undefined,
    establishedYear: row.established_year,
    description: row.description || '',
  };
}

export function vendorToRow(vendor: Vendor): VendorRow {
  return {
    id: vendor.id,
    name: vendor.name,
    slug: vendor.slug,
    domain: vendor.domain,
    website_url: vendor.websiteUrl,
    logo_url: vendor.logoUrl,
    is_verified: vendor.isVerified ? 1 : 0,
    trust_score: vendor.trustScore,
    scam_report_count: vendor.scamReportCount,
    payment_methods: JSON.stringify(vendor.paymentMethods),
    review_score: vendor.reviewScore,
    total_reviews: vendor.totalReviews,
    delivery_speed: vendor.deliverySpeed,
    support_channel: vendor.supportChannel,
    has_automated_gateway: vendor.hasAutomatedGateway ? 1 : 0,
    has_dbid: vendor.hasDBID ? 1 : 0,
    trade_license_no: vendor.tradeLicenseNo || null,
    established_year: vendor.establishedYear,
    description: vendor.description,
  };
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category as ProductCategory,
    subcategory: row.subcategory || undefined,
    description: row.description,
    imageUrl: row.image_url,
    tags: JSON.parse(row.tags) as string[],
    isTrending: row.is_trending === 1,
    isFeatured: row.is_featured === 1,
    minPrice: row.min_price,
    maxPrice: row.max_price,
    offerCount: row.offer_count,
    bestVendorId: row.best_vendor_id || '',
    features: JSON.parse(row.features) as string[],
  };
}

export function productToRow(product: Product): ProductRow {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    subcategory: product.subcategory || null,
    description: product.description,
    image_url: product.imageUrl,
    tags: JSON.stringify(product.tags),
    is_trending: product.isTrending ? 1 : 0,
    is_featured: product.isFeatured ? 1 : 0,
    min_price: product.minPrice,
    max_price: product.maxPrice,
    offer_count: product.offerCount,
    best_vendor_id: product.bestVendorId || null,
    features: JSON.stringify(product.features),
  };
}

export function rowToDeal(row: VendorDealRow): VendorDeal {
  return {
    id: row.id,
    productId: row.product_id,
    vendorId: row.vendor_id,
    planName: row.plan_name,
    duration: row.duration,
    priceBDT: row.price_bdt,
    originalPriceBDT: row.original_price_bdt ?? undefined,
    discountPercent: row.discount_percent ?? undefined,
    inStock: row.in_stock === 1,
    stockStatus: row.stock_status as StockStatus,
    directCheckoutUrl: row.direct_checkout_url,
    dealType: row.deal_type as DealType,
    deliveryType: row.delivery_type as DeliveryType,
    warrantyPolicy: row.warranty_policy,
    verifiedAt: row.verified_at,
  };
}

export function dealToRow(deal: VendorDeal): VendorDealRow {
  return {
    id: deal.id,
    product_id: deal.productId,
    vendor_id: deal.vendorId,
    plan_name: deal.planName,
    duration: deal.duration,
    price_bdt: deal.priceBDT,
    original_price_bdt: deal.originalPriceBDT ?? null,
    discount_percent: deal.discountPercent ?? null,
    in_stock: deal.inStock ? 1 : 0,
    stock_status: deal.stockStatus,
    direct_checkout_url: deal.directCheckoutUrl,
    deal_type: deal.dealType,
    delivery_type: deal.deliveryType,
    warranty_policy: deal.warrantyPolicy,
    verified_at: deal.verifiedAt,
  };
}

export function rowToScamStore(row: ScamStoreRow): ScamStore {
  return {
    id: row.id,
    domainOrPageName: row.domain_or_page_name,
    platform: row.platform as ScamPlatform,
    urlOrHandle: row.url_or_handle,
    reason: row.reason,
    flaggedDate: row.flagged_date,
    evidenceSummary: row.evidence_summary,
    riskTier: row.risk_tier as RiskTier,
    reportedPhoneNumbers: row.reported_phone_numbers ? JSON.parse(row.reported_phone_numbers) : undefined,
  };
}

export function scamStoreToRow(scam: ScamStore): ScamStoreRow {
  return {
    id: scam.id,
    domain_or_page_name: scam.domainOrPageName,
    platform: scam.platform,
    url_or_handle: scam.urlOrHandle,
    reason: scam.reason,
    flagged_date: scam.flaggedDate,
    evidence_summary: scam.evidenceSummary,
    risk_tier: scam.riskTier,
    reported_phone_numbers: scam.reportedPhoneNumbers ? JSON.stringify(scam.reportedPhoneNumbers) : null,
  };
}

// ============================================================================
// TYPE-SAFE QUERY ACCESSORS
// ============================================================================

/**
 * Retrieve all verified vendors from SQLite, sorted by trust score descending.
 */
export function getVendorsDb(): Vendor[] {
  const rows = db.prepare('SELECT * FROM vendors ORDER BY trust_score DESC').all() as VendorRow[];
  return rows.map(rowToVendor);
}

/**
 * Retrieve a single vendor by id or slug.
 */
export function getVendorByIdDb(id: string): Vendor | null {
  const row = db.prepare('SELECT * FROM vendors WHERE id = ? OR slug = ?').get(id, id) as VendorRow | undefined;
  return row ? rowToVendor(row) : null;
}

/**
 * Retrieve products with optional filters.
 */
export function getProductsDb(options: ProductFilterOptions = {}): Product[] {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params: (string | number)[] = [];

  if (options.category && options.category !== 'All') {
    query += ' AND category = ?';
    params.push(options.category);
  }

  if (options.minPrice !== undefined) {
    query += ' AND min_price >= ?';
    params.push(options.minPrice);
  }

  if (options.maxPrice !== undefined) {
    query += ' AND min_price <= ?';
    params.push(options.maxPrice);
  }

  if (options.isTrendingOnly) {
    query += ' AND is_trending = 1';
  }

  switch (options.sortBy) {
    case 'price-asc':
      query += ' ORDER BY min_price ASC';
      break;
    case 'price-desc':
      query += ' ORDER BY min_price DESC';
      break;
    case 'offers-count':
      query += ' ORDER BY offer_count DESC';
      break;
    case 'popular':
    default:
      query += ' ORDER BY is_trending DESC, min_price ASC';
      break;
  }

  const rows = db.prepare(query).all(...params) as ProductRow[];
  let products = rows.map(rowToProduct);

  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return products;
}

/**
 * Retrieve a single product by slug.
 */
export function getProductBySlugDb(slug: string): Product | null {
  const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug) as ProductRow | undefined;
  return row ? rowToProduct(row) : null;
}

/**
 * Retrieve deals for a product, GUARANTEED strictly sorted ascending by price_bdt.
 */
export function getDealsForProductDb(productId: string): (VendorDeal & { vendor: Vendor })[] {
  const rows = db.prepare(`
    SELECT vd.*, 
           v.name as v_name, v.slug as v_slug, v.domain as v_domain,
           v.website_url as v_website_url, v.logo_url as v_logo_url,
           v.is_verified as v_is_verified, v.trust_score as v_trust_score,
           v.scam_report_count as v_scam_report_count,
           v.payment_methods as v_payment_methods,
           v.review_score as v_review_score, v.total_reviews as v_total_reviews,
           v.delivery_speed as v_delivery_speed, v.support_channel as v_support_channel,
           v.has_automated_gateway as v_has_automated_gateway,
           v.has_dbid as v_has_dbid, v.trade_license_no as v_trade_license_no,
           v.established_year as v_established_year, v.description as v_description
    FROM vendor_deals vd
    JOIN vendors v ON vd.vendor_id = v.id
    WHERE vd.product_id = ? AND vd.in_stock = 1
    ORDER BY vd.price_bdt ASC
  `).all(productId) as (VendorDealRow & {
    v_name: string; v_slug: string; v_domain: string; v_website_url: string; v_logo_url: string;
    v_is_verified: number; v_trust_score: number; v_scam_report_count: number; v_payment_methods: string;
    v_review_score: number; v_total_reviews: number; v_delivery_speed: string; v_support_channel: string;
    v_has_automated_gateway: number; v_has_dbid: number; v_trade_license_no: string | null;
    v_established_year: number; v_description: string | null;
  })[];

  return rows.map(r => ({
    id: r.id,
    productId: r.product_id,
    vendorId: r.vendor_id,
    planName: r.plan_name,
    duration: r.duration,
    priceBDT: r.price_bdt,
    originalPriceBDT: r.original_price_bdt ?? undefined,
    discountPercent: r.discount_percent ?? undefined,
    inStock: r.in_stock === 1,
    stockStatus: r.stock_status as StockStatus,
    directCheckoutUrl: r.direct_checkout_url,
    dealType: r.deal_type as DealType,
    deliveryType: r.delivery_type as DeliveryType,
    warrantyPolicy: r.warranty_policy,
    verifiedAt: r.verified_at,
    vendor: {
      id: r.vendor_id,
      name: r.v_name,
      slug: r.v_slug,
      domain: r.v_domain,
      websiteUrl: r.v_website_url,
      logoUrl: r.v_logo_url,
      isVerified: r.v_is_verified === 1,
      trustScore: r.v_trust_score,
      scamReportCount: r.v_scam_report_count,
      paymentMethods: JSON.parse(r.v_payment_methods) as PaymentMethod[],
      reviewScore: r.v_review_score,
      totalReviews: r.v_total_reviews,
      deliverySpeed: r.v_delivery_speed,
      supportChannel: r.v_support_channel,
      hasAutomatedGateway: r.v_has_automated_gateway === 1,
      hasDBID: r.v_has_dbid === 1,
      tradeLicenseNo: r.v_trade_license_no || undefined,
      establishedYear: r.v_established_year,
      description: r.v_description || '',
    }
  }));
}

/**
 * Retrieve comprehensive product comparison details with deals sorted ascending.
 */
export function getProductComparisonDb(slug: string): ProductComparisonDetail | null {
  const product = getProductBySlugDb(slug);
  if (!product) return null;

  const deals = getDealsForProductDb(product.id);
  if (deals.length === 0) return null;

  const cheapestDeal = deals[0]; // Guaranteed lowest price due to ORDER BY price_bdt ASC
  const highestPrice = Math.max(...deals.map(d => d.priceBDT));
  const lowestPrice = cheapestDeal.priceBDT;

  return {
    product,
    deals,
    cheapestDeal,
    priceSpreadBDT: highestPrice - lowestPrice,
    totalOffers: deals.length,
  };
}

/**
 * Retrieve all scam blacklist entries from SQLite.
 */
export function getScamStoresDb(): ScamStore[] {
  const rows = db.prepare('SELECT * FROM scam_stores ORDER BY risk_tier DESC').all() as ScamStoreRow[];
  return rows.map(rowToScamStore);
}

/**
 * Check if a domain, store name, or phone number is present in scam registry.
 */
export function isEntityBlacklistedDb(query: string): boolean {
  if (!query) return false;
  const q = `%${query.toLowerCase().trim()}%`;
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM scam_stores
    WHERE LOWER(domain_or_page_name) LIKE ?
       OR LOWER(url_or_handle) LIKE ?
       OR LOWER(reported_phone_numbers) LIKE ?
  `).get(q, q, q) as { count: number };

  return result.count > 0;
}

// ============================================================================
// TRANSACTIONAL BATCH SEEDING HELPERS
// ============================================================================

export function upsertVendors(vendors: Vendor[]): void {
  const stmt = db.prepare(`
    INSERT INTO vendors (
      id, name, slug, domain, website_url, logo_url, is_verified,
      trust_score, scam_report_count, payment_methods, review_score,
      total_reviews, delivery_speed, support_channel, has_automated_gateway,
      has_dbid, trade_license_no, established_year, description
    ) VALUES (
      @id, @name, @slug, @domain, @website_url, @logo_url, @is_verified,
      @trust_score, @scam_report_count, @payment_methods, @review_score,
      @total_reviews, @delivery_speed, @support_channel, @has_automated_gateway,
      @has_dbid, @trade_license_no, @established_year, @description
    ) ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      domain = excluded.domain,
      website_url = excluded.website_url,
      logo_url = excluded.logo_url,
      is_verified = excluded.is_verified,
      trust_score = excluded.trust_score,
      scam_report_count = excluded.scam_report_count,
      payment_methods = excluded.payment_methods,
      review_score = excluded.review_score,
      total_reviews = excluded.total_reviews,
      delivery_speed = excluded.delivery_speed,
      support_channel = excluded.support_channel,
      has_automated_gateway = excluded.has_automated_gateway,
      has_dbid = excluded.has_dbid,
      trade_license_no = excluded.trade_license_no,
      established_year = excluded.established_year,
      description = excluded.description
  `);

  const runMany = db.transaction((items: Vendor[]) => {
    for (const item of items) {
      stmt.run(vendorToRow(item));
    }
  });

  runMany(vendors);
}

export function upsertProducts(products: Product[]): void {
  const stmt = db.prepare(`
    INSERT INTO products (
      id, name, slug, category, subcategory, description, image_url,
      tags, is_trending, is_featured, min_price, max_price, offer_count,
      best_vendor_id, features
    ) VALUES (
      @id, @name, @slug, @category, @subcategory, @description, @image_url,
      @tags, @is_trending, @is_featured, @min_price, @max_price, @offer_count,
      @best_vendor_id, @features
    ) ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      category = excluded.category,
      subcategory = excluded.subcategory,
      description = excluded.description,
      image_url = excluded.image_url,
      tags = excluded.tags,
      is_trending = excluded.is_trending,
      is_featured = excluded.is_featured,
      min_price = excluded.min_price,
      max_price = excluded.max_price,
      offer_count = excluded.offer_count,
      best_vendor_id = excluded.best_vendor_id,
      features = excluded.features,
      updated_at = datetime('now')
  `);

  const runMany = db.transaction((items: Product[]) => {
    for (const item of items) {
      stmt.run(productToRow(item));
    }
  });

  runMany(products);
}

export function upsertDeals(deals: VendorDeal[]): void {
  const stmt = db.prepare(`
    INSERT INTO vendor_deals (
      id, product_id, vendor_id, plan_name, duration, price_bdt,
      original_price_bdt, discount_percent, in_stock, stock_status,
      direct_checkout_url, deal_type, delivery_type, warranty_policy, verified_at
    ) VALUES (
      @id, @product_id, @vendor_id, @plan_name, @duration, @price_bdt,
      @original_price_bdt, @discount_percent, @in_stock, @stock_status,
      @direct_checkout_url, @deal_type, @delivery_type, @warranty_policy, @verified_at
    ) ON CONFLICT(id) DO UPDATE SET
      product_id = excluded.product_id,
      vendor_id = excluded.vendor_id,
      plan_name = excluded.plan_name,
      duration = excluded.duration,
      price_bdt = excluded.price_bdt,
      original_price_bdt = excluded.original_price_bdt,
      discount_percent = excluded.discount_percent,
      in_stock = excluded.in_stock,
      stock_status = excluded.stock_status,
      direct_checkout_url = excluded.direct_checkout_url,
      deal_type = excluded.deal_type,
      delivery_type = excluded.delivery_type,
      warranty_policy = excluded.warranty_policy,
      verified_at = excluded.verified_at
  `);

  const runMany = db.transaction((items: VendorDeal[]) => {
    for (const item of items) {
      stmt.run(dealToRow(item));
    }
  });

  runMany(deals);
}

export function upsertScamStores(scams: ScamStore[]): void {
  const stmt = db.prepare(`
    INSERT INTO scam_stores (
      id, domain_or_page_name, platform, url_or_handle, reason,
      flagged_date, evidence_summary, risk_tier, reported_phone_numbers
    ) VALUES (
      @id, @domain_or_page_name, @platform, @url_or_handle, @reason,
      @flagged_date, @evidence_summary, @risk_tier, @reported_phone_numbers
    ) ON CONFLICT(id) DO UPDATE SET
      domain_or_page_name = excluded.domain_or_page_name,
      platform = excluded.platform,
      url_or_handle = excluded.url_or_handle,
      reason = excluded.reason,
      flagged_date = excluded.flagged_date,
      evidence_summary = excluded.evidence_summary,
      risk_tier = excluded.risk_tier,
      reported_phone_numbers = excluded.reported_phone_numbers
  `);

  const runMany = db.transaction((items: ScamStore[]) => {
    for (const item of items) {
      stmt.run(scamStoreToRow(item));
    }
  });

  runMany(scams);
}

export default db;
