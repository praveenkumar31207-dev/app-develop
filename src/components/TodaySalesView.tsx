import React, { useState } from 'react';
import { 
  IndianRupee, 
  ShoppingBag, 
  TrendingUp, 
  PlusCircle, 
  Trash2, 
  AlertCircle,
  Clock,
  ChevronRight,
  PackageCheck,
  Truck,
  Store
} from 'lucide-react';
import { DailySummary, SaleEntry, ShopProfile } from '@/lib/types';

interface TodaySalesViewProps {
  todaySummary: DailySummary;
  recentSales: SaleEntry[];
  profile: ShopProfile;
  onNavigateToAddSale: () => void;
  onNavigateToWholesale: () => void;
  onDeleteSale: (id: string) => void;
}

export const TodaySalesView: React.FC<TodaySalesViewProps> = ({
  todaySummary,
  recentSales,
  profile,
  onNavigateToAddSale,
  onNavigateToWholesale,
  onDeleteSale,
}) => {
  const [saleToDelete, setSaleToDelete] = useState<SaleEntry | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'retail' | 'wholesale'>('all');

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  const filteredSales = recentSales.filter((s) => {
    if (filterType === 'all') return true;
    return (s.saleType || 'retail') === filterType;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 md:pb-8">
      {/* Top Welcome & Quick Dual Counter Actions */}
      <div className="bg-gradient-to-br from-white to-sky-50/60 p-4 sm:p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
            Counter Sales Dashboard
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Today's Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Dual Actions: Retail Counter & Wholesale Bulk */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToAddSale}
            aria-label="Open Retail Sale counter"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Retail Sale</span>
          </button>

          <button
            onClick={onNavigateToWholesale}
            aria-label="Open Wholesale Supply counter"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-700/20 active:scale-95 transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>Wholesale Supply</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid with Retail & Wholesale Separation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Overall Revenue */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Total Today</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline">
            <span className="text-emerald-600 mr-0.5 text-base sm:text-xl">₹</span>
            {todaySummary.totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600">
            {todaySummary.totalUnits} items • {todaySummary.totalTransactions} bills
          </span>
        </div>

        {/* Retail Counter Counter */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-700">Retail Counter</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight flex items-baseline">
            <span className="mr-0.5 text-base sm:text-xl">₹</span>
            {(todaySummary.retailRevenue || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-semibold mt-0.5 truncate">
            {todaySummary.retailUnits || 0} retail packets
          </p>
        </div>

        {/* Wholesale Counter */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-800">Wholesale Counter</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-amber-900 tracking-tight flex items-baseline">
            <span className="mr-0.5 text-base sm:text-xl">₹</span>
            {(todaySummary.wholesaleRevenue || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] sm:text-xs text-amber-800 font-semibold mt-0.5 truncate">
            {todaySummary.wholesaleUnits || 0} bulk units supplied
          </p>
        </div>

        {/* Top Performer Product */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Top Seller</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          {todaySummary.productBreakdown.length > 0 ? (
            <div>
              <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {todaySummary.productBreakdown[0].productName}
              </div>
              <div className="flex items-center justify-between mt-0.5 text-xs">
                <span className="text-slate-500 text-[11px]">
                  {todaySummary.productBreakdown[0].totalQuantity} sold
                </span>
                <span className="font-bold text-emerald-600">
                  ₹{todaySummary.productBreakdown[0].totalRevenue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic mt-1">
              No sales recorded yet
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout: Product Breakdown & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left: Product Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-sky-600" />
              <h2 className="font-bold text-slate-800 text-xs sm:text-sm">
                Today's Product Breakdown
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">
              {todaySummary.productBreakdown.length} items sold
            </span>
          </div>

          <div className="p-2 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[380px]">
            {todaySummary.productBreakdown.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <p className="text-xs sm:text-sm">No items sold today yet.</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={onNavigateToAddSale}
                    className="text-xs text-emerald-600 font-semibold hover:underline"
                  >
                    Open Retail Counter
                  </button>
                  <span>•</span>
                  <button
                    onClick={onNavigateToWholesale}
                    className="text-xs text-amber-600 font-semibold hover:underline"
                  >
                    Open Wholesale
                  </button>
                </div>
              </div>
            ) : (
              todaySummary.productBreakdown.map((item, idx) => (
                <div key={item.productId} className="py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 rounded-lg">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span className="w-4 text-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{item.unit}</span>
                        {item.wholesaleQuantity > 0 && (
                          <span className="text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-semibold text-[10px]">
                            {item.wholesaleQuantity} wholesale
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">
                      ₹{item.totalRevenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      {item.totalQuantity} total units
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Chronological Feed with Filter (All / Retail / Wholesale) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <h2 className="font-bold text-slate-800 text-xs sm:text-sm">
                Sales Transaction Feed
              </h2>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              {(['all', 'retail', 'wholesale'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-1 rounded-md capitalize transition-all ${
                    filterType === t
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[380px]">
            {filteredSales.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <p className="text-xs sm:text-sm">No {filterType !== 'all' ? filterType : ''} sales recorded yet today.</p>
              </div>
            ) : (
              filteredSales.slice(0, 25).map((sale) => {
                const isWholesale = sale.saleType === 'wholesale';
                return (
                  <div
                    key={sale.id}
                    className="py-2 px-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg group transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {sale.productName}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            isWholesale
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isWholesale ? 'Wholesale' : 'Retail'}
                        </span>
                        {sale.buyerName && (
                          <span className="text-[10px] text-amber-900 font-semibold bg-amber-50 px-1.5 rounded">
                            {sale.buyerName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-600 mt-0.5 font-medium">
                        <span>{formatTime(sale.timestamp)}</span>
                        <span>•</span>
                        <span>{sale.quantity} units @ ₹{sale.priceAtSale}</span>
                        {sale.notes && <span className="italic truncate">({sale.notes})</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-bold text-xs sm:text-sm ${isWholesale ? 'text-amber-900' : 'text-slate-900'}`}>
                        ₹{sale.lineTotal.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => setSaleToDelete(sale)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                        aria-label={`Delete ${sale.productName} sale entry`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Remove Sale Entry?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Delete <strong className="text-slate-900">{saleToDelete.quantity} × {saleToDelete.productName} (₹{saleToDelete.lineTotal})</strong>? Today's totals and graphs will update immediately.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setSaleToDelete(null)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteSale(saleToDelete.id);
                  setSaleToDelete(null);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-700/20"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
