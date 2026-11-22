'use client';

import { PageIntro, Section } from '@/components/site';
import { useAuth } from '@/hooks/use-auth';
import { useLoyaltyProgram, useMyLoyalty } from '@/hooks/use-loyalty';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const ksh = (n: number) => `KSh ${n.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;

export default function LoyaltyPage() {
  const { isAuthenticated, user } = useAuth();
  const { data: program, isLoading: programLoading } = useLoyaltyProgram();
  const { data: me, isLoading: meLoading, isError: meError } = useMyLoyalty();

  const tiers = [...(program?.tiers ?? [])].sort((a, b) => a.min_points - b.min_points);
  const lifetime = me?.lifetime_points ?? 0;
  const tierIdx = me?.tier ? tiers.findIndex((t) => t.name === me.tier) : -1;
  const nextTier = tiers.find((t) => t.min_points > lifetime) ?? null;
  const currentMin = tierIdx >= 0 ? tiers[tierIdx].min_points : 0;
  const progress = nextTier
    ? Math.min(100, ((lifetime - currentMin) / Math.max(1, nextTier.min_points - currentMin)) * 100)
    : 100;

  return (
    <>
      <PageIntro
        title="Loyalty rewards"
        lede="Give your phone number when you pay and you collect points on food, drinks and work hub passes. Spend them on your next visit."
      >
        {!isAuthenticated && (
          <>
            <Link href="/signup?return_to=/loyalty" className="inline-flex h-12 items-center rounded-md bg-loft px-5 text-[15px] font-semibold text-white hover:bg-loft-deep">
              Join
            </Link>
            <Link href="/login?return_to=/loyalty" className="inline-flex h-12 items-center rounded-md border border-ink/25 px-5 text-[15px] font-semibold text-ink hover:border-ink">
              Sign in
            </Link>
          </>
        )}
      </PageIntro>

      <Section tone="leaf" title={isAuthenticated ? `Hello, ${user?.name?.split(' ')[0] || 'there'}` : 'Your points'}>
        {!isAuthenticated ? (
          <p className="max-w-2xl text-[17px] text-ink-soft">
            Sign in with the phone number you give at the counter to see your points and level. Your balance is only shown
            to you.
          </p>
        ) : meLoading ? (
          <p className="flex items-center gap-2 text-[15px] text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading your points
          </p>
        ) : meError ? (
          <p className="text-[15px] text-ink-soft">We could not load your points just now. Please try again in a minute.</p>
        ) : me && !me.has_phone ? (
          <p className="max-w-2xl text-[17px] text-ink-soft">
            Add your phone number to your account so we can match the points you collect at the counter.
          </p>
        ) : me && !me.exists ? (
          <p className="max-w-2xl text-[17px] text-ink-soft">
            No points yet. Give your phone number when you next pay and they start adding up.
          </p>
        ) : me ? (
          <div className="max-w-2xl space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <p>
                <span className="font-display block text-6xl leading-none tabular-nums">{me.balance.toLocaleString()}</span>
                <span className="text-[15px] text-ink-soft">
                  points{me.tier ? `, ${me.tier} member` : ''}
                  {program && me.balance > 0 ? `, worth ${ksh(me.balance * program.redeem_rate)}` : ''}
                </span>
              </p>
              {nextTier && (
                <p className="text-[15px] text-ink-soft">
                  {(nextTier.min_points - lifetime).toLocaleString()} more points to reach {nextTier.name}
                </p>
              )}
            </div>
            {nextTier && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-loft" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        ) : null}
      </Section>

      {programLoading ? (
        <Section title="How it works">
          <div className="h-40 rounded-lg bg-leaf" aria-busy="true" />
        </Section>
      ) : program ? (
        <Section title="How it works" lede={program.description || undefined}>
          <ul className="grid max-w-3xl gap-x-10 sm:grid-cols-3">
            <li className="border-b border-line py-3">
              {program.earn_rate >= 1 ? (
                <>
                  <span className="font-display block text-3xl leading-none tabular-nums">{program.earn_rate.toLocaleString()}</span>
                  <span className="text-[15px] text-ink-soft">points for every KSh 1 you spend</span>
                </>
              ) : (
                <>
                  <span className="font-display block text-3xl leading-none tabular-nums">1 point</span>
                  <span className="text-[15px] text-ink-soft">for every {ksh(Math.round(1 / Math.max(program.earn_rate, 0.0001)))} you spend</span>
                </>
              )}
            </li>
            <li className="border-b border-line py-3">
              <span className="font-display block text-3xl leading-none tabular-nums">{ksh(program.redeem_rate)}</span>
              <span className="text-[15px] text-ink-soft">off your bill for every point</span>
            </li>
            <li className="border-b border-line py-3">
              <span className="font-display block text-3xl leading-none tabular-nums">{program.min_redeem_points.toLocaleString()}</span>
              <span className="text-[15px] text-ink-soft">points before you can spend them</span>
            </li>
          </ul>
          {tiers.length > 0 && (
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[360px] border-collapse text-left text-[15px]">
                <thead>
                  <tr className="border-b-2 border-ink text-sm text-ink-soft">
                    <th className="py-3 pr-4 font-semibold">Level</th>
                    <th className="py-3 font-semibold">From (points collected in total)</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t) => (
                    <tr key={t.name} className={`border-b border-line ${me?.tier === t.name ? 'bg-leaf' : ''}`}>
                      <td className="font-display py-3 pr-4 text-2xl capitalize leading-none">{t.name}</td>
                      <td className="py-3 tabular-nums">{t.min_points.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-6 text-[15px] text-ink-soft">Tell the cashier you want to use your points when you pay.</p>
        </Section>
      ) : null}
    </>
  );
}
