'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
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
