import { getPOSRoles, getPOSUsers } from '@/lib/api/pos-staff';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
  const type = request.nextUrl.searchParams.get('type') ?? 'users';

  try {
    if (type === 'roles') {
      const roles = await getPOSRoles(tenantSlug);
      return NextResponse.json({ data: roles });
    }
    const users = await getPOSUsers(tenantSlug);
    return NextResponse.json({ data: users });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch POS staff';
    console.warn('[pos-staff/GET] pos-api unavailable:', msg);
    return NextResponse.json({ data: [], message: msg }, { status: 200 });
  }
}
