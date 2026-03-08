'use client';

import { Button, Card, Label, Switch } from '@/components/ui';
import { config } from '@/config/env';
import { useAuth } from '@/hooks/use-auth';
import { hasStaffOrAdminRole } from '@/lib/auth/roles';
import { useThemeStore } from '@/lib/store/theme-store';
import { LayoutDashboard, Mail, Moon, Settings, Sun, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AUTH_UI_URL = typeof config?.services?.auth === 'string' ? config.services.auth : 'https://sso.codevertexitsolutions.com';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();

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
    <main className="min-h-screen section-blend-cream py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        <header className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-primary-brand tracking-tight">My Profile</h1>
          <p className="text-secondary-brand mt-1 text-sm sm:text-base">Your account details, preferences, and settings.</p>
        </header>

        {/* Account info */}
        <Card className="p-5 sm:p-8 magical-card border-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange text-2xl sm:text-3xl font-black shrink-0">
              {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || <User className="h-8 w-8 sm:h-10 sm:w-10" />}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-primary-brand truncate">{user?.name ?? user?.fullName ?? 'User'}</h2>
              {user?.email && (
                <p className="flex items-center gap-2 text-secondary-brand text-sm sm:text-base truncate">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              )}
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs sm:text-sm font-bold uppercase tracking-widest">
                {primaryRole}
              </p>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-5 sm:p-6 magical-card border-none">
          <h3 className="font-black text-primary-brand text-base sm:text-lg flex items-center gap-2 mb-4">
            <Sun className="h-4 w-4" />
            Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 py-2">
              <Label htmlFor="profile-theme" className="text-sm font-semibold text-brand-dark dark:text-white">
                Dark mode
              </Label>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-brand-muted" />
                <Switch
                  id="profile-theme"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
                <Moon className="h-4 w-4 text-brand-muted" />
              </div>
            </div>
            <p className="text-xs text-secondary-brand">
              Language and notification preferences can be managed from your account settings.
            </p>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-5 sm:p-6 magical-card border-none">
          <h3 className="font-black text-primary-brand text-base sm:text-lg flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4" />
            Settings
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-secondary-brand">
              Name, email, and security are managed by your central account.
            </p>
            <a
              href={AUTH_UI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:underline"
            >
              Open account settings →
            </a>
          </div>
        </Card>

        {isStaff && (
          <Card className="p-5 sm:p-6 magical-card border-none border-l-4 border-l-brand-orange">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-black text-primary-brand">Staff Dashboard</h3>
                <p className="text-sm text-secondary-brand mt-1">Manage orders, menu, and settings.</p>
              </div>
              <Link href="/dashboard">
                <Button className="gap-2 bg-brand-orange hover:bg-brand-burnt text-white font-bold w-full sm:w-auto">
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
