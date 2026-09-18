import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DailySummary } from '@/lib/types';
import { IndianRupee, Calendar, Truck, Store, X } from 'lucide-react';

interface DailyChartViewProps {
  recentDays: DailySummary[];
  onSelectDay: (summary: DailySummary) => void;
}

export const DailyChartView: React.FC<DailyChartViewProps> = ({ recentDays }) => {
  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null);
  const [activeRange, setActiveRange] = useState<number>(7);

  // Filter according to selected range
  const displayData = recentDays.slice(-activeRange);

  // Format stacked chart data (Retail vs Wholesale)
  const chartData = displayData.map((d) => {
    const parts = d.dateStr.split('-');
    const label = `${parts[2]}/${parts[1]}`;
    return {
      name: label,
      fullDate: d.dateStr,
      retailRevenue: d.retailRevenue || 0,
      wholesaleRevenue: d.wholesaleRevenue || 0,
      totalRevenue: d.totalRevenue,
      units: d.totalUnits,
      transactions: d.totalTransactions,
      raw: d,
    };
  });

  const totalPeriodRevenue = displayData.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalRetailRevenue = displayData.reduce((acc, curr) => acc + (curr.retailRevenue || 0), 0);
  const totalWholesaleRevenue = displayData.reduce((acc, curr) => acc + (curr.wholesaleRevenue || 0), 0);
  const totalPeriodUnits = displayData.reduce((acc, curr) => acc + curr.totalUnits, 0);

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 md:pb-8 max-w-6xl mx-auto">
      {/* Header & Range Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
            Sales Trends
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Daily Sales Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare retail counter vs wholesale bulk sales across days.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/70">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Revenue
          </span>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 flex items-center">
            <IndianRupee className="w-4 h-4 text-emerald-600 mr-0.5" />
            {totalPeriodRevenue.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <Store className="w-3 h-3" /> Retail Total
          </span>
          <p className="text-lg sm:text-2xl font-black text-emerald-900 mt-0.5 flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {totalRetailRevenue.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-100 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
          <span className="text-[10px] sm:text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <Truck className="w-3 h-3" /> Wholesale Total
          </span>
          <p className="text-lg sm:text-2xl font-black text-amber-900 mt-0.5 flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {totalWholesaleRevenue.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Units Sold
          </span>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">
            {totalPeriodUnits.toLocaleString('en-IN')}{' '}
            <span className="text-xs text-slate-400 font-normal">items</span>
          </p>
        </div>
      </div>

      {/* Stacked Interactive Bar Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-xs sm:text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            Revenue: Retail Counter vs Wholesale Bulk (₹)
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Tap bar to view day
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(e) => {
                const eventData = e as unknown as { activePayload?: { payload: { raw: DailySummary } }[] };
                if (eventData && eventData.activePayload && eventData.activePayload.length) {
                  setSelectedDay(eventData.activePayload[0].payload.raw);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                formatter={(val: string | number | readonly (string | number)[] | undefined, name: string | number | undefined) => [
                  `₹${Number(val).toLocaleString('en-IN')}`,
                  name === 'retailRevenue' ? 'Retail Counter' : 'Wholesale Bulk'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `Date: ${payload[0].payload.fullDate} (Total: ₹${payload[0].payload.totalRevenue.toLocaleString('en-IN')})`;
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
              <Legend
                formatter={(val) => (val === 'retailRevenue' ? 'Retail Counter' : 'Wholesale Supply')}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              <Bar dataKey="retailRevenue" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} cursor="pointer" />
              <Bar dataKey="wholesaleRevenue" stackId="a" fill="#d97706" radius={[6, 6, 0, 0]} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drill-down Detail Modal / Card */}
      {selectedDay && (
        <div className="bg-white rounded-2xl border-2 border-sky-300 shadow-md p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                Day Inspection
              </span>
              <h4 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                Breakdown for {selectedDay.dateStr}
              </h4>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
            <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-100">
              <span className="text-[10px] text-sky-800 font-semibold block">Total Day</span>
              <p className="text-base font-bold text-sky-950 mt-0.5">
                ₹{selectedDay.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-800 font-semibold block">Retail Total</span>
              <p className="text-base font-bold text-emerald-950 mt-0.5">
                ₹{(selectedDay.retailRevenue || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              <span className="text-[10px] text-amber-800 font-semibold block">Wholesale Total</span>
              <p className="text-base font-bold text-amber-950 mt-0.5">
                ₹{(selectedDay.wholesaleRevenue || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-600 font-semibold block">Total Units</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {selectedDay.totalUnits} units
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-2">
              Product-Wise Sales on this day
            </h5>
            {selectedDay.productBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No sales recorded on this day.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {selectedDay.productBreakdown.map((item, idx) => (
                  <div key={item.productId} className="py-2 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold w-4">{idx + 1}</span>
                      <div>
                        <p className="font-semibold text-slate-800">{item.productName}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <span>{item.retailQuantity || 0} retail</span>
                          {item.wholesaleQuantity > 0 && (
                            <span className="text-amber-700 font-semibold">• {item.wholesaleQuantity} wholesale</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₹{item.totalRevenue.toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{item.totalQuantity} units</p>
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
