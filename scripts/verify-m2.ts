/**
 * Milestone M2 Verification Suite: Generic & Tailored Stealth Daily Scraping Pipeline
 * 
 * Location: scripts/verify-m2.ts
 * Execution: npx tsx scripts/verify-m2.ts
 * 
 * Verifies:
 * 1. BDT Currency Parsing & Bangladeshi Quirks (takaFormatter.ts)
 * 2. Stealth Throttling, Header Emulation, Domain Concurrency, Backoff (stealth.ts)
 * 3. 7 Retailer Adapters parsing all 11 mock fixtures in scripts/fixtures/
 * 4. Scraping Engine & Coordinator Database Persistence (index.ts)
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import db from '../src/lib/db';
import {
  parseBdtPrice,
  parseTakaPrice,
  normalizeStockStatus,
  sanitizeTitle,
  hashString,
  generateScrapedProductId,
} from '../src/scraper/takaFormatter';
import {
  generateStealthHeaders,
  calculateJitterDelay,
  calculateBackoffDelay,
  detectCloudflareChallenge,
  DomainConcurrencyLimiter,
} from '../src/scraper/stealth';
import { StarTechAdapter } from '../src/scraper/adapters/startech';
import { RyansAdapter } from '../src/scraper/adapters/ryans';
import { GlobalBrandAdapter } from '../src/scraper/adapters/globalbrand';
import { SamantaAdapter } from '../src/scraper/adapters/samanta';
import { WaltonAdapter } from '../src/scraper/adapters/walton';
import { TechlandAdapter } from '../src/scraper/adapters/techland';
import {
  GenericAdapter,
  parseGenericJsonLd,
  parseGenericOpenGraph,
  parseGenericMicrodata,
  parseGenericCssCascade,
  parseGenericFallbackHierarchy,
} from '../src/scraper/adapters/generic';
import {
  getAdapter,
  scrapeShop,
  scrapeAllActiveShops,
  persistScrapedProducts,
} from '../src/scraper/index';
import { getShopBySlug, getTrackedShops } from '../src/lib/shopRegistry';

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          passed++;
          console.log(`  ${colors.green}✓ PASS:${colors.reset} ${name}`);
        })
        .catch((err) => {
          failed++;
          console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${name}`);
          console.error(err);
        });
    }
    passed++;
    console.log(`  ${colors.green}✓ PASS:${colors.reset} ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${name}`);
    console.error(err);
  }
}

const fixturesDir = path.join(process.cwd(), 'scripts', 'fixtures');
function readFixture(name: string): string {
  return fs.readFileSync(path.join(fixturesDir, name), 'utf-8');
}

async function runAllTests() {
  console.log(`\n${colors.bold}${colors.cyan}==============================================================================`);
  console.log(`  MILESTONE M2: GENERIC & TAILORED STEALTH SCRAPING PIPELINE VERIFICATION`);
  console.log(`==============================================================================${colors.reset}\n`);

  // --------------------------------------------------------------------------
  // SECTION 1: BDT CURRENCY PARSING & QUIRKS (takaFormatter.ts)
  // --------------------------------------------------------------------------
  console.log(`${colors.bold}▶ 1. BDT CURRENCY PARSER & STOCK STATUS NORMALIZATION${colors.reset}`);

  test('Taka Formatter: Concatenated prices split on ৳ and extract offer price', () => {
    assert.equal(parseBdtPrice('66,500৳68,500৳'), 66500);
    assert.equal(parseBdtPrice('13,400৳15,500৳'), 13400);
    assert.equal(parseTakaPrice('66,500৳68,500৳'), 66500);
  });

  test('Taka Formatter: Unicode ৳ (\u09F3) prefix and suffix formats', () => {
    assert.equal(parseBdtPrice('৳ 18,500'), 18500);
    assert.equal(parseBdtPrice('৳18,500'), 18500);
    assert.equal(parseBdtPrice('18,500 ৳'), 18500);
    assert.equal(parseBdtPrice('18,500৳'), 18500);
  });

  test('Taka Formatter: Tk. and Tk variations with commas and spaces', () => {
    assert.equal(parseBdtPrice('Tk. 18,500'), 18500);
    assert.equal(parseBdtPrice('Tk.26,550'), 26550);
    assert.equal(parseBdtPrice('Tk 18,500'), 18500);
    assert.equal(parseBdtPrice('18,500 Tk'), 18500);
    assert.equal(parseBdtPrice('BDT 18,500'), 18500);
    assert.equal(parseBdtPrice('18,500 BDT'), 18500);
  });

  test('Taka Formatter: Decimal prices and large amounts', () => {
    assert.equal(parseBdtPrice('৳2,200.00'), 2200);
    assert.equal(parseBdtPrice('৳ 18,500.50'), 18501);
    assert.equal(parseBdtPrice('1,45,000৳'), 145000);
  });

  test('Taka Formatter: Zero prices return 0 (and parseTakaPrice returns null)', () => {
    assert.equal(parseBdtPrice('৳0.00'), 0);
    assert.equal(parseBdtPrice('0৳'), 0);
    assert.equal(parseBdtPrice('0'), 0);
    assert.equal(parseTakaPrice('৳0.00'), null);
    assert.equal(parseTakaPrice('0৳'), null);
  });

  test('Taka Formatter: Empty strings and &nbsp; return 0 (and null)', () => {
    assert.equal(parseBdtPrice(''), 0);
    assert.equal(parseBdtPrice('&nbsp;'), 0);
    assert.equal(parseBdtPrice('   '), 0);
    assert.equal(parseBdtPrice(null), 0);
    assert.equal(parseBdtPrice(undefined), 0);
    assert.equal(parseTakaPrice('&nbsp;'), null);
  });

  test('Taka Formatter: Adversarial challenge edge cases (multi-symbol, prefix words, double-escaped entities)', () => {
    // 1. Multi-symbol currency: 'BDT Tk. 45,000/-'
    assert.equal(parseBdtPrice('BDT Tk. 45,000/-'), 45000);
    // 2. Prefix word currency: 'Price: 12000 BDT only'
    assert.equal(parseBdtPrice('Price: 12000 BDT only'), 12000);
    // 3. Double-escaped entity order: '&amp;nbsp;12000'
    assert.equal(parseBdtPrice('&amp;nbsp;12000'), 12000);
  });

  test('Stock Status Normalizer: maps standard statuses to domain enum values', () => {
    assert.deepEqual(normalizeStockStatus('In Stock', 1000), { availability: 'In Stock', inStock: true });
    assert.deepEqual(normalizeStockStatus('Limited Stock', 1000), { availability: 'In Stock', inStock: true });
    assert.deepEqual(normalizeStockStatus('24 in stock', 1000), { availability: 'In Stock', inStock: true });
    assert.deepEqual(normalizeStockStatus('In stock, ready to ship', 1000), { availability: 'In Stock', inStock: true });
    assert.deepEqual(normalizeStockStatus('Out of Stock', 1000), { availability: 'Out of Stock', inStock: false });
    assert.deepEqual(normalizeStockStatus('Stock Out', 1000), { availability: 'Out of Stock', inStock: false });
    assert.deepEqual(normalizeStockStatus('Pre-Order', 1000), { availability: 'Pre-Order', inStock: false });
    assert.deepEqual(normalizeStockStatus('Pre Order', 1000), { availability: 'Pre-Order', inStock: false });
    assert.deepEqual(normalizeStockStatus('Up Coming', 0), { availability: 'Upcoming', inStock: false });
    assert.deepEqual(normalizeStockStatus('Upcoming', 0), { availability: 'Upcoming', inStock: false });
  });

  test('Stock Status Normalizer: zero or negative price forces inStock: false', () => {
    const resZero = normalizeStockStatus('In Stock', 0);
    assert.equal(resZero.inStock, false);
    assert.equal(resZero.availability, 'Out of Stock');

    const resUnpriced = normalizeStockStatus(undefined, 0);
    assert.equal(resUnpriced.inStock, false);

    // 4. Invariant constraint: NaN or non-finite price forces Out of Stock and inStock: false
    const resNaN = normalizeStockStatus('In Stock', NaN);
    assert.deepEqual(resNaN, { availability: 'Out of Stock', inStock: false });

    const resInfinity = normalizeStockStatus('In Stock', Infinity);
    assert.deepEqual(resInfinity, { availability: 'Out of Stock', inStock: false });
  });

  test('Utility Helpers: sanitizeTitle, hashString, generateScrapedProductId', () => {
    assert.equal(sanitizeTitle('AMD &amp; Intel &quot;CPUs&quot;'), 'AMD & Intel "CPUs"');
    assert.equal(typeof hashString('https://startech.com.bd/item-1'), 'number');
    const id = generateScrapedProductId('startech', 'https://startech.com.bd/item-1');
    assert.ok(id.startsWith('sp-startech-'));
  });

  // --------------------------------------------------------------------------
  // SECTION 2: STEALTH THROTTLING & HEADER EMULATION (stealth.ts)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}▶ 2. STEALTH ENGINE & HEADER EMULATION${colors.reset}`);

  test('Stealth Headers: generates modern desktop Google Chrome with Client Hints', () => {
    const headers = generateStealthHeaders('startech.com.bd');
    assert.ok(headers['User-Agent'].includes('Chrome'));
    assert.equal(headers['Sec-Ch-Ua-Platform'], '"Windows"');
    assert.equal(headers['Sec-Ch-Ua-Mobile'], '?0');
    assert.ok(headers['Sec-Ch-Ua'].includes('Google Chrome'));
    assert.ok(headers['Accept-Language'].includes('en-US'));
    assert.ok(headers['Accept-Language'].includes('bn'));
    assert.equal(headers['Sec-Fetch-Dest'], 'document');
    assert.equal(headers['Sec-Fetch-Mode'], 'navigate');
  });

  test('Stealth Jitter: delay calculation stays within bounds', () => {
    for (let i = 0; i < 50; i++) {
      const d = calculateJitterDelay(1500, 4500);
      assert.ok(d >= 1500 && d <= 4500, `Delay ${d} out of range [1500, 4500]`);
    }
    // Equal bounds
    assert.equal(calculateJitterDelay(2000, 2000), 2000);
    // Zero bounds
    assert.equal(calculateJitterDelay(0, 0), 0);
  });

  test('Domain Concurrency Limiter: serializes requests to identical host', async () => {
    const limiter = new DomainConcurrencyLimiter();
    const sequence: number[] = [];

    const task1 = async () => {
      const release = await limiter.acquire('startech.com.bd');
      await new Promise(r => setTimeout(r, 20));
      sequence.push(1);
      release();
    };

    const task2 = async () => {
      const release = await limiter.acquire('startech.com.bd');
      sequence.push(2);
      release();
    };

    await Promise.all([task1(), task2()]);
    assert.deepEqual(sequence, [1, 2], 'Task 2 must execute only after Task 1 finishes');
  });

  test('Exponential Backoff: doubles base delay per retry attempt', () => {
    assert.equal(calculateBackoffDelay(1000, 0, 0), 1000);
    assert.equal(calculateBackoffDelay(1000, 1, 0), 2000);
    assert.equal(calculateBackoffDelay(1000, 2, 0), 4000);
    assert.equal(calculateBackoffDelay(1000, 3, 0), 8000);
  });

  test('Cloudflare Challenge Detector: detects header and turnstile script', () => {
    assert.equal(detectCloudflareChallenge({ 'cf-mitigated': 'challenge' }, '<html></html>'), true);
    assert.equal(detectCloudflareChallenge({}, '<div id="cf-turnstile"></div>'), true);
    assert.equal(detectCloudflareChallenge({}, '<script src="https://challenges.cloudflare.com/turnstile"></script>'), true);
    assert.equal(detectCloudflareChallenge({}, '<div>Normal product card</div>'), false);
  });

  // --------------------------------------------------------------------------
  // SECTION 3: RETAILER ADAPTERS WITH 11 FIXTURES
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}▶ 3. RETAILER ADAPTERS & MOCK FIXTURE PARSING (11 FIXTURES)${colors.reset}`);

  test('Adapter 1: Star Tech Listing fixture (startech_search.html)', () => {
    const html = readFixture('startech_search.html');
    const adapter = new StarTechAdapter();
    assert.ok(adapter.canHandle('https://www.startech.com.bd/search?search=ryzen'));

    const items = adapter.parseHtml(html, 'https://www.startech.com.bd/search');
    assert.equal(items.length, 3);

    // Product 1: AMD Ryzen 5 5600
    assert.equal(items[0].rawTitle, 'AMD Ryzen 5 5600 Processor');
    assert.equal(items[0].currentPrice, 13400);
    assert.equal(items[0].originalPrice, 15500);
    assert.equal(items[0].availability, 'In Stock');
    assert.equal(items[0].inStock, true);
    assert.ok(items[0].productUrl.includes('amd-ryzen-5-5600-processor'));

    // Product 2: ZOTAC RTX 4060
    assert.equal(items[1].currentPrice, 38500);
    assert.equal(items[1].originalPrice, 42000);

    // Product 3: Corsair RAM
    assert.equal(items[2].currentPrice, 2650);
  });

  test('Adapter 1: Star Tech Detail fixture (startech_detail.html)', () => {
    const html = readFixture('startech_detail.html');
    const adapter = new StarTechAdapter();
    const items = adapter.parseHtml(html, 'https://www.startech.com.bd/amd-ryzen-5-5600-processor');

    assert.equal(items.length, 1);
    const item = items[0];
    assert.equal(item.rawTitle, 'AMD Ryzen 5 5600 Processor');
    assert.equal(item.currentPrice, 13400);
    assert.equal(item.originalPrice, 15500);
    assert.equal(item.availability, 'In Stock');
    assert.equal(item.inStock, true);
    assert.equal(item.brand, 'AMD');
    assert.equal(item.mpn, '22543');
    assert.equal(item.specs?.Cores, '6');
    assert.equal(item.specs?.Socket, 'AM4');
  });

  test('Adapter 2: Ryans Computers fixture (ryans_product.html)', () => {
    const html = readFixture('ryans_product.html');
    const adapter = new RyansAdapter();
    assert.ok(adapter.canHandle('https://www.ryanscomputers.com/category/desktop'));
    assert.ok(adapter.canHandle('https://ryans.com/category/desktop'));

    const items = adapter.parseHtml(html, 'https://www.ryanscomputers.com');
    assert.equal(items.length, 2);

    // Product 1: Ryzen 5 5600 with part number
    const p1 = items[0];
    assert.ok(p1.rawTitle.includes('AMD Ryzen 5 5600'));
    assert.equal(p1.currentPrice, 13800);
    assert.equal(p1.originalPrice, 15000);
    assert.equal(p1.availability, 'In Stock');
    assert.equal(p1.inStock, true);
    assert.equal(p1.mpn, '100-100000927BOX');

    // Product 2: Zotac GPU with title hashtag MPN
    const p2 = items[1];
    assert.ok(p2.rawTitle.includes('RTX 4060'));
    assert.equal(p2.currentPrice, 39000);
    assert.equal(p2.originalPrice, 43500);
    assert.equal(p2.mpn, 'ZT-D40600E-10M');
  });

  test('Adapter 3: Global Brand OpenCart fixture (globalbrand_product.html)', () => {
    const html = readFixture('globalbrand_product.html');
    const adapter = new GlobalBrandAdapter();
    assert.ok(adapter.canHandle('https://www.globalbrand.com.bd/graphics-card'));

    const items = adapter.parseHtml(html, 'https://www.globalbrand.com.bd');
    assert.equal(items.length, 1);
    const p = items[0];
    assert.ok(p.rawTitle.includes('ZOTAC GAMING GeForce RTX 4060'));
    assert.equal(p.currentPrice, 39200);
    assert.equal(p.originalPrice, 42000);
    assert.equal(p.availability, 'In Stock');
    assert.equal(p.inStock, true);
  });

  test('Adapter 4: Samanta Computer Vike SSR & DOM fixture (samanta_product.html)', () => {
    const html = readFixture('samanta_product.html');
    const adapter = new SamantaAdapter();
    assert.ok(adapter.canHandle('https://samantacomputer.com/processor'));

    const items = adapter.parseHtml(html, 'https://samantacomputer.com');
    assert.equal(items.length, 1);
    const p = items[0];
    assert.equal(p.rawTitle, 'AMD Ryzen 5 5600 Desktop Processor');
    assert.equal(p.currentPrice, 13600);
    assert.equal(p.originalPrice, 15200);
    assert.equal(p.availability, 'In Stock');
    assert.equal(p.inStock, true);
    assert.equal(p.brand, 'AMD');
  });

  test('Adapter 5: Walton Electronics fixture (walton_product.html)', () => {
    const html = readFixture('walton_product.html');
    const adapter = new WaltonAdapter();
    assert.ok(adapter.canHandle('https://waltonbd.com/computer/laptop'));
    assert.ok(adapter.canHandle('https://eplaza.waltonbd.com/item/123'));

    const items = adapter.parseHtml(html, 'https://waltonbd.com');
    assert.equal(items.length, 2);

    // Laptop
    assert.ok(items[0].rawTitle.includes('Walton Tamarind EX711G'));
    assert.equal(items[0].currentPrice, 64550);
    assert.equal(items[0].originalPrice, 69750);
    assert.equal(items[0].availability, 'In Stock');
    assert.equal(items[0].inStock, true);
    assert.equal(items[0].brand, 'Walton');

    // Smartphone
    assert.ok(items[1].rawTitle.includes('Primo GH11'));
    assert.equal(items[1].currentPrice, 26550);
  });

  test('Adapter 6: Techland BD OpenCart fixture (techland_product.html)', () => {
    const html = readFixture('techland_product.html');
    const adapter = new TechlandAdapter();
    assert.ok(adapter.canHandle('https://www.techlandbd.com/processor'));
    assert.ok(adapter.canHandle('https://techmenia.com.bd/processor'));

    const items = adapter.parseHtml(html, 'https://www.techlandbd.com');
    assert.equal(items.length, 2);

    assert.ok(items[0].rawTitle.includes('AMD Ryzen 5 5600'));
    assert.equal(items[0].currentPrice, 13500);
    assert.equal(items[0].originalPrice, 15200);
    assert.equal(items[0].availability, 'In Stock');
    assert.equal(items[0].brand, 'AMD');

    assert.ok(items[1].rawTitle.includes('ZOTAC GAMING GeForce RTX 4060'));
    assert.equal(items[1].currentPrice, 38900);
    assert.equal(items[1].originalPrice, 42500);
  });

  test('Adapter 7: Generic JSON-LD Tier 1 (generic_jsonld.html)', () => {
    const html = readFixture('generic_jsonld.html');
    const item = parseGenericJsonLd(html, 'https://example.com/corsair-vengeance-8gb-ram');
    assert.ok(item !== null);
    assert.equal(item.rawTitle, 'Corsair Vengeance LPX 8GB 3200MHz DDR4 Desktop RAM Black');
    assert.equal(item.currentPrice, 2700);
    assert.equal(item.availability, 'In Stock');
    assert.equal(item.inStock, true);
    assert.equal(item.mpn, 'CMK8GX4M1E3200C16');
    assert.equal(item.brand, 'Corsair');

    // Hierarchy test confirms tier 1 selection
    const hierarchy = parseGenericFallbackHierarchy(html);
    assert.equal(hierarchy.tier, 'JSON-LD');
  });

  test('Adapter 7: Generic OpenGraph Tier 2 extraction', () => {
    const html = readFixture('generic_jsonld.html');
    const ogItem = parseGenericOpenGraph(html, 'https://example.com/og-item');
    assert.ok(ogItem !== null);
    assert.equal(ogItem.rawTitle, 'Corsair Vengeance LPX 8GB 3200MHz DDR4 Desktop RAM Black');
    assert.equal(ogItem.currentPrice, 2700);
    assert.equal(ogItem.inStock, true);
  });

  test('Adapter 7: Generic Microdata Tier 3 extraction', () => {
    const html = readFixture('generic_woocommerce.html');
    const microdataItem = parseGenericMicrodata(html, 'https://example.com/microdata-item');
    assert.ok(microdataItem !== null);
    assert.ok(microdataItem.rawTitle.includes('AMD Ryzen 5 5600'));
    assert.equal(microdataItem.currentPrice, 13750);
  });

  test('Adapter 7: Generic CSS Cascade Tier 4 extraction', () => {
    const html = readFixture('generic_shopify.html');
    const cssItem = parseGenericCssCascade(html, 'https://example.com/css-item');
    assert.ok(cssItem !== null);
    assert.equal(cssItem.currentPrice, 42000);
  });

  test('Adapter 7: Generic Shopify CSS Cascade (generic_shopify.html)', () => {
    const html = readFixture('generic_shopify.html');
    const adapter = new GenericAdapter();
    const items = adapter.parseHtml(html, 'https://dhakapcexpress.com/rtx-4060');

    assert.equal(items.length, 1);
    assert.ok(items[0].rawTitle.includes('ZOTAC GAMING GeForce RTX 4060'));
    assert.equal(items[0].currentPrice, 42000);
    assert.equal(items[0].inStock, true);
  });

  test('Adapter 7: Generic WooCommerce HTML5 & Microdata (generic_woocommerce.html)', () => {
    const html = readFixture('generic_woocommerce.html');
    const adapter = new GenericAdapter();
    const items = adapter.parseHtml(html, 'https://bdtechstore.com/amd-ryzen-5-5600');

    assert.equal(items.length, 1);
    assert.ok(items[0].rawTitle.includes('AMD Ryzen 5 5600'));
    assert.equal(items[0].currentPrice, 13750);
    assert.equal(items[0].inStock, true);
  });

  test('Edge Cases & Adversarial Fixture (edge_cases.html)', () => {
    const html = readFixture('edge_cases.html');

    // 1. Concatenated price check
    const concatMatch = html.match(/class="raw-price">([^<]+)<\/span>/);
    assert.ok(concatMatch);
    assert.equal(parseBdtPrice(concatMatch[1]), 66500);

    // 2. Zero price check
    const zeroPrice1 = parseBdtPrice('৳0.00');
    assert.equal(zeroPrice1, 0);
    const stockZero = normalizeStockStatus('In Stock', zeroPrice1);
    assert.equal(stockZero.inStock, false);

    // 3. Empty price check
    const emptyPrice = parseBdtPrice('&nbsp;');
    assert.equal(emptyPrice, 0);

    // 4. Malformed JSON-LD cascades cleanly without unhandled syntax error
    const malformed = parseGenericJsonLd(html);
    assert.equal(malformed, null, 'Malformed JSON-LD must return null without throwing');
  });

  // --------------------------------------------------------------------------
  // SECTION 4: SCRAPING ENGINE COORDINATOR & DB INTEGRATION (index.ts)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}▶ 4. SCRAPING ENGINE COORDINATOR & DB PERSISTENCE${colors.reset}`);

  test('Registry Integration: getTrackedShops returns active shops', () => {
    const shops = getTrackedShops({ activeOnly: true });
    assert.ok(shops.length > 0, 'Tracked shops registry must have active shops');
    for (const s of shops) {
      assert.equal(s.isTracked, true);
    }
  });

  test('Direct Persistence: persistScrapedProducts saves item batch', () => {
    const shop = getShopBySlug('walton');
    assert.ok(shop !== null);
    const testItem = {
      rawTitle: 'Test Direct Walton Monitor',
      cleanTitle: 'Test Direct Walton Monitor',
      productUrl: 'https://waltonbd.com/test-monitor-direct',
      currentPrice: 18500,
      availability: 'In Stock' as const,
      inStock: true,
    };
    const saved = persistScrapedProducts(shop, [testItem]);
    assert.equal(saved.length, 1);
    assert.equal(saved[0].currentPrice, 18500);
  });

  test('Adapter Factory: maps RetailerAdapterType to correct adapter class', () => {
    assert.equal(getAdapter('startech').name, 'Star Tech');
    assert.equal(getAdapter('ryans').name, 'Ryans Computers');
    assert.equal(getAdapter('globalbrand').name, 'Global Brand');
    assert.equal(getAdapter('samanta').name, 'Samanta Computer');
    assert.equal(getAdapter('walton').name, 'Walton');
    assert.equal(getAdapter('techland').name, 'Techland BD');
    assert.equal(getAdapter('generic').name, 'Generic E-Commerce');
  });

  await test('scrapeShop with mockHtml persists scraped_products and price_history', async () => {
    const shop = getShopBySlug('startech');
    assert.ok(shop !== null, 'Star Tech must exist in tracked_shops');

    const mockHtml = readFixture('startech_search.html');
    const result = await scrapeShop(shop.id, {
      mockHtml,
      limit: 2,
    });

    assert.equal(result.status, 'SUCCESS');
    assert.equal(result.items.length, 2);
    assert.equal(result.errors.length, 0);

    // Verify database persistence in scraped_products table
    const dbProduct = db
      .prepare('SELECT * FROM scraped_products WHERE product_url = ?')
      .get(result.items[0].productUrl) as {
      raw_title: string;
      current_price: number;
      availability: string;
      in_stock: number;
    } | undefined;

    assert.ok(dbProduct !== undefined, 'Scraped product must be saved in database');
    assert.equal(dbProduct.current_price, 13400);
    assert.equal(dbProduct.in_stock, 1);

    // Verify price history entry
    const historyCount = db
      .prepare('SELECT COUNT(*) as count FROM price_history WHERE scraped_product_id = ?')
      .get(result.items[0].id) as { count: number };

    assert.ok(historyCount.count >= 1, 'Price history record must be created');

    // Verify shop status updated in tracked_shops
    const updatedShop = getShopBySlug('startech');
    assert.ok(updatedShop !== null);
    assert.equal(updatedShop.lastScrapeStatus, 'SUCCESS');
    assert.ok(updatedShop.productCount >= 2);
  });

  await test('scrapeShop Dry Run Mode: does not modify database', async () => {
    const shop = getShopBySlug('techland');
    assert.ok(shop !== null);

    const countBefore = (
      db.prepare("SELECT count(*) as c FROM scraped_products WHERE shop_id = ?").get(shop.id) as { c: number }
    ).c;

    const mockHtml = readFixture('techland_product.html');
    const res = await scrapeShop(shop.id, {
      mockHtml,
      dryRun: true,
    });

    assert.equal(res.status, 'SUCCESS');
    assert.equal(res.items.length, 2);

    const countAfter = (
      db.prepare("SELECT count(*) as c FROM scraped_products WHERE shop_id = ?").get(shop.id) as { c: number }
    ).c;

    assert.equal(countBefore, countAfter, 'Dry run MUST NOT add rows to scraped_products');
  });

  await test('scrapeAllActiveShops runs batch crawl across active shops', async () => {
    const batchRes = await scrapeAllActiveShops({
      mockHtml: readFixture('generic_jsonld.html'),
      limit: 1,
    });

    assert.ok(batchRes.totalShops > 0);
    assert.ok(batchRes.successfulShops > 0);
    assert.equal(batchRes.failedShops, 0);
    assert.equal(batchRes.status, 'SUCCESS');
  });

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.cyan}==============================================================================`);
  console.log(`  VERIFICATION SUMMARY`);
  console.log(`==============================================================================${colors.reset}`);
  console.log(`  Passed Tests : ${colors.green}${passed}${colors.reset}`);
  console.log(`  Failed Tests : ${failed > 0 ? colors.red + failed : '0'}${colors.reset}`);

  if (failed > 0) {
    console.error(`\n${colors.red}${colors.bold}❌ VERIFICATION FAILED: ${failed} test(s) failed.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}✔ ALL ${passed} M2 VERIFICATION TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
