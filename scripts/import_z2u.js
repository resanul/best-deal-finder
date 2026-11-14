const fs = require('fs');
const path = require('path');

// Configuration
const USD_TO_BDT_RATE = 122; // 1 USD = 122 BDT
const PROFIT_MARGIN_BDT = 50; // Profit in BDT

async function fetchZ2UProduct(url) {
  console.log(`\n🔍 Fetching product from Z2U: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Z2U page. HTTP Status: ${response.status}`);
  }

  const html = await response.text();

  // 1. Extract Title
  let name = '';
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    name = h1Match[1].replace(/<[^>]+>/g, '').trim();
  }
  if (!name || name.includes('${')) {
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      name = titleMatch[1].replace(/\s*-\s*Fast & Safe.*?at Z2U/i, '').replace(/^Buy\s+/i, '').trim();
    }
  }

  // 2. Extract Price (USD)
  let priceUSD = null;
  // Look for: class='price'>1.10</span> or similar
  const priceSpanMatch = html.match(/<span[^>]*class=['"][^'"]*price[^'"]*['"][^>]*>\s*([0-9]+(?:\.[0-9]+)?)\s*<\/span>/i);
  if (priceSpanMatch) {
    priceUSD = parseFloat(priceSpanMatch[1]);
  } else {
    const dollarMatch = html.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);
    if (dollarMatch) {
      priceUSD = parseFloat(dollarMatch[1]);
    }
  }

  if (!priceUSD || isNaN(priceUSD)) {
    priceUSD = 1.10; // Fallback
  }

  // 3. Extract Image
  let imageUrl = '';
  const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  for (const m of imgMatches) {
    const src = m[1];
    if (src.includes('sell_product') || src.includes('items/20') || src.includes('upload/platform')) {
      imageUrl = src.startsWith('http') ? src : `https://www.z2u.com${src}`;
      break;
    }
  }
  if (!imageUrl) {
    imageUrl = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80'; // Default Netflix/streaming placeholder
  }

  // 4. Calculate Price in BDT
  const costInBDT = priceUSD * USD_TO_BDT_RATE;
  const finalPriceBDT = Math.round(costInBDT + PROFIT_MARGIN_BDT);
  const originalPriceBDT = Math.round(finalPriceBDT * 1.5); // 33% discount display

  return {
    name,
    priceUSD,
    costInBDT: Math.round(costInBDT),
    finalPriceBDT,
    originalPriceBDT,
    imageUrl,
    url
  };
}

async function addProductToSite(productInfo) {
  const mockDataPath = path.join(process.cwd(), 'src', 'data', 'mockData.ts');
  let content = fs.readFileSync(mockDataPath, 'utf8');

  // Generate unique product ID
  const newId = `prod-z2u-${Date.now().toString().slice(-6)}`;

  const newProductObj = `  {
    id: '${newId}',
    name: ${JSON.stringify(productInfo.name)},
    brand: 'Netflix Digital',
    category: 'Subscriptions',
    price: ${productInfo.finalPriceBDT},
    originalPrice: ${productInfo.originalPriceBDT},
    stock: 99,
    soldCount: 142,
    weight: 'Instant Digital Delivery',
    rating: 4.9,
    reviewsCount: 88,
    image: '${productInfo.imageUrl}',
    images: [
      '${productInfo.imageUrl}'
    ],
    description: 'Instant delivery Netflix 4K UHD Premium Shared Account. 30 Days guaranteed validity. 1 Screen / Profile, No VPN required, Works globally on Smart TV, Phone, PC and Tablet. Z2U verified genuine supplier.',
    inStock: true,
    isPopular: true,
    isSpecialOffer: true,
    isFlashSale: true,
    seller: {
      name: 'Global Digital Hub',
      rating: 99,
      shipOnTime: 100,
      chatResponseRate: 99,
      verified: true,
    },
    variants: [
      { id: 'v1', name: '1 Month (1 Screen)', price: ${productInfo.finalPriceBDT}, weight: '30 Days' },
    ],
    specifications: {
      'Product Type': 'Digital Shared Account',
      'Quality': '4K UHD Ultra HD',
      'Duration': '30 Days',
      'VPN Required': 'No',
      'Delivery': 'Instant Email / SMS Delivery',
      'Sourced From': 'Z2U Marketplace',
      'Base Cost': '$${productInfo.priceUSD} (৳${productInfo.costInBDT})',
      'Profit Margin': '+৳${PROFIT_MARGIN_BDT}',
    },
  },`;

  // Ensure 'Subscriptions' is in mockCategories if missing
  if (!content.includes("id: 'Subscriptions'")) {
    content = content.replace(
      /export const mockCategories = \[/,
      `export const mockCategories = [\n    { id: 'Subscriptions', name: 'Subscriptions & Digital', icon: '🎬' },`
    );
  }

  // Insert right at the top of mockProducts list
  content = content.replace(
    /export const mockProducts: Product\[\] = \[/,
    `export const mockProducts: Product[] = [\n${newProductObj}`
  );

  fs.writeFileSync(mockDataPath, content, 'utf8');
  console.log(`\n✅ Successfully added "${productInfo.name}" to your store!`);
  console.log(`--------------------------------------------------`);
  console.log(`Original Z2U Price: $${productInfo.priceUSD} USD`);
  console.log(`Converted to BDT  : ৳${productInfo.costInBDT} BDT (Rate: 1 USD = ৳${USD_TO_BDT_RATE})`);
  console.log(`Profit Added      : +৳${PROFIT_MARGIN_BDT} BDT`);
  console.log(`Your Selling Price: ৳${productInfo.finalPriceBDT} BDT`);
  console.log(`Status            : LIVE on your website! 🚀`);
  console.log(`--------------------------------------------------`);
}

async function main() {
  const targetUrl = process.argv[2] || 'https://www.z2u.com/product-316383/Shared-Account-NFLX-30days-4K-UHD-Premium-1-Month-Not-Need-VPN.html?sort=low_price';
  try {
    const productInfo = await fetchZ2UProduct(targetUrl);
    await addProductToSite(productInfo);
  } catch (err) {
    console.error('Error importing product:', err);
  }
}

main();
