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

// Types matching ordering-backend responses

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
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customizations?: Record<string, string>;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  currency: string;
  status: OrderStatus;
  channel: string;
  delivery_address?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
}

export interface ListOrdersResponse {
  data: Order[];
  total: number;
  limit: number;
  page: number;
}

// API functions

export async function fetchAdminOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  date_from?: string; // ISO date or RFC3339
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

  return apiClient<ListOrdersResponse>(url, { headers: headers() });
}

export async function fetchAdminOrder(orderId: string) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/admin/orders/${orderId}`;
  return apiClient<Order>(url, { headers: headers() });
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

export async function assignOrderRider(orderId: string, riderId: string) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/admin/orders/${orderId}/rider`;
  return apiClient<Order>(url, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ rider_id: riderId }),
  });
}
