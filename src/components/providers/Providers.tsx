'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { setOn401 } from '@/lib/api/client';
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
  useEffect(() => {
    setOn401(() => {
      const status = useAuthStore.getState().status;
      if (status === 'syncing' || status === 'loading') return;
      queryClient.clear();
      void logout();
    });
    return () => setOn401(null);
  }, [queryClient, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <TenantBrandProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </TenantBrandProvider>
    </QueryClientProvider>
  );
}
