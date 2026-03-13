'use client';

import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/lib/store/auth-store';
import { useThemeStore } from '@/lib/store/theme-store';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    Facebook,
    Instagram,
    LogOut,
    Menu,
    Moon,
    Phone,
    Search,
    ShoppingBag,
    Sun,
    Twitter,
    User,
    X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function displayName(user: UserProfile | null | undefined): string {
  if (!user) return 'Account';
  return user.name ?? user.fullName ?? user.email?.split('@')[0] ?? 'Account';
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, login, logout } = useAuth();
  const { tenant } = useTenantBrand();
  const siteName = tenant?.orgName ?? tenant?.name ?? 'Urban Loft Cafe';
  const logoSrc = tenant?.logoUrl ?? '/images/logo/logo.jpeg';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isDashboard = pathname?.startsWith('/dashboard') ?? false;
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'Services', href: '/services' },
    { name: 'Events', href: '/events' },
    { name: 'Loyalty', href: '/loyalty' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Twitter, href: '#' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${isScrolled
          ? 'py-2 bg-white/80 dark:bg-brand-dark/80 backdrop-blur-xl shadow-xl border-b border-brand-orange/10'
          : 'py-4 bg-transparent'
        }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group" aria-label={`${siteName} Home`}>
              <div className="relative h-10 w-10 md:h-14 md:w-14 rounded-2xl overflow-hidden transition-all duration-500 group-hover:rotate-3 shadow-lg shadow-brand-orange/20">
                {logoSrc.startsWith('http') ? (
                  <img
                    src={logoSrc}
                    alt={`${siteName} logo`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <Image
                    src={logoSrc}
                    alt={`${siteName} logo`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority
                  />
                )}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg md:text-xl font-black text-brand-dark dark:text-brand-light tracking-tight group-hover:text-brand-orange transition-all duration-300">
                  {siteName}
                </span>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-brand-brown dark:text-brand-orange/70 group-hover:text-brand-orange transition-colors">
                  Eat. Work. Connect. Experience
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - hidden on dashboard (dashboard has its own top bar) */}
          {!isDashboard && (
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all duration-300 group ${isActive
                        ? 'text-brand-orange'
                        : 'text-brand-muted dark:text-brand-beige/70 hover:text-brand-orange'
                        }`}
                    >
                      <span className="relative z-10">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-brand-orange to-brand-gold"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <div className="absolute inset-0 bg-brand-orange/5 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search & Cart - hidden on dashboard */}
            {!isDashboard && (
              <div className="hidden md:flex items-center gap-2">
                <button className="p-2 rounded-xl text-brand-muted dark:text-brand-beige/70 hover:bg-brand-orange/10 hover:text-brand-orange transition-all">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="h-6 w-[1px] bg-brand-beige/20 dark:bg-brand-orange/10 hidden md:block" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-brand-muted dark:text-brand-beige/70 hover:bg-brand-orange/10 hover:text-brand-orange transition-all border border-transparent hover:border-brand-orange/20"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Auth Section */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full bg-brand-orange/5 border border-brand-orange/10 hover:border-brand-orange/30 transition-all group"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="h-8 w-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-black text-xs">
                      {(displayName(user))[0]?.toUpperCase() ?? <User className="h-4 w-4" />}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-dark dark:text-white group-hover:text-brand-orange transition-colors">
                      {displayName(user).split(' ')[0]}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-brand-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          aria-hidden="true"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 z-50 min-w-[180px] py-1 rounded-xl bg-white dark:bg-brand-dark border border-brand-orange/10 shadow-xl"
                        >
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-dark dark:text-white hover:bg-brand-orange/10 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout();
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-dark dark:text-white hover:bg-brand-orange/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => login()}
                    className="font-black uppercase tracking-widest text-[10px] rounded-xl"
                  >
                    Login
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-brand-muted dark:text-brand-beige/70 hover:bg-brand-orange/10 hover:text-brand-orange transition-all"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Modern Half-Screen Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop with blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in Drawer - Right side, half width, full height */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-[9999] lg:hidden w-[80%] sm:w-[65%] md:w-[50%] max-w-sm flex flex-col shadow-2xl"
              style={{
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                height: '100dvh',
                minHeight: '100vh',
              }}
            >
              {/* Drawer Header */}
              <div
                className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800"
                style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff' }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl overflow-hidden shadow-md">
                    <Image src="/images/logo/logo.jpeg" alt="Logo" width={36} height={36} className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-brand-dark dark:text-white">Urban Loft</span>
                    <span className="text-[10px] text-brand-muted dark:text-gray-400">Café</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-orange hover:text-white transition-all duration-200"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav
                className="flex-1 min-h-0 overflow-y-auto py-6 px-4"
                style={{
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                }}
              >
                <ul className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                            ? 'bg-brand-orange text-white'
                            : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-brand-orange'}`} />
                          <span className="text-base font-semibold">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Quick Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/menu"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-brand-orange/10 border border-brand-orange/20 hover:bg-brand-orange/20 transition-all"
                    >
                      <ShoppingBag className="h-5 w-5 text-brand-orange mb-1" />
                      <span className="text-xs font-semibold text-brand-dark dark:text-white">Order</span>
                    </Link>
                    <button
                      onClick={toggleTheme}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      {theme === 'light' ? <Moon className="h-5 w-5 text-gray-600 mb-1" /> : <Sun className="h-5 w-5 text-yellow-400 mb-1" />}
                      <span className="text-xs font-semibold text-brand-dark dark:text-white">{theme === 'light' ? 'Dark' : 'Light'}</span>
                    </button>
                  </div>
                </div>
              </nav>

              {/* Drawer Footer */}
              <div
                className="flex-shrink-0 px-5 py-4 border-t border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: theme === 'dark' ? '#222222' : '#f9fafb' }}
              >
                {/* Auth Buttons */}
                {!isAuthenticated ? (
                  <div className="flex gap-3 mb-4">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl font-semibold text-sm h-11 border-gray-200 dark:border-gray-700"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        login();
                      }}
                    >
                      Log In
                    </Button>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                      <Button className="w-full rounded-xl font-semibold text-sm h-11 bg-brand-orange hover:bg-brand-burnt text-white shadow-lg shadow-brand-orange/25">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="h-10 w-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold">
                      {(displayName(user))[0]?.toUpperCase() ?? <User className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-brand-dark dark:text-white">{displayName(user)}</p>
                      {user?.roles?.[0] ? <p className="text-xs text-gray-500 capitalize">{user.roles[0]}</p> : null}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs font-semibold text-brand-orange hover:underline"
                    >
                      Logout
                    </button>
                  </div>
                )}

                {/* Contact & Social */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {socialLinks.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.href}
                        className="h-9 w-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-brand-orange hover:border-brand-orange transition-all"
                      >
                        <social.icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                  <a href="tel:+254700000000" className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-orange transition-colors">
                    <Phone className="h-4 w-4" />
                    <span>Call Us</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
