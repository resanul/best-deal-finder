/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Walton Retailer Adapter (waltonbd.com / eplaza.waltonbd.com)
 * 
 * Location: src/scraper/adapters/walton.ts
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

export class WaltonAdapter implements RetailerAdapter {
  readonly name = 'Walton';
  readonly adapterType = 'walton' as const;

  canHandle(urlOrDomain: string): boolean {
    return /(?:eplaza\.)?waltonbd\.com/i.test(urlOrDomain);
  }

  parseHtml(html: string, contextUrl = 'https://waltonbd.com'): ScrapedItem[] {
    const items: ScrapedItem[] = [];

    // Product item blocks
    const blocks = html.match(/<div class="product-item-wrap[^"]*">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi) ||
                   html.match(/<div class="product-item-wrap[^"]*">([\s\S]*?)<\/div>\s*<\/div>/gi) ||
                   html.match(/<div class="product-single-item">([\s\S]*?)<\/div>\s*<\/div>/gi) || [];

    for (const block of blocks) {
      const titleMatch = block.match(/<h4 class="name-area-height-fixed">\s*<a[^>]*href="([^"]+)">([^<]+)<\/a>/i) ||
                         block.match(/<h4[^>]*>\s*<a[^>]*href="([^"]+)">([^<]+)<\/a>/i);
      const priceMatch = block.match(/<p class="price-style">([\s\S]*?)<\/p>/i);
      const oldPriceMatch = block.match(/<p class="old-price-style">([\s\S]*?)<\/p>/i);
      const stockMatch = block.match(/<div class="stock-badge">([^<]+)<\/div>/i) ||
                         block.match(/<span class="stock-badge">([^<]+)<\/span>/i);
      const imgMatch = block.match(/<div class="product-img-area">\s*<a[^>]*>\s*<img[^>]*src="([^"]+)"/i) ||
                       block.match(/<img[^>]*src="([^"]+)"/i);

      if (titleMatch) {
        const productUrl = titleMatch[1].startsWith('http')
          ? titleMatch[1]
          : new URL(titleMatch[1], contextUrl).href;
        const rawTitle = titleMatch[2].trim();

        // Handle empty or &nbsp; in price
        const priceText = priceMatch ? priceMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        const oldPriceText = oldPriceMatch ? oldPriceMatch[1].replace(/<[^>]+>/g, '').trim() : '';

        const currentPrice = parseBdtPrice(priceText);
        const originalPrice = oldPriceText ? parseBdtPrice(oldPriceText) : undefined;
        const rawStock = stockMatch ? stockMatch[1].trim() : (currentPrice > 0 ? 'In Stock' : 'Out of Stock');
        const { availability, inStock } = normalizeStockStatus(rawStock, currentPrice);
        const imageUrl = imgMatch ? imgMatch[1] : undefined;

        items.push({
          id: generateScrapedProductId('walton', productUrl),
          shopId: 'shop-walton',
          rawTitle,
          cleanTitle: sanitizeTitle(rawTitle),
          productUrl,
          imageUrl,
          currentPrice,
          originalPrice: originalPrice && originalPrice > currentPrice ? originalPrice : undefined,
          availability,
          inStock,
          brand: 'Walton',
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
            shopId: 'shop-walton',
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
      id: item.id || generateScrapedProductId('walton', item.productUrl),
      shopId: item.shopId || 'shop-walton',
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
      shopId: 'shop-walton',
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
