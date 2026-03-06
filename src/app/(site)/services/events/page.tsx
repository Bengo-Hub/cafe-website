'use client';

import { Button } from '@/components/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function EventsServicesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-[320px] md:h-[420px] overflow-hidden">
        <Image
          src="/images/hero/hero-events.jpg"
          alt="Urban Loft Events & Catering"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-black text-white md:text-7xl tracking-tight">Events & Catering</h1>
            <p className="mt-4 text-brand-orange md:text-2xl font-light">Corporate • Private Parties • Custom Catering • AV Available</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-blend-cream py-12 md:py-24">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl font-black text-primary-brand md:text-5xl tracking-tight">Signature Events</h2>
              <p className="mt-6 text-lg text-secondary-brand font-light leading-relaxed">
                From intimate gatherings to large-scale corporate events, we provide the perfect backdrop and culinary experience to make your occasion unforgettable.
              </p>
              <ul className="mt-8 space-y-4 text-secondary-brand">
                {['Pizza Day', 'Couples Night', 'Game Night', "Chef's Special Day", 'Holiday Themes'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-light">
                    <div className="h-2 w-2 rounded-full bg-brand-orange" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="#enquire">
                  <Button className="bg-brand-orange hover:bg-brand-orange/90 px-10 py-6 text-lg font-bold rounded-full transition-transform hover:scale-105">
                    Make an Enquiry
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] shadow-2xl" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Image src="/images/events/events-1.jpg" alt="Event setup" fill className="object-cover" />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
