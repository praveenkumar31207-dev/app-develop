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
import { DailySummary } from '@/lib/types';
import { IndianRupee, Calendar, ShoppingBag, ArrowRight, PackageCheck, X } from 'lucide-react';

interface DailyChartViewProps {
  recentDays: DailySummary[];
  onSelectDay: (summary: DailySummary) => void;
}

export const DailyChartView: React.FC<DailyChartViewProps> = ({ recentDays }) => {
  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null);
  const [activeRange, setActiveRange] = useState<number>(7);

  // Filter according to selected range
  const displayData = recentDays.slice(-activeRange);

  // Format chart data
  const chartData = displayData.map((d) => {
    const parts = d.dateStr.split('-');
    const label = `${parts[2]}/${parts[1]}`;
    return {
      name: label,
      fullDate: d.dateStr,
      revenue: d.totalRevenue,
      units: d.totalUnits,
      transactions: d.totalTransactions,
      raw: d,
    };
  });

  const totalPeriodRevenue = displayData.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalPeriodUnits = displayData.reduce((acc, curr) => acc + curr.totalUnits, 0);

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-6xl mx-auto">
      {/* Header & Range Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
            Sales Trends
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            Daily Sales Graph
          </h2>
          <p className="text-sm text-slate-500">
            Compare daily totals in ₹ and tap on any bar to inspect product breakdown.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto border border-slate-200/70">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setActiveRange(days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeRange === days
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Period Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total for Period
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center">
            <IndianRupee className="w-5 h-5 text-emerald-600 mr-0.5" />
            {totalPeriodRevenue.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Packets / Items Sold
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {totalPeriodUnits.toLocaleString('en-IN')}{' '}
            <span className="text-xs text-slate-400 font-normal">units</span>
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Daily Average
          </span>
          <p className="text-xl sm:text-2xl font-black text-sky-700 mt-1 flex items-center">
            <IndianRupee className="w-5 h-5 mr-0.5" />
            {Math.round(totalPeriodRevenue / (displayData.length || 1)).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Interactive Bar Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            Revenue per Day (₹)
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Tap bar to view day's items
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedDay(e.activePayload[0].payload.raw);
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
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Sales Total']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `Date: ${payload[0].payload.fullDate}`;
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
                    key={`cell-${entry.fullDate}`}
                    fill={selectedDay?.dateStr === entry.fullDate ? '#0284c7' : '#38bdf8'}
                    className="hover:fill-sky-700 transition-colors"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drill-down Detail Modal / Card when day is clicked */}
      {selectedDay && (
        <div className="bg-white rounded-2xl border-2 border-sky-300 shadow-md p-5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Drill-Down Day Inspection
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Breakdown for {selectedDay.dateStr}
              </h4>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
            <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100">
              <span className="text-xs text-sky-800 font-medium">Day Total Revenue</span>
              <p className="text-lg font-bold text-sky-950 mt-0.5">
                ₹{selectedDay.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100">
              <span className="text-xs text-sky-800 font-medium">Total Items Sold</span>
              <p className="text-lg font-bold text-sky-950 mt-0.5">
                {selectedDay.totalUnits} units
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-sky-50/70 p-3 rounded-xl border border-sky-100">
              <span className="text-xs text-sky-800 font-medium">Transactions</span>
              <p className="text-lg font-bold text-sky-950 mt-0.5">
                {selectedDay.totalTransactions} recorded
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
              Product-Wise Sales on this day
            </h5>
            {selectedDay.productBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No sales recorded on this day.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {selectedDay.productBreakdown.map((item, idx) => (
                  <div key={item.productId} className="py-2 flex items-center justify-between text-sm">
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
