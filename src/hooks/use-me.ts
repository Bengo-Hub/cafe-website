'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchMe, type MeResponse } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth-store';

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches current user (roles + permissions) from auth-api GET /api/v1/auth/me.
 * Cached with TanStack Query (staleTime 5 min). Only runs when the user is authenticated (has access token).
 * Use for RBAC: nav visibility, route protection, and permission checks.
 */
export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = !!accessToken;

  const query = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: STALE_TIME_MS,
    enabled: isAuthenticated,
    retry: (failureCount, error: Error & { status?: number }) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });

  return {
    ...query,
    me: query.data ?? null,
    roles: query.data?.roles ?? [],
    permissions: query.data?.permissions ?? [],
  };
}

export type { MeResponse };
