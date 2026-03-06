'use client';

import { config } from '@/config/env';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Returns the tenant slug for the current context.
 * Source: route (e.g. /t/[slug]/...) or NEXT_PUBLIC_TENANT_SLUG env fallback.
 * Route takes precedence when pathname matches /t/[slug].
 */
export function useTenantSlug(): string {
  const pathname = usePathname();
  return useMemo(() => {
    const segment = pathname?.split('/').filter(Boolean);
    if (segment[0] === 't' && segment[1]) {
      return segment[1];
    }
    return config.tenant.slug;
  }, [pathname]);
}
