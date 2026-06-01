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

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  unit_id?: string;
  type: 'GOODS' | 'SERVICE' | 'RECIPE' | 'INGREDIENT' | 'VOUCHER' | 'EQUIPMENT';
  is_active: boolean;
  image_url?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  initial_quantity?: number;
  reorder_level?: number;
  reorder_quantity?: number;
  barcode?: string;
  barcode_type?: string;
  requires_age_verification?: boolean;
  is_perishable?: boolean;
  track_lots?: boolean;
  track_serial_numbers?: boolean;
  weight_kg?: number;
  dimensions_cm?: Record<string, number>;
  add_to_all_outlets?: boolean;
  // Costing fields (2026-06-01)
  cost_price?: number | null;
  suggested_price?: number | null;
  selling_price?: number | null;     // recipe menu-item selling price
  food_cost_pct?: number | null;     // cost_per_portion / selling_price
  status?: string | null;            // "OK - healthy" | "OK - above target FC%" | "LOSS"
  // Purchase / supplier fields
  purchase_price?: number | null;
  purchase_pack_size?: number | null;
  purchase_unit?: string | null;
  yield_pct?: number | null;         // 0 < y <= 1
  created_at: string;
  updated_at: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
}

export interface StockAvailability {
  item_id: string;
  sku: string;
  warehouse_id: string;
  on_hand: number;
  available: number;
  reserved: number;
  unit_of_measure: string;
  reorder_level: number;
  reorder_quantity: number;
  preferred_supplier_id?: string;
  updated_at: string;
}

export interface InventorySummary {
  total_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  pending_reservations: number;
  warehouse_count: number;
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

// Unit API
export interface Unit {
  id: string;
  name: string;
  abbreviation?: string;
  is_active?: boolean;
}

// ─── Inventory Items ────────────────────────────────────────────────────

export async function fetchInventoryItems(params?: {
  type?: string;
  search?: string;
  status?: string;
  limit?: number;
  page?: number;
}): Promise<{ data: InventoryItem[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.type) q.set('type', params.type);
  if (params?.search) q.set('search', params.search);
  if (params?.status) q.set('status', params.status);
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.page) q.set('page', String(params.page));
  const qs = q.toString();
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/items${qs ? `?${qs}` : ''}`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Fetch inventory items failed: ${resp.statusText}`);
  return resp.json();
}

export async function fetchStockAvailability(sku: string): Promise<StockAvailability> {
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/items/${sku}`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Stock check failed: ${resp.statusText}`);
  return resp.json();
}

export async function fetchBulkAvailability(skus: string[]): Promise<StockAvailability[]> {
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/availability`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ skus }),
  });
  if (!resp.ok) throw new Error(`Bulk availability failed: ${resp.statusText}`);
  return resp.json();
}

export async function fetchInventorySummary(): Promise<InventorySummary> {
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/summary`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Fetch inventory summary failed: ${resp.statusText}`);
  return resp.json();
}

export async function createInventoryItem(data: {
  sku?: string;
  name: string;
  description?: string;
  category_id?: string;
  unit_id?: string;
  type?: string;
  is_active?: boolean;
  image_url?: string;
  initial_quantity?: number;
  reorder_level?: number;
  reorder_quantity?: number;
  barcode?: string;
  requires_age_verification?: boolean;
  is_perishable?: boolean;
  track_lots?: boolean;
  add_to_all_outlets?: boolean;
}): Promise<InventoryItem> {
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/items`;
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
  description?: string;
  category_id?: string;
  unit_id?: string;
  type?: string;
  is_active?: boolean;
  image_url?: string;
  reorder_level?: number;
  reorder_quantity?: number;
  barcode?: string;
  requires_age_verification?: boolean;
  is_perishable?: boolean;
  track_lots?: boolean;
}): Promise<InventoryItem> {
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/items/${sku}`;
  const resp = await fetch(url, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`Update inventory item failed: ${resp.statusText}`);
  return resp.json();
}

export async function deleteInventoryItem(sku: string) {
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/items/${sku}`;
  const resp = await fetch(url, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!resp.ok) throw new Error(`Delete inventory item failed: ${resp.statusText}`);
  return resp.json();
}

// ─── Stock Adjustments ──────────────────────────────────────────────────

export async function adjustStock(data: {
  sku: string;
  adjustment: number;
  reason: string;
  reference?: string;
  notes?: string;
}) {
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/adjustments`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`Stock adjustment failed: ${resp.statusText}`);
  return resp.json();
}

// ─── Reservations ───────────────────────────────────────────────────────

export async function fetchReservationsByOrder(orderId: string): Promise<Reservation[]> {
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/reservations?order_id=${orderId}`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Reservations fetch failed: ${resp.statusText}`);
  return resp.json();
}

// ─── Categories ─────────────────────────────────────────────────────────

export async function fetchInventoryCategories(): Promise<{ data: InventoryCategory[]; total: number }> {
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/categories`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Fetch categories failed: ${resp.statusText}`);
  return resp.json();
}

// ─── Units ──────────────────────────────────────────────────────────────

export async function fetchUnits(): Promise<Unit[]> {
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/units`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Fetch units failed: ${resp.statusText}`);
  return resp.json();
}

export async function createUnit(data: { name: string; abbreviation?: string }): Promise<Unit> {
  const url = `${INVENTORY_URL}/api/v1/${getTenantSlug()}/inventory/units`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`Create unit failed: ${resp.statusText}`);
  return resp.json();
}
