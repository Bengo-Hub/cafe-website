'use client';

import React, { useState } from 'react';
import { Package, BookOpen, ChevronDown, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { toast } from 'sonner';

// ── Payload Types ──────────────────────────────────────────────────────────────

export interface CreateItemPayload {
  name: string;
  description?: string;
  categoryId: string;
  outletId: string;
  basePrice: number;
  currency: string;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  leadTimeMinutes: number;
  displayOrder: number;
}

export interface CreateRecipePayload {
  name: string;
  sku: string;
  output_qty: number;
  unit_of_measure: string;
  is_active: boolean;
  ingredients: [];
}

// ── Form Props ─────────────────────────────────────────────────────────────────

interface UnifiedMenuRecipeFormProps {
  categories: Array<{ id: string; name: string }>;
  isEdit?: boolean;
  editData?: {
    id?: string;
    name?: string;
    description?: string;
    categoryId?: string;
    basePrice?: number;
    currency?: string;
    imageUrl?: string;
    isAvailable?: boolean;
    isFeatured?: boolean;
    leadTimeMinutes?: number;
    displayOrder?: number;
    sku?: string;
  };
  onSubmit: (data: { item: CreateItemPayload; recipe?: CreateRecipePayload }) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

// ── Unit Options ───────────────────────────────────────────────────────────────

const UNIT_OPTIONS = [
  'PORTION',
  'PIECE',
  'CUP',
  'SERVING',
  'PLATE',
  'SLICE',
  'BOWL',
  'GLASS',
];

// ── Component ──────────────────────────────────────────────────────────────────

export const UnifiedMenuRecipeForm: React.FC<UnifiedMenuRecipeFormProps> = ({
  categories,
  isEdit = false,
  editData,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}) => {
  // Item state
  const [name, setName] = useState(editData?.name ?? '');
  const [description, setDescription] = useState(editData?.description ?? '');
  const [categoryId, setCategoryId] = useState(editData?.categoryId ?? '');
  const [basePrice, setBasePrice] = useState<number | ''>(editData?.basePrice ?? '');
  const [currency] = useState(editData?.currency ?? 'KES');
  const [imageUrl, setImageUrl] = useState(editData?.imageUrl ?? '');
  const [isAvailable, setIsAvailable] = useState(editData?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState(editData?.isFeatured ?? false);
  const [leadTimeMinutes, setLeadTimeMinutes] = useState<number | ''>(editData?.leadTimeMinutes ?? '');
  const [displayOrder, setDisplayOrder] = useState<number>(editData?.displayOrder ?? 0);

  // Recipe state
  const [linkRecipe, setLinkRecipe] = useState(false);
  const [outputQty, setOutputQty] = useState<number>(1);
  const [unitOfMeasure, setUnitOfMeasure] = useState('PORTION');
  const [recipeIsActive, setRecipeIsActive] = useState(true);

  const inputClass =
    'w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none transition-colors';
  const labelClass =
    'text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60';

  // ── Submit Handler ─────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!basePrice || basePrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const item: CreateItemPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId,
      outletId: '', // set by the parent / API layer
      basePrice: Number(basePrice),
      currency,
      imageUrl: imageUrl || undefined,
      isAvailable,
      isFeatured,
      leadTimeMinutes: leadTimeMinutes ? Number(leadTimeMinutes) : 0,
      displayOrder,
    };

    let recipe: CreateRecipePayload | undefined;

    if (linkRecipe) {
      recipe = {
        name: name.trim(),
        sku: '', // filled after item creation
        output_qty: outputQty,
        unit_of_measure: unitOfMeasure,
        is_active: recipeIsActive,
        ingredients: [],
      };
    }

    onSubmit({ item, recipe });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Section 1: Item Details ──────────────────────────────────────────── */}
      <section className="rounded-2xl border border-brand-beige/10 p-6 space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-brand-beige/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/10">
            <Package className="h-4 w-4 text-brand-orange" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-primary-brand">
            Item Details
          </h2>
        </div>

        {/* Image Upload */}
        <div className="w-full max-w-[240px]">
          <ImageUpload
            label="Item Photo"
            value={imageUrl}
            onChange={setImageUrl}
          />
        </div>

        {/* Name + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>Item Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Espresso Double Shot"
              className={inputClass}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
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
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description shown to customers"
            className="w-full rounded-2xl border border-brand-beige/10 bg-brand-beige/5 p-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none transition-colors"
            rows={3}
          />
        </div>

        {/* Price + Prep Time + Display Order */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>Base Price *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-secondary-brand opacity-50">
                KES
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value ? parseFloat(e.target.value) : '')}
                className={`${inputClass} pl-14`}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Prep Time (min)</label>
            <input
              type="number"
              min={0}
              value={leadTimeMinutes}
              onChange={(e) =>
                setLeadTimeMinutes(e.target.value ? parseInt(e.target.value) : '')
              }
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Display Order</label>
            <input
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
        </div>

        {/* SKU (read-only, edit mode only) */}
        {isEdit && editData?.sku && (
          <div className="space-y-2">
            <label className={labelClass}>SKU (auto-generated)</label>
            <input
              type="text"
              value={editData.sku}
              readOnly
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
          </div>
        )}

        {/* Toggles (edit mode only) */}
        {isEdit && (
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="h-5 w-5 rounded-lg border-brand-beige/10 bg-brand-beige/5 text-brand-orange focus:ring-brand-orange/20"
              />
              <span className="text-sm font-bold text-primary-brand group-hover:text-brand-orange transition-colors">
                Available for Order
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-5 w-5 rounded-lg border-brand-beige/10 bg-brand-beige/5 text-brand-orange focus:ring-brand-orange/20"
              />
              <span className="text-sm font-bold text-primary-brand group-hover:text-brand-orange transition-colors">
                Featured Item
              </span>
            </label>
          </div>
        )}
      </section>

      {/* ── Section 2: Recipe Setup ──────────────────────────────────────────── */}
      <section className="rounded-2xl border border-brand-beige/10 bg-gradient-to-r from-brand-orange/5 to-transparent overflow-hidden">
        {/* Toggle Header */}
        <button
          type="button"
          onClick={() => setLinkRecipe(!linkRecipe)}
          className="flex w-full items-center justify-between p-6 text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/10">
              <BookOpen className="h-4 w-4 text-brand-orange" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-primary-brand">
                Recipe Setup
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-brand opacity-60 mt-0.5">
                Optional — link a recipe for inventory tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                linkRecipe ? 'text-brand-orange' : 'text-secondary-brand opacity-50'
              }`}
            >
              {linkRecipe ? 'Linked' : 'Off'}
            </span>
            <div
              className={`relative h-6 w-11 rounded-full transition-colors ${
                linkRecipe ? 'bg-brand-orange' : 'bg-brand-beige/20'
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  linkRecipe ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </div>
            <ChevronDown
              className={`h-4 w-4 text-secondary-brand transition-transform ${
                linkRecipe ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Collapsible Body */}
        {linkRecipe && (
          <div className="px-6 pb-6 space-y-4 border-t border-brand-beige/10 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Output Quantity</label>
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={outputQty}
                  onChange={(e) => setOutputQty(parseFloat(e.target.value) || 1)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Unit of Measure</label>
                <select
                  value={unitOfMeasure}
                  onChange={(e) => setUnitOfMeasure(e.target.value)}
                  className={inputClass}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group pt-1">
              <input
                type="checkbox"
                checked={recipeIsActive}
                onChange={(e) => setRecipeIsActive(e.target.checked)}
                className="h-5 w-5 rounded-lg border-brand-beige/10 bg-brand-beige/5 text-brand-orange focus:ring-brand-orange/20"
              />
              <span className="text-sm font-bold text-primary-brand group-hover:text-brand-orange transition-colors">
                Recipe Active
              </span>
            </label>
          </div>
        )}
      </section>

      {/* ── Submit ───────────────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 items-center gap-2.5 rounded-2xl bg-brand-orange px-8 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-brand-orange/20 transition-all hover:shadow-brand-orange/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel ?? (isEdit ? 'Update Item' : 'Create Item')}
        </button>
      </div>
    </form>
  );
};

export default UnifiedMenuRecipeForm;
