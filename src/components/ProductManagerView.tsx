import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { 
  Plus, 
  Edit2, 
  Check, 
  X, 
  RotateCcw, 
  IndianRupee,
  Sparkles,
  Boxes,
  Truck,
  Bot,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ProductManagerViewProps {
  products: Product[];
  onAddProduct: (prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onResetToDefault: () => void;
}

export const ProductManagerView: React.FC<ProductManagerViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onResetToDefault,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Groq AI Assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for new product
  const [newName, setNewName] = useState('');
  const [newTamilName, setNewTamilName] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('Milk');
  const [newUnit, setNewUnit] = useState('500ml pouch');
  const [newPrice, setNewPrice] = useState<number>(25);
  const [newWholesalePrice, setNewWholesalePrice] = useState<number>(22);
  const [newCrateSize, setNewCrateSize] = useState<number>(20);

  // Form states for edit product
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editWholesalePrice, setEditWholesalePrice] = useState<number>(0);
  const [editCrateSize, setEditCrateSize] = useState<number>(20);
  const [editUnit, setEditUnit] = useState('');
  const [editCategory, setEditCategory] = useState<Product['category']>('Milk');

  // Handle Groq AI Natural Language Update
  const handleAiSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim() || isAiLoading) return;

    setIsAiLoading(true);
    setAiMessage(null);

    try {
      const res = await fetch('/api/ai-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          products,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to process request with Groq AI');
      }

      let appliedUpdates = 0;
      let appliedAdditions = 0;

      if (data.updates && Array.isArray(data.updates) && data.updates.length > 0) {
        for (const update of data.updates) {
          if (update.id) {
            const changes = update.changes || { ...update };
            delete changes.id;
            if (Object.keys(changes).length > 0) {
              onUpdateProduct(update.id, changes);
              appliedUpdates++;
            }
          }
        }
      }

      if (data.additions && Array.isArray(data.additions) && data.additions.length > 0) {
        for (const add of data.additions) {
          if (add.name && add.price) {
            onAddProduct({
              name: String(add.name).trim(),
              tamilName: add.tamilName ? String(add.tamilName).trim() : undefined,
              category: add.category || 'Curd & Dairy',
              unit: add.unit ? String(add.unit).trim() : '1 unit',
              price: Number(add.price),
              wholesalePrice: add.wholesalePrice ? Number(add.wholesalePrice) : Number(add.price),
              wholesaleCrateSize: add.wholesaleCrateSize ? Number(add.wholesaleCrateSize) : 20,
              isActive: add.isActive !== undefined ? Boolean(add.isActive) : true,
              sortOrder: products.length + appliedAdditions + 1,
            });
            appliedAdditions++;
          }
        }
      }

      if (appliedUpdates > 0 || appliedAdditions > 0) {
        const parts: string[] = [];
        if (appliedUpdates > 0) parts.push(`updated ${appliedUpdates} product(s)`);
        if (appliedAdditions > 0) parts.push(`added ${appliedAdditions} new product(s)`);

        setAiMessage({
          type: 'success',
          text: data.explanation || `Successfully ${parts.join(' and ')}!`,
        });
        setAiPrompt('');
      } else {
        setAiMessage({
          type: 'error',
          text: data.explanation || 'Could not find any products to update or add.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAiMessage({ type: 'error', text: `Groq AI error: ${msg}` });
    } finally {
      setIsAiLoading(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(p.price);
    setEditWholesalePrice(p.wholesalePrice || Math.round(p.price * 0.9 * 10) / 10);
    setEditCrateSize(p.wholesaleCrateSize || 20);
    setEditUnit(p.unit);
    setEditCategory(p.category);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim() || editPrice <= 0) return;
    onUpdateProduct(id, {
      name: editName.trim(),
      price: Number(editPrice),
      wholesalePrice: Number(editWholesalePrice) || Number(editPrice),
      wholesaleCrateSize: Number(editCrateSize) || 20,
      unit: editUnit.trim(),
      category: editCategory,
    });
    setEditingId(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPrice <= 0) return;

    onAddProduct({
      name: newName.trim(),
      tamilName: newTamilName.trim() || undefined,
      category: newCategory,
      unit: newUnit.trim(),
      price: Number(newPrice),
      wholesalePrice: Number(newWholesalePrice) || Number(newPrice),
      wholesaleCrateSize: Number(newCrateSize) || 20,
      isActive: true,
      sortOrder: products.length + 1,
    });

    setNewName('');
    setNewTamilName('');
    setNewPrice(25);
    setNewWholesalePrice(22);
    setNewCrateSize(20);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
            Admin Catalogue
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Retail & Wholesale Rates
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure retail prices (₹), bulk wholesale rates, crate units, or toggle active status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Reset catalogue to Chennai dairy default products with wholesale rates?')) {
                onResetToDefault();
              }
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Groq AI Product Assistant Bar */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-purple-500/30 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center border border-purple-400/40 text-purple-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Groq AI Product Assistant
                <span className="text-[10px] font-semibold tracking-wide bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                  Groq Cloud AI
                </span>
              </h3>
            </div>
            <p className="text-xs text-purple-200/80">
              Ask in plain English or Tamil-English to update prices, wholesale rates, or add brand new products instantly.
            </p>
          </div>
        </div>

        <form onSubmit={handleAiSubmit} className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder='e.g., "Add Butter Milk 200ml for 15 rs", "Change Double Toned Milk price to 45"'
              disabled={isAiLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-purple-400/40 text-xs sm:text-sm text-white placeholder:text-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <button
            type="submit"
            disabled={isAiLoading || !aiPrompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-900/40 flex items-center justify-center gap-2 transition"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Apply with AI</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-purple-200/70">
          <span className="font-semibold text-purple-300">Quick prompts:</span>
          {[
            'Change Double Toned Milk 500 ML price to ₹44',
            'FCM 500 ML wholesale to ₹70',
            'Set Curd T.M. Cup price to ₹15',
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => {
                setAiPrompt(promptText);
              }}
              className="px-2 py-0.5 rounded-md bg-purple-800/40 hover:bg-purple-700/60 text-purple-200 border border-purple-400/20 transition text-[10px]"
            >
              &quot;{promptText}&quot;
            </button>
          ))}
        </div>

        {/* Response Alert */}
        {aiMessage && (
          <div
            className={`mt-3 p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2 animate-in fade-in ${
              aiMessage.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
            }`}
          >
            {aiMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span>{aiMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setAiMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Add Product Form Modal */}
      {isAdding && (
        <form
          onSubmit={handleCreateProduct}
          className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-sky-300 shadow-md space-y-3.5 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Add New Dairy Product</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Product Name (English) *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Toned Milk / Curd"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tamil / Local Name (Optional)
              </label>
              <input
                type="text"
                value={newTamilName}
                onChange={(e) => setNewTamilName(e.target.value)}
                placeholder="e.g. டோன்ட் பால்"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Product['category'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Milk">Milk</option>
                <option value="Curd & Dairy">Curd & Dairy</option>
                <option value="Beverages">Beverages</option>
                <option value="Ghee & Fats">Ghee & Fats</option>
                <option value="Paneer & Sweets">Paneer & Sweets</option>
                <option value="Ice Cream">Ice Cream</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Unit / Pack Size *</label>
              <input
                type="text"
                required
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="e.g. 500ml pouch, 1L jar"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                Retail Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                step={0.5}
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-300 text-xs sm:text-sm font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                Wholesale Bulk Price (₹)
              </label>
              <input
                type="number"
                min={1}
                step={0.5}
                value={newWholesalePrice}
                onChange={(e) => setNewWholesalePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-amber-50/50 border border-amber-300 text-xs sm:text-sm font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Boxes className="w-3.5 h-3.5 text-slate-400" />
                Units per Crate
              </label>
              <input
                type="number"
                min={1}
                value={newCrateSize}
                onChange={(e) => setNewCrateSize(parseInt(e.target.value, 10) || 20)}
                placeholder="20"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Save Product
            </button>
          </div>
        </form>
      )}

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        <div className="bg-slate-50 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Product & Unit</span>
          <div className="flex items-center gap-5 sm:gap-8 pr-1">
            <span>Retail Rate</span>
            <span>Wholesale</span>
            <span>Status</span>
            <span>Edit</span>
          </div>
        </div>

        {products.map((p) => {
          const isEdit = editingId === p.id;
          const wsPrice = p.wholesalePrice || Math.round(p.price * 0.9 * 10) / 10;
          const crateSize = p.wholesaleCrateSize || 20;

          if (isEdit) {
            return (
              <div key={p.id} className="p-3.5 bg-sky-50/50 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Item Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Unit</label>
                    <input
                      type="text"
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-emerald-700 block mb-1">Retail (₹)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={editPrice}
                      onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs font-bold text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-amber-700 block mb-1">Wholesale (₹)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={editWholesalePrice}
                      onChange={(e) => setEditWholesalePrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-bold text-amber-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(p.id)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={p.id}
              className={`p-3 sm:p-4 flex items-center justify-between gap-2.5 hover:bg-slate-50 transition-colors ${
                !p.isActive ? 'opacity-50 bg-slate-50/50' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-900 text-xs sm:text-base leading-tight truncate">
                    {p.name}
                  </span>
                  {p.tamilName && (
                    <span className="text-[10px] sm:text-xs text-slate-400">
                      ({p.tamilName})
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>{p.unit}</span>
                  <span>•</span>
                  <span className="text-amber-700 font-medium">{crateSize}/crate</span>
                </p>
              </div>

              <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                {/* Retail Price */}
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-slate-900 flex items-center justify-end">
                    <IndianRupee className="w-3 h-3 inline mr-0.5" />
                    {p.price}
                  </span>
                </div>

                {/* Wholesale Price */}
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-amber-800 flex items-center justify-end">
                    <IndianRupee className="w-3 h-3 inline mr-0.5" />
                    {wsPrice}
                  </span>
                </div>

                {/* Active Toggle */}
                <button
                  onClick={() => onUpdateProduct(p.id, { isActive: !p.isActive })}
                  className="p-1 text-slate-500 hover:text-slate-800"
                >
                  {p.isActive ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => startEdit(p)}
                  className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                  title="Edit product"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
