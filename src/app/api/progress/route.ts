import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });
  const bodyMetrics = await prisma.bodyMetric.findMany({ where: { userId: user.id }, orderBy: { date: 'asc' } });
  const workoutLogs = await prisma.workoutLog.findMany({
    where: { userId: user.id },
    include: { exercises: { include: { exercise: true } }, workoutDay: true },
    orderBy: { date: 'desc' }, take: 30,
  });
  const nutritionLogs = await prisma.nutritionLog.findMany({ where: { userId: user.id }, orderBy: { date: 'asc' }, take: 30 });
  const nutritionPlan = await prisma.nutritionPlan.findFirst({ where: { userId: user.id }, orderBy: { startDate: 'desc' } });
  const progressRecords = await prisma.progressRecord.findMany({ where: { userId: user.id }, orderBy: { date: 'asc' } });
  return NextResponse.json({ bodyMetrics, workoutLogs, nutritionLogs, nutritionPlan, progressRecords });
}
