'use client';

import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { useAuth } from '@/hooks/use-auth';
import { useMe } from '@/hooks/use-me';
import { hasPermission, hasRole, hasStaffOrAdminRole } from '@/lib/auth/roles';
import {
    BarChart3,
    Bike,
    BookOpen,
    Box,
    ChefHat,
    Clock,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    ShoppingBag,
    Users,
    X
} from 'lucide-react';
import { SubscriptionBanner } from '@/components/subscription/subscription-banner';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SIDEBAR_ITEMS: Array<{
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
  adminOnly?: boolean;
  permission?: string;
}> = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Orders', icon: ShoppingBag, href: '/dashboard/orders', permission: 'ordering.orders.view' },
  { label: 'Menu', icon: ChefHat, href: '/dashboard/menu', permission: 'ordering.catalog.view' },
  { label: 'Recipes', icon: BookOpen, href: '/dashboard/recipes', permission: 'ordering.catalog.view' },
  { label: 'Inventory', icon: Box, href: '/dashboard/inventory', permission: 'inventory.items.view' },
  { label: 'Riders', icon: Bike, href: '/dashboard/riders', adminOnly: true, permission: 'logistics.fleet.view' },
  { label: 'Shifts', icon: Clock, href: '/dashboard/shifts' },
  { label: 'Payments', icon: CreditCard, href: '/dashboard/payments', permission: 'treasury.payments.view' },
  { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { label: 'Team', icon: Users, href: '/dashboard/team', adminOnly: true, permission: 'auth.users.view' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

/** User-like shape for RBAC: prefer roles from auth-api /me when available. */
function effectiveUserForRbac(
  sessionUser: { role?: string; roles?: string[] } | null | undefined,
  meRoles: string[] | undefined
) {
  if (!sessionUser) return undefined;
  const roles = (meRoles?.length ? meRoles : sessionUser.roles) ?? (sessionUser.role ? [sessionUser.role] : []);
  return { ...sessionUser, roles, role: roles[0] ?? sessionUser.role };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, user, isAuthenticated, isLoading } = useAuth();
  const { me, roles: meRoles } = useMe();
  const { tenant } = useTenantBrand();

  const rbacUser = effectiveUserForRbac(user ?? undefined, me?.roles ?? meRoles);

  // Redirect unauthenticated users to login (which redirects to SSO)
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const returnTo = pathname ? `/login?return_to=${encodeURIComponent(pathname)}` : '/login';
      router.replace(returnTo);
      return;
    }
    if (user && !hasStaffOrAdminRole(rbacUser ?? user)) {
      router.replace('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, rbacUser, router]);

  const visibleSidebarItems = SIDEBAR_ITEMS.filter((item) => {
    const u = rbacUser ?? user ?? undefined;
    if (item.adminOnly && !hasRole(u, 'admin')) return false;
    if (item.permission) {
      const perms = (u as { permissions?: string[] } | undefined)?.permissions;
      if (hasPermission({ permissions: perms }, item.permission)) return true;
      if (hasStaffOrAdminRole(u) && (!perms || perms.length === 0)) return true;
      return false;
    }
    return true;
  });

  const canAccessDashboard = isLoading || !user || hasStaffOrAdminRole(rbacUser ?? user);
  if (!canAccessDashboard) {
    return null;
  }

  return (
    <div className="min-h-screen section-blend-cream flex">
      {/* Sidebar mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — theme-aware via CSS variables */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-foreground)',
        }}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="flex items-center gap-2">
              {tenant?.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.name} className="h-10 w-auto object-contain" />
              ) : (
                <div className="h-10 w-10 bg-brand-orange rounded-xl flex items-center justify-center text-white font-black text-xl shadow-glow-orange">
                  {tenant?.name?.[0] || 'U'}
                </div>
              )}
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden opacity-80 hover:opacity-100 p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-grow space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {visibleSidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                  pathname === item.href
                    ? 'shadow-lg'
                    : 'opacity-70 hover:opacity-100 hover:bg-white/5'
                }`}
                style={
                  pathname === item.href
                    ? { backgroundColor: 'var(--sidebar-accent)', color: 'white' }
                    : { color: 'var(--sidebar-muted)' }
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-bold tracking-tight">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
            <button
              onClick={logout}
              className="flex items-center gap-4 px-6 py-4 w-full opacity-70 hover:opacity-100 hover:text-red-400 transition-colors rounded-2xl"
              style={{ color: 'var(--sidebar-muted)' }}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-bold tracking-tight">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* Mobile sidebar toggle — floats over content on small screens */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 left-6 z-30 p-3 rounded-2xl bg-brand-orange text-white shadow-lg shadow-brand-orange/30 hover:brightness-110 transition-all"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <SubscriptionBanner />
        {/* Page Content */}
        <div className="p-6 lg:p-10 overflow-y-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
