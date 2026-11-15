'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ScreenType,
  Product,
  CartItem,
  Address,
  Order,
  UserProfile,
  NotificationItem,
  Review,
} from '@/types/ecom';
import { Product as DigitalProduct } from '@/types/digitalGoods';
import {
  mockProducts,
  mockAddresses,
  mockOrders,
  initialUser,
  mockNotifications,
  mockReviews,
} from '@/data/mockData';
import { translations } from '@/data/translations';
import { ProductGroup } from '@/types/physicalGoods';
import { INITIAL_PHYSICAL_PRODUCTS } from '@/data/physicalGoodsData';

interface AppContextType {
  screen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  navigateBack: () => void;
  screenHistory: ScreenType[];
  
  // Catalog Mode (Physical Tech vs Digital Subscriptions)
  catalogMode: 'physical' | 'digital';
  setCatalogMode: (mode: 'physical' | 'digital') => void;
  selectedPhysicalProduct: ProductGroup | null;
  setSelectedPhysicalProduct: (product: ProductGroup | null) => void;
  adminShopModalOpen: boolean;
  setAdminShopModalOpen: (open: boolean) => void;

  // Translation
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  t: (key: keyof typeof translations.en) => string;

  // Products & Filtering
  products: Product[];
  selectedProduct: Product | DigitalProduct | null;
  setSelectedProduct: (product: Product | DigitalProduct | null) => void;
  selectedProductSlug: string | null;
  setSelectedProductSlug: (slug: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'offers-count';
  setSortBy: (s: 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'offers-count') => void;
  inStockOnly: boolean;
  setInStockOnly: (inStock: boolean) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (verified: boolean) => void;
  resetFilters: () => void;
  
  // Cart & Donations
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isDonating: boolean;
  setIsDonating: (d: boolean) => void;
  donationAmount: number;
  setDonationAmount: (amt: number) => void;
  voucherCode: string;
  setVoucherCode: (code: string) => void;
  voucherDiscount: number;
  applyVoucher: (code: string) => boolean;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Addresses
  addresses: Address[];
  selectedAddress: Address;
  setSelectedAddress: (addr: Address) => void;
  addAddress: (addr: Omit<Address, 'id'>) => void;

  // Orders
  orders: Order[];
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  placeOrder: (paymentMethod: Order['paymentMethod']) => Order;
  orderReviews: Record<string, Review[]>;
  addOrderReview: (orderId: string, rating: number, comment: string) => void;

  // User & Settings
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  deviceFrame: boolean;
  setDeviceFrame: (frame: boolean) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotifsAsRead: () => void;

  // Modals & Bottom sheets
  scamModalOpen: boolean;
  setScamModalOpen: (open: boolean) => void;
  filterModalOpen: boolean;
  setFilterModalOpen: (open: boolean) => void;
  removeCartModalItem: CartItem | null;
  setRemoveCartModalItem: (item: CartItem | null) => void;
  donateModalOpen: boolean;
  setDonateModalOpen: (open: boolean) => void;
  addressModalOpen: boolean;
  setAddressModalOpen: (open: boolean) => void;
  logoutModalOpen: boolean;
  setLogoutModalOpen: (open: boolean) => void;
  ratingModalOrder: Order | null;
  setRatingModalOrder: (order: Order | null) => void;
  notificationsDrawerOpen: boolean;
  setNotificationsDrawerOpen: (open: boolean) => void;

  // Toast message
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreenState] = useState<ScreenType>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['home']);
  
  // Catalog Mode: physical (main part) vs digital
  const [catalogMode, setCatalogMode] = useState<'physical' | 'digital'>('physical');
  const [selectedPhysicalProduct, setSelectedPhysicalProduct] = useState<ProductGroup | null>(INITIAL_PHYSICAL_PRODUCTS[0]);
  const [adminShopModalOpen, setAdminShopModalOpen] = useState<boolean>(false);

  const [products] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | DigitalProduct | null>(mockProducts[0]);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>('netflix-premium-4k');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 350000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating' | 'offers-count'>('popular');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Persistence helpers - deterministic initial state for SSR
  const [cart, setCart] = useState<CartItem[]>([
    { product: mockProducts[0], quantity: 2 },
    { product: mockProducts[1], quantity: 1 },
  ]);

  const [wishlist, setWishlist] = useState<string[]>([mockProducts[0].id, mockProducts[2].id]);

  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);

  const [selectedAddress, setSelectedAddress] = useState<Address>(mockAddresses[0]);

  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(mockOrders[0]);
  const [user, setUser] = useState<UserProfile>(initialUser);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ecom_dark_mode') === 'true';
    }
    return false;
  });

  const [language, setLanguageState] = useState<'en' | 'bn'>('en');
  const [deviceFrame, setDeviceFrame] = useState(false);

  // Client-side hydration from localStorage
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedCart = localStorage.getItem('ecom_cart');
        if (savedCart) setCart(JSON.parse(savedCart));

        const savedWishlist = localStorage.getItem('ecom_wishlist');
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

        const savedAddresses = localStorage.getItem('ecom_addresses');
        if (savedAddresses) setAddresses(JSON.parse(savedAddresses));

        const savedOrders = localStorage.getItem('ecom_orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));

        const savedUser = localStorage.getItem('ecom_user');
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    });
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ecom_cart', JSON.stringify(cart));
      } catch (e) {
        console.error(e);
      }
    }
  }, [cart]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ecom_wishlist', JSON.stringify(wishlist));
      } catch (e) {
        console.error(e);
      }
    }
  }, [wishlist]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ecom_orders', JSON.stringify(orders));
      } catch (e) {
        console.error(e);
      }
    }
  }, [orders]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ecom_user', JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ecom_addresses', JSON.stringify(addresses));
      } catch (e) {
        console.error(e);
      }
    }
  }, [addresses]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecom_dark_mode', darkMode ? 'true' : 'false');
    }
  }, [darkMode]);

  const navigateBack = useCallback(() => {
    setScreenHistory((prev) => {
      if (prev.length > 1) {
        const newHistory = [...prev];
        newHistory.pop();
        const prevScreen = newHistory[newHistory.length - 1];
        setScreenState(prevScreen);
        return newHistory;
      } else {
        setScreenState('home');
        return ['home'];
      }
    });
  }, []);

  const setScreen = useCallback((newScreen: ScreenType) => {
    setScreenState(newScreen);
    setScreenHistory((prev) => [...prev, newScreen]);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Responsive device frame check & native back button
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth >= 768;
      const isNative = !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
      if (isDesktop && !isNative) {
        queueMicrotask(() => {
          setDeviceFrame(true);
        });
      }
    }

    // Android hardware back button handler
    const setupNativeBack = async () => {
      try {
        const { App } = await import('@capacitor/app');
        App.addListener('backButton', () => {
          navigateBack();
        });
      } catch {
        // Not on Capacitor or plugin not loaded, ignore
      }
    };
    setupNativeBack();
  }, [navigateBack]);

  const [isDonating, setIsDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState(20);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  const [orderReviews, setOrderReviews] = useState<Record<string, Review[]>>({
    'prod-1': mockReviews,
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  // Modals
  const [scamModalOpen, setScamModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [removeCartModalItem, setRemoveCartModalItem] = useState<CartItem | null>(null);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [ratingModalOrder, setRatingModalOrder] = useState<Order | null>(null);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2400);
  };

  const t = useCallback(
    (key: keyof typeof translations.en) => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );

  const setLanguage = (lang: 'en' | 'bn') => {
    setLanguageState(lang);
    showToast(lang === 'bn' ? 'ভাষা বাংলায় পরিবর্তিত হয়েছে' : 'Language set to English');
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 350000]);
    setMinRating(0);
    setSortBy('popular');
    setInStockOnly(false);
    setVerifiedOnly(false);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${product.name} to cart!`);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart');
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyVoucher = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SAVE30' || clean === 'RAMADAN30') {
      setVoucherCode(clean);
      setVoucherDiscount(Math.round(cartTotal * 0.3));
      showToast('30% Voucher applied successfully!');
      return true;
    } else if (clean === 'ECOM50' || clean === 'HALAL50') {
      setVoucherCode(clean);
      setVoucherDiscount(50);
      showToast('৳50 Flat discount applied!');
      return true;
    } else {
      showToast('Invalid voucher code. Try "SAVE30"');
      return false;
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to Wishlist');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    setAddresses((prev) => [newAddr, ...prev]);
    setSelectedAddress(newAddr);
    showToast('New delivery address added');
  };

  const placeOrder = (paymentMethod: Order['paymentMethod']): Order => {
    const subtotal = cartTotal;
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const donation = isDonating ? donationAmount : 0;
    const total = Math.max(0, subtotal + deliveryFee + donation - voucherDiscount);

    const newOrder: Order = {
      id: `ECOM-${Math.floor(10000000 + Math.random() * 90000000)}`,
      date: 'Just now',
      status: 'Active',
      items: [...cart],
      subtotal,
      deliveryFee,
      discount: voucherDiscount,
      donation,
      total,
      shippingAddress: selectedAddress,
      paymentMethod,
      paymentStatus: 'Paid',
      deliveryRider: {
        name: 'Rafiqul Islam',
        phone: '+880 1823-991827',
        vehicle: 'Hero Honda (Dhaka Metro-Ha-4281)',
        rating: 4.9,
      },
      trackingStatus: 'Order Placed',
      estimatedDelivery: '30-45 mins (Today)',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrder(newOrder);
    clearCart();
    setVoucherCode('');
    setVoucherDiscount(0);

    // Add order notification
    const orderNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Order Confirmed',
      description: `Order #${newOrder.id} has been confirmed. Rider will pick up shortly.`,
      time: 'Just now',
      unread: true,
      type: 'order',
    };
    setNotifications((prev) => [orderNotif, ...prev]);

    return newOrder;
  };

  const addOrderReview = (orderId: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: user.name,
      avatar: user.avatar,
      rating,
      date: 'Just now',
      comment,
    };
    setOrderReviews((prev) => ({
      ...prev,
      [orderId]: [newRev, ...(prev[orderId] || [])],
    }));
    showToast('Thank you for your rating & review!');
  };

  const updateUser = (fields: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...fields }));
    showToast('Profile updated successfully');
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const unreadNotifsCount = notifications.filter((n) => n.unread).length;
  const markNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        navigateBack,
        screenHistory,
        catalogMode,
        setCatalogMode,
        selectedPhysicalProduct,
        setSelectedPhysicalProduct,
        adminShopModalOpen,
        setAdminShopModalOpen,
        language,
        setLanguage,
        t,
        products,
        selectedProduct,
        setSelectedProduct,
        selectedProductSlug,
        setSelectedProductSlug,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        priceRange,
        setPriceRange,
        minRating,
        setMinRating,
        sortBy,
        setSortBy,
        inStockOnly,
        setInStockOnly,
        verifiedOnly,
        setVerifiedOnly,
        resetFilters,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        isDonating,
        setIsDonating,
        donationAmount,
        setDonationAmount,
        voucherCode,
        setVoucherCode,
        voucherDiscount,
        applyVoucher,
        wishlist,
        toggleWishlist,
        isWishlisted,
        addresses,
        selectedAddress,
        setSelectedAddress,
        addAddress,
        orders,
        selectedOrder,
        setSelectedOrder,
        placeOrder,
        orderReviews,
        addOrderReview,
        user,
        updateUser,
        darkMode,
        toggleDarkMode,
        deviceFrame,
        setDeviceFrame,
        notifications,
        unreadNotifsCount,
        markNotifsAsRead,
        scamModalOpen,
        setScamModalOpen,
        filterModalOpen,
        setFilterModalOpen,
        removeCartModalItem,
        setRemoveCartModalItem,
        donateModalOpen,
        setDonateModalOpen,
        addressModalOpen,
        setAddressModalOpen,
        logoutModalOpen,
        setLogoutModalOpen,
        ratingModalOrder,
        setRatingModalOrder,
        notificationsDrawerOpen,
        setNotificationsDrawerOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
