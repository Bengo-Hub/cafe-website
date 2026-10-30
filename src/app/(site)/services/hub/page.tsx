'use client';

import { FactList, LinkButton, PageIntro, Section } from '@/components/site';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { useMenuBoard } from '@/hooks/use-menu-board';
import { orderingItemUrl } from '@/lib/ordering-url';
import { HOURS_LABEL } from '@/lib/site';
import Image from 'next/image';

/** Day passes are sold in the online store; this reads them from there so prices never drift. */
function DayPasses({ slug }: { slug?: string }) {
  const { data, isLoading } = useMenuBoard(['Day Passes'], 6);
  const passes = data?.[0]?.items ?? [];
  if (isLoading) return <div className="h-24 rounded-lg bg-leaf" aria-busy="true" />;
  if (passes.length === 0) return null;
  return (
    <ul className="divide-y divide-line border-y border-line">
      {passes.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <span>
            <span className="block text-[17px] font-semibold text-ink">{p.name}</span>
            <span className="text-[15px] tabular-nums text-ink-soft">KSh {p.price.toLocaleString('en-KE')}</span>
          </span>
          <LinkButton href={orderingItemUrl(p.id, slug)} tone="secondary">
            Buy a pass
          </LinkButton>
        </li>
      ))}
    </ul>
  );
}

export default function WorkHubPage() {
  const { tenant } = useTenantBrand();

  return (
    <>
      <PageIntro
        title="Work hub"
        lede="A desk, a socket, Wi-Fi and coffee that comes to you. Drop in for half a day, or book a room for a meeting."
        image="/images/hero/hero-work-hub-1.jpg"
        imageAlt="Armchairs and tables in the Urban Loft lounge"
      >
        <LinkButton href="#passes">Day passes</LinkButton>
        <LinkButton href="#book" tone="secondary">Book a meeting room</LinkButton>
      </PageIntro>

      <Section title="What you get">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <FactList
            items={[
              { label: 'Open', value: HOURS_LABEL },
              { label: 'Desks', value: 'Shared desks with power at every seat' },
              { label: 'Internet', value: 'Fast Wi-Fi, fine for video calls' },
              { label: 'Rooms', value: 'Boardroom and private offices, booked in advance' },
              { label: 'Food', value: 'Order from the full menu without leaving your desk' },
            ]}
          />
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-leaf">
            <Image src="/images/gallery/gallery-4.jpg" alt="Desks with chairs in the work hub" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </Section>

      <Section id="passes" tone="leaf" title="Day passes" lede="Pay online and show the receipt at the counter, or pay when you arrive.">
        <DayPasses slug={tenant?.slug || undefined} />
      </Section>

      <Section id="book" title="Book a meeting room or office">
        <div className="max-w-2xl">
          <EnquiryForm
            subject="Work hub booking"
            dateLabel="Date"
            guestsLabel="People"
            messageLabel="What you need"
            messagePlaceholder="Boardroom for 8 from 9 to 1, with a projector and tea at 11"
            submitLabel="Send booking request"
            sentText="Thanks. We will confirm the room and the price by phone or email."
          />
        </div>
      </Section>
    </>
  );
}
