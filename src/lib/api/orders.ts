import { config } from '@/config/env';
import { apiClient } from './client';

const ORDERING_URL = config.services.ordering;
const TENANT = config.tenant.slug;

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

function tenantHeaders(): Record<string, string> {
  return {
    'X-Tenant-Slug': TENANT,
    ...(config.tenant.id ? { 'X-Tenant-ID': config.tenant.id } : {}),
  };
}

function headers(): Record<string, string> {
  return { ...authHeaders(), ...tenantHeaders() };
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
}) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);

  const qs = query.toString();
  const url = `${ORDERING_URL}/api/v1/${TENANT}/admin/orders${qs ? `?${qs}` : ''}`;

  return apiClient<ListOrdersResponse>(url, { headers: headers() });
}

export async function fetchAdminOrder(orderId: string) {
  const url = `${ORDERING_URL}/api/v1/${TENANT}/admin/orders/${orderId}`;
  return apiClient<Order>(url, { headers: headers() });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const url = `${ORDERING_URL}/api/v1/${TENANT}/admin/orders/${orderId}/status`;
  return apiClient<Order>(url, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ status }),
  });
}

export async function cancelOrder(orderId: string, reason: string) {
  const url = `${ORDERING_URL}/api/v1/${TENANT}/admin/orders/${orderId}/cancel`;
  return apiClient<Order>(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ reason }),
  });
}
