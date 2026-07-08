'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';

/**
 * Signup page: redirects to SSO (auth-service). No local form.
 */
function SignupContent() {
  const searchParams = useSearchParams();
  const redirectToSSO = useAuthStore((s) => s.redirectToSSO);

  const returnTo = searchParams?.get('return_to') ?? '/';

  useEffect(() => {
    redirectToSSO(returnTo);
  }, [redirectToSSO, returnTo]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream dark:bg-brand-dark px-4 py-20">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-medium text-primary-brand">Redirecting to sign up...</h1>
        <p className="text-secondary-brand mt-2">You will be taken to Codevertex SSO.</p>
        <p className="mt-6 text-sm text-secondary-brand">
          <Link href="/login" className="text-brand-orange font-semibold underline">Sign in instead</Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-brand-cream dark:bg-brand-dark">
        <div className="animate-pulse text-secondary-brand">Loading...</div>
      </main>
    }>
      <SignupContent />
    </Suspense>
  );
}
