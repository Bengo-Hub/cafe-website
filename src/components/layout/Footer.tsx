'use client';

import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { VisitDetails } from '@/components/site';
import { orderingUrl } from '@/lib/ordering-url';
import { SITE } from '@/lib/site';
import { PoweredByBadge } from '@bengo-hub/shared-ui-lib';
import { Facebook, Instagram } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTiktok } from 'react-icons/fa';
import { NAV } from './nav';

const SOCIALS = [
  { name: 'Facebook', href: SITE.socials.facebook, icon: Facebook },
  { name: 'Instagram', href: SITE.socials.instagram, icon: Instagram },
  { name: 'TikTok', href: SITE.socials.tiktok, icon: FaTiktok },
];

export function Footer() {
  const pathname = usePathname() ?? '/';
  const { tenant, getServiceTitle } = useTenantBrand();
  const siteName = SITE.name;
  const year = new Date().getFullYear();

  if (pathname.startsWith('/dashboard')) {
    return (
      <footer className="mt-auto border-t border-line bg-paper py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-ink-soft sm:px-6 md:flex-row lg:px-8">
          <p>
            {getServiceTitle('Cafe')} &copy; {year}
          </p>
          <PoweredByBadge />
        </div>
      </footer>
    );
  }

  const storeHref = orderingUrl('/catalog', tenant?.slug || undefined);
  const groups = NAV.filter((n): n is Extract<typeof n, { items: unknown }> => 'items' in n);
  const singles = NAV.filter((n): n is Extract<typeof n, { href: string }> => 'href' in n);

  return (
    <footer className="bg-roast text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <span className="inline-block rounded-md bg-white px-3 py-2">
            <Image src="/images/logo/urban-loft-lockup.png" alt={siteName} width={618} height={364} className="h-14 w-auto" />
          </span>
          <p className="mt-3 max-w-xs text-[15px] text-white/70">Cafe, restaurant, work hub and rooms in {SITE.town}.</p>
          <div className="mt-6">
            <VisitDetails tone="light" />
          </div>
        </div>

        <nav aria-label="Visit">
          <p className="text-sm text-white/60">Visit</p>
          <ul className="mt-3 space-y-2 text-[15px]">
            {singles.map((l) => (
              <li key={l.href}>
                <a href={l.href === '/menu' ? storeHref : l.href} className="hover:underline hover:underline-offset-4">
                  {l.name}
                </a>
              </li>
            ))}
            <li>
              <Link href="/reserve" className="hover:underline hover:underline-offset-4">
                Book a table
              </Link>
            </li>
          </ul>
        </nav>

        {groups.map((g) => (
          <nav key={g.name} aria-label={g.name}>
            <p className="text-sm text-white/60">{g.name}</p>
            <ul className="mt-3 space-y-2 text-[15px]">
              {g.items.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:underline hover:underline-offset-4">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-sm text-white/60 sm:px-6 md:flex-row lg:px-8">
          <p>
            &copy; {year} {SITE.name}, {SITE.town}, Kenya
          </p>
          <ul className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="flex h-10 w-10 items-center justify-center rounded-md text-white/75 hover:bg-white/10 hover:text-white"
                >
                  <s.icon className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
          <PoweredByBadge />
        </div>
      </div>
    </footer>
  );
}
