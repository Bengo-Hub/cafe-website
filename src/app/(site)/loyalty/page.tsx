'use client';

import { PageIntro, Section } from '@/components/site';
import { useAuth } from '@/hooks/use-auth';
import { useLoyaltyAccountByPhone, useLoyaltyPrograms, useLoyaltyTransactions } from '@/hooks/use-loyalty';
import { PhoneInputField } from '@bengo-hub/shared-ui-lib/contact';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function PhoneLookup({ onLookup }: { onLookup: (phone: string) => void }) {
  const [input, setInput] = useState('');
  return (
    <form
      className="flex max-w-lg flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        if (input.trim().length >= 9) onLookup(input.trim());
      }}
    >
      <div className="flex-1">
        <PhoneInputField value={input} onChange={setInput} placeholder="7XX XXX XXX" className="!h-12" />
      </div>
      <button
        type="submit"
        disabled={input.trim().length < 9}
        className="inline-flex h-12 items-center justify-center rounded-md bg-loft px-5 text-[15px] font-semibold text-white hover:bg-loft-deep disabled:opacity-60"
      >
        Check my points
      </button>
    </form>
  );
}

export default function LoyaltyPage() {
  const { isAuthenticated, user } = useAuth();
  const [lookupPhone, setLookupPhone] = useState<string | null>(null);

  const { data: programs = [], isLoading: programsLoading } = useLoyaltyPrograms();
  const program = programs[0] ?? null;
  const { data: account, isLoading: accountLoading } = useLoyaltyAccountByPhone(lookupPhone);
  const { data: transactions = [] } = useLoyaltyTransactions(account?.id ?? null);

  const tiers = program?.tiers ?? [];
  const rewards = program?.rewards ?? [];
  const tierIdx = account ? tiers.findIndex((t) => t.name === account.tier) : -1;
  const currentTier = tierIdx >= 0 ? tiers[tierIdx] : undefined;
  const nextTier = tierIdx >= 0 && tierIdx + 1 < tiers.length ? tiers[tierIdx + 1] : null;
  const balance = account?.points_balance ?? 0;
  const toNext = nextTier ? Math.max(0, nextTier.min_points - balance) : 0;
  const progress =
    currentTier && nextTier
      ? Math.min(100, ((balance - currentTier.min_points) / Math.max(1, nextTier.min_points - currentTier.min_points)) * 100)
      : 100;

  return (
    <>
      <PageIntro
        title="Loyalty rewards"
        lede="Give your phone number when you pay and you collect points on food, drinks and work hub passes. Spend them on your next visit."
      >
        {!isAuthenticated && (
          <>
            <Link href="/signup" className="inline-flex h-12 items-center rounded-md bg-loft px-5 text-[15px] font-semibold text-white hover:bg-loft-deep">
              Join
            </Link>
            <Link href="/login" className="inline-flex h-12 items-center rounded-md border border-ink/25 px-5 text-[15px] font-semibold text-ink hover:border-ink">
              Sign in
            </Link>
          </>
        )}
      </PageIntro>

      <Section tone="leaf" title={account ? `Hello, ${account.customer_name || user?.name || 'there'}` : 'Check your points'}>
        {account ? (
          <div className="max-w-2xl space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <p>
                <span className="font-display block text-6xl leading-none tabular-nums">{balance.toLocaleString()}</span>
                <span className="text-[15px] text-ink-soft">points, {account.tier} member</span>
              </p>
              {nextTier && <p className="text-[15px] text-ink-soft">{toNext.toLocaleString()} more points to reach {nextTier.name}</p>}
            </div>
            {nextTier && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-loft" style={{ width: `${progress}%` }} />
              </div>
            )}
            {transactions.length > 0 && (
              <ul className="divide-y divide-line border-y border-line">
                {transactions.slice(0, 5).map((tx) => (
                  <li key={tx.id} className="flex justify-between py-2.5 text-[15px]">
                    <span className="text-ink">{tx.description}</span>
                    <span className={`tabular-nums font-semibold ${tx.points > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                      {tx.points > 0 ? '+' : ''}
                      {tx.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => setLookupPhone(null)} className="text-[15px] font-semibold text-ink underline underline-offset-4">
              Check another number
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[17px] text-ink-soft">Enter the phone number you give at the counter.</p>
            {accountLoading ? (
              <p className="flex items-center gap-2 text-[15px] text-ink-soft">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Looking up your account
              </p>
            ) : (
              <PhoneLookup onLookup={setLookupPhone} />
            )}
            {lookupPhone && !accountLoading && !account && (
              <p className="text-[15px] text-ink-soft">
                We have no points for {lookupPhone} yet. Give this number when you next pay, or{' '}
                <Link href="/signup" className="font-semibold text-ink underline underline-offset-4">join online</Link>.
              </p>
            )}
          </div>
        )}
      </Section>

      {(programsLoading || tiers.length > 0) && (
        <Section title="Levels" lede="The more you visit, the faster your points add up.">
          {programsLoading ? (
            <div className="h-40 rounded-lg bg-leaf" aria-busy="true" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
                <thead>
                  <tr className="border-b-2 border-ink text-sm text-ink-soft">
                    <th className="py-3 pr-4 font-semibold">Level</th>
                    <th className="py-3 pr-4 font-semibold">From</th>
                    <th className="py-3 pr-4 font-semibold">Points earned</th>
                    <th className="py-3 font-semibold">Benefits</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t) => (
                    <tr key={t.name} className={`border-b border-line align-top ${account?.tier === t.name ? 'bg-leaf' : ''}`}>
                      <td className="font-display py-3 pr-4 text-2xl leading-none">{t.name}</td>
                      <td className="py-3 pr-4 tabular-nums">{t.min_points.toLocaleString()} points</td>
                      <td className="py-3 pr-4 tabular-nums">{t.multiplier}x</td>
                      <td className="py-3 text-ink-soft">{t.benefits.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {rewards.length > 0 && (
        <Section tone="leaf" title="Spend your points" lede="Tell the cashier which reward you want when you pay.">
          <ul className="grid gap-x-10 sm:grid-cols-2">
            {rewards.map((r) => (
              <li key={r.id} className="flex items-baseline gap-3 border-b border-line py-3">
                <span className="text-[17px] text-ink">
                  {r.name}
                  {r.description && <span className="block text-sm text-ink-soft">{r.description}</span>}
                </span>
                <span className="flex-1" />
                <span className="whitespace-nowrap tabular-nums font-semibold text-ink">{r.points_required.toLocaleString()} points</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
