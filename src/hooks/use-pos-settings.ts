'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPosSettings,
  updatePosSettings,
  type UpdateSettingsInput,
} from '@/lib/api/pos-settings';

export function usePosSettings() {
  return useQuery({
    queryKey: ['pos-settings'],
    queryFn: fetchPosSettings,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdatePosSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => updatePosSettings(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pos-settings'] });
    },
  });
}
