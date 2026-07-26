import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ERP_URL = process.env.NEXT_PUBLIC_ERP_API_URL ?? 'https://erp.codevertexafrica.com';
const SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY ?? '';

function erpHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': SERVICE_KEY,
  };
}

export async function GET(req: NextRequest) {
  const tenant =
    req.headers.get('x-tenant-slug') ??
    req.nextUrl.searchParams.get('tenant') ??
    process.env.NEXT_PUBLIC_TENANT_SLUG ??
    'urban-loft';

  try {
    const res = await fetch(
      `${ERP_URL}/hrm/employees/?tenant=${encodeURIComponent(tenant)}&page_size=100`,
      { headers: erpHeaders() }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'ERP unavailable';
    return NextResponse.json({ error: msg, results: [] }, { status: 503 });
  }
}
