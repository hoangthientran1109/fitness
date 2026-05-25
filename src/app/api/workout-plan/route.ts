import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });
  const plan = await prisma.workoutPlan.findFirst({
    where: { userId: user.id, status: 'active' },
    include: {
      days: {
        include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } },
        orderBy: { date: 'asc' },
      },
    },
  });
  return NextResponse.json({ plan });
}
