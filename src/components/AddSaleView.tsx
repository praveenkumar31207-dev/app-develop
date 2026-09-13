import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Check, 
  Search, 
  IndianRupee, 
  Sparkles, 
  X,
  ChevronDown
} from 'lucide-react';
import { Product } from '@/lib/types';
import confetti from 'canvas-confetti';

interface AddSaleViewProps {
  products: Product[];
  onRecordSale: (entry: {
    productId: string;
    productName: string;
    unit: string;
    quantity: number;
    priceAtSale: number;
  }) => void;
  onNavigateToToday: () => void;
}

export const AddSaleView: React.FC<AddSaleViewProps> = ({
  products,
  onRecordSale,
  onNavigateToToday,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  // Active products only
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.isActive);
  }, [products]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    activeProducts.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [activeProducts]);

  // Filtered by category and search
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

  const lineTotal = selectedProduct ? Math.round(quantity * selectedProduct.price * 100) / 100 : 0;

  // Handle selecting a product row
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    // Smooth scroll to calculator on small screens
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const calcElem = document.getElementById('counter-calc-box');
        if (calcElem) {
          calcElem.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 50);
    }
  };

  // Quick increment buttons (+1, +2, +5, +10)
  const handleAddQuantity = (increment: number) => {
    setQuantity((prev) => Math.max(1, prev + increment));
  };

  // Commit sale with duplicate double-tap debounce
  const handleCommitSale = () => {
    if (!selectedProduct || quantity <= 0 || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSaving(true);

    try {
      onRecordSale({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        unit: selectedProduct.unit,
        quantity: Number(quantity),
        priceAtSale: selectedProduct.price,
      });

      // Quick visual feedback
      const noticeText = `Saved: ${quantity} × ${selectedProduct.name} = ₹${lineTotal}`;
      setLastSavedNotice(noticeText);

      // Confetti burst on big sales
      if (lineTotal >= 200 || quantity >= 5) {
        try {
          confetti({
            particleCount: 25,
            spread: 45,
            origin: { y: 0.8 },
            colors: ['#0284c7', '#10b981', '#f59e0b'],
          });
        } catch {}
      }

      // Reset selection for next counter sale
      setSelectedProduct(null);
      setQuantity(1);

      // Clear notice after 3.5 seconds
      setTimeout(() => {
        setLastSavedNotice((current) => (current === noticeText ? null : current));
      }, 3500);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
        isSubmittingRef.current = false;
      }, 300);
    }
  };

  return (
    <div className="space-y-3 pb-32 sm:pb-24 max-w-5xl mx-auto">
      {/* Top Banner with Quick Saved Feedback */}
      {lastSavedNotice && (
        <div className="bg-emerald-600 text-white px-3.5 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 sticky top-14 z-20">
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
        {/* Left Column: Product Selection List */}
        <div className="lg:col-span-7 space-y-2.5">
          {/* Search and Category Filter Bar */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milk, curd, ghee, paneer..."
                className="w-full pl-9 sm:pl-10 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800 placeholder:text-slate-400"
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

            {/* Category Pills (Touch friendly horizontal scroll) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all touch-active ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Items List (Mobile-Optimized Touch Cards) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="font-medium text-xs sm:text-sm">No dairy products matched your filter.</p>
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className={`w-full text-left p-2.5 sm:p-4 flex items-center justify-between gap-2.5 transition-all touch-active ${
                      isSelected
                        ? 'bg-sky-50 ring-2 ring-inset ring-sky-500'
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
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                        {prod.unit} • <span className="text-sky-700 font-semibold">{prod.category}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div className="bg-slate-100/90 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200">
                        <span className="text-xs sm:text-base font-extrabold text-slate-900">
                          ₹{prod.price}
                        </span>
                      </div>
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-sky-600 text-white'
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

        {/* Right Column / Sticky Bottom Sheet on Mobile: Active Calculator */}
        <div id="counter-calc-box" className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                Counter Calculator
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
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-xs text-sky-800 font-medium mt-0.5">
                    {selectedProduct.unit} • Price: ₹{selectedProduct.price}
                  </p>
                </div>

                {/* Quantity Stepper with Big Buttons */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Quantity Sold
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => handleAddQuantity(-1)}
                      disabled={quantity <= 1}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-800 font-extrabold text-xl border border-slate-200 touch-active shadow-sm"
                    >
                      <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setQuantity(isNaN(val) || val < 1 ? 1 : val);
                      }}
                      className="flex-1 h-12 sm:h-14 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-sky-600 focus:outline-none"
                    />

                    <button
                      onClick={() => handleAddQuantity(1)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-xl border border-sky-200 touch-active shadow-sm"
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Quick Quantity Buttons (+1, +2, +5, +10) */}
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                    {[1, 2, 5, 10].map((inc) => (
                      <button
                        key={inc}
                        onClick={() => handleAddQuantity(inc)}
                        className="py-1.5 sm:py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 touch-active"
                      >
                        +{inc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Auto-Calculated Total */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Line Total
                  </span>
                  <div className="text-2xl sm:text-4xl font-black text-emerald-700 mt-0.5 flex items-center justify-center tracking-tight">
                    <IndianRupee className="w-5 h-5 sm:w-7 sm:h-7 inline" />
                    {lineTotal.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] sm:text-xs text-emerald-600 mt-0.5">
                    ({quantity} × ₹{selectedProduct.price})
                  </p>
                </div>

                {/* Big Action Button to Record */}
                <button
                  onClick={handleCommitSale}
                  disabled={isSaving || quantity <= 0}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-emerald-700/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-active"
                >
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Record Sale (₹{lineTotal})</span>
                </button>
              </div>
            ) : (
              <div className="py-8 sm:py-12 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm sm:text-base">Tap any product to enter sale</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Select a product above to calculate and record.
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
