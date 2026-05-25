import { config } from '@/config/env';
import { api } from './client';

export interface LoyaltyTier {
  name: string;
  min_points: number;
  multiplier: number;
  benefits: string[];
}

export interface LoyaltyReward {
  id: string;
  name: string;
  points_required: number;
  description: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  tiers: LoyaltyTier[];
  rewards: LoyaltyReward[];
}

export interface LoyaltyAccount {
  id: string;
  customer_phone: string;
  customer_name: string;
  points_balance: number;
  lifetime_points: number;
  tier: string;
  program_id: string;
  crm_contact_id?: string;
}

export interface LoyaltyTransaction {
  id: string;
  account_id: string;
  points: number;
  type: 'earn' | 'redeem' | 'adjustment';
  description: string;
  created_at: string;
}

function posBase(tenantSlug: string) {
  return `${config.services.pos}/api/v1/${tenantSlug}`;
}

export const loyaltyApi = {
  getPrograms: (tenantSlug: string) =>
    api.get<LoyaltyProgram[]>(`${posBase(tenantSlug)}/pos/loyalty/programs`),

  lookupByPhone: (tenantSlug: string, phone: string) =>
    api.get<LoyaltyAccount[]>(
      `${posBase(tenantSlug)}/pos/loyalty/accounts?phone=${encodeURIComponent(phone)}`
    ),

  getAccount: (tenantSlug: string, accountId: string) =>
    api.get<LoyaltyAccount>(`${posBase(tenantSlug)}/pos/loyalty/accounts/${accountId}`),

  getTransactions: (tenantSlug: string, accountId: string) =>
    api.get<LoyaltyTransaction[]>(
      `${posBase(tenantSlug)}/pos/loyalty/accounts/${accountId}/transactions`
    ),
};
