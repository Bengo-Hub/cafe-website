/**
 * Display types for menu items and categories.
 * Menu data is loaded from the ordering-backend catalog API (see use-menu.ts).
 */
export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'halal' | 'dairy-free';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  dietaryTags?: DietaryTag[];
  featured?: boolean;
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}
