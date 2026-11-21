'use client';

import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { FALLBACK_HOURS, FALLBACK_TIMEZONE, everyDay, hoursLabel, type Period, type WeeklyHours } from '@/lib/hours';
import { useMemo } from 'react';

export type OpeningHoursView = {
  hours: WeeklyHours;
  timeZone: string;
  /** "Every day, 7:30 AM to 10:30 PM" or the day-by-day summary. */
  label: string;
  /** The single daily period when every day is the same, for copy like "until 10:30 PM". */
  daily: Period | null;
};

/** The cafe's hours from its account (auth-api tenant record), else the site fallback. */
export function useOpeningHours(): OpeningHoursView {
  const { tenant } = useTenantBrand();
  return useMemo(() => {
    const hours = tenant?.openingHours ?? FALLBACK_HOURS;
    return {
      hours,
      timeZone: tenant?.timezone || FALLBACK_TIMEZONE,
      label: hoursLabel(hours),
      daily: everyDay(hours),
    };
  }, [tenant?.openingHours, tenant?.timezone]);
}
