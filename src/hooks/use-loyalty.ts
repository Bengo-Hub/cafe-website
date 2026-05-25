'use client';

import { loyaltyApi, type LoyaltyAccount, type LoyaltyProgram } from '@/lib/api/loyalty';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { config } from '@/config/env';

function useTenantSlug() {
  const slug = useAuthStore((s) => s.user?.tenant_slug);
  return slug ?? config.tenant.slug;
}

export function useLoyaltyPrograms() {
  const tenantSlug = useTenantSlug();
  return useQuery({
    queryKey: ['loyalty-programs', tenantSlug],
    queryFn: async () => {
      const res = await loyaltyApi.getPrograms(tenantSlug);
      return (res.data ?? []) as LoyaltyProgram[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useLoyaltyAccountByPhone(phone: string | null) {
  const tenantSlug = useTenantSlug();
  return useQuery({
    queryKey: ['loyalty-account-phone', tenantSlug, phone],
    queryFn: async () => {
      const res = await loyaltyApi.lookupByPhone(tenantSlug, phone!);
      const accounts = (res.data ?? []) as LoyaltyAccount[];
      return accounts[0] ?? null;
    },
    enabled: !!phone && phone.length >= 9,
    staleTime: 2 * 60 * 1000,
  });
}

export function useLoyaltyAccount(accountId: string | null) {
  const tenantSlug = useTenantSlug();
  return useQuery({
    queryKey: ['loyalty-account', tenantSlug, accountId],
    queryFn: async () => {
      const res = await loyaltyApi.getAccount(tenantSlug, accountId!);
      return (res.data ?? null) as LoyaltyAccount | null;
    },
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useLoyaltyTransactions(accountId: string | null) {
  const tenantSlug = useTenantSlug();
  return useQuery({
    queryKey: ['loyalty-transactions', tenantSlug, accountId],
    queryFn: async () => {
      const res = await loyaltyApi.getTransactions(tenantSlug, accountId!);
      return res.data ?? [];
    },
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000,
  });
}
