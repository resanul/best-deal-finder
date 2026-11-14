/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Techland / Techmenia Retailer Adapter (techlandbd.com / techmenia.com.bd)
 * 
 * Location: src/scraper/adapters/techland.ts
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

export class TechlandAdapter implements RetailerAdapter {
  readonly name = 'Techland BD';
  readonly adapterType = 'techland' as const;

  canHandle(urlOrDomain: string): boolean {
    return /techland(?:bd)?\.com|techmenia\.com\.bd/i.test(urlOrDomain);
  }

  parseHtml(html: string, contextUrl = 'https://www.techlandbd.com'): ScrapedItem[] {
    const items: ScrapedItem[] = [];

    // OpenCart product-thumb cards
    const blocks = html.match(/<div class="product-thumb"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi) ||
                   html.match(/<div class="product-thumb">([\s\S]*?)<\/div>\s*<\/div>/gi) ||
                   html.match(/<div class="product-thumb">([\s\S]*?)<\/div>/gi) || [];

    for (const block of blocks) {
      const titleMatch = block.match(/<div class="name">\s*<a[^>]*href="([^"]+)">([^<]+)<\/a>/i) ||
                         block.match(/<h4 class="name">\s*<a[^>]*href="([^"]+)">([^<]+)<\/a>/i) ||
                         block.match(/<a[^>]*href="([^"]+)">([^<]+)<\/a>/i);
      const priceNewMatch = block.match(/<span class="price-new[^"]*">([^<]+)<\/span>/i) ||
                            block.match(/<span class="price-normal[^"]*">([^<]+)<\/span>/i);
      const priceOldMatch = block.match(/<span class="price-old[^"]*">([^<]+)<\/span>/i);
      const stockMatch = block.match(/<div class="stock-status">([^<]+)<\/div>/i) ||
                         block.match(/<span class="stock-status">([^<]+)<\/span>/i);
      const brandMatch = block.match(/<div class="brand">([^<]+)<\/div>/i);
      const imgMatch = block.match(/<div class="image">\s*<a[^>]*>\s*<img[^>]*src="([^"]+)"/i) ||
                       block.match(/<img[^>]*src="([^"]+)"/i);

      if (titleMatch) {
        const productUrl = titleMatch[1].startsWith('http')
          ? titleMatch[1]
          : new URL(titleMatch[1], contextUrl).href;
        const rawTitle = titleMatch[2].trim();
        const currentPrice = priceNewMatch ? parseBdtPrice(priceNewMatch[1]) : 0;
        const originalPrice = priceOldMatch ? parseBdtPrice(priceOldMatch[1]) : undefined;
        const rawStock = stockMatch ? stockMatch[1].trim() : 'In Stock';
        const { availability, inStock } = normalizeStockStatus(rawStock, currentPrice);
        const brand = brandMatch ? brandMatch[1].trim() : undefined;
        const imageUrl = imgMatch ? imgMatch[1] : undefined;

        items.push({
          id: generateScrapedProductId('techland', productUrl),
          shopId: 'shop-techland',
          rawTitle,
          cleanTitle: sanitizeTitle(rawTitle),
          productUrl,
          imageUrl,
          currentPrice,
          originalPrice: originalPrice && originalPrice > currentPrice ? originalPrice : undefined,
          availability,
          inStock,
          brand,
        });
      }
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
            shopId: 'shop-techland',
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
      id: item.id || generateScrapedProductId('techland', item.productUrl),
      shopId: item.shopId || 'shop-techland',
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
      shopId: 'shop-techland',
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
