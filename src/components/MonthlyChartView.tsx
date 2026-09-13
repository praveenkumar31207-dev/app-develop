import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { MonthlySummary } from '@/lib/types';
import { IndianRupee, TrendingUp, Calendar, X } from 'lucide-react';

interface MonthlyChartViewProps {
  recentMonths: MonthlySummary[];
}

export const MonthlyChartView: React.FC<MonthlyChartViewProps> = ({ recentMonths }) => {
  const [selectedMonth, setSelectedMonth] = useState<MonthlySummary | null>(null);

  // Month name formatter
  const formatMonthName = (mStr: string) => {
    try {
      const [year, month] = mStr.split('-');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    } catch {
      return mStr;
    }
  };

  const chartData = recentMonths.map((m) => ({
    name: formatMonthName(m.monthStr),
    monthStr: m.monthStr,
    revenue: m.totalRevenue,
    units: m.totalUnits,
    transactions: m.totalTransactions,
    raw: m,
  }));

  const totalAllTimeRevenue = recentMonths.reduce((acc, curr) => acc + curr.totalRevenue, 0);

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
            Long-Term Growth
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            Monthly Sales Trend
          </h2>
          <p className="text-sm text-slate-500">
            Last 6 months performance. Tap any month bar to see daily breakdown and top items.
          </p>
        </div>

        <div className="bg-sky-50 px-4 py-2.5 rounded-xl border border-sky-200/80 self-start sm:self-auto">
          <span className="text-xs text-sky-700 font-bold uppercase block">
            6-Month Total
          </span>
          <span className="text-xl font-black text-sky-950 flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5 inline" />
            {totalAllTimeRevenue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Main Month Bar Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Monthly Revenue Comparison (₹)
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Tap bar to drill down
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedMonth(e.activePayload[0].payload.raw);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Monthly Total']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `Month: ${payload[0].payload.raw.monthStr}`;
                  }
                  return label;
                }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} cursor="pointer">
                {chartData.map((entry) => (
                  <Cell
                    key={`month-${entry.monthStr}`}
                    fill={selectedMonth?.monthStr === entry.monthStr ? '#059669' : '#34d399'}
                    className="hover:fill-emerald-700 transition-colors"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drill-down View for Selected Month */}
      {selectedMonth && (
        <div className="bg-white rounded-2xl border-2 border-emerald-300 shadow-md p-5 animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Monthly Breakdown
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Overview for {selectedMonth.monthStr}
              </h4>
            </div>
            <button
              onClick={() => setSelectedMonth(null)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-800 font-medium">Month's Revenue</span>
              <p className="text-lg font-bold text-emerald-950 mt-0.5">
                ₹{selectedMonth.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-800 font-medium">Total Items Sold</span>
              <p className="text-lg font-bold text-emerald-950 mt-0.5">
                {selectedMonth.totalUnits} units
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-800 font-medium">Total Counter Entries</span>
              <p className="text-lg font-bold text-emerald-950 mt-0.5">
                {selectedMonth.totalTransactions} sales
              </p>
            </div>
          </div>

          {/* Product Breakdown for Month */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
              Top Products Sold in {selectedMonth.monthStr}
            </h5>
            {selectedMonth.productBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No sales recorded in this month.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {selectedMonth.productBreakdown.map((item, idx) => (
                  <div key={item.productId} className="py-2.5 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold w-4">{idx + 1}</span>
                      <div>
                        <p className="font-semibold text-slate-800">{item.productName}</p>
                        <p className="text-xs text-slate-400">{item.unit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₹{item.totalRevenue.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.totalQuantity} units</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
