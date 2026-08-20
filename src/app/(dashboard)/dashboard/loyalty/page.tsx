'use client';

import { Badge, Button, Card } from '@/components/ui';
import { useLoyaltyAccountByPhone, useLoyaltyPrograms, useLoyaltyTransactions } from '@/hooks/use-loyalty';
import { type LoyaltyAccount } from '@/lib/api/loyalty';
import { motion } from 'framer-motion';
import { Gift, Loader2, Search, Star, Trophy, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { PhoneInputField } from '@bengo-hub/shared-ui-lib/contact';

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    bronze: 'bg-amber-100 text-amber-700',
    silver: 'bg-slate-100 text-slate-700',
    gold: 'bg-yellow-100 text-yellow-700',
    platinum: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-widest ${colors[tier?.toLowerCase()] ?? 'bg-brand-orange/10 text-brand-orange'}`}>
      {tier}
    </span>
  );
}

function AccountCard({ account }: { account: LoyaltyAccount }) {
  const [showTx, setShowTx] = useState(false);
  const { data: transactions = [], isLoading: txLoading } = useLoyaltyTransactions(showTx ? account.id : null);

  return (
    <Card className="magical-card border-none p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-black text-lg text-primary-brand">{account.customer_name || '—'}</p>
          <p className="text-secondary-brand text-sm">{account.customer_phone}</p>
        </div>
        <TierBadge tier={account.tier} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-brand-orange/5 border border-brand-orange/10">
          <p className="text-xs font-black uppercase tracking-widest text-brand-orange mb-1">Balance</p>
          <p className="text-2xl font-black text-primary-brand">{account.points_balance.toLocaleString()}</p>
          <p className="text-xs text-secondary-brand">points</p>
        </div>
        <div className="p-4 rounded-2xl bg-brand-gold/5 border border-brand-gold/10">
          <p className="text-xs font-black uppercase tracking-widest text-brand-gold mb-1">Lifetime</p>
          <p className="text-2xl font-black text-primary-brand">{account.lifetime_points.toLocaleString()}</p>
          <p className="text-xs text-secondary-brand">points earned</p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTx((v) => !v)}
        className="w-full"
      >
        {showTx ? 'Hide' : 'Show'} Transaction History
      </Button>

      {showTx && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {txLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-brand-orange" /></div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-secondary-brand text-sm py-4">No transactions yet.</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-brand-beige/10 last:border-0">
                <div>
                  <p className="text-sm text-primary-brand">{tx.description}</p>
                  <p className="text-xs text-secondary-brand">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`font-black text-sm ${tx.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'earn' ? '+' : '-'}{Math.abs(tx.points)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}

export default function LoyaltyDashboard() {
  const { data: programs = [], isLoading: programsLoading } = useLoyaltyPrograms();
  const [phone, setPhone] = useState('');
  const [searchPhone, setSearchPhone] = useState<string | null>(null);
  const { data: member, isLoading: memberLoading } = useLoyaltyAccountByPhone(searchPhone);

  const program = programs[0] ?? null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPhone(phone.trim() || null);
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-primary-brand tracking-tight">Loyalty Program</h1>
        <p className="text-secondary-brand font-light">Manage your loyalty program, tiers, and member accounts.</p>
      </header>

      {/* Program Overview */}
      {programsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      ) : program ? (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary-brand">{program.name}</h2>
              <p className="text-sm text-secondary-brand">{program.tiers.length} tiers · {program.rewards.length} rewards</p>
            </div>
          </div>

          {/* Tiers */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-secondary-brand mb-4">Tiers</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {program.tiers.map((tier) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="magical-card border-none p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <TierBadge tier={tier.name} />
                      <span className="text-xs text-secondary-brand font-black">{tier.multiplier}x points</span>
                    </div>
                    <p className="text-xs text-secondary-brand">
                      From <span className="font-black text-primary-brand">{tier.min_points.toLocaleString()}</span> pts
                    </p>
                    {tier.benefits.length > 0 && (
                      <ul className="space-y-1">
                        {tier.benefits.map((b) => (
                          <li key={b} className="flex items-center gap-2 text-xs text-secondary-brand">
                            <Star className="h-3 w-3 text-brand-orange flex-shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Rewards */}
          {program.rewards.length > 0 && (
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-secondary-brand mb-4">Rewards</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {program.rewards.map((reward) => (
                  <Card key={reward.id} className="magical-card border-none p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange flex-shrink-0">
                        <Gift className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-primary-brand text-sm">{reward.name}</p>
                        <p className="text-xs text-secondary-brand">{reward.description}</p>
                        <Badge className="mt-2 text-[10px]">{reward.points_required.toLocaleString()} pts</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <Card className="magical-card border-none p-8 text-center">
          <TrendingUp className="h-10 w-10 text-brand-orange mx-auto mb-4" />
          <p className="font-bold text-primary-brand">No loyalty program configured</p>
          <p className="text-sm text-secondary-brand mt-1">Create a loyalty program in the POS system to get started.</p>
        </Card>
      )}

      {/* Member Lookup */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-primary-brand">Member Lookup</h2>
        <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
          <div className="relative flex-1">
            {/* PhoneInputField has its own flag/country selector on the left, so the standalone
                Phone icon overlay (which the old plain <input> needed) is dropped.
                phone-input-light-admin bridges this site's brand tokens (globals.css). */}
            <PhoneInputField
              value={phone}
              onChange={setPhone}
              placeholder="712345678"
              className="phone-input-light-admin !rounded-2xl"
            />
          </div>
          <Button type="submit" disabled={phone.length < 6}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        {memberLoading && (
          <div className="flex items-center gap-2 text-secondary-brand">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Looking up member...</span>
          </div>
        )}

        {searchPhone && !memberLoading && !member && (
          <p className="text-secondary-brand text-sm">No member found for {searchPhone}.</p>
        )}

        {member && <AccountCard account={member} />}
      </section>
    </div>
  );
}
