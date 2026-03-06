'use client';

import { Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, RefreshCw, ShieldCheck, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

type SyncStatus = 'syncing' | 'synced' | 'failed';

function BridgeContent() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('return_to') ?? '/';
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [attempts, setAttempts] = useState(0);

  const redirectToDestination = useCallback(() => {
    const user = session?.user as any;
    if (!user) {
      router.replace(returnTo);
      return;
    }

    // Route based on user role
    const roles: string[] = user.roles || [user.role || 'customer'];
    if (roles.includes('staff') || roles.includes('admin') || roles.includes('superuser')) {
      router.replace('/dashboard/orders');
    } else {
      router.replace(returnTo);
    }
  }, [session, router, returnTo]);

  useEffect(() => {
    // If not authenticated yet, wait for NextAuth session
    if (sessionStatus === 'loading') return;

    if (sessionStatus === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    // Session is established - check sync
    if (sessionStatus === 'authenticated' && session?.user) {
      setSyncStatus('synced');

      // Brief delay to show confirmation, then redirect
      const timer = setTimeout(() => {
        redirectToDestination();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [sessionStatus, session, router, redirectToDestination]);

  const handleRetry = () => {
    setAttempts((prev) => prev + 1);
    setSyncStatus('syncing');
    // Force page reload to re-check session
    window.location.reload();
  };

  const user = session?.user as any;

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream dark:bg-brand-dark px-4 py-20 transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-10 shadow-2xl border-none bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md rounded-3xl">
          <div className="text-center space-y-6">
            {/* Status Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-orange/10">
              {syncStatus === 'syncing' && (
                <Loader2 className="h-10 w-10 text-brand-orange animate-spin" />
              )}
              {syncStatus === 'synced' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </motion.div>
              )}
              {syncStatus === 'failed' && (
                <ShieldCheck className="h-10 w-10 text-red-500" />
              )}
            </div>

            {/* Status Text */}
            {syncStatus === 'syncing' && (
              <>
                <h1 className="text-2xl font-black text-primary-brand tracking-tighter">
                  Setting up your account...
                </h1>
                <p className="text-sm text-secondary-brand">
                  Syncing your BengoBox profile with Urban Loft Cafe
                </p>
              </>
            )}

            {syncStatus === 'synced' && user && (
              <>
                <h1 className="text-2xl font-black text-primary-brand tracking-tighter">
                  Welcome{user.name ? `, ${user.name}` : ''}!
                </h1>
                <div className="flex items-center justify-center gap-3 rounded-2xl bg-brand-cream/50 dark:bg-brand-dark/50 p-4">
                  <User className="h-5 w-5 text-brand-orange" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-primary-brand">{user.email}</p>
                    <p className="text-xs text-secondary-brand capitalize">
                      {(user.roles || [user.role || 'customer']).join(', ')}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-secondary-brand">
                  Redirecting you now...
                </p>
              </>
            )}

            {syncStatus === 'failed' && (
              <>
                <h1 className="text-2xl font-black text-primary-brand tracking-tighter">
                  Sync Issue
                </h1>
                <p className="text-sm text-secondary-brand">
                  We had trouble syncing your account. Please try again.
                </p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-white hover:bg-brand-orange/90 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
                {attempts >= 3 && (
                  <p className="text-xs text-secondary-brand">
                    If this persists, please{' '}
                    <a href="/contact" className="text-brand-orange underline">contact support</a>.
                  </p>
                )}
              </>
            )}
          </div>
        </Card>
      </motion.div>
    </main>
  );
}

export default function BridgePage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-brand-cream dark:bg-brand-dark">
        <Loader2 className="h-8 w-8 text-brand-orange animate-spin" />
      </main>
    }>
      <BridgeContent />
    </Suspense>
  );
}
