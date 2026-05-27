'use client';

import { fetchOutlets, type OutletSummary } from '@/lib/api/catalog';
import { useQuery } from '@tanstack/react-query';

export type { OutletSummary };

export function useOutlets() {
  return useQuery({
    queryKey: ['outlets'],
    queryFn: async () => {
      const res = await fetchOutlets();
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
