import { api } from './client';

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

export const recipesApi = {
  list: async (): Promise<Recipe[]> => {
    const response = await api.get('/inventory/recipes');
    return response.data;
  },

  get: async (id: string): Promise<Recipe> => {
    const response = await api.get(`/inventory/recipes/${id}`);
    return response.data;
  },

  create: async (recipe: Recipe): Promise<Recipe> => {
    const response = await api.post('/inventory/recipes', recipe);
    return response.data;
  },

  update: async (id: string, recipe: Recipe): Promise<Recipe> => {
    const response = await api.put(`/inventory/recipes/${id}`, recipe);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/inventory/recipes/${id}`);
  }
};
