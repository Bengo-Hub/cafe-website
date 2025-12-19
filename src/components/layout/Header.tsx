'use client';

import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { useThemeStore } from '@/lib/store/theme-store';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Facebook,
    Instagram,
    Mail,
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

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, login, logout } = useAuth();

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
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled 
          ? 'py-2 bg-white/80 dark:bg-brand-dark/80 backdrop-blur-xl shadow-xl border-b border-brand-orange/10' 
          : 'py-4 bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group" aria-label="Urban Loft Cafe Home">
              <div className="relative h-10 w-10 md:h-14 md:w-14 rounded-2xl overflow-hidden transition-all duration-500 group-hover:rotate-3 shadow-lg shadow-brand-orange/20">
                <Image
                  src="/images/logo/logo.jpg"
                  alt="Urban Loft Cafe logo"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg md:text-xl font-black text-brand-dark dark:text-brand-light tracking-tight group-hover:text-brand-orange transition-all duration-300">
                  Urban Loft <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Café</span>
                </span>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-brand-brown dark:text-brand-orange/70 group-hover:text-brand-orange transition-colors">
                  Eat. Work. Connect. Experience
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all duration-300 group ${
                      isActive
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

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search & Cart Placeholders */}
            <div className="hidden md:flex items-center gap-2">
              <button className="p-2 rounded-xl text-brand-muted dark:text-brand-beige/70 hover:bg-brand-orange/10 hover:text-brand-orange transition-all">
                <Search className="h-5 w-5" />
              </button>
              <Link href="/menu" className="p-2 rounded-xl text-brand-muted dark:text-brand-beige/70 hover:bg-brand-orange/10 hover:text-brand-orange transition-all relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-4 w-4 bg-brand-orange text-white text-[10px] font-black flex items-center justify-center rounded-full">0</span>
              </Link>
            </div>

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
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="flex items-center gap-2 p-1 pr-3 rounded-full bg-brand-orange/5 border border-brand-orange/10 hover:border-brand-orange/30 transition-all group">
                    <div className="h-8 w-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-black text-xs">
                      {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-dark dark:text-white group-hover:text-brand-orange transition-colors">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </Link>
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
                  <Link href="/signup">
                    <Button 
                      size="sm" 
                      className="bg-brand-orange hover:bg-brand-burnt text-white rounded-xl font-black uppercase tracking-widest text-[10px] px-6 shadow-lg shadow-brand-orange/20"
                    >
                      Join
                    </Button>
                  </Link>
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

      {/* Full-screen Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-brand-dark lg:hidden flex flex-col"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-beige/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden">
                  <Image src="/images/logo/logo.jpg" alt="Logo" width={40} height={40} />
                </div>
                <span className="font-black text-brand-dark dark:text-white tracking-tighter">Urban Loft</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Menu Links */}
            <div className="flex-grow overflow-y-auto py-10 px-6">
              <div className="space-y-2">
                {navigation.map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block py-4 text-3xl font-black tracking-tighter transition-all ${
                          isActive ? 'text-brand-orange' : 'text-brand-dark dark:text-white/70'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Menu Footer */}
            <div className="p-8 bg-brand-orange/5 border-t border-brand-orange/10">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    {socialLinks.map((social, idx) => (
                      <a key={idx} href={social.href} className="h-10 w-10 rounded-xl bg-white dark:bg-brand-dark border border-brand-orange/10 flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-all">
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="h-10 w-10 rounded-xl bg-white dark:bg-brand-dark border border-brand-orange/10 flex items-center justify-center text-brand-orange"
                  >
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </button>
                </div>
                
                <div className="space-y-3">
                  <a href="tel:+254700000000" className="flex items-center gap-3 text-sm font-bold text-brand-dark dark:text-white/70">
                    <Phone className="h-4 w-4 text-brand-orange" /> +254 700 000 000
                  </a>
                  <a href="mailto:hello@urbanloftcafe.com" className="flex items-center gap-3 text-sm font-bold text-brand-dark dark:text-white/70">
                    <Mail className="h-4 w-4 text-brand-orange" /> hello@urbanloftcafe.com
                  </a>
                </div>

                {!isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="rounded-xl font-black uppercase tracking-widest text-xs h-12"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        login();
                      }}
                    >
                      Login
                    </Button>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full rounded-xl font-black uppercase tracking-widest text-xs h-12 bg-brand-orange text-white">
                        Join Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl font-black uppercase tracking-widest text-xs h-12 border-brand-orange text-brand-orange"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
