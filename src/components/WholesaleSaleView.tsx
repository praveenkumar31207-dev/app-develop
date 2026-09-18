import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Check, 
  Search, 
  IndianRupee, 
  Truck, 
  X,
  Building2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Product } from '@/lib/types';
import confetti from 'canvas-confetti';

export interface WholesaleCartItem {
  product: Product;
  quantity: number;
  customPrice: number;
}

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
  onRecordMultipleSales?: (entries: Array<{
    productId: string;
    productName: string;
    unit: string;
    quantity: number;
    priceAtSale: number;
    saleType: 'wholesale';
    buyerName?: string;
    notes?: string;
  }>) => void;
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
  onRecordMultipleSales,
}) => {
  // Multi-item Wholesale Cart
  const [cart, setCart] = useState<WholesaleCartItem[]>([]);
  const [buyerName, setBuyerName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  // Active products
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.isActive);
  }, [products]);

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    activeProducts.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [activeProducts]);

  // Filter products
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

  // Calculate default wholesale price for a product
  const getDefaultWholesalePrice = (product: Product): number => {
    return product.wholesalePrice || Math.round(product.price * 0.9 * 10) / 10;
  };

  // Add product to wholesale order
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        // Add 5 more if already in bulk cart
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 5,
        };
        return updated;
      } else {
        const initialPrice = getDefaultWholesalePrice(product);
        return [...prev, { product, quantity: 10, customPrice: initialPrice }];
      }
    });

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const calcElem = document.getElementById('wholesale-counter-calc-box');
        if (calcElem) {
          calcElem.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 50);
    }
  };

  // Adjust item quantity
  const handleUpdateItemQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is WholesaleCartItem => item !== null);
    });
  };

  // Set explicit quantity
  const handleSetItemQuantity = (productId: string, val: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.max(1, isNaN(val) ? 1 : val) };
        }
        return item;
      });
    });
  };

  // Set explicit custom price per item
  const handleSetItemPrice = (productId: string, val: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, customPrice: Math.max(0, isNaN(val) ? 0 : val) };
        }
        return item;
      });
    });
  };

  // Remove item
  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear entire order
  const handleClearCart = () => {
    setCart([]);
  };

  // Cart totals summary
  const wholesaleSummary = useMemo(() => {
    let totalItems = 0;
    let totalUnits = 0;
    let totalAmount = 0;

    cart.forEach((item) => {
      totalItems += 1;
      totalUnits += item.quantity;
      totalAmount += Math.round(item.quantity * item.customPrice * 100) / 100;
    });

    return {
      totalItems,
      totalUnits,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }, [cart]);

  // Commit Wholesale Order
  const handleCommitSale = () => {
    if (cart.length === 0 || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSaving(true);

    try {
      const entries = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        unit: item.product.unit,
        quantity: Number(item.quantity),
        priceAtSale: item.customPrice,
        saleType: 'wholesale' as const,
        buyerName: buyerName.trim() || undefined,
      }));

      if (onRecordMultipleSales) {
        onRecordMultipleSales(entries);
      } else {
        entries.forEach((e) => onRecordSale(e));
      }

      const buyerLabel = buyerName.trim() ? ` for ${buyerName.trim()}` : '';
      const noticeText = cart.length === 1
        ? `Saved Wholesale: ${cart[0].quantity} × ${cart[0].product.name}${buyerLabel} = ₹${wholesaleSummary.totalAmount}`
        : `Saved Wholesale Order${buyerLabel}: ${cart.length} items (${wholesaleSummary.totalUnits} units) = ₹${wholesaleSummary.totalAmount}`;
      
      setLastSavedNotice(noticeText);

      // Confetti burst
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#d97706', '#b45309', '#f59e0b'],
        });
      } catch {}

      // Reset cart
      setCart([]);
      setBuyerName('');

      setTimeout(() => {
        setLastSavedNotice((current) => (current === noticeText ? null : current));
      }, 4000);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
        isSubmittingRef.current = false;
      }, 300);
    }
  };

  return (
    <div className="space-y-3 pb-32 sm:pb-24 max-w-6xl mx-auto">
      {/* Top Banner with Quick Saved Feedback */}
      {lastSavedNotice && (
        <div className="bg-amber-600 text-white px-3.5 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 sticky top-14 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <Check className="w-4 h-4 bg-white/20 rounded-full p-0.5 shrink-0" />
            <span className="font-semibold text-xs sm:text-sm truncate">{lastSavedNotice}</span>
          </div>
          <button
            onClick={() => setLastSavedNotice(null)}
            aria-label="Dismiss notification"
            className="text-white/80 hover:text-white p-1 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Wholesale Counter Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h2 className="font-extrabold text-base sm:text-lg">Wholesale & Bulk Counter</h2>
            <p className="text-[11px] text-amber-200/90">
              Calculate multiple bulk products together with wholesale rates
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
        {/* Left Column: Product Selection List */}
        <div className="lg:col-span-7 space-y-2.5">
          {/* Search and Category Filter Bar */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <label htmlFor="wholesale-search" className="sr-only">Search wholesale products</label>
              <input
                id="wholesale-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milk, curd, ghee, paneer..."
                className="w-full pl-9 sm:pl-10 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 font-medium text-slate-900 placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all touch-active ${
                      isActive
                        ? 'bg-amber-700 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Items List (Wholesale Prices) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="font-medium text-xs sm:text-sm">No dairy products matched your filter.</p>
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const inCartItem = cart.find((i) => i.product.id === prod.id);
                const isSelected = Boolean(inCartItem);
                const wsPrice = getDefaultWholesalePrice(prod);

                return (
                  <button
                    key={prod.id}
                    onClick={() => handleAddToCart(prod)}
                    className={`w-full text-left p-2.5 sm:p-4 flex items-center justify-between gap-2.5 transition-all touch-active ${
                      isSelected
                        ? 'bg-amber-50/90 border-l-4 border-l-amber-600'
                        : 'hover:bg-slate-50 active:bg-slate-100'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
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
                      <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 font-medium flex items-center gap-1.5">
                        <span>{prod.unit}</span>
                        <span>•</span>
                        <span className="line-through text-slate-400">₹{prod.price} retail</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div className="bg-amber-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-amber-200 text-right">
                        <span className="text-xs sm:text-base font-extrabold text-amber-900 block leading-tight">
                          ₹{wsPrice}
                        </span>
                        <span className="text-[9px] text-amber-700 font-bold uppercase">
                          Wholesale
                        </span>
                      </div>

                      {/* Quantity in bill indicator badge or Add icon */}
                      {isSelected ? (
                        <span className="bg-amber-600 text-white font-extrabold text-xs px-2 py-1 rounded-full min-w-[32px] text-center shadow-sm flex items-center gap-0.5">
                          <span>{inCartItem?.quantity}</span>
                          <span className="text-[9px] opacity-80">u</span>
                        </span>
                      ) : (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border border-slate-300 text-slate-400 hover:bg-amber-600 hover:text-white transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Wholesale Multi-Product Calculator & Party Order Box */}
        <div id="wholesale-counter-calc-box" className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-md p-3.5 sm:p-5 space-y-3 sm:space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                Wholesale Order ({wholesaleSummary.totalItems} {wholesaleSummary.totalItems === 1 ? 'item' : 'items'})
              </span>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            {/* Party / Buyer Name Field (Applies to the entire bulk order) */}
            <div>
              <label htmlFor="buyer-name" className="block text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                Buyer / Party Name (Optional)
              </label>
              <input
                id="buyer-name"
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. Murugan Tea Stall / Hotel Saravana..."
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

            {cart.length > 0 ? (
              <div className="space-y-3 animate-in fade-in duration-150">
                {/* Scrollable list of items in current wholesale bill */}
                <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100">
                  {cart.map((item) => {
                    const lineSubtotal = Math.round(item.quantity * item.customPrice * 100) / 100;

                    return (
                      <div key={item.product.id} className="pt-2 first:pt-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[11px] text-amber-900 font-semibold">
                              {item.product.unit}
                            </p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-sm sm:text-base text-amber-900">
                              ₹{lineSubtotal.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <button
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                            aria-label={`Remove ${item.product.name} from wholesale order`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Controls: Bulk Quantity & Wholesale Unit Price */}
                        <div className="mt-1.5 bg-amber-50/50 p-2 rounded-xl border border-amber-200/70 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            {/* Quantity Stepper */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateItemQuantity(item.product.id, -1)}
                                aria-label={`Decrease quantity of ${item.product.name}`}
                                className="w-7 h-7 rounded-lg bg-white border border-amber-200 text-slate-700 hover:bg-amber-100 flex items-center justify-center font-bold text-sm touch-active shadow-xs"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <label htmlFor={`ws-qty-${item.product.id}`} className="sr-only">Quantity of {item.product.name}</label>
                              <input
                                id={`ws-qty-${item.product.id}`}
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleSetItemQuantity(item.product.id, parseInt(e.target.value, 10))
                                }
                                className="w-14 text-center text-sm font-extrabold text-amber-950 bg-white border border-amber-200 rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />

                              <button
                                onClick={() => handleUpdateItemQuantity(item.product.id, 1)}
                                aria-label={`Increase quantity of ${item.product.name}`}
                                className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200 flex items-center justify-center font-bold text-sm touch-active shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Editable Wholesale Rate */}
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-slate-500 font-semibold">@ ₹</span>
                              <label htmlFor={`ws-price-${item.product.id}`} className="sr-only">Wholesale price per unit for {item.product.name}</label>
                              <input
                                id={`ws-price-${item.product.id}`}
                                type="number"
                                step={0.1}
                                value={item.customPrice}
                                onChange={(e) =>
                                  handleSetItemPrice(item.product.id, parseFloat(e.target.value) || 0)
                                }
                                className="w-16 px-1.5 py-0.5 text-right font-bold text-amber-900 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </div>
                          </div>

                          {/* Bulk Multipliers (+5, +10, +20, +50) */}
                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-amber-200/50">
                            <span className="text-[10px] text-amber-800 font-semibold">Bulk Add:</span>
                            <div className="flex items-center gap-1">
                              {[5, 10, 20, 50].map((amt) => (
                                <button
                                  key={amt}
                                  onClick={() => handleUpdateItemQuantity(item.product.id, amt)}
                                  className="text-[10px] px-1.5 py-0.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-md font-bold text-amber-900"
                                >
                                  +{amt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grand Live Wholesale Bill Total Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-center shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950 border-b border-amber-300 pb-1.5 mb-1.5">
                    <span>TOTAL UNITS: {wholesaleSummary.totalUnits}</span>
                    <span>{wholesaleSummary.totalItems} PRODUCTS</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-amber-950 uppercase tracking-wider block">
                    Grand Wholesale Total
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-amber-950 mt-0.5 flex items-center justify-center tracking-tight">
                    <IndianRupee className="w-6 h-6 sm:w-7 sm:h-7 inline text-amber-800" />
                    {wholesaleSummary.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Primary Record Wholesale Order Button */}
                <button
                  onClick={handleCommitSale}
                  disabled={isSaving || cart.length === 0}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-amber-700/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-active cursor-pointer"
                >
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>
                    Record Wholesale (₹{wholesaleSummary.totalAmount.toLocaleString('en-IN')})
                  </span>
                </button>
              </div>
            ) : (
              <div className="py-8 sm:py-12 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-amber-50 mx-auto flex items-center justify-center text-amber-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm sm:text-base">Tap products to add to wholesale order</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 max-w-xs mx-auto">
                    Select multiple wholesale items together, customize quantities and rates, and record one consolidated order.
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
