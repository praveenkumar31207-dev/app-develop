import { supabase } from './supabase';
import { storage } from './storage';
import { Product, ShopProfile } from './types';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

export const syncEngine = {
  // Check Supabase connection and table readiness
  async checkConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const { error } = await supabase.from('shop_backups').select('id').limit(1);
      if (error) {
        // Table might not exist yet; try creating or report schema needed
        return { ok: false, message: error.message };
      }
      return { ok: true, message: 'Connected to Supabase successfully' };
    } catch (err: unknown) {
      return { ok: false, message: err instanceof Error ? err.message : 'Network error' };
    }
  },

  // Push local backup snapshot to Supabase
  async syncToSupabase(): Promise<{ success: boolean; message: string; timestamp?: string }> {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return { success: false, message: 'Device is offline. Will sync when reconnected.' };
    }

    try {
      const profile = storage.getShopProfile();
      const products = storage.getProducts();
      const sales = storage.getSales();
      const now = new Date().toISOString();

      // Upsert full backup snapshot into Supabase 'shop_backups'
      const payload = {
        shop_id: 'default-shop',
        shop_name: profile.shopName,
        franchise_brand: profile.franchiseBrand,
        total_products: products.length,
        total_sales: sales.length,
        products_data: products,
        sales_data: sales,
        profile_data: profile,
        synced_at: now,
      };

      const { error } = await supabase
        .from('shop_backups')
        .upsert(payload, { onConflict: 'shop_id' });

      if (error) {
        console.error('Supabase cloud backup error:', error);
        return { success: false, message: error.message };
      }

      // Also upsert individual sales entries for direct SQL querying if table exists
      try {
        if (sales.length > 0) {
          const formattedSales = sales.slice(0, 100).map((s) => ({
            id: s.id,
            product_id: s.productId,
            product_name: s.productName,
            unit: s.unit,
            quantity: s.quantity,
            price_at_sale: s.priceAtSale,
            line_total: s.lineTotal,
            sale_timestamp: s.timestamp,
            date_str: s.dateStr,
            notes: s.notes || null,
          }));

          await supabase.from('sales').upsert(formattedSales, { onConflict: 'id' });
        }
      } catch (innerErr) {
        // Sales table might be optional if shop_backups holds the primary store
        console.warn('Detailed sales table sync notice:', innerErr);
      }

      // Save last sync time in local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('shopcalci_last_cloud_sync', now);
      }

      return {
        success: true,
        message: `Synced ${sales.length} sales & ${products.length} products to Supabase cloud.`,
        timestamp: now,
      };
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'Sync failed.' };
    }
  },

  // Pull latest backup snapshot from Supabase if needed
  async restoreFromSupabase(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase
        .from('shop_backups')
        .select('*')
        .eq('shop_id', 'default-shop')
        .maybeSingle();

      if (error) return { success: false, message: error.message };
      if (!data) return { success: false, message: 'No backup found in Supabase for this shop.' };

      if (data.products_data) storage.saveProducts(data.products_data as Product[]);
      if (data.sales_data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('shopcalci_sales_v1', JSON.stringify(data.sales_data));
        }
      }
      if (data.profile_data) storage.saveShopProfile(data.profile_data as ShopProfile);

      return {
        success: true,
        message: `Restored ${data.total_sales || 0} sales and ${data.total_products || 0} products from Supabase.`,
      };
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'Restore failed.' };
    }
  },

  getLastSyncedAt(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('shopcalci_last_cloud_sync');
  },
};
