'use client';

import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { fetchMyLoyalty, fetchPublicProgram, loyaltyStaffApi } from '@/lib/api/loyalty';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { config } from '@/config/env';

function useTenantSlug() {
  const slug = useAuthStore((s) => s.user?.tenant_slug);
  return slug ?? config.tenant.slug;
}

/** The tenant's active programme (public terms). The tenant UUID comes from the auth-api record. */
export function useLoyaltyProgram() {
  const { tenant } = useTenantBrand();
  const tenantId = tenant?.id ?? '';
  return useQuery({
    queryKey: ['loyalty-program', tenantId],
    queryFn: () => fetchPublicProgram(tenantId),
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

/** The signed-in customer's own points; idle for visitors. */
export function useMyLoyalty() {
  const { tenant } = useTenantBrand();
  const tenantId = tenant?.id ?? '';
  const token = useAuthStore((s) => s.accessToken);
  const authed = useAuthStore((s) => s.status === 'authenticated');
  return useQuery({
    queryKey: ['loyalty-me', tenantId, token],
    queryFn: () => fetchMyLoyalty(token!, tenantId),
    enabled: authed && !!token && !!tenantId,
    staleTime: 60 * 1000,
    retry: false,
  });
}

/** Staff dashboard: member by phone. */
export function useLoyaltyAccountByPhone(phone: string | null) {
  const tenantSlug = useTenantSlug();
  return useQuery({
    queryKey: ['loyalty-account-phone', tenantSlug, phone],
    queryFn: () => loyaltyStaffApi.lookupByPhone(tenantSlug, phone!),
    enabled: !!phone && phone.length >= 9,
    staleTime: 2 * 60 * 1000,
  });
}

/** Staff dashboard: one member's latest transactions (pos-api returns the last 20 with the account). */
export function useLoyaltyTransactions(accountId: string | null) {
  const tenantSlug = useTenantSlug();
  return useQuery({
    queryKey: ['loyalty-account', tenantSlug, accountId],
    queryFn: async () => (await loyaltyStaffApi.getAccount(tenantSlug, accountId!))?.transactions ?? [],
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000,
  });
}
