export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDailyInsight, generateWeeklyInsight } from '@/lib/ai-coach';

export async function POST(req: Request) {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const type = body.type || 'daily';

  try {
    const insight = type === 'weekly'
      ? await generateWeeklyInsight()
      : await generateDailyInsight();

    const saved = await prisma.aiCoachInsight.create({
      data: {
        userId: user.id,
        type: insight.type,
        title: insight.title,
        content: insight.content,
        recommendation: insight.recommendation,
      },
    });

    return NextResponse.json({ insight: saved });
  } catch (err: any) {
    console.error('[AI Coach Generate] Error:', err.message);
    return NextResponse.json({ error: 'Failed to generate insight', detail: err.message }, { status: 500 });
  }
}
