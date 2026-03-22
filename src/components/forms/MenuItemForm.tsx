'use client';

import React, { useState } from 'react';
import { MenuCategory } from '@/lib/api/catalog';
import { fetchUnits, createUnit, type Unit } from '@/lib/api/inventory';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, Plus } from 'lucide-react';
import { Input } from '@/components/ui';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { CrudModal } from '@/components/dashboard/CrudModal';
import { CategoryForm } from './CategoryForm';

interface MenuItemFormProps {
  data: any;
  categories: MenuCategory[];
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
  onChange,
  isEdit = false,
  onCategoryCreated,
}) => {
  const queryClient = useQueryClient();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', abbreviation: '' });

  const { data: units = [], isLoading: loadingUnits } = useQuery({
    queryKey: ['inventory-units'],
    queryFn: fetchUnits,
  });

  const addUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: (unit) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-units'] });
      setShowAddUnit(false);
      setNewUnit({ name: '', abbreviation: '' });
      onChange({ ...data, recipe_unit: unit.name });
    },
  });

  return (
    <div className="space-y-4">
      {/* Image Upload */}
      <div className="w-full max-w-[240px]">
        <ImageUpload
          label="Item Photo"
          value={data.imageUrl || ''}
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
            <input
              type="text"
              value={data.sku || ''}
              readOnly
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
          ) : (
            <input
              type="text"
              value=""
              readOnly
              placeholder="Auto-generated on save"
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
          Description
        </label>
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
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
            Price (KES) *
          </label>
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
            <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
              Category *
            </label>
            <button
              type="button"
              onClick={() => setShowAddCategory(true)}
              className="text-[10px] font-black text-brand-orange hover:underline flex items-center gap-0.5"
            >
              <Plus className="h-3 w-3" /> NEW
            </button>
          </div>
          <select
            value={data.categoryId || ''}
            onChange={(e) => onChange({ ...data, categoryId: e.target.value })}
            className={selectClass}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
            Prep Time (min)
          </label>
          <input
            type="number"
            value={data.leadTimeMinutes ?? ''}
            onChange={(e) => onChange({ ...data, leadTimeMinutes: parseInt(e.target.value) || 0 })}
            className={inputClass}
          />
        </div>
      </div>

      {/* Availability + Featured toggles */}
      {isEdit && (
        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={data.isAvailable ?? false}
              onChange={(e) => onChange({ ...data, isAvailable: e.target.checked })}
              className="h-5 w-5 rounded-lg border-brand-beige/10 bg-brand-beige/5 text-brand-orange focus:ring-brand-orange/20"
            />
            <span className="text-sm font-bold text-primary-brand group-hover:text-brand-orange transition-colors">
              Available for Order
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={data.isFeatured ?? false}
              onChange={(e) => onChange({ ...data, isFeatured: e.target.checked })}
              className="h-5 w-5 rounded-lg border-brand-beige/10 bg-brand-beige/5 text-brand-orange focus:ring-brand-orange/20"
            />
            <span className="text-sm font-bold text-primary-brand group-hover:text-brand-orange transition-colors">
              Featured Item
            </span>
          </label>
        </div>
      )}

      {/* Recipe Setup (Create mode only) */}
      {!isEdit && (
        <div className="pt-4 border-t border-brand-beige/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-orange" />
              <h3 className="text-sm font-black uppercase tracking-widest text-primary-brand">Quick Recipe Setup</h3>
            </div>
            <p className="text-[10px] font-bold text-secondary-brand uppercase tracking-wider opacity-60">Optional</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
                Output Quantity
              </label>
              <input
                type="number"
                value={data.recipe_output_qty ?? 1}
                onChange={(e) => onChange({ ...data, recipe_output_qty: parseFloat(e.target.value) || 1 })}
                className="w-full h-10 rounded-xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
                  Recipe Unit
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddUnit(true)}
                  className="text-[9px] font-black text-brand-orange hover:underline flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> NEW
                </button>
              </div>
              <select
                value={data.recipe_unit ?? 'PORTION'}
                onChange={(e) => onChange({ ...data, recipe_unit: e.target.value })}
                className="w-full h-10 rounded-xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none appearance-none"
              >
                {loadingUnits ? (
                  <option>Loading...</option>
                ) : (
                  units.map((u: Unit) => (
                    <option key={u.id} value={u.name}>
                      {u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}
                    </option>
                  ))
                )}
                {units.length === 0 && !loadingUnits && <option value="PORTION">PORTION</option>}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <CrudModal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        title="Add Category"
        description="Create a new menu category"
        onSubmit={(e: any) => {
          e.preventDefault();
          if (onCategoryCreated) {
            onCategoryCreated(newCategoryName);
          }
          setShowAddCategory(false);
          setNewCategoryName('');
        }}
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
        onSubmit={(e: any) => {
          e.preventDefault();
          addUnitMutation.mutate(newUnit);
        }}
        submitLabel="Create Unit"
        isSubmitting={addUnitMutation.isPending}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary-brand">Unit Name</label>
            <Input
              value={newUnit.name}
              onChange={(e: any) => setNewUnit({ ...newUnit, name: e.target.value })}
              placeholder="e.g. Kilogram"
              className="rounded-xl border-brand-beige/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary-brand">Abbreviation</label>
            <Input
              value={newUnit.abbreviation}
              onChange={(e: any) => setNewUnit({ ...newUnit, abbreviation: e.target.value })}
              placeholder="e.g. kg"
              className="rounded-xl border-brand-beige/20"
            />
          </div>
        </div>
      </CrudModal>
    </div>
  );
};
