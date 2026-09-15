import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Check, 
  Search, 
  IndianRupee, 
  ShoppingCart, 
  X,
  Trash2,
  Receipt,
  RotateCcw
} from 'lucide-react';
import { Product } from '@/lib/types';
import confetti from 'canvas-confetti';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AddSaleViewProps {
  products: Product[];
  onRecordSale: (entry: {
    productId: string;
    productName: string;
    unit: string;
    quantity: number;
    priceAtSale: number;
    saleType?: 'retail' | 'wholesale';
    buyerName?: string;
    notes?: string;
  }) => void;
  onRecordMultipleSales?: (entries: Array<{
    productId: string;
    productName: string;
    unit: string;
    quantity: number;
    priceAtSale: number;
    saleType?: 'retail' | 'wholesale';
    buyerName?: string;
    notes?: string;
  }>) => void;
  onNavigateToToday: () => void;
}

export const AddSaleView: React.FC<AddSaleViewProps> = ({
  products,
  onRecordSale,
  onRecordMultipleSales,
  onNavigateToToday: _onNavigateToToday,
}) => {
  // Multi-product Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
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

  // Calculations across multi-item cart
  const cartSummary = useMemo(() => {
    let totalItems = 0;
    let totalQuantity = 0;
    let totalAmount = 0;

    cart.forEach((item) => {
      totalItems += 1;
      totalQuantity += item.quantity;
      totalAmount += Math.round(item.quantity * item.product.price * 100) / 100;
    });

    return {
      totalItems,
      totalQuantity,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }, [cart]);

  // Add product to cart or increment quantity if already added
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });

    // Smooth scroll to bill box on small screens
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const calcElem = document.getElementById('counter-calc-box');
        if (calcElem) {
          calcElem.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 50);
    }
  };

  // Update item quantity
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
        .filter((item): item is CartItem => item !== null);
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

  // Remove specific item from cart
  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCart([]);
  };

  // Commit / Record Sale for all items in the cart
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
        priceAtSale: item.product.price,
      }));

      if (onRecordMultipleSales) {
        onRecordMultipleSales(entries);
      } else {
        // Fallback if multiple handler not supplied
        entries.forEach((e) => onRecordSale(e));
      }

      // Visual summary notice
      const noticeText = cart.length === 1
        ? `Saved: ${cart[0].quantity} × ${cart[0].product.name} = ₹${cartSummary.totalAmount}`
        : `Saved Bill: ${cart.length} items (${cartSummary.totalQuantity} units) = ₹${cartSummary.totalAmount}`;
      
      setLastSavedNotice(noticeText);

      // Celebration confetti for substantial bills
      if (cartSummary.totalAmount >= 200 || cartSummary.totalQuantity >= 5) {
        try {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#0284c7', '#10b981', '#f59e0b'],
          });
        } catch {}
      }

      // Reset cart for next customer
      setCart([]);

      // Clear notice after 4 seconds
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
        <div className="bg-emerald-600 text-white px-3.5 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 sticky top-14 z-20">
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
        {/* Left Column: Product Selection List */}
        <div className="lg:col-span-7 space-y-2.5">
          {/* Search and Category Filter Bar */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <label htmlFor="retail-search" className="sr-only">Search products</label>
              <input
                id="retail-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milk, curd, ghee, paneer..."
                className="w-full pl-9 sm:pl-10 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600 font-medium text-slate-900 placeholder:text-slate-500"
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
                        ? 'bg-sky-700 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
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
                const inCartItem = cart.find((i) => i.product.id === prod.id);
                const isSelected = Boolean(inCartItem);

                return (
                  <button
                    key={prod.id}
                    onClick={() => handleAddToCart(prod)}
                    className={`w-full text-left p-2.5 sm:p-4 flex items-center justify-between gap-2.5 transition-all touch-active ${
                      isSelected
                        ? 'bg-sky-50/90 border-l-4 border-l-sky-600'
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
                      <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 font-medium">
                        {prod.unit} • <span className="text-sky-800 font-bold">{prod.category}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div className="bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border-2 border-slate-300">
                        <span className="text-xs sm:text-base font-extrabold text-slate-900">
                          ₹{prod.price}
                        </span>
                      </div>

                      {/* Quantity in bill indicator badge or Add icon */}
                      {isSelected ? (
                        <span className="bg-sky-600 text-white font-extrabold text-xs px-2 py-1 rounded-full min-w-[28px] text-center shadow-sm flex items-center gap-0.5">
                          <span>{inCartItem?.quantity}</span>
                          <span className="text-[9px] opacity-80">×</span>
                        </span>
                      ) : (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border border-slate-300 text-slate-400 hover:bg-sky-600 hover:text-white transition-colors">
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

        {/* Right Column: Multi-Product Counter Calculator / Bill Box */}
        <div id="counter-calc-box" className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-3.5 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-sky-600" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600">
                  Customer Bill ({cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'item' : 'items'})
                </span>
              </div>
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

            {cart.length > 0 ? (
              <div className="space-y-3 animate-in fade-in duration-150">
                {/* Scrollable list of items in current bill */}
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                  {cart.map((item) => {
                    const lineSubtotal = Math.round(item.quantity * item.product.price * 100) / 100;

                    return (
                      <div key={item.product.id} className="pt-2 first:pt-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[11px] text-slate-600 font-medium">
                              {item.product.unit} • ₹{item.product.price} each
                            </p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-sm sm:text-base text-slate-900">
                              ₹{lineSubtotal}
                            </span>
                          </div>

                          <button
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                            aria-label={`Remove ${item.product.name} from bill`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Quantity Adjuster */}
                        <div className="flex items-center justify-between mt-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleUpdateItemQuantity(item.product.id, -1)}
                              aria-label={`Decrease quantity of ${item.product.name}`}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm touch-active shadow-xs"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <label htmlFor={`qty-${item.product.id}`} className="sr-only">Quantity of {item.product.name}</label>
                            <input
                              id={`qty-${item.product.id}`}
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleSetItemQuantity(item.product.id, parseInt(e.target.value, 10))
                              }
                              className="w-12 text-center text-sm font-extrabold text-slate-900 bg-white border border-slate-200 rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />

                            <button
                              onClick={() => handleUpdateItemQuantity(item.product.id, 1)}
                              aria-label={`Increase quantity of ${item.product.name}`}
                              className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 flex items-center justify-center font-bold text-sm touch-active shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick shortcuts for this line (+1, +2, +5) */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 5].map((amt) => (
                              <button
                                key={amt}
                                onClick={() => handleUpdateItemQuantity(item.product.id, amt)}
                                className="text-[10px] px-1.5 py-0.5 bg-white hover:bg-slate-200 border border-slate-200 rounded-md font-semibold text-slate-600"
                              >
                                +{amt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grand Live Bill Total Card */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-center shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 border-b border-emerald-300 pb-1.5 mb-1.5">
                    <span>TOTAL UNITS: {cartSummary.totalQuantity}</span>
                    <span>{cartSummary.totalItems} PRODUCTS</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                    Grand Total
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-900 mt-0.5 flex items-center justify-center tracking-tight">
                    <IndianRupee className="w-6 h-6 sm:w-7 sm:h-7 inline text-emerald-700" />
                    {cartSummary.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Primary Record Bill Button */}
                <button
                  onClick={handleCommitSale}
                  disabled={isSaving || cart.length === 0}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-emerald-700/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-active cursor-pointer"
                >
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>
                    Record Bill (₹{cartSummary.totalAmount.toLocaleString('en-IN')})
                  </span>
                </button>
              </div>
            ) : (
              <div className="py-8 sm:py-12 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm sm:text-base">Tap products to add to bill</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 max-w-xs mx-auto">
                    You can add multiple different dairy products together and calculate the total in one bill.
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
