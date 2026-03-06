'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Legacy bridge route: redirects to login (SSO). Previously used after NextAuth callback.
 */
export default function BridgePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream dark:bg-brand-dark">
      <div className="animate-pulse text-secondary-brand">Redirecting...</div>
    </main>
  );
}
