'use client';

import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { HOURS_LABEL, SITE, displayPhone, openState, telHref, whatsappHref } from '@/lib/site';
import { cn } from '@/lib/utils';
import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

/* Building blocks for the public pages. Pages compose these; none of them restyles its own. */

type ButtonTone = 'primary' | 'secondary' | 'onDark';

const tones: Record<ButtonTone, string> = {
  primary: 'bg-loft text-white hover:bg-loft-deep',
  secondary: 'border border-ink/25 text-ink hover:border-ink',
  onDark: 'border border-white/40 text-white hover:border-white',
};

/** A link styled as a button. External or store links use a plain anchor. */
export function LinkButton({
  href,
  children,
  tone = 'primary',
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: ButtonTone;
  className?: string;
}) {
  const cls = cn(
    'inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-[15px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-loft',
    tones[tone],
    className,
  );
  return href.startsWith('http') || href.startsWith('tel:') ? (
    <a href={href} className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/** Today's open or closed line, worked out in the browser so it is never a cached build-time value. */
export function OpenStatus({ className, tone = 'ink' }: { className?: string; tone?: 'ink' | 'light' }) {
  const [state, setState] = useState<ReturnType<typeof openState> | null>(null);
  useEffect(() => {
    setState(openState());
    const t = setInterval(() => setState(openState()), 60_000);
    return () => clearInterval(t);
  }, []);
  return (
    <p className={cn('flex items-center gap-2 text-[15px]', tone === 'light' ? 'text-white/90' : 'text-ink-soft', className)}>
      <span
        className={cn('h-2.5 w-2.5 rounded-full', state == null ? 'bg-line' : state.open ? 'bg-emerald-500' : 'bg-red-500')}
        aria-hidden
      />
      {state ? state.line : HOURS_LABEL}
    </p>
  );
}

/** The cafe's phone from its account (or the site fallback), written the way people read it. */
export function useCafePhone(): string {
  const { tenant } = useTenantBrand();
  return displayPhone(tenant?.contactPhone || SITE.phone);
}

/** Page opening: a title and a short line, with an optional photo beside it and actions below. */
export function PageIntro({
  title,
  lede,
  image,
  imageAlt = '',
  children,
}: {
  title: string;
  lede?: ReactNode;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line">
      <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', image ? 'grid gap-8 py-10 md:grid-cols-2 md:items-center md:py-14' : 'py-12 md:py-16')}>
        <div className="max-w-2xl">
          <h1 className="font-display text-5xl leading-[0.95] text-ink md:text-6xl">{title}</h1>
          {lede && <div className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">{lede}</div>}
          {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
        </div>
        {image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-leaf">
            <Image src={image} alt={imageAlt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
          </div>
        )}
      </div>
    </section>
  );
}

/** A page section with an optional heading and line. `tone="leaf"` gives the alternate background. */
export function Section({
  title,
  lede,
  tone = 'paper',
  id,
  children,
  className,
}: {
  title?: string;
  lede?: ReactNode;
  tone?: 'paper' | 'leaf' | 'roast' | 'rust';
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const bg = {
    paper: 'bg-paper text-ink',
    leaf: 'bg-leaf text-ink',
    roast: 'bg-roast text-white',
    rust: 'bg-loft text-white',
  }[tone];
  const dark = tone === 'roast' || tone === 'rust';
  return (
    <section id={id} className={cn(bg, 'py-14 md:py-20', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-4xl leading-none md:text-5xl">{title}</h2>
            {lede && <div className={cn('mt-4 text-lg leading-relaxed', dark ? 'text-white/80' : 'text-ink-soft')}>{lede}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/** Hours, phone, WhatsApp and directions: the same block wherever the page tells people how to visit. */
export function VisitDetails({ tone = 'ink' }: { tone?: 'ink' | 'light' }) {
  const phone = useCafePhone();
  const muted = tone === 'light' ? 'text-white/75' : 'text-ink-soft';
  const strong = tone === 'light' ? 'text-white' : 'text-ink';
  const row = 'flex items-start gap-3';
  return (
    <ul className="space-y-4 text-[15px]">
      <li className={row}>
        <Clock className={cn('mt-0.5 h-5 w-5 shrink-0', muted)} aria-hidden />
        <span>
          <span className={cn('block font-semibold', strong)}>{HOURS_LABEL}</span>
          <OpenStatus tone={tone} className="mt-1 text-sm" />
        </span>
      </li>
      <li className={row}>
        <MapPin className={cn('mt-0.5 h-5 w-5 shrink-0', muted)} aria-hidden />
        <span>
          <span className={cn('block font-semibold', strong)}>{SITE.name}, {SITE.town}</span>
          <a href={SITE.mapUrl} target="_blank" rel="noreferrer" className={cn('underline underline-offset-4', muted)}>
            Get directions
          </a>
        </span>
      </li>
      <li className={row}>
        <Phone className={cn('mt-0.5 h-5 w-5 shrink-0', muted)} aria-hidden />
        <span className="flex flex-wrap gap-x-4">
          <a href={telHref(phone)} className={cn('font-semibold underline-offset-4 hover:underline', strong)}>
            {phone}
          </a>
          <a href={whatsappHref(phone)} target="_blank" rel="noreferrer" className={cn('inline-flex items-center gap-1 underline underline-offset-4', muted)}>
            <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
          </a>
        </span>
      </li>
    </ul>
  );
}

/** A photo beside text, alternating sides down a page. Used for the places and services. */
export function FeatureRow({
  title,
  image,
  imageAlt,
  flip,
  children,
  actions,
}: {
  title: string;
  image: string;
  imageAlt: string;
  flip?: boolean;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <article className="grid gap-6 md:grid-cols-2 md:items-center md:gap-12">
      <div className={cn('relative aspect-[4/3] overflow-hidden rounded-lg bg-leaf', flip && 'md:order-2')}>
        <Image src={image} alt={imageAlt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </div>
      <div className="max-w-xl">
        <h3 className="font-display text-3xl leading-none md:text-4xl">{title}</h3>
        <div className="mt-4 space-y-3 text-[17px] leading-relaxed text-ink-soft">{children}</div>
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </article>
  );
}

/** Small "what it is" facts under a heading, as a definition list. */
export function FactList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <div key={f.label} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
          <dt className="text-sm text-ink-soft">{f.label}</dt>
          <dd className="text-[15px] text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Form field label and wrapper, so every form on the site looks the same. */
export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

/** Input styling shared by every form on the public site. */
export const inputClass =
  'block h-12 w-full rounded-md border border-line bg-paper px-3 text-[15px] text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-loft/40';
export const textareaClass =
  'block w-full rounded-md border border-line bg-paper px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-loft/40';

/** Result line under a form. */
export function FormNotice({ tone, children }: { tone: 'ok' | 'error'; children: ReactNode }) {
  return (
    <p
      role={tone === 'ok' ? 'status' : 'alert'}
      className={cn(
        'rounded-md px-4 py-3 text-[15px]',
        tone === 'ok' ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200' : 'bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-200',
      )}
    >
      {children}
    </p>
  );
}
