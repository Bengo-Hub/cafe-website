'use client';

import { FeatureRow, LinkButton, PageIntro, Section } from '@/components/site';
import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { orderingUrl } from '@/lib/ordering-url';

export default function ServicesPage() {
  const { tenant } = useTenantBrand();
  const storeHref = orderingUrl('/catalog', tenant?.slug || undefined);

  return (
    <>
      <PageIntro
        title="What we do"
        lede="Most people come for the food. Plenty stay to work, sleep over, celebrate or learn the trade. Here is everything under one roof."
      />

      <Section>
        <div className="space-y-16 md:space-y-20">
          <FeatureRow
            title="The cafe"
            image="/images/services/urban-experience.jpg"
            imageAlt="Guests sharing a meal at Urban Loft Cafe"
            actions={
              <>
                <LinkButton href={storeHref}>See the menu and order</LinkButton>
                <LinkButton href="/reserve" tone="secondary">Book a table</LinkButton>
              </>
            }
          >
            <p>
              Breakfast from 7:30, coffee all day, then burgers, grills, pizza and Kenyan favourites until 10 at night.
              Eat in the garden, take it away, or have it delivered.
            </p>
          </FeatureRow>

          <FeatureRow
            flip
            title="Work hub"
            image="/images/services/biz-hub-1.jpg"
            imageAlt="Desks in the Urban Loft work hub"
            actions={<LinkButton href="/services/hub" tone="secondary">Day passes and rooms</LinkButton>}
          >
            <p>Shared desks by the half day or full day, plus meeting rooms for when you need a door that closes.</p>
          </FeatureRow>

          <FeatureRow
            title="Rooms"
            image="/images/services/accommodation-1.jpg"
            imageAlt="A guest room with a double bed"
            actions={<LinkButton href="/services/accommodation" tone="secondary">Ask about a room</LinkButton>}
          >
            <p>Quiet rooms with a desk and Wi-Fi for people in town on business, with the kitchen downstairs.</p>
          </FeatureRow>

          <FeatureRow
            flip
            title="Events and catering"
            image="/images/hero/hero-events.jpg"
            imageAlt="A group at a long table in the Urban Loft garden"
            actions={
              <>
                <LinkButton href="/services/events" tone="secondary">Plan an event</LinkButton>
                <LinkButton href="/events" tone="secondary">What's on</LinkButton>
              </>
            }
          >
            <p>
              Private parties, team days and meetings here, or our food at your venue. We also run regular nights like
              pizza Fridays and couples' dinners.
            </p>
          </FeatureRow>

          <FeatureRow
            title="Service training"
            image="/images/hero/hero-team.jpg"
            imageAlt="Urban Loft staff in the kitchen"
            actions={<LinkButton href="/contact" tone="secondary">Ask about training</LinkButton>}
          >
            <p>
              Short courses for cafe and restaurant teams: customer service, food and beverage service, and day-to-day
              cafe operations, taught by the people who run this one.
            </p>
          </FeatureRow>
        </div>
      </Section>

      <Section tone="leaf" title="Something else in mind?" lede="A long office let, a big order for a funeral or a wedding, a menu for your staff canteen. Ask and we will tell you what we can do.">
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/contact">Get in touch</LinkButton>
        </div>
      </Section>
    </>
  );
}
