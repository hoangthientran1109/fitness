export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const data = await req.json();
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const { workoutDayId, completed, skippedReason, notes, exercises } = data;

  const wd = await prisma.workoutDay.findUnique({ where: { id: workoutDayId } });
  if (!wd) return NextResponse.json({ error: 'Workout day not found' }, { status: 404 });

  await prisma.workoutDay.update({ where: { id: workoutDayId }, data: { completed } });

  const log = await prisma.workoutLog.create({
    data: { userId: user.id, workoutDayId, date: new Date(), completed, skippedReason: skippedReason || null, notes: notes || null },
  });

  if (completed && exercises) {
    for (const ex of exercises) {
      await prisma.exerciseLog.create({
        data: { workoutLogId: log.id, exerciseId: ex.exerciseId, setsCompleted: ex.setsCompleted, reps: ex.reps, weight: ex.weight || null, rpe: ex.rpe || null, notes: ex.notes || null },
      });
    }
  }
  return NextResponse.json({ log });
}
