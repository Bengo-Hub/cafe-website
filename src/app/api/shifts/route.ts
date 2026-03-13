import { DEFAULT_TENANT_ID, getSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ data: [], message: 'Supabase not configured' }, { status: 200 });
  }

  const tenantId = request.headers.get('x-tenant-id') ?? request.nextUrl.searchParams.get('tenant_id') ?? DEFAULT_TENANT_ID;
  const staffId = request.nextUrl.searchParams.get('staff_id');

  let query = supabase
    .from('shifts')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('clock_in', { ascending: false });

  if (staffId) {
    query = query.eq('staff_id', staffId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const tenantId = request.headers.get('x-tenant-id') ?? request.nextUrl.searchParams.get('tenant_id') ?? DEFAULT_TENANT_ID;
  const body = await request.json();
  const { action, staff_id, shift_id } = body;

  if (action === 'clock_in') {
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        tenant_id: tenantId,
        staff_id: staff_id,
        clock_in: new Date().toISOString(),
        status: 'Ongoing'
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }

  if (action === 'clock_out') {
    if (!shift_id) return NextResponse.json({ error: 'Shift ID required for clock out' }, { status: 400 });

    const clockOutTime = new Date();
    // In a real scenario, we'd fetch the clock_in time to calculate duration
    // For now, we'll just update the status and clock_out time
    const { data, error } = await supabase
      .from('shifts')
      .update({
        clock_out: clockOutTime.toISOString(),
        status: 'Completed'
      })
      .eq('id', shift_id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
