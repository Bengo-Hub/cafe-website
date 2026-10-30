/**
 * Where the cafe's online store lives, shared by the app (src/lib/ordering-url.ts) and
 * next.config.mjs (the /menu redirect). On the cafe's own store domain the storefront is served at
 * the root, so the slug is left out of the path; on the shared ordering PWA it is /<slug>/...
 */

const DEFAULT_PWA = 'https://ordering.codevertexafrica.com';

/** @returns {{ store: string, pwa: string, slug: string }} */
export function orderingTarget(env = process.env) {
  return {
    store: (env.NEXT_PUBLIC_ORDERING_STORE_URL || '').replace(/\/+$/, ''),
    pwa: (env.NEXT_PUBLIC_ORDERING_PWA_URL || DEFAULT_PWA).replace(/\/+$/, ''),
    slug: env.NEXT_PUBLIC_TENANT_SLUG || 'urban-loft',
  };
}

/**
 * @param {{ store: string, pwa: string, slug: string }} target
 * @param {string} path
 */
export function buildOrderingUrl(target, path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return target.store ? `${target.store}${p}` : `${target.pwa}/${target.slug}${p}`;
}
