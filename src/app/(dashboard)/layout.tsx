'use client';

import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { SubscriptionBanner } from '@/components/subscription/subscription-banner';
import { useAuth } from '@/hooks/use-auth';
import { useMe } from '@/hooks/use-me';
import { hasPermission, hasRole, hasStaffOrAdminRole } from '@/lib/auth/roles';
import {
    BarChart3,
    Bike,
    BookOpen,
    Box,
    Calendar,
    ChefHat,
    ChevronDown,
    Clock,
    CreditCard,
    Gift,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    ShoppingBag,
    Users,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type NavItem = {
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
  adminOnly?: boolean;
  permission?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const SIDEBAR_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Orders', icon: ShoppingBag, href: '/dashboard/orders', permission: 'ordering.orders.view' },
      { label: 'Shifts', icon: Clock, href: '/dashboard/shifts' },
      { label: 'Payments', icon: CreditCard, href: '/dashboard/payments', permission: 'treasury.payments.view' },
      { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    ],
  },
  {
    label: 'Menu & Stock',
    items: [
      { label: 'Menu', icon: ChefHat, href: '/dashboard/menu', permission: 'ordering.catalog.view' },
      { label: 'Recipes', icon: BookOpen, href: '/dashboard/recipes', permission: 'ordering.catalog.view' },
      { label: 'Inventory', icon: Box, href: '/dashboard/inventory', permission: 'inventory.items.view' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Events', icon: Calendar, href: '/dashboard/events' },
      { label: 'Loyalty', icon: Gift, href: '/dashboard/loyalty', adminOnly: true },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Team', icon: Users, href: '/dashboard/team', adminOnly: true, permission: 'auth.users.view' },
      { label: 'Riders', icon: Bike, href: '/dashboard/riders', adminOnly: true, permission: 'logistics.fleet.view' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
    ],
  },
];

function effectiveUserForRbac(
  sessionUser: { role?: string; roles?: string[] } | null | undefined,
  meRoles: string[] | undefined
) {
  if (!sessionUser) return undefined;
  const roles = (meRoles?.length ? meRoles : sessionUser.roles) ?? (sessionUser.role ? [sessionUser.role] : []);
  return { ...sessionUser, roles, role: roles[0] ?? sessionUser.role };
}

function filterItems(items: NavItem[], rbacUser: ReturnType<typeof effectiveUserForRbac>) {
  return items.filter((item) => {
    if (item.adminOnly && !hasRole(rbacUser, 'admin')) return false;
    if (item.permission) {
      const perms = (rbacUser as { permissions?: string[] } | undefined)?.permissions;
      if (hasPermission({ permissions: perms }, item.permission)) return true;
      if (hasStaffOrAdminRole(rbacUser) && (!perms || perms.length === 0)) return true;
      return false;
    }
    return true;
  });
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, user, isAuthenticated, isLoading } = useAuth();
  const { me, roles: meRoles } = useMe();
  const { tenant } = useTenantBrand();

  const rbacUser = effectiveUserForRbac(user ?? undefined, me?.roles ?? meRoles);

  // Default open: any group containing the current path
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const open = new Set<string>();
    SIDEBAR_GROUPS.forEach((g) => {
      if (g.items.some((item) => pathname?.startsWith(item.href) && item.href !== '/dashboard')) {
        open.add(g.label);
      }
    });
    // Overview always open
    open.add('Overview');
    return open;
  });

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(pathname ? `/login?return_to=${encodeURIComponent(pathname)}` : '/login');
      return;
    }
    if (user && !hasStaffOrAdminRole(rbacUser ?? user)) {
      router.replace('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, rbacUser, router]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  if (!isLoading && user && !hasStaffOrAdminRole(rbacUser ?? user)) return null;

  const sidebarBg = { backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-foreground)' } as const;

  return (
    <div className="min-h-screen section-blend-cream flex">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={sidebarBg}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
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
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{ color: 'var(--sidebar-muted)' }}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav groups */}
          <nav className="flex-grow overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {SIDEBAR_GROUPS.map((group) => {
              const visibleItems = filterItems(group.items, rbacUser);
              if (visibleItems.length === 0) return null;

              const isOpen = openGroups.has(group.label);
              const hasActive = visibleItems.some((i) => pathname === i.href || (i.href !== '/dashboard' && pathname?.startsWith(i.href)));

              return (
                <div key={group.label}>
                  {/* Group header — skip for single-item Overview */}
                  {group.label !== 'Overview' && (
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="flex w-full items-center justify-between px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
                      style={{ color: hasActive ? 'var(--sidebar-accent)' : 'var(--sidebar-muted)' }}
                    >
                      <span>{group.label}</span>
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                      />
                    </button>
                  )}

                  {/* Items */}
                  {(group.label === 'Overview' || isOpen) && (
                    <div className={group.label !== 'Overview' ? 'mt-1 space-y-0.5' : 'space-y-0.5'}>
                      {visibleItems.map((item) => {
                        const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold tracking-tight ${
                              active ? 'shadow-md' : 'hover:opacity-100'
                            }`}
                            style={
                              active
                                ? { backgroundColor: 'var(--sidebar-accent)', color: 'white' }
                                : { color: 'var(--sidebar-muted)', opacity: 0.85 }
                            }
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl transition-colors text-sm font-bold hover:text-red-400"
              style={{ color: 'var(--sidebar-muted)' }}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col min-w-0">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 left-6 z-30 p-3 rounded-2xl bg-brand-orange text-white shadow-lg shadow-brand-orange/30 hover:brightness-110 transition-all"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <SubscriptionBanner />
        <div className="p-6 lg:p-10 overflow-y-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
