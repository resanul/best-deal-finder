/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * 3-Layer Product Matching & Multi-Vendor Comparison Engine
 * 
 * Location: src/lib/productMatcher.ts
 * Architecture:
 * - Layer 1: Deterministic MPN / Part Number Match (Confidence: 1.0)
 * - Layer 2: Domain-Specific Spec Vector & Model Key Match with Hard Negative Suffix Guards (Confidence: 0.95)
 * - Layer 3: Normalized Token Jaccard Similarity (Auto-Match: >= 0.82, Review Queue: 0.65 - 0.81, Create New: < 0.65)
 * - Dynamic Multi-Vendor Price Spread & Best Deal Calculation
 */

import db, {
  rowToProductGroup,
  productGroupToRow,
  scrapedProductToRow,
} from '@/lib/db';
import {
  ProductGroup,
  ProductGroupRow,
  ScrapedProduct,
  ScrapedProductRow,
  VendorOffer,
} from '@/types/physicalGoods';

// ============================================================================
// 1. NORMALIZATION & SANITIZATION
// ============================================================================

export function sanitizeTitle(raw: string): string {
  if (!raw) return '';
  return raw
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[®™#]/g, ' ')
    .replace(/\b(?:boxed|with cooler|official warranty|price in bd|desktop|processor|graphics card|ram|ssd)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractMpn(rawTitle: string): string | null {
  if (!rawTitle) return null;

  const match = rawTitle.match(/#([A-Za-z0-9\-]+)/);
  if (match) return match[1].toUpperCase();

  // AMD Part numbers (e.g. 100-100000927BOX)
  const amdPart = rawTitle.match(/\b(100-[0-9]{9}[A-Z]{0,3})\b/i);
  if (amdPart) return amdPart[1].toUpperCase();

  // Corsair Part numbers (e.g. CMK8GX4M1E3200C16)
  const corsairPart = rawTitle.match(/\b(CM[A-Z0-9]{12,16})\b/i);
  if (corsairPart) return corsairPart[1].toUpperCase();

  // Zotac Part numbers (e.g. ZT-D40600E-10M)
  const zotacPart = rawTitle.match(/\b(ZT-[A-Z0-9\-]{8,14})\b/i);
  if (zotacPart) return zotacPart[1].toUpperCase();

  return null;
}

export function extractModelSignature(rawTitle: string): {
  brand: string | null;
  modelCode: string | null;
  suffix: string | null;
  capacity: string | null;
} {
  if (!rawTitle) {
    return { brand: null, modelCode: null, suffix: null, capacity: null };
  }
  const lower = rawTitle.toLowerCase();

  // 1. Brand Detection
  let brand: string | null = null;
  const brands = [
    'amd', 'intel', 'asus', 'msi', 'gigabyte', 'zotac', 'corsair',
    'walton', 'acer', 'hp', 'dell', 'lenovo', 'samsung', 'kingston'
  ];
  for (const b of brands) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(lower)) {
      brand = b.toUpperCase();
      break;
    }
  }

  // 2. Model Code & Suffix Detection
  let modelCode: string | null = null;
  let suffix: string | null = null;

  // CPU detection (e.g. Ryzen 5 5600, 5600X, 5600G, Core i5 13400)
  const cpuMatch = lower.match(/ryzen\s*[3579]\s*([0-9]{4,5})([a-z]{1,3})?/i);
  if (cpuMatch) {
    modelCode = `RYZEN_${cpuMatch[1]}`;
    suffix = cpuMatch[2] ? cpuMatch[2].toUpperCase() : 'BASE';
  } else {
    const intelMatch = lower.match(/core\s*i[3579]-?([0-9]{4,5})([a-z]{1,2})?/i);
    if (intelMatch) {
      modelCode = `CORE_I_${intelMatch[1]}`;
      suffix = intelMatch[2] ? intelMatch[2].toUpperCase() : 'BASE';
    }
  }

  // GPU detection (e.g. RTX 4060, 4060 Ti, RTX 4070, 3060)
  const gpuMatch = lower.match(/(?:rtx|gtx)\s*([0-9]{3,4})(?:\s*(ti|super))?/i);
  if (gpuMatch) {
    modelCode = `RTX_${gpuMatch[1]}`;
    suffix = gpuMatch[2] ? gpuMatch[2].toUpperCase() : 'BASE';
  }

  // Monitor detection (e.g. Odyssey G5, G24F 2)
  const monitorMatch = lower.match(/(?:odyssey\s*g[3579]|g24f(?:\s*2)?)/i);
  if (monitorMatch) {
    modelCode = monitorMatch[0].replace(/\s+/g, '_').toUpperCase();
    suffix = 'BASE';
  }

  // 3. Capacity Detection (e.g. 8GB, 16GB, 32GB, 512GB, 1TB)
  let capacity: string | null = null;
  const capMatch = lower.match(/\b([0-9]{1,3}\s*(?:gb|tb))\b/i);
  if (capMatch) {
    capacity = capMatch[1].replace(/\s+/g, '').toUpperCase();
  }

  return { brand, modelCode, suffix, capacity };
}

export function calculateTokenJaccard(a: string, b: string): number {
  const setA = new Set(sanitizeTitle(a).split(' ').filter(t => t.length > 1));
  const setB = new Set(sanitizeTitle(b).split(' ').filter(t => t.length > 1));

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 0;
  return intersection / union;
}

// ============================================================================
// 2. 3-LAYER EVALUATOR WITH HARD NEGATIVE GUARDS
// ============================================================================

export function evaluateProductMatch(
  newProduct: ScrapedProduct,
  targetGroup: { canonicalName: string; mpn?: string; brand?: string; model?: string }
): { match: boolean; confidence: number; reason: string } {
  // Layer 1: Deterministic MPN Match
  const newMpn = newProduct.mpn || extractMpn(newProduct.rawTitle);
  const targetMpn = targetGroup.mpn || extractMpn(targetGroup.canonicalName);
  if (newMpn && targetMpn && newMpn === targetMpn) {
    return { match: true, confidence: 1.0, reason: `Layer 1: Exact MPN Match [${newMpn}]` };
  }

  // Extract Model Signatures
  const sigA = extractModelSignature(newProduct.rawTitle);
  const sigB = extractModelSignature(targetGroup.canonicalName);

  // Hard Negative Constraints (Instant Disqualification)
  if (sigA.brand && sigB.brand && sigA.brand !== sigB.brand) {
    return { match: false, confidence: 0.0, reason: `Hard Negative: Brand Mismatch [${sigA.brand} != ${sigB.brand}]` };
  }
  if (sigA.modelCode && sigB.modelCode && sigA.modelCode !== sigB.modelCode) {
    return { match: false, confidence: 0.0, reason: `Hard Negative: Model Family Mismatch [${sigA.modelCode} != ${sigB.modelCode}]` };
  }
  if (sigA.suffix && sigB.suffix && sigA.suffix !== sigB.suffix) {
    return { match: false, confidence: 0.0, reason: `Hard Negative: Model Suffix Mismatch [${sigA.suffix} != ${sigB.suffix}]` };
  }
  if (sigA.capacity && sigB.capacity && sigA.capacity !== sigB.capacity) {
    return { match: false, confidence: 0.0, reason: `Hard Negative: Capacity Mismatch [${sigA.capacity} != ${sigB.capacity}]` };
  }

  // Layer 2: Domain-Specific Spec Vector & Model Key Match
  if (
    sigA.brand && sigB.brand && sigA.brand === sigB.brand &&
    sigA.modelCode && sigB.modelCode && sigA.modelCode === sigB.modelCode &&
    sigA.suffix === sigB.suffix
  ) {
    return { match: true, confidence: 0.95, reason: 'Layer 2: Domain Spec Vector & Model Key Match' };
  }

  // Layer 3: Token Jaccard Similarity
  const jaccard = calculateTokenJaccard(newProduct.rawTitle, targetGroup.canonicalName);
  if (jaccard >= 0.82) {
    return { match: true, confidence: jaccard, reason: `Layer 3: Token Jaccard Auto-Match (${jaccard.toFixed(2)})` };
  }
  if (jaccard >= 0.65) {
    return { match: false, confidence: jaccard, reason: `Layer 3: Routed to Unmatched Triage Queue (${jaccard.toFixed(2)})` };
  }

  return { match: false, confidence: jaccard, reason: `Layer 3: Below Similarity Threshold (${jaccard.toFixed(2)})` };
}

// ============================================================================
// 3. MULTI-VENDOR PRICE SPREAD & BEST DEAL METRICS
// ============================================================================

export function computePriceMetrics(offers: VendorOffer[]): {
  minPrice: number;
  maxPrice: number;
  priceSpreadBDT: number;
  savingsPercent: number;
  bestDealShopId: string;
  bestDealShopName: string;
  bestDealPrice: number;
  offerCount: number;
  inStockOfferCount: number;
} {
  const activeOffers = offers.filter(o => o.inStock && o.priceBDT > 0);
  const allValidOffers = offers.filter(o => o.priceBDT > 0);

  if (allValidOffers.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 0,
      priceSpreadBDT: 0,
      savingsPercent: 0,
      bestDealShopId: '',
      bestDealShopName: '',
      bestDealPrice: 0,
      offerCount: 0,
      inStockOfferCount: 0,
    };
  }

  // Prefer in-stock deals for best price, fallback to all valid offers
  const eligibleDeals = activeOffers.length > 0 ? activeOffers : allValidOffers;

  let minOffer = eligibleDeals[0];
  let maxPrice = 0;

  for (const offer of allValidOffers) {
    if (offer.priceBDT > maxPrice) maxPrice = offer.priceBDT;
  }
  for (const offer of eligibleDeals) {
    if (offer.priceBDT < minOffer.priceBDT) {
      minOffer = offer;
    }
  }

  const minPrice = minOffer.priceBDT;
  const priceSpreadBDT = Math.max(0, maxPrice - minPrice);
  const savingsPercent = maxPrice > 0 ? Math.round((priceSpreadBDT / maxPrice) * 100) : 0;

  return {
    minPrice,
    maxPrice,
    priceSpreadBDT,
    savingsPercent,
    bestDealShopId: minOffer.shopId,
    bestDealShopName: minOffer.shopName,
    bestDealPrice: minPrice,
    offerCount: offers.length,
    inStockOfferCount: activeOffers.length,
  };
}

// ============================================================================
// 4. DATABASE MATCHER & PERSISTENCE
// ============================================================================

export function matchAndPersistScrapedProduct(scraped: ScrapedProduct): {
  action: 'AUTO_MATCH' | 'QUEUE_UNMATCHED' | 'CREATE_NEW';
  groupId: string;
  confidence: number;
} {
  // 1. Fetch all existing canonical product groups
  const groupRows = db.prepare('SELECT * FROM product_groups').all() as ProductGroupRow[];
  const groups = groupRows.map(rowToProductGroup);

  let bestMatchGroup: ProductGroup | null = null;
  let highestConfidence = 0;

  for (const group of groups) {
    const evaluation = evaluateProductMatch(scraped, {
      canonicalName: group.canonicalName,
      brand: group.brand,
      model: group.model,
    });

    if (evaluation.confidence > highestConfidence) {
      highestConfidence = evaluation.confidence;
      bestMatchGroup = group;
    }
  }

  // Case A: High Confidence Match (>= 0.82)
  if (bestMatchGroup && highestConfidence >= 0.82) {
    scraped.productGroupId = bestMatchGroup.id;
    scraped.matchConfidence = highestConfidence;

    // Persist scraped product
    upsertScrapedProductDb(scraped);

    // Recompute group metrics
    recomputeProductGroupMetricsDb(bestMatchGroup.id);

    return {
      action: 'AUTO_MATCH',
      groupId: bestMatchGroup.id,
      confidence: highestConfidence,
    };
  }

  // Case B: Moderate Confidence (0.65 - 0.81) -> Triage Queue
  if (bestMatchGroup && highestConfidence >= 0.65) {
    upsertScrapedProductDb(scraped);

    // Enqueue to unmatched_queue
    db.prepare(`
      INSERT INTO unmatched_queue (
        id, scraped_product_id, suggested_group_id, similarity_score, status, created_at
      ) VALUES (?, ?, ?, ?, 'PENDING', datetime('now'))
    `).run(
      `uq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      scraped.id,
      bestMatchGroup.id,
      highestConfidence
    );

    return {
      action: 'QUEUE_UNMATCHED',
      groupId: bestMatchGroup.id,
      confidence: highestConfidence,
    };
  }

  // Case C: Below Threshold (< 0.65) -> Create New Canonical Group
  const sig = extractModelSignature(scraped.rawTitle);
  const brand = sig.brand || scraped.brand || 'Tech';
  const slug = generateProductSlug(scraped.cleanTitle || scraped.rawTitle);
  const newGroupId = `pg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newGroup: ProductGroup = {
    id: newGroupId,
    canonicalName: scraped.rawTitle,
    slug,
    brand,
    category: scraped.category || 'Tech & Electronics',
    model: sig.modelCode || scraped.cleanTitle,
    specs: scraped.specs || {},
    imageUrl: scraped.imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    minPrice: scraped.currentPrice,
    maxPrice: scraped.currentPrice,
    bestDealShopId: scraped.shopId,
    bestDealPrice: scraped.currentPrice,
    bestDealUrl: scraped.productUrl,
    offerCount: 1,
    inStockOfferCount: scraped.inStock ? 1 : 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO product_groups (
      id, canonical_name, slug, brand, category, model, specs_json,
      image_url, min_price, max_price, best_deal_shop_id, best_deal_price,
      best_deal_url, offer_count, in_stock_offer_count, created_at, updated_at
    ) VALUES (
      @id, @canonical_name, @slug, @brand, @category, @model, @specs_json,
      @image_url, @min_price, @max_price, @best_deal_shop_id, @best_deal_price,
      @best_deal_url, @offer_count, @in_stock_offer_count, @created_at, @updated_at
    )
  `).run(productGroupToRow(newGroup));

  scraped.productGroupId = newGroupId;
  scraped.matchConfidence = 1.0;
  upsertScrapedProductDb(scraped);

  return {
    action: 'CREATE_NEW',
    groupId: newGroupId,
    confidence: 1.0,
  };
}

export function upsertScrapedProductDb(sp: ScrapedProduct): void {
  const stmt = db.prepare(`
    INSERT INTO scraped_products (
      id, shop_id, product_group_id, raw_title, clean_title, product_url,
      image_url, current_price, original_price, availability, in_stock,
      mpn, brand, category, match_confidence, last_scraped_at, created_at
    ) VALUES (
      @id, @shop_id, @product_group_id, @raw_title, @clean_title, @product_url,
      @image_url, @current_price, @original_price, @availability, @in_stock,
      @mpn, @brand, @category, @match_confidence, @last_scraped_at, @created_at
    ) ON CONFLICT(product_url) DO UPDATE SET
      current_price = excluded.current_price,
      original_price = excluded.original_price,
      availability = excluded.availability,
      in_stock = excluded.in_stock,
      product_group_id = COALESCE(excluded.product_group_id, scraped_products.product_group_id),
      match_confidence = COALESCE(excluded.match_confidence, scraped_products.match_confidence),
      last_scraped_at = datetime('now')
  `);

  stmt.run(scrapedProductToRow(sp));

  // Record price history
  db.prepare(`
    INSERT INTO price_history (id, scraped_product_id, price, availability, recorded_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(`ph-${Date.now()}-${Math.floor(Math.random() * 1000)}`, sp.id, sp.currentPrice, sp.availability);
}

export function recomputeProductGroupMetricsDb(groupId: string): void {
  const rows = db.prepare(`
    SELECT sp.*, ts.name as shop_name, ts.logo_url as shop_logo
    FROM scraped_products sp
    JOIN tracked_shops ts ON sp.shop_id = ts.id
    WHERE sp.product_group_id = ?
  `).all(groupId) as (ScrapedProductRow & { shop_name: string; shop_logo: string })[];

  if (rows.length === 0) return;

  const offers: VendorOffer[] = rows.map(r => ({
    id: r.id,
    shopId: r.shop_id,
    shopName: r.shop_name,
    shopLogo: r.shop_logo,
    productUrl: r.product_url,
    priceBDT: r.current_price,
    originalPriceBDT: r.original_price ?? undefined,
    priceDiffFromBest: 0,
    availability: r.availability,
    inStock: r.in_stock === 1,
    lastVerifiedAt: r.last_scraped_at,
  }));

  const metrics = computePriceMetrics(offers);
  const bestOffer = offers.find(o => o.shopId === metrics.bestDealShopId) || offers[0];

  db.prepare(`
    UPDATE product_groups SET
      min_price = ?,
      max_price = ?,
      best_deal_shop_id = ?,
      best_deal_price = ?,
      best_deal_url = ?,
      offer_count = ?,
      in_stock_offer_count = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    metrics.minPrice,
    metrics.maxPrice,
    metrics.bestDealShopId,
    metrics.bestDealPrice,
    bestOffer?.productUrl || null,
    metrics.offerCount,
    metrics.inStockOfferCount,
    groupId
  );
}

function generateProductSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}
