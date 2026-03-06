'use client';

import { fetchMenuItems as fetchCatalogItems, fetchCategories, type MenuItem as CatalogItem } from '@/lib/api/catalog';
import { MenuItem } from '@/types';
import { useQuery } from '@tanstack/react-query';

function mapCatalogToDisplay(apiItems: CatalogItem[], categoryNames: Map<string, string>): MenuItem[] {
  return apiItems.map((item) => {
    const categoryId = item.category_id ?? (item as { categoryId?: string }).categoryId ?? '';
    return {
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      price: item.price,
      category: categoryNames.get(categoryId) ?? categoryId,
      image: (item as { image_url?: string; imageUrl?: string }).image_url ?? (item as { imageUrl?: string }).imageUrl ?? '/images/menu/placeholder-food.svg',
      available: item.is_available,
      dietaryTags: item.tags as MenuItem['dietaryTags'],
      featured: item.is_featured,
    };
  });
}

async function fetchMenuItems(): Promise<MenuItem[]> {
  const [catRes, itemsRes] = await Promise.all([
    fetchCategories(),
    fetchCatalogItems({ limit: 500 }),
  ]);
  const categories = catRes.data ?? [];
  const result = itemsRes.data ?? { items: [], total: 0 };
  const categoryNames = new Map<string, string>();
  categories.forEach((c) => categoryNames.set(c.id, c.name));
  return mapCatalogToDisplay(result.items, categoryNames);
}

export const useMenu = (category?: string) => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['menu', category],
    queryFn: fetchMenuItems,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredItems = category && category !== 'All Items'
    ? items.filter(item => item.category === category)
    : items;

  return {
    items: filteredItems,
    isLoading,
    error,
    categories: ['All Items', ...Array.from(new Set(items.map(item => item.category).filter(Boolean)))],
  };
};
