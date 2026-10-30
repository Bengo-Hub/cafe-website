import { config } from '@/config/env';

/**
 * A page on the cafe's online store. On the cafe's own store domain the storefront serves at the
 * root, so the slug is left out of the path; on the shared ordering PWA it is /<slug>/...
 */
export function orderingUrl(path: string, slug: string = config.tenant.slug): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const store = config.services.orderingStore.replace(/\/+$/, '');
  if (store) return `${store}${p}`;
  return `${config.services.orderingPwa.replace(/\/+$/, '')}/${slug}${p}`;
}
