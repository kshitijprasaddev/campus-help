import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body || {};
    if (!id || !status) return NextResponse.json({ ok: false, error: 'MISSING' }, { status: 400 });
  const supabase = await getSupabaseAdmin();
  const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
