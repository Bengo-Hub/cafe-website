'use client';

import { Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { hasStaffOrAdminRole } from '@/lib/auth/roles';
import { LayoutDashboard, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login?return_to=' + encodeURIComponent('/profile'));
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen section-blend-cream flex items-center justify-center px-4">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const isStaff = user && hasStaffOrAdminRole(user);
  const primaryRole = (user?.roles && user.roles[0]) || user?.role || 'Customer';

  return (
    <main className="min-h-screen section-blend-cream py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-black text-primary-brand tracking-tight">My Profile</h1>
          <p className="text-secondary-brand mt-1">Your account details and quick links.</p>
        </header>

        <Card className="p-8 magical-card border-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange text-3xl font-black">
              {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || <User className="h-10 w-10" />}
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-black text-primary-brand">{user?.name ?? user?.fullName ?? 'User'}</h2>
              {user?.email && (
                <p className="flex items-center gap-2 text-secondary-brand">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              )}
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-bold uppercase tracking-widest">
                {primaryRole}
              </p>
            </div>
          </div>
        </Card>

        {isStaff && (
          <Card className="p-6 magical-card border-none border-l-4 border-l-brand-orange">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-black text-primary-brand">Staff Dashboard</h3>
                <p className="text-sm text-secondary-brand mt-1">Manage orders, menu, and settings.</p>
              </div>
              <Link href="/dashboard">
                <Button className="gap-2 bg-brand-orange hover:bg-brand-burnt text-white font-bold">
                  <LayoutDashboard className="h-5 w-5" />
                  Open Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        )}

        <div className="flex justify-center pt-4">
          <Link href="/" className="text-sm font-bold text-brand-orange hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
