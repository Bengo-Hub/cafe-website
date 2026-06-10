'use client';

import { Button } from '@/components/ui/Button';
import { useLimitModal } from '@/store/limit-modal';
import { useSubscription } from '@/hooks/use-subscription';

const SUBSCRIBE_URL =
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_UI_URL || 'https://pricing.codevertexitsolutions.com';

const prettyMetric = (m: string) => m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Global limit-reached modal for the cafe staff dashboard. Opened imperatively (via
 * useLimitModal) when any service call returns 402/429 with a structured limit body.
 * Exempt users (platform owner / demo / service-charge) never see it.
 */
export function LimitReachedModal() {
  const { open, info, close } = useLimitModal();
  const { isPlatformOwner, isDemo, isServiceCharge } = useSubscription();

  if (!open || !info || isPlatformOwner || isDemo || isServiceCharge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative z-50 w-full max-w-sm mx-4 rounded-xl border border-gray-200 bg-white shadow-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{prettyMetric(info.metric)} limit reached</h2>
        <p className="text-sm text-gray-600">
          Your plan allows <span className="font-semibold">{info.limit.toLocaleString()}</span>{' '}
          {prettyMetric(info.metric).toLowerCase()}
          {info.used ? (
            <>
              {' '}and you&apos;ve used <span className="font-semibold">{info.used.toLocaleString()}</span>
            </>
          ) : null}
          .{' '}
          {info.overageEligible
            ? 'Enable extra usage or upgrade your plan to continue.'
            : 'Upgrade your plan to raise this limit.'}
        </p>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={close}>
            Not now
          </Button>
          <a
            href={info.upgradeUrl || `${SUBSCRIBE_URL}/subscribe`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            {info.overageEligible ? 'Manage plan' : 'Upgrade plan'}
          </a>
        </div>
      </div>
    </div>
  );
}
