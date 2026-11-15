/**
 * Firecrawl Service for DamKoto BD / Best Deal Finder
 * High-performance scraping, sitemap mapping, and AI-powered product data extraction.
 * 
 * Location: src/lib/firecrawlService.ts
 */

import FirecrawlApp from '@mendable/firecrawl-js';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';

let firecrawlClient: FirecrawlApp | null = null;

export function getFirecrawlClient(): FirecrawlApp {
  if (!firecrawlClient) {
    firecrawlClient = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
  }
  return firecrawlClient;
}

export interface ExtractedShopProduct {
  title: string;
  priceBDT: number;
  originalPriceBDT?: number;
  brand: string;
  model?: string;
  category: string;
  availability: 'In Stock' | 'Out of Stock' | 'Pre Order' | 'Up Coming';
  inStock: boolean;
  warranty?: string;
  imageUrl?: string;
  productUrl: string;
  specs?: Record<string, string>;
}

/**
 * Scrape a single web page (Markdown, HTML, or structured JSON)
 */
export async function scrapePage(url: string) {
  const app = getFirecrawlClient();
  const res = await app.scrape(url, {
    formats: ['markdown'],
  });
  return res;
}

/**
 * Map all URLs of a shop (sitemap & all product routes)
 */
export async function mapShopUrls(shopUrl: string, searchPrefix?: string): Promise<string[]> {
  const app = getFirecrawlClient();
  const res = await app.map(shopUrl, {
    search: searchPrefix,
    limit: 100,
  });

  const mapRes = res as unknown as { links?: Array<string | { url?: string }> };
  if (mapRes && Array.isArray(mapRes.links)) {
    return mapRes.links
      .map((item) => (typeof item === 'string' ? item : item.url || ''))
      .filter(Boolean);
  }
  return [];
}

/**
 * AI-powered extraction of product details from any e-commerce page
 */
export async function extractProductFromUrl(url: string): Promise<ExtractedShopProduct | null> {
  const app = getFirecrawlClient();

  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Canonical title of the product' },
      priceBDT: { type: 'number', description: 'Current selling price in Bangladeshi Taka (BDT/Tk)' },
      originalPriceBDT: { type: 'number', description: 'Regular or strikethrough price in BDT' },
      brand: { type: 'string', description: 'Brand name (AMD, Intel, ASUS, MSI, Walton, etc.)' },
      model: { type: 'string', description: 'Model identifier' },
      category: { type: 'string', description: 'Category (Processors, Graphics Cards, Laptops, Monitors, RAM, SSD, Motherboard, Power Supply)' },
      inStock: { type: 'boolean', description: 'Whether the product is currently in stock' },
      availability: { type: 'string', description: 'In Stock, Out of Stock, Pre Order, or Up Coming' },
      warranty: { type: 'string', description: 'Warranty period (e.g. 3 Years, 2 Years)' },
      imageUrl: { type: 'string', description: 'High-res image URL of the product' },
      specs: {
        type: 'object',
        description: 'Key technical specifications dictionary (e.g. Cores, Threads, Base Clock, Capacity)',
      },
    },
    required: ['title', 'priceBDT'],
  };

  try {
    const res = await app.scrape(url, {
      formats: [
        {
          type: 'json',
          schema: schema,
          prompt: 'Extract the tech product specifications, price in BDT, brand, and stock status from this page.',
        },
      ],
    });

    const record = res as unknown as Record<string, unknown>;
    const jsonData = (record?.json || (record?.data as Record<string, unknown>)?.json) as Record<string, unknown> | undefined;
    if (!jsonData) {
      return null;
    }

    return {
      title: String(jsonData.title || ''),
      priceBDT: Number(jsonData.priceBDT) || 0,
      originalPriceBDT: jsonData.originalPriceBDT ? Number(jsonData.originalPriceBDT) : undefined,
      brand: String(jsonData.brand || 'Generic'),
      model: jsonData.model ? String(jsonData.model) : undefined,
      category: String(jsonData.category || 'Tech Products'),
      availability: jsonData.inStock ? 'In Stock' : 'Out of Stock',
      inStock: Boolean(jsonData.inStock),
      warranty: jsonData.warranty ? String(jsonData.warranty) : 'Official Warranty',
      imageUrl: jsonData.imageUrl ? String(jsonData.imageUrl) : undefined,
      productUrl: url,
      specs: (jsonData.specs as Record<string, string>) || {},
    };
  } catch (err) {
    console.error(`Failed to extract product from ${url}:`, err);
    return null;
  }
}
