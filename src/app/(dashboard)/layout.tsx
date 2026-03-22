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
    ChevronDown,
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
import { useEffect, useRef, useState } from 'react';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { logout, user, isAuthenticated, isLoading } = useAuth();
  const { me, roles: meRoles } = useMe();
  const { tenant, getServiceTitle } = useTenantBrand();
  const displayName = user?.name ?? user?.fullName ?? user?.email?.split('@')[0] ?? 'User';

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
        {/* Top Header — theme-aware */}
        <header className="h-20 border-b border-border flex items-center justify-between px-4 sm:px-8 bg-background sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-black tracking-tight text-foreground hidden lg:block uppercase bg-gradient-to-r from-brand-orange to-brand-gold bg-clip-text text-transparent">
              {getServiceTitle('Cafe')}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <button className="relative p-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-all" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-background" />
            </button>

            <div className="h-8 w-[1px] bg-border hidden sm:block" />

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-3 rounded-2xl hover:bg-muted p-1 pr-2 transition-all group"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                aria-label="Open profile menu"
              >
                <div className="h-9 w-9 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange font-black text-xs shadow-inner">
                  {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-black text-foreground truncate max-w-[120px] uppercase tracking-tight">{displayName.split(' ')[0]}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{(rbacUser as any)?.role || user?.role || 'Staff'}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl p-3 shadow-2xl border border-border bg-background overflow-hidden">
                    <div className="mb-2 px-3 py-2">
                      <p className="text-sm font-black text-foreground">{displayName}</p>
                      <p className="text-[10px] text-muted-foreground truncate font-bold uppercase tracking-widest mt-0.5">{user?.email}</p>
                    </div>
                    <div className="h-[1px] bg-border my-2 mx-1" />
                    <div className="grid gap-1">
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:text-brand-orange transition-colors">
                          <Settings className="h-4 w-4" />
                        </div>
                        Settings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group w-full"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center transition-colors">
                          <LogOut className="h-4 w-4" />
                        </div>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-10 overflow-y-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
