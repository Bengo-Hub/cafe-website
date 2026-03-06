'use client';

import { Button, Card } from '@/components/ui';
import { SSO_URLS } from '@/lib/auth/config';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('return_to') ?? '/';

  const handleSSOLogin = () => {
    setIsLoading(true);
    // Redirect through bridge screen after SSO for sync confirmation
    const bridgeUrl = `/auth/bridge?return_to=${encodeURIComponent(returnTo)}`;
    signIn('bengobox-auth', { callbackUrl: bridgeUrl });
  };

  const handleSSOSignup = () => {
    setIsLoading(true);
    const authServiceUrl = SSO_URLS.authService.replace('/api/v1', '');
    const signupUrl = new URL('/signup', authServiceUrl);
    signupUrl.searchParams.set('return_to', `${SSO_URLS.siteUrl}${returnTo}`);
    window.location.href = signupUrl.toString();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream dark:bg-brand-dark px-4 py-20 transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="electrical-border rounded-[3rem]">
          <Card className="p-10 shadow-2xl border-none bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md">
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">
                <span>Welcome Back</span>
              </div>
              <h1 className="text-4xl font-black text-primary-brand tracking-tighter">Sign <span className="text-brand-orange">In</span></h1>
              <p className="mt-2 text-lg font-light text-secondary-brand">Access your Urban Loft account</p>
            </div>

            <div className="space-y-6">
              <Button
                onClick={handleSSOLogin}
                disabled={isLoading}
                className="w-full h-16 rounded-2xl text-sm font-black uppercase tracking-widest bg-primary-brand text-white hover:bg-primary-brand/90 transition-all flex items-center justify-center gap-3"
              >
                <ShieldCheck className="h-5 w-5" />
                {isLoading ? 'Redirecting to SSO...' : 'Sign in with BengoBox'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-brand-beige/20"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-brand-dark px-4 text-secondary-brand opacity-40 font-bold tracking-widest">Single Sign-On</span>
                </div>
              </div>

              <p className="text-center text-secondary-brand/70 text-xs leading-relaxed">
                Your BengoBox account gives you access to all services including ordering, reservations, loyalty rewards, and more.
              </p>

              <Button
                onClick={handleSSOSignup}
                disabled={isLoading}
                variant="outline"
                className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest border-brand-orange/30 text-brand-orange hover:bg-brand-orange/5 transition-all"
              >
                {isLoading ? 'Redirecting...' : 'Create New Account'}
              </Button>
            </div>

            <div className="mt-10 text-center text-sm font-light text-secondary-brand">
              Need help?{' '}
              <Link href="/contact" className="font-black text-brand-orange hover:text-brand-orange/80 uppercase tracking-widest text-xs ml-1">
                Contact Us
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-brand-cream dark:bg-brand-dark">
        <div className="animate-pulse text-secondary-brand">Loading...</div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
