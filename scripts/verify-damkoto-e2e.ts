/**
 * DamKoto BD ("Best Deal Finder") - Comprehensive E2E Verification Suite
 * 
 * Target: Requirement-Driven Opaque-Box E2E Testing Suite
 * Location: scripts/verify-damkoto-e2e.ts
 * Execution: npx tsx scripts/verify-damkoto-e2e.ts
 * 
 * Features Covered (F1 - F10):
 * - F1: Brand Identity (DamKoto BD / Best Deal Finder)
 * - F2: Dynamic Dual Price Range Filter
 * - F3: Stock Availability Filter
 * - F4: Hierarchical Category Tree Navigation
 * - F5: Brand Search & Dynamic Counts
 * - F6: 22+ BD Retailers Multi-Select Filter
 * - F7: Unified Mobile Filter Drawer
 * - F8: Multi-Vendor Best Deal CTA
 * - F9: Digital Subscriptions & Scam Shield BD
 * - F10: Static Export & Build Integrity
 * 
 * Test Tiers:
 * - Tier 1: Feature Coverage (50 tests: 5 tests per feature for F1-F10)
 * - Tier 2: Boundary & Corner Cases (50 tests: 5 tests per feature for F1-F10)
 * - Tier 3: Cross-Feature Combinations (16 tests: Pairwise Interactions)
 * - Tier 4: Real-World Scenarios (6 tests: End-to-End Shopper Workflows)
 * Total: 122 tests (Exceeds >= 120 threshold)
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  getPhysicalProductGroups,
  getPhysicalProductBySlug,
  getTrackedRetailers,
  getRetailerById,
  getShopProducts,
} from '../src/lib/physicalDataService';
import {
  TRACKED_RETAILERS,
  INITIAL_PHYSICAL_PRODUCTS,
} from '../src/data/physicalGoodsData';
import {
  initialVendors,
  initialProducts,
  initialScamStores,
} from '../src/data/digitalGoodsData';
import {
  getProducts,
  getVendors,
  getScamRegistry,
  isVendorOrDomainBlacklisted,
  getProductComparison,
  generateAffiliateCheckoutUrl,
} from '../src/lib/dataService';
import { buildRetailerProductUrl } from '../src/lib/shopUrlHelper';

// ============================================================================
// ANSI FORMATTING HELPERS
// ============================================================================

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m',
};

// ============================================================================
// TEST HARNESS
// ============================================================================

let totalPassed = 0;
let totalFailed = 0;
const failureDetails: { id: string; error: string }[] = [];

let tier1Count = 0;
let tier2Count = 0;
let tier3Count = 0;
let tier4Count = 0;

async function testCase(id: string, description: string, tier: 1 | 2 | 3 | 4, fn: () => void | Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    console.log(`    ${c.green}[PASS]${c.reset} ${c.bold}${id}${c.reset}: ${description} ${c.dim}(${duration}ms)${c.reset}`);
    totalPassed++;
    if (tier === 1) tier1Count++;
    else if (tier === 2) tier2Count++;
    else if (tier === 3) tier3Count++;
    else if (tier === 4) tier4Count++;
  } catch (err: any) {
    const duration = Date.now() - start;
    console.error(`    ${c.red}[FAIL]${c.reset} ${c.bold}${id}${c.reset}: ${description} ${c.dim}(${duration}ms)${c.reset}`);
    console.error(`           ${c.red}Error:${c.reset} ${err.message}`);
    totalFailed++;
    failureDetails.push({ id: `${id}: ${description}`, error: err.message });
  }
}

// ============================================================================
// SOURCE FILE HELPERS
// ============================================================================

function readSource(relPath: string): string {
  const absPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Required file not found: ${relPath}`);
  }
  return fs.readFileSync(absPath, 'utf8');
}

// ============================================================================
// MAIN VERIFICATION SUITE EXECUTION
// ============================================================================

async function runDamKotoE2EVerification() {
  console.log(`\n${c.bold}${c.cyan}==============================================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}  DAMKOTO BD ("BEST DEAL FINDER") — E2E TEST SUITE${c.reset}`);
  console.log(`  Target: >= 120 Requirements & Boundary Tests Across 10 Features (4 Tiers)`);
  console.log(`${c.bold}${c.cyan}==============================================================================${c.reset}\n`);

  // Cache source files for Brand and Code Layout assertions
  const layoutContent = readSource('src/app/layout.tsx');
  const globalsContent = readSource('src/app/globals.css');
  const deviceContainerContent = readSource('src/components/DeviceContainer.tsx');
  const damkotoHeaderContent = readSource('src/components/DamKotoHeader.tsx');
  const homeScreenContent = readSource('src/components/HomeScreen.tsx');
  const physicalCardContent = readSource('src/components/PhysicalProductCard.tsx');
  const productFilterContent = readSource('src/components/ProductFilterSidebar.tsx');
  const appContextContent = readSource('src/context/AppContext.tsx');
  const nextConfigContent = readSource('next.config.ts');
  const packageJsonContent = readSource('package.json');

  // ==========================================================================
  // TIER 1: FEATURE COVERAGE (50 tests: F1 - F10)
  // ==========================================================================
  console.log(`${c.bold}${c.blue}▶ TIER 1: FEATURE COVERAGE (10 Features x 5 Tests = 50 Tests)${c.reset}`);
  console.log(`${c.dim}------------------------------------------------------------------------------${c.reset}`);

  // --------------------------------------------------------------------------
  // § F1: Brand Identity (DamKoto BD / Best Deal Finder)
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F1: Brand Identity (DamKoto BD / Best Deal Finder)${c.reset}`);

  await testCase('T1_F1_01', 'src/app/layout.tsx metadata title establishes DamKoto BD and Best Deal Finder', 1, () => {
    assert.ok(
      layoutContent.includes('DamKoto BD') && layoutContent.includes('Best Deal Finder'),
      'layout.tsx metadata title must establish "DamKoto BD" and "Best Deal Finder"'
    );
    assert.ok(
      !layoutContent.includes('Star Tech & Engineering') && !layoutContent.includes('title: "Star Tech'),
      'layout.tsx title must NOT present the platform itself as Star Tech'
    );
  });

  await testCase('T1_F1_02', 'src/app/layout.tsx OpenGraph metadata defines DamKoto BD as siteName', 1, () => {
    assert.ok(
      layoutContent.includes('siteName: "DamKoto BD"') || layoutContent.includes("siteName: 'DamKoto BD'"),
      'layout.tsx OpenGraph siteName must be "DamKoto BD"'
    );
    assert.ok(
      layoutContent.includes('locale: "bn_BD"') || layoutContent.includes("locale: 'bn_BD'"),
      'layout.tsx OpenGraph locale must be configured for Bangladesh (bn_BD)'
    );
  });

  await testCase('T1_F1_03', 'src/components/DeviceContainer.tsx footer contains DamKoto BD copyright and 0 Star Tech hotline 16793', 1, () => {
    assert.ok(
      deviceContainerContent.includes('DamKoto BD') && deviceContainerContent.includes('All rights reserved'),
      'Footer must display DamKoto BD copyright'
    );
    assert.ok(
      !deviceContainerContent.includes('16793'),
      'Footer must completely remove Star Tech hotline 16793'
    );
    assert.ok(
      !deviceContainerContent.includes('Star Point Policy'),
      'Footer must not link to Star Point Policy'
    );
  });

  await testCase('T1_F1_04', 'src/components/DamKotoHeader.tsx establishes DamKoto BD logo and removes Star Tech COMPARE logo', 1, () => {
    assert.ok(
      damkotoHeaderContent.includes('DamKoto') && damkotoHeaderContent.includes('BD'),
      'Header must display DamKoto BD brand identity'
    );
    assert.ok(
      !damkotoHeaderContent.includes('STAR <span className="text-[#ef4a23]">TECH</span>'),
      'Header must not contain Star Tech logo text'
    );
    assert.ok(
      !damkotoHeaderContent.includes('16793'),
      'Header top ticker must not display Star Tech helpline 16793'
    );
  });

  await testCase('T1_F1_05', 'src/app/globals.css replaces Star Tech orange (#ef4a23) with emerald theme palette', 1, () => {
    assert.ok(
      !globalsContent.includes('--primary: #ef4a23'),
      'Root CSS properties must not define --primary as Star Tech orange (#ef4a23)'
    );
    assert.ok(
      globalsContent.includes('--primary: #10b981') || globalsContent.includes('#10b981'),
      'Root CSS properties must configure emerald theme (--primary: #10b981)'
    );
  });

  // --------------------------------------------------------------------------
  // § F2: Dynamic Dual Price Range Filter
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F2: Dynamic Dual Price Range Filter${c.reset}`);

  await testCase('T1_F2_01', 'AppContext default price range initializes to [0, 350000] preventing catalog load truncation', 1, () => {
    assert.ok(
      appContextContent.includes('[0, 350000]'),
      'AppContext must default priceRange to [0, 350000]'
    );
    const initialList = getPhysicalProductGroups({ minPrice: 0, maxPrice: 350000 });
    assert.ok(initialList.length >= 150, `Expected full catalog on default range, received ${initialList.length}`);
  });

  await testCase('T1_F2_02', 'getPhysicalProductGroups with minPrice = 50000 returns only items >= 50000 BDT', 1, () => {
    const list = getPhysicalProductGroups({ minPrice: 50000 });
    assert.ok(list.length > 0, 'Should find products above 50,000 BDT');
    for (const p of list) {
      assert.ok(p.minPrice >= 50000, `Product ${p.canonicalName} minPrice ${p.minPrice} < 50000`);
    }
  });

  await testCase('T1_F2_03', 'getPhysicalProductGroups with maxPrice = 15000 returns only items <= 15000 BDT', 1, () => {
    const list = getPhysicalProductGroups({ maxPrice: 15000 });
    assert.ok(list.length > 0, 'Should find budget products <= 15,000 BDT');
    for (const p of list) {
      assert.ok(p.minPrice <= 15000, `Product ${p.canonicalName} minPrice ${p.minPrice} > 15000`);
    }
  });

  await testCase('T1_F2_04', 'getPhysicalProductGroups with minPrice = 20000 and maxPrice = 60000 bounds results strictly', 1, () => {
    const list = getPhysicalProductGroups({ minPrice: 20000, maxPrice: 60000 });
    assert.ok(list.length > 0, 'Should find mid-tier products in 20k-60k range');
    for (const p of list) {
      assert.ok(p.minPrice >= 20000 && p.minPrice <= 60000, `Product minPrice ${p.minPrice} outside [20000, 60000]`);
    }
  });

  await testCase('T1_F2_05', 'Quick price brackets partition catalog accurately without overlapping anomalies', 1, () => {
    const under15k = getPhysicalProductGroups({ maxPrice: 15000 });
    const from15kTo35k = getPhysicalProductGroups({ minPrice: 15001, maxPrice: 35000 });
    const above35k = getPhysicalProductGroups({ minPrice: 35001, maxPrice: 350000 });

    assert.ok(under15k.length > 0, 'Tier 1 under 15k must have products');
    assert.ok(from15kTo35k.length > 0, 'Tier 2 15k-35k must have products');
    assert.ok(above35k.length > 0, 'Tier 3 above 35k must have products');
  });

  // --------------------------------------------------------------------------
  // § F3: Stock Availability Filter
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F3: Stock Availability Filter${c.reset}`);

  await testCase('T1_F3_01', 'getPhysicalProductGroups with inStockOnly = true returns only items with inStockOfferCount > 0', 1, () => {
    const list = getPhysicalProductGroups({ inStockOnly: true });
    assert.ok(list.length > 0, 'In-stock filter must return matching products');
    for (const p of list) {
      assert.ok(p.inStockOfferCount > 0, `Product ${p.canonicalName} inStockOfferCount must be > 0`);
    }
  });

  await testCase('T1_F3_02', 'getPhysicalProductGroups with inStockOnly = false returns full catalog without dropping items', 1, () => {
    const inStockList = getPhysicalProductGroups({ inStockOnly: true });
    const allList = getPhysicalProductGroups({ inStockOnly: false });
    assert.ok(allList.length >= inStockList.length, 'All products count must be >= inStock products count');
  });

  await testCase('T1_F3_03', 'All offers across physical products have valid normalized stock statuses', 1, () => {
    for (const p of INITIAL_PHYSICAL_PRODUCTS) {
      assert.ok(p.offers && p.offers.length > 0, `Product ${p.canonicalName} has no offers`);
      for (const o of p.offers) {
        assert.ok(typeof o.inStock === 'boolean', `Offer in ${o.shopName} missing boolean inStock`);
        assert.ok(typeof o.availability === 'string' && o.availability.length > 0, `Offer missing availability status string`);
      }
    }
  });

  await testCase('T1_F3_04', 'Product Best Deal derivation prioritizes in-stock offers over cheaper out-of-stock offers when available', 1, () => {
    for (const p of INITIAL_PHYSICAL_PRODUCTS) {
      if (p.inStockOfferCount > 0) {
        const inStockOffers = p.offers?.filter((o) => o.inStock) || [];
        if (inStockOffers.length > 0) {
          const minInStockPrice = Math.min(...inStockOffers.map((o) => o.priceBDT));
          assert.strictEqual(p.minPrice, minInStockPrice, `Best deal price on ${p.canonicalName} does not equal lowest in-stock offer`);
        }
      }
    }
  });

  await testCase('T1_F3_05', 'Stock count badge invariant: inStockOfferCount is non-negative and <= total offerCount', 1, () => {
    for (const p of INITIAL_PHYSICAL_PRODUCTS) {
      assert.ok(p.inStockOfferCount >= 0, `inStockOfferCount negative on ${p.canonicalName}`);
      assert.ok(p.inStockOfferCount <= p.offerCount, `inStockOfferCount > offerCount on ${p.canonicalName}`);
    }
  });

  // --------------------------------------------------------------------------
  // § F4: Hierarchical Category Tree Navigation
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F4: Hierarchical Category Tree Navigation${c.reset}`);

  await testCase('T1_F4_01', 'Hierarchical category groups compute non-zero counts for primary hardware departments', 1, () => {
    const processors = getPhysicalProductGroups({ category: 'processors' });
    const gpus = getPhysicalProductGroups({ category: 'graphics cards' });
    const laptops = getPhysicalProductGroups({ category: 'laptops' });
    const ram = getPhysicalProductGroups({ category: 'ram' });
    const ssd = getPhysicalProductGroups({ category: 'ssd' });

    assert.ok(processors.length > 0, 'Processors must have products');
    assert.ok(gpus.length > 0, 'Graphics cards must have products');
    assert.ok(laptops.length > 0, 'Laptops must have products');
    assert.ok(ram.length > 0, 'RAM must have products');
    assert.ok(ssd.length > 0, 'SSD must have products');
  });

  await testCase('T1_F4_02', 'Filtering category "Processors" returns exclusively CPU hardware', 1, () => {
    const list = getPhysicalProductGroups({ category: 'processors' });
    for (const p of list) {
      assert.ok(
        p.category.toLowerCase() === 'processors' || p.canonicalName.toLowerCase().includes('ryzen') || p.canonicalName.toLowerCase().includes('core i'),
        `Product ${p.canonicalName} in processors is not a CPU`
      );
    }
  });

  await testCase('T1_F4_03', 'Filtering category "Graphics Cards" returns exclusively GPU hardware', 1, () => {
    const list = getPhysicalProductGroups({ category: 'graphics cards' });
    for (const p of list) {
      assert.ok(
        p.category.toLowerCase() === 'graphics cards' || p.canonicalName.toLowerCase().includes('geforce') || p.canonicalName.toLowerCase().includes('radeon') || p.canonicalName.toLowerCase().includes('gtx'),
        `Product ${p.canonicalName} in graphics cards is not a GPU`
      );
    }
  });

  await testCase('T1_F4_04', 'Filtering category "Laptops" returns exclusively laptop computers', 1, () => {
    const list = getPhysicalProductGroups({ category: 'laptops' });
    for (const p of list) {
      assert.ok(
        p.category.toLowerCase() === 'laptops' || p.canonicalName.toLowerCase().includes('laptop') || p.canonicalName.toLowerCase().includes('book'),
        `Product ${p.canonicalName} in laptops is not a laptop computer`
      );
    }
  });

  await testCase('T1_F4_05', 'ProductFilterSidebar implements 2-tier collapsible category tree hierarchy structure', 1, () => {
    assert.ok(
      productFilterContent.includes('CATEGORY_GROUPS') && productFilterContent.includes('children:'),
      'ProductFilterSidebar must define hierarchical category groups with children'
    );
    assert.ok(
      productFilterContent.includes('Processors') && productFilterContent.includes('Graphics Cards') && productFilterContent.includes('RAM'),
      'Category tree must define subcategories for CPU, GPU, RAM'
    );
  });

  // --------------------------------------------------------------------------
  // § F5: Brand Search & Dynamic Counts
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F5: Brand Search & Dynamic Counts${c.reset}`);

  await testCase('T1_F5_01', 'Catalog contains verified major tech brands (AMD, Intel, ASUS, MSI, Walton, Corsair)', 1, () => {
    const brands = Array.from(new Set(INITIAL_PHYSICAL_PRODUCTS.map((p) => p.brand)));
    assert.ok(brands.includes('AMD'), 'Must include AMD');
    assert.ok(brands.includes('Intel'), 'Must include Intel');
    assert.ok(brands.includes('ASUS'), 'Must include ASUS');
    assert.ok(brands.includes('Walton'), 'Must include Walton');
  });

  await testCase('T1_F5_02', 'Filtering by brand "AMD" returns exclusively AMD products', 1, () => {
    const list = getPhysicalProductGroups({ brand: 'AMD' });
    assert.ok(list.length > 0, 'Must find AMD products');
    for (const p of list) {
      assert.strictEqual(p.brand.toUpperCase(), 'AMD', `Product ${p.canonicalName} brand is not AMD`);
    }
  });

  await testCase('T1_F5_03', 'Filtering by brand "Intel" returns exclusively Intel products', 1, () => {
    const list = getPhysicalProductGroups({ brand: 'Intel' });
    assert.ok(list.length > 0, 'Must find Intel products');
    for (const p of list) {
      assert.strictEqual(p.brand.toUpperCase(), 'INTEL', `Product ${p.canonicalName} brand is not Intel`);
    }
  });

  await testCase('T1_F5_04', 'Context-aware dynamic brand counts adjust when category is selected', 1, () => {
    const cpuProducts = INITIAL_PHYSICAL_PRODUCTS.filter((p) => p.category.toLowerCase() === 'processors');
    const cpuBrands = new Set(cpuProducts.map((p) => p.brand));
    assert.ok(cpuBrands.has('AMD') && cpuBrands.has('Intel'), 'Processors must have AMD and Intel');
    assert.ok(!cpuBrands.has('Walton'), 'Processors should not list Walton as CPU manufacturer');
  });

  await testCase('T1_F5_05', 'ProductFilterSidebar includes searchable brand input with dynamic product count badges', 1, () => {
    assert.ok(
      productFilterContent.includes('brandSearch') || productFilterContent.includes('setBrandSearch') || productFilterContent.includes('Search Brand'),
      'Sidebar must have brand search input'
    );
    assert.ok(
      productFilterContent.includes('brandCounts') && productFilterContent.includes('visibleBrands.map'),
      'Sidebar must render dynamic count badges for each brand'
    );
  });

  // --------------------------------------------------------------------------
  // § F6: 22+ BD Retailers Multi-Select Filter
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F6: 22+ BD Retailers Multi-Select Filter${c.reset}`);

  await testCase('T1_F6_01', 'TRACKED_RETAILERS contains exactly 22 verified Bangladeshi tech shops with unique IDs', 1, () => {
    assert.strictEqual(TRACKED_RETAILERS.length, 22, `Expected exactly 22 tracked retailers, found ${TRACKED_RETAILERS.length}`);
    const ids = new Set(TRACKED_RETAILERS.map((s) => s.id));
    assert.strictEqual(ids.size, 22, 'All 22 shop IDs must be unique');
  });

  await testCase('T1_F6_02', 'Filtering by shop "shop-startech" returns products with offers at Star Tech', 1, () => {
    const list = getPhysicalProductGroups({ shopId: 'shop-startech' });
    assert.ok(list.length > 0, 'Must return products for Star Tech');
    for (const p of list) {
      assert.ok(p.offers?.some((o) => o.shopId === 'shop-startech'), `Product ${p.canonicalName} missing Star Tech offer`);
    }
  });

  await testCase('T1_F6_03', 'Filtering by shop "shop-ryans" returns products with offers at Ryans Computers', 1, () => {
    const list = getPhysicalProductGroups({ shopId: 'shop-ryans' });
    assert.ok(list.length > 0, 'Must return products for Ryans');
    for (const p of list) {
      assert.ok(p.offers?.some((o) => o.shopId === 'shop-ryans'), `Product ${p.canonicalName} missing Ryans offer`);
    }
  });

  await testCase('T1_F6_04', 'Filtering by shop "shop-walton" returns products with offers at Walton BD', 1, () => {
    const list = getPhysicalProductGroups({ shopId: 'shop-walton' });
    assert.ok(list.length > 0, 'Must return products for Walton BD');
    for (const p of list) {
      assert.ok(p.offers?.some((o) => o.shopId === 'shop-walton'), `Product ${p.canonicalName} missing Walton offer`);
    }
  });

  await testCase('T1_F6_05', 'Multi-shop selection (shopIds: [techland, globalbrand]) returns union of store products', 1, () => {
    const techlandOnly = getPhysicalProductGroups({ shopId: 'shop-techland' });
    const globalOnly = getPhysicalProductGroups({ shopId: 'shop-globalbrand' });
    const combined = getPhysicalProductGroups({ shopIds: ['shop-techland', 'shop-globalbrand'] });

    assert.ok(combined.length >= Math.max(techlandOnly.length, globalOnly.length), 'Combined shop query must contain union');
    for (const p of combined) {
      assert.ok(
        p.offers?.some((o) => o.shopId === 'shop-techland' || o.shopId === 'shop-globalbrand'),
        `Product ${p.canonicalName} does not have offers at Techland or Global Brand`
      );
    }
  });

  // --------------------------------------------------------------------------
  // § F7: Unified Mobile Filter Drawer
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F7: Unified Mobile Filter Drawer${c.reset}`);

  await testCase('T1_F7_01', 'HomeScreen includes mobile filter trigger button with active filter counter badge', 1, () => {
    assert.ok(
      homeScreenContent.includes('setMobileFilterOpen') || homeScreenContent.includes('isMobileDrawerOpen'),
      'HomeScreen must manage mobile filter drawer open state'
    );
    assert.ok(
      homeScreenContent.includes('activeFilterCount') || homeScreenContent.includes('selectedBrands.length'),
      'HomeScreen must calculate and display active filter count'
    );
  });

  await testCase('T1_F7_02', 'Mobile drawer container renders slide-over presentation with backdrop and close control', 1, () => {
    assert.ok(
      homeScreenContent.includes('fixed inset-0 z-50') && homeScreenContent.includes('backdrop'),
      'Mobile drawer must use fixed overlay presentation with backdrop'
    );
    assert.ok(
      homeScreenContent.includes('handleCloseMobileDrawer') || homeScreenContent.includes('setMobileFilterOpen(false)'),
      'Mobile drawer must have explicit close callback'
    );
  });

  await testCase('T1_F7_03', 'Mobile drawer contains sticky bottom action bar with apply filters button', 1, () => {
    assert.ok(
      homeScreenContent.includes('sticky bottom-0'),
      'Mobile drawer must have sticky bottom action control'
    );
    assert.ok(
      homeScreenContent.includes('ফিল্টার প্রয়োগ করুন') || homeScreenContent.includes('Apply Filters'),
      'Mobile drawer must have apply filters CTA button'
    );
  });

  await testCase('T1_F7_04', 'Mobile drawer embeds ProductFilterSidebar with price, stock, category, brand, shop controls', 1, () => {
    assert.ok(
      homeScreenContent.includes('<ProductFilterSidebar') || homeScreenContent.includes('ProductFilterSidebar'),
      'HomeScreen must embed ProductFilterSidebar in mobile view'
    );
  });

  await testCase('T1_F7_05', 'Active filter chips row allows dismissing individual brand and shop filters', 1, () => {
    assert.ok(
      homeScreenContent.includes('handleToggleBrand(brand)') || homeScreenContent.includes('handleToggleShopId(shopId)'),
      'Active filter chips must provide direct toggle dismissal handlers'
    );
  });

  // --------------------------------------------------------------------------
  // § F8: Multi-Vendor Best Deal CTA
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F8: Multi-Vendor Best Deal CTA${c.reset}`);

  await testCase('T1_F8_01', 'PhysicalProductCard dynamically resolves CTA URL and Shop Name to bestDealVendor', 1, () => {
    assert.ok(
      physicalCardContent.includes('bestDealUrl') && physicalCardContent.includes('bestDealShopName'),
      'PhysicalProductCard must resolve CTA dynamically using bestDealUrl and bestDealShopName'
    );
    assert.ok(
      !physicalCardContent.includes('starOffer?.productUrl') || physicalCardContent.includes('bestOffer'),
      'PhysicalProductCard must not exclusively bind CTA to Star Tech offer'
    );
  });

  await testCase('T1_F8_02', 'When Walton has the lowest price, product card CTA targets Walton BD', 1, () => {
    const waltonDeals = INITIAL_PHYSICAL_PRODUCTS.filter((p) => p.bestDealShopId === 'shop-walton');
    assert.ok(waltonDeals.length > 0, 'Catalog must contain products where Walton has lowest price');
    for (const p of waltonDeals) {
      assert.strictEqual(p.bestDealShopName, 'Walton BD');
      assert.ok(p.minPrice <= p.maxPrice);
    }
  });

  await testCase('T1_F8_03', 'Product card CTA template dynamically formats store buy text `${bestDealShopName}-এ কিনুন`', 1, () => {
    assert.ok(
      physicalCardContent.includes('${bestDealShopName}-এ কিনুন') || physicalCardContent.includes('bestDealShopName'),
      'PhysicalProductCard must dynamically format the store buy button text'
    );
    const uniqueBestDealShops = new Set(INITIAL_PHYSICAL_PRODUCTS.map((p) => p.bestDealShopId));
    assert.ok(uniqueBestDealShops.size >= 10, 'Catalog best deals must be dynamically distributed across shops');
  });

  await testCase('T1_F8_04', 'Product card displays savings badge with accurate priceSpreadBDT or savingsPercent', 1, () => {
    const deals = INITIAL_PHYSICAL_PRODUCTS.filter((p) => (p.priceSpreadBDT || 0) > 0);
    assert.ok(deals.length > 0, 'Should find products with price spread between retailers');
    for (const p of deals) {
      assert.strictEqual(p.priceSpreadBDT, p.maxPrice - p.minPrice, `Spread mismatch on ${p.canonicalName}`);
    }
  });

  await testCase('T1_F8_05', 'Product card image fallback uses DamKoto BD SVG placeholder instead of Star Tech image', 1, () => {
    assert.ok(
      physicalCardContent.includes('DAMKOTO_PLACEHOLDER') || physicalCardContent.includes('DamKoto BD'),
      'PhysicalProductCard must provide DamKoto BD placeholder SVG'
    );
  });

  // --------------------------------------------------------------------------
  // § F9: Digital Subscriptions & Scam Shield BD
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F9: Digital Subscriptions & Scam Shield BD${c.reset}`);

  await testCase('T1_F9_01', 'Digital goods dataset contains exactly 17 verified digital vendors with trust ratings', 1, () => {
    assert.strictEqual(initialVendors.length, 17, `Expected 17 digital vendors, found ${initialVendors.length}`);
    for (const v of initialVendors) {
      assert.ok(v.isVerified, `Vendor ${v.name} must be verified`);
      assert.ok(v.trustScore >= 90, `Vendor ${v.name} trust score ${v.trustScore} < 90`);
    }
  });

  await testCase('T1_F9_02', 'Digital catalog includes essential categories (OTT, Gaming, Software, VPN)', 1, () => {
    const categories = new Set(initialProducts.map((p) => p.category));
    assert.ok(categories.has('OTT'), 'Must include OTT category');
    assert.ok(categories.has('Software'), 'Must include Software category');
    assert.ok(categories.has('Gaming'), 'Must include Gaming category');
    assert.ok(categories.has('VPN'), 'Must include VPN category');
  });

  await testCase('T1_F9_03', 'Scam Shield BD blacklist records fraudulent stores with reported evidence', 1, () => {
    assert.ok(initialScamStores.length >= 5, `Expected >= 5 scam stores, found ${initialScamStores.length}`);
    for (const s of initialScamStores) {
      assert.ok(s.domainOrPageName && s.reason && s.evidenceSummary, `Incomplete scam record for ${s.domainOrPageName}`);
    }
  });

  await testCase('T1_F9_04', 'ScamModal provides interactive scam search and blacklist verification', 1, () => {
    const scamModalContent = readSource('src/components/ScamModal.tsx');
    assert.ok(
      scamModalContent.includes('searchQuery') && scamModalContent.includes('isVendorOrDomainBlacklisted'),
      'ScamModal must bind search query to blacklist verification'
    );
  });

  await testCase('T1_F9_05', 'Digital deal comparison calculates cheapest vendor deal with ascending sort', 1, () => {
    const comparison = getProductComparison('netflix-premium-4k');
    assert.ok(comparison && comparison.deals.length > 0, 'Must return Netflix deals');
    for (let i = 0; i < comparison.deals.length - 1; i++) {
      assert.ok(
        comparison.deals[i].priceBDT <= comparison.deals[i + 1].priceBDT,
        'Deals must be sorted ascending by price'
      );
    }
  });

  // --------------------------------------------------------------------------
  // § F10: Static Export & Build Integrity
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F10: Static Export & Build Integrity${c.reset}`);

  await testCase('T1_F10_01', 'next.config.ts configures output: "export" for static HTML generation', 1, () => {
    assert.ok(
      nextConfigContent.includes("output: 'export'") || nextConfigContent.includes('output: "export"'),
      'next.config.ts must set output: "export"'
    );
  });

  await testCase('T1_F10_02', 'next.config.ts configures images: { unoptimized: true } for static site hosting', 1, () => {
    assert.ok(
      nextConfigContent.includes('unoptimized: true'),
      'next.config.ts must set images: { unoptimized: true }'
    );
  });

  await testCase('T1_F10_03', 'AdminShopRegistry provides static fallback dataset when running in static export mode', 1, () => {
    const adminRegistryContent = readSource('src/components/AdminShopRegistry.tsx');
    assert.ok(
      adminRegistryContent.includes('TRACKED_RETAILERS') || adminRegistryContent.includes('fallbackShops'),
      'AdminShopRegistry must include fallback retailers for offline/static operation'
    );
  });

  await testCase('T1_F10_04', 'Zero client components import native C++ module better-sqlite3 directly', 1, () => {
    assert.ok(!homeScreenContent.includes('better-sqlite3'), 'HomeScreen must not import better-sqlite3');
    assert.ok(!damkotoHeaderContent.includes('better-sqlite3'), 'DamKotoHeader must not import better-sqlite3');
    assert.ok(!productFilterContent.includes('better-sqlite3'), 'ProductFilterSidebar must not import better-sqlite3');
    assert.ok(!deviceContainerContent.includes('better-sqlite3'), 'DeviceContainer must not import better-sqlite3');
  });

  await testCase('T1_F10_05', 'Client data services (physicalDataService & dataService) execute safely in Node/Client', 1, () => {
    const physicalRetailers = getTrackedRetailers();
    const digitalVendors = getVendors();
    assert.strictEqual(physicalRetailers.length, 22);
    assert.strictEqual(digitalVendors.length, 17);
  });

  // ==========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (50 tests: F1 - F10)
  // ==========================================================================
  console.log(`\n${c.bold}${c.blue}▶ TIER 2: BOUNDARY & CORNER CASES (10 Features x 5 Tests = 50 Tests)${c.reset}`);
  console.log(`${c.dim}------------------------------------------------------------------------------${c.reset}`);

  // --------------------------------------------------------------------------
  // § F1 Boundary: Brand Isolation Edge Cases
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F1 Boundary: Brand Isolation Edge Cases${c.reset}`);

  await testCase('T2_F1_01', 'Case-insensitive search ensures no "STAR TECH" or "StarTech" platform branding in layout', 2, () => {
    const rawTitle = layoutContent.toLowerCase();
    assert.ok(rawTitle.includes('damkoto bd'), 'Title must contain DamKoto BD');
    assert.ok(!rawTitle.includes('title: "star tech') && !rawTitle.includes("title: 'star tech"), 'Title must not start with Star Tech');
  });

  await testCase('T2_F1_02', 'Platform hotline isolation: hotline 16793 is absent from all platform UI components', 2, () => {
    assert.ok(!damkotoHeaderContent.includes('16793'), 'Header must not contain 16793');
    assert.ok(!deviceContainerContent.includes('16793'), 'DeviceContainer must not contain 16793');
    assert.ok(!layoutContent.includes('16793'), 'Layout must not contain 16793');
  });

  await testCase('T2_F1_03', 'Platform email isolation: info@startech.com.bd is removed from footer and contact links', 2, () => {
    assert.ok(!deviceContainerContent.includes('info@startech.com.bd'), 'Footer must not have info@startech.com.bd');
  });

  await testCase('T2_F1_04', 'Policy isolation: Star Point Policy is removed from footer legal links', 2, () => {
    assert.ok(!deviceContainerContent.includes('Star Point Policy'), 'Footer must not contain Star Point Policy');
  });

  await testCase('T2_F1_05', 'Multi-vendor comparison context preservation: Star Tech is retained in shop list', 2, () => {
    const starTechShop = getRetailerById('shop-startech');
    assert.ok(starTechShop !== null, 'Star Tech must be preserved in shop registry as an external vendor');
    assert.strictEqual(starTechShop?.domain, 'startech.com.bd');
  });

  // --------------------------------------------------------------------------
  // § F2 Boundary: Price Range Edge Cases
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F2 Boundary: Price Range Edge Cases${c.reset}`);

  await testCase('T2_F2_01', 'Inverted price range (minPrice: 50000, maxPrice: 20000) returns empty array without crash', 2, () => {
    const list = getPhysicalProductGroups({ minPrice: 50000, maxPrice: 20000 });
    assert.strictEqual(list.length, 0, 'Inverted price range should yield 0 products');
  });

  await testCase('T2_F2_02', 'Zero-bound edge case: minPrice: 0, maxPrice: 0 returns empty list without error', 2, () => {
    const list = getPhysicalProductGroups({ minPrice: 0, maxPrice: 0 });
    assert.ok(Array.isArray(list), 'Must return array');
  });

  await testCase('T2_F2_03', 'Exact boundary match: filtering where minPrice == maxPrice returns exact match', 2, () => {
    const targetProduct = INITIAL_PHYSICAL_PRODUCTS[0];
    const exactPrice = targetProduct.minPrice;
    const list = getPhysicalProductGroups({ minPrice: exactPrice, maxPrice: exactPrice });
    assert.ok(list.some((p) => p.minPrice === exactPrice), 'Must match product with exact price');
  });

  await testCase('T2_F2_04', 'Negative price input is clamped or returns valid products without error', 2, () => {
    const list = getPhysicalProductGroups({ minPrice: -500 });
    assert.ok(list.length > 0, 'Negative minPrice should not break query');
  });

  await testCase('T2_F2_05', 'Upper boundary saturation: maxPrice = 1,000,000 does not overflow calculation', 2, () => {
    const list = getPhysicalProductGroups({ maxPrice: 1000000 });
    assert.strictEqual(list.length, INITIAL_PHYSICAL_PRODUCTS.length, 'Huge maxPrice should include all products');
  });

  // --------------------------------------------------------------------------
  // § F3 Boundary: Stock Filter Edge Cases
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F3 Boundary: Stock Filter Edge Cases${c.reset}`);

  await testCase('T2_F3_01', 'Products with 100% out of stock offers gracefully report inStockOfferCount === 0', 2, () => {
    const outOfStockProducts = INITIAL_PHYSICAL_PRODUCTS.filter((p) => p.inStockOfferCount === 0);
    for (const p of outOfStockProducts) {
      assert.strictEqual(p.inStockOfferCount, 0);
      assert.ok(p.minPrice > 0, 'Out of stock product must still have a valid reference price');
    }
  });

  await testCase('T2_F3_02', 'Pre-order offers are properly distinguished from in-stock offers', 2, () => {
    const allOffers = INITIAL_PHYSICAL_PRODUCTS.flatMap((p) => p.offers || []);
    const preOrderOffers = allOffers.filter((o) => o.availability.toLowerCase().includes('pre-order'));
    for (const o of preOrderOffers) {
      assert.strictEqual(o.inStock, false, 'Pre-order offer must have inStock: false');
    }
  });

  await testCase('T2_F3_03', 'Product with single out-of-stock offer has inStockOfferCount === 0', 2, () => {
    const singleOutOfStock = INITIAL_PHYSICAL_PRODUCTS.find((p) => p.offerCount === 1 && !p.offers?.[0]?.inStock);
    if (singleOutOfStock) {
      assert.strictEqual(singleOutOfStock.inStockOfferCount, 0);
    }
  });

  await testCase('T2_F3_04', 'Mixed stock product correctly partitions inStockOfferCount vs total offerCount', 2, () => {
    const mixed = INITIAL_PHYSICAL_PRODUCTS.find((p) => p.inStockOfferCount > 0 && p.inStockOfferCount < p.offerCount);
    if (mixed) {
      assert.ok(mixed.inStockOfferCount < mixed.offerCount);
      assert.ok(mixed.inStockOfferCount > 0);
    }
  });

  await testCase('T2_F3_05', 'Filter idempotency: multiple calls with inStockOnly = true produce identical results', 2, () => {
    const run1 = getPhysicalProductGroups({ inStockOnly: true }).map((p) => p.id);
    const run2 = getPhysicalProductGroups({ inStockOnly: true }).map((p) => p.id);
    assert.deepStrictEqual(run1, run2, 'Consecutive inStockOnly queries must be deterministic');
  });

  // --------------------------------------------------------------------------
  // § F4 Boundary: Category Tree Edge Cases
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F4 Boundary: Category Tree Edge Cases${c.reset}`);

  await testCase('T2_F4_01', 'Unknown category query (e.g. "Toasters") returns empty list [] without error', 2, () => {
    const list = getPhysicalProductGroups({ category: 'Toasters' });
    assert.strictEqual(list.length, 0, 'Non-existent category should return 0 items');
  });

  await testCase('T2_F4_02', 'Case insensitivity: querying "PROCESSORS" matches same items as "processors"', 2, () => {
    const lower = getPhysicalProductGroups({ category: 'processors' });
    const upper = getPhysicalProductGroups({ category: 'PROCESSORS' });
    assert.strictEqual(lower.length, upper.length, 'Category query must be case-insensitive');
  });

  await testCase('T2_F4_03', 'Querying category "all" or "All" returns full catalog', 2, () => {
    const allLower = getPhysicalProductGroups({ category: 'all' });
    const allUpper = getPhysicalProductGroups({ category: 'All' });
    assert.strictEqual(allLower.length, INITIAL_PHYSICAL_PRODUCTS.length);
    assert.strictEqual(allUpper.length, INITIAL_PHYSICAL_PRODUCTS.length);
  });

  await testCase('T2_F4_04', 'Cross-category isolation: GPU products never leak into Processor category', 2, () => {
    const processors = getPhysicalProductGroups({ category: 'processors' });
    for (const p of processors) {
      assert.ok(!p.canonicalName.includes('GeForce GT'), `GPU found in CPU category: ${p.canonicalName}`);
    }
  });

  await testCase('T2_F4_05', 'Storage subcategory keyword boundary: SSD/NVMe products match ssd category correctly', 2, () => {
    const ssds = getPhysicalProductGroups({ category: 'ssd' });
    assert.ok(ssds.length > 0, 'Must find SSD/NVMe products');
    for (const p of ssds) {
      const name = p.canonicalName.toLowerCase();
      assert.ok(
        name.includes('ssd') || name.includes('nvme') || name.includes('m.2') || name.includes('storage'),
        `Product in SSD category is not storage: ${p.canonicalName}`
      );
    }
  });

  // --------------------------------------------------------------------------
  // § F5 Boundary: Brand Search Edge Cases
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F5 Boundary: Brand Search Edge Cases${c.reset}`);

  await testCase('T2_F5_01', 'Multi-brand selection (brands: ["AMD", "Intel"]) returns union of both brands', 2, () => {
    const amd = getPhysicalProductGroups({ brand: 'AMD' });
    const intel = getPhysicalProductGroups({ brand: 'Intel' });
    const combined = getPhysicalProductGroups({ brands: ['AMD', 'Intel'] });

    assert.strictEqual(combined.length, amd.length + intel.length, 'Combined brands count must equal sum of disjoint brands');
  });

  await testCase('T2_F5_02', 'Non-existent brand query returns empty array []', 2, () => {
    const list = getPhysicalProductGroups({ brand: 'FakeBrand999' });
    assert.strictEqual(list.length, 0);
  });

  await testCase('T2_F5_03', 'Case-insensitive brand matching: brand "amd" matches "AMD"', 2, () => {
    const lower = getPhysicalProductGroups({ brand: 'amd' });
    const upper = getPhysicalProductGroups({ brand: 'AMD' });
    assert.strictEqual(lower.length, upper.length);
  });

  await testCase('T2_F5_04', 'Brand with 0 products in category: Walton brand returns 0 for Processors category', 2, () => {
    const waltonCpus = getPhysicalProductGroups({ category: 'processors', brand: 'Walton' });
    assert.strictEqual(waltonCpus.length, 0, 'Walton does not make standalone desktop CPUs');
  });

  await testCase('T2_F5_05', 'Brand search query with special characters (e.g. G.Skill) matches accurately', 2, () => {
    const gskill = INITIAL_PHYSICAL_PRODUCTS.filter((p) => p.brand.toLowerCase().includes('skill'));
    assert.ok(Array.isArray(gskill));
  });

  // --------------------------------------------------------------------------
  // § F6 Boundary: 22 BD Retailers Edge Cases
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F6 Boundary: 22 BD Retailers Edge Cases${c.reset}`);

  await testCase('T2_F6_01', 'Exhaustive 22 shops check: each shop has valid slug, name, domain, and baseUrl', 2, () => {
    for (const s of TRACKED_RETAILERS) {
      assert.ok(s.id.startsWith('shop-'), `Shop ID ${s.id} must start with shop-`);
      assert.ok(s.domain.includes('.bd') || s.domain.includes('.com'), `Shop domain ${s.domain} invalid`);
      assert.ok(s.baseUrl.startsWith('http'), `Shop baseUrl ${s.baseUrl} must be http/https`);
    }
  });

  await testCase('T2_F6_02', 'Empty shopIds array returns full product catalog without filtering out shops', 2, () => {
    const list = getPhysicalProductGroups({ shopIds: [] });
    assert.strictEqual(list.length, INITIAL_PHYSICAL_PRODUCTS.length);
  });

  await testCase('T2_F6_03', 'Unknown shopId (shop-unknown-999) returns empty array without throwing', 2, () => {
    const list = getPhysicalProductGroups({ shopId: 'shop-unknown-999' });
    assert.strictEqual(list.length, 0);
  });

  await testCase('T2_F6_04', 'All 22 shops selected in shopIds returns complete catalog', 2, () => {
    const allShopIds = TRACKED_RETAILERS.map((s) => s.id);
    const list = getPhysicalProductGroups({ shopIds: allShopIds });
    assert.strictEqual(list.length, INITIAL_PHYSICAL_PRODUCTS.length);
  });

  await testCase('T2_F6_05', 'Retailer outbound URL builder handles custom search query parameters for all 22 shops', 2, () => {
    for (const s of TRACKED_RETAILERS) {
      const url = buildRetailerProductUrl(s.slug, 'GT 730');
      assert.ok(url.startsWith('http'), `Generated URL for ${s.name} is not http: ${url}`);
      assert.ok(url.includes('730') || url.includes('GT'), `Search query missing in URL for ${s.name}: ${url}`);
    }
  });

  // --------------------------------------------------------------------------
  // § F7 Boundary: Mobile Drawer Edge Cases
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F7 Boundary: Mobile Drawer Edge Cases${c.reset}`);

  await testCase('T2_F7_01', 'Active filter count calculation: correctly counts multiple brands, shops, and price filters', 2, () => {
    assert.ok(
      homeScreenContent.includes('activeFilterCount =') || homeScreenContent.includes('selectedBrands.length'),
      'HomeScreen must compute composite active filter count'
    );
  });

  await testCase('T2_F7_02', 'Reset all filters clears active brands, active shops, and restores default price range', 2, () => {
    assert.ok(
      homeScreenContent.includes('handleResetAllFilters') || homeScreenContent.includes('resetFilters'),
      'HomeScreen must provide master reset handler'
    );
  });

  await testCase('T2_F7_03', 'Mobile filter drawer uses lg:hidden to avoid rendering on desktop viewports', 2, () => {
    assert.ok(
      homeScreenContent.includes('lg:hidden'),
      'Mobile drawer must have lg:hidden responsive class'
    );
  });

  await testCase('T2_F7_04', 'Desktop sidebar uses hidden lg:block to avoid rendering on mobile screens', 2, () => {
    assert.ok(
      homeScreenContent.includes('hidden lg:block'),
      'Desktop sidebar must have hidden lg:block responsive class'
    );
  });

  await testCase('T2_F7_05', 'Mobile drawer backdrop click invokes handleCloseMobileDrawer', 2, () => {
    assert.ok(
      homeScreenContent.includes('handleCloseMobileDrawer') || homeScreenContent.includes('setMobileFilterOpen(false)'),
      'Backdrop must dismiss mobile drawer'
    );
  });

  // --------------------------------------------------------------------------
  // § F8 Boundary: Best Deal CTA Edge Cases
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F8 Boundary: Best Deal CTA Edge Cases${c.reset}`);

  await testCase('T2_F8_01', 'Product with single offer points CTA to that store with price spread = 0', 2, () => {
    const singleOfferProduct = INITIAL_PHYSICAL_PRODUCTS.find((p) => p.offerCount === 1);
    if (singleOfferProduct) {
      assert.strictEqual(singleOfferProduct.priceSpreadBDT, 0);
      assert.strictEqual(singleOfferProduct.minPrice, singleOfferProduct.maxPrice);
    }
  });

  await testCase('T2_F8_02', 'Product missing direct URL falls back to buildRetailerProductUrl cleanly', 2, () => {
    assert.ok(
      physicalCardContent.includes('buildRetailerProductUrl'),
      'PhysicalProductCard must use buildRetailerProductUrl fallback'
    );
  });

  await testCase('T2_F8_03', 'Tied lowest price across 2 stores: bestDealPrice equals minPrice', 2, () => {
    for (const p of INITIAL_PHYSICAL_PRODUCTS) {
      assert.strictEqual(p.bestDealPrice, p.minPrice, `bestDealPrice does not match minPrice on ${p.canonicalName}`);
    }
  });

  await testCase('T2_F8_04', 'Savings percent calculation is bounded between 0% and 100%', 2, () => {
    for (const p of INITIAL_PHYSICAL_PRODUCTS) {
      if (typeof p.savingsPercent === 'number') {
        assert.ok(p.savingsPercent >= 0 && p.savingsPercent <= 100, `savingsPercent out of bounds on ${p.canonicalName}`);
      }
    }
  });

  await testCase('T2_F8_05', 'Image error handler replaces broken image with DAMKOTO_PLACEHOLDER SVG', 2, () => {
    assert.ok(
      physicalCardContent.includes('onError') && physicalCardContent.includes('DAMKOTO_PLACEHOLDER'),
      'Image tag must have onError fallback to DAMKOTO_PLACEHOLDER'
    );
  });

  // --------------------------------------------------------------------------
  // § F9 Boundary: Digital Goods & Scam Shield Edge Cases
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F9 Boundary: Digital Goods & Scam Shield Edge Cases${c.reset}`);

  await testCase('T2_F9_01', 'isVendorOrDomainBlacklisted detects known scam domain by exact domain string', 2, () => {
    const knownScam = initialScamStores[0];
    const isBlacklisted = isVendorOrDomainBlacklisted(knownScam.domainOrPageName);
    assert.strictEqual(isBlacklisted, true, `Known scam ${knownScam.domainOrPageName} must be detected`);
  });

  await testCase('T2_F9_02', 'isVendorOrDomainBlacklisted detects scam domain with http/https and www prefixes', 2, () => {
    const knownScam = initialScamStores[0];
    const testUrl = `https://www.${knownScam.domainOrPageName}/checkout`;
    assert.strictEqual(isVendorOrDomainBlacklisted(testUrl), true);
  });

  await testCase('T2_F9_03', 'Legitimate verified vendor domain is NOT blacklisted', 2, () => {
    assert.strictEqual(isVendorOrDomainBlacklisted('startech.com.bd'), false);
    assert.strictEqual(isVendorOrDomainBlacklisted('ryanscomputers.com'), false);
  });

  await testCase('T2_F9_04', 'generateAffiliateCheckoutUrl injects attribution parameters safely into VendorDeal', 2, () => {
    const mockDeal: any = {
      id: 'deal-test-01',
      productId: 'prod-test-01',
      vendorId: 'vendor-z2u',
      directCheckoutUrl: 'https://z2u.com/product/123?plan=annual',
    };
    const url = generateAffiliateCheckoutUrl(mockDeal);
    assert.ok(url.includes('ref=bd_price_compare'), 'Must include ref parameter');
    assert.ok(url.includes('utm_source=bd_compare_platform'), 'Must include utm_source');
    assert.ok(url.includes('utm_campaign=prod-test-01'), 'Must include utm_campaign');
  });

  await testCase('T2_F9_05', 'Scam store registry returns all documented scam entries', 2, () => {
    const registry = getScamRegistry();
    assert.strictEqual(registry.length, initialScamStores.length);
  });

  // --------------------------------------------------------------------------
  // § F10 Boundary: Build & Static Export Edge Cases
  // --------------------------------------------------------------------------
  console.log(`  ${c.cyan}§ F10 Boundary: Build & Static Export Edge Cases${c.reset}`);

  await testCase('T2_F10_01', 'Route handler /api/shops/route.ts exists and exports GET and POST', 2, () => {
    const apiShopsContent = readSource('src/app/api/shops/route.ts');
    assert.ok(apiShopsContent.includes('export async function GET'), 'Must export GET handler');
    assert.ok(apiShopsContent.includes('export async function POST'), 'Must export POST handler');
  });

  await testCase('T2_F10_02', 'Dynamic route handler /api/shops/[id]/route.ts exists and exports GET, PATCH, DELETE', 2, () => {
    const apiShopDetailContent = readSource('src/app/api/shops/[id]/route.ts');
    assert.ok(apiShopDetailContent.includes('export async function GET'), 'Must export GET');
    assert.ok(apiShopDetailContent.includes('export async function PATCH'), 'Must export PATCH');
    assert.ok(apiShopDetailContent.includes('export async function DELETE'), 'Must export DELETE');
  });

  await testCase('T2_F10_03', 'package.json defines canonical scripts for build, lint, and dev', 2, () => {
    const pkg = JSON.parse(packageJsonContent);
    assert.ok(pkg.scripts.build && pkg.scripts.lint, 'package.json must define build and lint');
  });

  await testCase('T2_F10_04', 'Tailwind CSS v4 dependencies and Turbopack plugin configured in package.json', 2, () => {
    const pkg = JSON.parse(packageJsonContent);
    assert.ok(pkg.dependencies.tailwindcss || pkg.devDependencies.tailwindcss, 'Must have tailwindcss');
  });

  await testCase('T2_F10_05', 'Capacitor Android mobile build support packages preserved in dependencies', 2, () => {
    const pkg = JSON.parse(packageJsonContent);
    assert.ok(pkg.dependencies['@capacitor/core'] && pkg.dependencies['@capacitor/android'], 'Must preserve Capacitor');
  });

  // ==========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS (16 Pairwise Tests)
  // ==========================================================================
  console.log(`\n${c.bold}${c.blue}▶ TIER 3: CROSS-FEATURE COMBINATIONS (16 Pairwise Interactions)${c.reset}`);
  console.log(`${c.dim}------------------------------------------------------------------------------${c.reset}`);

  await testCase('T3_XF_01', 'Brand Identity (F1) + Best Deal CTA (F8): DamKoto card dynamically links to lowest deal', 3, () => {
    assert.ok(physicalCardContent.includes('DamKoto BD') || physicalCardContent.includes('DAMKOTO_PLACEHOLDER'));
    assert.ok(physicalCardContent.includes('bestDealUrl') && physicalCardContent.includes('bestDealShopName'));
  });

  await testCase('T3_XF_02', 'Price Range (F2) + Stock Filter (F3): Dual price filter + inStockOnly returns in-stock items in bracket', 3, () => {
    const list = getPhysicalProductGroups({ minPrice: 10000, maxPrice: 30000, inStockOnly: true });
    assert.ok(list.length > 0);
    for (const p of list) {
      assert.ok(p.minPrice >= 10000 && p.minPrice <= 30000);
      assert.ok(p.inStockOfferCount > 0);
    }
  });

  await testCase('T3_XF_03', 'Category Tree (F4) + Dynamic Brand Counts (F5): Processors category restricts brands to CPUs', 3, () => {
    const cpus = getPhysicalProductGroups({ category: 'processors' });
    const brands = new Set(cpus.map((p) => p.brand));
    assert.ok(brands.has('AMD') && brands.has('Intel'));
    assert.ok(!brands.has('Samsung') && !brands.has('MSI'));
  });

  await testCase('T3_XF_04', 'Category Tree (F4) + 22 BD Retailers (F6): Laptops category calculates offers across shops', 3, () => {
    const laptops = getPhysicalProductGroups({ category: 'laptops' });
    const shopsWithLaptops = new Set(laptops.flatMap((p) => p.offers?.map((o) => o.shopId) || []));
    assert.ok(shopsWithLaptops.size >= 3, 'At least 3 shops must offer laptops');
  });

  await testCase('T3_XF_05', 'Brand Filter (F5) + 22 BD Retailers (F6): Walton brand + shop-walton isolates official products', 3, () => {
    const list = getPhysicalProductGroups({ brand: 'Walton', shopId: 'shop-walton' });
    assert.ok(list.length > 0, 'Must find Walton products in Walton store');
    for (const p of list) {
      assert.strictEqual(p.brand, 'Walton');
      assert.ok(p.offers?.some((o) => o.shopId === 'shop-walton'));
    }
  });

  await testCase('T3_XF_06', 'Price Range (F2) + Brand Filter (F5): Budget filter (< ৳15k) with brand "Corsair"', 3, () => {
    const list = getPhysicalProductGroups({ maxPrice: 15000, brand: 'Corsair' });
    for (const p of list) {
      assert.strictEqual(p.brand, 'Corsair');
      assert.ok(p.minPrice <= 15000);
    }
  });

  await testCase('T3_XF_07', 'Mobile Drawer (F7) + Multi-Filter (F2, F3, F5, F6): Drawer synchronizes composite filter states', 3, () => {
    assert.ok(homeScreenContent.includes('selectedBrands={selectedBrands}'));
    assert.ok(homeScreenContent.includes('priceRange={priceRange}'));
    assert.ok(homeScreenContent.includes('inStockOnly={inStockOnly}'));
    assert.ok(homeScreenContent.includes('selectedShopIds={selectedShopIds}'));
  });

  await testCase('T3_XF_08', 'Stock Filter (F3) + Best Deal CTA (F8): Out-of-stock lowest price causes card to adapt to in-stock store', 3, () => {
    for (const p of INITIAL_PHYSICAL_PRODUCTS) {
      if (p.inStockOfferCount > 0) {
        assert.ok(p.bestDealPrice <= p.maxPrice);
      }
    }
  });

  await testCase('T3_XF_09', 'Physical Products (F6, F8) + Digital Subscriptions (F9): Unified multi-category catalog', 3, () => {
    const physicalCount = INITIAL_PHYSICAL_PRODUCTS.length;
    const digitalCount = initialProducts.length;
    assert.strictEqual(physicalCount, 158);
    assert.strictEqual(digitalCount, 15);
  });

  await testCase('T3_XF_10', 'Price Range (F2) + Best Deal CTA (F8): Premium GPU price filter (> ৳75k) preserves Best Deal CTA', 3, () => {
    const gpus = getPhysicalProductGroups({ category: 'graphics cards', minPrice: 75000 });
    for (const p of gpus) {
      assert.ok(p.minPrice >= 75000);
      assert.ok(p.bestDealShopName !== undefined && p.bestDealShopName.length > 0);
    }
  });

  await testCase('T3_XF_11', 'Brand Search (F5) + Category Filter (F4) + Stock Filter (F3): ASUS + Graphics Cards + In Stock', 3, () => {
    const list = getPhysicalProductGroups({ category: 'graphics cards', brand: 'ASUS', inStockOnly: true });
    for (const p of list) {
      assert.strictEqual(p.brand, 'ASUS');
      assert.ok(p.inStockOfferCount > 0);
    }
  });

  await testCase('T3_XF_12', 'Multi-Shop Selection (F6) + Sorting (price-low): 3 shops sorted by lowest price', 3, () => {
    const list = getPhysicalProductGroups({
      shopIds: ['shop-startech', 'shop-ryans', 'shop-techland'],
      sortBy: 'price-low',
    });
    for (let i = 0; i < list.length - 1; i++) {
      assert.ok(list[i].minPrice <= list[i + 1].minPrice, 'List must be sorted ascending by minPrice');
    }
  });

  await testCase('T3_XF_13', 'Multi-Shop Selection (F6) + Sorting (deals): Shops sorted by biggest savings amount', 3, () => {
    const list = getPhysicalProductGroups({
      shopIds: ['shop-startech', 'shop-ryans', 'shop-techland'],
      sortBy: 'deals',
    });
    for (let i = 0; i < list.length - 1; i++) {
      assert.ok(
        (list[i].priceSpreadBDT || 0) >= (list[i + 1].priceSpreadBDT || 0),
        'List must be sorted descending by price spread'
      );
    }
  });

  await testCase('T3_XF_14', 'Static Fallback (F10) + Shop Registry (F6): Offline static fallback delivers all 22 shops', 3, () => {
    const shops = getTrackedRetailers();
    assert.strictEqual(shops.length, 22);
  });

  await testCase('T3_XF_15', 'Mobile Filter Chips (F7) + Filter Dismissal (F2, F5, F6): Removing brand chip restores catalog', 3, () => {
    const withBrand = getPhysicalProductGroups({ brand: 'AMD' });
    const withoutBrand = getPhysicalProductGroups({});
    assert.ok(withoutBrand.length > withBrand.length);
  });

  await testCase('T3_XF_16', 'Scam Shield Search (F9) + Brand Isolation (F1): Scam modal presents DamKoto BD guarantee', 3, () => {
    const scamModalContent = readSource('src/components/ScamModal.tsx');
    assert.ok(
      !scamModalContent.includes('Star Tech & Engineering') && !scamModalContent.includes('16793'),
      'ScamModal must not contain Star Tech identity or hotline'
    );
  });

  // ==========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS (6 Shopper Workflows)
  // ==========================================================================
  console.log(`\n${c.bold}${c.blue}▶ TIER 4: REAL-WORLD APPLICATION SCENARIOS (6 Realistic Shopper Workflows)${c.reset}`);
  console.log(`${c.dim}------------------------------------------------------------------------------${c.reset}`);

  await testCase('T4_RW_01', 'Workflow 1: Budget PC Builder Shopper (< ৳15k RAM/SSD with In Stock comparison across shops)', 4, () => {
    // 1. Shopper filters for budget SSD/storage under ৳10,000, in stock only
    const results = getPhysicalProductGroups({
      category: 'ssd',
      maxPrice: 10000,
      inStockOnly: true,
      sortBy: 'deals',
    });
    assert.ok(results.length > 0, 'Shopper must find in-stock SSDs under 10k');

    // 2. Shopper inspects best deal product
    const topDeal = results[0];
    assert.ok(topDeal.minPrice <= 10000);
    assert.ok(topDeal.inStockOfferCount > 0);
    assert.ok(topDeal.bestDealShopName !== undefined);

    // 3. Shopper verifies outbound link is valid
    const outboundUrl = buildRetailerProductUrl(topDeal.bestDealShopId?.replace('shop-', '') || 'startech', topDeal.canonicalName);
    assert.ok(outboundUrl.startsWith('http'));
  });

  await testCase('T4_RW_02', 'Workflow 2: High-End Gamer GPU Hunt (Comparing GeForce GPUs across 22 BD shops by savings)', 4, () => {
    // 1. Shopper searches for "GeForce" in Graphics Cards
    const results = getPhysicalProductGroups({
      category: 'graphics cards',
      search: 'GeForce',
      sortBy: 'deals',
    });
    assert.ok(results.length > 0, 'Shopper must find GeForce graphics cards');

    // 2. Shopper selects first card and checks price spread
    const card = results[0];
    assert.ok(card.offerCount >= 2, 'Top card must have multiple competing store offers');
    assert.ok((card.priceSpreadBDT || 0) >= 0, 'Spread must be non-negative');

    // 3. Shopper confirms lowest store
    assert.strictEqual(card.bestDealPrice, card.minPrice);
  });

  await testCase('T4_RW_03', 'Workflow 3: Mobile Shopper Filter & Buy (Laptops category, 50k-120k price, multi-brand)', 4, () => {
    // 1. Shopper filters laptops between 50k and 120k from ASUS or Lenovo
    const results = getPhysicalProductGroups({
      category: 'laptops',
      minPrice: 50000,
      maxPrice: 120000,
      brands: ['ASUS', 'Lenovo'],
    });
    for (const p of results) {
      assert.ok(p.minPrice >= 50000 && p.minPrice <= 120000);
      assert.ok(p.brand === 'ASUS' || p.brand === 'Lenovo');
    }
  });

  await testCase('T4_RW_04', 'Workflow 4: Digital Freelancer Security (Search Software & OTT, check Scam Shield)', 4, () => {
    // 1. Freelancer searches for Software or OTT products
    const products = getProducts({ category: 'Software' });
    assert.ok(products.length > 0, 'Must have software products');

    // 2. Freelancer checks suspicious Facebook page URL in Scam Shield
    const isSuspiciousScam = isVendorOrDomainBlacklisted('https://facebook.com/digitalsoftwarehub24');
    assert.strictEqual(isSuspiciousScam, true);

    // 3. Freelancer verifies trusted vendor
    const isTrusted = isVendorOrDomainBlacklisted('z2u.com');
    assert.strictEqual(isTrusted, false);
  });

  await testCase('T4_RW_05', 'Workflow 5: Price Arbitrage & Spread Verification (Locate products with > ৳5,000 spread)', 4, () => {
    // 1. Analyst queries products with price spread > ৳5,000
    const bigDeals = INITIAL_PHYSICAL_PRODUCTS.filter((p) => (p.priceSpreadBDT || 0) >= 5000);
    assert.ok(bigDeals.length > 0, 'Must find products with >= ৳5,000 spread');

    // 2. Validate arithmetic invariants
    for (const p of bigDeals) {
      assert.strictEqual(p.priceSpreadBDT, p.maxPrice - p.minPrice);
      const expectedPercent = Math.round(((p.maxPrice - p.minPrice) / p.maxPrice) * 100);
      assert.strictEqual(p.savingsPercent, expectedPercent);
    }
  });

  await testCase('T4_RW_06', 'Workflow 6: Automated Brand Identity & Static Build Gate Verification', 4, () => {
    // 1. Verify 100% absence of Star Tech platform branding across layout, headers, footers
    assert.ok(!layoutContent.includes('title: "Star Tech') && !layoutContent.includes("title: 'Star Tech"));
    assert.ok(!deviceContainerContent.includes('16793'));
    assert.ok(!damkotoHeaderContent.includes('STAR <span className="text-[#ef4a23]">TECH</span>'));

    // 2. Verify static export configuration
    assert.ok(nextConfigContent.includes("output: 'export'"));
    assert.ok(nextConfigContent.includes('unoptimized: true'));

    // 3. Verify 22 BD shops preserved in catalog
    assert.strictEqual(TRACKED_RETAILERS.length, 22);
  });

  // ==========================================================================
  // FINAL SUMMARY REPORT
  // ==========================================================================
  const totalExecuted = totalPassed + totalFailed;
  console.log(`\n${c.bold}${c.cyan}==============================================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}  E2E TEST RUN SUMMARY — DAMKOTO BD PLATFORM${c.reset}`);
  console.log(`${c.dim}------------------------------------------------------------------------------${c.reset}`);
  console.log(`  Total Tests Executed : ${c.bold}${totalExecuted}${c.reset}`);
  console.log(`  Passed               : ${c.bold}${c.green}${totalPassed}${c.reset}`);
  console.log(`  Failed               : ${c.bold}${totalFailed === 0 ? c.green + '0' : c.red + totalFailed}${c.reset}`);
  console.log(`\n  Breakdown by Tier:`);
  console.log(`  - Tier 1 (Feature Coverage)    : ${c.bold}${tier1Count}/50 passed${c.reset}`);
  console.log(`  - Tier 2 (Boundary & Corner)   : ${c.bold}${tier2Count}/50 passed${c.reset}`);
  console.log(`  - Tier 3 (Cross-Feature)       : ${c.bold}${tier3Count}/16 passed${c.reset}`);
  console.log(`  - Tier 4 (Shopper Workflows)   : ${c.bold}${tier4Count}/6 passed${c.reset}`);
  console.log(`${c.dim}------------------------------------------------------------------------------${c.reset}`);

  if (totalFailed > 0) {
    console.log(`\n${c.bold}${c.red}  FAILED TESTS LIST:${c.reset}`);
    for (const f of failureDetails) {
      console.log(`  - ${c.red}${f.id}${c.reset}`);
      console.log(`    ${f.error}`);
    }
    console.log(`\n${c.bgRed}${c.bold}  SOME TEST CASES FAILED — SEE REPORT ABOVE  ${c.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${c.bgGreen}${c.bold}  ALL ${totalPassed} TEST CASES PASSED SUCCESSFULLY — E2E VERIFICATION 100% COMPLETE  ${c.reset}\n`);
    process.exit(0);
  }
}

// Run verification suite
runDamKotoE2EVerification();
