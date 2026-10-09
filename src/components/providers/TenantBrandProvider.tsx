'use client';

import { fetchTenantBySlug, type TenantBrand } from '@/lib/api/tenants';
import { serviceAppName } from '@bengo-hub/shared-ui-lib/branding';
import { useTenantSlug } from '@/hooks/use-tenant-slug';
import { useQuery } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

const DEFAULT_BRAND: TenantBrand = {
  id: '',
  name: 'Urban Loft Cafe',
  slug: 'urban-loft',
  logoUrl: null,
  primaryColor: null,
  secondaryColor: null,
  orgName: 'Urban Loft Cafe',
};

type TenantBrandContextValue = {
  slug: string;
  tenant: TenantBrand | null;
  isLoading: boolean;
  error: Error | null;
  getServiceTitle: (appName: string) => string;
};

const TenantBrandContext = createContext<TenantBrandContextValue>({
  slug: DEFAULT_BRAND.slug,
  tenant: null,
  isLoading: true,
  error: null,
  getServiceTitle: (s) => s,
});

const BRAND_CSS_VARS = [
  { key: '--brand-orange', fallback: '#ea8022' },
  { key: '--brand-gold', fallback: '#ae6221' },
] as const;

function applyBrandColors(tenant: TenantBrand | null) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (!tenant?.primaryColor && !tenant?.secondaryColor) {
    BRAND_CSS_VARS.forEach(({ key }) => {
      root.style.removeProperty(key);
    });
    return;
  }
  if (tenant.primaryColor) {
    root.style.setProperty('--brand-orange', tenant.primaryColor);
  }
  if (tenant.secondaryColor) {
    root.style.setProperty('--brand-gold', tenant.secondaryColor);
  }
}

export function TenantBrandProvider({ children }: { children: ReactNode }) {
  const slug = useTenantSlug();
  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ['tenant', slug],
    queryFn: () => fetchTenantBySlug(slug),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours — aligned with JWT TTL
    enabled: !!slug,
  });

  const effectiveBrand = useMemo(() => {
    if (tenant) return tenant;
    if (!isLoading && !tenant && slug) {
      return { ...DEFAULT_BRAND, slug, name: slug, orgName: slug };
    }
    return null;
  }, [tenant, isLoading, slug]);

  useEffect(() => {
    applyBrandColors(tenant ?? null);
  }, [tenant]);

  // Shared rule (shared-ui-lib branding): the tenant's own name for this site (Accounts >
  // Branding, key "cafe") wins, else "<brand word> <appName>" ("The Urban Loft Cafe" gives
  // "The Urban Cafe").
  const getServiceTitle = (appName: string) =>
    serviceAppName(
      effectiveBrand?.orgName || effectiveBrand?.name,
      appName,
      'Codevertex',
      effectiveBrand?.serviceBranding?.cafe,
    );

  const value = useMemo<TenantBrandContextValue>(
    () => ({
      slug,
      tenant: effectiveBrand,
      isLoading,
      error: error as Error | null,
      getServiceTitle,
    }),
    [slug, effectiveBrand, isLoading, error, getServiceTitle]
  );

  return (
    <TenantBrandContext.Provider value={value}>
      {children}
    </TenantBrandContext.Provider>
  );
}

export function useTenantBrand(): TenantBrandContextValue {
  const ctx = useContext(TenantBrandContext);
  return ctx;
}
