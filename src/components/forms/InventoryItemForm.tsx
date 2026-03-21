'use client';

import React from 'react';
import { Box, Tag } from 'lucide-react';

interface InventoryItemFormData {
  sku: string;
  name: string;
  description?: string;
  unit: string;
  type?: string;
  initial_quantity?: string | number;
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
  { value: 'SERVICE', label: 'Service' },
];

const inputClass =
  'w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none focus:ring-1 focus:ring-brand-orange/20 transition-colors';

export const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  data,
  onChange,
  isEdit = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Section: Identity */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-1">
          <Tag className="h-4 w-4 text-brand-orange" />
          <h3 className="text-xs font-black uppercase tracking-widest text-primary-brand">Item Identity</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
              SKU *
            </label>
            <input
              type="text"
              value={data.sku}
              onChange={(e) => onChange({ ...data, sku: e.target.value })}
              readOnly={isEdit}
              placeholder="e.g. ING-FLOUR-001"
              className={`${inputClass} ${isEdit ? 'opacity-50 cursor-not-allowed bg-brand-beige/10' : ''}`}
              required
            />
          </div>
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

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
              Unit of Measure *
            </label>
            <input
              type="text"
              value={data.unit}
              onChange={(e) => onChange({ ...data, unit: e.target.value })}
              placeholder="e.g. kg, pcs, ml"
              className={inputClass}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
              Item Type
            </label>
            <select
              value={data.type || 'GOODS'}
              onChange={(e) => onChange({ ...data, type: e.target.value })}
              className={inputClass}
            >
              {ITEM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brand opacity-60">
                Initial Quantity
              </label>
              <input
                type="number"
                value={data.initial_quantity || ''}
                onChange={(e) => onChange({ ...data, initial_quantity: e.target.value })}
                placeholder="0"
                className={inputClass}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
