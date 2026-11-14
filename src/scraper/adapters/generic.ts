/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Generic Fallback Retailer Adapter (4-Tier Fallback Hierarchy)
 * 
 * Location: src/scraper/adapters/generic.ts
 * 
 * Hierarchy:
 * - Tier 1: Schema.org JSON-LD (<script type="application/ld+json">)
 * - Tier 2: OpenGraph Meta Tags (og:title, og:price:amount, og:image)
 * - Tier 3: HTML5 Microdata (itemscope itemtype="http://schema.org/Product")
 * - Tier 4: Cascading CSS Selectors (h1, .woocommerce-Price-amount, .price-item--regular, etc.)
 */

import {
  RetailerAdapter,
  ScrapedItem,
  ScrapeOptions,
  ScrapeResult,
  ScrapedProduct,
} from '../types';
import {
  parseBdtPrice,
  normalizeStockStatus,
  sanitizeTitle,
  generateScrapedProductId,
} from '../takaFormatter';
import { fetchWithStealth } from '../stealth';

/**
 * Tier 1: JSON-LD schema.org/Product extractor.
 */
export function parseGenericJsonLd(html: string, contextUrl = 'https://generic.store/item'): ScrapedItem | null {
  const matches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];

  for (const m of matches) {
    const jsonStr = m.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
    try {
      const data = JSON.parse(jsonStr);

      // Handle graph array or single product entity
      const entities = Array.isArray(data['@graph']) ? data['@graph'] : [data];

      for (const entity of entities) {
        const type = entity['@type'] || entity.type;
        if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) {
          const rawTitle = entity.name || '';
          const offers = Array.isArray(entity.offers) ? entity.offers[0] : entity.offers;

          let rawPrice = '';
          let availabilityStr = '';
          let offerUrl = '';

          if (offers) {
            rawPrice = String(offers.price || offers.lowPrice || '');
            availabilityStr = String(offers.availability || '');
            offerUrl = String(offers.url || '');
          }

          const currentPrice = parseBdtPrice(rawPrice);
          const productUrl = offerUrl.startsWith('http') ? offerUrl : contextUrl;
          const { availability, inStock } = normalizeStockStatus(availabilityStr, currentPrice);

          if (rawTitle && currentPrice > 0) {
            const brand = typeof entity.brand === 'object' ? entity.brand?.name : entity.brand;
            const mpn = entity.mpn || entity.sku;
            const img = Array.isArray(entity.image) ? entity.image[0] : entity.image;

            return {
              id: generateScrapedProductId('generic', productUrl),
              shopId: 'shop-generic',
              rawTitle,
              cleanTitle: sanitizeTitle(rawTitle),
              productUrl,
              imageUrl: typeof img === 'string' ? img : img?.url,
              currentPrice,
              availability,
              inStock,
              brand: brand ? String(brand) : undefined,
              mpn: mpn ? String(mpn) : undefined,
            };
          }
        }
      }
    } catch {
      // Malformed JSON-LD (e.g. edge_cases.html with trailing commas) -> cascade to next tier
    }
  }

  return null;
}

/**
 * Tier 2: OpenGraph Meta Tags extractor.
 */
export function parseGenericOpenGraph(html: string, contextUrl = 'https://generic.store/og-item'): ScrapedItem | null {
  const titleMatch = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                     html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:title["']/i);
  const priceMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:price:amount|product:price:amount)["']\s+content=["']([^"']+)["']/i) ||
                     html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:price:amount|product:price:amount)["']/i);
  const imageMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                     html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
  const availMatch = html.match(/<meta\s+(?:property|name)=["']product:availability["']\s+content=["']([^"']+)["']/i);

  if (titleMatch && priceMatch) {
    const rawTitle = titleMatch[1].trim();
    const currentPrice = parseBdtPrice(priceMatch[1]);
    const { availability, inStock } = normalizeStockStatus(availMatch ? availMatch[1] : undefined, currentPrice);

    if (rawTitle && currentPrice > 0) {
      return {
        id: generateScrapedProductId('generic', contextUrl),
        shopId: 'shop-generic',
        rawTitle,
        cleanTitle: sanitizeTitle(rawTitle),
        productUrl: contextUrl,
        imageUrl: imageMatch ? imageMatch[1] : undefined,
        currentPrice,
        availability,
        inStock,
      };
    }
  }

  return null;
}

/**
 * Tier 3: HTML5 Microdata extractor.
 */
export function parseGenericMicrodata(html: string, contextUrl = 'https://generic.store/microdata-item'): ScrapedItem | null {
  const nameMatch = html.match(/itemprop=["']name["'][^>]*>([^<]+)<\//i) ||
                    html.match(/content=["']([^"']+)["'][^>]*itemprop=["']name["']/i);
  const priceMatch = html.match(/itemprop=["']price["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/content=["']([^"']+)["'][^>]*itemprop=["']price["']/i) ||
                     html.match(/itemprop=["']price["'][^>]*>([^<]+)<\//i);
  const availMatch = html.match(/itemprop=["']availability["'][^>]*href=["']([^"']+)["']/i);
  const imgMatch = html.match(/itemprop=["']image["'][^>]*src=["']([^"']+)["']/i);

  if (nameMatch && priceMatch) {
    const rawTitle = (nameMatch[1] || nameMatch[0]).trim();
    const currentPrice = parseBdtPrice(priceMatch[1] || priceMatch[0]);
    const rawAvail = availMatch ? availMatch[1] : undefined;
    const { availability, inStock } = normalizeStockStatus(rawAvail, currentPrice);

    if (rawTitle && currentPrice > 0) {
      return {
        id: generateScrapedProductId('generic', contextUrl),
        shopId: 'shop-generic',
        rawTitle,
        cleanTitle: sanitizeTitle(rawTitle),
        productUrl: contextUrl,
        imageUrl: imgMatch ? imgMatch[1] : undefined,
        currentPrice,
        availability,
        inStock,
      };
    }
  }

  return null;
}

/**
 * Tier 4: Cascading CSS Selectors extractor.
 */
export function parseGenericCssCascade(html: string, contextUrl = 'https://generic.store/css-item'): ScrapedItem | null {
  const titleMatch = html.match(/<h1[^>]*class=["'][^"']*(?:product_title|product__title|entry-title|product-title|title)[^"']*["'][^>]*>([^<]+)<\/h1>/i) ||
                     html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

  // Check WooCommerce / Shopify / OpenCart / Generic price classes
  const priceMatch = html.match(/class=["'][^"']*(?:price-item--sale|woocommerce-Price-amount|price-new|price-item--regular|special-price|price)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|div|p|bdi)>/i) ||
                     html.match(/<p class="price">([\s\S]*?)<\/p>/i);

  const stockMatch = html.match(/class=["'][^"']*(?:badge--in-stock|stock|badge|inventory)[^"']*["'][^>]*>([^<]+)<\//i);

  if (titleMatch && priceMatch) {
    const rawTitle = titleMatch[1].trim();
    const cleanPriceText = priceMatch[1].replace(/<[^>]+>/g, '').trim();
    const currentPrice = parseBdtPrice(cleanPriceText);
    const rawStock = stockMatch ? stockMatch[1].trim() : 'In Stock';
    const { availability, inStock } = normalizeStockStatus(rawStock, currentPrice);

    if (rawTitle && currentPrice > 0) {
      return {
        id: generateScrapedProductId('generic', contextUrl),
        shopId: 'shop-generic',
        rawTitle,
        cleanTitle: sanitizeTitle(rawTitle),
        productUrl: contextUrl,
        currentPrice,
        availability,
        inStock,
      };
    }
  }

  return null;
}

/**
 * 4-Tier Generic Fallback Hierarchy runner.
 */
export function parseGenericFallbackHierarchy(
  html: string,
  contextUrl = 'https://generic.store/item'
): { product: ScrapedItem | null; tier: string } {
  // Tier 1: JSON-LD
  const jsonLd = parseGenericJsonLd(html, contextUrl);
  if (jsonLd) return { product: jsonLd, tier: 'JSON-LD' };

  // Tier 2: OpenGraph
  const og = parseGenericOpenGraph(html, contextUrl);
  if (og) return { product: og, tier: 'OpenGraph' };

  // Tier 3: Microdata
  const microdata = parseGenericMicrodata(html, contextUrl);
  if (microdata) return { product: microdata, tier: 'Microdata' };

  // Tier 4: CSS Cascade
  const css = parseGenericCssCascade(html, contextUrl);
  if (css) return { product: css, tier: 'CSS-Cascade' };

  return { product: null, tier: 'None' };
}

export class GenericAdapter implements RetailerAdapter {
  readonly name = 'Generic E-Commerce';
  readonly adapterType = 'generic' as const;

  canHandle(urlOrDomain: string): boolean {
    return Boolean(urlOrDomain || true);
  }

  parseHtml(html: string, contextUrl = 'https://generic.store/item'): ScrapedItem[] {
    const items: ScrapedItem[] = [];

    // First check multi-product WooCommerce / Shopify / OpenCart listings
    const cardBlocks = html.match(/<li[^>]*class=["'][^"']*product[^"']*["'][\s\S]*?<\/li>/gi) ||
                       html.match(/<div class="product-layout"[\s\S]*?<\/div>\s*<\/div>/gi) || [];

    for (const card of cardBlocks) {
      const titleMatch = card.match(/<h[234][^>]*>\s*<a[^>]*href="([^"]+)">([^<]+)<\/a>/i);
      const priceMatch = card.match(/class=["'][^"']*(?:woocommerce-Price-amount|price)[^"']*["'][^>]*>([\s\S]*?)<\//i);

      if (titleMatch && priceMatch) {
        const productUrl = titleMatch[1].startsWith('http')
          ? titleMatch[1]
          : new URL(titleMatch[1], contextUrl).href;
        const rawTitle = titleMatch[2].trim();
        const currentPrice = parseBdtPrice(priceMatch[1].replace(/<[^>]+>/g, ''));
        const { availability, inStock } = normalizeStockStatus('In Stock', currentPrice);

        if (currentPrice > 0) {
          items.push({
            id: generateScrapedProductId('generic', productUrl),
            shopId: 'shop-generic',
            rawTitle,
            cleanTitle: sanitizeTitle(rawTitle),
            productUrl,
            currentPrice,
            availability,
            inStock,
          });
        }
      }
    }

    if (items.length > 0) {
      return items;
    }

    // Single product fallback hierarchy
    const { product } = parseGenericFallbackHierarchy(html, contextUrl);
    if (product) {
      items.push(product);
    }

    return items;
  }

  async scrapeUrl(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let items: ScrapedItem[] = [];

    try {
      let html = options.mockHtml;
      if (!html) {
        const fetchRes = await fetchWithStealth(url, {
          stealth: options.stealth,
          minDelayMs: options.minDelayMs,
          maxDelayMs: options.maxDelayMs,
          maxRetries: options.maxRetries,
          timeoutMs: options.timeoutMs,
        });

        if (fetchRes.isChallenge) {
          errors.push(`Cloudflare challenge encountered on ${url}`);
          return {
            shopId: 'shop-generic',
            shopName: this.name,
            adapterType: this.adapterType,
            status: 'FAILED',
            items: [],
            itemCount: 0,
            errors,
            durationMs: Date.now() - startTime,
            scrapedAt: new Date().toISOString(),
          };
        }

        html = fetchRes.html;
      }

      items = this.parseHtml(html, url);
      if (options.limit && options.limit > 0) {
        items = items.slice(0, options.limit);
      }
    } catch (err: unknown) {
      errors.push(err instanceof Error ? err.message : String(err));
    }

    const scrapedProducts: ScrapedProduct[] = items.map(item => ({
      id: item.id || generateScrapedProductId('generic', item.productUrl),
      shopId: item.shopId || 'shop-generic',
      rawTitle: item.rawTitle,
      cleanTitle: item.cleanTitle,
      productUrl: item.productUrl,
      imageUrl: item.imageUrl,
      currentPrice: item.currentPrice,
      originalPrice: item.originalPrice,
      availability: item.availability,
      inStock: item.inStock,
      brand: item.brand,
      mpn: item.mpn,
      category: item.category,
      specs: item.specs,
      lastScrapedAt: new Date().toISOString(),
    }));

    return {
      shopId: 'shop-generic',
      shopName: this.name,
      adapterType: this.adapterType,
      status: errors.length === 0 ? 'SUCCESS' : 'FAILED',
      items: scrapedProducts,
      itemCount: scrapedProducts.length,
      errors,
      durationMs: Date.now() - startTime,
      scrapedAt: new Date().toISOString(),
    };
  }
}
