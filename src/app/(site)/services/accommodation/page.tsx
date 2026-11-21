'use client';

import { FactList, PageIntro, PhotoGrid, Section, type GridPhoto } from '@/components/site';
import { EnquiryForm } from '@/components/site/EnquiryForm';

/** Our own rooms, photographed on site. Ordered so the mosaic fills whole rows. */
const PHOTOS: GridPhoto[] = [
  { src: '/images/rooms/room-lounge.webp', alt: 'The sitting room with armchairs, a reading lamp and garden windows', span: 'big' },
  { src: '/images/rooms/room-kitchenette.webp', alt: 'A kitchenette with a kettle, toaster, microwave and open shelves', span: 'tall' },
  { src: '/images/rooms/room-armchair.webp', alt: 'A green velvet armchair with a cushion', span: 'tall' },
  { src: '/images/rooms/room-bed-mirror.webp', alt: 'A bed with a floral cover beside an arched mirror and a plant', span: 'tall' },
  { src: '/images/rooms/room-reading-corner.webp', alt: 'A reading corner with an armchair under a floor lamp', span: 'tall' },
  { src: '/images/rooms/garden-steps.webp', alt: 'Steps from the rooms down to the garden', span: 'tall' },
  { src: '/images/rooms/walkway.webp', alt: 'The walkway to the rooms, lined with trees', span: 'tall' },
];

export default function AccommodationPage() {
  return (
    <>
      <PageIntro
        title="Rooms"
        lede="Quiet rooms for people in town on business or passing through the border, with breakfast and dinner from our own kitchen."
        image="/images/rooms/room-double-bed.webp"
        imageAlt="A double bed with fresh linen and a floral cover in one of our rooms"
      />

      <Section title="In every room">
        <FactList
          items={[
            { label: 'Bed', value: 'Double bed with fresh linen' },
            { label: 'Work', value: 'Desk, chair and Wi-Fi' },
            { label: 'Food', value: 'Breakfast and room service from the cafe kitchen' },
          ]}
        />
        <h3 className="font-display mt-14 text-3xl leading-none md:text-4xl">Take a look inside</h3>
        <p className="mt-3 mb-8 max-w-2xl text-lg leading-relaxed text-ink-soft">
          The rooms, the sitting room and the garden path, as they are today.
        </p>
        <PhotoGrid photos={PHOTOS} />
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
