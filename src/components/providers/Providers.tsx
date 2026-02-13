'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useState } from 'react';
import { ThemeProvider } from './ThemeProvider';

export function Providers({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
