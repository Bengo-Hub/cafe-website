'use client';

import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { useAuth } from '@/hooks/use-auth';
import { useMe } from '@/hooks/use-me';
import { hasPermission, hasRole, hasStaffOrAdminRole } from '@/lib/auth/roles';
import {
    BarChart3,
    Bell,
    Bike,
    BookOpen,
    Box,
    ChefHat,
    Clock,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    ShoppingBag,
    Users,
    X
} from 'lucide-react';
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
  { label: 'Orders', icon: ShoppingBag, href: '/dashboard/orders', permission: 'orders:read' },
  { label: 'Menu', icon: ChefHat, href: '/dashboard/menu', permission: 'menu:read' },
  { label: 'Recipes', icon: BookOpen, href: '/dashboard/recipes', permission: 'menu:read' },
  { label: 'Inventory', icon: Box, href: '/dashboard/inventory', permission: 'inventory:read' },
  { label: 'Riders', icon: Bike, href: '/dashboard/riders', adminOnly: true, permission: 'riders:read' },
  { label: 'Shifts', icon: Clock, href: '/dashboard/shifts' },
  { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { label: 'Team', icon: Users, href: '/dashboard/team', adminOnly: true, permission: 'users:read' },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout, user, isAuthenticated, isLoading } = useAuth();
  const { me, roles: meRoles } = useMe();
  const { tenant } = useTenantBrand();
  const brandLabel = tenant?.orgName ?? tenant?.name ?? 'URBAN LOFT';

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
      {/* Sidebar - theme-aware via CSS variables */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-foreground)',
        }}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="text-2xl font-black tracking-tighter" style={{ color: 'var(--sidebar-foreground)' }}>
              {(() => {
                const parts = brandLabel.trim().toUpperCase().split(/\s+/).filter(Boolean);
                const first = parts[0] ?? '';
                const rest = parts.slice(1).join('') || 'LOFT';
                return <>{first}<span style={{ color: 'var(--sidebar-accent)' }}>{rest}</span></>;
              })()}
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden opacity-80 hover:opacity-100">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-grow space-y-2">
            {visibleSidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
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
              className="flex items-center gap-4 px-6 py-4 w-full opacity-70 hover:opacity-100 hover:text-red-400 transition-colors"
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
        {/* Top Header - theme-aware */}
        <header className="h-24 border-b border-border flex items-center justify-between px-8 lg:px-12 bg-background">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-6 ml-auto">
            <button className="relative p-3 rounded-2xl bg-muted text-muted-foreground hover:bg-muted/80 transition-all" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-3 right-3 h-2 w-2 bg-primary rounded-full border-2 border-background" />
            </button>

            <div className="flex items-center gap-4 pl-6 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{user?.name || 'Dashboard User'}</p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{user?.role || 'Admin'}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 lg:p-12 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
