/**
 * Syncs the 158 authentic live Star Tech products into ecom.db SQLite database.
 */
import Database from 'better-sqlite3';
import { INITIAL_PHYSICAL_PRODUCTS, TRACKED_RETAILERS } from '../src/data/physicalGoodsData';

const db = new Database('ecom.db');

console.log('Syncing authentic Star Tech products to ecom.db...');

// Clear old product groups and scraped products to have a pristine real catalog
db.prepare('DELETE FROM scraped_products').run();
db.prepare('DELETE FROM product_groups').run();

const insertGroupStmt = db.prepare(`
  INSERT INTO product_groups (
    id, canonical_name, slug, brand, category, model, specs_json,
    image_url, min_price, max_price, best_deal_shop_id, best_deal_price,
    best_deal_url, offer_count, in_stock_offer_count, created_at, updated_at
  ) VALUES (
    @id, @canonical_name, @slug, @brand, @category, @model, @specs_json,
    @image_url, @min_price, @max_price, @best_deal_shop_id, @best_deal_price,
    @best_deal_url, @offer_count, @in_stock_offer_count, @created_at, @updated_at
  )
`);

const insertScrapedStmt = db.prepare(`
  INSERT OR REPLACE INTO scraped_products (
    id, shop_id, product_group_id, raw_title, clean_title, product_url,
    image_url, current_price, original_price, availability, in_stock,
    brand, category, match_confidence, last_scraped_at, created_at
  ) VALUES (
    @id, @shop_id, @product_group_id, @raw_title, @clean_title, @product_url,
    @image_url, @current_price, @original_price, @availability, @in_stock,
    @brand, @category, @match_confidence, datetime('now'), datetime('now')
  )
`);

let groupsCount = 0;
let offersCount = 0;

for (const pg of INITIAL_PHYSICAL_PRODUCTS) {
  insertGroupStmt.run({
    id: pg.id,
    canonical_name: pg.canonicalName,
    slug: pg.slug,
    brand: pg.brand,
    category: pg.category,
    model: pg.model,
    specs_json: JSON.stringify(pg.specs),
    image_url: pg.imageUrl,
    min_price: pg.minPrice,
    max_price: pg.maxPrice,
    best_deal_shop_id: pg.bestDealShopId,
    best_deal_price: pg.bestDealPrice,
    best_deal_url: pg.bestDealUrl,
    offer_count: pg.offerCount,
    in_stock_offer_count: pg.inStockOfferCount,
    created_at: pg.createdAt,
    updated_at: pg.updatedAt,
  });
  groupsCount++;

  for (const off of (pg.offers || [])) {
    insertScrapedStmt.run({
      id: off.id,
      shop_id: off.shopId,
      product_group_id: pg.id,
      raw_title: pg.canonicalName,
      clean_title: pg.canonicalName,
      product_url: off.productUrl,
      image_url: pg.imageUrl,
      current_price: off.priceBDT,
      original_price: off.originalPriceBDT || null,
      availability: off.availability,
      in_stock: off.inStock ? 1 : 0,
      brand: pg.brand,
      category: pg.category,
      match_confidence: 1.0,
    });
    offersCount++;
  }
}

console.log(`Synced ${groupsCount} product groups and ${offersCount} offers into ecom.db!`);
