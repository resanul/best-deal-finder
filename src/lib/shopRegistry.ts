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
    ],
  },
  'ryans.com': {
    name: 'Ryans Computers',
    slug: 'ryans',
    adapterType: 'ryans',
    logoUrl: 'https://www.ryanscomputers.com/assets/images/ryans-logo.svg',
    categoryUrls: [
      'https://www.ryanscomputers.com/category/desktop-component-processor',
      'https://www.ryanscomputers.com/category/desktop-component-graphics-card',
      'https://www.ryanscomputers.com/category/desktop-component-ram',
    ],
  },
  'globalbrand.com.bd': {
    name: 'Global Brand',
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
    name: 'Walton',
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
  'techlandbd.com': {
    name: 'Techland BD',
    slug: 'techland',
    adapterType: 'techland',
    logoUrl: 'https://www.techlandbd.com/image/catalog/logo/techland-logo.png',
    categoryUrls: [
      'https://www.techlandbd.com/processor',
      'https://www.techlandbd.com/graphics-card',
      'https://www.techlandbd.com/laptop-computer/brand-laptops',
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
  'techmenia.com.bd': {
    name: 'Techmenia BD',
    slug: 'techmenia',
    adapterType: 'techland',
    logoUrl: 'https://www.techlandbd.com/image/catalog/logo/techland-logo.png',
    categoryUrls: [
      'https://www.techmenia.com.bd/processor',
    ],
  },
};

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
