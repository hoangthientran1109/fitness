export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const data = await req.json();
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await prisma.dailyCheckIn.findFirst({
    where: { userId: user.id, date: { gte: today, lt: tomorrow } },
  });

  let checkIn;
  if (existing) {
    checkIn = await prisma.dailyCheckIn.update({ where: { id: existing.id }, data });
  } else {
    checkIn = await prisma.dailyCheckIn.create({ data: { userId: user.id, date: today, ...data } });
  }
  return NextResponse.json({ checkIn });
}
