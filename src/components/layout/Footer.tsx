'use client';

import { ExternalLink, Facebook, Heart, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard') ?? false;

  if (isDashboard) {
    return (
      <footer className="w-full mt-auto">
        <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center md:text-left">
                All Rights Reserved. <span className="text-slate-900 dark:text-white font-bold">Urban Loft Café</span> &copy; {new Date().getFullYear()}.
              </div>
              
              <div className="flex items-center gap-2">
                <a
                  href="https://codevertexitsolutions.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-all hover:ring-4 hover:ring-primary/20"
                >
                  <img 
                    src="/images/logo/codevertex.png" 
                    alt="Codevertex" 
                    className="h-3.5 w-auto brightness-0 invert dark:brightness-100 dark:invert-0" 
                  />
                  <span className="text-[10px] font-black tracking-tight uppercase">
                    Powered by <span className="text-brand-orange">Codevertex IT Solutions</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const footerLinks = {
    // ... existing links ...
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/about#story' },
      { name: 'Team', href: '/about#team' },
      { name: 'Careers', href: '/careers' },
    ],
    services: [
      { name: 'The Café', href: '/services#cafe' },
      { name: 'Business Hub', href: '/services/hub' },
      { name: 'Events & Catering', href: '/services/events' },
      { name: 'Training Center', href: '/services#training' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faq' },
      { name: 'Loyalty Program', href: '/loyalty' },
      { name: 'Franchising', href: '/franchising' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'Twitter', href: '#', icon: Twitter },
  ];

  return (
    <footer className="relative bg-brand-light dark:bg-brand-dark text-brand-dark dark:text-brand-beige overflow-hidden border-t border-brand-beige/30 dark:border-white/5 transition-colors duration-700">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-orange/10 dark:bg-brand-orange/15 rounded-full blur-[120px] -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-brown/10 dark:bg-brand-brown/15 rounded-full blur-[150px] translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-mesh-animated opacity-10 pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-5 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 group mb-8">
              <div className="relative h-16 w-16 electrical-border rounded-2xl overflow-hidden transition-all duration-500 hover:scale-110">
                <Image
                  src="/images/logo/logo.jpeg"
                  alt="Urban Loft Cafe logo"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div>
              <h2 className="text-3xl font-black text-brand-dark dark:text-white tracking-tighter group-hover:text-brand-orange transition-all duration-300">
                Urban Loft <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Café</span>
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted dark:text-brand-orange/70 mt-1">Eat. Work. Connect. Experience.</p>
              </div>
            </div>
            <p className="mt-6 text-base font-light text-brand-muted dark:text-brand-beige/70 max-w-md leading-relaxed">
              More than just a café—a vibrant community space where creativity meets comfort, and every moment counts.
            </p>
            
            {/* Contact Info with Enhanced Styling */}
            <div className="mt-10 space-y-4">
              <a href="https://maps.google.com/?q=Busia,+Kenya" className="flex items-center gap-4 p-3 rounded-lg bg-brand-beige/10 dark:bg-white/5 border border-brand-muted/30 dark:border-white/10 text-brand-muted dark:text-brand-beige/60 hover:text-brand-orange dark:hover:text-brand-orange hover:border-brand-orange/30 dark:hover:border-brand-orange/30 hover:bg-brand-orange/5 dark:hover:bg-brand-orange/5 transition-all duration-300 group/item">
                <div className="p-2 rounded-lg bg-brand-orange/10 dark:bg-brand-orange/20 group-hover/item:bg-brand-orange/30 transition-colors">
                  <MapPin className="h-5 w-5 text-brand-orange" />
                </div>
                <span className="text-sm font-bold tracking-wide">Busia, Kenya</span>
              </a>
              <a href="tel:+254" className="flex items-center gap-4 p-3 rounded-lg bg-brand-beige/10 dark:bg-white/5 border border-brand-muted/30 dark:border-white/10 text-brand-muted dark:text-brand-beige/60 hover:text-brand-orange dark:hover:text-brand-orange hover:border-brand-orange/30 dark:hover:border-brand-orange/30 hover:bg-brand-orange/5 dark:hover:bg-brand-orange/5 transition-all duration-300 group/item">
                <div className="p-2 rounded-lg bg-brand-orange/10 dark:bg-brand-orange/20 group-hover/item:bg-brand-orange/30 transition-colors">
                  <Phone className="h-5 w-5 text-brand-orange" />
                </div>
                <span className="text-sm font-bold tracking-wide">0116010638</span>
              </a>
              <a href="mailto:urbanloftc@gmail.com" className="flex items-center gap-4 p-3 rounded-lg bg-brand-beige/10 dark:bg-white/5 border border-brand-muted/30 dark:border-white/10 text-brand-muted dark:text-brand-beige/60 hover:text-brand-orange dark:hover:text-brand-orange hover:border-brand-orange/30 dark:hover:border-brand-orange/30 hover:bg-brand-orange/5 dark:hover:bg-brand-orange/5 transition-all duration-300 group/item">
                <div className="p-2 rounded-lg bg-brand-orange/10 dark:bg-brand-orange/20 group-hover/item:bg-brand-orange/30 transition-colors">
                  <Mail className="h-5 w-5 text-brand-orange" />
                </div>
                <span className="text-sm font-bold tracking-wide">urbanloftc@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="group">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-brand-orange dark:text-brand-orange mb-8 group-hover:text-brand-gold transition-colors">
              Company
            </h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm font-bold text-brand-muted dark:text-brand-beige/50 hover:text-brand-orange dark:hover:text-brand-orange transition-all duration-300 flex items-center gap-2 group/link hover:translate-x-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/0 group-hover/link:bg-brand-orange transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className="group">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-brand-orange dark:text-brand-orange mb-8 group-hover:text-brand-gold transition-colors">
              Services
            </h3>
            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm font-bold text-brand-muted dark:text-brand-beige/50 hover:text-brand-orange dark:hover:text-brand-orange transition-all duration-300 flex items-center gap-2 group/link hover:translate-x-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/0 group-hover/link:bg-brand-orange transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="group">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-brand-orange dark:text-brand-orange mb-8 group-hover:text-brand-gold transition-colors">
              Support
            </h3>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm font-bold text-brand-muted dark:text-brand-beige/50 hover:text-brand-orange dark:hover:text-brand-orange transition-all duration-300 flex items-center gap-2 group/link hover:translate-x-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/0 group-hover/link:bg-brand-orange transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-brand-muted/30 dark:via-white/10 to-transparent my-12" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted/60 dark:text-brand-beige/40">
              All Rights Reserved. Urban Loft Café &copy; {new Date().getFullYear()}.
            </p>
            <p className="text-xs text-brand-muted/40 dark:text-brand-beige/30 mt-2 flex items-center justify-center md:justify-start gap-1.5">
              Made with <Heart className="h-3 w-3 text-brand-orange" /> in Busia, Kenya
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="p-3 rounded-lg bg-brand-beige/10 dark:bg-white/5 border border-brand-muted/30 dark:border-white/10 text-brand-muted dark:text-brand-beige/40 hover:text-brand-orange dark:hover:text-brand-orange hover:bg-brand-orange/15 dark:hover:bg-brand-orange/15 hover:border-brand-orange/30 transition-all duration-300 hover:scale-110 group"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5 transition-transform group-hover:scale-125" />
              </a>
            ))}
          </div>

          {/* Codevertex Branding */}
          <a
            href="https://codevertexitsolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-orange/20 to-brand-gold/20 border border-brand-orange/30 text-brand-muted dark:text-brand-beige/70 hover:text-brand-orange dark:hover:text-brand-orange hover:border-brand-orange/60 transition-all duration-300 group/codevertex hover:bg-brand-orange/30"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Powered by</span>
            <span className="text-xs font-black uppercase tracking-wider text-brand-orange group-hover/codevertex:text-brand-gold transition-colors">Codevertex IT Solutions</span>
            <ExternalLink className="h-3.5 w-3.5 text-brand-orange/60 group-hover/codevertex:text-brand-orange transition-colors" />
          </a>
        </div>
      </div>

      {/* Footer Glow Effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-gradient-to-t from-brand-orange/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </footer>
  );
}
