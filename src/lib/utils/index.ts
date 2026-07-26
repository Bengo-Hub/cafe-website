export * from './currency';
export * from './date';
export * from './string';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Resolve a media path to a full URL.
 * Handles both full URLs (https://...) and relative paths (/media/images/...).
 * Prefers the inventory service (master data) as the base for relative paths.
 */
export function getMediaUrl(path: string | undefined | null): string {
  if (!path) return '';
  // Full URL — use as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // Relative path — resolve against inventory-api (master data source) or ordering-api fallback
  const inventoryBase = process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL || 'https://inventoryapi.codevertexafrica.com';
  const cleanBase = inventoryBase.replace(/\/v1\/?$/, '').replace(/\/+$/, '');

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
