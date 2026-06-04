'use client';

import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import Link from 'next/link';

const FAQ_ITEMS = [
  {
    q: 'What are your opening hours?',
    a: 'Our cafe and Business Hub hours vary by outlet. Please check the Contact page or call us for the latest schedule.',
  },
  {
    q: 'Do you take reservations?',
    a: 'Yes. For the cafe, events, and accommodation you can enquire via the Contact page or call us.',
  },
  {
    q: 'Is the Business Hub available for hourly booking?',
    a: 'Yes. Co-working, boardrooms, and meeting spaces can be booked by the hour or day. Contact us for rates and availability.',
  },
  {
    q: 'Do you cater for dietary requirements?',
    a: 'We offer vegetarian, vegan, and gluten-free options. Please mention your requirements when ordering or booking.',
  },
  {
    q: 'How does the loyalty program work?',
    a: 'Earn points on every purchase and redeem them for discounts and rewards. See our Loyalty page for details.',
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen section-blend-cream py-16 md:py-24">
      <div className="container max-w-3xl">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h1 className="text-4xl font-black text-primary-brand md:text-5xl tracking-tight flex items-center justify-center gap-3">
            <HelpCircle className="h-10 w-10 text-brand-orange" />
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-secondary-brand font-light">Quick answers to common questions.</p>
        </motion.header>

        <ul className="space-y-6">
          {FAQ_ITEMS.map((item, i) => (
            <motion.li
              key={item.q}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 border border-brand-beige/20 dark:border-white/10"
            >
              <h2 className="text-lg font-bold text-primary-brand">{item.q}</h2>
              <p className="mt-2 text-secondary-brand font-light">{item.a}</p>
            </motion.li>
          ))}
        </ul>

        <p className="mt-12 text-center text-secondary-brand font-light">
          Can&apos;t find your answer? <Link href="/contact" className="text-brand-orange font-semibold hover:underline">Contact us</Link>.
        </p>
      </div>
    </main>
  );
}
