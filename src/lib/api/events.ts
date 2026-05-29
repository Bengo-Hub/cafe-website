import { config } from '@/config/env';
import { apiClient, getTenantHeaders, getTenantSlug } from './client';

const ORDERING_URL = config.services.ordering;

function publicHeaders(): Record<string, string> {
  return getTenantHeaders();
}

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem('cafe-auth-storage');
  if (!stored) return {};
  try {
    const { state } = JSON.parse(stored);
    return state?.accessToken ? { Authorization: `Bearer ${state.accessToken}` } : {};
  } catch {
    return {};
  }
}

function adminHeaders(): Record<string, string> {
  return { ...authHeaders(), ...getTenantHeaders() };
}

export interface TicketTier {
  name: string;
  price: number;
  capacity: number;
}

export interface CatalogEvent {
  id: string;
  name: string;
  description?: string;
  sku: string;
  basePrice: number;
  currency: string;
  imageUrl?: string;
  isAvailable: boolean;
  tags?: string[];
  /** eventStartAt from inventory item's event_start_at field */
  eventStartAt?: string;
  eventEndAt?: string;
  eventVenue?: string;
  totalCapacity?: number;
  metadata?: {
    ticket_tiers?: TicketTier[];
    is_recurring?: boolean;
    recurrence_pattern?: string;
    [key: string]: unknown;
  };
  /** Legacy scheduledFor — kept for backward compat */
  scheduledFor?: string;
}

export interface BookingInput {
  eventSku: string;
  eventName: string;
  unitPrice: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  partySize: number;
  scheduledFor: string;
  specialRequests?: string;
  occasion?: string;
}

export interface BookingOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  currency: string;
  scheduledFor?: string;
  metadata?: Record<string, unknown>;
}

interface ListResponse<T> {
  data: T[];
  total: number;
}

export interface EventsPage {
  data: CatalogEvent[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function fetchEvents(page = 1, limit = 6): Promise<EventsPage> {
  const slug   = getTenantSlug();
  const offset = (page - 1) * limit;
  const url = `${ORDERING_URL}/api/v1/${slug}/catalog/items?item_type=service&tags=event&is_available=true&limit=${limit}&offset=${offset}`;
  const res = await apiClient<ListResponse<CatalogEvent>>(url, { headers: publicHeaders() });
  const total = res.data?.total ?? 0;
  return {
    data: res.data?.data ?? [],
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

export async function createBooking(input: BookingInput): Promise<BookingOrder> {
  const slug = getTenantSlug();
  const url = `${ORDERING_URL}/api/v1/${slug}/orders/guest`;
  const body = {
    fulfillmentType: 'dine_in',
    scheduledFor: input.scheduledFor,
    instructions: input.specialRequests ?? '',
    metadata: {
      guest: true,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      party_size: input.partySize,
      occasion: input.occasion ?? '',
      event_sku: input.eventSku,
    },
    items: [
      {
        inventorySku: input.eventSku,
        quantity: input.partySize,
        unitPrice: input.unitPrice,
        notes: input.specialRequests ?? '',
      },
    ],
  };
  const res = await apiClient<BookingOrder>(url, {
    method: 'POST',
    headers: publicHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.data) throw new Error('Booking failed — no order returned');
  return res.data;
}

export async function updateEventAvailability(event: CatalogEvent, isAvailable: boolean, outletId: string): Promise<void> {
  const slug = getTenantSlug();
  const url = `${ORDERING_URL}/api/v1/${slug}/catalog/overrides/${event.sku}`;
  await apiClient(url, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({
      outletId,
      basePrice: event.basePrice,
      isAvailable,
      imageUrlOverride: event.imageUrl,
    }),
  });
}

export async function updateEventBanner(event: CatalogEvent, imageUrl: string, outletId: string): Promise<void> {
  const slug = getTenantSlug();
  const url = `${ORDERING_URL}/api/v1/${slug}/catalog/overrides/${event.sku}`;
  await apiClient(url, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({
      outletId,
      basePrice: event.basePrice,
      isAvailable: event.isAvailable,
      imageUrlOverride: imageUrl,
    }),
  });
}
