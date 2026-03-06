'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useCallback } from 'react';

/**
 * Auth hook: SSO-only. login() redirects to auth-service; user/session from store.
 */
export const useAuth = () => {
  const { user, status, accessToken, redirectToSSO, logout: storeLogout } = useAuthStore();

  const isAuthenticated = !!user || !!accessToken;

  const login = useCallback((returnTo?: string) => {
    redirectToSSO(returnTo);
  }, [redirectToSSO]);

  const logout = useCallback(async () => {
    await storeLogout();
  }, [storeLogout]);

  return {
    user: user ?? null,
    isAuthenticated,
    isLoading: status === 'loading' || status === 'syncing',
    login,
    logout,
    getSSOLoginUrl: (returnTo?: string) => {
      const base = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'https://sso.codevertexitsolutions.com';
      const url = new URL('/api/v1/authorize', base);
      if (returnTo) url.searchParams.set('return_to', returnTo);
      return url.toString();
    },
  };
};
