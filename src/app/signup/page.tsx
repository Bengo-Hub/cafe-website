'use client';

import { Button, Card } from '@/components/ui';
import { SSO_URLS } from '@/lib/auth/config';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Redirect to SSO signup page with return URL to cafe-website
  const handleSSOSignup = () => {
    setIsLoading(true);
    // Redirect to auth-ui signup page with return URL
    const authServiceUrl = SSO_URLS.authService.replace('/api/v1', '');
    const signupUrl = new URL('/signup', authServiceUrl);
    signupUrl.searchParams.set('return_to', `${SSO_URLS.siteUrl}/`);
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
                <span>Join the Community</span>
              </div>
              <h1 className="text-4xl font-black text-primary-brand tracking-tighter">Create <span className="text-brand-orange">Account</span></h1>
              <p className="mt-2 text-lg font-light text-secondary-brand">Start your Urban Loft journey today</p>
            </div>

            <div className="space-y-6">
              <p className="text-center text-secondary-brand text-sm">
                Create your BengoBox account to access all services including ordering, reservations, and loyalty rewards.
              </p>

              <Button
                onClick={handleSSOSignup}
                disabled={isLoading}
                className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest bg-brand-orange hover:bg-brand-orange/90 text-white shadow-xl shadow-brand-orange/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? 'Redirecting...' : 'Sign Up with BengoBox SSO'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-brand-beige/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-brand-dark px-4 text-secondary-brand/60 tracking-widest">
                    Single Sign-On
                  </span>
                </div>
              </div>

              <p className="text-center text-secondary-brand/70 text-xs">
                Your account works across all BengoBox services: Urban Cafe, POS, Ordering App, and more.
              </p>
            </div>

            <div className="mt-10 text-center text-sm font-light text-secondary-brand">
              Already have an account?{' '}
              <Link href="/login" className="font-black text-brand-orange hover:text-brand-orange/80 uppercase tracking-widest text-xs ml-1">
                Sign in
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>
    </main>
  );
}
