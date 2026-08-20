'use client';

import { Button } from '@/components/ui';
import { useCreateBooking, type BookingInput, type CatalogEvent } from '@/hooks/use-events';
import { type TicketTier } from '@/lib/api/events';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, ChevronRight, Loader2, Tag, Users, X } from 'lucide-react';
import { useState } from 'react';
import { PhoneInputField } from '@bengo-hub/shared-ui-lib/contact';

interface Props {
  event: CatalogEvent;
  onClose: () => void;
}

interface StepDateTimeData {
  scheduledFor: string;
  timeSlot: string;
}

interface StepPartyData {
  name: string;
  email: string;
  phone: string;
  partySize: number;
  occasion: string;
  specialRequests: string;
}

const OCCASIONS = ['Birthday', 'Anniversary', 'Business Meeting', 'Date Night', 'Family Gathering', 'Other'];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

export function BookingModal({ event, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dateTime, setDateTime] = useState<StepDateTimeData>({ scheduledFor: '', timeSlot: '12:00' });
  const [party, setParty] = useState<StepPartyData>({ name: '', email: '', phone: '', partySize: 2, occasion: '', specialRequests: '' });
  const [confirmedOrder, setConfirmedOrder] = useState<{ orderNumber: string } | null>(null);

  const tiers = (event.metadata?.ticket_tiers ?? []) as TicketTier[];
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(tiers.length > 0 ? tiers[0] : null);
  const unitPrice = selectedTier?.price ?? event.basePrice;

  const createBooking = useCreateBooking();
  const isPaid = unitPrice > 0;

  function buildScheduledFor() {
    if (!dateTime.scheduledFor) return '';
    return `${dateTime.scheduledFor}T${dateTime.timeSlot}:00Z`;
  }

  async function handleSubmit() {
    if (createBooking.isPending) return;
    const input: BookingInput = {
      eventSku: event.sku,
      eventName: event.name,
      unitPrice: unitPrice,
      contactName: party.name,
      contactEmail: party.email,
      contactPhone: party.phone,
      partySize: party.partySize,
      scheduledFor: buildScheduledFor(),
      specialRequests: party.specialRequests,
      occasion: party.occasion,
    };
    const order = await createBooking.mutateAsync(input);
    setConfirmedOrder({ orderNumber: order.orderNumber });
    setStep(3);
  }

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
                <h2 className="text-xl font-black text-white tracking-tight">{event.name}</h2>
                <p className="text-xs text-brand-orange font-bold uppercase tracking-widest mt-1">
                  {step < 3 ? `Step ${step} of 2` : 'Confirmed!'}
                </p>
              </div>
              <button onClick={onClose} className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-6">
                  {/* Ticket tier selection */}
                  {tiers.length > 0 && (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-3">
                        <Tag className="inline h-3 w-3 mr-1" /> Ticket Tier
                      </label>
                      <div className="space-y-2">
                        {tiers.map((tier) => {
                          const isSelected = selectedTier?.name === tier.name;
                          return (
                            <button
                              key={tier.name}
                              onClick={() => setSelectedTier(tier)}
                              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all text-left ${
                                isSelected
                                  ? 'bg-brand-orange/15 border-brand-orange/60 ring-1 ring-brand-orange/40'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-brand-orange' : 'border-white/30'}`}>
                                  {isSelected && <div className="h-2 w-2 rounded-full bg-brand-orange" />}
                                </div>
                                <div>
                                  <p className="font-black text-white text-sm">{tier.name}</p>
                                  <p className="text-xs text-white/50 mt-0.5">{tier.capacity} slots available</p>
                                </div>
                              </div>
                              <span className="font-black text-brand-orange text-base">{event.currency} {tier.price.toLocaleString()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-3">
                      <CalendarDays className="inline h-3 w-3 mr-1" /> Date
                    </label>
                    <input
                      type="date"
                      value={dateTime.scheduledFor}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDateTime((d) => ({ ...d, scheduledFor: e.target.value }))}
                      className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-orange/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-3">Time Slot</label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setDateTime((d) => ({ ...d, timeSlot: slot }))}
                          className={`h-11 rounded-xl text-sm font-bold transition-all ${dateTime.timeSlot === slot ? 'bg-brand-orange text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!dateTime.scheduledFor}
                    className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs"
                  >
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">Your Name</label>
                      <input type="text" value={party.name} onChange={(e) => setParty((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-orange/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">Phone</label>
                      <PhoneInputField
                        value={party.phone}
                        onChange={(v) => setParty((p) => ({ ...p, phone: v }))}
                        className="phone-input-dark-glass !h-12 !rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">Email</label>
                      <input type="email" value={party.email} onChange={(e) => setParty((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-orange/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                        <Users className="inline h-3 w-3 mr-1" /> Party Size
                      </label>
                      <input type="number" min={1} max={20} value={party.partySize} onChange={(e) => setParty((p) => ({ ...p, partySize: Number(e.target.value) }))} className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-orange/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">Occasion</label>
                      <select value={party.occasion} onChange={(e) => setParty((p) => ({ ...p, occasion: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-orange/50">
                        <option value="">Select…</option>
                        {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">Special Requests</label>
                    <textarea value={party.specialRequests} onChange={(e) => setParty((p) => ({ ...p, specialRequests: e.target.value }))} placeholder="Dietary needs, preferred seating, etc." rows={2} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-orange/50 resize-none" />
                  </div>
                  {isPaid && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-orange/10 border border-brand-orange/20">
                      <div>
                        <span className="text-sm font-bold text-white">Total</span>
                        {selectedTier && (
                          <p className="text-xs text-white/50 mt-0.5">{selectedTier.name} × {party.partySize}</p>
                        )}
                      </div>
                      <span className="text-xl font-black text-brand-orange">{event.currency} {(unitPrice * party.partySize).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-xs">Back</Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!party.name || !party.phone || createBooking.isPending}
                      className="flex-2 flex-1 h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs"
                    >
                      {createBooking.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : isPaid ? 'Pay & Book' : 'Confirm Booking'}
                    </Button>
                  </div>
                  {createBooking.isError && (
                    <p className="text-sm text-red-400 text-center">{createBooking.error?.message ?? 'Booking failed. Please try again.'}</p>
                  )}
                </motion.div>
              )}

              {step === 3 && confirmedOrder && (
                <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center space-y-6">
                  <div className="mx-auto h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Booking Confirmed!</h3>
                    <p className="text-brand-orange font-bold text-lg">#{confirmedOrder.orderNumber}</p>
                    <p className="text-white/60 text-sm mt-3 font-light">
                      We&apos;ve received your booking for <strong className="text-white">{event.name}</strong> on {dateTime.scheduledFor} at {dateTime.timeSlot}. A confirmation will be sent to {party.email || party.phone}.
                    </p>
                  </div>
                  <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs">
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
