export type ScreenType =
  | 'onboarding'
  | 'auth-login'
  | 'auth-signup'
  | 'auth-otp'
  | 'auth-forgot'
  | 'home'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'orders'
  | 'order-tracking'
  | 'profile'
  | 'edit-profile'
  | 'nid-verify'
  | 'addresses'
  | 'settings'
  | 'customer-service'
  | 'live-promo'
  | 'wishlist'
  | 'search-results';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  weight: string;
}

export interface SellerInfo {
  name: string;
  rating: number;
  shipOnTime: number;
  chatResponseRate: number;
  verified: boolean;
}

export interface ProductQuestion {
  id: string;
  user: string;
  question: string;
  answer?: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  soldCount: number;
  weight: string;
  rating: number;
  reviewsCount: number;
  image: string;
  images: string[];
  description: string;
  inStock: boolean;
  isPopular?: boolean;
  isSpecialOffer?: boolean;
  isFlashSale?: boolean;
  seller: SellerInfo;
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
  questions?: ProductQuestion[];
  nutrition?: {
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface Address {
  id: string;
  type: 'Home' | 'Apartment' | 'Office';
  name: string;
  details: string;
  area: string;
  city: string;
  region: string;
  isDefault: boolean;
  phone: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  donation: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: 'My Wallet' | 'bKash' | 'Nagad' | 'Visa Card' | 'Cash on Delivery';
  paymentStatus: 'Paid' | 'Pending';
  transactionId?: string;
  cancelReason?: string;
  deliveryRider?: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
  };
  trackingStatus: 'Order Placed' | 'Order Confirm' | 'Pick-up' | 'Out for Delivery' | 'Delivered';
  estimatedDelivery: string;
}

export interface UserProfile {
  name: string;
  role: string;
  phone: string;
  email: string;
  nidNumber?: string;
  isNidVerified: boolean;
  avatar: string;
  walletBalance: number;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'promo' | 'order' | 'system';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  time: string;
}
