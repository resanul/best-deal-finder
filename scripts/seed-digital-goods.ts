/**
 * Bangladeshi Digital Goods Price Comparison Platform
 * Database Seeding Script (SQLite via better-sqlite3)
 * 
 * Location: scripts/seed-digital-goods.ts
 * Execution: npx tsx scripts/seed-digital-goods.ts
 * 
 * CORE RESPONSIBILITIES:
 * 1. Connects to SQLite database (ecom.db) via better-sqlite3.
 * 2. Creates relational tables (vendors, products, vendor_deals, scam_stores) and indexes.
 * 3. Cleans up legacy grocery tables if detected.
 * 4. Dynamically computes minPrice, maxPrice, offerCount, and bestVendorId for each product.
 * 5. Populates all 17 verified vendors, 15 cataloged products, 52 deals, and 7 scam stores.
 * 6. Executes within a atomic transaction with foreign keys enabled.
 * 7. Outputs comprehensive CLI summary metrics.
 */

import Database from 'better-sqlite3';
import path from 'path';
import {
  initialVendors,
  initialProducts,
  initialVendorDeals,
  initialScamStores,
} from '../src/data/digitalGoodsData';
import {
  Vendor,
  Product,
  VendorDeal,
  ScamStore,
} from '../src/types/digitalGoods';

const DB_PATH = path.join(process.cwd(), 'ecom.db');

export function runSeed(databasePath: string = DB_PATH) {
  console.log('\n======================================================');
  console.log('🚀 BANGLADESHI DIGITAL GOODS PLATFORM - DATABASE SEED');
  console.log('======================================================');
  console.log(`📂 Database Path: ${databasePath}`);

  const db = new Database(databasePath);

  // Performance & Integrity Pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // -----------------------------------------------------------------
  // 1. LEGACY CLEANUP & SCHEMA INITIALIZATION (DDL)
  // -----------------------------------------------------------------
  console.log('🔨 Initializing SQLite schema...');

  // Check if legacy grocery schema exists in 'products' table
  try {
    const tableInfo = db.prepare("PRAGMA table_info(products)").all() as { name: string }[];
    const hasLegacyColumns = tableInfo.some(col => col.name === 'brand' || col.name === 'weight');
    if (hasLegacyColumns) {
      console.log('🧹 Detected legacy grocery schema. Dropping legacy tables...');
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
    // Fresh database, proceed
  }

  // Create digital goods tables
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
  `);

  console.log('✅ SQLite tables & indexes verified.');

  // -----------------------------------------------------------------
  // 2. ATOMIC TRANSACTION: CLEAR & POPULATE
  // -----------------------------------------------------------------
  console.log('📦 Ingesting canonical dataset...');

  const insertVendor = db.prepare(`
    INSERT INTO vendors (
      id, name, slug, domain, website_url, logo_url,
      is_verified, trust_score, scam_report_count, payment_methods,
      review_score, total_reviews, delivery_speed, support_channel,
      has_automated_gateway, has_dbid, trade_license_no, established_year,
      description
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?
    )
  `);

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, name, slug, category, subcategory, description, image_url,
      tags, is_trending, is_featured, min_price, max_price, offer_count,
      best_vendor_id, features
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `);

  const insertDeal = db.prepare(`
    INSERT INTO vendor_deals (
      id, product_id, vendor_id, plan_name, duration, price_bdt,
      original_price_bdt, discount_percent, in_stock, stock_status,
      direct_checkout_url, deal_type, delivery_type, warranty_policy,
      verified_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?
    )
  `);

  const insertScam = db.prepare(`
    INSERT INTO scam_stores (
      id, domain_or_page_name, platform, url_or_handle, reason,
      flagged_date, evidence_summary, risk_tier, reported_phone_numbers
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  // Execute in a single atomic transaction
  const seedTransaction = db.transaction(() => {
    // Clear existing data in reverse foreign-key order
    db.prepare('DELETE FROM vendor_deals').run();
    db.prepare('DELETE FROM products').run();
    db.prepare('DELETE FROM vendors').run();
    db.prepare('DELETE FROM scam_stores').run();

    // 1. Insert Vendors
    for (const v of initialVendors) {
      insertVendor.run(
        v.id,
        v.name,
        v.slug,
        v.domain,
        v.websiteUrl,
        v.logoUrl,
        v.isVerified ? 1 : 0,
        v.trustScore,
        v.scamReportCount,
        JSON.stringify(v.paymentMethods),
        v.reviewScore,
        v.totalReviews,
        v.deliverySpeed,
        v.supportChannel,
        v.hasAutomatedGateway ? 1 : 0,
        v.hasDBID ? 1 : 0,
        v.tradeLicenseNo || null,
        v.establishedYear,
        v.description
      );
    }

    // 2. Insert Products (with DYNAMICALLY DERIVED price spreads)
    for (const p of initialProducts) {
      // Dynamically compute minPrice, maxPrice, offerCount, and bestVendorId from active deals
      const matchingDeals = initialVendorDeals.filter(d => d.productId === p.id && d.inStock);
      const sortedDeals = [...matchingDeals].sort((a, b) => a.priceBDT - b.priceBDT);

      const dynamicMinPrice = sortedDeals.length > 0 ? sortedDeals[0].priceBDT : 0;
      const dynamicMaxPrice = sortedDeals.length > 0 ? sortedDeals[sortedDeals.length - 1].priceBDT : 0;
      const dynamicOfferCount = sortedDeals.length;
      const dynamicBestVendorId = sortedDeals.length > 0 ? sortedDeals[0].vendorId : null;

      insertProduct.run(
        p.id,
        p.name,
        p.slug,
        p.category,
        p.subcategory || null,
        p.description,
        p.imageUrl,
        JSON.stringify(p.tags),
        p.isTrending ? 1 : 0,
        p.isFeatured ? 1 : 0,
        dynamicMinPrice,
        dynamicMaxPrice,
        dynamicOfferCount,
        dynamicBestVendorId,
        JSON.stringify(p.features)
      );
    }

    // 3. Insert Deals
    for (const d of initialVendorDeals) {
      insertDeal.run(
        d.id,
        d.productId,
        d.vendorId,
        d.planName,
        d.duration,
        d.priceBDT,
        d.originalPriceBDT ?? null,
        d.discountPercent ?? null,
        d.inStock ? 1 : 0,
        d.stockStatus,
        d.directCheckoutUrl,
        d.dealType,
        d.deliveryType,
        d.warrantyPolicy,
        d.verifiedAt || new Date().toISOString()
      );
    }

    // 4. Insert Scam Blacklist
    for (const s of initialScamStores) {
      insertScam.run(
        s.id,
        s.domainOrPageName,
        s.platform,
        s.urlOrHandle,
        s.reason,
        s.flaggedDate,
        s.evidenceSummary,
        s.riskTier,
        s.reportedPhoneNumbers ? JSON.stringify(s.reportedPhoneNumbers) : null
      );
    }
  });

  seedTransaction();

  // -----------------------------------------------------------------
  // 3. SEED VERIFICATION & STATISTICS
  // -----------------------------------------------------------------
  const vendorCount = (db.prepare('SELECT count(*) as count FROM vendors').get() as { count: number }).count;
  const productCount = (db.prepare('SELECT count(*) as count FROM products').get() as { count: number }).count;
  const dealCount = (db.prepare('SELECT count(*) as count FROM vendor_deals').get() as { count: number }).count;
  const scamCount = (db.prepare('SELECT count(*) as count FROM scam_stores').get() as { count: number }).count;

  console.log('\n📊 SEEDING SUMMARY:');
  console.log(`  • Verified Vendors  : ${vendorCount} (Expected: ${initialVendors.length})`);
  console.log(`  • Catalog Products  : ${productCount} (Expected: ${initialProducts.length})`);
  console.log(`  • Multi-Vendor Deals: ${dealCount} (Expected: ${initialVendorDeals.length})`);
  console.log(`  • Scam Blacklist    : ${scamCount} (Expected: ${initialScamStores.length})`);

  // Sample Price Range Verification
  const sampleProducts = db.prepare(`
    SELECT name, min_price, max_price, offer_count, best_vendor_id 
    FROM products 
    ORDER BY offer_count DESC 
    LIMIT 3
  `).all() as { name: string; min_price: number; max_price: number; offer_count: number; best_vendor_id: string }[];

  console.log('\n🔎 SAMPLE DYNAMIC PRICE RANGES:');
  for (const sp of sampleProducts) {
    console.log(`  - ${sp.name}: ৳${sp.min_price} – ৳${sp.max_price} (${sp.offer_count} offers, best: ${sp.best_vendor_id})`);
  }

  db.close();
  console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
}

// Run directly if invoked from CLI
if (require.main === module || process.argv[1]?.includes('seed-digital-goods')) {
  try {
    runSeed();
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}
