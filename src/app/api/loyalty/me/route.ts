import { fetchProfile } from '@/lib/auth/sso-api';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// A signed-in customer's own loyalty points. The token is checked with SSO here, the phone comes
// from that verified profile (never from the request), and pos-api is asked over S2S with the
// internal service key, which never reaches the browser. So nobody can read another number's
// points from this site.

const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'https://posapi.codevertexafrica.com';
const SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY ?? '';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The profile's phone: a flat field, or the primary (else first) of a phones list. */
function profilePhone(p: Record<string, unknown>): string {
  for (const k of ['phone', 'phone_number', 'phoneNumber']) {
    const v = p[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  const list = Array.isArray(p.phones) ? (p.phones as Record<string, unknown>[]) : [];
  const pick = list.find((x) => x?.is_primary || x?.primary) ?? list[0];
  return typeof pick?.phone === 'string' ? pick.phone.trim() : '';
}

export async function GET(request: NextRequest) {
  const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  const tenantId = request.nextUrl.searchParams.get('tenant_id') ?? '';
  if (!token) return NextResponse.json({ error: 'sign in required' }, { status: 401 });
  if (!UUID_RE.test(tenantId)) return NextResponse.json({ error: 'invalid tenant' }, { status: 400 });
  if (!SERVICE_KEY) {
    console.error('[loyalty/me] INTERNAL_SERVICE_KEY is not set');
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  let profile: Record<string, unknown>;
  try {
    profile = await fetchProfile(token);
  } catch {
    return NextResponse.json({ error: 'sign in required' }, { status: 401 });
  }
  const phone = profilePhone(profile);
  if (!phone) {
    return NextResponse.json({ exists: false, balance: 0, lifetime_points: 0, tier: '', has_phone: false });
  }

  const res = await fetch(`${POS_URL}/api/v1/s2s/${tenantId}/loyalty/balance?phone=${encodeURIComponent(phone)}`, {
    headers: { 'X-API-Key': SERVICE_KEY },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.warn('[loyalty/me] pos-api balance failed', res.status);
    return NextResponse.json({ error: 'unavailable' }, { status: 502 });
  }
  const body = (await res.json()) as { exists?: boolean; balance?: number; lifetime_points?: number; tier?: string };
  return NextResponse.json({
    exists: !!body.exists,
    balance: body.balance ?? 0,
    lifetime_points: body.lifetime_points ?? 0,
    tier: body.tier ?? '',
    has_phone: true,
  });
}
