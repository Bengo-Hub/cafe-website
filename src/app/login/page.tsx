'use client';

import { Button, Card, Input } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth-store';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login
    login({
      id: '1',
      name: 'John Doe',
      email: email,
      role: 'customer',
    });
    router.push('/');
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-brand/60" htmlFor="email">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-white/50 dark:bg-brand-dark/50 border-brand-beige/20 focus:border-brand-orange px-6"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-brand/60" htmlFor="password">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange hover:text-brand-orange/80"
                  >
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-white/50 dark:bg-brand-dark/50 border-brand-beige/20 focus:border-brand-orange px-6"
                />
              </div>

              <Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest bg-brand-orange hover:bg-brand-orange/90 text-white shadow-xl shadow-brand-orange/20 transition-all hover:scale-[1.02]">
                Sign In
              </Button>
            </form>

            <div className="mt-10 text-center text-sm font-light text-secondary-brand">
              Don't have an account?{' '}
              <Link href="/signup" className="font-black text-brand-orange hover:text-brand-orange/80 uppercase tracking-widest text-xs ml-1">
                Sign up now
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>
    </main>
  );
}
