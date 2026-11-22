import { config } from '@/config/env';
import { api } from './client';

// pos-api owns loyalty. Three kinds of call, each on the route meant for it:
// - the programme's terms (rates, levels): public, no token, so visitors never trigger a 401;
// - a signed-in customer's own points: this site's server route /api/loyalty/me, which checks the
//   token with SSO and asks pos-api by the customer's own phone (S2S), never a typed number;
// - member lookup by phone: staff routes, used only by the staff dashboard.

export interface LoyaltyTier {
  name: string;
  min_points: number;
}

/** pos-api PublicLoyaltyProgramView. */
export interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  /** Points earned per unit of currency spent. */
  earn_rate: number;
  /** Currency value of one point when redeemed. */
  redeem_rate: number;
  min_redeem_points: number;
  tiers: LoyaltyTier[];
}

/** pos-api loyaltyAccountMap. */
export interface LoyaltyAccount {
  id: string;
  customer_phone: string;
  customer_name: string;
  points_balance: number;
  lifetime_points: number;
  program_id?: string;
  crm_contact_id?: string;
}

/** pos-api LoyaltyTransaction (Ent JSON). */
export interface LoyaltyTransaction {
  id: string;
  account_id: string;
  points: number;
  type_field: string;
  balance_after: number;
  notes?: string;
  created_at: string;
}

/** The signed-in customer's points, from /api/loyalty/me. */
export interface MyLoyalty {
  exists: boolean;
  balance: number;
  lifetime_points: number;
  tier: string;
  /** False when the customer's SSO profile has no phone, so no account can be matched. */
  has_phone: boolean;
}

/** The level a lifetime total reaches ('' below the first level). Same rule as pos-api. */
export function tierFor(tiers: LoyaltyTier[], lifetime: number): string {
  let name = '';
  for (const t of [...tiers].sort((a, b) => a.min_points - b.min_points)) {
    if (lifetime >= t.min_points) name = t.name;
  }
  return name;
}

function posBase(tenant: string) {
  return `${config.services.pos}/api/v1/${tenant}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Public programme terms. Plain fetch: no token, no 401 handling, nothing to log out. */
export async function fetchPublicProgram(tenantId: string): Promise<LoyaltyProgram | null> {
  if (!UUID_RE.test(tenantId)) return null;
  const res = await fetch(`${posBase(tenantId)}/pos/loyalty/program`);
  if (!res.ok) throw new Error(`loyalty programme: ${res.status}`);
  const body = (await res.json()) as { data?: LoyaltyProgram | null };
  return body.data ?? null;
}

/** The signed-in customer's own points (server route, token checked there). */
export async function fetchMyLoyalty(accessToken: string, tenantId: string): Promise<MyLoyalty> {
  const res = await fetch(`/api/loyalty/me?tenant_id=${encodeURIComponent(tenantId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`my loyalty: ${res.status}`);
  return (await res.json()) as MyLoyalty;
}

/** Staff routes (staff dashboard only). */
export const loyaltyStaffApi = {
  lookupByPhone: async (tenantSlug: string, phone: string): Promise<LoyaltyAccount | null> => {
    const res = await api.get<{ data?: LoyaltyAccount[] }>(
      `${posBase(tenantSlug)}/pos/loyalty/accounts?phone=${encodeURIComponent(phone)}`
    );
    return res.data?.data?.[0] ?? null;
  },

  getAccount: async (
    tenantSlug: string,
    accountId: string
  ): Promise<{ account: LoyaltyAccount; transactions: LoyaltyTransaction[] } | null> => {
    const res = await api.get<{ account: LoyaltyAccount; transactions: LoyaltyTransaction[] }>(
      `${posBase(tenantSlug)}/pos/loyalty/accounts/${accountId}`
    );
    return res.data ?? null;
  },
};
