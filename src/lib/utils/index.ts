export * from './currency';
export * from './date';
export * from './string';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Resolve a media path to a full URL.
 * Prefers the ordering service URL from config.
 */
export function getMediaUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Use ordering service URL as base for images
  // ensure it doesn't end with /api/v1/ or similar if it's the raw base
  const baseUrl = process.env.NEXT_PUBLIC_ORDERING_SERVICE_URL || 'https://orderingapi.codevertexitsolutions.com';
  const cleanBase = baseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
