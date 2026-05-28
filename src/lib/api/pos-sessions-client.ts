import { config } from '@/config/env';
import { apiClient, getTenantHeaders } from './client';
import { useAuthStore } from '@/lib/store/auth-store';

const POS_URL = config.services.pos;

function posHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = useAuthStore.getState().accessToken;
  return {
    ...getTenantHeaders(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getTenantID(): string {
  if (typeof window !== 'undefined') {
    const user = useAuthStore.getState().user;
    if (user?.tenant_id) return user.tenant_id;
  }
  return '';
}

export interface POSDeviceSession {
  id: string;
  tenant_id: string;
  device_id: string;
  user_id: string;
  session_status: 'open' | 'closed';
  opened_at: string;
  closed_at?: string;
  float_amount: number;
  closing_float?: number;
  variance?: number;
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * GET /api/v1/{tenantID}/pos/devices/current/sessions/current
 * Returns the authenticated user's current open session, or null if none.
 */
export async function getCurrentPOSSession(): Promise<POSDeviceSession | null> {
  const tenantID = getTenantID();
  if (!tenantID) return null;
  try {
    const res = await apiClient<POSDeviceSession>(
      `${POS_URL}/api/v1/${tenantID}/pos/devices/current/sessions/current`,
      { headers: posHeaders() },
    );
    return res.data ?? null;
  } catch {
    return null;
  }
}

/**
 * POST /api/v1/{tenantID}/pos/devices/current/sessions/open
 * Opens a new shift session with the given opening float.
 */
export async function openPOSSession(openingFloat: number): Promise<POSDeviceSession> {
  const tenantID = getTenantID();
  if (!tenantID) throw new Error('Tenant ID not available');
  const res = await apiClient<POSDeviceSession>(
    `${POS_URL}/api/v1/${tenantID}/pos/devices/current/sessions/open`,
    {
      method: 'POST',
      headers: posHeaders(),
      body: JSON.stringify({ opening_float: openingFloat }),
    },
  );
  if (!res.data) throw new Error('Failed to open session');
  return res.data;
}

/**
 * POST /api/v1/{tenantID}/pos/devices/current/sessions/close
 * Closes the current open session.
 */
export async function closePOSSession(closingFloat: number, notes?: string): Promise<POSDeviceSession> {
  const tenantID = getTenantID();
  if (!tenantID) throw new Error('Tenant ID not available');
  const res = await apiClient<POSDeviceSession>(
    `${POS_URL}/api/v1/${tenantID}/pos/devices/current/sessions/close`,
    {
      method: 'POST',
      headers: posHeaders(),
      body: JSON.stringify({ closing_float: closingFloat, notes }),
    },
  );
  if (!res.data) throw new Error('Failed to close session');
  return res.data;
}

interface PaginatedSessions {
  data: POSDeviceSession[];
  total: number;
  page?: number;
  limit?: number;
}

/**
 * GET /api/v1/{tenantID}/pos/devices/current/sessions/history
 * Returns session history for the current device.
 */
export async function getPOSSessionHistory(): Promise<POSDeviceSession[]> {
  const tenantID = getTenantID();
  if (!tenantID) return [];
  try {
    const res = await apiClient<PaginatedSessions>(
      `${POS_URL}/api/v1/${tenantID}/pos/devices/current/sessions/history`,
      { headers: posHeaders() },
    );
    return res.data?.data ?? [];
  } catch {
    return [];
  }
}
