/**
 * Live Star Tech Scraper & Catalog Extractor
 * Fetches real, live products directly from startech.com.bd
 * Extracts: real title, real URL, real image, real BDT price, real specs, real discount
 */

import https from 'https';

export interface StarTechLiveProduct {
  id: string;
  title: string;
  productUrl: string;
  imageUrl: string;
  currentPrice: number;
  originalPrice?: number;
  savings?: number;
  specs: string[];
  category: string;
  brand: string;
  inStock: boolean;
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrl(res.headers.location).then(resolve).catch(reject);
          return;
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

export function parseStarTechCategoryHtml(html: string, categoryName: string): StarTechLiveProduct[] {
  const products: StarTechLiveProduct[] = [];

  // Match each .p-item container
  const itemRegex = /<div class="p-item"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(html)) !== null) {
    const block = match[1];

    // 1. Title & URL
    const nameMatch = block.match(/<h4 class="p-item-name">\s*<a href="([^"]+)"[^>]*><span itemprop="name">([^<]+)<\/span><\/a>/i) ||
                      block.match(/<h4 class="p-item-name">\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
    if (!nameMatch) continue;

    const productUrl = nameMatch[1].trim();
    const title = nameMatch[2].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();

    // 2. Image URL
    const imgMatch = block.match(/<div class="p-item-img">\s*<a[^>]*>\s*<img[^>]*src="([^"]+)"/i);
    const imageUrl = imgMatch ? imgMatch[1].trim() : '';

    // 3. Price
    const priceNewMatch = block.match(/<span class="price-new">([^<]+)<\/span>/i);
    const priceOldMatch = block.match(/<span class="price-old">([^<]+)<\/span>/i);
    const plainPriceMatch = block.match(/<div class="p-item-price">\s*<span>([^<]+)<\/span>/i);

    let currentPrice = 0;
    let originalPrice: number | undefined;

    if (priceNewMatch) {
      currentPrice = parseInt(priceNewMatch[1].replace(/[^0-9]/g, ''), 10) || 0;
    } else if (plainPriceMatch) {
      currentPrice = parseInt(plainPriceMatch[1].replace(/[^0-9]/g, ''), 10) || 0;
    }

    if (priceOldMatch) {
      originalPrice = parseInt(priceOldMatch[1].replace(/[^0-9]/g, ''), 10) || undefined;
    }

    // 4. Save mark
    const saveMatch = block.match(/<span class="mark">Save:\s*([0-9,]+)[^<]*<\/span>/i);
    const savings = saveMatch ? parseInt(saveMatch[1].replace(/[^0-9]/g, ''), 10) : undefined;

    // 5. Short specs
    const specs: string[] = [];
    const specsBlockMatch = block.match(/<div class="short-description">\s*<ul>([\s\S]*?)<\/ul>/i);
    if (specsBlockMatch) {
      const liMatches = specsBlockMatch[1].match(/<li>([^<]+)<\/li>/gi);
      if (liMatches) {
        for (const li of liMatches) {
          const text = li.replace(/<\/?li>/gi, '').trim();
          if (text) specs.push(text);
        }
      }
    }

    // 6. Brand extraction
    let brand = 'Generic';
    const firstWord = title.split(' ')[0];
    if (['AMD', 'Intel', 'ASUS', 'MSI', 'Gigabyte', 'ZOTAC', 'HP', 'Acer', 'Lenovo', 'Dell', 'Apple', 'Walton', 'Samsung', 'LG', 'Xiaomi', 'Corsair', 'Kingston', 'G.Skill', 'Team', 'Antec', 'Thermalright', 'DeepCool'].includes(firstWord)) {
      brand = firstWord;
    }

    // 7. Stock status
    const isOutOfStock = block.includes('Out Of Stock') || block.includes('Up Coming') || currentPrice === 0;

    const id = 'st-' + (productUrl.split('/').pop() || Math.random().toString(36).substring(7));

    products.push({
      id,
      title,
      productUrl,
      imageUrl,
      currentPrice,
      originalPrice,
      savings,
      specs,
      category: categoryName,
      brand,
      inStock: !isOutOfStock,
    });
  }

  return products;
}

async function run() {
  console.log('--- FETCHING LIVE STAR TECH CATEGORIES ---');

  const categories = [
    { name: 'Processor', url: 'https://www.startech.com.bd/component/processor' },
    { name: 'Graphics Card', url: 'https://www.startech.com.bd/component/graphics-card' },
    { name: 'Laptop', url: 'https://www.startech.com.bd/laptop-notebook/laptop' },
    { name: 'Monitor', url: 'https://www.startech.com.bd/monitor' },
    { name: 'RAM', url: 'https://www.startech.com.bd/component/ram' },
    { name: 'SSD & Hard Disk', url: 'https://www.startech.com.bd/component/ssd-hard-disk' },
  ];

  const allProducts: StarTechLiveProduct[] = [];

  for (const cat of categories) {
    try {
      console.log(`Fetching ${cat.name} from ${cat.url}...`);
      const html = await fetchUrl(cat.url);
      const items = parseStarTechCategoryHtml(html, cat.name);
      console.log(`  -> Successfully parsed ${items.length} live products for ${cat.name}`);
      allProducts.push(...items);
    } catch (err: any) {
      console.error(`  -> Failed fetching ${cat.name}:`, err.message);
    }
  }

  console.log(`\nTOTAL LIVE STAR TECH PRODUCTS FETCHED: ${allProducts.length}`);
  if (allProducts.length > 0) {
    console.log('\nSample Product:');
    console.log(JSON.stringify(allProducts[0], null, 2));
  }
}

if (require.main === module) {
  run();
}
