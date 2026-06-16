'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { setOn401, setOnLimitReached } from '@/lib/api/client';
import { parseLimitInfo } from '@/lib/api/error-handler';
import { useLimitModal } from '@/store/limit-modal';
import { LimitReachedModal } from '@/components/subscription/limit-reached-modal';
import { OfflineBar } from '@bengo-hub/shared-ui-lib/offline';
import { useAuthStore } from '@/lib/store/auth-store';
import { TenantBrandProvider } from './TenantBrandProvider';
import { ThemeProvider } from './ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));
  const logout = useAuthStore((s) => s.logout);

  // NOTE: Do NOT call initialize() here — it races with Zustand persist hydration.
  // onRehydrateStorage in auth-store.ts handles initialization AFTER hydration completes.

  // Register 401 handler: clear all caches and redirect to SSO.
  // Skip during syncing/loading to avoid clearing session during JIT sync.
  // Also skip within 15s of authentication (tokens may still be propagating).
  // Note: the primary defense is token refresh in client.ts — this callback
  // only fires after refresh has already failed.
  useEffect(() => {
    setOn401(() => {
      const { status, lastAuthenticatedAt } = useAuthStore.getState();
      if (status === 'syncing' || status === 'loading') return;
      if (lastAuthenticatedAt && Date.now() - lastAuthenticatedAt < 15_000) return;
      queryClient.clear();
      void logout();
    });
    return () => setOn401(null);
  }, [queryClient, logout]);

  // Wire 402/429 plan-limit-reached → limit modal
  useEffect(() => {
    setOnLimitReached((data) => {
      const info = parseLimitInfo(data);
      if (info) useLimitModal.getState().show(info);
    });
    return () => setOnLimitReached(null);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TenantBrandProvider>
        <ThemeProvider>
          <OfflineBar availableOffline={['Browse cached pages']} disabledOffline={['Ordering', 'Account actions']} />
          {children}
          <LimitReachedModal />
        </ThemeProvider>
      </TenantBrandProvider>
    </QueryClientProvider>
  );
}
