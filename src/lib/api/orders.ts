import { config } from '@/config/env';
import { apiClient, getTenantHeaders, getTenantSlug } from './client';

const ORDERING_URL = config.services.ordering;

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

function headers(): Record<string, string> {
  return { ...authHeaders(), ...getTenantHeaders() };
}

// Types matching ordering-backend responses (camelCase JSON)

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  inventorySku: string;
  nameSnapshot: string;
  /** Alias for UI convenience */
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  fulfillmentType: string;
  source?: string;
  channel: string;
  deliveryAddress?: string;
  instructions?: string;
  metadata?: Record<string, unknown>;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface ListOrdersResponse {
  data: Order[];
  total: number;
  limit: number;
  page: number;
}

/** Normalize a raw backend order into a typed Order with resolved customer info. */
function normalizeOrder(raw: Record<string, unknown>): Order {
  const meta = (raw.metadata ?? {}) as Record<string, unknown>;
  const isGuest = !!meta.guest;

  const rawItems = (raw.items ?? []) as Record<string, unknown>[];
  const items: OrderItem[] = rawItems.map((it) => ({
    id: (it.id ?? '') as string,
    inventorySku: (it.inventorySku ?? '') as string,
    nameSnapshot: (it.nameSnapshot ?? it.name ?? '') as string,
    name: (it.nameSnapshot ?? it.name ?? '') as string,
    quantity: (it.quantity ?? 0) as number,
    unitPrice: (it.unitPrice ?? 0) as number,
    totalPrice: (it.totalPrice ?? 0) as number,
    notes: (it.notes ?? '') as string,
    metadata: it.metadata as Record<string, unknown> | undefined,
  }));

  return {
    ...(raw as unknown as Order),
    orderNumber: (raw.orderNumber ?? raw.order_number ?? '') as string,
    customerName: (isGuest ? meta.contactName : '') as string || '',
    customerEmail: (isGuest ? meta.contactEmail : '') as string || '',
    customerPhone: (isGuest ? meta.contactPhone : '') as string || '',
    items,
    discountTotal: (raw.discountTotal ?? raw.discount ?? 0) as number,
    deliveryFee: (raw.deliveryFee ?? raw.delivery_fee ?? 0) as number,
    grandTotal: (raw.grandTotal ?? raw.total ?? 0) as number,
    deliveryAddress: (raw.deliveryAddress ?? raw.delivery_address ?? raw.instructions ?? '') as string,
    createdAt: (raw.createdAt ?? raw.created_at ?? '') as string,
    updatedAt: (raw.updatedAt ?? raw.updated_at ?? '') as string,
    placedAt: (raw.placedAt ?? raw.createdAt ?? '') as string,
    confirmedAt: (raw.confirmedAt ?? raw.confirmed_at) as string | undefined,
    completedAt: (raw.completedAt ?? raw.completed_at) as string | undefined,
    cancelledAt: (raw.cancelledAt ?? raw.cancelled_at) as string | undefined,
    cancelReason: (raw.cancelReason ?? raw.cancel_reason) as string | undefined,
    channel: (raw.channel ?? raw.source ?? 'web') as string,
  };
}

// API functions

export async function fetchAdminOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page != null) query.set('page', String(params.page));
  if (params?.limit != null) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.date_from) query.set('date_from', params.date_from);
  if (params?.date_to) query.set('date_to', params.date_to);

  const qs = query.toString();
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/admin/orders${qs ? `?${qs}` : ''}`;

  const res = await apiClient<ListOrdersResponse>(url, { headers: headers() });
  // Normalize orders from raw backend response
  if (res.data?.data) {
    res.data.data = res.data.data.map((o) => normalizeOrder(o as unknown as Record<string, unknown>));
  }
  return res;
}

export async function fetchAdminOrder(orderId: string) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/admin/orders/${orderId}`;
  const res = await apiClient<Order>(url, { headers: headers() });
  if (res.data) {
    res.data = normalizeOrder(res.data as unknown as Record<string, unknown>);
  }
  return res;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/admin/orders/${orderId}/status`;
  return apiClient<Order>(url, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ status }),
  });
}

export async function cancelOrder(orderId: string, reason: string) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/admin/orders/${orderId}/cancel`;
  return apiClient<Order>(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ reason }),
  });
}

export async function deleteOrder(orderId: string) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/admin/orders/${orderId}`;
  return apiClient<void>(url, {
    method: 'DELETE',
    headers: headers(),
  });
}

export async function assignOrderRider(orderId: string, riderId: string) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/admin/orders/${orderId}/rider`;
  return apiClient<Order>(url, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ rider_id: riderId }),
  });
}
