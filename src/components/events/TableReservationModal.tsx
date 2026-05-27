'use client';

import { Button } from '@/components/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, ChevronRight, Loader2, Users, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onClose: () => void;
}

const OCCASIONS = ['Birthday', 'Anniversary', 'Business Meeting', 'Date Night', 'Family Gathering', 'Other'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

const VERA_API = 'https://marketflowai.codevertexitsolutions.com';
const WA_NUMBER = '254712345678';

export function TableReservationModal({ onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dateVal, setDateVal] = useState('');
  const [timeSlot, setTimeSlot] = useState('12:00');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', partySize: 2, occasion: '', specialRequests: '',
  });
  const [submitting, setSubmitting] = useState(false);

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
          message: `Table reservation: ${form.partySize} guest(s) on ${dateVal} at ${timeSlot}. Occasion: ${form.occasion || 'N/A'}. Requests: ${form.specialRequests || 'None'}`,
        }),
      });
    } catch {
      // fire-and-forget — show confirmation regardless
    } finally {
      setSubmitting(false);
    }
    setStep(3);
  }

  const waText = encodeURIComponent(
    `Hi! I just reserved a table for ${form.partySize} guest(s) on ${dateVal} at ${timeSlot}. My name is ${form.name}.`,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="electrical-border rounded-[2.5rem]">
          <div className="rounded-[2.5rem] bg-brand-dark/95 backdrop-blur-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Reserve a Table</h2>
                <p className="text-xs text-brand-orange font-bold uppercase tracking-widest mt-1">
                  {step < 3 ? `Step ${step} of 2` : 'Requested!'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: date + time */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-3">
                      <CalendarDays className="inline h-3 w-3 mr-1" /> Date
                    </label>
                    <input
                      type="date"
                      value={dateVal}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDateVal(e.target.value)}
                      className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-orange/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-3">Time Slot</label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setTimeSlot(slot)}
                          className={`h-11 rounded-xl text-sm font-bold transition-all ${
                            timeSlot === slot
                              ? 'bg-brand-orange text-white'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!dateVal}
                    className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs"
                  >
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: contact details */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">Your Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Full name"
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-orange/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+254 7XX…"
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-orange/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="you@example.com"
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-orange/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                        <Users className="inline h-3 w-3 mr-1" /> Party Size
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={form.partySize}
                        onChange={(e) => setForm((f) => ({ ...f, partySize: Number(e.target.value) }))}
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-orange/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">Occasion</label>
                      <select
                        value={form.occasion}
                        onChange={(e) => setForm((f) => ({ ...f, occasion: e.target.value }))}
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-orange/50"
                      >
                        <option value="">Select…</option>
                        {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">Special Requests</label>
                    <textarea
                      value={form.specialRequests}
                      onChange={(e) => setForm((f) => ({ ...f, specialRequests: e.target.value }))}
                      placeholder="Dietary needs, preferred seating, high chair, etc."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-orange/50 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!form.name || !form.phone || submitting}
                      className="flex-1 h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs"
                    >
                      {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Reservation'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: confirmation */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center space-y-6">
                  <div className="mx-auto h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Reservation Requested!</h3>
                    <p className="text-white/60 text-sm mt-3 font-light leading-relaxed">
                      Thank you, <strong className="text-white">{form.name}</strong>! Your table for{' '}
                      <strong className="text-brand-orange">{form.partySize} {form.partySize === 1 ? 'person' : 'people'}</strong>{' '}
                      on <strong className="text-brand-orange">{dateVal}</strong> at{' '}
                      <strong className="text-brand-orange">{timeSlot}</strong> has been received.
                      Our team will confirm via <strong className="text-white">{form.phone}</strong> within 30 minutes.
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
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-xs"
                  >
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
