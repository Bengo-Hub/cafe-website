'use client';

import { hasStaffOrAdminRole } from '@/lib/auth/roles';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

/** Default landing after login: dashboard for staff/admin, profile for others. */
function getDefaultLandingPath(user: { role?: string; roles?: string[] } | null): string {
  if (!user) return '/profile';
  return hasStaffOrAdminRole(user) ? '/dashboard' : '/profile';
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams?.get('code');
  const error = searchParams?.get('error');
  const { handleSSOCallback, status, error: authError, user } = useAuthStore();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (code && !hasStarted.current && typeof window !== 'undefined') {
      hasStarted.current = true;
      const callbackUrl = `${window.location.origin}/auth/callback`;
      handleSSOCallback(code, callbackUrl);
    }
  }, [code, handleSSOCallback]);

  useEffect(() => {
    if (status === 'authenticated') {
      const returnTo = typeof window !== 'undefined' ? sessionStorage.getItem('sso_return_to') : null;
      sessionStorage.removeItem('sso_return_to');
      
      // Handle tenant-specific routing if tenant was forced
      const forcedTenant = searchParams?.get('tenant');
      if (forcedTenant && user?.tenant_slug !== forcedTenant) {
        console.warn('Tenant mismatch in callback: expected', forcedTenant, 'got', user?.tenant_slug);
      }

      // Use return_to when it was explicitly set and is a real path; otherwise role-based default
      const isExplicitReturn = returnTo && returnTo !== '/' && returnTo !== '/login' && returnTo.startsWith('/');
      const target = isExplicitReturn ? returnTo : getDefaultLandingPath(user);
      router.replace(target);
    }
  }, [status, user, router, searchParams]);

  if (error || authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark px-4">
        <div className="text-center p-8 border border-red-500/20 rounded-xl bg-red-500/5 max-w-md">
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Authentication Failed</h1>
          <p className="text-secondary-brand">{error || authError}</p>
          <button
            onClick={() => router.replace('/login')}
            className="mt-6 px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-medium text-primary-brand">Completing Sign-in...</h1>
        <p className="text-secondary-brand">Syncing your profile.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark">
        <div className="animate-pulse text-secondary-brand">Loading...</div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
