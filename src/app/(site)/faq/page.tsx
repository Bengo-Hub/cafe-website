'use client';

import { LinkButton, PageIntro, Section } from '@/components/site';
import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { orderingUrl } from '@/lib/ordering-url';
import { HOURS_LABEL, SITE } from '@/lib/site';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function FAQPage() {
  const { tenant } = useTenantBrand();
  const storeHref = orderingUrl('/catalog', tenant?.slug || undefined);

  const items: { q: string; a: ReactNode }[] = [
    { q: 'When are you open?', a: `${HOURS_LABEL}, including weekends and public holidays.` },
    {
      q: 'Can I book a table?',
      a: (
        <>
          Yes. <Link href="/reserve" className="font-semibold text-ink underline underline-offset-4">Book a table online</Link> and
          we confirm it by phone or text. For groups bigger than 12, call us.
        </>
      ),
    },
    {
      q: 'Do you deliver?',
      a: (
        <>
          Yes, around {SITE.town}. <a href={storeHref} className="font-semibold text-ink underline underline-offset-4">Order in the online store</a>.
          It shows the delivery fee for your address before you pay.
        </>
      ),
    },
    { q: 'How can I pay?', a: 'M-Pesa or cash at the counter. Online orders are paid by M-Pesa when you check out.' },
    {
      q: 'Can I work from the cafe?',
      a: (
        <>
          Yes. The <Link href="/services/hub" className="font-semibold text-ink underline underline-offset-4">work hub</Link> has
          desks with power and Wi-Fi by the half or full day, and meeting rooms you can book.
        </>
      ),
    },
    {
      q: 'Do you have vegetarian food?',
      a: 'Yes, including the Veggie Burger and several breakfasts. Tell us about allergies when you order and the kitchen will tell you what is safe.',
    },
    {
      q: 'How does the loyalty programme work?',
      a: (
        <>
          You collect points every time you buy and spend them on later orders.{' '}
          <Link href="/loyalty" className="font-semibold text-ink underline underline-offset-4">Check your points</Link> with your phone number.
        </>
      ),
    },
  ];

  return (
    <>
      <PageIntro title="Questions and answers" lede="The things people ask us most. Anything else, call or message us." />
      <Section>
        <div className="max-w-3xl divide-y divide-line border-y border-line">
          {items.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-ink-soft transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="pb-5 pr-8 text-[16px] leading-relaxed text-ink-soft">{item.a}</div>
            </details>
          ))}
        </div>
        <div className="mt-10">
          <LinkButton href="/contact" tone="secondary">Ask us something else</LinkButton>
        </div>
      </Section>
    </>
  );
}
