export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });
  const insights = await prisma.aiCoachInsight.findMany({
    where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10,
  });
  return NextResponse.json({ insights });
}

export async function POST(req: Request) {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });
  const data = await req.json();
  const insight = await prisma.aiCoachInsight.create({
    data: { userId: user.id, type: data.type, title: data.title, content: data.content, recommendation: data.recommendation || null },
  });
  return NextResponse.json({ insight });
}
