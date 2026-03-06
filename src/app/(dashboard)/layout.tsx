'use client';

import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { useAuth } from '@/hooks/use-auth';
import { useMe } from '@/hooks/use-me';
import { hasRole, hasStaffOrAdminRole } from '@/lib/auth/roles';
import {
  BarChart3,
  Bell,
  Bike,
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

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Orders', icon: ShoppingBag, href: '/dashboard/orders' },
  { label: 'Menu', icon: ChefHat, href: '/dashboard/menu' },
  { label: 'Inventory', icon: Box, href: '/dashboard/inventory' },
  { label: 'Riders', icon: Bike, href: '/dashboard/riders', adminOnly: true },
  { label: 'Shifts', icon: Clock, href: '/dashboard/shifts' },
  { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { label: 'Team', icon: Users, href: '/dashboard/team', adminOnly: true },
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

  const visibleSidebarItems = SIDEBAR_ITEMS.filter(
    (item) => !item.adminOnly || hasRole(rbacUser ?? user ?? undefined, 'admin')
  );

  const canAccessDashboard = isLoading || !user || hasStaffOrAdminRole(rbacUser ?? user);
  if (!canAccessDashboard) {
    return null;
  }

  return (
    <div className="min-h-screen section-blend-cream flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-dark text-white transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="text-2xl font-black tracking-tighter">
              {(() => {
                const parts = brandLabel.trim().toUpperCase().split(/\s+/).filter(Boolean);
                const first = parts[0] ?? '';
                const rest = parts.slice(1).join('') || 'LOFT';
                return <>{first}<span className="text-brand-orange">{rest}</span></>;
              })()}
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
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
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                    : 'text-brand-beige/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-bold tracking-tight">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/10">
            <button
              onClick={logout}
              className="flex items-center gap-4 px-6 py-4 w-full text-brand-beige/60 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-bold tracking-tight">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-24 border-b border-brand-beige/10 flex items-center justify-between px-8 lg:px-12">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-6 w-6 text-primary-brand" />
          </button>

          <div className="flex items-center gap-6 ml-auto">
            <button className="relative p-3 rounded-2xl bg-brand-beige/5 text-secondary-brand hover:bg-brand-beige/10 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-3 right-3 h-2 w-2 bg-brand-orange rounded-full border-2 border-brand-light dark:border-brand-dark"></span>
            </button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-brand-beige/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-primary-brand">{user?.name || 'Dashboard User'}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange">{user?.role || 'Admin'}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-black">
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
