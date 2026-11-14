/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Bangladeshi Taka (BDT) Currency Normalizer & Stock Status Parser
 * 
 * Location: src/scraper/takaFormatter.ts
 */

import { ProductAvailability } from './types';

/**
 * Parses raw Bangladeshi Taka price strings into an integer BDT amount.
 * Handles diverse Bangladeshi e-commerce quirks:
 * - Currency symbols: ৳ (\u09F3), Tk, Tk., BDT (case-insensitive, prefix or suffix, with or without spaces)
 * - Concatenated prices: e.g. "66,500৳68,500৳" (splits and extracts the current/offer price)
 * - Decimal prices: e.g. "৳2,200.00" -> 2200
 * - Comma grouping: "1,45,000" or "43,500" -> 145000 / 43500
 * - HTML entities & whitespace: "&nbsp;", trailing spaces
 * - Zero / unpriced cases: "৳0.00", "0৳", "", "&nbsp;" -> returns 0
 */
export function parseBdtPrice(raw: string | null | undefined): number {
  if (!raw || typeof raw !== 'string') return 0;

  // Unescape standard HTML entities (resolve &amp; first to handle double-escaped entities like &amp;nbsp;)
  let str = raw;
  while (str.includes('&amp;')) {
    str = str.replace(/&amp;/gi, '&');
  }
  str = str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#2547;/g, '৳')
    .replace(/&#x09F3;/gi, '৳')
    .trim();

  if (str.length === 0) return 0;

  // Extract numeric price token handling:
  // 1. Multi-symbol currency prefixes: 'BDT Tk. 45,000/-', '৳ 18,500', 'Tk.26,550'
  // 2. Currency suffixes and concatenated prices: '18,500 ৳', '12000 BDT', '45,000/-', '66,500৳68,500৳'
  // 3. Prefixed word strings: 'Price: 12000 BDT only', 'Special: 15,000 Tk'
  // 4. Plain numbers: '12000', '0.00'
  const prefixMatch = str.match(/(-)?\s*(?:(?:৳|Tk\.?|BDT)\s*)+([\d,]+(?:\.\d+)?)/i);
  const suffixMatch = str.match(/(-)?\s*([\d,]+(?:\.\d+)?)\s*(?:\/-|\/=|৳|Tk\.?|BDT)/i);
  const plainMatch = str.match(/(-)?\s*([\d,]+(?:\.\d+)?)/);

  let rawNum = '';
  let isNegative = false;

  if (prefixMatch && suffixMatch) {
    const prefixIdx = str.indexOf(prefixMatch[0]);
    const suffixIdx = str.indexOf(suffixMatch[0]);
    if (prefixIdx <= suffixIdx) {
      isNegative = prefixMatch[1] === '-';
      rawNum = prefixMatch[2];
    } else {
      isNegative = suffixMatch[1] === '-';
      rawNum = suffixMatch[2];
    }
  } else if (prefixMatch) {
    isNegative = prefixMatch[1] === '-';
    rawNum = prefixMatch[2];
  } else if (suffixMatch) {
    isNegative = suffixMatch[1] === '-';
    rawNum = suffixMatch[2];
  } else if (plainMatch) {
    isNegative = plainMatch[1] === '-';
    rawNum = plainMatch[2];
  } else {
    return 0;
  }

  if (isNegative) return 0;

  // Strip comma thousand separators
  const cleanNumStr = rawNum.replace(/,/g, '').trim();

  // Parse floating-point and round to nearest integer Taka
  const num = parseFloat(cleanNumStr);
  if (isNaN(num) || num <= 0) return 0;

  return Math.round(num);
}

/**
 * Returns the parsed BDT price or null if unpriced, zero, or invalid.
 */
export function parseTakaPrice(raw: string | null | undefined): number | null {
  const price = parseBdtPrice(raw);
  return price > 0 ? price : null;
}

/**
 * Normalizes varied retailer stock indicator strings into standardized ProductAvailability enum
 * and boolean inStock flag.
 * 
 * Rules:
 * - "In Stock", "Available", "24 in stock", "Limited Stock" -> 'In Stock', inStock: true (if price > 0)
 * - "Out of Stock", "Stock Out", "Sold Out" -> 'Out of Stock', inStock: false
 * - "Pre-Order", "Pre Order", "Preorder" -> 'Pre-Order', inStock: false
 * - "Up Coming", "Upcoming", "Coming Soon" -> 'Upcoming', inStock: false
 * - If currentPrice is 0, negative, NaN, or non-finite, inStock MUST be false regardless of text.
 */
export function normalizeStockStatus(
  rawStatus: string | null | undefined,
  currentPrice?: number
): { availability: ProductAvailability; inStock: boolean } {
  const text = (rawStatus || '').toLowerCase().trim();

  let availability: ProductAvailability = 'In Stock';
  let inStock = true;

  if (
    text.includes('out of stock') ||
    text.includes('stock out') ||
    text.includes('sold out') ||
    text.includes('unavailable') ||
    text.includes('call for price')
  ) {
    availability = 'Out of Stock';
    inStock = false;
  } else if (
    text.includes('pre-order') ||
    text.includes('pre order') ||
    text.includes('preorder')
  ) {
    availability = 'Pre-Order';
    inStock = false;
  } else if (
    text.includes('up coming') ||
    text.includes('upcoming') ||
    text.includes('coming soon')
  ) {
    availability = 'Upcoming';
    inStock = false;
  } else if (
    text.includes('in stock') ||
    text.includes('limited stock') ||
    text.includes('in_stock') ||
    text.includes('available') ||
    /\b\d+\s+in\s+stock\b/i.test(text)
  ) {
    availability = 'In Stock';
    inStock = true;
  } else if (text === '') {
    // Default fallback based on whether price exists
    const hasValidPrice = currentPrice !== undefined && Number.isFinite(currentPrice) && currentPrice > 0;
    availability = hasValidPrice ? 'In Stock' : 'Out of Stock';
    inStock = hasValidPrice;
  }

  // Edge case constraint: Zero, negative, NaN or non-finite price items cannot be in stock
  if (currentPrice !== undefined && (!Number.isFinite(currentPrice) || currentPrice <= 0)) {
    inStock = false;
    if (availability === 'In Stock') {
      availability = 'Out of Stock';
    }
  }

  return { availability, inStock };
}

/**
 * Cleans and sanitizes raw product titles:
 * - Unescapes HTML entities (&amp;, &quot;, &#39;, &lt;, &gt;)
 * - Strips leading/trailing punctuation and redundant whitespace
 */
export function sanitizeTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes a deterministic integer hash for any string (e.g. URLs).
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Generates a stable unique scraped product ID from shop slug and product URL.
 */
export function generateScrapedProductId(shopSlug: string, productUrl: string): string {
  const hash = Math.abs(hashString(productUrl));
  return `sp-${shopSlug}-${hash}`;
}
