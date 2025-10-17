import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id: target_id, reason = '', reporter_id = null } = body || {};
    if (!type || !target_id) return NextResponse.json({ ok: false, error: 'MISSING_FIELDS' }, { status: 400 });

    const { error } = await supabaseAdmin.from('reports').insert({
      type,
      target_id,
      reason,
      reporter_id,
      status: 'open'
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'BAD_REQUEST' }, { status: 400 });
  }
}
