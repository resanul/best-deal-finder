/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Star Tech Retailer Adapter (startech.com.bd)
 * 
 * Location: src/scraper/adapters/startech.ts
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

export class StarTechAdapter implements RetailerAdapter {
  readonly name = 'Star Tech';
  readonly adapterType = 'startech' as const;

  canHandle(urlOrDomain: string): boolean {
    return /startech\.com\.bd/i.test(urlOrDomain);
  }

  parseHtml(html: string, contextUrl = 'https://www.startech.com.bd'): ScrapedItem[] {
    const items: ScrapedItem[] = [];

    // 1. Check for Star Tech Listing items (.p-item)
    const itemMatches = html.match(/<div class="p-item"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g) ||
                        html.match(/<div class="p-item"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g) || [];

    for (const block of itemMatches) {
      const titleMatch = block.match(/<h4 class="p-item-name">\s*<a href="([^"]+)">([^<]+)<\/a>/i);
      const priceMatch = block.match(/<div class="p-item-price">\s*<span>([^<]+)<\/span>(?:\s*<span class="price-old">([^<]+)<\/span>)?/i) ||
                         block.match(/<div class="p-item-price">\s*<span[^>]*>([^<]+)<\/span>/i);
      const stockMatch = block.match(/<span class="stock-status">([^<]+)<\/span>/i) ||
                         block.match(/<div class="p-item-stock">\s*<span[^>]*>([^<]+)<\/span>/i);
      const imgMatch = block.match(/<div class="p-item-img">\s*<a[^>]*>\s*<img src="([^"]+)"/i);

      if (titleMatch) {
        const productUrl = titleMatch[1].startsWith('http')
          ? titleMatch[1]
          : new URL(titleMatch[1], contextUrl).href;
        const rawTitle = titleMatch[2].trim();
        const currentPrice = priceMatch ? parseBdtPrice(priceMatch[1]) : 0;
        const originalPrice = priceMatch && priceMatch[2] ? parseBdtPrice(priceMatch[2]) : undefined;
        const rawStock = stockMatch ? stockMatch[1].trim() : 'In Stock';
        const { availability, inStock } = normalizeStockStatus(rawStock, currentPrice);
        const imageUrl = imgMatch ? imgMatch[1] : undefined;

        items.push({
          id: generateScrapedProductId('startech', productUrl),
          shopId: 'shop-startech',
          rawTitle,
          cleanTitle: sanitizeTitle(rawTitle),
          productUrl,
          imageUrl,
          currentPrice,
          originalPrice: originalPrice && originalPrice > currentPrice ? originalPrice : undefined,
          availability,
          inStock,
        });
      }
    }

    if (items.length > 0) {
      return items;
    }

    // 2. Check for Star Tech Detail Page specifications
    const nameMatch = html.match(/<h1 class="product-name">([^<]+)<\/h1>/i) ||
                      html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const priceMatch = html.match(/<td class="product-price">([^<]+)<\/td>/i);
    const regularPriceMatch = html.match(/<td class="product-regular-price">([^<]+)<\/td>/i);
    const statusMatch = html.match(/<td class="product-status">([^<]+)<\/td>/i);
    const brandMatch = html.match(/<td class="product-brand">([^<]+)<\/td>/i);
    const codeMatch = html.match(/<td class="product-code">([^<]+)<\/td>/i);

    if (nameMatch && (priceMatch || regularPriceMatch || statusMatch)) {
      const rawTitle = nameMatch[1].trim();
      const currentPrice = priceMatch ? parseBdtPrice(priceMatch[1]) : 0;
      const originalPrice = regularPriceMatch ? parseBdtPrice(regularPriceMatch[1]) : undefined;
      const rawStatus = statusMatch ? statusMatch[1].trim() : 'In Stock';
      const { availability, inStock } = normalizeStockStatus(rawStatus, currentPrice);
      const brand = brandMatch ? brandMatch[1].trim() : undefined;
      const mpn = codeMatch ? codeMatch[1].trim() : undefined;

      // Extract specs from table if present
      const specs: Record<string, string> = {};
      const specRows = html.match(/<tr>\s*<td class="name">([^<]+)<\/td>\s*<td class="value">([^<]+)<\/td>\s*<\/tr>/gi);
      if (specRows) {
        for (const row of specRows) {
          const m = row.match(/<td class="name">([^<]+)<\/td>\s*<td class="value">([^<]+)<\/td>/i);
          if (m) {
            specs[m[1].trim()] = m[2].trim();
          }
        }
      }

      items.push({
        id: generateScrapedProductId('startech', contextUrl),
        shopId: 'shop-startech',
        rawTitle,
        cleanTitle: sanitizeTitle(rawTitle),
        productUrl: contextUrl,
        currentPrice,
        originalPrice: originalPrice && originalPrice > currentPrice ? originalPrice : undefined,
        availability,
        inStock,
        brand,
        mpn,
        specs: Object.keys(specs).length > 0 ? specs : undefined,
      });
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
            shopId: 'shop-startech',
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
      id: item.id || generateScrapedProductId('startech', item.productUrl),
      shopId: item.shopId || 'shop-startech',
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
      shopId: 'shop-startech',
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
