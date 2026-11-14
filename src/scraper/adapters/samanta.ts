/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Samanta Computer Retailer Adapter (samantacomputer.com)
 * 
 * Location: src/scraper/adapters/samanta.ts
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

export class SamantaAdapter implements RetailerAdapter {
  readonly name = 'Samanta Computer';
  readonly adapterType = 'samanta' as const;

  canHandle(urlOrDomain: string): boolean {
    return /samanta(?:computer)?\.com/i.test(urlOrDomain);
  }

  parseHtml(html: string, contextUrl = 'https://www.samantacomputer.com'): ScrapedItem[] {
    const items: ScrapedItem[] = [];

    // 1. Try Vike SSR embedded context JSON payload
    const vikeMatch = html.match(/<script id="vike_pageContext" type="application\/json">\s*([\s\S]*?)\s*<\/script>/i);
    if (vikeMatch) {
      try {
        const parsed = JSON.parse(vikeMatch[1]);
        const productData = parsed.pageProps?.product;
        const productsList = parsed.pageProps?.products;

        const processProduct = (p: Record<string, unknown>) => {
          const rawTitle = String(p.title || p.name || '');
          const productUrl = String(p.url || contextUrl);
          const currentPrice = Number(p.price) || 0;
          const originalPrice = Number(p.regularPrice) || undefined;
          const rawStock = String(p.stockStatus || (p.inStock ? 'In Stock' : 'Out of Stock'));
          const { availability, inStock } = normalizeStockStatus(rawStock, currentPrice);

          if (rawTitle) {
            items.push({
              id: generateScrapedProductId('samanta', productUrl),
              shopId: 'shop-samanta',
              rawTitle,
              cleanTitle: sanitizeTitle(rawTitle),
              productUrl,
              imageUrl: p.imageUrl ? String(p.imageUrl) : undefined,
              currentPrice,
              originalPrice: originalPrice && originalPrice > currentPrice ? originalPrice : undefined,
              availability,
              inStock: inStock && Boolean(p.inStock !== false),
              brand: p.brand ? String(p.brand) : undefined,
              category: p.category ? String(p.category) : undefined,
            });
          }
        };

        if (productData) {
          processProduct(productData);
        } else if (Array.isArray(productsList)) {
          for (const p of productsList) {
            processProduct(p);
          }
        }

        if (items.length > 0) {
          return items;
        }
      } catch {
        // Fall through to DOM fallback
      }
    }

    // 2. DOM Card Fallback (.rounded-card)
    const cardBlocks = html.match(/<div class="rounded-card[^"]*">([\s\S]*?)<\/div>\s*<\/div>/gi) ||
                       html.match(/<div class="rounded-card[^"]*">([\s\S]*?)<\/div>/gi) || [];

    for (const card of cardBlocks) {
      const titleMatch = card.match(/<a[^>]*href="([^"]+)">([^<]+)<\/a>/i);
      const priceMatch = card.match(/<span class="[^"]*price[^"]*">([^<]+)<\/span>/i) ||
                         card.match(/<span class="[^"]*font-bold[^"]*">([^<]+)<\/span>/i);
      const oldPriceMatch = card.match(/<span class="[^"]*line-through[^"]*">([^<]+)<\/span>/i);
      const stockMatch = card.match(/<span class="[^"]*stock-status[^"]*">([^<]+)<\/span>/i);
      const imgMatch = card.match(/<img[^>]*src="([^"]+)"/i);

      if (titleMatch) {
        const productUrl = titleMatch[1].startsWith('http')
          ? titleMatch[1]
          : new URL(titleMatch[1], contextUrl).href;
        const rawTitle = titleMatch[2].trim();
        const currentPrice = priceMatch ? parseBdtPrice(priceMatch[1]) : 0;
        const originalPrice = oldPriceMatch ? parseBdtPrice(oldPriceMatch[1]) : undefined;
        const rawStock = stockMatch ? stockMatch[1].trim() : 'In Stock';
        const { availability, inStock } = normalizeStockStatus(rawStock, currentPrice);
        const imageUrl = imgMatch ? imgMatch[1] : undefined;

        items.push({
          id: generateScrapedProductId('samanta', productUrl),
          shopId: 'shop-samanta',
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
            shopId: 'shop-samanta',
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
      id: item.id || generateScrapedProductId('samanta', item.productUrl),
      shopId: item.shopId || 'shop-samanta',
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
      shopId: 'shop-samanta',
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
