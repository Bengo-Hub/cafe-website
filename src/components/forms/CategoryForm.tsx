'use client';

import React from 'react';
import type { MenuCategory } from '@/lib/api/catalog';

interface CategoryFormProps {
  name: string;
  parentId?: string;
  categories?: MenuCategory[];
  onChange: (name: string) => void;
  onParentChange?: (parentId: string) => void;
}

const inputClass =
  'w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none transition-colors';

const selectClass =
  'w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none transition-colors appearance-none';

export const CategoryForm: React.FC<CategoryFormProps> = ({
  name,
  parentId = '',
  categories = [],
  onChange,
  onParentChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
          Category Name *
        </label>
        <input
          type="text"
          placeholder="e.g. Hot Coffees"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      {categories.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
            Parent Category
          </label>
          <select
            value={parentId}
            onChange={(e) => onParentChange?.(e.target.value)}
            className={selectClass}
          >
            <option value="">None (top-level category)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <p className="text-[10px] text-secondary-brand opacity-60">
            Select a parent to create a nested sub-category.
          </p>
        </div>
      )}
    </div>
  );
};
