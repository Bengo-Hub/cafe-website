import { config } from '@/config/env';
import { buildOrderingUrl } from './ordering-url.config.mjs';

/** A page on the cafe's online store (see ordering-url.config.mjs for the rule). */
export function orderingUrl(path: string, slug: string = config.tenant.slug): string {
  return buildOrderingUrl(
    { store: config.services.orderingStore.replace(/\/+$/, ''), pwa: config.services.orderingPwa.replace(/\/+$/, ''), slug },
    path,
  );
}

/** The store's own page for one menu item (the store keys items by SKU). */
export function orderingItemUrl(sku: string, slug?: string): string {
  return orderingUrl(`/catalog/${encodeURIComponent(sku)}`, slug);
}
