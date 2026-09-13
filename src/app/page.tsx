'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TabType, DesktopSidebar, MobileBottomNav } from '@/components/Navigation';
import { CounterHeader } from '@/components/CounterHeader';
import { TodaySalesView } from '@/components/TodaySalesView';
import { AddSaleView } from '@/components/AddSaleView';
import { WholesaleSaleView } from '@/components/WholesaleSaleView';
import { DailyChartView } from '@/components/DailyChartView';
import { MonthlyChartView } from '@/components/MonthlyChartView';
import { ProductManagerView } from '@/components/ProductManagerView';
import { BackupSettingsView } from '@/components/BackupSettingsView';
import { storage } from '@/lib/storage';
import { syncEngine } from '@/lib/sync';
import { Product, SaleEntry, DailySummary, MonthlySummary, ShopProfile, SaleType } from '@/lib/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [isClient, setIsClient] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Online & Cloud sync states
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Data states
  const [profile, setProfile] = useState<ShopProfile>(storage.getShopProfile());
  const [products, setProducts] = useState<Product[]>([]);
  const [todaySales, setTodaySales] = useState<SaleEntry[]>([]);
  const [todaySummary, setTodaySummary] = useState<DailySummary>({
    dateStr: '',
    totalRevenue: 0,
    retailRevenue: 0,
    wholesaleRevenue: 0,
    totalUnits: 0,
    retailUnits: 0,
    wholesaleUnits: 0,
    totalTransactions: 0,
    productBreakdown: [],
  });
  const [recentDays, setRecentDays] = useState<DailySummary[]>([]);
  const [recentMonths, setRecentMonths] = useState<MonthlySummary[]>([]);

  // Refresh all state from local storage
  const reloadData = useCallback(() => {
    const prof = storage.getShopProfile();
    const prods = storage.getProducts();
    const tSales = storage.getTodaySales();
    const tSum = storage.getDailySummary();
    const rDays = storage.getRecentDaysSummary(30);
    const rMonths = storage.getRecentMonthsSummary(6);

    setProfile(prof);
    setProducts(prods);
    setTodaySales(tSales);
    setTodaySummary(tSum);
    setRecentDays(rDays);
    setRecentMonths(rMonths);
  }, []);

  // Sync to Supabase Cloud helper
  const triggerCloudBackup = useCallback(async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    try {
      await syncEngine.syncToSupabase();
    } catch (err) {
      console.warn('Cloud sync note:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    setIsClient(true);
    setIsOnline(navigator.onLine);
    reloadData();

    // Online/Offline network listeners
    const handleOnline = () => {
      setIsOnline(true);
      triggerCloudBackup();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial silent sync if online
    if (navigator.onLine) {
      triggerCloudBackup();
    }

    // Time ticker for counter clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, [reloadData, triggerCloudBackup]);

  // Handler: Record sale (Supports both retail and wholesale)
  const handleRecordSale = (entry: {
    productId: string;
    productName: string;
    unit: string;
    quantity: number;
    priceAtSale: number;
    saleType?: SaleType;
    buyerName?: string;
    notes?: string;
  }) => {
    storage.saveSale(entry);
    reloadData();
    if (navigator.onLine) {
      triggerCloudBackup();
    }
  };

  // Handler: Delete sale entry
  const handleDeleteSale = (id: string) => {
    storage.deleteSale(id);
    reloadData();
    if (navigator.onLine) {
      triggerCloudBackup();
    }
  };

  // Handler: Add new product
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    storage.addProduct(newProd);
    reloadData();
    if (navigator.onLine) {
      triggerCloudBackup();
    }
  };

  // Handler: Update product
  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    storage.updateProduct(id, updates);
    reloadData();
    if (navigator.onLine) {
      triggerCloudBackup();
    }
  };

  // Handler: Reset catalogue
  const handleResetCatalog = () => {
    storage.resetProductsToDefault();
    reloadData();
  };

  // Handler: Update Shop Profile
  const handleUpdateProfile = (newProfile: ShopProfile) => {
    storage.saveShopProfile(newProfile);
    reloadData();
    if (navigator.onLine) {
      triggerCloudBackup();
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Starting Dairy Parlour POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      {/* Top Header */}
      <CounterHeader
        profile={profile}
        todayRevenue={todaySummary.totalRevenue}
        todayCount={todaySummary.totalUnits}
        currentTimeStr={currentTimeStr}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onManualSync={triggerCloudBackup}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <DesktopSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Dynamic Screen View */}
        <main className="flex-1 p-2.5 sm:p-4 md:p-6 overflow-x-hidden">
          {activeTab === 'today' && (
            <TodaySalesView
              todaySummary={todaySummary}
              recentSales={todaySales}
              profile={profile}
              onNavigateToAddSale={() => setActiveTab('add-sale')}
              onNavigateToWholesale={() => setActiveTab('wholesale')}
              onDeleteSale={handleDeleteSale}
            />
          )}

          {activeTab === 'add-sale' && (
            <AddSaleView
              products={products}
              onRecordSale={handleRecordSale}
              onNavigateToToday={() => setActiveTab('today')}
            />
          )}

          {activeTab === 'wholesale' && (
            <WholesaleSaleView
              products={products}
              onRecordSale={handleRecordSale}
              onNavigateToToday={() => setActiveTab('today')}
            />
          )}

          {activeTab === 'daily-graph' && (
            <DailyChartView
              recentDays={recentDays}
              onSelectDay={() => {}}
            />
          )}

          {activeTab === 'monthly-graph' && (
            <MonthlyChartView recentMonths={recentMonths} />
          )}

          {activeTab === 'products' && (
            <ProductManagerView
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onResetToDefault={handleResetCatalog}
            />
          )}

          {activeTab === 'settings' && (
            <BackupSettingsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onDataResetOrImported={reloadData}
              isOnline={isOnline}
              isSyncing={isSyncing}
              onManualSync={triggerCloudBackup}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
