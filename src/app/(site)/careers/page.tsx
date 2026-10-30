'use client';

import { FactList, PageIntro, Section } from '@/components/site';
import { EnquiryForm } from '@/components/site/EnquiryForm';

export default function CareersPage() {
  return (
    <>
      <PageIntro
        title="Work with us"
        lede="We hire cooks, baristas, waiters, cleaners and supervisors from Busia and nearby. Send us your details and we will call you when a place opens that fits."
        image="/images/hero/hero-team.jpg"
        imageAlt="Members of the Urban Loft team"
      />

      <Section title="Who we look for">
        <div className="max-w-3xl">
          <FactList
            items={[
              { label: 'Kitchen', value: 'Cooks and kitchen assistants' },
              { label: 'Front of house', value: 'Waiters, cashiers and baristas' },
              { label: 'Rooms and hub', value: 'Housekeeping and reception' },
              { label: 'Training', value: 'New starters learn on the job from our own service trainers' },
            ]}
          />
        </div>
      </Section>

      <Section tone="leaf" title="Send your details" lede="Tell us the work you want and what you have done before. Add a link to your CV if you have one online.">
        <div className="max-w-2xl">
          <EnquiryForm
            subject="Job application"
            messageLabel="The role you want and your experience"
            messagePlaceholder="Barista. Two years at a coffee shop in Kisumu. CV: drive.google.com/..."
            submitLabel="Send application"
            sentText="Thanks. We keep every application and will call you when a suitable place opens."
          />
        </div>
      </Section>
    </>
  );
}
