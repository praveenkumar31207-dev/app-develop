import { Product, SaleEntry, DailySummary, MonthlySummary, ShopProfile, SaleType } from './types';
import { INITIAL_PRODUCTS, DEFAULT_SHOP_PROFILE } from './seed';

const PRODUCTS_KEY = 'shopcalci_products_v2';
const SALES_KEY = 'shopcalci_sales_v1';
const PROFILE_KEY = 'shopcalci_profile_v1';

// Helper to get local date string YYYY-MM-DD
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get Month string YYYY-MM
export function getLocalMonthString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Safe local storage getter
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

// Safe local storage setter
function safeSet<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
    return false;
  }
}

// Storage API with auto-seeding
export const storage = {
  // PRODUCTS
  getProducts(): Product[] {
    const existing = safeGet<Product[] | null>(PRODUCTS_KEY, null);
    if (!existing || existing.length === 0) {
      safeSet(PRODUCTS_KEY, INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return existing;
  },

  saveProducts(products: Product[]): boolean {
    return safeSet(PRODUCTS_KEY, products);
  },

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveProducts(products);
    return products[index];
  },

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    return this.saveProducts(filtered);
  },

  resetProductsToDefault(): Product[] {
    safeSet(PRODUCTS_KEY, INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  // SALES
  getSales(): SaleEntry[] {
    return safeGet<SaleEntry[]>(SALES_KEY, []);
  },

  saveSale(entry: {
    productId: string;
    productName: string;
    unit: string;
    quantity: number;
    priceAtSale: number;
    saleType?: SaleType;
    buyerName?: string;
    notes?: string;
  }): SaleEntry {
    return this.saveMultipleSales([entry])[0];
  },

  saveMultipleSales(entries: Array<{
    productId: string;
    productName: string;
    unit: string;
    quantity: number;
    priceAtSale: number;
    saleType?: SaleType;
    buyerName?: string;
    notes?: string;
  }>): SaleEntry[] {
    if (!entries || entries.length === 0) return [];
    const sales = this.getSales();
    const now = new Date();
    const newSales: SaleEntry[] = entries.map((entry, index) => ({
      id: `sale-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      productId: entry.productId,
      productName: entry.productName,
      unit: entry.unit,
      quantity: entry.quantity,
      priceAtSale: entry.priceAtSale,
      lineTotal: Math.round(entry.quantity * entry.priceAtSale * 100) / 100,
      saleType: entry.saleType || 'retail',
      buyerName: entry.buyerName,
      timestamp: now.toISOString(),
      dateStr: getLocalDateString(now),
      notes: entry.notes,
    }));
    sales.unshift(...newSales); // newest first
    safeSet(SALES_KEY, sales);
    return newSales;
  },

  deleteSale(id: string): boolean {
    const sales = this.getSales();
    const filtered = sales.filter((s) => s.id !== id);
    return safeSet(SALES_KEY, filtered);
  },

  clearAllSales(): boolean {
    return safeSet(SALES_KEY, []);
  },

  // AGGREGATION HELPERS
  getTodaySales(): SaleEntry[] {
    const todayStr = getLocalDateString();
    return this.getSales().filter((s) => s.dateStr === todayStr);
  },

  getDailySummary(dateStr: string = getLocalDateString()): DailySummary {
    const sales = this.getSales().filter((s) => s.dateStr === dateStr);
    let totalRevenue = 0;
    let retailRevenue = 0;
    let wholesaleRevenue = 0;
    let totalUnits = 0;
    let retailUnits = 0;
    let wholesaleUnits = 0;

    const breakdownMap: Record<string, {
      productId: string;
      productName: string;
      unit: string;
      totalQuantity: number;
      totalRevenue: number;
      retailQuantity: number;
      wholesaleQuantity: number;
      price: number;
    }> = {};

    for (const s of sales) {
      const type = s.saleType || 'retail';
      totalRevenue += s.lineTotal;
      totalUnits += s.quantity;

      if (type === 'wholesale') {
        wholesaleRevenue += s.lineTotal;
        wholesaleUnits += s.quantity;
      } else {
        retailRevenue += s.lineTotal;
        retailUnits += s.quantity;
      }

      if (!breakdownMap[s.productId]) {
        breakdownMap[s.productId] = {
          productId: s.productId,
          productName: s.productName,
          unit: s.unit,
          totalQuantity: 0,
          totalRevenue: 0,
          retailQuantity: 0,
          wholesaleQuantity: 0,
          price: s.priceAtSale,
        };
      }
      breakdownMap[s.productId].totalQuantity += s.quantity;
      breakdownMap[s.productId].totalRevenue += s.lineTotal;
      if (type === 'wholesale') {
        breakdownMap[s.productId].wholesaleQuantity += s.quantity;
      } else {
        breakdownMap[s.productId].retailQuantity += s.quantity;
      }
    }

    const productBreakdown = Object.values(breakdownMap).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    return {
      dateStr,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      retailRevenue: Math.round(retailRevenue * 100) / 100,
      wholesaleRevenue: Math.round(wholesaleRevenue * 100) / 100,
      totalUnits,
      retailUnits,
      wholesaleUnits,
      totalTransactions: sales.length,
      productBreakdown,
    };
  },

  getRecentDaysSummary(days: number = 7): DailySummary[] {
    const result: DailySummary[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = getLocalDateString(d);
      result.push(this.getDailySummary(dStr));
    }

    return result;
  },

  getMonthlySummary(monthStr: string = getLocalMonthString()): MonthlySummary {
    const sales = this.getSales().filter((s) => s.dateStr.startsWith(monthStr));
    let totalRevenue = 0;
    let retailRevenue = 0;
    let wholesaleRevenue = 0;
    let totalUnits = 0;

    const dailyTotalsMap: Record<string, {
      dateStr: string;
      dayNum: number;
      totalRevenue: number;
      retailRevenue: number;
      wholesaleRevenue: number;
      totalUnits: number;
    }> = {};

    const breakdownMap: Record<string, {
      productId: string;
      productName: string;
      unit: string;
      totalQuantity: number;
      totalRevenue: number;
    }> = {};

    for (const s of sales) {
      const type = s.saleType || 'retail';
      totalRevenue += s.lineTotal;
      totalUnits += s.quantity;

      if (type === 'wholesale') {
        wholesaleRevenue += s.lineTotal;
      } else {
        retailRevenue += s.lineTotal;
      }

      // daily bucket
      if (!dailyTotalsMap[s.dateStr]) {
        const dayNum = parseInt(s.dateStr.split('-')[2], 10);
        dailyTotalsMap[s.dateStr] = {
          dateStr: s.dateStr,
          dayNum,
          totalRevenue: 0,
          retailRevenue: 0,
          wholesaleRevenue: 0,
          totalUnits: 0,
        };
      }
      dailyTotalsMap[s.dateStr].totalRevenue += s.lineTotal;
      dailyTotalsMap[s.dateStr].totalUnits += s.quantity;
      if (type === 'wholesale') {
        dailyTotalsMap[s.dateStr].wholesaleRevenue += s.lineTotal;
      } else {
        dailyTotalsMap[s.dateStr].retailRevenue += s.lineTotal;
      }

      // product bucket
      if (!breakdownMap[s.productId]) {
        breakdownMap[s.productId] = {
          productId: s.productId,
          productName: s.productName,
          unit: s.unit,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      breakdownMap[s.productId].totalQuantity += s.quantity;
      breakdownMap[s.productId].totalRevenue += s.lineTotal;
    }

    const dailyTotals = Object.values(dailyTotalsMap).sort((a, b) => a.dayNum - b.dayNum);
    const productBreakdown = Object.values(breakdownMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      monthStr,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      retailRevenue: Math.round(retailRevenue * 100) / 100,
      wholesaleRevenue: Math.round(wholesaleRevenue * 100) / 100,
      totalUnits,
      totalTransactions: sales.length,
      dailyTotals,
      productBreakdown,
    };
  },

  getRecentMonthsSummary(monthsCount: number = 6): MonthlySummary[] {
    const result: MonthlySummary[] = [];
    const today = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mStr = getLocalMonthString(d);
      result.push(this.getMonthlySummary(mStr));
    }

    return result;
  },

  // SHOP PROFILE
  getShopProfile(): ShopProfile {
    return safeGet<ShopProfile>(PROFILE_KEY, DEFAULT_SHOP_PROFILE);
  },

  saveShopProfile(profile: ShopProfile): boolean {
    return safeSet(PROFILE_KEY, profile);
  },

  // EXPORT & IMPORT
  exportSalesToCSV(): string {
    const sales = this.getSales();
    const headers = ['Sale ID', 'Type', 'Buyer / Party', 'Date', 'Time', 'Product Name', 'Unit', 'Quantity Sold', 'Price (INR)', 'Line Total (INR)', 'Notes'];
    const rows = sales.map((s) => {
      const date = new Date(s.timestamp);
      const timeStr = date.toLocaleTimeString('en-IN', { hour12: true });
      return [
        `"${s.id}"`,
        `"${(s.saleType || 'retail').toUpperCase()}"`,
        `"${(s.buyerName || '').replace(/"/g, '""')}"`,
        `"${s.dateStr}"`,
        `"${timeStr}"`,
        `"${s.productName.replace(/"/g, '""')}"`,
        `"${s.unit}"`,
        s.quantity,
        s.priceAtSale,
        s.lineTotal,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  },

  exportFullBackupJSON(): string {
    const payload = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      profile: this.getShopProfile(),
      products: this.getProducts(),
      sales: this.getSales(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackupJSON(jsonString: string): { success: boolean; message: string; count?: number } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.products) || !Array.isArray(data.sales)) {
        return { success: false, message: 'Invalid backup file structure.' };
      }
      if (data.profile) this.saveShopProfile(data.profile);
      this.saveProducts(data.products);
      safeSet(SALES_KEY, data.sales);
      return {
        success: true,
        message: `Successfully imported ${data.products.length} products and ${data.sales.length} sales records.`,
        count: data.sales.length,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Failed to parse file: ${msg}` };
    }
  },

  // Sample data generator for demo
  populateSampleDemoData(): void {
    const products = this.getProducts();
    if (products.length === 0) return;

    const sampleSales: SaleEntry[] = [];
    const today = new Date();
    const wholesaleBuyers = ['Hotel Saravana Bhavan', 'Murugan Tea Stall', 'Annapoorna Mess', 'Sri Krishna Sweets', 'Sangeetha Bakery'];

    // Generate 14 days of realistic dairy counter transactions (both retail & wholesale)
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - dayOffset);
      const dStr = getLocalDateString(targetDate);

      // Retail sales (8 - 15 sales)
      const retailCount = Math.floor(Math.random() * 8) + 8;
      for (let j = 0; j < retailCount; j++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const qty = prod.category === 'Milk' ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 2) + 1;
        const hour = 6 + Math.floor(Math.random() * 14);
        const minute = Math.floor(Math.random() * 60);

        const txDate = new Date(targetDate);
        txDate.setHours(hour, minute, 0, 0);

        sampleSales.push({
          id: `sample-ret-${dStr}-${j}-${Math.random().toString(36).substring(2, 6)}`,
          productId: prod.id,
          productName: prod.name,
          unit: prod.unit,
          quantity: qty,
          priceAtSale: prod.price,
          lineTotal: Math.round(qty * prod.price * 100) / 100,
          saleType: 'retail',
          timestamp: txDate.toISOString(),
          dateStr: dStr,
        });
      }

      // Wholesale bulk sales (2 - 4 bulk crate orders per day)
      const wholesaleCount = Math.floor(Math.random() * 3) + 2;
      for (let k = 0; k < wholesaleCount; k++) {
        const prod = products.filter(p => p.category === 'Milk' || p.category === 'Curd & Dairy' || p.category === 'Paneer & Sweets')[Math.floor(Math.random() * 5)] || products[0];
        const crateSize = prod.wholesaleCrateSize || 20;
        const crates = Math.floor(Math.random() * 4) + 1; // 1 to 4 crates
        const qty = crates * crateSize;
        const wholesalePrice = prod.wholesalePrice || (prod.price * 0.9);
        const buyer = wholesaleBuyers[Math.floor(Math.random() * wholesaleBuyers.length)];
        const hour = 5 + Math.floor(Math.random() * 4); // Early morning 5-9 AM wholesale rush

        const txDate = new Date(targetDate);
        txDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

        sampleSales.push({
          id: `sample-ws-${dStr}-${k}-${Math.random().toString(36).substring(2, 6)}`,
          productId: prod.id,
          productName: prod.name,
          unit: prod.unit,
          quantity: qty,
          priceAtSale: wholesalePrice,
          lineTotal: Math.round(qty * wholesalePrice * 100) / 100,
          saleType: 'wholesale',
          buyerName: buyer,
          timestamp: txDate.toISOString(),
          dateStr: dStr,
          notes: `${crates} crate(s) bulk order`,
        });
      }
    }

    sampleSales.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    safeSet(SALES_KEY, sampleSales);
  }
};
