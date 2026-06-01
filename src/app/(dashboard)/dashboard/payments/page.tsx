'use client';

import { Button, Card } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth-store';
import { getTenantSlug } from '@/lib/api/client';
import { usePosSettings } from '@/hooks/use-pos-settings';
import {
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const TREASURY_UI_URL =
  process.env.NEXT_PUBLIC_TREASURY_UI_URL || 'https://books.codevertexitsolutions.com';

type TreasuryView = 'dashboard' | 'transactions' | 'settlements';

const VIEWS: { value: TreasuryView; label: string; path: string }[] = [
  { value: 'dashboard', label: 'Overview', path: '/embed/dashboard' },
  { value: 'transactions', label: 'Transactions', path: '/embed/transactions' },
  { value: 'settlements', label: 'Settlements', path: '/embed/settlements' },
];

export default function PaymentsPage() {
  const [activeView, setActiveView] = useState<TreasuryView>('dashboard');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenantSlug = getTenantSlug();
  const { data: posSettings } = usePosSettings();

  const currentView = VIEWS.find((v) => v.value === activeView) ?? VIEWS[0];

  const iframeSrc = `${TREASURY_UI_URL}${currentView.path}?tenant=${encodeURIComponent(tenantSlug)}&embed=true`;

  // Listen for treasury postMessage events (e.g. navigation, errors)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data?.type?.startsWith('treasury:')) return;

      if (data.type === 'treasury:navigate') {
        // Treasury UI requests navigation within the embedded views
        const target = VIEWS.find((v) => v.path === data.path);
        if (target) setActiveView(target.value);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Send auth token to iframe once loaded
  useEffect(() => {
    if (iframeLoaded && iframeRef.current?.contentWindow && accessToken) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'treasury:auth', token: accessToken },
        TREASURY_UI_URL
      );
    }
  }, [iframeLoaded, accessToken]);

  const handleRefresh = useCallback(() => {
    setIframeLoaded(false);
    setIframeKey((k) => k + 1);
  }, []);

  const handleOpenExternal = useCallback(() => {
    window.open(
      `${TREASURY_UI_URL}/${tenantSlug}`,
      '_blank',
      'noopener,noreferrer'
    );
  }, [tenantSlug]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary-brand md:text-4xl">
            Payments
          </h1>
          <p className="font-light text-secondary-brand">
            View transactions, settlements, and payment activity via Treasury.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-brand-beige/10 text-primary-brand"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-brand-beige/10 text-primary-brand"
            onClick={handleOpenExternal}
          >
            <ExternalLink className="mr-2 h-4 w-4" /> Open Treasury
          </Button>
        </div>
      </header>

      {/* View tabs */}
      <div className="flex gap-2">
        {VIEWS.map((view) => (
          <button
            key={view.value}
            onClick={() => {
              setActiveView(view.value);
              setIframeLoaded(false);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
              activeView === view.value
                ? 'bg-foreground text-background'
                : 'bg-brand-beige/5 text-secondary-brand hover:bg-brand-beige/10'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Treasury iframe */}
      <Card className="relative overflow-hidden border border-brand-beige/10 p-0">
        {!iframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-brand-beige/5">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-brand-orange" />
            <p className="text-sm text-secondary-brand">Loading payment dashboard...</p>
          </div>
        )}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={iframeSrc}
          className="h-[70vh] w-full border-0"
          title={`Treasury ${currentView.label}`}
          onLoad={() => setIframeLoaded(true)}
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
        />
      </Card>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="flex items-center gap-4 border border-brand-beige/10 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10">
            <CreditCard className="h-6 w-6 text-brand-orange" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
              Payment Methods
            </p>
            <p className="text-sm text-primary-brand">
              {[
                posSettings?.mpesa_paybill && `M-PESA ${posSettings.mpesa_paybill}`,
                posSettings?.airtel_money_number && `Airtel Money ${posSettings.airtel_money_number}`,
                posSettings?.bank_account_number && posSettings.bank_name,
              ]
                .filter(Boolean)
                .join(', ') || 'M-Pesa, Card, Airtel Money, Bank Transfer'}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border border-brand-beige/10 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
            <Wallet className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
              Powered By
            </p>
            <p className="text-sm text-primary-brand">
              Treasury payment processing platform
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
