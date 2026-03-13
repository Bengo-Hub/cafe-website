'use client';

import React from 'react';

interface CategoryFormProps {
  name: string;
  onChange: (name: string) => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ name, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
          Category Name
        </label>
        <input
          type="text"
          placeholder="e.g. Hot Coffees"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
          required
        />
      </div>
    </div>
  );
};
