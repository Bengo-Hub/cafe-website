'use client';

import { Card } from '@/components/ui';
import { dummyEvents } from '@/lib/dummy-data';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function EventsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-light dark:bg-brand-dark transition-colors duration-600">
      {/* Magical Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-mesh opacity-40" />
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden z-10">
        <div className="absolute inset-0">
          <Image
            src="/images/services/events.jpg"
            alt="Events at Urban Loft Cafe"
            fill
            className="object-cover opacity-40 scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-brand-dark" />
        </div>
        <div className="container relative flex h-full items-center justify-center text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20 backdrop-blur-md">
              <span>Community & Culture</span>
            </div>
            <h1 className="mb-4 text-5xl font-black md:text-8xl tracking-tight leading-tight">
              Events & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Happenings</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-brand-muted dark:text-brand-beige/60 font-light">
              Join us for exciting community events, workshops, and live performances.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container">
          <div className="grid gap-16">
            {dummyEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className="electrical-border rounded-[3rem]">
                  <Card className="overflow-hidden shadow-2xl border-none bg-white/5 backdrop-blur-xl rounded-[3rem]">
                    <div className="grid md:grid-cols-2">
                      <div className="relative h-[350px] md:h-auto overflow-hidden">
                        <Image
                          src={event.image}
                          alt={event.name}
                          fill
                          className="object-cover transition-transform duration-700 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-dark/20" />
                      </div>
                      <div className="p-10 md:p-16 flex flex-col justify-center">
                        <div className="mb-6 inline-flex w-fit rounded-full bg-brand-orange/10 px-5 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-orange border border-brand-orange/20">
                          {event.category}
                        </div>
                        <h2 className="mb-6 text-4xl font-black text-white tracking-tight">{event.name}</h2>
                        <p className="mb-10 text-xl text-brand-beige/70 font-light leading-relaxed">{event.description}</p>
                        
                        <div className="space-y-6 border-t border-white/5 pt-10">
                          <div className="flex items-center gap-4 text-brand-beige/80">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                              <Calendar className="h-6 w-6 text-brand-orange" />
                            </div>
                            <span className="text-lg font-medium">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-4 text-brand-beige/80">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                              <Clock className="h-6 w-6 text-brand-orange" />
                            </div>
                            <span className="text-lg font-medium">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-4 text-brand-beige/80">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                              <MapPin className="h-6 w-6 text-brand-orange" />
                            </div>
                            <span className="text-lg font-medium">{event.location}</span>
                          </div>
                        </div>

                        <div className="mt-12">
                          <button className="h-16 rounded-2xl bg-brand-orange px-12 font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:bg-brand-burnt shadow-xl shadow-brand-orange/20">
                            Book a Spot
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Host Your Event Section */}
      <section className="section-blend-beige py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-6 text-3xl font-black text-primary-brand md:text-5xl tracking-tight">
                Host Your Own Event
              </h2>
              <p className="mb-6 text-lg text-secondary-brand font-light">
                Looking for a unique space for your next workshop, birthday party, or corporate meetup? 
                Urban Loft Cafe offers flexible spaces and catering options to make your event a success.
              </p>
              <ul className="mb-8 space-y-4 text-secondary-brand">
                <li className="flex items-center gap-2 font-light">
                  <div className="h-2 w-2 rounded-full bg-brand-orange" />
                  Flexible seating arrangements
                </li>
                <li className="flex items-center gap-2 font-light">
                  <div className="h-2 w-2 rounded-full bg-brand-orange" />
                  High-quality audio/visual equipment
                </li>
                <li className="flex items-center gap-2 font-light">
                  <div className="h-2 w-2 rounded-full bg-brand-orange" />
                  Customizable catering menus
                </li>
                <li className="flex items-center gap-2 font-light">
                  <div className="h-2 w-2 rounded-full bg-brand-orange" />
                  Dedicated event coordinator
                </li>
              </ul>
              <a
                href="/contact"
                className="inline-block rounded-full bg-brand-orange px-8 py-3 font-bold text-white transition-transform hover:scale-105"
              >
                Inquire Now
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[400px] overflow-hidden rounded-2xl shadow-xl"
            >
              <Image
                src="/images/services/events.jpg"
                alt="Host Your Event"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
