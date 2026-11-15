import { INITIAL_PHYSICAL_PRODUCTS } from '../src/data/physicalGoodsData';

function cleanSearchKeywords(title: string, brand?: string, model?: string): string {
  if (!title) return '';

  // 1. Try pattern matching for iconic hardware patterns
  // Ryzen: AMD Ryzen [Pro] [3|5|7|9] [0-9]{4}[A-Z]*
  const ryzenMatch = title.match(/Ryzen\s+(?:Pro\s+)?[3579](?:\s+Pro)?\s+\d{4}[A-Z]*/i);
  if (ryzenMatch) return (brand && !ryzenMatch[0].toLowerCase().includes(brand.toLowerCase()) ? brand + ' ' : '') + ryzenMatch[0];

  // Intel Core: Core i[3579]-?\d{4,5}[A-Z]*
  const intelMatch = title.match(/Core\s+i[3579]-?\d{4,5}[A-Z]*/i);
  if (intelMatch) return (brand && !intelMatch[0].toLowerCase().includes(brand.toLowerCase()) ? brand + ' ' : '') + intelMatch[0];

  // Intel Core Ultra: Core Ultra\s+[579]\s+\d{3}[A-Z]*
  const ultraMatch = title.match(/Core\s+Ultra\s+[579]\s+\d{3}[A-Z]*/i);
  if (ultraMatch) return ultraMatch[0];

  // Surface: Surface Laptop [0-9]+|Surface Pro [0-9]+
  const surfaceMatch = title.match(/Surface\s+(?:Laptop|Pro)\s+\d+(?:th(?:\s+Edition)?)?/i);
  if (surfaceMatch) return surfaceMatch[0].replace(/th(?:\s+Edition)?/i, '');

  // Nvidia GeForce RTX / GTX: (?:RTX|GTX)\s+\d{4}(?:\s*Ti|\s*Super)?
  const rtxMatch = title.match(/(?:RTX|GTX)\s+\d{4}(?:\s*Ti|\s*Super)?/i);
  if (rtxMatch) {
    const brandPrefix = brand && brand.toLowerCase() !== 'nvidia' ? brand + ' ' : '';
    return brandPrefix + rtxMatch[0];
  }

  // Radeon RX: RX\s+\d{4}(?:\s*XT)?
  const rxMatch = title.match(/RX\s+\d{4}(?:\s*XT)?/i);
  if (rxMatch) return (brand ? brand + ' ' : '') + rxMatch[0];

  // MacBook: MacBook (?:Air|Pro)\s+(?:M[1234](?:\s+Pro|\s+Max)?)?
  const macMatch = title.match(/MacBook\s+(?:Air|Pro)(?:\s+M[1234](?:\s+Pro|\s+Max)?)?/i);
  if (macMatch) return macMatch[0];

  // Generic fallback: strip specs and take first 3-4 significant words
  let clean = title
    .replace(/\b(6-Core|8-Core|10-Core|12-Core|14-Core|16-Core|20-Core|24-Core)\b/gi, '')
    .replace(/\b(12-Thread|16-Thread|20-Thread|24-Thread|28-Thread|32-Thread)\b/gi, '')
    .replace(/\b(Desktop Processor|Gaming Processor|Processor)\b/gi, '')
    .replace(/\b(GDDR6X|GDDR6|Graphics Card|Card)\b/gi, '')
    .replace(/\b(Gaming Laptop|Brand Laptop|Notebook Laptop|Notebook|Laptop)\b/gi, '')
    .replace(/\b(Gaming Monitor|IPS Monitor|FHD Monitor|120Hz|144Hz|165Hz|180Hz|240Hz|Monitor)\b/gi, '')
    .replace(/\b(Desktop RAM|RAM Black|RAM White|Desktop Memory|RAM)\b/gi, '')
    .replace(/\b(PCIe 4\.0|PCIe 3\.0|NVMe M\.2 SSD|NVMe SSD|M\.2 SSD|SSD)\b/gi, '')
    .replace(/\b(13th Gen|14th Gen|12th Gen|11th Gen|10th Gen|Raptor Lake|Alder Lake)\b/gi, '')
    .replace(/\b(13\.8"|13\.6-Inch|15\.6-inch|23\.8 Inch|24\.5 Inch|27 Inch|32 Inch)\b/gi, '')
    .replace(/\b(AM4|AM5|LGA1700|LGA1200)\b/gi, '')
    .replace(/\b(3200MHz|3600MHz|5200MHz|5600MHz|6000MHz)\b/gi, '')
    .replace(/\b(Copilot\+\s*PC|Touchscreen|Backlit Keyboard|Wi-Fi 7|Wi-Fi 6)\b/gi, '')
    .replace(/["'(),&;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean.split(/\s+/).slice(0, 4);
  return words.join(' ');
}

console.log('Testing keyword cleaning for top 15 products:');
for (const p of INITIAL_PHYSICAL_PRODUCTS.slice(0, 15)) {
  console.log(`Original: "${p.canonicalName}"`);
  console.log(`Cleaned:  "${cleanSearchKeywords(p.canonicalName, p.brand, p.model)}"`);
  console.log('---');
}

// Also test the Surface laptop specifically
const surface = INITIAL_PHYSICAL_PRODUCTS.find(p => p.canonicalName.includes('Surface'));
if (surface) {
  console.log(`Surface Original: "${surface.canonicalName}"`);
  console.log(`Surface Cleaned:  "${cleanSearchKeywords(surface.canonicalName, surface.brand, surface.model)}"`);
}
