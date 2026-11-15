import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';

const dbPath = path.join(process.cwd(), 'ecom.db');
const walPath = path.join(process.cwd(), 'ecom.db-wal');
const shmPath = path.join(process.cwd(), 'ecom.db-shm');

console.log('1. Cleaning up existing database files...');
try { if (fs.existsSync(walPath)) fs.unlinkSync(walPath); } catch {}
try { if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath); } catch {}
try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath); } catch {}

console.log('2. Opening fresh ecom.db...');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('3. Creating schema...');
db.exec(`
  CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL UNIQUE,
    website_url TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    is_verified INTEGER NOT NULL DEFAULT 1,
    trust_score INTEGER NOT NULL,
    scam_report_count INTEGER NOT NULL DEFAULT 0,
    payment_methods TEXT NOT NULL,
    review_score REAL NOT NULL,
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

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    game_title TEXT,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    denomination_value REAL,
    denomination_unit TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vendor_deals (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    vendor_id TEXT NOT NULL,
    title TEXT NOT NULL,
    price_bdt REAL NOT NULL,
    original_price_bdt REAL,
    discount_percent INTEGER NOT NULL DEFAULT 0,
    stock_status TEXT NOT NULL,
    deal_type TEXT NOT NULL,
    delivery_type TEXT NOT NULL,
    delivery_time_mins INTEGER NOT NULL,
    deep_link_url TEXT NOT NULL,
    coupon_code TEXT,
    requirements TEXT,
    is_exclusive INTEGER NOT NULL DEFAULT 0,
    is_verified INTEGER NOT NULL DEFAULT 1,
    last_checked_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS scam_stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    page_url TEXT NOT NULL,
    page_id TEXT,
    evidence_summary TEXT NOT NULL,
    reported_loss_bdt REAL NOT NULL,
    total_victim_reports INTEGER NOT NULL,
    scam_method TEXT NOT NULL,
    date_flagged TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    proof_screenshots TEXT NOT NULL,
    risk_tier TEXT NOT NULL
  );

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
    rate_limit_delay_ms INTEGER NOT NULL DEFAULT 3000,
    category_urls TEXT NOT NULL DEFAULT '[]',
    last_scraped_at TEXT,
    last_scrape_status TEXT NOT NULL DEFAULT 'IDLE',
    product_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS product_groups (
    id TEXT PRIMARY KEY,
    canonical_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    model TEXT NOT NULL,
    specs_json TEXT NOT NULL DEFAULT '{}',
    image_url TEXT NOT NULL,
    min_price REAL NOT NULL,
    max_price REAL NOT NULL,
    best_deal_shop_id TEXT,
    best_deal_price REAL NOT NULL,
    best_deal_url TEXT,
    offer_count INTEGER NOT NULL DEFAULT 0,
    in_stock_offer_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scraped_products (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL,
    product_group_id TEXT,
    raw_title TEXT NOT NULL,
    clean_title TEXT NOT NULL,
    product_url TEXT NOT NULL,
    image_url TEXT,
    current_price REAL NOT NULL,
    original_price REAL,
    availability TEXT NOT NULL DEFAULT 'In Stock',
    in_stock INTEGER NOT NULL DEFAULT 1,
    mpn TEXT,
    brand TEXT,
    category TEXT,
    match_confidence REAL,
    last_scraped_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (shop_id) REFERENCES tracked_shops(id) ON DELETE CASCADE,
    FOREIGN KEY (product_group_id) REFERENCES product_groups(id) ON DELETE SET NULL
  );
`);

console.log('4. Ingesting Tracked Shops...');
import { TRACKED_RETAILERS, INITIAL_PHYSICAL_PRODUCTS } from '../src/data/physicalGoodsData';
const insertShopStmt = db.prepare(`
  INSERT INTO tracked_shops (id, name, slug, domain, base_url, logo_url, adapter_type, is_tracked, scrape_interval_hours, rate_limit_delay_ms, category_urls, product_count)
  VALUES (@id, @name, @slug, @domain, @base_url, @logo_url, @adapter_type, @is_tracked, @scrape_interval_hours, @rate_limit_delay_ms, @category_urls, @product_count)
`);

for (const shop of TRACKED_RETAILERS) {
  insertShopStmt.run({
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
    category_urls: JSON.stringify(shop.categoryUrls),
    product_count: shop.productCount || 0,
  });
}

console.log(`5. Ingesting ${INITIAL_PHYSICAL_PRODUCTS.length} Physical Products & Offers...`);
const insertGroupStmt = db.prepare(`
  INSERT INTO product_groups (
    id, canonical_name, slug, brand, category, model, specs_json,
    image_url, min_price, max_price, best_deal_shop_id, best_deal_price,
    best_deal_url, offer_count, in_stock_offer_count, created_at, updated_at
  ) VALUES (
    @id, @canonical_name, @slug, @brand, @category, @model, @specs_json,
    @image_url, @min_price, @max_price, @best_deal_shop_id, @best_deal_price,
    @best_deal_url, @offer_count, @in_stock_offer_count, @created_at, @updated_at
  )
`);

const insertScrapedStmt = db.prepare(`
  INSERT INTO scraped_products (
    id, shop_id, product_group_id, raw_title, clean_title, product_url,
    image_url, current_price, original_price, availability, in_stock,
    brand, category, match_confidence
  ) VALUES (
    @id, @shop_id, @product_group_id, @raw_title, @clean_title, @product_url,
    @image_url, @current_price, @original_price, @availability, @in_stock,
    @brand, @category, @match_confidence
  )
`);

for (const pg of INITIAL_PHYSICAL_PRODUCTS) {
  insertGroupStmt.run({
    id: pg.id,
    canonical_name: pg.canonicalName,
    slug: pg.slug,
    brand: pg.brand,
    category: pg.category,
    model: pg.model,
    specs_json: JSON.stringify(pg.specs),
    image_url: pg.imageUrl,
    min_price: pg.minPrice,
    max_price: pg.maxPrice,
    best_deal_shop_id: pg.bestDealShopId || null,
    best_deal_price: pg.bestDealPrice,
    best_deal_url: pg.bestDealUrl || null,
    offer_count: pg.offerCount,
    in_stock_offer_count: pg.inStockOfferCount,
    created_at: pg.createdAt,
    updated_at: pg.updatedAt,
  });

  if (pg.offers && pg.offers.length > 0) {
    for (const off of pg.offers) {
      insertScrapedStmt.run({
        id: off.id,
        shop_id: off.shopId,
        product_group_id: pg.id,
        raw_title: pg.canonicalName,
        clean_title: pg.canonicalName,
        product_url: off.productUrl,
        image_url: pg.imageUrl,
        current_price: off.priceBDT,
        original_price: off.originalPriceBDT || null,
        availability: off.availability,
        in_stock: off.inStock ? 1 : 0,
        brand: pg.brand,
        category: pg.category,
        match_confidence: 1.0,
      });
    }
  }
}

console.log('7. Verifying Physical Goods DB Integrity...');
console.log('Integrity check:', db.pragma('integrity_check'));
const groupCount = db.prepare('SELECT COUNT(*) as count FROM product_groups').get() as any;
const scrapedCount = db.prepare('SELECT COUNT(*) as count FROM scraped_products').get() as any;
console.log(`Product Groups in DB: ${groupCount.count}`);
console.log(`Scraped Product Offers in DB: ${scrapedCount.count}`);
db.close();
console.log('Physical goods DB initialization completed successfully!');
