'use client';

import React from 'react';

interface StockAdjustmentFormProps {
  adjustmentValue: string;
  adjustmentReason: string;
  onValueChange: (val: string) => void;
  onReasonChange: (reason: string) => void;
}

export const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({
  adjustmentValue,
  adjustmentReason,
  onValueChange,
  onReasonChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
          Adjustment Amount (Add + or Remove -)
        </label>
        <input
          type="number"
          step="any"
          value={adjustmentValue}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-xl font-black text-primary-brand focus:border-brand-orange/50 focus:outline-none"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
          Reason
        </label>
        <select
          value={adjustmentReason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
        >
          <option value="Restock">Restock</option>
          <option value="Damage">Damage / Spoilage</option>
          <option value="Correction">Manual Correction</option>
          <option value="Return">Customer Return</option>
        </select>
      </div>
    </div>
  );
};
