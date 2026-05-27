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

// Types — aligned with ordering-backend camelCase JSON tags

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
  displayOrder: number;
  parentId?: string;
  isActive: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  /** Inventory item ID (inventoryId from merged catalog). Use `sku` for API operations. */
  id: string;
  inventoryId?: string;
  categoryId: string;
  category?: MenuCategory;
  categoryName?: string;
  name: string;
  description?: string;
  sku: string;
  basePrice: number;
  currency: string;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  leadTimeMinutes?: number;
  dietaryTags?: Array<{ code: string; label: string }>;
  createdAt: string;
  updatedAt: string;
}

/** Backend list response shape. */
interface ListResponse<T> {
  data: T[];
  total: number;
  limit: number;
  page: number;
}

// Category API

export async function fetchCategories() {
  // Use admin endpoint which returns ListResponse{data, total, limit, page} and includes all categories
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/admin/categories`;
  const res = await apiClient<ListResponse<MenuCategory>>(url, { headers: headers() });
  return { ...res, data: res.data?.data ?? [] };
}

export async function createCategory(data: {
  name: string;
  description?: string;
  displayOrder?: number;
  parentId?: string;
  imageUrl?: string;
  outletId: string;
  isActive?: boolean;
}) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/categories`;
  return apiClient<MenuCategory>(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      displayOrder: data.displayOrder ?? 0,
      parentId: data.parentId,
      imageUrl: data.imageUrl,
      outletId: data.outletId,
      isActive: data.isActive ?? true,
    }),
  });
}

export async function updateCategory(
  categoryId: string,
  data: { name?: string; description?: string; displayOrder?: number; imageUrl?: string },
) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/categories/${categoryId}`;
  return apiClient<MenuCategory>(url, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(categoryId: string) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/categories/${categoryId}`;
  return apiClient(url, { method: 'DELETE', headers: headers() });
}

// Menu Items API

export async function fetchMenuItems(params?: {
  category_id?: string;
  outlet_id?: string;
  search?: string;
  available_only?: boolean;
  is_available?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.category_id) query.set('category_id', params.category_id);
  if (params?.outlet_id) query.set('outlet_id', params.outlet_id);
  if (params?.search) query.set('search', params.search);
  if (params?.available_only) query.set('is_available', 'true');
  if (params?.is_available !== undefined) query.set('is_available', String(params.is_available));
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  // Use admin endpoint which returns ALL items (including unavailable) with full field data
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/admin/items${qs ? `?${qs}` : ''}`;
  const res = await apiClient<ListResponse<MenuItem>>(url, { headers: headers() });
  return { ...res, data: { data: res.data?.data ?? [], total: res.data?.total ?? 0 } };
}

/**
 * Create a catalog override (menu item listing) for a SKU.
 * POST /catalog/overrides
 * The inventory item must already exist with this SKU.
 */
export async function createMenuItem(data: {
  categoryId: string;
  outletId: string;
  name: string;
  description?: string;
  sku: string;
  basePrice: number;
  currency?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  leadTimeMinutes?: number;
}) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/overrides`;
  return apiClient<MenuItem>(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      outletId: data.outletId,
      sku: data.sku,
      basePrice: data.basePrice,
      currency: data.currency ?? 'KES',
      isAvailable: data.isAvailable ?? true,
      isFeatured: data.isFeatured ?? false,
      leadTimeMinutes: data.leadTimeMinutes ?? 0,
      imageUrlOverride: data.imageUrl,
    }),
  });
}

/**
 * Update a catalog override by SKU.
 * PUT /catalog/overrides/{sku}
 * Requires outletId in the request body.
 */
export async function updateMenuItem(
  sku: string,
  data: {
    outletId: string;
    basePrice?: number;
    currency?: string;
    imageUrl?: string;
    isAvailable?: boolean;
    isFeatured?: boolean;
    leadTimeMinutes?: number;
  },
) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/overrides/${sku}`;
  return apiClient<MenuItem>(url, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      outletId: data.outletId,
      basePrice: data.basePrice,
      currency: data.currency,
      isAvailable: data.isAvailable,
      isFeatured: data.isFeatured,
      leadTimeMinutes: data.leadTimeMinutes,
      imageUrlOverride: data.imageUrl,
    }),
  });
}

/**
 * Delete a catalog override by SKU.
 * DELETE /catalog/overrides/{sku}
 * This removes the menu listing but does NOT delete the inventory item.
 */
export async function deleteMenuItem(sku: string) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/overrides/${sku}`;
  return apiClient(url, { method: 'DELETE', headers: headers() });
}

// Outlets API

export interface OutletSummary {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  address?: string;
  phone?: string;
  location?: string;
  imageUrl?: string;
  status?: string;
  isOpen?: boolean;
}

export async function fetchOutlets() {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/outlets`;
  const res = await apiClient<ListResponse<OutletSummary>>(url, { headers: headers() });
  return { ...res, data: res.data?.data ?? [] };
}
