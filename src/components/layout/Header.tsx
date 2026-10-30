'use client';

import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { useAuth } from '@/hooks/use-auth';
import { useMe } from '@/hooks/use-me';
import { orderingUrl } from '@/lib/ordering-url';
import { SITE, displayPhone, telHref } from '@/lib/site';
import type { UserProfile } from '@/lib/store/auth-store';
import { useThemeStore } from '@/lib/store/theme-store';
import { Bell, ChevronDown, LogOut, Menu, Moon, Phone, Settings, ShoppingBag, Sun, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV, type NavLink } from './nav';


function displayName(user: UserProfile | null | undefined): string {
  if (!user) return 'Account';
  return user.name ?? user.fullName ?? user.email?.split('@')[0] ?? 'Account';
}

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

/** A top-level group with a dropdown. Opens on hover or click, closes on Escape or outside click. */
function NavGroup({ item, pathname }: { item: { name: string; items: NavLink[] }; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = item.items.some((i) => isActive(pathname, i.href));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 px-3 py-2 text-[15px] font-medium transition-colors ${
          active ? 'text-ink underline decoration-loft decoration-2 underline-offset-[10px]' : 'text-ink-soft hover:text-ink'
        }`}
      >
        {item.name}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 pt-2">
          <ul className="w-72 rounded-lg border border-line bg-paper p-2 shadow-lg">
            {item.items.map((sub) => (
              <li key={sub.href}>
                <Link
                  href={sub.href}
                  className={`block rounded-md px-3 py-2.5 hover:bg-leaf ${isActive(pathname, sub.href) ? 'bg-leaf' : ''}`}
                >
                  <span className="block text-[15px] font-medium text-ink">{sub.name}</span>
                  {sub.note && <span className="block text-sm text-ink-soft">{sub.note}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname() ?? '/';
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, login, logout } = useAuth();
  const { me, roles: meRoles } = useMe();
  const { tenant, getServiceTitle } = useTenantBrand();
  const isDashboard = pathname.startsWith('/dashboard');
  // The public site carries the cafe's own name; the staff dashboard follows the shared app-name rule.
  const siteName = isDashboard ? getServiceTitle('Cafe') : SITE.name;
  const logoSrc = tenant?.logoUrl ?? '/images/logo/logo.jpeg';
  const phone = displayPhone(tenant?.contactPhone || SITE.phone);
  const storeHref = orderingUrl('/catalog', tenant?.slug || undefined);
  const hrefFor = (href: string) => (href === '/menu' ? storeHref : href);
  const userRole = meRoles?.[0] ?? me?.roles?.[0] ?? user?.role ?? (user?.roles as string[] | undefined)?.[0] ?? 'Staff';

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8" aria-label="Main">
        {isDashboard ? (
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${siteName} home`}>
            <span className="relative h-10 w-10 overflow-hidden rounded-md border border-line bg-white">
              {logoSrc.startsWith('http') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <Image src={logoSrc} alt="" fill sizes="40px" className="object-cover" priority />
              )}
            </span>
            <span className="font-display text-xl leading-none text-ink">{siteName}</span>
          </Link>
        ) : (
          // The full logo (sunburst and "The Urban Loft" wordmark), trimmed of its white margin. A white
          // plate keeps the brown lettering readable in the dark theme.
          <Link href="/" className="flex shrink-0 items-center rounded-md dark:bg-white dark:px-1.5 dark:py-1" aria-label={`${siteName} home`}>
            <Image
              src="/images/logo/urban-loft-lockup.png"
              alt={siteName}
              width={618}
              height={364}
              priority
              className="h-11 w-auto lg:h-[52px]"
            />
          </Link>
        )}

        {!isDashboard && (
          <div className="ml-4 hidden items-center lg:flex">
            {NAV.map((item) =>
              'items' in item ? (
                <NavGroup key={item.name} item={item} pathname={pathname} />
              ) : (
                <Link
                  key={item.name}
                  href={hrefFor(item.href)}
                  className={`px-3 py-2 text-[15px] font-medium transition-colors ${
                    isActive(pathname, item.href)
                      ? 'text-ink underline decoration-loft decoration-2 underline-offset-[10px]'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {item.name}
                </Link>
              ),
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {!isDashboard && (
            <>
              <Link
                href="/reserve"
                className="hidden h-10 items-center rounded-md border border-ink/20 px-4 text-sm font-semibold text-ink hover:border-ink xl:inline-flex"
              >
                Book a table
              </Link>
              <a
                href={storeHref}
                className="hidden h-10 items-center gap-2 rounded-md bg-loft px-4 text-sm font-semibold text-white hover:bg-loft-deep sm:inline-flex"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden /> Order online
              </a>
            </>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md p-2 text-ink-soft hover:bg-leaf hover:text-ink"
            aria-label={theme === 'light' ? 'Use dark theme' : 'Use light theme'}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {isDashboard && isAuthenticated && (
            <button className="rounded-md p-2 text-ink-soft hover:bg-leaf" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
          )}

          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-md p-1 pr-2 hover:bg-leaf"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-roast text-xs font-bold text-white">
                    {displayName(user).split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </span>
                  <span className="hidden text-left xl:block">
                    <span className="block max-w-[120px] truncate text-sm font-semibold text-ink">{displayName(user).split(' ')[0]}</span>
                    {isDashboard && <span className="block text-xs capitalize text-ink-soft">{userRole}</span>}
                  </span>
                  <ChevronDown className="h-4 w-4 text-ink-soft" aria-hidden />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" aria-hidden onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-line bg-paper p-2 shadow-lg">
                      <p className="px-3 py-2 text-sm font-semibold text-ink">{displayName(user)}</p>
                      <p className="truncate px-3 pb-2 text-xs text-ink-soft">{user?.email}</p>
                      <Link
                        href={isDashboard ? '/dashboard/settings' : '/profile'}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink hover:bg-leaf"
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => login()} className="rounded-md px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink">
                Sign in
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-ink hover:bg-leaf lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 flex h-[100dvh] w-[86%] max-w-sm flex-col bg-paper">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <span className="font-display text-xl text-ink">{siteName}</span>
              <button type="button" onClick={() => setMobileOpen(false)} className="rounded-md p-2 text-ink hover:bg-leaf" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-2 gap-2">
                <a href={storeHref} className="flex h-11 items-center justify-center gap-2 rounded-md bg-loft text-sm font-semibold text-white">
                  <ShoppingBag className="h-4 w-4" aria-hidden /> Order online
                </a>
                <Link href="/reserve" className="flex h-11 items-center justify-center rounded-md border border-ink/20 text-sm font-semibold text-ink">
                  Book a table
                </Link>
              </div>

              <ul className="mt-4">
                {NAV.map((item) =>
                  'items' in item ? (
                    <li key={item.name} className="border-t border-line py-3">
                      <p className="pb-1 text-sm text-ink-soft">{item.name}</p>
                      <ul>
                        {item.items.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              className={`block py-2 text-[17px] ${isActive(pathname, sub.href) ? 'font-semibold text-loft-deep' : 'text-ink'}`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <li key={item.name} className="border-t border-line">
                      <Link
                        href={hrefFor(item.href)}
                        className={`block py-3 text-[17px] ${isActive(pathname, item.href) ? 'font-semibold text-loft-deep' : 'text-ink'}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="border-t border-line px-5 py-4">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{displayName(user)}</span>
                  <button type="button" onClick={() => logout()} className="text-sm font-semibold text-loft-deep">
                    Sign out
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => login()} className="h-11 w-full rounded-md border border-ink/20 text-sm font-semibold text-ink">
                  Sign in
                </button>
              )}
              <a href={telHref(phone)} className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                <Phone className="h-4 w-4" aria-hidden /> {phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
