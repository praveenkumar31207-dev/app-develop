import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { 
  Package, 
  Plus, 
  Edit2, 
  Check, 
  X, 
  RotateCcw, 
  IndianRupee,
  ToggleLeft,
  ToggleRight,
  Sparkles
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

  // Form states for new product
  const [newName, setNewName] = useState('');
  const [newTamilName, setNewTamilName] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('Milk');
  const [newUnit, setNewUnit] = useState('500ml pouch');
  const [newPrice, setNewPrice] = useState<number>(25);

  // Form states for edit product
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editUnit, setEditUnit] = useState('');
  const [editCategory, setEditCategory] = useState<Product['category']>('Milk');

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(p.price);
    setEditUnit(p.unit);
    setEditCategory(p.category);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim() || editPrice <= 0) return;
    onUpdateProduct(id, {
      name: editName.trim(),
      price: Number(editPrice),
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
      isActive: true,
      sortOrder: products.length + 1,
    });

    setNewName('');
    setNewTamilName('');
    setNewPrice(25);
    setIsAdding(false);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
            Admin Catalogue
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            Product & Price Management
          </h2>
          <p className="text-sm text-slate-500">
            Set fixed retail prices (₹), add new parlour items, or toggle active status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Reset catalogue to Chennai dairy default products? Any custom items will be reset.')) {
                onResetToDefault();
              }
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5"
            title="Reload default catalog"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Note on Price History Integrity */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Price Revision Protection:</strong> When you change a product price here, all <em>previously recorded sales</em> stay locked at their original recorded prices. Only new counter entries will use the updated price.
        </p>
      </div>

      {/* Add Product Form Modal / Section */}
      {isAdding && (
        <form
          onSubmit={handleCreateProduct}
          className="bg-white p-5 rounded-2xl border-2 border-sky-300 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-base">Add New Dairy Product</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Product Name (English) *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Buffalo Milk / Strawberry Milk"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
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
                placeholder="e.g. எருமைப்பால்"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
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
                placeholder="e.g. 500ml pouch, 200g cup, 1L jar"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Retail Selling Price (₹ INR) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min={1}
                  step={0.5}
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Save Product
            </button>
          </div>
        </form>
      )}

      {/* Product List Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Product & Unit</span>
          <div className="flex items-center gap-8 pr-2">
            <span>Price</span>
            <span>Status</span>
            <span>Action</span>
          </div>
        </div>

        {products.map((p) => {
          const isEdit = editingId === p.id;

          if (isEdit) {
            return (
              <div key={p.id} className="p-4 bg-sky-50/50 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Item Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Unit</label>
                    <input
                      type="text"
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={editPrice}
                      onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-sm font-bold text-emerald-700"
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
                    className="px-3.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
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
              className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                !p.isActive ? 'opacity-50 bg-slate-50/50' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm sm:text-base truncate">
                    {p.name}
                  </span>
                  {p.tamilName && (
                    <span className="text-xs text-slate-400">
                      ({p.tamilName})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {p.unit} • <span className="text-sky-700 font-medium">{p.category}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                {/* Price Display */}
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-slate-900 flex items-center justify-end">
                    <IndianRupee className="w-3.5 h-3.5 inline mr-0.5" />
                    {p.price}
                  </span>
                </div>

                {/* Active Toggle */}
                <button
                  onClick={() => onUpdateProduct(p.id, { isActive: !p.isActive })}
                  className="p-1 text-slate-500 hover:text-slate-800"
                  title={p.isActive ? 'Click to deactivate' : 'Click to activate'}
                >
                  {p.isActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => startEdit(p)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                  title="Edit product or price"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
