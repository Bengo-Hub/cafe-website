import { config } from '@/config/env';
import { getTenantHeaders, getTenantSlug } from './client';

const LOGISTICS_URL = config.services.logistics;

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem('cafe-auth-storage');
  if (!stored) return {};
  try {
    const { state } = JSON.parse(stored);
    return state?.accessToken ? { Authorization: `Bearer ${state.accessToken}` } : {};
  } catch {
    return {};
  }
}

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...getTenantHeaders(),
    ...authHeaders(),
  };
}

// Types

export type RiderStatus = 'pending' | 'active' | 'suspended' | 'inactive';

export interface Rider {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  status: RiderStatus;
  vehicle_type?: string;
  license_plate?: string;
  joined_at: string;
  metadata?: Record<string, string>;
}

export interface RiderListResponse {
  riders: Rider[];
  total: number;
}

// API functions

export async function fetchRiders(params?: {
  status?: string;
}): Promise<RiderListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/admin/riders${qs ? `?${qs}` : ''}`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Fetch riders failed: ${resp.statusText}`);
  return resp.json();
}

export async function fetchPendingRiders(): Promise<RiderListResponse> {
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/admin/riders/pending`;
  const resp = await fetch(url, { headers: headers() });
  if (!resp.ok) throw new Error(`Fetch pending riders failed: ${resp.statusText}`);
  return resp.json();
}

export async function inviteRider(data: {
  email: string;
  name?: string;
  phone?: string;
  vehicle_type?: string;
}): Promise<{ message: string; member_id: string }> {
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/admin/riders/invite`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Invite failed: ${resp.statusText}`);
  }
  return resp.json();
}

export async function approveRider(memberId: string): Promise<{ message: string }> {
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/admin/riders/${memberId}/approve`;
  const resp = await fetch(url, { method: 'POST', headers: headers() });
  if (!resp.ok) throw new Error(`Approve failed: ${resp.statusText}`);
  return resp.json();
}

export async function suspendRider(memberId: string): Promise<{ message: string }> {
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/admin/riders/${memberId}/suspend`;
  const resp = await fetch(url, { method: 'POST', headers: headers() });
  if (!resp.ok) throw new Error(`Suspend failed: ${resp.statusText}`);
  return resp.json();
}

export async function rejectRider(
  memberId: string,
  reason: string,
): Promise<{ message: string }> {
  const url = `${LOGISTICS_URL}/api/v1/${getTenantSlug()}/admin/riders/${memberId}/reject`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ reason }),
  });
  if (!resp.ok) throw new Error(`Reject failed: ${resp.statusText}`);
  return resp.json();
}
