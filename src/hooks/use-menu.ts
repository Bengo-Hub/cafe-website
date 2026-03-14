'use client';

import {
    fetchPublicMenuCategories,
    fetchPublicMenuItems,
    type PublicMenuItemResponse,
} from '@/lib/api/public-menu';
import { MenuItem } from '@/types';
import { getMediaUrl } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

function mapPublicToDisplay(
  apiItems: PublicMenuItemResponse[],
  categoryNames: Map<string, string>
): MenuItem[] {
  return apiItems.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    price: item.basePrice,
    category: categoryNames.get(item.categoryId) ?? item.categoryName ?? item.categoryId,
    image: getMediaUrl(item.imageUrl) || '/images/menu/placeholder-food.svg',
    available: true,
    dietaryTags: (item.dietaryTags as MenuItem['dietaryTags']) ?? [],
    featured: false,
  }));
}

async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const [categories, { items }] = await Promise.all([
      fetchPublicMenuCategories(),
      fetchPublicMenuItems({ limit: 500 }),
    ]);
    const categoryNames = new Map<string, string>();
    const flatten = (cats: { id: string; name: string; children?: unknown[] }[]) => {
      cats.forEach((c) => {
        categoryNames.set(c.id, c.name);
        if (c.children?.length) flatten(c.children as { id: string; name: string; children?: unknown[] }[]);
      });
    };
    flatten(categories);
    return mapPublicToDisplay(items ?? [], categoryNames);
  } catch (e) {
    if (typeof console !== 'undefined') console.warn('Menu API failed, using empty list:', e);
    return [];
  }
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
