'use client';

import { Button, Input } from '@/components/ui';
import { useTenantBrand } from '@/components/providers/TenantBrandProvider';
import { createReservation, fetchOutlets, freeTables, type PosOutlet } from '@/lib/api/reservations';
import { CalendarDays, CheckCircle, Clock, Loader2, Phone, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

// Opening hours shown on the contact page: every day 7:30 to 22:00. Last booking 21:00.
const FIRST_SLOT = 7 * 60 + 30;
const LAST_SLOT = 21 * 60;
const DURATION = 90;

function slots(): string[] {
  const out: string[] = [];
  for (let m = FIRST_SLOT; m <= LAST_SLOT; m += 30) {
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
    const now = Date.now() + 30 * 60_000;
    return slots().filter((t) => nairobiDate(date, t).getTime() > now);
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
      setError(err instanceof Error ? err.message : 'The booking could not be made.');
    }
  };

  const label = 'text-xs font-black uppercase tracking-widest text-brand-orange ml-4';
  const select = 'h-14 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50';

  return (
    <main className="relative min-h-screen bg-brand-dark pb-24 pt-32">
      <div className="container grid gap-12 lg:grid-cols-5">
        <section className="space-y-6 lg:col-span-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/15 px-5 py-2 text-xs font-black uppercase tracking-[0.3em] text-brand-orange">
            <CalendarDays className="h-4 w-4" /> Reservations
          </p>
          <h1 className="text-5xl font-black leading-none tracking-tight text-white md:text-6xl">
            Book a <span className="text-brand-orange">table</span>
          </h1>
          <p className="max-w-md text-lg font-light text-brand-beige/80">
            Pick a time and how many of you are coming. Your booking goes straight to our team, who will confirm it by
            phone or text.
          </p>
          <ul className="space-y-3 text-brand-beige/80">
            <li className="flex items-center gap-3"><Clock className="h-5 w-5 text-brand-orange" /> Open every day, 7:30AM to 10:00PM</li>
            <li className="flex items-center gap-3"><Users className="h-5 w-5 text-brand-orange" /> Tables held for {DURATION} minutes</li>
            {tenant?.contactPhone && (
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-brand-orange" /> Larger group or event?{' '}
                <a className="font-bold text-white underline-offset-4 hover:underline" href={`tel:${tenant.contactPhone.replace(/\s+/g, '')}`}>
                  {tenant.contactPhone}
                </a>
              </li>
            )}
          </ul>
        </section>

        <section className="lg:col-span-3">
          <div className="rounded-[3rem] border border-white/15 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl md:p-12">
            {status === 'done' ? (
              <div className="space-y-6 py-8 text-center" role="status">
                <CheckCircle className="mx-auto h-16 w-16 text-brand-orange" />
                <h2 className="text-3xl font-black text-white">Booking received</h2>
                <p className="text-brand-beige/80">
                  {party} {party === 1 ? 'guest' : 'guests'} on{' '}
                  {new Intl.DateTimeFormat('en-KE', { dateStyle: 'full', timeZone: 'Africa/Nairobi' }).format(nairobiDate(date, time))} at {time}.
                  We will confirm on {form.phone}.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/menu"><Button variant="primary">See the menu</Button></Link>
                  <Button variant="outline" onClick={() => { setStatus('idle'); setForm({ name: '', phone: '', email: '', notes: '' }); }}>
                    Make another booking
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="r-date" className={label}>Date</label>
                    <Input id="r-date" type="date" min={todayInNairobi()} value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="r-time" className={label}>Time</label>
                    <select id="r-time" className={select} value={time} onChange={(e) => setTime(e.target.value)} required>
                      {timeOptions.length === 0 && <option value="">No times left today</option>}
                      {timeOptions.map((t) => <option key={t} value={t} className="text-black">{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="r-party" className={label}>Guests</label>
                    <select id="r-party" className={select} value={party} onChange={(e) => setParty(Number(e.target.value))}>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n} className="text-black">{n}</option>)}
                    </select>
                  </div>
                </div>

                {outlets.length > 1 && (
                  <div className="space-y-2">
                    <label htmlFor="r-outlet" className={label}>Branch</label>
                    <select id="r-outlet" className={select} value={outletId} onChange={(e) => setOutletId(e.target.value)}>
                      {outlets.map((o) => <option key={o.id} value={o.id} className="text-black">{o.name}</option>)}
                    </select>
                  </div>
                )}

                {free !== null && (
                  <p className={`rounded-2xl px-5 py-3 text-sm font-semibold ${free > 0 ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}`} aria-live="polite">
                    {free > 0
                      ? `${free} ${free === 1 ? 'table' : 'tables'} free for ${party} at ${time}.`
                      : `We look full for ${party} at ${time}. Try another time, or book and we will call you with options.`}
                  </p>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="r-name" className={label}>Name</label>
                    <Input id="r-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="r-phone" className={label}>Phone</label>
                    <Input id="r-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07xx xxx xxx" required pattern="[0-9+ ]{9,15}" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="r-email" className={label}>Email (optional)</label>
                  <Input id="r-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="r-notes" className={label}>Anything we should know? (optional)</label>
                  <textarea
                    id="r-notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Birthday, high chair, quiet corner..."
                    className="w-full rounded-2xl border border-white/15 bg-white/5 p-4 text-white placeholder:text-brand-beige/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  />
                </div>

                {status === 'error' && <p className="text-sm font-semibold text-red-300" role="alert">{error}</p>}

                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={status === 'submitting' || !tenantId || !outletId || timeOptions.length === 0}>
                  {status === 'submitting' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Book the table'}
                </Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
