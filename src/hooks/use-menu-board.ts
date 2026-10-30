'use client';

import { fetchPublicMenuCategories, fetchPublicMenuItems } from '@/lib/api/public-menu';
import { useQuery } from '@tanstack/react-query';

export interface MenuBoardItem {
  id: string;
  name: string;
  price: number;
  currency: string;
}

export interface MenuBoardSection {
  name: string;
  items: MenuBoardItem[];
}

/**
 * A few items from each named menu section, read from the online store's public catalogue (the
 * one menu; the website keeps no copy). Sections the store does not have are left out.
 */
async function fetchBoard(sections: string[], perSection: number): Promise<MenuBoardSection[]> {
  const categories = await fetchPublicMenuCategories();
  const byName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c]));
  const picked = sections
    .map((name) => byName.get(name.toLowerCase()))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const lists = await Promise.all(
    picked.map((c) => fetchPublicMenuItems({ category_id: c.id, limit: perSection * 2 }).catch(() => ({ items: [] }))),
  );
  return picked
    .map((c, i) => ({
      name: c.name,
      items: (lists[i]?.items ?? [])
        // Sub-sections come back too; keep this section's own items when it has enough.
        .filter((it, _, all) => it.categoryId === c.id || all.filter((x) => x.categoryId === c.id).length < perSection)
        .filter((it) => it.basePrice > 0 && Boolean(it.sku || it.id))
        .slice(0, perSection)
        // The store addresses items by SKU (its item page is /catalog/<sku>).
        .map((it) => ({ id: (it.sku || it.id)!, name: it.name, price: it.basePrice, currency: it.currency || 'KES' })),
    }))
    .filter((s) => s.items.length > 0);
}

export function useMenuBoard(sections: string[], perSection = 5) {
  return useQuery({
    queryKey: ['menu-board', sections, perSection],
    queryFn: () => fetchBoard(sections, perSection),
    staleTime: 10 * 60 * 1000,
  });
}
