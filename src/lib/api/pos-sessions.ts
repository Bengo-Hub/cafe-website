const POS_API_URL = process.env.POS_API_URL;
const POS_API_KEY = process.env.POS_API_KEY;

function posHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(POS_API_KEY ? { 'X-API-Key': POS_API_KEY } : {}),
  };
}

export interface POSSession {
  id: string;
  device_id: string;
  tenant_slug: string;
  status: 'open' | 'closed';
  opening_float: number;
  closing_amount?: number;
  notes?: string;
  opened_at: string;
  closed_at?: string;
}

export async function openSession(
  tenantSlug: string,
  deviceId: string,
  openingFloat: number,
): Promise<POSSession> {
  if (!POS_API_URL) throw new Error('POS_API_URL not configured');
  const res = await fetch(
    `${POS_API_URL}/v1/${tenantSlug}/pos/devices/${deviceId}/sessions/open`,
    {
      method: 'POST',
      headers: posHeaders(),
      body: JSON.stringify({ opening_float: openingFloat }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `POS API error ${res.status}`);
  return data;
}

export async function closeSession(
  tenantSlug: string,
  deviceId: string,
  closingAmount: number,
  notes?: string,
): Promise<POSSession> {
  if (!POS_API_URL) throw new Error('POS_API_URL not configured');
  const res = await fetch(
    `${POS_API_URL}/v1/${tenantSlug}/pos/devices/${deviceId}/sessions/close`,
    {
      method: 'POST',
      headers: posHeaders(),
      body: JSON.stringify({ closing_amount: closingAmount, notes }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `POS API error ${res.status}`);
  return data;
}

export async function getSessions(
  tenantSlug: string,
  deviceId: string,
): Promise<POSSession[]> {
  if (!POS_API_URL) return [];
  const res = await fetch(
    `${POS_API_URL}/v1/${tenantSlug}/pos/devices/${deviceId}/sessions`,
    { headers: posHeaders() },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `POS API error ${res.status}`);
  return data?.data ?? data ?? [];
}
