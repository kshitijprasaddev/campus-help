import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

type ReportPayload = {
  type: string;
  id: string;
  reason?: string;
  reporter_id?: string | null;
};

function isReportPayload(value: unknown): value is ReportPayload {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.type === 'string' && typeof candidate.id === 'string';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!isReportPayload(body)) {
      return NextResponse.json({ ok: false, error: 'MISSING_FIELDS' }, { status: 400 });
    }

    const { type, id, reason = '', reporter_id = null } = body;
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase.from('reports').insert({
      type,
      target_id: id,
      reason,
      reporter_id,
      status: 'open'
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'BAD_REQUEST';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
