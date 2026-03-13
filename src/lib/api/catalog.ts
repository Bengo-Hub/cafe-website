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

// Types

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  sort_order: number;
  parent_id?: string;
  image_url?: string;
  is_active: boolean;
  item_count?: number;
  created_at: string;
  updated_at: string;
}

/** Catalog API item shape (ordering-backend may return camelCase). */
export interface MenuItem {
  id: string;
  category_id?: string;
  categoryId?: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  currency: string;
  image_url?: string;
  imageUrl?: string;
  is_available: boolean;
  is_featured?: boolean;
  sort_order?: number;
  prep_time_minutes?: number;
  tags?: string[];
  allergens?: string[];
  created_at: string;
  updated_at: string;
}

// Category API

export async function fetchCategories() {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/categories`;
  return apiClient<MenuCategory[]>(url, { headers: headers() });
}

export async function createCategory(data: {
  name: string;
  description?: string;
  sort_order?: number;
  parent_id?: string;
  image_url?: string;
}) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/categories`;
  return apiClient<MenuCategory>(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  categoryId: string,
  data: { name?: string; description?: string; sort_order?: number; image_url?: string },
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
  search?: string;
  available_only?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.category_id) query.set('category_id', params.category_id);
  if (params?.search) query.set('search', params.search);
  if (params?.available_only) query.set('available_only', 'true');
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/items${qs ? `?${qs}` : ''}`;
  return apiClient<{ items: MenuItem[]; total: number }>(url, { headers: headers() });
}

export async function createMenuItem(data: {
  category_id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  currency?: string;
  image_url?: string;
  is_available?: boolean;
  is_featured?: boolean;
  prep_time_minutes?: number;
  tags?: string[];
  allergens?: string[];
}) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/items`;
  return apiClient<MenuItem>(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
}

export async function updateMenuItem(
  itemId: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    image_url: string;
    is_available: boolean;
    is_featured: boolean;
    prep_time_minutes: number;
    tags: string[];
    allergens: string[];
  }>,
) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/items/${itemId}`;
  return apiClient<MenuItem>(url, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
}

export async function deleteMenuItem(itemId: string) {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/catalog/items/${itemId}`;
  return apiClient(url, { method: 'DELETE', headers: headers() });
}
