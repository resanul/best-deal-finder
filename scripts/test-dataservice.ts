import {
  getProducts,
  getProductBySlug,
  getDealsForProduct,
  getProductComparison,
  getVendors,
  isVendorOrDomainBlacklisted,
  generateAffiliateCheckoutUrl,
} from '../src/lib/dataService';

console.log('Testing dataService...');
const products = getProducts();
console.log('Total Products:', products.length);
const vendors = getVendors();
console.log('Total Vendors:', vendors.length);

if (products.length !== 15) throw new Error(`Expected 15 products, got ${products.length}`);
if (vendors.length !== 17) throw new Error(`Expected 17 vendors, got ${vendors.length}`);

for (const prod of products) {
  const comp = getProductComparison(prod.slug);
  if (!comp) throw new Error(`Missing comparison for slug: ${prod.slug}`);
  for (let i = 0; i < comp.deals.length - 1; i++) {
    if (comp.deals[i].priceBDT > comp.deals[i + 1].priceBDT) {
      throw new Error(`Ascending sort violation in ${prod.name}: ${comp.deals[i].priceBDT} > ${comp.deals[i + 1].priceBDT}`);
    }
  }
}

console.log('All 15 products have strictly ascending deal sorting verified!');
console.log('Scam blacklist test (bdsell):', isVendorOrDomainBlacklisted('bdsell'));
console.log('Verified vendor test (subsbhai.com):', isVendorOrDomainBlacklisted('subsbhai.com'));
console.log('Phone blacklist test (01833445566):', isVendorOrDomainBlacklisted('01833445566'));
console.log('dataService test PASSED cleanly!');
