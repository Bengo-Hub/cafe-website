'use client';

import { Button } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth-store';
import { useThemeStore } from '@/lib/store/theme-store';
import { motion } from 'framer-motion';
import { Menu, Moon, Sun, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
    { name: 'Menu', href: '/menu' },
    { name: 'Events', href: '/events' },
    { name: 'Loyalty', href: '/loyalty' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-600 glass-morphism border-b border-brand-beige/20 dark:border-brand-orange/10 shadow-lg dark:shadow-2xl dark:shadow-black/50 backdrop-blur-2xl ${isScrolled ? 'scroll-solid' : ''}`}>
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-brand-orange/30 dark:via-brand-orange/30 to-transparent" />
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 md:h-24 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group" aria-label="Urban Loft Cafe Home">
              <div className="relative h-12 w-12 md:h-16 md:w-16 electrical-border rounded-2xl overflow-hidden transition-all duration-500">
                <Image
                  src="/images/logo/logo.jpg"
                  alt="Urban Loft Cafe logo"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xl md:text-2xl font-black text-brand-dark dark:text-brand-light tracking-tight group-hover:text-brand-orange dark:group-hover:text-brand-orange transition-all duration-300">Urban Loft <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Café</span></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-brown dark:text-brand-orange/70 group-hover:text-brand-orange transition-colors">Eat. Work. Connect. Experience</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {navigation.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className={`relative nav-link group ${
                        isActive
                          ? 'nav-link-active'
                          : 'text-brand-muted dark:text-brand-beige/70 hover:text-brand-dark dark:hover:text-brand-light'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 bg-gradient-to-r from-brand-orange/20 to-brand-orange/10 rounded-full -z-10 border border-brand-orange/30"
                          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-orange to-brand-gold"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
              
              <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-brand-beige/30 dark:via-brand-beige/20 to-transparent mx-6" />
              
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-brand-muted dark:text-brand-beige/70 hover:bg-brand-orange/10 dark:hover:bg-brand-orange/20 hover:text-brand-orange dark:hover:text-brand-orange transition-all border border-brand-beige/20 dark:border-brand-beige/20 hover:border-brand-orange/30 dark:hover:border-brand-orange/30 group"
                aria-label="Toggle theme"
              >
                <motion.div
                  animate={{ rotate: theme === 'light' ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {theme === 'light' ? (
                    <Moon className="h-5 w-5 group-hover:text-brand-orange transition-colors" />
                  ) : (
                    <Sun className="h-5 w-5 group-hover:text-brand-orange transition-colors" />
                  )}
                </motion.div>
              </motion.button>

              {/* Auth Section */}
              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 lg:gap-4 ml-3 lg:ml-4"
                >
                  <Link href="/profile" className="flex items-center gap-1.5 lg:gap-2 text-[9px] lg:text-xs font-black uppercase tracking-widest text-brand-dark dark:text-white hover:text-brand-orange dark:hover:text-brand-orange transition-all px-2 lg:px-4 py-2 rounded-full hover:bg-brand-beige/10 dark:hover:bg-white/5 group whitespace-nowrap">
                    <div className="h-8 lg:h-9 w-8 lg:w-9 rounded-full border-2 border-brand-orange/50 p-0.5 group-hover:border-brand-orange transition-colors flex-shrink-0">
                      <div className="h-full w-full rounded-full bg-gradient-to-br from-brand-orange/20 to-brand-orange/5 flex items-center justify-center">
                        <User className="h-4 lg:h-5 w-4 lg:w-5 text-brand-orange" />
                      </div>
                    </div>
                    <span className="hidden sm:inline truncate max-w-[80px] lg:max-w-none">{user?.name}</span>
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={logout} 
                      className="border border-brand-orange/50 text-brand-orange hover:bg-brand-orange hover:text-white dark:text-brand-orange dark:hover:bg-brand-orange dark:hover:text-white rounded-full px-3 lg:px-6 h-10 lg:h-11 text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0"
                    >
                      Logout
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 ml-3 lg:gap-3 lg:ml-4"
                >
                  <Link href="/login">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-brand-muted dark:text-brand-beige/70 hover:text-brand-dark dark:hover:text-brand-light hover:bg-brand-beige/10 dark:hover:bg-white/5 font-black uppercase tracking-widest text-[9px] lg:text-[10px] rounded-full px-3 lg:px-6 h-10 lg:h-11 transition-all whitespace-nowrap"
                    >
                      Login
                    </Button>
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/signup">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-brand-orange to-brand-gold hover:from-brand-gold hover:to-brand-burnt dark:hover:from-brand-burnt dark:hover:to-brand-burnt text-white rounded-full font-black uppercase tracking-widest text-[9px] lg:text-[10px] px-4 lg:px-8 h-10 lg:h-11 shadow-lg shadow-brand-orange/30 dark:shadow-brand-orange/20 border-none transition-all hover:shadow-brand-orange/50 dark:hover:shadow-brand-orange/40 whitespace-nowrap"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg text-brand-beige/70 hover:bg-white/10 hover:text-brand-orange transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-brand-beige/70 hover:bg-white/10 hover:text-brand-orange transition-all"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className={`md:hidden overflow-hidden border-t border-white/10 glass-morphism ${mobileMenuOpen ? 'block' : 'hidden'}`}
      >
        <div className="px-4 py-6 space-y-3">
          {/* Mobile Nav Links */}
          {navigation.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={mobileMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  className={`block rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-orange/30 to-brand-orange/10 text-brand-orange border border-brand-orange/50'
                      : 'text-brand-beige/70 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </motion.div>
            );
          })}

          {/* Mobile Auth Section */}
          <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={mobileMenuOpen ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="space-y-3"
              >
                <Link 
                  href="/profile"
                  className="flex items-center gap-3 px-5 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-brand-orange/30 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5 text-brand-orange" />
                  <span className="font-bold text-white">{user?.name}</span>
                </Link>
                <Button 
                  className="w-full rounded-lg border-brand-orange/50 text-brand-orange hover:bg-brand-orange hover:text-white" 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={mobileMenuOpen ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="space-y-3"
              >
                <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-lg" size="sm" variant="outline">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-lg bg-gradient-to-r from-brand-orange to-brand-burnt hover:from-brand-burnt hover:to-brand-burnt text-white" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </header>
  );
}
