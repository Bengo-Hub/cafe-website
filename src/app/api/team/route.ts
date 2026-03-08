import { DEFAULT_TENANT_ID, getSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ data: [], message: 'Supabase not configured' }, { status: 200 });
  }
  const tenantId = request.headers.get('x-tenant-id') ?? request.nextUrl.searchParams.get('tenant_id') ?? DEFAULT_TENANT_ID;
  const { data, error } = await supabase
    .from('team')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('display_order', { ascending: true });
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
  const { data, error } = await supabase
    .from('team')
    .insert({
      tenant_id: tenantId,
      name: body.name,
      role: body.role,
      bio: body.bio ?? null,
      image_url: body.image_url ?? null,
      email: body.email ?? null,
      linkedin_url: body.linkedin_url ?? null,
      twitter_url: body.twitter_url ?? null,
      display_order: body.display_order ?? 0,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
