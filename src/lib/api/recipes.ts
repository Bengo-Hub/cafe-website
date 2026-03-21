import { config } from '@/config/env';
import { apiClient, getTenantHeaders, getTenantSlug } from './client';

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
  return { ...authHeaders(), ...getTenantHeaders() };
}

export interface RecipeIngredient {
  id?: string;
  item_id: string;
  item_sku: string;
  quantity: number;
  unit_of_measure: string;
  notes?: string;
  display_order?: number;
}

export interface Recipe {
  id?: string;
  tenant_id?: string;
  sku: string;
  name: string;
  output_qty: number;
  unit_of_measure: string;
  is_active: boolean;
  ingredients: RecipeIngredient[];
}

const slug = () => getTenantSlug();

export const recipesApi = {
  list: async (): Promise<Recipe[]> => {
    const url = `${INVENTORY_URL}/v1/${slug()}/inventory/recipes`;
    const res = await apiClient<Recipe[]>(url, { headers: headers() });
    return res.data ?? [];
  },

  get: async (id: string): Promise<Recipe> => {
    const url = `${INVENTORY_URL}/v1/${slug()}/inventory/recipes/${id}`;
    const res = await apiClient<Recipe>(url, { headers: headers() });
    if (!res.data) throw new Error('Recipe not found');
    return res.data;
  },

  create: async (recipe: Recipe): Promise<Recipe> => {
    const url = `${INVENTORY_URL}/v1/${slug()}/inventory/recipes`;
    const res = await apiClient<Recipe>(url, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(recipe),
    });
    if (!res.data) throw new Error('Failed to create recipe');
    return res.data;
  },

  update: async (id: string, recipe: Recipe): Promise<Recipe> => {
    const url = `${INVENTORY_URL}/v1/${slug()}/inventory/recipes/${id}`;
    const res = await apiClient<Recipe>(url, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(recipe),
    });
    if (!res.data) throw new Error('Failed to update recipe');
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    const url = `${INVENTORY_URL}/v1/${slug()}/inventory/recipes/${id}`;
    await apiClient(url, { method: 'DELETE', headers: headers() });
  },
};
