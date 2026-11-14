/**
 * Database URL & Outbound Link Sanitizer
 * Replaces any fragile static slugs in ecom.db with 100% resilient search URLs.
 */
import Database from 'better-sqlite3';
import { buildRetailerProductUrl } from '../src/lib/shopUrlHelper';

const db = new Database('ecom.db');

console.log('Sanitizing ecom.db outbound URLs...');

// 1. Sanitize product_groups best_deal_url
const groups = db.prepare('SELECT id, canonical_name, best_deal_shop_id, best_deal_url FROM product_groups').all() as any[];
const updateGroupStmt = db.prepare('UPDATE product_groups SET best_deal_url = ? WHERE id = ?');

let updatedGroups = 0;
for (const g of groups) {
  const shopSlug = (g.best_deal_shop_id || 'startech').replace('shop-', '');
  const resilientUrl = buildRetailerProductUrl(shopSlug, g.canonical_name);
  updateGroupStmt.run(resilientUrl, g.id);
  updatedGroups++;
}
console.log(`Updated ${updatedGroups} product_groups best_deal_url entries.`);

// 2. Sanitize scraped_products product_url
const products = db.prepare('SELECT id, shop_id, raw_title, product_url FROM scraped_products').all() as any[];
const updateProductStmt = db.prepare('UPDATE scraped_products SET product_url = ? WHERE id = ?');

let updatedProducts = 0;
for (const p of products) {
  const shopSlug = (p.shop_id || 'startech').replace('shop-', '');
  const resilientUrl = buildRetailerProductUrl(shopSlug, p.raw_title);
  updateProductStmt.run(resilientUrl, p.id);
  updatedProducts++;
}
console.log(`Updated ${updatedProducts} scraped_products product_url entries.`);

console.log('Database URL sanitization complete!');
