'use client';

import React from 'react';
import { MenuCategory } from '@/lib/api/catalog';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface MenuItemFormProps {
  data: any; // Allow flexible data for form state
  categories: MenuCategory[];
  onChange: (data: any) => void;
  isEdit?: boolean;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  data,
  categories,
  onChange,
  isEdit = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="w-full max-w-[240px]">
        <ImageUpload
          label="Item Photo"
          value={data.image_url || data.imageUrl || ''}
          onChange={(url) => onChange({ ...data, image_url: url, imageUrl: url })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
            Item Name *
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
              SKU *
            </label>
            {isEdit && (
              <Link 
                href="/dashboard/recipes" 
                className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:underline flex items-center gap-1"
              >
                <BookOpen className="h-3 w-3" />
                View Recipe
              </Link>
            )}
          </div>
          <input
            type="text"
            value={data.sku || ''}
            onChange={(e) => onChange({ ...data, sku: e.target.value })}
            readOnly={isEdit}
            className={`w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none ${
              isEdit ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
          Description
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="w-full rounded-2xl border border-brand-beige/10 bg-brand-beige/5 p-4 text-sm focus:border-brand-orange/50 focus:outline-none"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
            Price (KES) *
          </label>
          <input
            type="number"
            value={data.price ?? ''}
            onChange={(e) => onChange({ ...data, price: parseFloat(e.target.value) || 0 })}
            className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
            Category *
          </label>
          <select
            value={data.category_id || ''}
            onChange={(e) => onChange({ ...data, category_id: e.target.value })}
            className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none"
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
            value={data.prep_time_minutes ?? ''}
            onChange={(e) => onChange({ ...data, prep_time_minutes: parseInt(e.target.value) || 0 })}
            className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm focus:border-brand-orange/50 focus:outline-none"
          />
        </div>
      </div>
      {isEdit && (
        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={data.is_available || false}
              onChange={(e) => onChange({ ...data, is_available: e.target.checked })}
              className="h-5 w-5 rounded-lg border-brand-beige/10 bg-brand-beige/5 text-brand-orange focus:ring-brand-orange/20"
            />
            <span className="text-sm font-bold text-primary-brand group-hover:text-brand-orange transition-colors">
              Available for Order
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={data.is_featured || false}
              onChange={(e) => onChange({ ...data, is_featured: e.target.checked })}
              className="h-5 w-5 rounded-lg border-brand-beige/10 bg-brand-beige/5 text-brand-orange focus:ring-brand-orange/20"
            />
            <span className="text-sm font-bold text-primary-brand group-hover:text-brand-orange transition-colors">
              Featured Item
            </span>
          </label>
        </div>
      )}
    </div>
  );
};
