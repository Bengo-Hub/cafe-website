import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ERP_URL = process.env.NEXT_PUBLIC_ERP_API_URL ?? 'https://erp.codevertexitsolutions.com';
const SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY ?? '';

function erpHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': SERVICE_KEY,
  };
}

function getTenantSlug(req: NextRequest): string {
  return (
    req.headers.get('x-tenant-slug') ??
    req.nextUrl.searchParams.get('tenant') ??
    process.env.NEXT_PUBLIC_TENANT_SLUG ??
    'urban-loft'
  );
}

export async function GET(req: NextRequest) {
  const tenant = getTenantSlug(req);
  const { searchParams } = req.nextUrl;
  const employeeId = searchParams.get('employee_id');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  const params = new URLSearchParams({ tenant });
  if (employeeId) params.set('employee', employeeId);
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);

  try {
    const res = await fetch(`${ERP_URL}/hrm/attendance/records/?${params.toString()}`, {
      headers: erpHeaders(),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'ERP unavailable';
    return NextResponse.json({ error: msg, results: [] }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const tenant = getTenantSlug(req);
  const body = await req.json();

  try {
    const res = await fetch(`${ERP_URL}/hrm/attendance/records/?tenant=${tenant}`, {
      method: 'POST',
      headers: erpHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'ERP unavailable';
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  const recordId = req.nextUrl.searchParams.get('id');
  if (!recordId) return NextResponse.json({ error: 'Record ID required' }, { status: 400 });

  const tenant = getTenantSlug(req);
  const body = await req.json();

  try {
    const res = await fetch(`${ERP_URL}/hrm/attendance/records/${recordId}/?tenant=${tenant}`, {
      method: 'PATCH',
      headers: erpHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'ERP unavailable';
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
