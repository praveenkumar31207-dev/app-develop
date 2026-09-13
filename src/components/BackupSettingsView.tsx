import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  Store, 
  FileSpreadsheet, 
  Database, 
  Check, 
  Cloud, 
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react';
import { ShopProfile } from '@/lib/types';
import { storage } from '@/lib/storage';
import { syncEngine } from '@/lib/sync';

interface BackupSettingsViewProps {
  profile: ShopProfile;
  onUpdateProfile: (profile: ShopProfile) => void;
  onDataResetOrImported: () => void;
  isOnline: boolean;
  isSyncing: boolean;
  onManualSync: () => void;
}

export const BackupSettingsView: React.FC<BackupSettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onDataResetOrImported,
  isOnline,
  isSyncing,
  onManualSync,
}) => {
  const [shopName, setShopName] = useState(profile.shopName);
  const [franchiseBrand, setFranchiseBrand] = useState(profile.franchiseBrand);
  const [tagline, setTagline] = useState(profile.tagline);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cloudMsg, setCloudMsg] = useState<string | null>(null);
  const [isRestoringCloud, setIsRestoringCloud] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const lastSynced = syncEngine.getLastSyncedAt();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ShopProfile = {
      ...profile,
      shopName: shopName.trim(),
      franchiseBrand: franchiseBrand.trim(),
      tagline: tagline.trim(),
    };
    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = storage.exportSalesToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `ShopCalci_Dairy_Sales_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Full JSON Backup Export
  const handleExportJSON = () => {
    const jsonContent = storage.exportFullBackupJSON();
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `ShopCalci_FullBackup_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Restore from Supabase Cloud
  const handleCloudRestore = async () => {
    if (!confirm('Download and restore the latest snapshot from your Supabase cloud database? This will sync your local parlour with the cloud.')) return;
    setIsRestoringCloud(true);
    const res = await syncEngine.restoreFromSupabase();
    setIsRestoringCloud(false);
    setCloudMsg(res.message);
    if (res.success) {
      onDataResetOrImported();
    }
  };

  // Clear all sales
  const handleClearSales = () => {
    if (confirm('Are you sure you want to clear ALL sales transactions? (Your product catalogue will remain intact). This cannot be undone.')) {
      storage.clearAllSales();
      onDataResetOrImported();
      alert('All sales records have been cleared.');
    }
  };

  // Demo sample generator
  const handleLoadSampleData = () => {
    if (confirm('Load 14 days of realistic Chennai dairy parlour demo sales? This will enrich the daily and monthly graphs for testing.')) {
      storage.populateSampleDemoData();
      onDataResetOrImported();
      alert('Sample sales transactions loaded successfully!');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 sm:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
          Cloud & Local Data
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
          Settings & Supabase Cloud Backup
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Sync sales to your Supabase cloud project, manage shop details, and export spreadsheets.
        </p>
      </div>

      {/* Supabase Cloud Sync Card */}
      <div className="bg-gradient-to-br from-white to-sky-50/50 p-4 sm:p-5 rounded-2xl border-2 border-sky-300 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Supabase Cloud Database
              </h3>
              <p className="text-[11px] text-slate-500">
                Project ID: <span className="font-mono text-sky-800 font-semibold">ibgckqkoxmamddaixwud</span>
              </p>
            </div>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            isOnline 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}>
            {isOnline ? 'Online (Ready to sync)' : 'Offline'}
          </span>
        </div>

        {cloudMsg && (
          <div className="bg-white p-3 rounded-xl border border-sky-200 text-xs text-sky-900 font-medium">
            {cloudMsg}
          </div>
        )}

        <div className="text-xs text-slate-600">
          <p>
            When online, your parlour sales, totals, and catalogue automatically create cloud backups to your Supabase database. You can also trigger an immediate sync or restore across devices.
          </p>
          {lastSynced && (
            <p className="text-[11px] text-slate-400 mt-1">
              Last Synced to Cloud: {new Date(lastSynced).toLocaleString('en-IN')}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={onManualSync}
            disabled={isSyncing || !isOnline}
            className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 touch-active"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing to Cloud...' : 'Backup Now to Supabase'}</span>
          </button>

          <button
            onClick={handleCloudRestore}
            disabled={isRestoringCloud || !isOnline}
            className="py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 touch-active"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>{isRestoringCloud ? 'Restoring...' : 'Restore from Cloud'}</span>
          </button>
        </div>
      </div>

      {/* Parlour Profile Form */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Shop Name & Franchise Header
            </h3>
          </div>
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
              <Check className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Shop / Outlet Name
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Franchise Brand
              </label>
              <input
                type="text"
                required
                value={franchiseBrand}
                onChange={(e) => setFranchiseBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20"
            >
              Update Shop Details
            </button>
          </div>
        </form>
      </div>

      {/* Spreadsheet Export & Local File Backup */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-600" />
            Spreadsheet & File Exports
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportCSV}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors flex items-center gap-3 touch-active"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">Export Sales to CSV / Excel</p>
              <p className="text-[11px] text-slate-500">Download clean spreadsheet of all sales</p>
            </div>
          </button>

          <button
            onClick={handleExportJSON}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors flex items-center gap-3 touch-active"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">Download Full JSON Backup</p>
              <p className="text-[11px] text-slate-500">Full backup file of products & sales</p>
            </div>
          </button>
        </div>
      </div>

      {/* Demo & Reset Utilities */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400" />
          Test Utilities & Reset
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <button
            onClick={handleLoadSampleData}
            className="flex-1 py-2.5 px-3 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center gap-2 touch-active"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load 14 Days Sample Demo Sales</span>
          </button>

          <button
            onClick={handleClearSales}
            className="py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 touch-active"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Sales Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
