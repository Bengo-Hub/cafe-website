'use client';

import { Button, Card, Input } from '@/components/ui';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { TrackingIframeModal } from '@bengo-hub/shared-ui-lib';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('id');
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [trackingOpen, setTrackingOpen] = useState(!!initialOrderId);
  const [trackingCode, setTrackingCode] = useState(initialOrderId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setTrackingCode(orderId);
    setTrackingOpen(true);
  };

  return (
    <main className="min-h-screen bg-brand-cream dark:bg-brand-dark pt-32 pb-20 px-4 transition-colors duration-500">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">
            <span>Order Status</span>
          </div>
          <h1 className="text-5xl font-black text-primary-brand tracking-tighter mb-4">
            Track Your <span className="text-brand-orange">Order</span>
          </h1>
          <p className="text-xl font-light text-secondary-brand">
            Enter your order ID to see real-time updates on your delivery.
          </p>
        </div>

        <Card className="p-8 magical-card border-none">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-brand/60" htmlFor="orderId">
                Order ID
              </label>
              <div className="relative">
                <Input
                  id="orderId"
                  placeholder="e.g. ORD-7281"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                  className="h-16 rounded-2xl bg-white/50 dark:bg-brand-dark/50 border-brand-beige/20 focus:border-brand-orange px-6 text-lg font-bold"
                />
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-brand-orange/40" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-16 rounded-2xl text-sm font-black uppercase tracking-widest bg-brand-orange hover:bg-brand-orange/90 text-white shadow-xl shadow-brand-orange/20 transition-all"
            >
              Track Order
            </Button>
          </form>
        </Card>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="h-12 w-12 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto">
              <div className="h-2 w-2 rounded-full bg-brand-orange" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-widest text-primary-brand">Real-time</h3>
            <p className="text-xs text-secondary-brand font-light">Live GPS tracking of your rider</p>
          </div>
          <div className="space-y-2">
            <div className="h-12 w-12 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto">
              <div className="h-2 w-2 rounded-full bg-brand-orange" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-widest text-primary-brand">Accurate</h3>
            <p className="text-xs text-secondary-brand font-light">Precise ETA based on traffic</p>
          </div>
          <div className="space-y-2">
            <div className="h-12 w-12 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto">
              <div className="h-2 w-2 rounded-full bg-brand-orange" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-widest text-primary-brand">Seamless</h3>
            <p className="text-xs text-secondary-brand font-light">Integrated with our kitchen</p>
          </div>
        </div>
      </div>

      {trackingCode && (
        <TrackingIframeModal
          open={trackingOpen}
          onOpenChange={setTrackingOpen}
          trackingCode={trackingCode}
        />
      )}
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
