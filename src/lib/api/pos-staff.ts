const POS_API_URL = process.env.POS_API_URL;
const POS_API_KEY = process.env.POS_API_KEY;

function posHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(POS_API_KEY ? { 'X-API-Key': POS_API_KEY } : {}),
  };
}

export interface POSUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface POSRole {
  id: string;
  name: string;
  description?: string;
}

export async function getPOSUsers(tenantSlug: string): Promise<POSUser[]> {
  if (!POS_API_URL) return [];
  const res = await fetch(`${POS_API_URL}/v1/${tenantSlug}/users`, {
    headers: posHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `POS API error ${res.status}`);
  return data?.data ?? data ?? [];
}

export async function getPOSRoles(tenantSlug: string): Promise<POSRole[]> {
  if (!POS_API_URL) return [];
  const res = await fetch(`${POS_API_URL}/v1/${tenantSlug}/rbac/roles`, {
    headers: posHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `POS API error ${res.status}`);
  return data?.data ?? data ?? [];
}

export async function assignPOSRole(
  tenantSlug: string,
  userId: string,
  roleId: string,
): Promise<void> {
  if (!POS_API_URL) throw new Error('POS_API_URL not configured');
  const res = await fetch(`${POS_API_URL}/v1/${tenantSlug}/rbac/user-roles`, {
    method: 'POST',
    headers: posHeaders(),
    body: JSON.stringify({ user_id: userId, role_id: roleId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `POS API error ${res.status}`);
  }
}
