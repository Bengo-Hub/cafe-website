import { config } from '@/config/env';
import { apiClient, getTenantHeaders, getTenantSlug } from './client';

const ORDERING_URL = config.services.ordering;

function publicHeaders(): Record<string, string> {
  return getTenantHeaders();
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
  /** scheduledFor set by admin when the event has a fixed date */
  scheduledFor?: string;
  metadata?: Record<string, unknown>;
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

export async function fetchEvents(): Promise<CatalogEvent[]> {
  const slug = getTenantSlug();
  const url = `${ORDERING_URL}/api/v1/${slug}/catalog/items?item_type=service&tags=event&is_available=true`;
  const res = await apiClient<ListResponse<CatalogEvent>>(url, { headers: publicHeaders() });
  return res.data?.data ?? [];
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

export async function updateEventAvailability(sku: string, isAvailable: boolean) {
  const slug = getTenantSlug();
  const url = `${ORDERING_URL}/api/v1/${slug}/catalog/overrides/${sku}`;
  return apiClient(url, {
    method: 'PATCH',
    headers: { ...getTenantHeaders() },
    body: JSON.stringify({ isAvailable }),
  });
}
