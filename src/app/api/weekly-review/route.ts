export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const url = new URL(req.url);
  const dateStr = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
  const endDate = new Date(dateStr); endDate.setHours(23, 59, 59, 999);
  const startDate = new Date(endDate); startDate.setDate(startDate.getDate() - 6); startDate.setHours(0, 0, 0, 0);

  const workoutDays = await prisma.workoutDay.findMany({ where: { plan: { userId: user.id }, date: { gte: startDate, lte: endDate } } });
  const completed = workoutDays.filter(d => d.completed).length;

  const nutritionLogs = await prisma.nutritionLog.findMany({ where: { userId: user.id, date: { gte: startDate, lte: endDate } } });
  const nutritionPlan = await prisma.nutritionPlan.findFirst({ where: { userId: user.id }, orderBy: { startDate: 'desc' } });
  const checkIns = await prisma.dailyCheckIn.findMany({ where: { userId: user.id, date: { gte: startDate, lte: endDate } } });
  const bodyMetrics = await prisma.bodyMetric.findMany({ where: { userId: user.id, date: { gte: startDate, lte: endDate } }, orderBy: { date: 'asc' } });

  const weightChange = bodyMetrics.length >= 2 ? (bodyMetrics[bodyMetrics.length - 1].weight || 0) - (bodyMetrics[0].weight || 0) : 0;
  const avgCals = nutritionLogs.length > 0 ? Math.round(nutritionLogs.reduce((s, l) => s + l.calories, 0) / nutritionLogs.length) : 0;
  const avgProtein = nutritionLogs.length > 0 ? Math.round(nutritionLogs.reduce((s, l) => s + l.protein, 0) / nutritionLogs.length) : 0;
  const avgSleep = checkIns.length > 0 ? Math.round((checkIns.reduce((s, c) => s + (c.sleepHours || 0), 0) / checkIns.length) * 10) / 10 : 0;
  const avgEnergy = checkIns.length > 0 ? Math.round(checkIns.reduce((s, c) => s + (c.energy || 0), 0) / checkIns.length) : 0;
  const avgStress = checkIns.length > 0 ? Math.round(checkIns.reduce((s, c) => s + (c.stress || 0), 0) / checkIns.length) : 0;
  const avgMood = checkIns.length > 0 ? Math.round(checkIns.reduce((s, c) => s + (c.mood || 0), 0) / checkIns.length) : 0;
  const avgSoreness = checkIns.length > 0 ? Math.round(checkIns.reduce((s, c) => s + (c.soreness || 0), 0) / checkIns.length) : 0;

  return NextResponse.json({
    startDate: startDate.toISOString(), endDate: endDate.toISOString(),
    workoutsCompleted: completed, workoutsPlanned: workoutDays.length,
    avgCalories: avgCals, avgProtein, caloriesTarget: nutritionPlan?.caloriesTarget || 0,
    proteinTarget: nutritionPlan?.proteinTarget || 0,
    weightChange: Math.round(weightChange * 10) / 10,
    avgSleep, avgEnergy, avgStress, avgMood, avgSoreness,
    completionRate: workoutDays.length > 0 ? Math.round((completed / workoutDays.length) * 100) : 0,
    calorieAdherence: nutritionPlan ? Math.round((avgCals / nutritionPlan.caloriesTarget) * 100) : 0,
    proteinAdherence: nutritionPlan ? Math.round((avgProtein / nutritionPlan.proteinTarget) * 100) : 0,
  });
}
