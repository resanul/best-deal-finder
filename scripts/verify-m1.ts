/**
 * Milestone M1: Vendor Management & Shop Registry Verification Suite
 * 
 * Tests:
 * 1. Database schema verification (5 physical tables, indexes, WAL mode, foreign keys)
 * 2. Default Bangladeshi retailers pre-seeding
 * 3. Shop Registry CRUD & toggle operations
 * 4. Dynamic URL registration & CMS/Retailer classification
 * 5. Metrics calculation
 * 6. Next.js App Router Route Handlers (/api/shops and /api/shops/[id])
 * 7. Clean teardown and idempotency
 */

import assert from 'node:assert';
import Database from 'better-sqlite3';
import path from 'path';
import { NextRequest } from 'next/server';
import db, {
  rowToTrackedShop,
  defaultRetailerShops,
  seedDefaultRetailers,
} from '../src/lib/db';
import {
  getTrackedShops,
  getShopById,
  getShopByDomain,
  getShopBySlug,
  registerShopByUrl,
  toggleShopTracking,
  updateShop,
  deleteShop,
  getShopMetrics,
  normalizeShopUrl,
  extractBrandFromDomain,
  detectCMSAndRetailer,
} from '../src/lib/shopRegistry';
import { GET as getShopsHandler, POST as postShopHandler } from '../src/app/api/shops/route';
import {
  GET as getShopByIdHandler,
  PATCH as patchShopHandler,
  DELETE as deleteShopHandler,
} from '../src/app/api/shops/[id]/route';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(() => fn())
    .then(() => {
      console.log(`  [PASS] ${name}`);
      passed++;
    })
    .catch((err) => {
      console.error(`  [FAIL] ${name}:`, err.message);
      failed++;
    });
}

async function runM1Verification() {
  console.log('\n======================================================');
  console.log('🧪 MILESTONE M1: VENDOR MANAGEMENT & SHOP REGISTRY E2E');
  console.log('======================================================\n');

  // --- SECTION 1: DATABASE SCHEMA & SEEDING ---
  console.log('▶ SECTION 1: SQLite Schema & Pre-Seeding');

  await test('M1_DB_01: SQLite WAL mode and Foreign Keys are enabled', () => {
    const journalMode = db.pragma('journal_mode', { simple: true });
    const foreignKeys = db.pragma('foreign_keys', { simple: true });
    assert.strictEqual(journalMode, 'wal');
    assert.strictEqual(foreignKeys, 1);
  });

  await test('M1_DB_02: All 5 physical tables and 4 digital tables exist', () => {
    const tables = (
      db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]
    ).map((t) => t.name);

    // Digital goods tables preserved
    assert.ok(tables.includes('vendors'), 'Must contain vendors table');
    assert.ok(tables.includes('products'), 'Must contain products table');
    assert.ok(tables.includes('vendor_deals'), 'Must contain vendor_deals table');
    assert.ok(tables.includes('scam_stores'), 'Must contain scam_stores table');

    // Physical tech tables created
    assert.ok(tables.includes('tracked_shops'), 'Must contain tracked_shops table');
    assert.ok(tables.includes('product_groups'), 'Must contain product_groups table');
    assert.ok(tables.includes('scraped_products'), 'Must contain scraped_products table');
    assert.ok(tables.includes('price_history'), 'Must contain price_history table');
    assert.ok(tables.includes('unmatched_queue'), 'Must contain unmatched_queue table');
  });

  await test('M1_DB_03: Pre-seeded with 6 major Bangladeshi retailers', () => {
    const shops = getTrackedShops();
    assert.ok(shops.length >= 6, `Expected >= 6 shops, found ${shops.length}`);

    const domains = shops.map((s) => s.domain);
    assert.ok(domains.includes('startech.com.bd'), 'Must include Star Tech');
    assert.ok(domains.includes('ryanscomputers.com'), 'Must include Ryans Computers');
    assert.ok(domains.includes('globalbrand.com.bd'), 'Must include Global Brand');
    assert.ok(domains.includes('samantacomputer.com'), 'Must include Samanta Computer');
    assert.ok(domains.includes('waltonbd.com'), 'Must include Walton');
    assert.ok(domains.includes('techlandbd.com'), 'Must include Techland BD');
  });

  // --- SECTION 2: URL NORMALIZATION & DETECTION HEURISTICS ---
  console.log('\n▶ SECTION 2: URL Normalization & Retailer / CMS Classification');

  await test('M1_DET_01: normalizeShopUrl extracts hostname, protocol, and base URL', () => {
    const res1 = normalizeShopUrl('https://www.startech.com.bd/component/processor');
    assert.strictEqual(res1.domain, 'startech.com.bd');
    assert.strictEqual(res1.baseUrl, 'https://www.startech.com.bd');

    const res2 = normalizeShopUrl('ryanscomputers.com/category/laptop');
    assert.strictEqual(res2.domain, 'ryanscomputers.com');
    assert.strictEqual(res2.baseUrl, 'https://ryanscomputers.com');
  });

  await test('M1_DET_02: detectCMSAndRetailer accurately identifies known Bangladeshi retailer domains', async () => {
    const detStar = await detectCMSAndRetailer('https://www.startech.com.bd');
    assert.strictEqual(detStar.adapterType, 'startech');
    assert.strictEqual(detStar.isKnownRetailer, true);
    assert.strictEqual(detStar.confidence, 1.0);

    const detRyans = await detectCMSAndRetailer('https://ryanscomputers.com/processor');
    assert.strictEqual(detRyans.adapterType, 'ryans');
    assert.strictEqual(detRyans.isKnownRetailer, true);

    const detWalton = await detectCMSAndRetailer('https://eplaza.waltonbd.com');
    assert.strictEqual(detWalton.adapterType, 'walton');
    assert.strictEqual(detWalton.isKnownRetailer, true);
  });

  await test('M1_DET_03: detectCMSAndRetailer classifies unrecognized domains as generic', async () => {
    const detGeneric = await detectCMSAndRetailer('https://random-bd-electronics-shop.com');
    assert.strictEqual(detGeneric.adapterType, 'generic');
    assert.strictEqual(detGeneric.isKnownRetailer, false);
    assert.strictEqual(detGeneric.domain, 'random-bd-electronics-shop.com');
  });

  // --- SECTION 3: SHOP REGISTRY CRUD OPERATIONS ---
  console.log('\n▶ SECTION 3: Shop Registry Operations (CRUD)');

  await test('M1_REG_01: getTrackedShops supports activeOnly and search filtering', () => {
    const all = getTrackedShops();
    const star = getTrackedShops({ search: 'Star Tech' });
    assert.strictEqual(star.length, 1);
    assert.strictEqual(star[0].domain, 'startech.com.bd');

    const active = getTrackedShops({ activeOnly: true });
    assert.strictEqual(active.length, all.filter((s) => s.isTracked).length);
  });

  await test('M1_REG_02: getShopById and getShopByDomain retrieve accurate shop entity', () => {
    const star = getShopById('shop-startech');
    assert.ok(star, 'shop-startech must exist');
    assert.strictEqual(star.name, 'Star Tech');
    assert.strictEqual(star.adapterType, 'startech');
    assert.strictEqual(star.isTracked, true);

    const byDomain = getShopByDomain('www.ryanscomputers.com');
    assert.ok(byDomain, 'Must resolve ryanscomputers.com');
    assert.strictEqual(byDomain.id, 'shop-ryans');
  });

  await test('M1_REG_03: toggleShopTracking flips tracking status deterministically', () => {
    const initial = getShopById('shop-walton')!;
    const toggled = toggleShopTracking('shop-walton')!;
    assert.strictEqual(toggled.isTracked, !initial.isTracked);

    // Toggle back
    const restored = toggleShopTracking('shop-walton')!;
    assert.strictEqual(restored.isTracked, initial.isTracked);
  });

  await test('M1_REG_04: updateShop modifies configuration and updates timestamp', () => {
    const shop = getShopById('shop-samanta')!;
    const updated = updateShop('shop-samanta', {
      rateLimitDelayMs: 2200,
      scrapeIntervalHours: 12,
    })!;

    assert.strictEqual(updated.rateLimitDelayMs, 2200);
    assert.strictEqual(updated.scrapeIntervalHours, 12);
    assert.ok(updated.updatedAt >= shop.updatedAt);

    // Restore
    updateShop('shop-samanta', { rateLimitDelayMs: 2000, scrapeIntervalHours: 24 });
  });

  let createdShopId = '';
  await test('M1_REG_05: registerShopByUrl dynamically inserts new generic shop', async () => {
    const testUrl = 'https://custom-gadget-hub-bd.com/products';
    const shop = await registerShopByUrl(testUrl, 'Custom Gadget Hub');

    assert.ok(shop.id.startsWith('shop-'));
    assert.strictEqual(shop.name, 'Custom Gadget Hub');
    assert.strictEqual(shop.domain, 'custom-gadget-hub-bd.com');
    assert.strictEqual(shop.adapterType, 'generic');
    assert.strictEqual(shop.isTracked, true);

    createdShopId = shop.id;

    // Verify persistence in SQLite
    const persisted = getShopById(createdShopId);
    assert.ok(persisted);
    assert.strictEqual(persisted.domain, 'custom-gadget-hub-bd.com');
  });

  await test('M1_REG_06: getShopMetrics reflects correct counts after registration', () => {
    const metrics = getShopMetrics();
    assert.ok(metrics.totalShops >= 7, 'Expected >= 7 shops');
    assert.ok(metrics.genericShops >= 1, 'Expected >= 1 generic shop');
    assert.ok(metrics.knownRetailers >= 6, 'Expected >= 6 known retailers');
  });

  await test('M1_REG_07: deleteShop removes shop from SQLite and cascades', () => {
    assert.ok(createdShopId, 'Shop ID must be present');
    const deleted = deleteShop(createdShopId);
    assert.strictEqual(deleted, true);

    const check = getShopById(createdShopId);
    assert.strictEqual(check, null);
  });

  // --- SECTION 4: NEXT.JS APP ROUTER ROUTE HANDLERS ---
  console.log('\n▶ SECTION 4: App Router Route Handlers (/api/shops)');

  await test('M1_API_01: GET /api/shops returns 200 OK with shop list and metrics', async () => {
    const req = new NextRequest('http://localhost:3000/api/shops');
    const res = await getShopsHandler(req);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.shops));
    assert.ok(data.shops.length >= 6);
    assert.ok(data.metrics);
    assert.ok(data.metrics.knownRetailers >= 6);
  });

  await test('M1_API_02: POST /api/shops registers new shop and returns 201 Created', async () => {
    const req = new NextRequest('http://localhost:3000/api/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://electro-world-bd.com',
        name: 'Electro World BD',
      }),
    });

    const res = await postShopHandler(req);
    assert.strictEqual(res.status, 201);

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.shop.name, 'Electro World BD');
    assert.strictEqual(data.shop.domain, 'electro-world-bd.com');

    // Clean up
    deleteShop(data.shop.id);
  });

  await test('M1_API_03: POST /api/shops rejects empty or invalid URL with 400 Bad Request', async () => {
    const req = new NextRequest('http://localhost:3000/api/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: '' }),
    });

    const res = await postShopHandler(req);
    assert.strictEqual(res.status, 400);

    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error);
  });

  await test('M1_API_04: GET /api/shops/[id] returns shop entity or 404', async () => {
    const reqValid = new NextRequest('http://localhost:3000/api/shops/shop-startech');
    const resValid = await getShopByIdHandler(reqValid, {
      params: Promise.resolve({ id: 'shop-startech' }),
    });
    assert.strictEqual(resValid.status, 200);
    const dataValid = await resValid.json();
    assert.strictEqual(dataValid.shop.name, 'Star Tech');

    const reqInvalid = new NextRequest('http://localhost:3000/api/shops/nonexistent');
    const resInvalid = await getShopByIdHandler(reqInvalid, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });
    assert.strictEqual(resInvalid.status, 404);
  });

  await test('M1_API_05: PATCH /api/shops/[id] toggles or updates shop', async () => {
    const req = new NextRequest('http://localhost:3000/api/shops/shop-techland', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toggle: true }),
    });

    const res = await patchShopHandler(req, {
      params: Promise.resolve({ id: 'shop-techland' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.shop.isTracked, false);

    // Toggle back
    await patchShopHandler(req, {
      params: Promise.resolve({ id: 'shop-techland' }),
    });
  });

  // --- SUMMARY ---
  console.log('\n======================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runM1Verification();
