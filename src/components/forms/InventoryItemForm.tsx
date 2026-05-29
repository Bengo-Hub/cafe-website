'use client';

import React, { useState } from 'react';
import { Box, Image as ImageIcon, Plus, Tag } from 'lucide-react';
import { Input } from '@/components/ui';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { CrudModal } from '@/components/dashboard/CrudModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUnits,
  createUnit,
  fetchInventoryCategories,
  type Unit,
  type InventoryCategory,
} from '@/lib/api/inventory';

interface InventoryItemFormData {
  name: string;
  description?: string;
  category_id?: string;
  unit_id?: string;
  type?: string;
  initial_quantity?: string | number;
  reorder_level?: string | number;
  sku?: string;
  image_url?: string;
}

interface InventoryItemFormProps {
  data: InventoryItemFormData;
  onChange: (data: InventoryItemFormData) => void;
  isEdit?: boolean;
}

const ITEM_TYPES = [
  { value: 'GOODS', label: 'Goods' },
  { value: 'INGREDIENT', label: 'Ingredient' },
  { value: 'RECIPE', label: 'Recipe' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'VOUCHER', label: 'Voucher' },
];

const inputClass =
  'w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none focus:ring-1 focus:ring-brand-orange/20 transition-colors';

const selectClass =
  'w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none focus:ring-1 focus:ring-brand-orange/20 transition-colors appearance-none';

export const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  data,
  onChange,
  isEdit = false,
}) => {
  const queryClient = useQueryClient();
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', abbreviation: '' });

  const { data: units = [], isLoading: loadingUnits } = useQuery({
    queryKey: ['inventory-units'],
    queryFn: fetchUnits,
  });

  const { data: categoriesRes, isLoading: loadingCategories } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: fetchInventoryCategories,
  });
  const categories: InventoryCategory[] = categoriesRes?.data ?? [];

  const addUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: (unit) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-units'] });
      setShowAddUnit(false);
      setNewUnit({ name: '', abbreviation: '' });
      onChange({ ...data, unit_id: unit.id });
    },
  });

  return (
    <div className="space-y-6">
      {/* Section: Identity */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-1">
          <Tag className="h-4 w-4 text-brand-orange" />
          <h3 className="text-xs font-black uppercase tracking-widest text-primary-brand">Item Identity</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isEdit && data.sku ? (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
                SKU
              </label>
              <input
                type="text"
                value={data.sku}
                readOnly
                className={`${inputClass} opacity-50 cursor-not-allowed bg-brand-beige/10`}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
                SKU
              </label>
              <input
                type="text"
                value=""
                readOnly
                placeholder="Auto-generated on save"
                className={`${inputClass} opacity-50 cursor-not-allowed bg-brand-beige/10`}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
              Item Name *
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              placeholder="e.g. All-Purpose Flour"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
            Description
          </label>
          <textarea
            value={data.description || ''}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Brief description of this inventory item..."
            className="w-full rounded-2xl border border-brand-beige/10 bg-brand-beige/5 p-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none focus:ring-1 focus:ring-brand-orange/20 transition-colors"
            rows={2}
          />
        </div>
      </div>

      {/* Section: Configuration */}
      <div className="space-y-4 pt-2 border-t border-brand-beige/10">
        <div className="flex items-center gap-2 pb-1">
          <Box className="h-4 w-4 text-brand-orange" />
          <h3 className="text-xs font-black uppercase tracking-widest text-primary-brand">Configuration</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
              Category
            </label>
            <select
              value={data.category_id || ''}
              onChange={(e) => onChange({ ...data, category_id: e.target.value || undefined })}
              className={selectClass}
            >
              <option value="">Select category...</option>
              {loadingCategories ? (
                <option>Loading...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))
              )}
            </select>
          </div>

          {/* Item Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
              Item Type
            </label>
            <select
              value={data.type || 'GOODS'}
              onChange={(e) => onChange({ ...data, type: e.target.value })}
              className={selectClass}
            >
              {ITEM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Unit of Measure Select with + button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
                Unit of Measure *
              </label>
              <button
                type="button"
                onClick={() => setShowAddUnit(true)}
                className="text-[10px] font-black text-brand-orange hover:underline flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" /> NEW UNIT
              </button>
            </div>
            <select
              value={data.unit_id || ''}
              onChange={(e) => onChange({ ...data, unit_id: e.target.value || undefined })}
              className={selectClass}
              required
            >
              <option value="">Select unit...</option>
              {loadingUnits ? (
                <option>Loading...</option>
              ) : (
                units.map((u: Unit) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Initial Quantity (create only) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
                Initial Quantity
              </label>
              <input
                type="number"
                value={data.initial_quantity ?? '1'}
                onChange={(e) => onChange({ ...data, initial_quantity: e.target.value })}
                placeholder="1"
                min="0"
                className={inputClass}
              />
            </div>
          )}
        </div>

        {/* Reorder Level (create only) */}
        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
                Reorder Level
              </label>
              <input
                type="number"
                value={data.reorder_level ?? '1'}
                onChange={(e) => onChange({ ...data, reorder_level: e.target.value })}
                placeholder="1"
                min="0"
                className={inputClass}
              />
              <p className="text-[9px] text-secondary-brand opacity-50">
                You will be notified when stock falls to this level
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section: Media */}
      <div className="space-y-4 pt-2 border-t border-brand-beige/10">
        <div className="flex items-center gap-2 pb-1">
          <ImageIcon className="h-4 w-4 text-brand-orange" />
          <h3 className="text-xs font-black uppercase tracking-widest text-primary-brand">Media</h3>
        </div>
        <ImageUpload
          label="Item Image"
          value={data.image_url}
          onChange={(url) => onChange({ ...data, image_url: url })}
        />
      </div>

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
