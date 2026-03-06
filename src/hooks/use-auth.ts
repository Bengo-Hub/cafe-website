'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { SSO_URLS } from '@/lib/auth/config';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useCallback } from 'react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const { login: setStoreUser, setTokens, logout: clearStore } = useAuthStore();

  useEffect(() => {
    if (session?.user) {
      setStoreUser(session.user as any);
      const token = (session as { accessToken?: string; refreshToken?: string })?.accessToken ?? null;
      const refresh = (session as { refreshToken?: string })?.refreshToken ?? null;
      setTokens(token, refresh);
    } else if (status === 'unauthenticated') {
      clearStore();
    }
  }, [session, status, setStoreUser, setTokens, clearStore]);

  // SSO login - redirects to auth-service with optional return URL
  const login = useCallback((returnTo?: string) => {
    // Use NextAuth signIn with callback URL to preserve return path
    const callbackUrl = returnTo || window.location.href;
    signIn('bengobox-auth', { callbackUrl });
  }, []);

  // SSO logout - clears NextAuth session and redirects to SSO logout endpoint
  const logout = useCallback(async () => {
    // First clear the local store
    clearStore();

    // Then sign out from NextAuth (clears local session)
    // After NextAuth signOut, redirect to SSO logout to clear SSO session
    await signOut({
      redirect: false  // We'll handle the redirect manually to SSO
    });

    // Redirect to SSO logout endpoint to clear the SSO session
    // This ensures single sign-out across all services
    window.location.href = SSO_URLS.getLogoutUrl();
  }, [clearStore]);

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    login,
    logout,
    // Direct SSO URL getters for external use
    getSSOLoginUrl: SSO_URLS.getLoginUrl,
    getSSOLogoutUrl: SSO_URLS.getLogoutUrl,
  };
};
