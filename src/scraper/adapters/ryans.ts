/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Ryans Computers Retailer Adapter (ryanscomputers.com / ryans.com)
 * 
 * Location: src/scraper/adapters/ryans.ts
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

export class RyansAdapter implements RetailerAdapter {
  readonly name = 'Ryans Computers';
  readonly adapterType = 'ryans' as const;

  canHandle(urlOrDomain: string): boolean {
    return /ryans(?:computers)?\.com/i.test(urlOrDomain);
  }

  parseHtml(html: string, contextUrl = 'https://www.ryanscomputers.com'): ScrapedItem[] {
    const items: ScrapedItem[] = [];

    // Match product boxes
    const blocks = html.match(/<div class="product-box"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi) ||
                   html.match(/<div class="product-content-info">([\s\S]*?)<\/div>\s*<\/div>/gi) ||
                   html.match(/<div class="product-content-info">([\s\S]*?)<\/div>/gi) || [];

    for (const block of blocks) {
      const titleMatch = block.match(/<a class="product-title-grid"[^>]*href="([^"]+)">([^<]+)<\/a>/i) ||
                         block.match(/<h1 class="p-title">([^<]+)<\/h1>/i);
      const priceMatch = block.match(/<span class="p-price">([^<]+)<\/span>/i) ||
                         block.match(/class="[^"]*p-price[^"]*">([^<]+)<\/span>/i);
      const oldPriceMatch = block.match(/<span class="p-price-old">([^<]+)<\/span>/i);
      const availMatch = block.match(/<span class="availability">([^<]+)<\/span>/i);
      const partMatch = block.match(/<span class="part-number">([^<]+)<\/span>/i);
      const brandMatch = block.match(/<span class="brand">([^<]+)<\/span>/i);
      const imgMatch = block.match(/<img[^>]*src="([^"]+)"/i);

      let productUrl = contextUrl;
      let rawTitle = '';

      if (titleMatch) {
        if (titleMatch[2]) {
          productUrl = titleMatch[1].startsWith('http')
            ? titleMatch[1]
            : new URL(titleMatch[1], contextUrl).href;
          rawTitle = titleMatch[2].trim();
        } else {
          rawTitle = titleMatch[1].trim();
        }
      }

      if (rawTitle) {
        const currentPrice = priceMatch ? parseBdtPrice(priceMatch[1]) : 0;
        const originalPrice = oldPriceMatch ? parseBdtPrice(oldPriceMatch[1]) : undefined;
        const rawStock = availMatch ? availMatch[1].trim() : 'In Stock';
        const { availability, inStock } = normalizeStockStatus(rawStock, currentPrice);

        // Extract MPN from dedicated span or regex match in title (#100-100000927BOX or #ZT-D40600E-10M)
        let mpn = partMatch ? partMatch[1].trim() : undefined;
        if (!mpn) {
          const hashMpnMatch = rawTitle.match(/#([A-Za-z0-9\-]+)/);
          if (hashMpnMatch) {
            mpn = hashMpnMatch[1].trim();
          }
        }

        const brand = brandMatch ? brandMatch[1].trim() : undefined;
        const imageUrl = imgMatch ? imgMatch[1] : undefined;

        items.push({
          id: generateScrapedProductId('ryans', productUrl),
          shopId: 'shop-ryans',
          rawTitle,
          cleanTitle: sanitizeTitle(rawTitle),
          productUrl,
          imageUrl,
          currentPrice,
          originalPrice: originalPrice && originalPrice > currentPrice ? originalPrice : undefined,
          availability,
          inStock,
          mpn,
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
            shopId: 'shop-ryans',
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
      id: item.id || generateScrapedProductId('ryans', item.productUrl),
      shopId: item.shopId || 'shop-ryans',
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
      shopId: 'shop-ryans',
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
