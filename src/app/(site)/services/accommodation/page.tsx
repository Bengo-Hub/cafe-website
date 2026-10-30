'use client';

import { FactList, PageIntro, Section } from '@/components/site';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import Image from 'next/image';

const PHOTOS = [
  { src: '/images/rooms/rooms-2.jpg', alt: 'A room with a double bed and a work desk' },
  { src: '/images/rooms/rooms-5.jpg', alt: 'A room with a balcony door' },
  { src: '/images/rooms/rooms-4.jpg', alt: 'A sitting area' },
];

export default function AccommodationPage() {
  return (
    <>
      <PageIntro
        title="Rooms"
        lede="Quiet rooms for people in town on business or passing through the border, with breakfast and dinner from our own kitchen."
        image="/images/services/accommodation-1.jpg"
        imageAlt="A guest room with a double bed"
      />

      <Section title="In every room">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <FactList
            items={[
              { label: 'Bed', value: 'Double bed with fresh linen' },
              { label: 'Work', value: 'Desk, chair and Wi-Fi' },
              { label: 'Food', value: 'Breakfast and room service from the cafe kitchen' },
            ]}
          />
          <div className="grid grid-cols-3 gap-2">
            {PHOTOS.map((p) => (
              <div key={p.src} className="relative aspect-square overflow-hidden rounded-md bg-leaf">
                <Image src={p.src} alt={p.alt} fill sizes="(max-width: 768px) 33vw, 16vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="leaf" title="Ask about a room" lede="Tell us your dates. We reply with what is free and the rate.">
        <div className="max-w-2xl">
          <EnquiryForm
            subject="Room enquiry"
            dateLabel="Arrival date"
            guestsLabel="Nights"
            messageLabel="Anything else"
            messagePlaceholder="Two people, arriving late, need a receipt for the company"
            submitLabel="Ask about a room"
            sentText="Thanks. We will reply with availability and the rate."
          />
        </div>
      </Section>
    </>
  );
}
