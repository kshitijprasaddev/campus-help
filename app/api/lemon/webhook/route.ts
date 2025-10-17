// app/api/lemon/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  console.info('Received payment webhook – credits flow retired. Payload stored for manual review.', {
    email: body?.data?.attributes?.user_email || body?.meta?.customer_email || body?.customer?.email,
  });
  return NextResponse.json({ ok: true });
}