'use client';

import { createBooking, fetchAllEvents, fetchEvents, type BookingInput, type BookingOrder, type CatalogEvent, type EventsPage } from '@/lib/api/events';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type { BookingInput, BookingOrder, CatalogEvent, EventsPage };
export { fetchAllEvents };

export const EVENTS_PER_PAGE = 6;

export function useEvents(page = 1, limit = EVENTS_PER_PAGE) {
  return useQuery<EventsPage>({
    queryKey: ['events', page, limit],
    queryFn: () => fetchEvents(page, limit),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

/** Admin hook — fetches ALL service catalog items (no availability/tag filter) */
export function useAllEvents(page = 1, limit = 200) {
  return useQuery<EventsPage>({
    queryKey: ['events-admin', page, limit],
    queryFn: () => fetchAllEvents(page, limit),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
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
