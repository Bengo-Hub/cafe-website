import { config } from '@/config/env';

const INVENTORY_URL = process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL || 'http://localhost:4003';
const TENANT = config.tenant.id || 'tenant-urban-loft';

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
  return {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': config.tenant.slug,
    ...(config.tenant.id ? { 'X-Tenant-ID': config.tenant.id } : {}),
    ...authHeaders(),
  };
}

// Types

export interface StockAvailability {
  sku: string;
  available: boolean;
  quantity: number;
  reserved: number;
  unit: string;
  last_updated: string;
}

export interface Reservation {
  id: string;
  order_id: string;
  sku: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'consumed' | 'released';
  expires_at: string;
  created_at: string;
}

// API functions

export async function fetchStockAvailability(sku: string): Promise<StockAvailability> {
  const url = `${INVENTORY_URL}/v1/${TENANT}/inventory/items/${sku}`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Stock check failed: ${resp.statusText}`);
  return resp.json();
}

export async function fetchBulkAvailability(skus: string[]): Promise<StockAvailability[]> {
  const url = `${INVENTORY_URL}/v1/${TENANT}/inventory/availability`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ skus }),
  });
  if (!resp.ok) throw new Error(`Bulk availability failed: ${resp.statusText}`);
  return resp.json();
}

export async function fetchReservationsByOrder(orderId: string): Promise<Reservation[]> {
  const url = `${INVENTORY_URL}/v1/${TENANT}/inventory/reservations?order_id=${orderId}`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Reservations fetch failed: ${resp.statusText}`);
  return resp.json();
}
