export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSwapOptions } from '@/lib/meal-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { foodName, grams } = body;
    if (!foodName || !grams) return NextResponse.json({ error: 'Thiếu thông tin món ăn' }, { status: 400 });

    const options = getSwapOptions(foodName, Math.round(grams));
    return NextResponse.json({ foodName, grams, options });
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi tìm món thay thế', detail: err.message }, { status: 500 });
  }
}
