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
  PackageCheck
} from 'lucide-react';
import { DailySummary, SaleEntry, ShopProfile } from '@/lib/types';

interface TodaySalesViewProps {
  todaySummary: DailySummary;
  recentSales: SaleEntry[];
  profile: ShopProfile;
  onNavigateToAddSale: () => void;
  onDeleteSale: (id: string) => void;
}

export const TodaySalesView: React.FC<TodaySalesViewProps> = ({
  todaySummary,
  recentSales,
  profile,
  onNavigateToAddSale,
  onDeleteSale,
}) => {
  const [saleToDelete, setSaleToDelete] = useState<SaleEntry | null>(null);

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Top Welcome & Quick Action Card */}
      <div className="bg-gradient-to-br from-white to-sky-50/60 p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
            Counter Sales Dashboard
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            Today's Performance
          </h2>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <button
          onClick={onNavigateToAddSale}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all text-base"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline">
            <span className="text-emerald-600 mr-0.5">₹</span>
            {todaySummary.totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {todaySummary.totalTransactions} sale entries
          </p>
        </div>

        {/* Total Packets / Units Sold */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Units Sold</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {todaySummary.totalUnits} <span className="text-sm font-normal text-slate-500">items</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Milk pouches, curd & beverages
          </p>
        </div>

        {/* Top Performer of Today */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Top Selling Product</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {todaySummary.productBreakdown.length > 0 ? (
            <div>
              <div className="text-lg font-bold text-slate-900 truncate">
                {todaySummary.productBreakdown[0].productName}
              </div>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-slate-500">
                  {todaySummary.productBreakdown[0].totalQuantity} units sold
                </span>
                <span className="font-semibold text-emerald-600">
                  ₹{todaySummary.productBreakdown[0].totalRevenue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400 italic mt-2">
              No sales recorded yet today
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout: Product Breakdown & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Product-wise Summary of Today */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Today's Product Breakdown
              </h3>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {todaySummary.productBreakdown.length} products sold
            </span>
          </div>

          <div className="p-2 sm:p-3 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[380px]">
            {todaySummary.productBreakdown.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm">No items sold today yet.</p>
                <button
                  onClick={onNavigateToAddSale}
                  className="mt-3 text-xs text-sky-600 font-semibold hover:underline inline-flex items-center"
                >
                  Start counter entry <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            ) : (
              todaySummary.productBreakdown.map((item, idx) => (
                <div key={item.productId} className="py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 rounded-lg">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span className="w-5 text-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.unit} • ₹{item.price} each
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 text-sm">
                      ₹{item.totalRevenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {item.totalQuantity} units
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Today's Live Sales Entry Timeline with Delete */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Recent Sales Feed
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Newest first
            </span>
          </div>

          <div className="p-2 sm:p-3 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[380px]">
            {recentSales.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm">No sales recorded yet today.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Sales entries will appear here instantly as staff saves them.
                </p>
              </div>
            ) : (
              recentSales.slice(0, 20).map((sale) => (
                <div
                  key={sale.id}
                  className="py-2 px-3 flex items-center justify-between hover:bg-slate-50 rounded-lg group transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {sale.productName}
                      </span>
                      <span className="text-[11px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-medium">
                        Qty: {sale.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatTime(sale.timestamp)}</span>
                      <span>•</span>
                      <span>₹{sale.priceAtSale} / {sale.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-sm text-slate-900">
                      ₹{sale.lineTotal}
                    </span>
                    <button
                      onClick={() => setSaleToDelete(sale)}
                      className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete accidental entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Deletion */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Remove Sale Entry?
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Are you sure you want to delete the sale of{' '}
              <strong className="text-slate-800">
                {saleToDelete.quantity} × {saleToDelete.productName} (₹{saleToDelete.lineTotal})
              </strong>
              ? This will immediately recalculate today's totals.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setSaleToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteSale(saleToDelete.id);
                  setSaleToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-700/20"
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
