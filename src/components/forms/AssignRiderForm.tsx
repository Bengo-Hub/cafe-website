'use client';

import React from 'react';
import { type FleetMember } from '@/lib/api/riders';

interface AssignRiderFormProps {
  orderNumber: string;
  riders: FleetMember[];
  selectedRiderId: string;
  onRiderChange: (id: string) => void;
}

function riderDisplayName(rider: FleetMember): string {
  const fullName = `${rider.first_name} ${rider.last_name}`.trim();
  if (fullName) return fullName;
  if (rider.driver_code) return `Rider ${rider.driver_code}`;
  return `Rider ${rider.user_id.substring(0, 8)}`;
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
              {riderDisplayName(rider)} {rider.driver_code ? `(${rider.driver_code})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
