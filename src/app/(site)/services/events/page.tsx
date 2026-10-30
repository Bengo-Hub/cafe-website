'use client';

import { FactList, LinkButton, PageIntro, Section } from '@/components/site';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import Image from 'next/image';

export default function EventsAndCateringPage() {
  return (
    <>
      <PageIntro
        title="Events and catering"
        lede="Birthdays, team days, meetings and family gatherings in our garden, or our food brought to your venue."
        image="/images/hero/hero-events.jpg"
        imageAlt="A group sharing a long table at Urban Loft Cafe"
      >
        <LinkButton href="#enquire">Ask for a quote</LinkButton>
        <LinkButton href="/events" tone="secondary">See what's on</LinkButton>
      </PageIntro>

      <Section title="How it works">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <ol className="space-y-6">
            {[
              ['Tell us about it', 'The date, how many guests, and whether it is here or at your place.'],
              ['Get a quote', 'We suggest a menu and a price, and change it until it fits.'],
              ['Confirm the date', 'Say yes to the quote and the date is yours.'],
              ['Enjoy the day', 'We set up, serve and clear away.'],
            ].map(([title, body], i) => (
              <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-3">
                <span className="font-display flex h-10 w-10 items-center justify-center rounded-full bg-roast text-lg text-white">{i + 1}</span>
                <span>
                  <span className="block text-[17px] font-semibold text-ink">{title}</span>
                  <span className="text-[15px] text-ink-soft">{body}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="space-y-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-leaf">
              <Image src="/images/events/catering-1.jpg" alt="A catering spread of meats, bread and fruit" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <FactList
              items={[
                { label: 'Here', value: 'Garden and indoor dining areas, booked privately or in part' },
                { label: 'Outside catering', value: 'Buffets and platters delivered and served at your venue' },
                { label: 'Extras', value: 'Cakes from our bakery and a screen with projector on request' },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section id="enquire" tone="leaf" title="Ask for a quote">
        <div className="max-w-2xl">
          <EnquiryForm
            subject="Event enquiry"
            dateLabel="Event date"
            guestsLabel="Guests"
            messageLabel="About the event"
            messagePlaceholder="Office end-of-year lunch, here in the garden, about 40 people"
            submitLabel="Ask for a quote"
            sentText="Thanks. We will call or email you with a menu and a quote."
          />
        </div>
      </Section>
    </>
  );
}
