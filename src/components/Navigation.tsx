import React from 'react';
import { 
  Calculator, 
  CalendarDays, 
  BarChart3, 
  TrendingUp, 
  Package, 
  Settings2,
  Truck
} from 'lucide-react';

export type TabType = 'today' | 'add-sale' | 'wholesale' | 'daily-graph' | 'monthly-graph' | 'products' | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const NAV_ITEMS: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'today', label: "Today", icon: CalendarDays },
  { id: 'add-sale', label: 'Retail Sale', icon: Calculator },
  { id: 'wholesale', label: 'Wholesale', icon: Truck },
  { id: 'daily-graph', label: 'Daily Graph', icon: BarChart3 },
  { id: 'monthly-graph', label: 'Monthly Graph', icon: TrendingUp },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export const DesktopSidebar: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] p-4 shrink-0 shadow-sm">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3 mb-2">
          Parlour Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAddSale = item.id === 'add-sale';
          const isWholesale = item.id === 'wholesale';

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left ${
                isActive
                  ? isAddSale
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                    : isWholesale
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-700/20'
                    : 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : isAddSale
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold'
                  : isWholesale
                  ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${
                isActive ? 'text-white' : isAddSale ? 'text-emerald-700' : isWholesale ? 'text-amber-700' : 'text-slate-600'
              }`} />
              <span>{item.label}</span>
              {isWholesale && !isActive && (
                <span className="ml-auto text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                  Bulk
                </span>
              )}
              {isAddSale && !isActive && (
                <span className="ml-auto text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                  Counter
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Tirumala Franchise</p>
          <p className="text-[11px] mt-0.5 text-slate-400">Retail & Wholesale POS</p>
          <p className="text-[10px] text-emerald-600 mt-1 font-medium">✓ Dual counters active</p>
        </div>
      </div>
    </aside>
  );
};

export const MobileBottomNav: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAddSale = item.id === 'add-sale';
          const isWholesale = item.id === 'wholesale';

          if (isAddSale) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                aria-label="Retail Sale counter"
                aria-current={isActive ? 'page' : undefined}
                className="relative -top-2.5 flex flex-col items-center group touch-active focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? 'bg-emerald-600 ring-4 ring-emerald-100 scale-105'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-bold mt-0.5 text-emerald-700">
                  Retail
                </span>
              </button>
            );
          }

          if (isWholesale) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                aria-label="Wholesale counter"
                aria-current={isActive ? 'page' : undefined}
                className="relative -top-2.5 flex flex-col items-center group touch-active focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? 'bg-amber-600 ring-4 ring-amber-100 scale-105'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-bold mt-0.5 text-amber-700">
                  Wholesale
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center py-1 px-1 rounded-lg transition-colors min-w-[44px] touch-active ${
                isActive ? 'text-sky-800 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-700' : 'text-slate-500'}`} />
              <span className="text-[9px] mt-0.5 leading-tight truncate max-w-[48px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
