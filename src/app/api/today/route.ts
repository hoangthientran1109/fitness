export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function detectDeload(userId: string): Promise<{ deloadSuggested: boolean; consecutiveHeavyWeeks: number }> {
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
  twelveWeeksAgo.setHours(0, 0, 0, 0);

  const logs = await prisma.workoutLog.findMany({
    where: { userId, date: { gte: twelveWeeksAgo } },
    include: { exercises: true },
    orderBy: { date: 'asc' },
  });

  const workoutDays = await prisma.workoutDay.findMany({
    where: { plan: { userId, status: 'active' }, date: { gte: twelveWeeksAgo } },
    orderBy: { date: 'asc' },
  });

  const getWeekStart = (d: Date) => {
    const date = new Date(d);
    date.setDate(date.getDate() - date.getDay() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const weeks: Map<string, { planned: number; completed: number; avgRpe: number }> = new Map();
  workoutDays.forEach(wd => {
    const key = getWeekStart(wd.date).toISOString();
    const w = weeks.get(key) || { planned: 0, completed: 0, avgRpe: 0 };
    w.planned++;
    weeks.set(key, w);
  });

  logs.forEach(log => {
    const key = getWeekStart(log.date).toISOString();
    const w = weeks.get(key) || { planned: 0, completed: 0, avgRpe: 0 };
    if (log.completed) {
      w.completed++;
      if (log.exercises.length > 0) {
        const rpes = log.exercises.map(e => e.rpe).filter(r => r != null) as number[];
        if (rpes.length > 0) w.avgRpe += rpes.reduce((s: number, r: number) => s + r, 0) / rpes.length;
      }
    }
    weeks.set(key, w);
  });

  const sortedWeeks = Array.from(weeks.entries())
    .sort((a, b) => b[0].localeCompare(a[0]));

  let consecutive = 0;
  for (const [, w] of sortedWeeks) {
    if (w.planned === 0) break;
    const completionRate = w.completed / w.planned;
    const hasRpe = w.avgRpe > 0;
    const isHeavy = completionRate >= 0.7 && (!hasRpe || w.avgRpe >= 6.5);
    if (isHeavy) consecutive++;
    else break;
  }

  return { deloadSuggested: consecutive >= 5, consecutiveHeavyWeeks: consecutive };
}

export async function GET() {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const todayWorkout = await prisma.workoutDay.findFirst({
    where: { plan: { userId: user.id, status: 'active' }, date: { gte: today, lt: tomorrow } },
    include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } },
  });

  const previousLogs: Record<string, { weight: number; reps: string; setsCompleted: number; date: string } | null> = {};
  if (todayWorkout) {
    const todayExIds = todayWorkout.exercises.map(we => we.exerciseId);
    const prevExerciseLogs = await prisma.exerciseLog.findMany({
      where: { exerciseId: { in: todayExIds }, workoutLog: { userId: user.id, date: { lt: today } } },
      include: { workoutLog: { select: { date: true } } },
      orderBy: { workoutLog: { date: 'desc' } },
    });

    const seenExercises = new Set<string>();
    for (const log of prevExerciseLogs) {
      if (!seenExercises.has(log.exerciseId)) {
        seenExercises.add(log.exerciseId);
        previousLogs[log.exerciseId] = {
          weight: log.weight || 0,
          reps: log.reps,
          setsCompleted: log.setsCompleted,
          date: log.workoutLog.date.toISOString(),
        };
      }
    }
  }

  const nutritionPlan = await prisma.nutritionPlan.findFirst({
    where: { userId: user.id }, orderBy: { startDate: 'desc' }, include: { meals: true },
  });

  const todayLog = await prisma.nutritionLog.findFirst({
    where: { userId: user.id, date: { gte: today, lt: tomorrow } },
  });

  const todayCheckIn = await prisma.dailyCheckIn.findFirst({
    where: { userId: user.id, date: { gte: today, lt: tomorrow } },
  });

  const deload = await detectDeload(user.id);

  return NextResponse.json({
    todayWorkout: todayWorkout ? {
      ...todayWorkout,
      exercises: todayWorkout.exercises.map(we => ({
        ...we,
        previousLog: previousLogs[we.exerciseId] || null,
      })),
    } : null,
    nutritionPlan,
    todayLog,
    todayCheckIn,
    deloadSuggested: deload.deloadSuggested,
    consecutiveHeavyWeeks: deload.consecutiveHeavyWeeks,
  });
}
