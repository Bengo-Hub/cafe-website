'use client';

import { Field, FormNotice, LinkButton, PageIntro, Section, VisitDetails, inputClass, textareaClass, useCafePhone } from '@/components/site';
import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { createReservation, fetchOutlets, freeTables, type PosOutlet } from '@/lib/api/reservations';
import { orderingUrl } from '@/lib/ordering-url';
import { SITE, telHref } from '@/lib/site';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const DURATION = 90;
const MAX_PARTY = 12;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Half-hour slots from opening until an hour before closing (the last table booking). */
function slots(): string[] {
  const out: string[] = [];
  for (let m = toMinutes(SITE.opens); m <= toMinutes(SITE.closes) - 60; m += 30) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return out;
}

function todayInNairobi(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(new Date());
}

/** A date and time in the cafe's own timezone (Nairobi, UTC+3, no daylight saving). */
function nairobiDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+03:00`);
}

type Status = 'idle' | 'submitting' | 'done' | 'error';

export default function ReservePage() {
  const { tenant } = useTenantBrand();
  const phone = useCafePhone();
  const [outlets, setOutlets] = useState<PosOutlet[]>([]);
  const [outletId, setOutletId] = useState('');
  const [date, setDate] = useState(todayInNairobi());
  const [time, setTime] = useState('19:00');
  const [party, setParty] = useState(2);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [free, setFree] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const tenantId = tenant?.id ?? '';
  const timeOptions = useMemo(() => {
    const soonest = Date.now() + 30 * 60_000;
    return slots().filter((t) => nairobiDate(date, t).getTime() > soonest);
  }, [date]);

  useEffect(() => {
    if (!tenantId) return;
    fetchOutlets(tenantId).then((list) => {
      const dining = list.filter((o) => !o.use_case || o.use_case === 'hospitality' || o.use_case === 'quick_service');
      const use = dining.length > 0 ? dining : list;
      setOutlets(use);
      if (use[0]) setOutletId((id) => id || use[0].id);
    });
  }, [tenantId]);

  useEffect(() => {
    if (timeOptions.length > 0 && !timeOptions.includes(time)) setTime(timeOptions[0]);
  }, [timeOptions, time]);

  useEffect(() => {
    if (!tenantId || !outletId || !timeOptions.includes(time)) {
      setFree(null);
      return;
    }
    let cancelled = false;
    freeTables(tenantId, outletId, date, party, nairobiDate(date, time), DURATION)
      .then((n) => !cancelled && setFree(n))
      .catch(() => !cancelled && setFree(null));
    return () => {
      cancelled = true;
    };
  }, [tenantId, outletId, date, time, party, timeOptions]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !outletId) return;
    setStatus('submitting');
    setError('');
    try {
      await createReservation(tenantId, {
        outletId,
        guestName: form.name.trim(),
        guestPhone: form.phone.trim(),
        guestEmail: form.email.trim() || undefined,
        partySize: party,
        scheduledAt: nairobiDate(date, time),
        durationMinutes: DURATION,
        specialRequests: form.notes.trim() || undefined,
      });
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'The booking did not go through. Try again, or call us.');
    }
  };

  const when = new Intl.DateTimeFormat('en-KE', { dateStyle: 'full', timeZone: 'Africa/Nairobi' }).format(nairobiDate(date, time));

  return (
    <>
      <PageIntro
        title="Book a table"
        lede={`Pick a time and how many of you are coming. Tables are held for ${DURATION} minutes, and we confirm every booking by phone or text.`}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {status === 'done' ? (
              <div className="space-y-5">
                <FormNotice tone="ok">
                  Booking received: a table for {party} on {when} at {time}. We will confirm it on {form.phone}.
                </FormNotice>
                <div className="flex flex-wrap gap-3">
                  <LinkButton href={orderingUrl('/catalog', tenant?.slug || undefined)}>See the menu</LinkButton>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setForm({ name: '', phone: '', email: '', notes: '' });
                    }}
                    className="inline-flex h-12 items-center rounded-md border border-ink/25 px-5 text-[15px] font-semibold text-ink hover:border-ink"
                  >
                    Make another booking
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field id="r-date" label="Date">
                    <input id="r-date" type="date" className={inputClass} min={todayInNairobi()} value={date} onChange={(e) => setDate(e.target.value)} required />
                  </Field>
                  <Field id="r-time" label="Time">
                    <select id="r-time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} required>
                      {timeOptions.length === 0 && <option value="">No times left today</option>}
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field id="r-party" label="Guests">
                    <select id="r-party" className={inputClass} value={party} onChange={(e) => setParty(Number(e.target.value))}>
                      {Array.from({ length: MAX_PARTY }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {outlets.length > 1 && (
                  <Field id="r-outlet" label="Branch">
                    <select id="r-outlet" className={inputClass} value={outletId} onChange={(e) => setOutletId(e.target.value)}>
                      {outlets.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </Field>
                )}

                {free !== null && (
                  <p
                    aria-live="polite"
                    className={`rounded-md px-4 py-3 text-[15px] ${free > 0 ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200' : 'bg-amber-50 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200'}`}
                  >
                    {free > 0
                      ? `${free} ${free === 1 ? 'table is' : 'tables are'} free for ${party} at ${time}.`
                      : `We look full for ${party} at ${time}. Try another time, or book anyway and we will call you with options.`}
                  </p>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="r-name" label="Name">
                    <input id="r-name" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoComplete="name" />
                  </Field>
                  <Field id="r-phone" label="Phone">
                    <input id="r-phone" type="tel" className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07xx xxx xxx" required pattern="[0-9+ ]{9,15}" autoComplete="tel" />
                  </Field>
                </div>
                <Field id="r-email" label="Email (optional)">
                  <input id="r-email" type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                </Field>
                <Field id="r-notes" label="Anything we should know? (optional)">
                  <textarea id="r-notes" rows={3} className={textareaClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="A birthday, a high chair, a quiet corner" />
                </Field>

                {status === 'error' && <FormNotice tone="error">{error}</FormNotice>}

                <button
                  type="submit"
                  disabled={status === 'submitting' || !tenantId || !outletId || timeOptions.length === 0}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-loft px-6 text-[15px] font-semibold text-white hover:bg-loft-deep disabled:opacity-60 sm:w-auto"
                >
                  {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  Book the table
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-6 rounded-lg bg-leaf p-6">
            <VisitDetails />
            <p className="text-[15px] text-ink-soft">
              More than {MAX_PARTY} people, or planning a party?{' '}
              <a href={telHref(phone)} className="font-semibold text-ink underline underline-offset-4">Call us</a> or{' '}
              <a href="/services/events" className="font-semibold text-ink underline underline-offset-4">ask for an event quote</a>.
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
