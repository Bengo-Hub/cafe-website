'use client';

import { createBooking, fetchEvents, type BookingInput, type BookingOrder, type CatalogEvent } from '@/lib/api/events';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type { BookingInput, BookingOrder, CatalogEvent };

export function useEvents() {
  return useQuery<CatalogEvent[]>({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation<BookingOrder, Error, BookingInput>({
    mutationFn: createBooking,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
