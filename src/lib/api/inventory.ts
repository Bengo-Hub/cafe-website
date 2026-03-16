import { config } from '@/config/env';
import { getTenantHeaders, getTenantSlug } from './client';

const INVENTORY_URL = config.services.inventory;

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
    ...getTenantHeaders(),
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
  const url = `${INVENTORY_URL}/v1/${getTenantSlug()}/inventory/items/${sku}`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Stock check failed: ${resp.statusText}`);
  return resp.json();
}

export async function fetchBulkAvailability(skus: string[]): Promise<StockAvailability[]> {
  const url = `${INVENTORY_URL}/v1/${getTenantSlug()}/inventory/availability`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ skus }),
  });
  if (!resp.ok) throw new Error(`Bulk availability failed: ${resp.statusText}`);
  return resp.json();
}

export async function fetchReservationsByOrder(orderId: string): Promise<Reservation[]> {
  const url = `${INVENTORY_URL}/v1/${getTenantSlug()}/inventory/reservations?order_id=${orderId}`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Reservations fetch failed: ${resp.statusText}`);
  return resp.json();
}

export async function adjustStock(data: {
  sku: string;
  adjustment: number;
  reason: string;
  reference?: string;
}) {
  const url = `${INVENTORY_URL}/v1/${getTenantSlug()}/inventory/adjust`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`Stock adjustment failed: ${resp.statusText}`);
  return resp.json();
}

export async function createInventoryItem(data: {
  sku: string;
  name: string;
  unit: string;
  initial_quantity?: number;
}) {
  const url = `${INVENTORY_URL}/v1/${getTenantSlug()}/inventory/items`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`Create inventory item failed: ${resp.statusText}`);
  return resp.json();
}

export async function updateInventoryItem(sku: string, data: {
  name?: string;
  unit?: string;
}) {
  const url = `${INVENTORY_URL}/v1/${getTenantSlug()}/inventory/items/${sku}`;
  const resp = await fetch(url, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`Update inventory item failed: ${resp.statusText}`);
  return resp.json();
}

export async function deleteInventoryItem(sku: string) {
  const url = `${INVENTORY_URL}/v1/${getTenantSlug()}/inventory/items/${sku}`;
  const resp = await fetch(url, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!resp.ok) throw new Error(`Delete inventory item failed: ${resp.statusText}`);
  return resp.json();
}

// Unit API
export interface Unit {
  id: string;
  name: string;
  abbreviation?: string;
}

export async function fetchUnits(): Promise<Unit[]> {
  const url = `${INVENTORY_URL}/v1/${getTenantSlug()}/inventory/units`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Fetch units failed: ${resp.statusText}`);
  return resp.json();
}

export async function createUnit(data: { name: string; abbreviation?: string }): Promise<Unit> {
  const url = `${INVENTORY_URL}/v1/${getTenantSlug()}/inventory/units`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`Create unit failed: ${resp.statusText}`);
  return resp.json();
}
