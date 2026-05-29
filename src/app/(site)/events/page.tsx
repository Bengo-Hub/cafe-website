'use client';

import { Card, Pagination } from '@/components/ui';
import { BookingModal } from '@/components/events/BookingModal';
import { TableReservationModal } from '@/components/events/TableReservationModal';
import { EVENTS_PER_PAGE, useEvents, type CatalogEvent } from '@/hooks/use-events';
import { type RecurrenceConfig } from '@/lib/api/events';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, CalendarCheck, Clock, MapPin, PhoneCall, RefreshCw, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_LABELS = ['1st', '2nd', '3rd', '4th', 'Last'];
const WEEK_NUMS = [1, 2, 3, 4, -1];

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function formatTime12(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr ?? '00';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return m === '00' ? `${h12}:00 ${suffix}` : `${h12}:${m} ${suffix}`;
}

function recurrenceLabel(rc: RecurrenceConfig): string {
  const time = rc.time ? ` at ${formatTime12(rc.time)}` : '';
  if (rc.type === 'daily') return `Every day${time}`;
  if (rc.type === 'weekly') {
    if (!rc.days || rc.days.length === 0) return `Every week${time}`;
    const dayNames = rc.days.map((d) => DAYS[d] ?? '').filter(Boolean);
    if (dayNames.length === 1) return `Every ${dayNames[0]}${time}`;
    return `Every ${dayNames.slice(0, -1).join(', ')} & ${dayNames[dayNames.length - 1]}${time}`;
  }
  if (rc.type === 'monthly') {
    if (rc.weekNum !== undefined && rc.weekDay !== undefined) {
      const weekIdx = WEEK_NUMS.indexOf(rc.weekNum);
      const weekLabel = weekIdx >= 0 ? WEEK_LABELS[weekIdx] : ordinal(rc.weekNum);
      return `Monthly, ${weekLabel} ${DAYS[rc.weekDay] ?? ''}${time}`;
    }
    if (rc.monthDay !== undefined) return `Monthly on the ${ordinal(rc.monthDay)}${time}`;
    return `Every month${time}`;
  }
  if (rc.type === 'yearly') {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const m = months[(rc.yearMonth ?? 1) - 1] ?? '';
    return `Annually on ${m} ${ordinal(rc.yearDay ?? 1)}${time}`;
  }
  return `Recurring${time}`;
}

function tagLabel(tags: string[] = []): string {
  if (tags.includes('special')) return 'Special Event';
  if (tags.includes('private')) return 'Private Event';
  if (tags.includes('weekly')) return 'Weekly';
  if (tags.includes('reservation')) return 'Reservation';
  return 'Event';
}

function eventDateSrc(event: CatalogEvent): string | undefined {
  return event.eventStartAt || event.scheduledFor;
}

function eventDate(event: CatalogEvent): string {
  const src = eventDateSrc(event);
  if (!src) {
    if (event.metadata?.recurrence_config) return recurrenceLabel(event.metadata.recurrence_config as RecurrenceConfig);
    return event.metadata?.is_recurring ? (event.metadata.recurrence_pattern as string || 'Recurring') : 'Date TBA';
  }
  return new Date(src).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function eventTimeRange(event: CatalogEvent): string {
  const src = eventDateSrc(event);
  if (!src) return '';
  const startStr = new Date(src).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  if (!event.eventEndAt) return startStr;
  const endStr = new Date(event.eventEndAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  return `${startStr} – ${endStr}`;
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

function ReserveTab({ onOpenModal }: { onOpenModal: () => void }) {

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
            onClick={onOpenModal}
            className="inline-flex items-center gap-3 h-16 px-12 rounded-2xl bg-brand-orange hover:bg-brand-burnt text-white font-black uppercase tracking-widest shadow-xl shadow-brand-orange/25 transition-all hover:scale-105 active:scale-95"
          >
            <CalendarCheck className="h-5 w-5" />
            Reserve a Table
          </button>
          <p className="mt-4 text-sm text-secondary-brand font-light">
            Confirmed within 30 minutes during opening hours.
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
          onClick={onOpenModal}
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
  const [page, setPage] = useState(1);
  const { data: eventsPage, isLoading } = useEvents(page, EVENTS_PER_PAGE);
  const now = new Date();
  const events = (eventsPage?.data ?? []).filter((e) => {
    const src = e.eventStartAt || e.scheduledFor;
    // Always show recurring events; hide one-time events that have already passed
    if (!src) return true;
    return new Date(src) >= now;
  });
  const total   = eventsPage?.total ?? 0;
  const hasMore = eventsPage?.hasMore ?? false;
  const [selectedEvent, setSelectedEvent] = useState<CatalogEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'reserve'>('events');
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableModalEvent, setTableModalEvent] = useState<CatalogEvent | null>(null);

  function openTableModal(event?: CatalogEvent) {
    setTableModalEvent(event ?? null);
    setTableModalOpen(true);
  }

  useEffect(() => {
    const w = window as typeof window & { __openTableBooking?: (event?: CatalogEvent) => void };
    w.__openTableBooking = openTableModal;
    return () => { delete w.__openTableBooking; };
  }, []);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    // Scroll back to the events section smoothly
    document.getElementById('events-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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
                  <div id="events-list">
                  <div className="grid gap-16">
                    {events.map((event, index) => {
                      const isRecurring = !!(event.metadata?.is_recurring);
                      const rc = event.metadata?.recurrence_config as RecurrenceConfig | undefined;
                      const recurringLabel = rc ? recurrenceLabel(rc) : (event.metadata?.recurrence_pattern as string | undefined) ?? null;
                      const timeRange = eventTimeRange(event);
                      const capacity = event.totalCapacity;
                      const bookedCapacity = typeof event.metadata?.booked_capacity === 'number' ? event.metadata.booked_capacity : null;
                      const availableSlots = bookedCapacity !== null && capacity ? capacity - bookedCapacity : null;
                      const fillPct = bookedCapacity !== null && capacity ? Math.min(100, Math.round((bookedCapacity / capacity) * 100)) : null;
                      const barColor = fillPct === null ? 'bg-green-500' : fillPct >= 90 ? 'bg-red-500' : fillPct >= 60 ? 'bg-yellow-500' : 'bg-green-500';
                      return (
                      <motion.div key={event.sku} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: index * 0.1 }}>
                        <div className="electrical-border rounded-[3rem]">
                          <Card className="overflow-hidden shadow-2xl border-none magical-card rounded-[3rem]">
                            <div className="grid md:grid-cols-2">
                              <div className="relative h-[350px] md:h-auto overflow-hidden">
                                <Image
                                  src={event.imageUrl ?? '/images/services/events.jpg'}
                                  alt={event.name}
                                  fill
                                  className="object-cover transition-transform duration-700 hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-dark/20" />
                                {/* Recurring badge on image */}
                                {isRecurring && (
                                  <div className="absolute top-5 left-5">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-600/90 backdrop-blur-sm px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white border border-purple-400/30">
                                      <RefreshCw className="h-3 w-3" />
                                      {recurringLabel ?? 'Recurring'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="p-10 md:p-16 flex flex-col justify-center">
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                  <span className="inline-flex w-fit rounded-full bg-brand-orange/10 px-5 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-orange border border-brand-orange/20">
                                    {tagLabel(event.tags)}
                                  </span>
                                  {isRecurring && recurringLabel && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20">
                                      <RefreshCw className="h-3 w-3" />
                                      {recurringLabel}
                                    </span>
                                  )}
                                </div>
                                <h2 className="mb-6 text-4xl font-black text-primary-brand tracking-tight">{event.name}</h2>
                                {event.description && (
                                  <p className="mb-10 text-xl text-secondary-brand font-light leading-relaxed">{event.description}</p>
                                )}
                                <div className="space-y-6 border-t border-white/5 pt-10">
                                  {/* Date — show only for non-recurring or if we have a specific date */}
                                  {!isRecurring && (
                                    <div className="flex items-center gap-4 text-secondary-brand">
                                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                        <Calendar className="h-6 w-6 text-brand-orange" />
                                      </div>
                                      <span className="text-lg font-medium">{eventDate(event)}</span>
                                    </div>
                                  )}
                                  {/* Time range */}
                                  {timeRange && (
                                    <div className="flex items-center gap-4 text-secondary-brand">
                                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                        <Clock className="h-6 w-6 text-brand-orange" />
                                      </div>
                                      <span className="text-lg font-medium">{timeRange}</span>
                                    </div>
                                  )}
                                  {/* Recurring: show recurrence pattern in place of date when no specific date */}
                                  {isRecurring && !eventDateSrc(event) && (
                                    <div className="flex items-center gap-4 text-secondary-brand">
                                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                        <RefreshCw className="h-6 w-6 text-brand-orange" />
                                      </div>
                                      <span className="text-lg font-medium">{recurringLabel ?? 'Recurring'}</span>
                                    </div>
                                  )}
                                  {/* Venue */}
                                  <div className="flex items-center gap-4 text-secondary-brand">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                      <MapPin className="h-6 w-6 text-brand-orange" />
                                    </div>
                                    <span className="text-lg font-medium">{event.eventVenue || 'Urban Loft Busia'}</span>
                                  </div>
                                  {/* Capacity */}
                                  {capacity && (
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-secondary-brand">
                                          <Users className="h-4 w-4 text-brand-orange" />
                                          {availableSlots !== null ? (
                                            <span><strong className="text-primary-brand">{availableSlots}</strong> slots available / {capacity} total</span>
                                          ) : (
                                            <span><strong className="text-primary-brand">{capacity}</strong> total slots</span>
                                          )}
                                        </div>
                                        {fillPct !== null && (
                                          <span className="text-xs text-secondary-brand opacity-60">{fillPct}% full</span>
                                        )}
                                      </div>
                                      {fillPct !== null && (
                                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${fillPct}%` }} />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {/* Ticket tiers — if defined, show tier pricing; else fall back to basePrice */}
                                  {event.metadata?.ticket_tiers && event.metadata.ticket_tiers.length > 0 ? (
                                    <div className="space-y-3">
                                      {event.metadata.ticket_tiers.map((tier, ti) => (
                                        <div key={ti} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                                          <span className="font-bold text-primary-brand">{tier.name}</span>
                                          <div className="flex items-center gap-4">
                                            <span className="text-sm text-secondary-brand">{tier.capacity} slots</span>
                                            <span className="font-black text-brand-orange">{event.currency} {tier.price.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : event.basePrice > 0 ? (
                                    <div className="flex items-center gap-4 text-secondary-brand">
                                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                        <Users className="h-6 w-6 text-brand-orange" />
                                      </div>
                                      <span className="text-lg font-medium">{event.currency} {event.basePrice.toLocaleString()} per person</span>
                                    </div>
                                  ) : null}
                                </div>
                                <div className="mt-12 flex flex-wrap gap-3">
                                  <button
                                    onClick={() => setSelectedEvent(event)}
                                    className="h-16 rounded-2xl bg-brand-orange px-12 font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:bg-brand-burnt shadow-xl shadow-brand-orange/20"
                                  >
                                    Book a Spot
                                  </button>
                                  <button
                                    onClick={() => openTableModal(event)}
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
                      );
                    })}
                  </div>
                  <Pagination
                    page={page}
                    total={total}
                    limit={EVENTS_PER_PAGE}
                    hasMore={hasMore}
                    onPageChange={handlePageChange}
                    itemLabel="events"
                    dark
                  />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reserve' && (
              <motion.div key="reserve" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <ReserveTab onOpenModal={() => openTableModal()} />
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

      {/* Event booking modal */}
      <AnimatePresence>
        {selectedEvent && (
          <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>

      {/* Table reservation modal */}
      <AnimatePresence>
        {tableModalOpen && (
          <TableReservationModal
            onClose={() => { setTableModalOpen(false); setTableModalEvent(null); }}
            selectedEvent={tableModalEvent ?? undefined}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
