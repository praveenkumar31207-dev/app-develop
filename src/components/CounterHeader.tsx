import React from 'react';
import { Store, Clock, IndianRupee, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { ShopProfile } from '@/lib/types';

interface CounterHeaderProps {
  profile: ShopProfile;
  todayRevenue: number;
  todayCount: number;
  currentTimeStr: string;
  isOnline: boolean;
  isSyncing: boolean;
  onManualSync?: () => void;
}

export const CounterHeader: React.FC<CounterHeaderProps> = ({
  profile,
  todayRevenue,
  todayCount,
  currentTimeStr,
  isOnline,
  isSyncing,
  onManualSync,
}) => {
  return (
    <header className="bg-gradient-to-r from-sky-800 via-sky-900 to-slate-900 text-white shadow-md sticky top-0 z-30 border-b border-sky-950/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Left: Store Title & Cloud Status */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <Store className="w-5 h-5 text-sky-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight truncate leading-tight">
                {profile.shopName}
              </h1>
              
              {/* Cloud Sync Status Pill */}
              <button
                onClick={onManualSync}
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold border transition-all ${
                  isSyncing
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/30 animate-pulse'
                    : isOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30'
                    : 'bg-slate-700/60 text-slate-300 border-slate-600'
                }`}
                title={isOnline ? 'Cloud sync active (Click to sync now)' : 'Offline mode (will sync when reconnected)'}
              >
                {isSyncing ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : isOnline ? (
                  <Cloud className="w-3 h-3 mr-1 text-emerald-400" />
                ) : (
                  <CloudOff className="w-3 h-3 mr-1 text-slate-400" />
                )}
                <span>{isSyncing ? 'Syncing...' : isOnline ? 'Cloud Connected' : 'Offline Mode'}</span>
              </button>
            </div>

            <p className="text-[11px] sm:text-xs text-sky-200/80 truncate flex items-center gap-1.5 mt-0.5">
              <span>{profile.franchiseBrand}</span>
              <span>•</span>
              <span className="flex items-center text-sky-100">
                <Clock className="w-3 h-3 mr-1 opacity-70" />
                {currentTimeStr}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Today's Running Day Total (High Visibility) */}
        <div className="flex items-center gap-2">
          <div className="bg-sky-950/80 border border-sky-400/40 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-right shadow-sm">
            <span className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-sky-300 block leading-none">
              Today&apos;s Sales
            </span>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className="text-emerald-300 font-extrabold text-base sm:text-2xl leading-none flex items-center tracking-tight">
                <IndianRupee className="w-3.5 h-3.5 sm:w-5 sm:h-5 inline" />
                {todayRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] sm:text-xs text-sky-300 font-normal">
                ({todayCount})
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
