'use client';

import { LinkButton, OpenStatus, Section, FeatureRow, VisitDetails, useCafePhone } from '@/components/site';
import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { useMenuBoard } from '@/hooks/use-menu-board';
import { orderingItemUrl, orderingUrl } from '@/lib/ordering-url';
import { SITE, telHref } from '@/lib/site';
import { generateLocalBusinessSchema } from '@/lib/utils/schema';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';

const BOARD_SECTIONS = ['Breakfast', 'Coffee', 'Burgers', 'Main Dishes'];

function money(n: number, currency: string): string {
  return `${currency === 'KES' ? 'KSh' : currency} ${n.toLocaleString('en-KE')}`;
}

/** The menu board: real sections and prices from the online store, each item a link to it. */
function MenuBoard({ slug }: { slug?: string }) {
  const { data, isLoading, isError } = useMenuBoard(BOARD_SECTIONS, 5);
  const storeHref = orderingUrl('/catalog', slug);

  if (isLoading) {
    return (
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
        {BOARD_SECTIONS.map((s) => (
          <div key={s} className="space-y-3">
            <div className="h-7 w-32 rounded bg-white/15" />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-5 rounded bg-white/10" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data?.length) {
    return (
      <p className="text-lg text-white/85">
        The menu did not load here.{' '}
        <a href={storeHref} className="font-semibold text-white underline underline-offset-4">
          Open it in the online store
        </a>
        .
      </p>
    );
  }

  return (
    <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((section) => (
        <div key={section.name}>
          <h3 className="font-display border-b-2 border-loft pb-2 text-3xl leading-none">{section.name}</h3>
          <ul className="mt-4 space-y-1">
            {section.items.map((item) => (
              <li key={item.id}>
                <a
                  href={orderingItemUrl(item.id, slug)}
                  className="group flex items-baseline gap-2 rounded py-1.5 text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span className="text-white group-hover:underline group-hover:underline-offset-4">{item.name}</span>
                  <span className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-white/40" aria-hidden />
                  <span className="whitespace-nowrap tabular-nums text-white/90">{money(item.price, item.currency)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { tenant } = useTenantBrand();
  const slug = tenant?.slug || undefined;
  const phone = useCafePhone();
  const storeHref = orderingUrl('/catalog', slug);

  return (
    <>
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateLocalBusinessSchema()) }}
      />

      {/* Opening: the garden dining area, open state and the two things people come to do. */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14 lg:px-8">
          <div>
            <OpenStatus />
            <h1 className="font-display mt-5 text-[3.25rem] leading-[0.92] text-ink sm:text-6xl xl:text-7xl">
              Breakfast to late dinner under the canopy in Busia
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
              Coffee from 7:30 in the morning, full plates until 10 at night, and a table with a socket if you have
              work to do. Order for delivery, or come and sit in the garden.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href={storeHref}>
                <ShoppingBag className="h-5 w-5" aria-hidden /> Order online
              </LinkButton>
              <LinkButton href="/reserve" tone="secondary">
                Book a table
              </LinkButton>
            </div>
            <p className="mt-5 text-[15px] text-ink-soft">
              Rather call?{' '}
              <a href={telHref(phone)} className="font-semibold text-ink underline underline-offset-4">
                {phone}
              </a>
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-leaf">
            <Image
              src="/images/services/events.jpg"
              alt="The garden dining area at Urban Loft Cafe, with hanging plants under the canopy"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <Section
        tone="roast"
        title="From the menu"
        lede="A few things from each part of the menu, with today's prices. Tap one to order it."
      >
        <MenuBoard slug={slug} />
        <div className="mt-12">
          <LinkButton href={storeHref} tone="onDark">
            See the full menu
          </LinkButton>
        </div>
      </Section>

      <Section title="Stay a while" lede="The cafe is the heart of the place, but people also come here to work and to celebrate.">
        <div className="space-y-16">
          <FeatureRow
            title="Work hub"
            image="/images/services/biz-hub-1.jpg"
            imageAlt="Two people working at desks in the Urban Loft work hub"
            actions={<LinkButton href="/services/hub" tone="secondary">About the work hub</LinkButton>}
          >
            <p>
              Desks with power at every seat, fast Wi-Fi and meeting rooms you can book. Order lunch and coffee without
              leaving your desk.
            </p>
          </FeatureRow>
          <FeatureRow
            flip
            title="Events and catering"
            image="/images/hero/hero-events.jpg"
            imageAlt="A group sharing a long table at Urban Loft Cafe"
            actions={<LinkButton href="/services/events" tone="secondary">Plan an event</LinkButton>}
          >
            <p>
              Birthdays, team lunches, meetings and family get-togethers, here in the garden or catered at your place.
              Tell us the date and how many guests, and we will send you a quote.
            </p>
          </FeatureRow>
        </div>
      </Section>

      <Section tone="leaf">
        <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="/images/services/thecafe.jpg"
              alt="An Urban Loft Cafe delivery bag with the order phone number"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="max-w-xl">
            <h2 className="font-display text-4xl leading-none md:text-5xl">Delivered around {SITE.town}</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
              Order in the online store and pay with M-Pesa. You see the delivery fee for your address before you
              pay, and you can track the order until it reaches you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href={storeHref}>Order for delivery</LinkButton>
              <LinkButton href={telHref(phone)} tone="secondary">
                Call {phone}
              </LinkButton>
            </div>
          </div>
        </div>
      </Section>

      <section className="bg-loft text-white">
        <div className="mx-auto grid max-w-7xl md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px]">
            <Image
              src="/images/hero/hero-team.jpg"
              alt="The Urban Loft kitchen team"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-16">
            <h2 className="font-display text-4xl leading-none md:text-5xl">Cooked here, by this team</h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-white">
              The breakfasts, burgers, grills and pizzas all come out of our own kitchen. Order often? Collect points
              on every visit with our loyalty programme.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/about" tone="onDark">Our story</LinkButton>
              <LinkButton href="/loyalty" tone="onDark">Loyalty rewards</LinkButton>
            </div>
          </div>
        </div>
      </section>

      <Section title="Visit us">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <VisitDetails />
          <div className="relative min-h-[300px] overflow-hidden rounded-lg border border-line">
            <iframe
              title={`Map showing ${SITE.name}, ${SITE.town}`}
              src={SITE.mapEmbed}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Section>
    </>
  );
}
