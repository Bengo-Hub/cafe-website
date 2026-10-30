'use client';

import { LinkButton, PageIntro, Section } from '@/components/site';
import { Pagination } from '@/components/ui';
import { BookingModal } from '@/components/events/BookingModal';
import { EVENTS_PER_PAGE, useEvents, type CatalogEvent } from '@/hooks/use-events';
import { type RecurrenceConfig } from '@/lib/api/events';
import { SITE } from '@/lib/site';
import { Calendar, Clock, MapPin, RefreshCw, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK_LABELS: Record<number, string> = { 1: 'first', 2: 'second', 3: 'third', 4: 'fourth', [-1]: 'last' };

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function time12(hhmm: string): string {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** "Every Friday at 7 PM" from the event's recurrence settings. */
function recurrenceLabel(rc: RecurrenceConfig): string {
  const at = rc.time ? ` at ${time12(rc.time)}` : '';
  if (rc.type === 'daily') return `Every day${at}`;
  if (rc.type === 'weekly') {
    const names = (rc.days ?? []).map((d) => DAYS[d]).filter(Boolean) as string[];
    if (names.length === 0) return `Every week${at}`;
    if (names.length === 1) return `Every ${names[0]}${at}`;
    return `Every ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}${at}`;
  }
  if (rc.type === 'monthly') {
    if (rc.weekNum !== undefined && rc.weekDay !== undefined) {
      return `The ${WEEK_LABELS[rc.weekNum] ?? ordinal(rc.weekNum)} ${DAYS[rc.weekDay] ?? ''} of each month${at}`;
    }
    if (rc.monthDay !== undefined) return `The ${ordinal(rc.monthDay)} of each month${at}`;
    return `Every month${at}`;
  }
  if (rc.type === 'yearly') return `Every year on ${ordinal(rc.yearDay ?? 1)} ${MONTHS[(rc.yearMonth ?? 1) - 1] ?? ''}${at}`;
  return `Regularly${at}`;
}

function startOf(e: CatalogEvent): string | undefined {
  return e.eventStartAt || e.scheduledFor;
}

function whenLabel(e: CatalogEvent): string {
  const rc = e.metadata?.recurrence_config as RecurrenceConfig | undefined;
  if (e.metadata?.is_recurring && rc) return recurrenceLabel(rc);
  const src = startOf(e);
  if (!src) return (e.metadata?.recurrence_pattern as string) || 'Date to be announced';
  const day = new Date(src).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Nairobi' });
  const from = new Date(src).toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Nairobi' });
  const to = e.eventEndAt ? new Date(e.eventEndAt).toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Nairobi' }) : '';
  return `${day}, ${from}${to ? ` to ${to}` : ''}`;
}

function priceLabel(e: CatalogEvent): string | null {
  const tiers = e.metadata?.ticket_tiers ?? [];
  if (tiers.length > 0) {
    const low = Math.min(...tiers.map((t) => t.price));
    return low > 0 ? `From ${e.currency} ${low.toLocaleString()}` : 'Free entry';
  }
  return e.basePrice > 0 ? `${e.currency} ${e.basePrice.toLocaleString()} per person` : null;
}

function EventRow({ event, onBook }: { event: CatalogEvent; onBook: () => void }) {
  const recurring = Boolean(event.metadata?.is_recurring);
  const capacity = event.totalCapacity;
  const booked = typeof event.metadata?.booked_capacity === 'number' ? event.metadata.booked_capacity : null;
  const left = booked !== null && capacity ? Math.max(0, capacity - booked) : null;
  const price = priceLabel(event);

  return (
    <article className="grid gap-6 border-t border-line py-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-leaf">
        <Image src={event.imageUrl ?? '/images/services/events.jpg'} alt="" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
      </div>
      <div>
        <h2 className="font-display text-4xl leading-none">{event.name}</h2>
        {event.description && <p className="mt-4 max-w-prose text-[17px] leading-relaxed text-ink-soft">{event.description}</p>}
        <ul className="mt-6 space-y-2 text-[15px] text-ink">
          <li className="flex items-center gap-3">
            {recurring ? <RefreshCw className="h-4 w-4 text-ink-soft" aria-hidden /> : <Calendar className="h-4 w-4 text-ink-soft" aria-hidden />}
            {whenLabel(event)}
          </li>
          <li className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-ink-soft" aria-hidden />
            {event.eventVenue || `${SITE.name}, ${SITE.town}`}
          </li>
          {price && (
            <li className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-ink-soft" aria-hidden />
              {price}
            </li>
          )}
          {left !== null && (
            <li className="flex items-center gap-3">
              <Users className="h-4 w-4 text-ink-soft" aria-hidden />
              {left === 0 ? 'Fully booked' : `${left} of ${capacity} places left`}
            </li>
          )}
        </ul>
        {(event.metadata?.ticket_tiers?.length ?? 0) > 1 && (
          <ul className="mt-5 max-w-md divide-y divide-line border-y border-line text-[15px]">
            {event.metadata!.ticket_tiers!.map((t) => (
              <li key={t.name} className="flex justify-between py-2">
                <span>{t.name}</span>
                <span className="tabular-nums">{event.currency} {t.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBook}
            disabled={left === 0}
            className="inline-flex h-12 items-center rounded-md bg-loft px-5 text-[15px] font-semibold text-white hover:bg-loft-deep disabled:opacity-60"
          >
            Book a place
          </button>
          <LinkButton href="/reserve" tone="secondary">Book a table instead</LinkButton>
        </div>
      </div>
    </article>
  );
}

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const { data: eventsPage, isLoading } = useEvents(page, EVENTS_PER_PAGE);
  const [selected, setSelected] = useState<CatalogEvent | null>(null);
  const now = new Date();
  // Repeating events always show; one-off events drop off once they have started.
  const events = (eventsPage?.data ?? []).filter((e) => {
    const src = startOf(e);
    return !src || new Date(src) >= now;
  });

  return (
    <>
      <PageIntro
        title="What's on"
        lede="Regular nights and one-off events at the cafe. Book a place here, or just book a table and come along."
      />

      <Section>
        {isLoading ? (
          <div className="space-y-6" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="h-64 rounded-lg bg-leaf" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="max-w-xl">
            <p className="text-[17px] text-ink">Nothing is planned right now. New events are posted here first.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/reserve">Book a table</LinkButton>
              <LinkButton href="/services/events" tone="secondary">Host your own event</LinkButton>
            </div>
          </div>
        ) : (
          <div id="events-list">
            {events.map((event) => (
              <EventRow key={event.sku} event={event} onBook={() => setSelected(event)} />
            ))}
            <Pagination
              page={page}
              total={eventsPage?.total ?? 0}
              limit={EVENTS_PER_PAGE}
              hasMore={eventsPage?.hasMore ?? false}
              onPageChange={(p) => {
                setPage(p);
                document.getElementById('events-list')?.scrollIntoView({ block: 'start' });
              }}
              itemLabel="events"
            />
          </div>
        )}
      </Section>

      <Section tone="leaf" title="Host your own" lede="Birthdays, workshops and team days, in the garden or catered at your venue.">
        <LinkButton href="/services/events">Plan an event</LinkButton>
      </Section>

      {selected && <BookingModal event={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
