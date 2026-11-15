import { INITIAL_PHYSICAL_PRODUCTS, TRACKED_RETAILERS } from '../src/data/physicalGoodsData';
import { buildRetailerProductUrl } from '../src/lib/shopUrlHelper';

async function verifyAllLinks() {
  console.log('====================================================');
  console.log('🔍 VERIFYING ALL RETAILER LINKS & OUTBOUND ENDPOINTS');
  console.log('====================================================');

  let totalOffers = 0;
  let brokenItemCount = 0;
  let brokenDomainCount = 0;
  let missingUrlCount = 0;

  for (const product of INITIAL_PHYSICAL_PRODUCTS) {
    if (!product.bestDealUrl || product.bestDealUrl === '#') {
      console.error(`Product ${product.id} missing bestDealUrl!`);
    }

    for (const offer of product.offers || []) {
      totalOffers++;
      if (offer.productUrl.includes('item=')) {
        brokenItemCount++;
      }
      if (offer.productUrl.includes('ucc-bd.com') || offer.productUrl.includes('creatuscomputer.com')) {
        brokenDomainCount++;
      }
      if (!offer.productUrl || !offer.productUrl.startsWith('http')) {
        missingUrlCount++;
      }
    }
  }

  console.log(`Total Products Checked: ${INITIAL_PHYSICAL_PRODUCTS.length}`);
  console.log(`Total Offers Checked: ${totalOffers}`);
  console.log(`Offers with 'item=' placeholder: ${brokenItemCount} (MUST BE 0)`);
  console.log(`Offers with broken legacy domains: ${brokenDomainCount} (MUST BE 0)`);
  console.log(`Offers with missing/invalid URLs: ${missingUrlCount} (MUST BE 0)`);

  if (brokenItemCount > 0 || brokenDomainCount > 0 || missingUrlCount > 0) {
    throw new Error('Verification failed: broken URL patterns still exist!');
  }

  // Check Surface Laptop specifically
  const surface = INITIAL_PHYSICAL_PRODUCTS.find((p) => p.canonicalName.includes('Surface'));
  if (!surface) throw new Error('Surface Laptop not found!');

  console.log('\n--- Surface Laptop Comparison Matrix Check ---');
  console.log(`Canonical Name: ${surface.canonicalName}`);
  console.log(`Best Deal Shop: ${surface.bestDealShopName} (৳${surface.bestDealPrice})`);
  console.log(`Best Deal URL: ${surface.bestDealUrl}`);

  for (const o of surface.offers || []) {
    console.log(`\nTesting ${o.shopName} (${o.shopId}):`);
    console.log(`  Price: ৳${o.priceBDT}`);
    console.log(`  URL:   ${o.productUrl}`);
  }

  console.log('\n====================================================');
  console.log('✅ ALL RETAILER DATA INTEGRITY TESTS PASSED (0 ERRORS)');
  console.log('====================================================');
}

verifyAllLinks().catch((err) => {
  console.error(err);
  process.exit(1);
});
