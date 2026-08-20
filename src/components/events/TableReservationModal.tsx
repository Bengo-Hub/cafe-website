'use client';

import { Button } from '@/components/ui';
import { useOutlets } from '@/hooks/use-outlets';
import type { CatalogEvent } from '@/lib/api/events';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CalendarDays, CheckCircle2, ChevronRight, Loader2, MapPin, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PhoneInputField } from '@bengo-hub/shared-ui-lib/contact';

interface Props {
  onClose: () => void;
  selectedEvent?: Pick<CatalogEvent, 'name' | 'scheduledFor' | 'sku'>;
}

const OCCASIONS = ['Birthday', 'Anniversary', 'Business', 'Date Night', 'Family', 'Other'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

const VERA_API = 'https://marketflowai.codevertexafrica.com';
const WA_NUMBER = '254712345678';

const inputCls =
  'w-full h-12 px-4 rounded-xl bg-brand-light/60 dark:bg-white/5 border border-brand-beige/40 dark:border-white/10 text-brand-dark dark:text-white placeholder:text-brand-muted/50 dark:placeholder:text-white/30 focus:outline-none focus:border-brand-orange/50 transition-all';
const labelCls = 'block text-xs font-black uppercase tracking-widest text-secondary-brand mb-2';

export function TableReservationModal({ onClose, selectedEvent }: Props) {
  const { data: outlets = [], isLoading: outletsLoading } = useOutlets();
  const multiOutlet = outlets.length > 1;

  // step 1 = outlet (skipped when ≤1 outlet), 2 = date/time, 3 = contact, 4 = confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedOutlet, setSelectedOutlet] = useState<typeof outlets[0] | null>(null);
  const [dateVal, setDateVal] = useState('');
  const [timeSlot, setTimeSlot] = useState('12:00');
  const [form, setForm] = useState({ name: '', email: '', phone: '', partySize: 2, occasion: '', specialRequests: '' });
  const [submitting, setSubmitting] = useState(false);

  // Auto-advance past outlet step when not needed
  useEffect(() => {
    if (!outletsLoading && step === 1) {
      if (outlets.length === 0) {
        setStep(2);
      } else if (outlets.length === 1) {
        setSelectedOutlet(outlets[0]);
        setStep(2);
      }
    }
  }, [outletsLoading, outlets, step]);

  // Pre-fill date/time from event's scheduledFor
  useEffect(() => {
    if (selectedEvent?.scheduledFor) {
      const d = new Date(selectedEvent.scheduledFor);
      setDateVal(d.toISOString().split('T')[0]);
      const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      setTimeSlot(TIME_SLOTS.find((s) => s >= hhmm) ?? '12:00');
    }
  }, [selectedEvent]);

  const totalSteps = multiOutlet ? 3 : 2;
  const uiStep = multiOutlet ? step : step - 1;
  const stepLabel = step < 4 ? `Step ${uiStep} of ${totalSteps}` : 'Confirmed!';

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch(`${VERA_API}/api/v1/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': 'urban-loft' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          source: 'table_reservation_widget',
          message: `Table reservation${selectedEvent ? ` for "${selectedEvent.name}"` : ''}${selectedOutlet ? ` at ${selectedOutlet.name}` : ''}: ${form.partySize} guest(s) on ${dateVal} at ${timeSlot}. Occasion: ${form.occasion || 'N/A'}. Requests: ${form.specialRequests || 'None'}`,
        }),
      });
    } catch { /* fire-and-forget */ } finally {
      setSubmitting(false);
    }
    setStep(4);
  }

  const waText = encodeURIComponent(
    `Hi! I just reserved a table${selectedEvent ? ` for the "${selectedEvent.name}" event` : ''}${selectedOutlet ? ` at ${selectedOutlet.name}` : ''} for ${form.partySize} guest(s) on ${dateVal} at ${timeSlot}. My name is ${form.name}.`,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-brand-dark/70 dark:bg-brand-dark/80 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="electrical-border rounded-[2.5rem]">
          <div className="rounded-[2.5rem] bg-brand-light dark:bg-[#1a0f01] backdrop-blur-2xl border border-brand-beige/30 dark:border-white/10 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-brand-beige/20 dark:border-white/10">
              <div>
                <h2 className="text-xl font-black text-primary-brand tracking-tight">Reserve a Table</h2>
                {selectedEvent && (
                  <p className="text-xs text-brand-orange font-bold mt-0.5 truncate max-w-[220px]">{selectedEvent.name}</p>
                )}
                <p className="text-xs text-brand-orange font-bold uppercase tracking-widest mt-1">{stepLabel}</p>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-xl bg-brand-dark/5 dark:bg-white/5 hover:bg-brand-dark/10 dark:hover:bg-white/10 flex items-center justify-center text-brand-muted dark:text-white/60 hover:text-brand-dark dark:hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <AnimatePresence mode="wait">

              {/* Step 1: Outlet selection */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8">
                  {outletsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 text-brand-orange animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-secondary-brand font-medium">Which branch would you like to book at?</p>
                      <div className="space-y-3">
                        {outlets.map((outlet) => (
                          <button
                            key={outlet.id}
                            onClick={() => { setSelectedOutlet(outlet); setStep(2); }}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-brand-beige/20 dark:bg-white/5 border border-brand-beige/30 dark:border-white/10 hover:border-brand-orange/50 hover:bg-brand-orange/5 transition-all text-left"
                          >
                            <div className="p-3 rounded-xl bg-brand-orange/10 flex-shrink-0">
                              <Building2 className="h-5 w-5 text-brand-orange" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-primary-brand">{outlet.name}</p>
                              {outlet.address && (
                                <p className="text-xs text-secondary-brand mt-0.5 flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />{outlet.address}
                                </p>
                              )}
                            </div>
                            {outlet.isOpen !== undefined && (
                              <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${outlet.isOpen ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-500 dark:text-red-400'}`}>
                                {outlet.isOpen ? 'Open' : 'Closed'}
                              </span>
                            )}
                            <ChevronRight className="h-4 w-4 text-brand-muted flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Date + time */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-6">
                  {selectedOutlet && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-orange/5 border border-brand-orange/20">
                      <Building2 className="h-4 w-4 text-brand-orange flex-shrink-0" />
                      <span className="text-sm font-bold text-brand-orange truncate">{selectedOutlet.name}</span>
                    </div>
                  )}
                  <div>
                    <label className={labelCls}><CalendarDays className="inline h-3 w-3 mr-1" />Date</label>
                    <input
                      type="date"
                      value={dateVal}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDateVal(e.target.value)}
                      className={`${inputCls} h-14`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Time Slot</label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setTimeSlot(slot)}
                          className={`h-11 rounded-xl text-sm font-bold transition-all ${
                            timeSlot === slot
                              ? 'bg-brand-orange text-white'
                              : 'bg-brand-beige/30 dark:bg-white/5 text-brand-muted dark:text-white/60 border border-brand-beige/40 dark:border-white/10 hover:border-brand-orange/50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {multiOutlet && (
                      <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-14 rounded-2xl border-brand-beige/30 dark:border-white/10 bg-transparent text-primary-brand font-black uppercase tracking-widest text-xs">
                        Back
                      </Button>
                    )}
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!dateVal}
                      className="flex-1 h-14 rounded-2xl bg-brand-orange hover:bg-brand-burnt text-white font-black uppercase tracking-widest text-xs"
                    >
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact details */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelCls}>Your Name</label>
                      <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <PhoneInputField
                        value={form.phone}
                        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                        className="phone-input-dual-theme !h-12 !rounded-xl"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}><Users className="inline h-3 w-3 mr-1" />Party Size</label>
                      <input type="number" min={1} max={20} value={form.partySize} onChange={(e) => setForm((f) => ({ ...f, partySize: Number(e.target.value) }))} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Occasion (optional)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {OCCASIONS.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, occasion: f.occasion === o ? '' : o }))}
                          className={`h-10 rounded-xl text-xs font-bold transition-all ${
                            form.occasion === o
                              ? 'bg-brand-orange text-white'
                              : 'bg-brand-beige/30 dark:bg-white/5 text-brand-muted dark:text-white/60 border border-brand-beige/40 dark:border-white/10 hover:border-brand-orange/50 hover:text-brand-dark dark:hover:text-white'
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Special Requests</label>
                    <textarea
                      value={form.specialRequests}
                      onChange={(e) => setForm((f) => ({ ...f, specialRequests: e.target.value }))}
                      placeholder="Dietary needs, preferred seating, high chair, etc."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-brand-light/60 dark:bg-white/5 border border-brand-beige/40 dark:border-white/10 text-brand-dark dark:text-white placeholder:text-brand-muted/50 dark:placeholder:text-white/30 focus:outline-none focus:border-brand-orange/50 resize-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setStep(2)} variant="outline" className="flex-1 h-14 rounded-2xl border-brand-beige/30 dark:border-white/10 bg-transparent text-primary-brand font-black uppercase tracking-widest text-xs">
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!form.name || !form.phone || submitting}
                      className="flex-1 h-14 rounded-2xl bg-brand-orange hover:bg-brand-burnt text-white font-black uppercase tracking-widest text-xs"
                    >
                      {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Reservation'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center space-y-6">
                  <div className="mx-auto h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-primary-brand mb-2">Reservation Requested!</h3>
                    <p className="text-secondary-brand text-sm mt-3 font-light leading-relaxed">
                      Thank you, <strong className="text-primary-brand">{form.name}</strong>! Your table for{' '}
                      <strong className="text-brand-orange">{form.partySize} {form.partySize === 1 ? 'person' : 'people'}</strong>
                      {selectedOutlet && <>{' '}at <strong className="text-brand-orange">{selectedOutlet.name}</strong></>}
                      {' '}on <strong className="text-brand-orange">{dateVal}</strong> at{' '}
                      <strong className="text-brand-orange">{timeSlot}</strong>
                      {selectedEvent && <>{' '}for <strong className="text-brand-orange">{selectedEvent.name}</strong></>}
                      {' '}has been received. Our team will confirm via{' '}
                      <strong className="text-primary-brand">{form.phone}</strong> within 30 minutes.
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs transition-all w-full"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Confirm on WhatsApp
                  </a>
                  <Button onClick={onClose} variant="outline" className="w-full h-12 rounded-xl border-brand-beige/30 dark:border-white/10 bg-transparent text-primary-brand font-black uppercase tracking-widest text-xs">
                    Done
                  </Button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
