export interface Product {
  id: string;
  name: string;
  tamilName?: string;
  category: 'Milk' | 'Curd & Dairy' | 'Beverages' | 'Ghee & Fats' | 'Paneer & Sweets' | 'Ice Cream';
  unit: string; // e.g. "500ml pouch", "450g pouch", "1L jar"
  price: number; // ₹ INR
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaleEntry {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  priceAtSale: number; // Snapshot of price at moment of sale
  lineTotal: number; // quantity * priceAtSale
  timestamp: string; // Full ISO string (e.g. 2026-09-13T07:30:00.000Z)
  dateStr: string; // 'YYYY-MM-DD' in local timezone for fast day aggregation
  notes?: string;
}

export interface DailySummary {
  dateStr: string; // 'YYYY-MM-DD'
  totalRevenue: number;
  totalUnits: number;
  totalTransactions: number;
  productBreakdown: {
    productId: string;
    productName: string;
    unit: string;
    totalQuantity: number;
    totalRevenue: number;
    price: number;
  }[];
}

export interface MonthlySummary {
  monthStr: string; // 'YYYY-MM'
  totalRevenue: number;
  totalUnits: number;
  totalTransactions: number;
  dailyTotals: {
    dateStr: string;
    dayNum: number;
    totalRevenue: number;
    totalUnits: number;
  }[];
  productBreakdown: {
    productId: string;
    productName: string;
    unit: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}

export interface ShopProfile {
  shopName: string;
  franchiseBrand: string;
  tagline: string;
  contactNumber?: string;
  currencySymbol: string;
}
