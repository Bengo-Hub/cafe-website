import { closeSession, getSessions, openSession } from '@/lib/api/pos-sessions';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Default device ID — pos-api assigns a real device_id per terminal on registration.
// For shift management we use a per-tenant default device that maps to the cafe's main terminal.
const DEFAULT_DEVICE_ID = process.env.POS_DEFAULT_DEVICE_ID ?? 'default';

function getTenantSlug(request: NextRequest): string {
  return (
    request.headers.get('x-tenant-slug') ??
    request.nextUrl.searchParams.get('tenant_slug') ??
    process.env.NEXT_PUBLIC_TENANT_SLUG ??
    'urban-loft'
  );
}

export async function GET(request: NextRequest) {
  const tenantSlug = getTenantSlug(request);
  const deviceId =
    request.nextUrl.searchParams.get('device_id') ?? DEFAULT_DEVICE_ID;

  try {
    const sessions = await getSessions(tenantSlug, deviceId);
    return NextResponse.json({ data: sessions });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch sessions';
    // Graceful degradation: return empty when pos-api is unavailable
    console.warn('[shifts/GET] pos-api unavailable:', msg);
    return NextResponse.json({ data: [], message: msg }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const tenantSlug = getTenantSlug(request);
  const body = await request.json();
  const { action, device_id, opening_float, closing_amount, notes } = body;
  const deviceId = device_id ?? DEFAULT_DEVICE_ID;

  try {
    if (action === 'clock_in' || action === 'open_session') {
      const session = await openSession(tenantSlug, deviceId, opening_float ?? 0);
      return NextResponse.json(session, { status: 201 });
    }

    if (action === 'clock_out' || action === 'close_session') {
      const session = await closeSession(
        tenantSlug,
        deviceId,
        closing_amount ?? 0,
        notes,
      );
      return NextResponse.json(session);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'POS API error';
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
