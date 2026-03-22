'use client';

import React, { useState } from 'react';
import { MenuCategory, type OutletSummary } from '@/lib/api/catalog';
import { fetchUnits, createUnit, fetchInventoryItems, type Unit, type InventoryItem } from '@/lib/api/inventory';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, Plus, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { CrudModal } from '@/components/dashboard/CrudModal';
import { CategoryForm } from './CategoryForm';
import { getMediaUrl } from '@/lib/utils';

interface RecipeIngredient {
  item_id: string;
  item_sku: string;
  item_name?: string;
  quantity: number;
  unit_of_measure: string;
}

interface MenuItemFormProps {
  data: any;
  categories: MenuCategory[];
  outlets?: OutletSummary[];
  defaultOutletId?: string;
  onChange: (data: any) => void;
  isEdit?: boolean;
  onCategoryCreated?: (name: string) => void;
}

const inputClass =
  'w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none transition-colors';

const selectClass =
  'w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none transition-colors appearance-none';

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  data,
  categories,
  outlets = [],
  defaultOutletId = '',
  onChange,
  isEdit = false,
  onCategoryCreated,
}) => {
  const queryClient = useQueryClient();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', abbreviation: '' });
  const [ingredientSearch, setIngredientSearch] = useState('');

  const { data: units = [], isLoading: loadingUnits } = useQuery({
    queryKey: ['inventory-units'],
    queryFn: fetchUnits,
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: fetchInventoryItems,
    enabled: !isEdit, // Only fetch for create mode (BOM setup)
  });
  const inventoryItems: InventoryItem[] = inventoryData?.data ?? [];

  const filteredInventory = inventoryItems.filter((item) =>
    ingredientSearch &&
    (item.name.toLowerCase().includes(ingredientSearch.toLowerCase()) ||
     item.sku.toLowerCase().includes(ingredientSearch.toLowerCase()))
  );

  const ingredients: RecipeIngredient[] = data.recipe_ingredients ?? [];

  const addUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: (unit) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-units'] });
      setShowAddUnit(false);
      setNewUnit({ name: '', abbreviation: '' });
      onChange({ ...data, recipe_unit: unit.name });
    },
  });

  const addIngredient = (item: InventoryItem) => {
    const existing = ingredients.find((i) => i.item_id === item.id);
    if (existing) return;
    onChange({
      ...data,
      recipe_ingredients: [
        ...ingredients,
        { item_id: item.id, item_sku: item.sku, item_name: item.name, quantity: 1, unit_of_measure: 'PIECE' },
      ],
    });
    setIngredientSearch('');
  };

  const removeIngredient = (index: number) => {
    onChange({
      ...data,
      recipe_ingredients: ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    (updated[index] as any)[field] = value;
    onChange({ ...data, recipe_ingredients: updated });
  };

  return (
    <div className="space-y-4">
      {/* Image Upload */}
      <div className="w-full max-w-[240px]">
        <ImageUpload
          label="Item Photo"
          value={data.imageUrl ? getMediaUrl(data.imageUrl) : ''}
          onChange={(url) => onChange({ ...data, imageUrl: url })}
        />
      </div>

      {/* Name + SKU */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
            Item Name *
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
              SKU
            </label>
            {isEdit && data.sku && (
              <Link
                href={`/dashboard/recipes?sku=${data.sku}`}
                className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:underline flex items-center gap-1"
              >
                <BookOpen className="h-3 w-3" />
                View Recipe
              </Link>
            )}
          </div>
          {isEdit ? (
            <input type="text" value={data.sku || ''} readOnly className={`${inputClass} opacity-50 cursor-not-allowed`} />
          ) : (
            <input type="text" value="" readOnly placeholder="Auto-generated on save" className={`${inputClass} opacity-50 cursor-not-allowed`} />
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">Description</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="w-full rounded-2xl border border-brand-beige/10 bg-brand-beige/5 p-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
          rows={3}
        />
      </div>

      {/* Price + Category + Prep Time */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">Price (KES) *</label>
          <input
            type="number"
            value={data.basePrice ?? ''}
            onChange={(e) => onChange({ ...data, basePrice: parseFloat(e.target.value) || 0 })}
            className={inputClass}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">Category *</label>
            <button type="button" onClick={() => setShowAddCategory(true)} className="text-[10px] font-black text-brand-orange hover:underline flex items-center gap-0.5">
              <Plus className="h-3 w-3" /> NEW
            </button>
          </div>
          <select value={data.categoryId || ''} onChange={(e) => onChange({ ...data, categoryId: e.target.value })} className={selectClass} required>
            <option value="">Select category</option>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">Prep Time (min)</label>
          <input
            type="number"
            value={data.leadTimeMinutes ?? ''}
            onChange={(e) => onChange({ ...data, leadTimeMinutes: parseInt(e.target.value) || 0 })}
            className={inputClass}
          />
        </div>
      </div>

      {/* Outlet selector */}
      {outlets.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">Outlet</label>
            <select
              value={data.outletId || defaultOutletId}
              onChange={(e) => onChange({ ...data, outletId: e.target.value })}
              className={selectClass}
              disabled={data.addToAllOutlets}
            >
              {outlets.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
            </select>
          </div>
          {!isEdit && (
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={data.addToAllOutlets ?? false}
                  onChange={(e) => onChange({ ...data, addToAllOutlets: e.target.checked })}
                  className="h-5 w-5 rounded-lg border-brand-beige/10 bg-brand-beige/5 text-brand-orange focus:ring-brand-orange/20"
                />
                <span className="text-sm font-bold text-primary-brand group-hover:text-brand-orange transition-colors">
                  Add to all outlets
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Availability + Featured toggles (edit mode) */}
      {isEdit && (
        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={data.isAvailable ?? false} onChange={(e) => onChange({ ...data, isAvailable: e.target.checked })} className="h-5 w-5 rounded-lg border-brand-beige/10 bg-brand-beige/5 text-brand-orange focus:ring-brand-orange/20" />
            <span className="text-sm font-bold text-primary-brand group-hover:text-brand-orange transition-colors">Available for Order</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={data.isFeatured ?? false} onChange={(e) => onChange({ ...data, isFeatured: e.target.checked })} className="h-5 w-5 rounded-lg border-brand-beige/10 bg-brand-beige/5 text-brand-orange focus:ring-brand-orange/20" />
            <span className="text-sm font-bold text-primary-brand group-hover:text-brand-orange transition-colors">Featured Item</span>
          </label>
        </div>
      )}

      {/* Recipe Setup + BOM Ingredients (Create mode only) */}
      {!isEdit && (
        <div className="pt-4 border-t border-brand-beige/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-orange" />
              <h3 className="text-sm font-black uppercase tracking-widest text-primary-brand">Recipe Setup</h3>
            </div>
            <p className="text-[10px] font-bold text-secondary-brand uppercase tracking-wider opacity-60">Optional</p>
          </div>

          {/* Output Qty + Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">Output Quantity</label>
              <input
                type="number"
                value={data.recipe_output_qty ?? 1}
                onChange={(e) => onChange({ ...data, recipe_output_qty: parseFloat(e.target.value) || 1 })}
                className="w-full h-10 rounded-xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">Recipe Unit</label>
                <button type="button" onClick={() => setShowAddUnit(true)} className="text-[9px] font-black text-brand-orange hover:underline flex items-center gap-0.5">
                  <Plus className="h-3 w-3" /> NEW
                </button>
              </div>
              <select
                value={data.recipe_unit ?? 'PORTION'}
                onChange={(e) => onChange({ ...data, recipe_unit: e.target.value })}
                className="w-full h-10 rounded-xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none appearance-none"
              >
                {loadingUnits ? (<option>Loading...</option>) : units.map((u: Unit) => (
                  <option key={u.id} value={u.name}>{u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}</option>
                ))}
                {units.length === 0 && !loadingUnits && <option value="PORTION">PORTION</option>}
              </select>
            </div>
          </div>

          {/* BOM Ingredients */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
              Ingredients (BOM)
            </h4>

            {/* Added ingredients list */}
            {ingredients.length > 0 && (
              <div className="space-y-2">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-brand-beige/5 border border-brand-beige/10">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary-brand">{ing.item_name || ing.item_sku}</p>
                      <p className="text-[10px] font-mono text-secondary-brand">{ing.item_sku}</p>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-20 h-8 rounded-lg border border-brand-beige/20 bg-white px-2 text-xs text-center"
                      placeholder="Qty"
                    />
                    <select
                      value={ing.unit_of_measure}
                      onChange={(e) => updateIngredient(idx, 'unit_of_measure', e.target.value)}
                      className="w-24 h-8 rounded-lg border border-brand-beige/20 bg-white px-2 text-xs"
                    >
                      {units.map((u: Unit) => (<option key={u.id} value={u.name}>{u.name}</option>))}
                      {units.length === 0 && <option value="PIECE">PIECE</option>}
                    </select>
                    <button type="button" onClick={() => removeIngredient(idx)} className="p-1 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Ingredient search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-brand opacity-40" />
              <input
                placeholder="Search inventory items to add..."
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                className="w-full h-10 pl-10 rounded-xl border border-brand-beige/10 bg-white px-4 text-sm focus:border-brand-orange/50 focus:outline-none"
              />
            </div>

            {/* Search results */}
            {filteredInventory.length > 0 && (
              <div className="max-h-[150px] overflow-y-auto space-y-1 border border-brand-beige/10 rounded-xl p-2">
                {filteredInventory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-beige/5 cursor-pointer"
                    onClick={() => addIngredient(item)}
                  >
                    <div>
                      <p className="text-sm font-bold text-primary-brand">{item.name}</p>
                      <p className="text-[10px] font-mono text-secondary-brand">{item.sku}</p>
                    </div>
                    <Plus className="h-4 w-4 text-brand-orange" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <CrudModal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        title="Add Category"
        description="Create a new menu category"
        onSubmit={(e: any) => { e.preventDefault(); if (onCategoryCreated) onCategoryCreated(newCategoryName); setShowAddCategory(false); setNewCategoryName(''); }}
        submitLabel="Add Category"
        isSubmitting={false}
      >
        <CategoryForm name={newCategoryName} onChange={setNewCategoryName} />
      </CrudModal>

      {/* Add Unit Modal */}
      <CrudModal
        isOpen={showAddUnit}
        onClose={() => setShowAddUnit(false)}
        title="Create New Unit"
        description="Add a new unit of measure"
        onSubmit={(e: any) => { e.preventDefault(); addUnitMutation.mutate(newUnit); }}
        submitLabel="Create Unit"
        isSubmitting={addUnitMutation.isPending}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary-brand">Unit Name</label>
            <Input value={newUnit.name} onChange={(e: any) => setNewUnit({ ...newUnit, name: e.target.value })} placeholder="e.g. Kilogram" className="rounded-xl border-brand-beige/20" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary-brand">Abbreviation</label>
            <Input value={newUnit.abbreviation} onChange={(e: any) => setNewUnit({ ...newUnit, abbreviation: e.target.value })} placeholder="e.g. kg" className="rounded-xl border-brand-beige/20" />
          </div>
        </div>
      </CrudModal>
    </div>
  );
};
