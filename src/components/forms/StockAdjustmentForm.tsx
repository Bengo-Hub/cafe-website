'use client';

import React from 'react';
import { ArrowDownUp, MessageSquare } from 'lucide-react';

interface StockAdjustmentFormProps {
  adjustmentValue: string;
  adjustmentReason: string;
  onValueChange: (val: string) => void;
  onReasonChange: (reason: string) => void;
}

const REASONS = [
  { value: 'Restock', label: 'Restock / Purchase' },
  { value: 'Damage', label: 'Damage / Spoilage' },
  { value: 'Correction', label: 'Manual Correction' },
  { value: 'Return', label: 'Customer Return' },
  { value: 'Transfer', label: 'Stock Transfer' },
  { value: 'Count', label: 'Physical Count Adjustment' },
];

const inputClass =
  'w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none focus:ring-1 focus:ring-brand-orange/20 transition-colors';

export const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({
  adjustmentValue,
  adjustmentReason,
  onValueChange,
  onReasonChange,
}) => {
  const numVal = parseFloat(adjustmentValue) || 0;
  const isAdd = numVal > 0;
  const isRemove = numVal < 0;

  return (
    <div className="space-y-6">
      {/* Amount */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4 text-brand-orange" />
          <label className="text-xs font-black uppercase tracking-widest text-primary-brand">
            Adjustment Amount
          </label>
        </div>
        <p className="text-[10px] text-secondary-brand opacity-60">
          Use positive values to add stock, negative to remove.
        </p>
        <input
          type="number"
          step="any"
          value={adjustmentValue}
          onChange={(e) => onValueChange(e.target.value)}
          className={`${inputClass} text-2xl font-black text-center ${
            isAdd ? '!border-green-500/30 !bg-green-500/5' : isRemove ? '!border-red-500/30 !bg-red-500/5' : ''
          }`}
          required
        />
        {numVal !== 0 && (
          <p className={`text-xs font-bold text-center ${isAdd ? 'text-green-600' : 'text-red-500'}`}>
            {isAdd ? `+${numVal} units will be added` : `${numVal} units will be removed`}
          </p>
        )}
      </div>

      {/* Reason */}
      <div className="space-y-3 pt-2 border-t border-brand-beige/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-brand-orange" />
          <label className="text-xs font-black uppercase tracking-widest text-primary-brand">
            Reason
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => onReasonChange(r.value)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all text-left ${
                adjustmentReason === r.value
                  ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/30 ring-1 ring-brand-orange/20'
                  : 'bg-brand-beige/5 text-secondary-brand border border-brand-beige/10 hover:border-brand-orange/20'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
