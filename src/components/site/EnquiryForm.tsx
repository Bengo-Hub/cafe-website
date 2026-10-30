'use client';

import { enquiryLines, sendEnquiry } from '@/lib/api/enquiry';
import { Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Field, FormNotice, inputClass, textareaClass } from './index';

/**
 * One enquiry form for every "ask us" on the site (events, rooms, work hub, franchise, contact). It
 * emails the cafe through /api/contact; `subject` says what the enquiry is about.
 */
export function EnquiryForm({
  subject,
  dateLabel,
  guestsLabel,
  messageLabel = 'Message',
  messagePlaceholder,
  submitLabel = 'Send enquiry',
  sentText = 'Thanks. We have your message and will reply by email or phone.',
}: {
  subject: string;
  /** Show a date field with this label (for example "Event date"). */
  dateLabel?: string;
  /** Show a number field with this label (for example "Guests"). */
  guestsLabel?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  sentText?: string;
}) {
  const empty = { name: '', email: '', phone: '', date: '', guests: '', message: '' };
  const [f, setF] = useState(empty);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const id = subject.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await sendEnquiry({
        name: f.name.trim(),
        email: f.email.trim(),
        subject,
        message: enquiryLines({
          Phone: f.phone,
          ...(dateLabel ? { [dateLabel]: f.date } : {}),
          ...(guestsLabel ? { [guestsLabel]: f.guests } : {}),
          [messageLabel]: f.message,
        }),
      });
      setStatus('sent');
      setF(empty);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'The message did not send. Try again, or call us.');
    }
  };

  if (status === 'sent') {
    return <FormNotice tone="ok">{sentText}</FormNotice>;
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${id}-name`} label="Name">
          <input id={`${id}-name`} className={inputClass} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required autoComplete="name" />
        </Field>
        <Field id={`${id}-phone`} label="Phone">
          <input id={`${id}-phone`} type="tel" className={inputClass} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} required autoComplete="tel" placeholder="07xx xxx xxx" />
        </Field>
      </div>
      <Field id={`${id}-email`} label="Email">
        <input id={`${id}-email`} type="email" className={inputClass} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required autoComplete="email" />
      </Field>
      {(dateLabel || guestsLabel) && (
        <div className="grid gap-5 sm:grid-cols-2">
          {dateLabel && (
            <Field id={`${id}-date`} label={dateLabel}>
              <input id={`${id}-date`} type="date" className={inputClass} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
            </Field>
          )}
          {guestsLabel && (
            <Field id={`${id}-guests`} label={guestsLabel}>
              <input id={`${id}-guests`} type="number" min={1} inputMode="numeric" className={inputClass} value={f.guests} onChange={(e) => setF({ ...f, guests: e.target.value })} />
            </Field>
          )}
        </div>
      )}
      <Field id={`${id}-message`} label={messageLabel}>
        <textarea id={`${id}-message`} rows={4} className={textareaClass} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required placeholder={messagePlaceholder} />
      </Field>
      {status === 'error' && <FormNotice tone="error">{error}</FormNotice>}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-loft px-6 text-[15px] font-semibold text-white hover:bg-loft-deep disabled:opacity-60"
      >
        {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {status === 'sending' ? 'Sending' : submitLabel}
      </button>
    </form>
  );
}
