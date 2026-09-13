import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Check, 
  Search, 
  IndianRupee, 
  Truck, 
  X,
  Package,
  Building2,
  Boxes,
  FileText
} from 'lucide-react';
import { Product } from '@/lib/types';
import confetti from 'canvas-confetti';

interface WholesaleSaleViewProps {
  products: Product[];
  onRecordSale: (entry: {
    productId: string;
    productName: string;
    unit: string;
    quantity: number;
    priceAtSale: number;
    saleType: 'wholesale';
    buyerName?: string;
    notes?: string;
  }) => void;
  onNavigateToToday: () => void;
}

const COMMON_BUYERS = [
  'Murugan Tea Stall',
  'Hotel Saravana Bhavan',
  'Annapoorna Mess',
  'Sri Krishna Sweets',
  'Sangeetha Bakery',
  'Local Canteen',
  'Hostel Mess',
];

export const WholesaleSaleView: React.FC<WholesaleSaleViewProps> = ({
  products,
  onRecordSale,
  onNavigateToToday,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cratesCount, setCratesCount] = useState<number>(1);
  const [looseUnits, setLooseUnits] = useState<number>(0);
  const [buyerName, setBuyerName] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.isActive);
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    activeProducts.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    return activeProducts.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.tamilName && p.tamilName.includes(q)) ||
        p.unit.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeProducts, selectedCategory, searchQuery]);

  // Crate size for the selected item (default to 20 packets/crate if not specified)
  const crateSize = selectedProduct?.wholesaleCrateSize || 20;

  // Wholesale unit price (falls back to 90% of retail price if not configured)
  const defaultWholesaleUnitPrice = selectedProduct
    ? (selectedProduct.wholesalePrice || Math.round(selectedProduct.price * 0.9 * 10) / 10)
    : 0;

  const effectiveUnitPrice = customPrice !== '' ? Number(customPrice) : defaultWholesaleUnitPrice;

  // Total quantity = crates * crateSize + looseUnits
  const totalUnits = cratesCount * crateSize + looseUnits;
  const lineTotal = Math.round(totalUnits * effectiveUnitPrice * 100) / 100;
  const crateTotal = Math.round(crateSize * effectiveUnitPrice * 100) / 100;

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setCratesCount(1);
    setLooseUnits(0);
    setCustomPrice(prod.wholesalePrice || Math.round(prod.price * 0.9 * 10) / 10);

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const calcElem = document.getElementById('wholesale-calc-box');
        if (calcElem) {
          calcElem.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 50);
    }
  };

  const handleCommitWholesale = () => {
    if (!selectedProduct || totalUnits <= 0 || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSaving(true);

    try {
      onRecordSale({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        unit: selectedProduct.unit,
        quantity: totalUnits,
        priceAtSale: effectiveUnitPrice,
        saleType: 'wholesale',
        buyerName: buyerName.trim() || 'Cash Wholesale Buyer',
        notes: notes.trim() || `${cratesCount} crates (${crateSize}/crate)${looseUnits ? ` + ${looseUnits} units` : ''}`,
      });

      const notice = `Wholesale Recorded: ${cratesCount} crates (${totalUnits} units) of ${selectedProduct.name} to "${buyerName || 'Buyer'}" = ₹${lineTotal.toLocaleString('en-IN')}`;
      setLastSavedNotice(notice);

      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#d97706', '#059669', '#0284c7'],
        });
      } catch {}

      setSelectedProduct(null);
      setCratesCount(1);
      setLooseUnits(0);
      setCustomPrice('');
      setNotes('');

      setTimeout(() => {
        setLastSavedNotice((cur) => (cur === notice ? null : cur));
      }, 4000);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
        isSubmittingRef.current = false;
      }, 300);
    }
  };

  return (
    <div className="space-y-3 pb-32 sm:pb-24 max-w-5xl mx-auto">
      {/* Top Banner Notice */}
      {lastSavedNotice && (
        <div className="bg-amber-600 text-white px-3.5 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 sticky top-14 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <Check className="w-4 h-4 bg-white/20 rounded-full p-0.5 shrink-0" />
            <span className="font-semibold text-xs sm:text-sm truncate">{lastSavedNotice}</span>
          </div>
          <button
            onClick={() => setLastSavedNotice(null)}
            className="text-white/80 hover:text-white p-1 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            Wholesale & Bulk Supply Counter
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            B2B Crate & Bulk Sales
          </h2>
          <p className="text-xs text-amber-200/80">
            Record bulk supply to tea stalls, hotels, messes & caterers with automated crate calculations and party tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
        {/* Left Column: Product Selection */}
        <div className="lg:col-span-7 space-y-2.5">
          {/* Search and Categories */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milk crates, curd bulk, paneer..."
                className="w-full pl-9 sm:pl-10 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all touch-active ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Items List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="font-medium text-xs sm:text-sm">No dairy products matched your filter.</p>
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;
                const cSize = prod.wholesaleCrateSize || 20;
                const wsPrice = prod.wholesalePrice || Math.round(prod.price * 0.9 * 10) / 10;
                const cPrice = Math.round(cSize * wsPrice);

                return (
                  <button
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className={`w-full text-left p-2.5 sm:p-4 flex items-center justify-between gap-2.5 transition-all touch-active ${
                      isSelected
                        ? 'bg-amber-50 ring-2 ring-inset ring-amber-500'
                        : 'hover:bg-slate-50 active:bg-slate-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-base leading-tight">
                          {prod.name}
                        </span>
                        {prod.tamilName && (
                          <span className="text-[10px] sm:text-xs font-medium text-slate-400 truncate">
                            ({prod.tamilName})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-2">
                        <span>{prod.unit}</span>
                        <span>•</span>
                        <span className="text-amber-800 font-semibold flex items-center gap-1">
                          <Boxes className="w-3 h-3 inline" />
                          {cSize} per crate (~₹{cPrice}/crate)
                        </span>
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div className="bg-amber-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-amber-200 text-right">
                        <span className="text-xs sm:text-base font-extrabold text-amber-900 block leading-tight">
                          ₹{wsPrice}
                        </span>
                        <span className="text-[9px] text-amber-700 uppercase font-semibold">
                          Bulk Rate
                        </span>
                      </div>
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-amber-600 text-white'
                            : 'border border-slate-300 text-slate-400'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Wholesale Calculator & Party Details */}
        <div id="wholesale-calc-box" className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-md p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                Wholesale Counter Calculator
              </span>
              {selectedProduct && (
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {selectedProduct ? (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                {/* Selected Item Summary Card */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-xs text-amber-900 font-medium mt-0.5">
                    1 Crate = {crateSize} units • Retail: ₹{selectedProduct.price} | Wholesale: ₹{defaultWholesaleUnitPrice}
                  </p>
                </div>

                {/* Buyer / Party Name with Quick Picks */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    Buyer / Party Name
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Murugan Tea Stall / Hotel..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {/* Quick Party chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pt-1.5 pb-0.5 scrollbar-none">
                    {COMMON_BUYERS.slice(0, 4).map((b) => (
                      <button
                        key={b}
                        onClick={() => setBuyerName(b)}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 rounded-md font-medium whitespace-nowrap transition-colors"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crates Count (Major wholesale metric) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Boxes className="w-3.5 h-3.5 text-amber-600" />
                      Number of Crates ({crateSize} units/crate)
                    </label>
                    <span className="text-xs font-bold text-amber-800">
                      = {cratesCount * crateSize} units
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCratesCount((prev) => Math.max(1, prev - 1))}
                      disabled={cratesCount <= 1}
                      className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-800 font-extrabold text-xl border border-slate-200 touch-active"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <input
                      type="number"
                      min={1}
                      value={cratesCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCratesCount(isNaN(val) || val < 1 ? 1 : val);
                      }}
                      className="flex-1 h-12 text-center text-2xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                    />

                    <button
                      onClick={() => setCratesCount((prev) => prev + 1)}
                      className="w-12 h-12 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-xl border border-amber-200 touch-active"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Crate Quick Multipliers (+1, +2, +5, +10 crates) */}
                  <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                    {[1, 2, 5, 10].map((inc) => (
                      <button
                        key={inc}
                        onClick={() => setCratesCount((prev) => prev + inc)}
                        className="py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 touch-active"
                      >
                        +{inc} Crates
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Loose Units (optional) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      + Extra Loose Units
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={looseUnits}
                      onChange={(e) => setLooseUnits(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Wholesale Rate (₹/unit)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Auto Calculated Wholesale Total */}
                <div className="bg-amber-500/10 border-2 border-amber-300 rounded-xl p-3 text-center">
                  <span className="text-[10px] sm:text-xs font-bold text-amber-900 uppercase tracking-wider block">
                    Total Wholesale Bill
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-0.5 flex items-center justify-center tracking-tight">
                    <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 inline text-amber-700" />
                    {lineTotal.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                    {totalUnits} units total ({cratesCount} crates × ₹{crateTotal})
                  </p>
                </div>

                {/* Record Button */}
                <button
                  onClick={handleCommitWholesale}
                  disabled={isSaving || totalUnits <= 0}
                  className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-base shadow-lg shadow-amber-700/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-active"
                >
                  <Truck className="w-5 h-5" />
                  <span>Record Wholesale Sale (₹{lineTotal.toLocaleString('en-IN')})</span>
                </button>
              </div>
            ) : (
              <div className="py-8 sm:py-12 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-amber-50 mx-auto flex items-center justify-center text-amber-600">
                  <Boxes className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm sm:text-base">Select product for wholesale</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Tap a dairy item to record crates, buyer party, and custom wholesale rates.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
