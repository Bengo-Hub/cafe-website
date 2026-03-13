/**
 * Public menu API — no authentication required.
 * Uses ordering-backend /menu/categories and /menu/items (not /catalog/*).
 * For dashboard menu management, use catalog.ts (auth required).
 */

import { config } from '@/config/env';
import { getTenantHeaders, getTenantSlug } from './client';

const ORDERING_URL = config.services.ordering;

function tenantHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...getTenantHeaders(),
  };
}

/** Public category from ordering-backend GET /menu/categories */
export interface PublicMenuCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  itemCount?: number;
  children?: PublicMenuCategory[];
}

/** Public menu item from ordering-backend GET /menu/items (camelCase) */
export interface PublicMenuItemResponse {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description?: string;
  basePrice: number;
  currency: string;
  imageUrl?: string;
  leadTimeMinutes?: number;
  variants?: unknown[];
  dietaryTags?: unknown[];
}

/** List response from ordering-backend */
interface ListResponse<T> {
  data: T[];
  total: number;
  limit?: number;
  page?: number;
}

async function fetchPublic<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: tenantHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error((data as { message?: string }).message || 'API request failed');
  }
  return data as T;
}

/** Fetch public menu categories (no auth). */
export async function fetchPublicMenuCategories(): Promise<PublicMenuCategory[]> {
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/menu/categories`;
  const data = await fetchPublic<PublicMenuCategory[] | ListResponse<PublicMenuCategory>>(url);
  if (Array.isArray(data)) return data;
  return (data as ListResponse<PublicMenuCategory>).data ?? [];
}

/** Fetch public menu items (no auth). */
export async function fetchPublicMenuItems(params?: {
  limit?: number;
  page?: number;
  category_id?: string;
  search?: string;
}): Promise<{ items: PublicMenuItemResponse[]; total: number }> {
  const search = new URLSearchParams();
  if (params?.limit != null) search.set('limit', String(params.limit));
  if (params?.page != null) search.set('page', String(params.page));
  if (params?.category_id) search.set('category_id', params.category_id);
  if (params?.search) search.set('search', params.search);
  const qs = search.toString();
  const url = `${ORDERING_URL}/api/v1/${getTenantSlug()}/menu/items${qs ? `?${qs}` : ''}`;
  const data = await fetchPublic<ListResponse<PublicMenuItemResponse>>(url);
  return {
    items: data.data ?? [],
    total: data.total ?? 0,
  };
}
