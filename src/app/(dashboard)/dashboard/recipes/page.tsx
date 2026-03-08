'use client';

import { Badge, Button, Card } from '@/components/ui';
import { fetchMenuItems, type MenuItem } from '@/lib/api/catalog';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Link2, Loader2 } from 'lucide-react';

/**
 * Recipe management page.
 * Menu items are linked to inventory for stock keeping via SKU:
 * - Each menu item has a SKU (ordering-backend).
 * - Inventory-service holds items and BOMs (recipes): parent item by SKU, components = recipe items (inventory items + quantity per serving).
 * - When a menu item is sold, inventory should deduct recipe components according to BOM (handled by inventory-service when integrated).
 * This page lists menu items and their SKUs; full BOM/recipe CRUD is done in inventory-service UI when available.
 */
export default function RecipesPage() {
  const { data: itemsRes, isLoading, isError, refetch } = useQuery({
    queryKey: ['catalog-items-recipes'],
    queryFn: () => fetchMenuItems({ limit: 500 }),
  });

  const items = itemsRes?.data?.items ?? [];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-primary-brand md:text-4xl">
          Recipes &amp; Stock Linkage
        </h1>
        <p className="mt-1 font-light text-secondary-brand">
          Menu items are linked to inventory by SKU. Configure recipes (BOM) in the inventory service so that when an item is sold, recipe components are deducted automatically.
        </p>
      </header>

      <Card className="border border-brand-beige/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10">
            <Link2 className="h-5 w-5 text-brand-orange" />
          </div>
          <div>
            <h3 className="font-bold text-primary-brand">How it works</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-secondary-brand">
              <li>Each <strong>menu item</strong> has a unique <strong>SKU</strong> (set in Menu management).</li>
              <li>In <strong>inventory-service</strong>, the same SKU is used for the product item. A <strong>recipe (BOM)</strong> links that item to <strong>recipe components</strong> (inventory items) with quantity per serving.</li>
              <li>When an order is placed, the system can deduct recipe components from stock according to the BOM.</li>
              <li>Create and edit recipes (BOMs) in the inventory service admin; this page helps you see which menu items (by SKU) are available for linking.</li>
            </ul>
          </div>
        </div>
      </Card>

      <section>
        <h2 className="mb-4 text-lg font-bold text-primary-brand">Menu items by SKU</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="font-bold text-primary-brand">Failed to load menu items</p>
            <Button onClick={() => refetch()} className="mt-3 rounded-xl bg-brand-orange text-white">
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-secondary-brand opacity-30" />
            <p className="font-bold text-primary-brand">No menu items yet</p>
            <p className="text-sm text-secondary-brand">Add menu items in Menu management; each needs a SKU for inventory linkage.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-beige/10 text-left text-xs font-black uppercase tracking-widest text-secondary-brand opacity-60">
                  <th className="pb-3 pr-4">Item</th>
                  <th className="pb-3 pr-4">SKU</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3">Recipe (BOM)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: MenuItem) => (
                  <tr
                    key={item.id}
                    className="border-b border-brand-beige/5 transition-colors hover:bg-brand-beige/5"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-bold text-primary-brand">{item.name}</p>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-secondary-brand">{item.sku}</td>
                    <td className="py-3 pr-4 text-secondary-brand">{(item as { category_id?: string }).category_id ?? '—'}</td>
                    <td className="py-3">
                      <Badge className="bg-brand-beige/10 text-secondary-brand">
                        Configure in Inventory service
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
