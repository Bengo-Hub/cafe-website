import { config } from '@/config/env';
import { apiClient, getTenantSlug } from './client';

const POS_URL = config.services.pos;

export interface OutletSettings {
  outlet_id: string;
  use_case: string;
  display_mode: string;
  show_images: boolean;
  currency: string;
  vat_enabled: boolean;
  vat_rate: number;
  receipt_header: string | null;
  receipt_footer: string | null;
  printer_type: string;
  paper_width: string;
  auto_print_order: boolean;
  // payment display
  mpesa_paybill: string | null;
  mpesa_account_reference: string | null;
  airtel_money_number: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  show_payment_info_on_receipt: boolean;
  updated_at: string;
}

export interface UpdateSettingsInput {
  receipt_header?: string | null;
  receipt_footer?: string | null;
  currency?: string;
  vat_enabled?: boolean;
  vat_rate?: number;
  printer_type?: string;
  paper_width?: string;
  auto_print_order?: boolean;
  mpesa_paybill?: string | null;
  mpesa_account_reference?: string | null;
  airtel_money_number?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  show_payment_info_on_receipt?: boolean;
}

export async function fetchPosSettings(): Promise<OutletSettings> {
  const slug = getTenantSlug();
  const res = await apiClient<OutletSettings>(`${POS_URL}/api/v1/${slug}/pos/settings`);
  if (res.error) throw new Error(res.error);
  if (!res.data) throw new Error('No settings data returned');
  return res.data;
}

export async function updatePosSettings(input: UpdateSettingsInput): Promise<OutletSettings> {
  const slug = getTenantSlug();
  const res = await apiClient<OutletSettings>(`${POS_URL}/api/v1/${slug}/pos/settings`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  if (res.error) throw new Error(res.error);
  if (!res.data) throw new Error('No settings data returned');
  return res.data;
}
