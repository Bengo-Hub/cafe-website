'use client';

import React from 'react';

interface InventoryItemFormProps {
  data: {
    sku: string;
    name: string;
    unit: string;
    initial_quantity?: string | number;
  };
  onChange: (data: any) => void;
  isEdit?: boolean;
}

export const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  data,
  onChange,
  isEdit = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
            SKU *
          </label>
          <input
            type="text"
            value={data.sku}
            onChange={(e) => onChange({ ...data, sku: e.target.value })}
            readOnly={isEdit}
            className={`w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none ${
              isEdit ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
            Unit (e.g. kg, pcs) *
          </label>
          <input
            type="text"
            value={data.unit}
            onChange={(e) => onChange({ ...data, unit: e.target.value })}
            className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
          Item Name *
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none"
          required
        />
      </div>
      {!isEdit && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
            Initial Quantity
          </label>
          <input
            type="number"
            value={data.initial_quantity || ''}
            onChange={(e) => onChange({ ...data, initial_quantity: e.target.value })}
            className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
