export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { estimateMacrosFromDescription } from '@/lib/ai-coach';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const description = body.description || '';
  if (!description.trim()) return NextResponse.json({ error: 'Mô tả trống' }, { status: 400 });

  try {
    const result = await estimateMacrosFromDescription(description);
    return NextResponse.json({ estimate: result });
  } catch (err: any) {
    console.error('[Nutrition Estimate] Error:', err.message);
    return NextResponse.json({ error: 'Lỗi AI estimate', detail: err.message }, { status: 500 });
  }
}
