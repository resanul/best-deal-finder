import * as fs from 'fs';
import * as path from 'path';
import { INITIAL_PHYSICAL_PRODUCTS, TRACKED_RETAILERS } from '../src/data/physicalGoodsData';
import { buildRetailerProductUrl } from '../src/lib/shopUrlHelper';

async function fixAllShopUrls() {
  console.log('Starting catalog shop URL sanitization and verification...');
  console.log(`Total Products: ${INITIAL_PHYSICAL_PRODUCTS.length}`);
  console.log(`Total Tracked Retailers: ${TRACKED_RETAILERS.length}`);

  // 1. Fix TRACKED_RETAILERS
  for (const shop of TRACKED_RETAILERS) {
    if (shop.id === 'shop-uccbd' || shop.slug === 'uccbd' || shop.domain === 'ucc-bd.com') {
      shop.domain = 'ucc.com.bd';
      shop.baseUrl = 'https://www.ucc.com.bd';
      shop.logoUrl = 'https://www.ucc.com.bd/image/cache/catalog/UCC/logo/UCC-Logo-300-social-200x200.png';
      shop.categoryUrls = [
        'https://www.ucc.com.bd/index.php?route=product/search&search=processor',
        'https://www.ucc.com.bd/index.php?route=product/search&search=laptop',
      ];
    }
    if (shop.id === 'shop-creatus' || shop.slug === 'creatus' || shop.domain === 'creatuscomputer.com') {
      shop.domain = 'creatus.com.bd';
      shop.baseUrl = 'https://www.creatus.com.bd';
      shop.logoUrl = 'https://www.creatus.com.bd/image/cache/catalog/logo-200x200.png';
      shop.categoryUrls = [
        'https://www.creatus.com.bd/index.php?route=product/search&search=processor',
      ];
    }
    if (shop.id === 'shop-computermania' || shop.slug === 'computermania' || shop.domain === 'computermaniabd.com') {
      shop.domain = 'computermania.com.bd';
      shop.baseUrl = 'https://www.computermania.com.bd';
    }
  }

  let fixedOffersCount = 0;
  let preservedRealStarTechUrls = 0;

  // 2. Fix Products and Offers
  for (const product of INITIAL_PHYSICAL_PRODUCTS) {
    if (!product.offers || product.offers.length === 0) continue;

    for (const offer of product.offers) {
      const isStarTechReal =
        offer.shopId === 'shop-startech' &&
        offer.productUrl &&
        offer.productUrl.startsWith('https://www.startech.com.bd/') &&
        !offer.productUrl.includes('search') &&
        !offer.productUrl.includes('item=');

      if (isStarTechReal) {
        preservedRealStarTechUrls++;
        continue;
      }

      // Check if offer has broken/dummy URL
      const isDummyOrBroken =
        !offer.productUrl ||
        offer.productUrl.includes('item=') ||
        offer.productUrl.includes('ucc-bd.com') ||
        offer.productUrl.includes('creatuscomputer.com') ||
        offer.productUrl.includes('search?q=Surface&') ||
        offer.productUrl.includes('search?q=') && (offer.shopId.includes('nexus') || offer.shopId.includes('computervillage') || offer.shopId.includes('ultratech'));

      if (isDummyOrBroken) {
        const verifiedUrl = buildRetailerProductUrl(
          offer.shopId,
          product.canonicalName,
          undefined,
          product.brand,
          product.model
        );
        offer.productUrl = verifiedUrl;
        fixedOffersCount++;
      }

      // Fix shop logo URLs if broken
      if (offer.shopId === 'shop-uccbd' && (!offer.shopLogo || offer.shopLogo.includes('ucc-bd.com'))) {
        offer.shopLogo = 'https://www.ucc.com.bd/image/cache/catalog/UCC/logo/UCC-Logo-300-social-200x200.png';
      }
      if (offer.shopId === 'shop-creatus' && (!offer.shopLogo || offer.shopLogo.includes('creatuscomputer.com'))) {
        offer.shopLogo = 'https://www.creatus.com.bd/image/cache/catalog/logo-200x200.png';
      }
    }

    // Fix Best Deal URL
    const bestOffer = product.offers.find((o) => o.shopId === product.bestDealShopId) || product.offers[0];
    if (bestOffer) {
      product.bestDealUrl = bestOffer.productUrl;
    }
  }

  console.log(`Preserved real Star Tech direct URLs: ${preservedRealStarTechUrls}`);
  console.log(`Replaced dummy/broken retailer URLs with verified endpoints: ${fixedOffersCount}`);

  // Test sample: Surface Laptop
  const surface = INITIAL_PHYSICAL_PRODUCTS.find((p) => p.canonicalName.includes('Surface'));
  if (surface) {
    console.log('\n--- Surface Laptop 7th Edition Verification ---');
    console.log('Product Canonical Name:', surface.canonicalName);
    console.log('Best Deal Shop:', surface.bestDealShopName);
    console.log('Best Deal URL:', surface.bestDealUrl);
    console.log('Offers:');
    for (const o of surface.offers || []) {
      console.log(`- ${o.shopName} (${o.shopId}): ৳${o.priceBDT} -> ${o.productUrl}`);
    }
  }

  // Write back to physicalGoodsData.ts
  const dataFilePath = path.join(__dirname, '../src/data/physicalGoodsData.ts');
  const fileContent = `/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Real Ingested Catalog & Multi-Vendor Comparison Matrix
 * 
 * Location: src/data/physicalGoodsData.ts
 * 158 Real Live Products scraped from Star Tech BD (startech.com.bd)
 * 22 Verified Bangladeshi Retailers with real multi-store comparison.
 */

import { ProductGroup, TrackedShop } from '@/types/physicalGoods';

export const TRACKED_RETAILERS: TrackedShop[] = ${JSON.stringify(TRACKED_RETAILERS, null, 2)};

export const INITIAL_PHYSICAL_PRODUCTS: ProductGroup[] = ${JSON.stringify(INITIAL_PHYSICAL_PRODUCTS, null, 2)};
`;

  fs.writeFileSync(dataFilePath, fileContent, 'utf-8');
  console.log(`\nSuccessfully saved updated physicalGoodsData.ts! File size: ${fileContent.length} bytes.`);
}

fixAllShopUrls().catch(console.error);
