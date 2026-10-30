'use client';

import { LinkButton, PageIntro, Section } from '@/components/site';
import { useERPStaff } from '@/hooks/use-erp-staff';
import { SITE } from '@/lib/site';
import Image from 'next/image';
import Script from 'next/script';

const VALUES = [
  ['Excellence', 'From the coffee to the way we clear a table.'],
  ['Gratitude', 'We thank our guests, our team and our neighbours, and mean it.'],
  ['Respect', 'Everyone who walks in is treated the same.'],
  ['Growth', 'Our staff learn on the job and move up.'],
  ['Partnership', 'We buy locally where we can and keep our suppliers for years.'],
  ['Purpose', 'Good food is a reason for people to get together.'],
];

export default function AboutPage() {
  const { data: staff = [] } = useERPStaff();
  const team = staff
    .filter((e) => e.status === 'active')
    .map((e) => ({ id: e.id, name: e.full_name, role: e.job_title?.name ?? e.department?.name ?? '' }));

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com'}/images/logo/logo.jpeg`,
    foundingDate: '2023',
    description: `Cafe, restaurant, work hub and rooms in ${SITE.town}, Kenya.`,
  };

  return (
    <>
      <Script id="organization-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <PageIntro
        title="Our story"
        lede={`Urban Loft opened in ${SITE.town} in 2023 with one idea: a cafe should be somewhere you can eat well, get work done and meet people, all in the same afternoon.`}
        image="/images/hero/hero-team.jpg"
        imageAlt="The Urban Loft kitchen team"
      />

      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl leading-none md:text-4xl">What we are for</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
              A place where guests are welcomed warmly, conversation comes easily and good food brings people together.
              The simplest moments, shared over a meal and a laugh, are often the ones people remember.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl leading-none md:text-4xl">Where we are going</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
              We want Urban Loft to be known for its character as much as its food: a place with warmth, high standards
              and attention to the small things, that guests want to come back to.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="leaf" title="How we work">
        <dl className="grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map(([title, body]) => (
            <div key={title} className="border-t-2 border-roast pt-3 dark:border-ink">
              <dt className="font-display text-2xl leading-none">{title}</dt>
              <dd className="mt-2 text-[15px] text-ink-soft">{body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {team.length > 0 && (
        <Section title="The team">
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <li key={m.id} className="border-b border-line pb-4">
                <span className="block text-[17px] font-semibold text-ink">{m.name}</span>
                {m.role && <span className="text-[15px] text-ink-soft">{m.role}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <section className="bg-roast text-white">
        <div className="mx-auto grid max-w-7xl md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[380px]">
            <Image src="/images/services/urban-experience.jpg" alt="Guests at a table in the cafe" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
            <h2 className="font-display text-4xl leading-none md:text-5xl">Come and see for yourself</h2>
            <p className="mt-4 max-w-md text-[17px] text-white/80">Pull up a chair in the garden, or join the team behind it.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/reserve">Book a table</LinkButton>
              <LinkButton href="/careers" tone="onDark">Work with us</LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
