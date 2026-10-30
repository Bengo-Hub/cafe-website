'use client';

import { PageIntro, Section, VisitDetails } from '@/components/site';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { SITE } from '@/lib/site';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  const { tenant } = useTenantBrand();
  const email = tenant?.contactEmail || SITE.email;

  return (
    <>
      <PageIntro
        title="Contact us"
        lede="Call or WhatsApp for anything quick. For bookings, quotes and everything else, send us a message and we reply the same day."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-8">
            <VisitDetails />
            <p className="flex items-center gap-3 text-[15px]">
              <Mail className="h-5 w-5 text-ink-soft" aria-hidden />
              <a href={`mailto:${email}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                {email}
              </a>
            </p>
            <div className="relative h-72 overflow-hidden rounded-lg border border-line">
              <iframe
                title={`Map showing ${SITE.name}, ${SITE.town}`}
                src={SITE.mapEmbed}
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl leading-none md:text-4xl">Send a message</h2>
            <div className="mt-6">
              <EnquiryForm subject="Message from the website" submitLabel="Send message" />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
