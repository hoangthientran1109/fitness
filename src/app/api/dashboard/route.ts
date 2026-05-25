import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await prisma.userProfile.findFirst({ include: { goals: true } });
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const goal = user.goals[0];
  const latestMetric = await prisma.bodyMetric.findFirst({ where: { userId: user.id }, orderBy: { date: 'desc' } });

  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const workoutDays = await prisma.workoutDay.findMany({
    where: { plan: { userId: user.id, status: 'active' }, date: { gte: weekAgo, lte: today } },
  });
  const completed = workoutDays.filter(d => d.completed).length;
  const workoutRate = workoutDays.length > 0 ? Math.round((completed / workoutDays.length) * 100) : 0;

  const nutritionLogs = await prisma.nutritionLog.findMany({
    where: { userId: user.id }, orderBy: { date: 'desc' }, take: 7,
  });
  const nutritionPlan = await prisma.nutritionPlan.findFirst({ where: { userId: user.id }, orderBy: { startDate: 'desc' } });

  let avgCalories = 0, avgProtein = 0;
  if (nutritionLogs.length > 0) {
    avgCalories = Math.round(nutritionLogs.reduce((s, l) => s + l.calories, 0) / nutritionLogs.length);
    avgProtein = Math.round(nutritionLogs.reduce((s, l) => s + l.protein, 0) / nutritionLogs.length);
  }

  const checkIns = await prisma.dailyCheckIn.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }, take: 7 });
  const avgSleep = checkIns.length > 0 ? Math.round((checkIns.reduce((s, c) => s + (c.sleepHours || 0), 0) / checkIns.length) * 10) / 10 : 0;
  const avgStress = checkIns.length > 0 ? Math.round(checkIns.reduce((s, c) => s + (c.stress || 0), 0) / checkIns.length) : 0;

  const bodyMetrics = await prisma.bodyMetric.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }, take: 14 });
  bodyMetrics.reverse();

  const latestInsight = await prisma.aiCoachInsight.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });

  return NextResponse.json({ user, goal, latestMetric, workoutRate, nutritionPlan, avgCalories, avgProtein, avgSleep, avgStress, bodyMetrics, latestInsight });
}
