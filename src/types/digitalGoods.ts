/**
 * Bangladeshi Digital Goods Price Comparison Platform
 * Domain Data Models & TypeScript Definitions
 * 
 * Location: src/types/digitalGoods.ts
 * 
 * Cleanly models Bangladeshi market specifics:
 * - Mobile Financial Services (MFS) payment methods (bKash, Nagad, Rocket, Upay)
 * - Digital goods product categories (OTT, Gaming, Software, VPN, Gift Card, AI Tools)
 * - Verification tiers, DBID compliance, and trust scores (1-100)
 * - Multi-vendor deals with ascending BDT price points, plan variations, and stock status
 * - 7-point scam filter blacklist registry
 * - SQLite database row interfaces for zero-ambiguity relational mapping
 */

/**
 * Supported Mobile Financial Services (MFS) and payment rails in Bangladesh.
 */
export type PaymentMethod =
  | 'bKash'
  | 'Nagad'
  | 'Rocket'
  | 'Upay'
  | 'Visa/Mastercard'
  | 'Bank Transfer';

/**
 * Digital goods primary product categories.
 */
export type ProductCategory =
  | 'OTT'
  | 'Gaming'
  | 'Software'
  | 'VPN'
  | 'Gift Card'
  | 'AI Tools';

/**
 * Stock availability tiers.
 */
export type StockStatus =
  | 'In Stock'
  | 'Limited Stock'
  | 'Pre-Order'
  | 'Out of Stock';

/**
 * Deal badge classification for price comparison ranking.
 */
export type DealType =
  | 'Lowest Price'
  | 'Best Value'
  | 'Recommended'
  | 'Official Partner'
  | 'Flash Deal';

/**
 * Delivery fulfillment mechanism in the Bangladeshi digital goods market.
 */
export type DeliveryType =
  | 'Instant Automated'     // UID top-up API or instant voucher code
  | 'Email Invitation'      // Canva, Spotify Family/Duo, Office 365
  | 'Credential Delivery'   // OTT profile credentials + PIN via email/SMS
  | 'Manual Dispatch';      // Dispatched within 10-30 minutes

/**
 * Platforms where blacklisted scam operators typically operate.
 */
export type ScamPlatform =
  | 'Facebook'
  | 'Telegram'
  | 'WhatsApp'
  | 'Website'
  | 'Other';

/**
 * Scam risk assessment tier.
 */
export type RiskTier =
  | 'CRITICAL'
  | 'HIGH'
  | 'MODERATE';

/**
 * Catalog sort options.
 */
export type SortOption =
  | 'price-asc'
  | 'price-desc'
  | 'popular'
  | 'offers-count';

/**
 * Verified Bangladeshi Digital Storefront Entity.
 */
export interface Vendor {
  id: string;                     // Unique identifier e.g. "subsbhai", "jubaly"
  name: string;                   // Display name e.g. "SubsBhai", "Jubaly"
  slug: string;                   // URL-friendly slug e.g. "subs-bhai"
  domain: string;                 // Primary domain e.g. "subsbhai.com"
  websiteUrl: string;             // Storefront homepage URL
  logoUrl: string;                // Brand icon / logo path
  isVerified: boolean;            // Passed 7-point verification matrix
  trustScore: number;             // Algorithmic trust score 1-100
  scamReportCount: number;        // Total community scam flags (0 for verified)
  paymentMethods: PaymentMethod[]; // Supported payment gateways
  reviewScore: number;            // Rating 0.0 - 5.0 (e.g. 4.9)
  totalReviews: number;           // Number of customer reviews
  deliverySpeed: string;          // e.g. "Instant (1-3 min)", "5-15 min"
  supportChannel: string;         // e.g. "WhatsApp", "Live Chat", "Ticket"
  hasAutomatedGateway: boolean;   // Integrated MFS PGW vs manual Send Money
  hasDBID: boolean;               // Government Digital Business ID registered
  tradeLicenseNo?: string;        // Optional trade license reference
  establishedYear: number;        // Operating since year
  description: string;            // Brief vendor background
  badges?: string[];              // Optional badges e.g. ["DBID Verified", "Instant MFS"]
}

/**
 * Canonical Digital Product Catalog Entity.
 */
export interface Product {
  id: string;                     // e.g. "netflix-premium", "free-fire-115-diamonds"
  name: string;                   // e.g. "Netflix Premium 4K UHD"
  slug: string;                   // URL slug e.g. "netflix-premium-4k"
  category: ProductCategory;      // 'OTT' | 'Gaming' | 'Software' | 'VPN' | 'Gift Card' | 'AI Tools'
  subcategory?: string;           // e.g. "Streaming", "In-Game Topup", "Operating System"
  description: string;            // High-converting Markdown product description
  imageUrl: string;               // High-resolution product thumbnail/banner
  tags: string[];                 // Search & filter tags e.g. ["4K", "Smart TV", "Instant"]
  isTrending: boolean;            // Highlighted in trending/hero carousels
  isFeatured: boolean;            // Curated home showcase
  minPrice: number;               // Dynamic lowest BDT price across active deals
  maxPrice: number;               // Dynamic highest BDT price across active deals
  offerCount: number;             // Count of verified vendor deals
  bestVendorId: string;           // Vendor ID of the cheapest deal
  features: string[];             // Key feature bullets
}

/**
 * Specific Vendor Deal / Pricing Offer for a Product.
 */
export interface VendorDeal {
  id: string;                     // Unique deal ID e.g. "deal-subsbhai-netflix-1mo"
  productId: string;              // Foreign key to Product.id
  vendorId: string;               // Foreign key to Vendor.id
  planName: string;               // e.g. "1 Month Shared (Mobile/PC)", "1 Year Retail Key"
  duration: string;               // e.g. "30 Days", "1 Year", "Lifetime", "Instant"
  priceBDT: number;               // Current selling price in Bangladeshi Taka
  originalPriceBDT?: number;      // Regular / MSRP price for discount calculation
  discountPercent?: number;       // Precomputed discount badge (e.g. 25%)
  inStock: boolean;               // Stock status boolean
  stockStatus: StockStatus;       // Granular stock status
  directCheckoutUrl: string;      // Direct deep link to vendor checkout/product
  dealType: DealType;             // Deal badge classification
  deliveryType: DeliveryType;     // Delivery method
  warrantyPolicy: string;         // e.g. "Full 28-day replacement warranty"
  verifiedAt: string;             // ISO 8601 timestamp of last price check
}

/**
 * Blacklisted Scam Operator / Social Storefront Entity.
 */
export interface ScamStore {
  id: string;                     // Unique identifier e.g. "scam-001"
  domainOrPageName: string;       // Name/handle e.g. "BD Diamond Ghar (Fake Page)"
  platform: ScamPlatform;         // 'Facebook' | 'Telegram' | 'WhatsApp' | 'Website' | 'Other'
  urlOrHandle: string;            // URL or contact handle
  reason: string;                 // Fraud description (e.g. "Advance bKash send-and-block")
  flaggedDate: string;            // ISO date string e.g. "2026-10-15"
  evidenceSummary: string;        // Summary of reported incidents & complaints
  riskTier: RiskTier;             // 'CRITICAL' | 'HIGH' | 'MODERATE'
  reportedPhoneNumbers?: string[]; // Phone numbers used for scam advance payments
}

/**
 * Vendor Deal enriched with its parent Vendor profile.
 */
export type VendorDealWithVendor = VendorDeal & { vendor: Vendor };

/**
 * Aggregated Comparison Item returned for Product Detail Views.
 */
export interface ProductComparisonDetail {
  product: Product;
  deals: VendorDealWithVendor[];  // Guaranteed strictly sorted ascending by priceBDT
  cheapestDeal: VendorDealWithVendor;
  priceSpreadBDT: number;         // maxPrice - minPrice (Savings potential)
  totalOffers: number;
}

/**
 * Query Filter options for product search & catalog.
 */
export interface ProductFilterOptions {
  category?: ProductCategory | 'All';
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  isTrendingOnly?: boolean;
  sortBy?: SortOption;
}

// ============================================================================
// SQLITE RELATIONAL DATABASE ROW TYPES (src/lib/db.ts)
// ============================================================================

/**
 * Raw row shape for 'vendors' SQLite table.
 */
export interface VendorRow {
  id: string;
  name: string;
  slug: string;
  domain: string;
  website_url: string;
  logo_url: string;
  is_verified: number;            // 0 or 1
  trust_score: number;            // 1 to 100
  scam_report_count: number;
  payment_methods: string;        // JSON string e.g. '["bKash", "Nagad"]'
  review_score: number;           // 0.0 to 5.0
  total_reviews: number;
  delivery_speed: string;
  support_channel: string;
  has_automated_gateway: number;  // 0 or 1
  has_dbid: number;               // 0 or 1
  trade_license_no: string | null;
  established_year: number;
  description: string | null;
  created_at?: string;
}

/**
 * Raw row shape for 'products' SQLite table.
 */
export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  description: string;
  image_url: string;
  tags: string;                   // JSON string e.g. '["4K", "Smart TV"]'
  is_trending: number;            // 0 or 1
  is_featured: number;            // 0 or 1
  min_price: number;
  max_price: number;
  offer_count: number;
  best_vendor_id: string | null;
  features: string;               // JSON string e.g. '["Ultra HD", "Private PIN"]'
  created_at?: string;
  updated_at?: string;
}

/**
 * Raw row shape for 'vendor_deals' SQLite table.
 */
export interface VendorDealRow {
  id: string;
  product_id: string;
  vendor_id: string;
  plan_name: string;
  duration: string;
  price_bdt: number;
  original_price_bdt: number | null;
  discount_percent: number | null;
  in_stock: number;               // 0 or 1
  stock_status: string;
  direct_checkout_url: string;
  deal_type: string;
  delivery_type: string;
  warranty_policy: string;
  verified_at: string;
}

/**
 * Raw row shape for 'scam_stores' SQLite table.
 */
export interface ScamStoreRow {
  id: string;
  domain_or_page_name: string;
  platform: string;
  url_or_handle: string;
  reason: string;
  flagged_date: string;
  evidence_summary: string;
  risk_tier: string;
  reported_phone_numbers: string | null; // JSON string e.g. '["017XXXXXXXX"]'
}
