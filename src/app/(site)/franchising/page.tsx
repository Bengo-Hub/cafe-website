'use client';

import { FactList, LinkButton, PageIntro, Section } from '@/components/site';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import { ChevronDown } from 'lucide-react';

const REQUIREMENTS = [
  'Experience running a business, ideally in food or hospitality',
  'At least KES 5,000,000 in available capital',
  'A site of 200 square metres or more in a busy location',
  'Willingness to follow Urban Loft standards for food, service and fit-out',
];

const FAQ = [
  ['How long does it take to open?', 'Usually four to eight months from first meeting to opening day, mostly depending on the site and the building work.'],
  ['Do I need restaurant experience?', 'It helps, but it is not required. We train you and your managers before you open.'],
  ['What is the franchise fee?', 'KES 2,000,000. It covers use of the brand, the initial training and help choosing the site.'],
];

export default function FranchisingPage() {
  return (
    <>
      <PageIntro
        title="Open an Urban Loft in your town"
        lede="We are looking for partners to open Urban Loft cafes beyond Busia. You bring the site and the capital; we bring the menu, the systems and the training."
        image="/images/hero/hero-work-hub-1.jpg"
        imageAlt="The Urban Loft lounge"
      >
        <LinkButton href="#enquire">Start a conversation</LinkButton>
      </PageIntro>

      <Section title="What you get">
        <div className="max-w-3xl">
          <FactList
            items={[
              { label: 'The model', value: 'A cafe, with the option of a work hub and event space, already running in Busia' },
              { label: 'Training', value: 'For you and your managers before opening, and for your staff on site' },
              { label: 'Operations', value: 'Recipes, suppliers and day-to-day guidance on running the place' },
              { label: 'Marketing', value: 'Launch support and the Urban Loft name' },
            ]}
          />
        </div>
      </Section>

      <Section tone="leaf" title="What it takes">
        <div className="grid gap-12 md:grid-cols-2">
          <ul className="space-y-3 text-[17px] text-ink">
            {REQUIREMENTS.map((r) => (
              <li key={r} className="border-l-2 border-loft pl-4">{r}</li>
            ))}
          </ul>
          <div>
            <h3 className="font-display text-3xl leading-none">Typical total investment</h3>
            <p className="mt-2 text-[15px] text-ink-soft">Depends on the size and condition of the site.</p>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-roast p-5 text-white">
                <dt className="text-sm text-white/70">Cafe</dt>
                <dd className="font-display mt-1 text-3xl">KES 10M to 15M</dd>
              </div>
              <div className="rounded-lg bg-roast p-5 text-white">
                <dt className="text-sm text-white/70">Cafe and work hub</dt>
                <dd className="font-display mt-1 text-3xl">KES 18M to 25M</dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section title="Common questions">
        <div className="max-w-3xl divide-y divide-line border-y border-line">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown className="h-5 w-5 shrink-0 text-ink-soft transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="pb-5 pr-8 text-[16px] leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section id="enquire" tone="leaf" title="Start a conversation" lede="Tell us where you would open and a little about yourself.">
        <div className="max-w-2xl">
          <EnquiryForm
            subject="Franchise enquiry"
            messageLabel="Proposed location, available capital and your experience"
            messagePlaceholder="Kakamega town centre. About KES 12M. I run two shops on Kenyatta Avenue."
            submitLabel="Send enquiry"
            sentText="Thanks. Our franchise team will be in touch."
          />
        </div>
      </Section>
    </>
  );
}
