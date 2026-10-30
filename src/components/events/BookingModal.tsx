'use client';

import { Field, FormNotice, inputClass, textareaClass } from '@/components/site';
import { useCreateBooking, type BookingInput, type CatalogEvent } from '@/hooks/use-events';
import { type TicketTier } from '@/lib/api/events';
import { PhoneInputField } from '@bengo-hub/shared-ui-lib/contact';
import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  event: CatalogEvent;
  onClose: () => void;
}

const OCCASIONS = ['Birthday', 'Anniversary', 'Business meeting', 'Date night', 'Family gathering', 'Other'];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

/** The event's own date and time in Busia time, when it is a one-off with a fixed start. */
function fixedStart(event: CatalogEvent): { date: string; time: string } | null {
  const src = event.eventStartAt || event.scheduledFor;
  if (!src || event.metadata?.is_recurring) return null;
  const d = new Date(src);
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(d);
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
  return { date, time };
}

export function BookingModal({ event, onClose }: Props) {
  const fixed = fixedStart(event);
  const [step, setStep] = useState<1 | 2 | 3>(fixed ? 2 : 1);
  const [date, setDate] = useState(fixed?.date ?? '');
  const [time, setTime] = useState(fixed?.time ?? '12:00');
  const [party, setParty] = useState({ name: '', email: '', phone: '', partySize: 2, occasion: '', specialRequests: '' });
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const tiers = (event.metadata?.ticket_tiers ?? []) as TicketTier[];
  const [tier, setTier] = useState<TicketTier | null>(tiers[0] ?? null);
  const unitPrice = tier?.price ?? event.basePrice;
  const isPaid = unitPrice > 0;
  const createBooking = useCreateBooking();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit() {
    if (createBooking.isPending) return;
    const input: BookingInput = {
      eventSku: event.sku,
      eventName: event.name,
      unitPrice,
      contactName: party.name,
      contactEmail: party.email,
      contactPhone: party.phone,
      partySize: party.partySize,
      // Busia time (UTC+3); the chosen time is local, never UTC.
      scheduledFor: date ? `${date}T${time}:00+03:00` : '',
      specialRequests: party.specialRequests,
      occasion: party.occasion,
    };
    const order = await createBooking.mutateAsync(input);
    setOrderNumber(order.orderNumber);
    setStep(3);
  }

  const primary = 'inline-flex h-12 items-center justify-center gap-2 rounded-md bg-loft px-5 text-[15px] font-semibold text-white hover:bg-loft-deep disabled:opacity-60';
  const secondary = 'inline-flex h-12 items-center justify-center rounded-md border border-ink/25 px-5 text-[15px] font-semibold text-ink hover:border-ink';

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="booking-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-lg bg-paper sm:rounded-lg">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <h2 id="booking-title" className="font-display text-3xl leading-none text-ink">{event.name}</h2>
            <p className="mt-1 text-sm text-ink-soft">{step === 3 ? 'Booked' : fixed ? 'Your details' : `Step ${step} of 2`}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-ink-soft hover:bg-leaf hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-5 p-5">
            {tiers.length > 0 && (
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">Ticket</legend>
                <div className="space-y-2">
                  {tiers.map((t) => (
                    <label key={t.name} className={`flex cursor-pointer items-center justify-between rounded-md border px-4 py-3 ${tier?.name === t.name ? 'border-ink bg-leaf' : 'border-line'}`}>
                      <span className="flex items-center gap-3">
                        <input type="radio" name="tier" checked={tier?.name === t.name} onChange={() => setTier(t)} className="accent-[#ea8022]" />
                        <span className="text-[15px] text-ink">{t.name}</span>
                      </span>
                      <span className="tabular-nums text-[15px] font-semibold text-ink">{event.currency} {t.price.toLocaleString()}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <Field id="b-date" label="Date">
              <input id="b-date" type="date" className={inputClass} value={date} min={new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(new Date())} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field id="b-time" label="Time">
              <select id="b-time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)}>
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <button type="button" onClick={() => setStep(2)} disabled={!date} className={`${primary} w-full`}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 p-5">
            {fixed && tiers.length > 1 && (
              <Field id="b-tier" label="Ticket">
                <select id="b-tier" className={inputClass} value={tier?.name ?? ''} onChange={(e) => setTier(tiers.find((t) => t.name === e.target.value) ?? null)}>
                  {tiers.map((t) => (
                    <option key={t.name} value={t.name}>{t.name}, {event.currency} {t.price.toLocaleString()}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field id="b-name" label="Name">
              <input id="b-name" className={inputClass} value={party.name} onChange={(e) => setParty((p) => ({ ...p, name: e.target.value }))} autoComplete="name" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="b-phone" label="Phone">
                <PhoneInputField value={party.phone} onChange={(v) => setParty((p) => ({ ...p, phone: v }))} className="!h-12" />
              </Field>
              <Field id="b-email" label="Email (optional)">
                <input id="b-email" type="email" className={inputClass} value={party.email} onChange={(e) => setParty((p) => ({ ...p, email: e.target.value }))} autoComplete="email" />
              </Field>
              <Field id="b-size" label="People">
                <input id="b-size" type="number" min={1} max={20} className={inputClass} value={party.partySize} onChange={(e) => setParty((p) => ({ ...p, partySize: Math.max(1, Number(e.target.value) || 1) }))} />
              </Field>
              <Field id="b-occasion" label="Occasion (optional)">
                <select id="b-occasion" className={inputClass} value={party.occasion} onChange={(e) => setParty((p) => ({ ...p, occasion: e.target.value }))}>
                  <option value="">None</option>
                  {OCCASIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field id="b-notes" label="Anything we should know? (optional)">
              <textarea id="b-notes" rows={2} className={textareaClass} value={party.specialRequests} onChange={(e) => setParty((p) => ({ ...p, specialRequests: e.target.value }))} placeholder="Allergies, seating, a cake" />
            </Field>
            {isPaid && (
              <p className="flex items-baseline justify-between border-y border-line py-3 text-[15px]">
                <span className="text-ink-soft">
                  {tier ? `${tier.name} x ${party.partySize}` : `${party.partySize} x ${event.currency} ${unitPrice.toLocaleString()}`}
                </span>
                <span className="font-display text-2xl tabular-nums text-ink">{event.currency} {(unitPrice * party.partySize).toLocaleString()}</span>
              </p>
            )}
            {createBooking.isError && <FormNotice tone="error">{createBooking.error?.message ?? 'The booking did not go through. Try again.'}</FormNotice>}
            <div className="flex gap-3">
              {!fixed && (
                <button type="button" onClick={() => setStep(1)} className={`${secondary} flex-1`}>
                  Back
                </button>
              )}
              <button type="button" onClick={submit} disabled={!party.name || !party.phone || createBooking.isPending} className={`${primary} flex-[2]`}>
                {createBooking.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {isPaid ? 'Book and pay' : 'Book my place'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && orderNumber && (
          <div className="space-y-5 p-5">
            <FormNotice tone="ok">
              Booked for {event.name} on {date} at {time}. Your booking number is {orderNumber}. We will send the details to {party.email || party.phone}.
            </FormNotice>
            <button type="button" onClick={onClose} className={`${primary} w-full`}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
