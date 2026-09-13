export type SaleType = 'retail' | 'wholesale';

export interface Product {
  id: string;
  name: string;
  tamilName?: string;
  category: 'Milk' | 'Curd & Dairy' | 'Beverages' | 'Ghee & Fats' | 'Paneer & Sweets' | 'Ice Cream';
  unit: string; // e.g. "500ml pouch", "450g pouch", "1L jar"
  price: number; // ₹ Retail price
  wholesalePrice?: number; // ₹ Wholesale/Bulk discounted price
  wholesaleCrateSize?: number; // e.g. 20 packets/crate or 10 kg
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
  saleType: SaleType; // 'retail' or 'wholesale'
  buyerName?: string; // e.g. "Hotel Saravana", "Tea Stall Murugan"
  timestamp: string; // Full ISO string
  dateStr: string; // 'YYYY-MM-DD'
  notes?: string;
}

export interface DailySummary {
  dateStr: string; // 'YYYY-MM-DD'
  totalRevenue: number;
  retailRevenue: number;
  wholesaleRevenue: number;
  totalUnits: number;
  retailUnits: number;
  wholesaleUnits: number;
  totalTransactions: number;
  productBreakdown: {
    productId: string;
    productName: string;
    unit: string;
    totalQuantity: number;
    totalRevenue: number;
    retailQuantity: number;
    wholesaleQuantity: number;
    price: number;
  }[];
}

export interface MonthlySummary {
  monthStr: string; // 'YYYY-MM'
  totalRevenue: number;
  retailRevenue: number;
  wholesaleRevenue: number;
  totalUnits: number;
  totalTransactions: number;
  dailyTotals: {
    dateStr: string;
    dayNum: number;
    totalRevenue: number;
    retailRevenue: number;
    wholesaleRevenue: number;
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
