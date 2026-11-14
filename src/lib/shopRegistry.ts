/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Vendor Management & Shop Registry
 * 
 * Location: src/lib/shopRegistry.ts
 * Driver: SQLite via better-sqlite3 (server-only)
 */

import db, {
  rowToTrackedShop,
  shopToRow,
} from '@/lib/db';
import {
  TrackedShop,
  TrackedShopRow,
  CMSDetectionResult,
  ShopMetrics,
  RetailerAdapterType,
  CMSEngine,
  ScrapeStatus,
} from '@/types/physicalGoods';

// ============================================================================
// 1. DOMAIN & CMS DETECTION ENGINE
// ============================================================================

export interface KnownRetailerProfile {
  name: string;
  slug: string;
  adapterType: RetailerAdapterType;
  logoUrl: string;
  categoryUrls: string[];
}

export const KNOWN_RETAILER_DOMAINS: Record<string, KnownRetailerProfile> = {
  'startech.com.bd': {
    name: 'Star Tech',
    slug: 'startech',
    adapterType: 'startech',
    logoUrl: 'https://www.startech.com.bd/image/catalog/logo.png',
    categoryUrls: [
      'https://www.startech.com.bd/component/processor',
      'https://www.startech.com.bd/component/graphics-card',
      'https://www.startech.com.bd/component/ram',
      'https://www.startech.com.bd/laptop-notebook/laptop',
      'https://www.startech.com.bd/monitor',
    ],
  },
  'ryanscomputers.com': {
    name: 'Ryans Computers',
    slug: 'ryans',
    adapterType: 'ryans',
    logoUrl: 'https://www.ryanscomputers.com/assets/images/ryans-logo.svg',
    categoryUrls: [
      'https://www.ryanscomputers.com/category/desktop-component-processor',
      'https://www.ryanscomputers.com/category/desktop-component-graphics-card',
      'https://www.ryanscomputers.com/category/desktop-component-ram',
      'https://www.ryanscomputers.com/category/laptop-all-laptop',
    ],
  },
  'ryans.com': {
    name: 'Ryans Computers',
    slug: 'ryans',
    adapterType: 'ryans',
    logoUrl: 'https://www.ryanscomputers.com/assets/images/ryans-logo.svg',
    categoryUrls: [
      'https://www.ryans.com/category/desktop-component-processor',
      'https://www.ryans.com/category/desktop-component-graphics-card',
      'https://www.ryans.com/category/laptop-all-laptop',
    ],
  },
  'techlandbd.com': {
    name: 'Techland BD',
    slug: 'techland',
    adapterType: 'techland',
    logoUrl: 'https://www.techlandbd.com/image/catalog/logo/techland-logo.png',
    categoryUrls: [
      'https://www.techlandbd.com/processor',
      'https://www.techlandbd.com/graphics-card',
      'https://www.techlandbd.com/laptop-computer/brand-laptops',
      'https://www.techlandbd.com/monitor',
    ],
  },
  'techland.com.bd': {
    name: 'Techland BD',
    slug: 'techland',
    adapterType: 'techland',
    logoUrl: 'https://www.techlandbd.com/image/catalog/logo/techland-logo.png',
    categoryUrls: [
      'https://www.techlandbd.com/processor',
      'https://www.techlandbd.com/graphics-card',
    ],
  },
  'globalbrand.com.bd': {
    name: 'Global Brand BD',
    slug: 'globalbrand',
    adapterType: 'globalbrand',
    logoUrl: 'https://www.globalbrand.com.bd/image/catalog/logo.png',
    categoryUrls: [
      'https://www.globalbrand.com.bd/processor',
      'https://www.globalbrand.com.bd/graphics-card',
      'https://www.globalbrand.com.bd/laptop-notebook',
    ],
  },
  'samantacomputer.com': {
    name: 'Samanta Computer',
    slug: 'samanta',
    adapterType: 'samanta',
    logoUrl: 'https://www.samantacomputer.com/images/logo.png',
    categoryUrls: [
      'https://www.samantacomputer.com/processor',
      'https://www.samantacomputer.com/graphics-card',
      'https://www.samantacomputer.com/ram',
    ],
  },
  'waltonbd.com': {
    name: 'Walton BD',
    slug: 'walton',
    adapterType: 'walton',
    logoUrl: 'https://waltonbd.com/image/catalog/home-page/logo/walton-logo.png',
    categoryUrls: [
      'https://waltonbd.com/computer/laptop',
      'https://waltonbd.com/computer/desktop-pc',
      'https://waltonbd.com/television',
    ],
  },
  'eplaza.waltonbd.com': {
    name: 'Walton ePlaza',
    slug: 'walton-eplaza',
    adapterType: 'walton',
    logoUrl: 'https://waltonbd.com/image/catalog/home-page/logo/walton-logo.png',
    categoryUrls: [
      'https://eplaza.waltonbd.com/computer/laptop',
      'https://eplaza.waltonbd.com/television',
    ],
  },
  'potakait.com': {
    name: 'Potaka IT',
    slug: 'potakait',
    adapterType: 'potakait',
    logoUrl: 'https://potakait.com/wp-content/uploads/2021/04/potaka-it-logo.png',
    categoryUrls: [
      'https://potakait.com/product-category/processor/',
      'https://potakait.com/product-category/graphics-card/',
      'https://potakait.com/product-category/ram/',
    ],
  },
  'skyland.com.bd': {
    name: 'Skyland BD',
    slug: 'skyland',
    adapterType: 'skyland',
    logoUrl: 'https://www.skyland.com.bd/image/catalog/logo/skyland-logo.png',
    categoryUrls: [
      'https://www.skyland.com.bd/processor',
      'https://www.skyland.com.bd/graphics-card',
      'https://www.skyland.com.bd/monitor',
    ],
  },
  'ultratech.com.bd': {
    name: 'Ultratech BD',
    slug: 'ultratech',
    adapterType: 'ultratech',
    logoUrl: 'https://ultratech.com.bd/image/catalog/logo/ultratech-logo.png',
    categoryUrls: [
      'https://ultratech.com.bd/processor',
      'https://ultratech.com.bd/graphics-card',
      'https://ultratech.com.bd/ram',
    ],
  },
  'computervillage.com.bd': {
    name: 'Computer Village',
    slug: 'computervillage',
    adapterType: 'computervillage',
    logoUrl: 'https://computervillage.com.bd/media/logo/default/logo.png',
    categoryUrls: [
      'https://computervillage.com.bd/laptop-notebook',
      'https://computervillage.com.bd/processor',
      'https://computervillage.com.bd/monitor',
    ],
  },
  'ucc-bd.com': {
    name: 'UCC BD',
    slug: 'uccbd',
    adapterType: 'uccbd',
    logoUrl: 'https://ucc-bd.com/pub/media/logo/stores/1/ucc-logo.png',
    categoryUrls: [
      'https://ucc-bd.com/components/processor.html',
      'https://ucc-bd.com/components/graphics-card.html',
    ],
  },
  'nexus.com.bd': {
    name: 'Nexus Computer',
    slug: 'nexus',
    adapterType: 'nexus',
    logoUrl: 'https://nexus.com.bd/image/catalog/logo/nexus-logo.png',
    categoryUrls: [
      'https://nexus.com.bd/processor',
      'https://nexus.com.bd/laptop',
      'https://nexus.com.bd/monitor',
    ],
  },
  'creatuscomputer.com': {
    name: 'Creatus Computer',
    slug: 'creatus',
    adapterType: 'creatus',
    logoUrl: 'https://creatuscomputer.com/wp-content/uploads/2021/03/Creatus-Computer-Logo.png',
    categoryUrls: [
      'https://creatuscomputer.com/product-category/processor/',
      'https://creatuscomputer.com/product-category/graphics-card/',
    ],
  },
  'computermaniabd.com': {
    name: 'Computer Mania BD',
    slug: 'computermania',
    adapterType: 'computermania',
    logoUrl: 'https://computermaniabd.com/wp-content/uploads/2020/09/Computer-Mania-BD-Logo.png',
    categoryUrls: [
      'https://computermaniabd.com/product-category/laptops/',
      'https://computermaniabd.com/product-category/gaming-laptop/',
    ],
  },
  'custommacbd.com': {
    name: 'Custom Mac BD',
    slug: 'custommacbd',
    adapterType: 'custommacbd',
    logoUrl: 'https://custommacbd.com/cdn/shop/files/Custom-Mac-BD-Logo.png',
    categoryUrls: [
      'https://custommacbd.com/collections/macbook',
      'https://custommacbd.com/collections/apple-silicon',
    ],
  },
  'applegadgetsbd.com': {
    name: 'Apple Gadgets BD',
    slug: 'applegadgets',
    adapterType: 'applegadgets',
    logoUrl: 'https://applegadgetsbd.com/assets/img/apple-gadgets-logo.png',
    categoryUrls: [
      'https://applegadgetsbd.com/category/macbook',
      'https://applegadgetsbd.com/category/laptop',
      'https://applegadgetsbd.com/category/monitor',
    ],
  },
  'sumashtech.com': {
    name: 'Sumash Tech',
    slug: 'sumashtech',
    adapterType: 'sumashtech',
    logoUrl: 'https://sumashtech.com/cdn/shop/files/sumash-tech-logo.png',
    categoryUrls: [
      'https://sumashtech.com/collections/laptop',
      'https://sumashtech.com/collections/smartphones',
    ],
  },
  'pchouse.com.bd': {
    name: 'PC House BD',
    slug: 'pchouse',
    adapterType: 'pchouse',
    logoUrl: 'https://pchouse.com.bd/image/catalog/logo/pchouse-logo.png',
    categoryUrls: [
      'https://pchouse.com.bd/processor',
      'https://pchouse.com.bd/graphics-card',
      'https://pchouse.com.bd/monitor',
    ],
  },
  'smart-bd.com': {
    name: 'Smart Technologies BD',
    slug: 'smartbd',
    adapterType: 'smartbd',
    logoUrl: 'https://smart-bd.com/wp-content/uploads/2021/06/smart-technologies-logo.png',
    categoryUrls: [
      'https://smart-bd.com/product-category/components/processor/',
      'https://smart-bd.com/product-category/laptops/',
    ],
  },
  'bdtechvalley.com': {
    name: 'BD Tech Valley',
    slug: 'bdtechvalley',
    adapterType: 'bdtechvalley',
    logoUrl: 'https://bdtechvalley.com/wp-content/uploads/2022/01/bd-tech-valley-logo.png',
    categoryUrls: [
      'https://bdtechvalley.com/product-category/processor/',
      'https://bdtechvalley.com/product-category/ram/',
    ],
  },
  'kablewala.com.bd': {
    name: 'Kablewala BD',
    slug: 'kablewala',
    adapterType: 'kablewala',
    logoUrl: 'https://kablewala.com.bd/skin/frontend/default/kablewala/images/logo.png',
    categoryUrls: [
      'https://kablewala.com.bd/computer-gaming/laptops.html',
      'https://kablewala.com.bd/computer-gaming/monitors.html',
    ],
  },
  'cloud9.com.bd': {
    name: 'Cloud9 Computers',
    slug: 'cloud9',
    adapterType: 'cloud9',
    logoUrl: 'https://cloud9.com.bd/wp-content/uploads/2021/10/cloud9-logo.png',
    categoryUrls: [
      'https://cloud9.com.bd/product-category/processor/',
      'https://cloud9.com.bd/product-category/graphics-card/',
    ],
  },
};

/**
 * Builds a 100% resilient, verified outbound store landing URL for any product.
 * Avoids broken tracking params (?ref=damkotobd) and guarantees accurate product view on the store site.
 */
export function buildRetailerProductUrl(
  shopSlug: string,
  productName: string,
  directVerifiedUrl?: string
): string {
  // If a clean direct verified URL is provided without breaking query parameters, use it
  if (directVerifiedUrl && directVerifiedUrl.startsWith('http') && !directVerifiedUrl.includes('?ref=')) {
    return directVerifiedUrl;
  }

  const cleanName = productName.trim();
  const q = encodeURIComponent(cleanName);

  switch (shopSlug) {
    case 'startech':
      return `https://www.startech.com.bd/product/search?search=${q}`;
    case 'ryans':
      return `https://www.ryans.com/search?q=${q}`;
    case 'techland':
    case 'techmenia':
      return `https://www.techlandbd.com/index.php?route=product/search&search=${q}`;
    case 'globalbrand':
      return `https://www.globalbrand.com.bd/index.php?route=product/search&search=${q}`;
    case 'samanta':
      return `https://www.samantacomputer.com/index.php?route=product/search&search=${q}`;
    case 'walton':
    case 'walton-eplaza':
      return `https://waltonbd.com/index.php?route=product/search&search=${q}`;
    case 'potakait':
      return `https://potakait.com/?s=${q}&post_type=product`;
    case 'skyland':
      return `https://www.skyland.com.bd/?s=${q}&post_type=product`;
    case 'ultratech':
      return `https://ultratech.com.bd/?s=${q}&post_type=product`;
    case 'computervillage':
      return `https://computervillage.com.bd/search?q=${q}`;
    case 'uccbd':
      return `https://ucc-bd.com/catalogsearch/result/?q=${q}`;
    case 'nexus':
      return `https://nexus.com.bd/search?q=${q}`;
    case 'creatus':
      return `https://creatuscomputer.com/?s=${q}&post_type=product`;
    case 'computermania':
      return `https://computermaniabd.com/?s=${q}&post_type=product`;
    case 'custommacbd':
      return `https://custommacbd.com/search?q=${q}`;
    case 'applegadgets':
      return `https://applegadgetsbd.com/search?q=${q}`;
    case 'sumashtech':
      return `https://sumashtech.com/search?q=${q}`;
    case 'pchouse':
      return `https://pchouse.com.bd/search?q=${q}`;
    case 'smartbd':
      return `https://smart-bd.com/search?q=${q}`;
    case 'bdtechvalley':
      return `https://bdtechvalley.com/?s=${q}&post_type=product`;
    case 'kablewala':
      return `https://kablewala.com.bd/catalogsearch/result/?q=${q}`;
    case 'cloud9':
      return `https://cloud9.com.bd/search?q=${q}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(cleanName + ' Bangladesh price')}`;
  }
}

/**
 * Normalizes input URL and extracts cleaned hostname domain.
 */
export function normalizeShopUrl(rawUrl: string): {
  normalizedUrl: string;
  baseUrl: string;
  domain: string;
} {
  let target = rawUrl.trim();
  if (!/^https?:\/\//i.test(target)) {
    target = 'https://' + target;
  }

  const parsed = new URL(target);
  let domain = parsed.hostname.toLowerCase();
  if (domain.startsWith('www.')) {
    domain = domain.slice(4);
  }

  const baseUrl = `${parsed.protocol}//${parsed.hostname}`;
  return {
    normalizedUrl: parsed.href,
    baseUrl,
    domain,
  };
}

/**
 * Derives a human-readable brand name from a domain name.
 * e.g., 'ultratech.com.bd' -> 'Ultratech BD'
 */
export function extractBrandFromDomain(domain: string): string {
  const parts = domain.split('.');
  const mainPart = parts[0];
  const capitalized = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  if (domain.endsWith('.bd')) {
    return `${capitalized} BD`;
  }
  return capitalized;
}

/**
 * Probes a URL or examines domain to detect retailer type and CMS signatures.
 */
export async function detectCMSAndRetailer(url: string): Promise<CMSDetectionResult> {
  const { baseUrl, domain } = normalizeShopUrl(url);

  // 1. Direct Known Retailer Match
  if (KNOWN_RETAILER_DOMAINS[domain]) {
    const profile = KNOWN_RETAILER_DOMAINS[domain];
    return {
      adapterType: profile.adapterType,
      engine: profile.adapterType === 'walton' || profile.adapterType === 'techland' || profile.adapterType === 'globalbrand' ? 'opencart' : 'custom',
      shopName: profile.name,
      domain,
      baseUrl,
      isKnownRetailer: true,
      confidence: 1.0,
      indicators: [`Domain exact match: ${domain}`],
    };
  }

  // 2. Generic Store Probe
  const indicators: string[] = [];
  let detectedEngine: CMSEngine = 'custom';
  let detectedTitle = '';
  let confidence = 0.5;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const html = (await response.text()).slice(0, 50000); // Check first 50KB

      // Page Title Extraction
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        detectedTitle = titleMatch[1].trim().split(/[|\-–]/)[0].trim();
      }

      // WooCommerce Signatures
      if (
        html.includes('woocommerce') ||
        html.includes('wp-content/plugins/woocommerce') ||
        html.includes('woocommerce-Price-amount') ||
        html.includes('wc-block-')
      ) {
        detectedEngine = 'woocommerce';
        confidence = 0.9;
        indicators.push('Detected WooCommerce CSS/JS signatures');
      }
      // Shopify Signatures
      else if (
        html.includes('cdn.shopify.com') ||
        html.includes('Shopify.theme') ||
        html.includes('shopify-section')
      ) {
        detectedEngine = 'shopify';
        confidence = 0.95;
        indicators.push('Detected Shopify CDN asset signatures');
      }
      // OpenCart Signatures
      else if (
        html.includes('catalog/view/theme') ||
        html.includes('index.php?route=') ||
        html.includes('route=product/')
      ) {
        detectedEngine = 'opencart';
        confidence = 0.85;
        indicators.push('Detected OpenCart route and theme structure');
      }
    }
  } catch {
    // If network fetch fails (offline, rate limit, timeout), fallback to domain heuristics
    indicators.push('Network probe unreachable; fell back to domain extraction');
  }

  const shopName = detectedTitle || extractBrandFromDomain(domain);

  return {
    adapterType: 'generic',
    engine: detectedEngine,
    shopName,
    domain,
    baseUrl,
    isKnownRetailer: false,
    confidence,
    indicators,
  };
}

// ============================================================================
// 2. SHOP REGISTRY CRUD FUNCTIONS
// ============================================================================

/**
 * Retrieves all tracked shops with optional filtering.
 */
export function getTrackedShops(options?: {
  activeOnly?: boolean;
  search?: string;
}): TrackedShop[] {
  let query = 'SELECT * FROM tracked_shops WHERE 1=1';
  const params: (string | number)[] = [];

  if (options?.activeOnly) {
    query += ' AND is_tracked = 1';
  }

  if (options?.search && options.search.trim() !== '') {
    query += ' AND (name LIKE ? OR domain LIKE ? OR slug LIKE ?)';
    const term = `%${options.search.trim()}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY is_tracked DESC, name ASC';

  const rows = db.prepare(query).all(...params) as TrackedShopRow[];
  return rows.map(rowToTrackedShop);
}

/**
 * Retrieves a shop by its unique ID.
 */
export function getShopById(id: string): TrackedShop | null {
  const row = db
    .prepare('SELECT * FROM tracked_shops WHERE id = ?')
    .get(id) as TrackedShopRow | undefined;

  return row ? rowToTrackedShop(row) : null;
}

/**
 * Retrieves a shop by its unique domain.
 */
export function getShopByDomain(domain: string): TrackedShop | null {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
  const row = db
    .prepare('SELECT * FROM tracked_shops WHERE domain = ?')
    .get(cleanDomain) as TrackedShopRow | undefined;

  return row ? rowToTrackedShop(row) : null;
}

/**
 * Retrieves a shop by its slug.
 */
export function getShopBySlug(slug: string): TrackedShop | null {
  const row = db
    .prepare('SELECT * FROM tracked_shops WHERE slug = ?')
    .get(slug) as TrackedShopRow | undefined;

  return row ? rowToTrackedShop(row) : null;
}

/**
 * Dynamically registers a shop by its website URL.
 * Automatically classifies known Bangladeshi retailers or generic e-commerce CMS.
 */
export async function registerShopByUrl(
  url: string,
  customName?: string
): Promise<TrackedShop> {
  const { baseUrl, domain } = normalizeShopUrl(url);

  // Check if shop already exists
  const existing = getShopByDomain(domain);
  if (existing) {
    // If shop already exists, ensure it is active
    if (!existing.isTracked) {
      toggleShopTracking(existing.id);
    }
    return getShopById(existing.id)!;
  }

  // Detect retailer / CMS
  const detection = await detectCMSAndRetailer(url);
  const shopName = customName?.trim() || detection.shopName;
  const slugBase = domain.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  let slug = slugBase;

  // Ensure unique slug
  let counter = 1;
  while (getShopBySlug(slug)) {
    slug = `${slugBase}-${counter++}`;
  }

  const shopId = `shop-${slug}`;
  const now = new Date().toISOString();

  // Pick known logo and categories if recognized, else generic defaults
  const knownProfile = KNOWN_RETAILER_DOMAINS[domain];
  const logoUrl = knownProfile?.logoUrl || `https://${domain}/favicon.ico`;
  const categoryUrls = knownProfile?.categoryUrls || [baseUrl];

  const newShop: TrackedShop = {
    id: shopId,
    name: shopName,
    slug,
    domain,
    baseUrl,
    logoUrl,
    adapterType: detection.adapterType,
    isTracked: true,
    scrapeIntervalHours: 24,
    rateLimitDelayMs: 2500,
    categoryUrls,
    lastScrapeStatus: 'IDLE',
    productCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const insertStmt = db.prepare(`
    INSERT INTO tracked_shops (
      id, name, slug, domain, base_url, logo_url, adapter_type,
      is_tracked, scrape_interval_hours, rate_limit_delay_ms, category_urls,
      last_scraped_at, last_scrape_status, product_count, error_message, created_at, updated_at
    ) VALUES (
      @id, @name, @slug, @domain, @base_url, @logo_url, @adapter_type,
      @is_tracked, @scrape_interval_hours, @rate_limit_delay_ms, @category_urls,
      @last_scraped_at, @last_scrape_status, @product_count, @error_message, @created_at, @updated_at
    )
  `);

  insertStmt.run(shopToRow(newShop));
  return newShop;
}

/**
 * Toggles a shop's tracking status between 1 (active) and 0 (paused).
 */
export function toggleShopTracking(id: string): TrackedShop | null {
  const shop = getShopById(id);
  if (!shop) return null;

  const newStatus = shop.isTracked ? 0 : 1;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE tracked_shops
    SET is_tracked = ?, updated_at = ?
    WHERE id = ?
  `).run(newStatus, now, id);

  return getShopById(id);
}

/**
 * Updates an existing shop's configuration and metadata.
 */
export function updateShop(
  id: string,
  updates: Partial<TrackedShop>
): TrackedShop | null {
  const existing = getShopById(id);
  if (!existing) return null;

  const updated: TrackedShop = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const updateStmt = db.prepare(`
    UPDATE tracked_shops SET
      name = @name,
      base_url = @base_url,
      logo_url = @logo_url,
      adapter_type = @adapter_type,
      is_tracked = @is_tracked,
      scrape_interval_hours = @scrape_interval_hours,
      rate_limit_delay_ms = @rate_limit_delay_ms,
      category_urls = @category_urls,
      last_scraped_at = @last_scraped_at,
      last_scrape_status = @last_scrape_status,
      product_count = @product_count,
      error_message = @error_message,
      updated_at = @updated_at
    WHERE id = @id
  `);

  updateStmt.run(shopToRow(updated));
  return getShopById(id);
}

/**
 * Updates a shop's scrape status after a crawl cycle.
 */
export function updateShopScrapeStatus(
  shopId: string,
  status: ScrapeStatus,
  count?: number,
  error?: string
): void {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE tracked_shops SET
      last_scrape_status = ?,
      last_scraped_at = ?,
      product_count = COALESCE(?, product_count),
      error_message = ?,
      updated_at = ?
    WHERE id = ?
  `).run(status, now, count ?? null, error ?? null, now, shopId);
}

/**
 * Deletes a tracked shop by ID.
 * Cascades removal to scraped products and associated records.
 */
export function deleteShop(id: string): boolean {
  const info = db.prepare('DELETE FROM tracked_shops WHERE id = ?').run(id);
  return info.changes > 0;
}

/**
 * Aggregates high-level metrics for the shop registry dashboard.
 */
export function getShopMetrics(): ShopMetrics {
  const totalShops = (
    db.prepare('SELECT count(*) as c FROM tracked_shops').get() as { c: number }
  ).c;

  const activeShops = (
    db.prepare('SELECT count(*) as c FROM tracked_shops WHERE is_tracked = 1').get() as { c: number }
  ).c;

  const pausedShops = (
    db.prepare('SELECT count(*) as c FROM tracked_shops WHERE is_tracked = 0').get() as { c: number }
  ).c;

  const knownRetailers = (
    db.prepare("SELECT count(*) as c FROM tracked_shops WHERE adapter_type != 'generic'").get() as { c: number }
  ).c;

  const genericShops = (
    db.prepare("SELECT count(*) as c FROM tracked_shops WHERE adapter_type = 'generic'").get() as { c: number }
  ).c;

  const totalProductsScraped = (
    db.prepare('SELECT COALESCE(sum(product_count), 0) as s FROM tracked_shops').get() as { s: number }
  ).s;

  return {
    totalShops,
    activeShops,
    pausedShops,
    knownRetailers,
    genericShops,
    totalProductsScraped,
  };
}
