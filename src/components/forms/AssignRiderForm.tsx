'use client';

import React from 'react';
import { Rider } from '@/lib/api/riders';

interface AssignRiderFormProps {
  orderNumber: string;
  riders: Rider[];
  selectedRiderId: string;
  onRiderChange: (id: string) => void;
}

export const AssignRiderForm: React.FC<AssignRiderFormProps> = ({
  orderNumber,
  riders,
  selectedRiderId,
  onRiderChange,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary-brand">
        Order: <span className="font-bold text-primary-brand">{orderNumber}</span>
      </p>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
          Select Rider
        </label>
        <select
          value={selectedRiderId}
          onChange={(e) => onRiderChange(e.target.value)}
          className="w-full h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
          required
        >
          <option value="">Choose a rider...</option>
          {riders.map((rider) => (
            <option key={rider.id} value={rider.id}>
              {rider.name} ({rider.vehicle_type || 'No vehicle'})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
