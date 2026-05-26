'use client';

import { Card } from '@/components/ui';
import { BookingModal } from '@/components/events/BookingModal';
import { useEvents, type CatalogEvent } from '@/hooks/use-events';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, CalendarCheck, Clock, MapPin, PhoneCall, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const EVENT_IMAGES: Record<string, string> = {
  'Pizza Friday Night': '/images/events/pizza-friday.jpg',
  'Couples Night': '/images/events/couples-night.jpg',
  'Game Night': '/images/events/events-3.jpg',
  'Table Reservation': '/images/services/events.jpg',
  'Private Venue Hire': '/images/services/events.jpg',
};

function tagLabel(tags: string[] = []): string {
  if (tags.includes('special')) return 'Special Event';
  if (tags.includes('private')) return 'Private Event';
  if (tags.includes('weekly')) return 'Weekly';
  if (tags.includes('reservation')) return 'Reservation';
  return 'Event';
}

function eventDate(event: CatalogEvent): string {
  if (!event.scheduledFor) return 'Recurring';
  return new Date(event.scheduledFor).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function eventTime(event: CatalogEvent): string {
  if (!event.scheduledFor) return 'See details';
  return new Date(event.scheduledFor).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

function EventSkeleton() {
  return (
    <div className="electrical-border rounded-[3rem] animate-pulse">
      <div className="rounded-[3rem] magical-card h-[350px]" />
    </div>
  );
}

const RESERVATION_FEATURES = [
  { icon: CalendarCheck, title: 'Guaranteed Seating', desc: 'Your table is held for you — no waiting, no stress.' },
  { icon: Users, title: 'Any Party Size', desc: 'From an intimate dinner for two to a celebration for twenty.' },
  { icon: PhoneCall, title: 'Staff Confirmation', desc: 'Our team personally confirms your booking via call or WhatsApp.' },
  { icon: Shield, title: 'Flexible Cancellation', desc: 'Cancel or reschedule up to 24 hours before — no charge.' },
];

function ReserveTab() {
  const widgetLoaded = useRef(false);

  useEffect(() => {
    if (widgetLoaded.current) return;
    widgetLoaded.current = true;

    const posUiUrl = process.env.NEXT_PUBLIC_POS_UI_URL || 'https://pos.codevertexitsolutions.com';
    const posApiUrl = process.env.NEXT_PUBLIC_POS_API_URL || 'https://posapi.codevertexitsolutions.com';
    const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || 'urban-loft';

    // Set config before injecting script (document.currentScript is null for dynamic injection)
    (window as typeof window & { __cvBookingConfig?: Record<string, string> }).__cvBookingConfig = {
      tenant: tenantSlug,
      apiUrl: posApiUrl,
      restaurantName: 'Urban Loft Cafe',
      primaryColor: '#f97316',
      accentColor: '#dc6b19',
      openingTime: '08:00',
      closingTime: '22:00',
      slotInterval: '30',
      maxPartySize: '20',
      cancellationPolicy: 'Free cancellation up to 24 hours before your reservation. Same-day cancellations may incur a KES 500 fee.',
      depositInfo: 'A KES 500 deposit is required for parties of 6 or more. Deposit credited to your bill.',
      whatsapp: '254712345678',
    };

    const el = document.createElement('script');
    el.src = `${posUiUrl}/widget/booking.js`;
    el.async = true;
    document.body.appendChild(el);

    return () => {
      document.body.removeChild(el);
      const root = document.getElementById('cv-booking-root');
      if (root) root.remove();
      (window as typeof window & { __cvBookingLoaded?: boolean; __cvBooking?: unknown; __cvBookingConfig?: unknown }).__cvBookingLoaded = false;
      delete (window as typeof window & { __cvBooking?: unknown }).__cvBooking;
      delete (window as typeof window & { __cvBookingConfig?: unknown }).__cvBookingConfig;
      widgetLoaded.current = false;
    };
  }, []);

  function openWidget() {
    const w = window as typeof window & { __cvBooking?: { open: () => void } };
    if (w.__cvBooking) {
      w.__cvBooking.open();
    }
  }

  return (
    <div className="space-y-24">
      {/* Hero split */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-6 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20">
            <CalendarCheck className="h-3 w-3" />
            <span>Online Reservations</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-primary-brand tracking-tight leading-tight mb-6">
            Reserve Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Perfect Table</span>
          </h2>
          <p className="text-xl text-secondary-brand font-light leading-relaxed mb-10">
            Skip the wait. Book your table online in under 60 seconds. Our team will personally confirm your reservation and ensure everything is set for your arrival.
          </p>
          <button
            onClick={openWidget}
            className="inline-flex items-center gap-3 h-16 px-12 rounded-2xl bg-brand-orange hover:bg-brand-burnt text-white font-black uppercase tracking-widest shadow-xl shadow-brand-orange/25 transition-all hover:scale-105 active:scale-95"
          >
            <CalendarCheck className="h-5 w-5" />
            Reserve a Table
          </button>
          <p className="mt-4 text-sm text-secondary-brand font-light">
            Or look for the <span className="text-brand-orange font-bold">🍽️ button</span> in the bottom-right corner.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative h-[420px] overflow-hidden rounded-[2.5rem] shadow-2xl">
          <Image src="/images/services/events.jpg" alt="Reserve a table at Urban Loft" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-dark/80 backdrop-blur-md border border-white/10">
              <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white font-bold text-sm">Tables available today</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature cards */}
      <div>
        <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl font-black text-primary-brand text-center mb-10 tracking-tight">
          What to Expect
        </motion.h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {RESERVATION_FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="electrical-border rounded-[2rem] h-full">
                <Card className="rounded-[2rem] magical-card p-8 border-none h-full flex flex-col gap-4">
                  <div className="p-4 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 w-fit">
                    <Icon className="h-7 w-7 text-brand-orange" />
                  </div>
                  <h4 className="font-black text-primary-brand text-lg tracking-tight">{title}</h4>
                  <p className="text-secondary-brand font-light text-sm leading-relaxed">{desc}</p>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Policy strip */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="electrical-border rounded-[2rem]">
        <Card className="rounded-[2rem] magical-card border-none p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Clock className="h-7 w-7 text-brand-orange mx-auto mb-3" />
              <p className="font-black text-primary-brand mb-1">Opening Hours</p>
              <p className="text-secondary-brand font-light text-sm">Mon–Fri: 8:00 AM – 10:00 PM</p>
              <p className="text-secondary-brand font-light text-sm">Weekends: 8:00 AM – 11:00 PM</p>
            </div>
            <div>
              <Shield className="h-7 w-7 text-brand-orange mx-auto mb-3" />
              <p className="font-black text-primary-brand mb-1">Cancellation Policy</p>
              <p className="text-secondary-brand font-light text-sm">Free cancellation up to 24 hrs before.</p>
              <p className="text-secondary-brand font-light text-sm">Same-day: KES 500 fee applies.</p>
            </div>
            <div>
              <MapPin className="h-7 w-7 text-brand-orange mx-auto mb-3" />
              <p className="font-black text-primary-brand mb-1">Location</p>
              <p className="text-secondary-brand font-light text-sm">Urban Loft Cafe, Busia Town</p>
              <p className="text-secondary-brand font-light text-sm">Off the main square, 1st Floor</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* CTA */}
      <div className="text-center py-8">
        <button
          onClick={openWidget}
          className="inline-flex items-center gap-3 h-16 px-14 rounded-2xl bg-brand-orange hover:bg-brand-burnt text-white font-black uppercase tracking-widest shadow-xl shadow-brand-orange/25 transition-all hover:scale-105 active:scale-95"
        >
          <CalendarCheck className="h-5 w-5" />
          Book Your Table Now
        </button>
        <p className="mt-4 text-sm text-secondary-brand font-light">
          Confirmed within 30 minutes during opening hours
        </p>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { data: events = [], isLoading } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<CatalogEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'reserve'>('events');

  return (
    <main className="relative min-h-screen overflow-hidden section-blend-cream">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-mesh opacity-40" />
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
      </div>

      {/* Hero */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden z-10">
        <div className="absolute inset-0">
          <Image src="/images/services/events.jpg" alt="Events at Urban Loft Cafe" fill className="object-cover opacity-40 scale-110" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-brand-dark" />
        </div>
        <div className="container relative flex h-full items-center justify-center text-center text-white">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20 backdrop-blur-md">
              <span>Community & Culture</span>
            </div>
            <h1 className="mb-4 text-5xl font-black md:text-8xl tracking-tight leading-tight">
              Events & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Reservations</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-white/90 font-medium">
              Join us for exciting community events — or reserve your perfect table online.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tab navigation */}
      <div className="sticky top-0 z-10 bg-brand-dark/90 backdrop-blur-xl border-b border-white/10">
        <div className="container">
          <div className="flex gap-1 py-3">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === 'events'
                  ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab('reserve')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === 'reserve'
                  ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarCheck className="h-4 w-4" />
              Reserve a Table
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container">
          <AnimatePresence mode="wait">
            {activeTab === 'events' && (
              <motion.div key="events" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                {isLoading ? (
                  <div className="grid gap-16">
                    {Array.from({ length: 3 }).map((_, i) => <EventSkeleton key={i} />)}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-24">
                    <p className="text-2xl font-black text-primary-brand">No upcoming events</p>
                    <p className="text-secondary-brand mt-2 font-light">Check back soon for new events and happenings.</p>
                    <button
                      onClick={() => setActiveTab('reserve')}
                      className="mt-8 inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-brand-orange text-white font-black uppercase tracking-widest text-xs transition-all hover:bg-brand-burnt"
                    >
                      <CalendarCheck className="h-4 w-4" />
                      Reserve a Table Instead
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-16">
                    {events.map((event, index) => (
                      <motion.div key={event.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: index * 0.1 }}>
                        <div className="electrical-border rounded-[3rem]">
                          <Card className="overflow-hidden shadow-2xl border-none magical-card rounded-[3rem]">
                            <div className="grid md:grid-cols-2">
                              <div className="relative h-[350px] md:h-auto overflow-hidden">
                                <Image
                                  src={event.imageUrl ?? EVENT_IMAGES[event.name] ?? '/images/services/events.jpg'}
                                  alt={event.name}
                                  fill
                                  className="object-cover transition-transform duration-700 hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-dark/20" />
                              </div>
                              <div className="p-10 md:p-16 flex flex-col justify-center">
                                <div className="mb-6 inline-flex w-fit rounded-full bg-brand-orange/10 px-5 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-orange border border-brand-orange/20">
                                  {tagLabel(event.tags)}
                                </div>
                                <h2 className="mb-6 text-4xl font-black text-primary-brand tracking-tight">{event.name}</h2>
                                {event.description && (
                                  <p className="mb-10 text-xl text-secondary-brand font-light leading-relaxed">{event.description}</p>
                                )}
                                <div className="space-y-6 border-t border-white/5 pt-10">
                                  <div className="flex items-center gap-4 text-secondary-brand">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                      <Calendar className="h-6 w-6 text-brand-orange" />
                                    </div>
                                    <span className="text-lg font-medium">{eventDate(event)}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-secondary-brand">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                      <Clock className="h-6 w-6 text-brand-orange" />
                                    </div>
                                    <span className="text-lg font-medium">{eventTime(event)}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-secondary-brand">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                      <MapPin className="h-6 w-6 text-brand-orange" />
                                    </div>
                                    <span className="text-lg font-medium">Urban Loft Busia</span>
                                  </div>
                                  {event.basePrice > 0 && (
                                    <div className="flex items-center gap-4 text-secondary-brand">
                                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                        <Users className="h-6 w-6 text-brand-orange" />
                                      </div>
                                      <span className="text-lg font-medium">{event.currency} {event.basePrice.toLocaleString()} per person</span>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-12 flex flex-wrap gap-3">
                                  <button
                                    onClick={() => setSelectedEvent(event)}
                                    className="h-16 rounded-2xl bg-brand-orange px-12 font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:bg-brand-burnt shadow-xl shadow-brand-orange/20"
                                  >
                                    Book a Spot
                                  </button>
                                  <button
                                    onClick={() => setActiveTab('reserve')}
                                    className="h-16 rounded-2xl bg-white/5 border border-white/10 px-8 font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm flex items-center gap-2"
                                  >
                                    <CalendarCheck className="h-4 w-4" />
                                    Reserve Table
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reserve' && (
              <motion.div key="reserve" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <ReserveTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Host Your Event — only on events tab */}
      {activeTab === 'events' && (
        <section className="section-blend-beige py-16 md:py-24">
          <div className="container">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="mb-6 text-3xl font-black text-primary-brand md:text-5xl tracking-tight">Host Your Own Event</h2>
                <p className="mb-6 text-lg text-secondary-brand font-light">
                  Looking for a unique space for your next workshop, birthday party, or corporate meetup? Urban Loft Cafe offers flexible spaces and catering options to make your event a success.
                </p>
                <ul className="mb-8 space-y-4 text-secondary-brand">
                  {['Flexible seating arrangements', 'High-quality audio/visual equipment', 'Customizable catering menus', 'Dedicated event coordinator'].map((item) => (
                    <li key={item} className="flex items-center gap-2 font-light">
                      <div className="h-2 w-2 rounded-full bg-brand-orange" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="/contact" className="inline-block rounded-full bg-brand-orange px-8 py-3 font-bold text-white transition-transform hover:scale-105">
                  Inquire Now
                </a>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative h-[400px] overflow-hidden rounded-2xl shadow-xl">
                <Image src="/images/services/events.jpg" alt="Host Your Event" fill className="object-cover" />
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
