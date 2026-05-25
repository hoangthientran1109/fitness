import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Handler = (req: NextRequest, ctx: { params: any }) => Promise<NextResponse>;

function withErrorHandler(fn: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err: any) {
      console.error('API Error:', err);
      return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
    }
  };
}

// GET /api/user
const getUser = withErrorHandler(async () => {
  const user = await prisma.userProfile.findFirst({
    include: { goals: true, rules: true },
  });
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
});

// POST /api/onboarding
const createProfile = withErrorHandler(async (req) => {
  const data = await req.json();
  const existing = await prisma.userProfile.findFirst();
  if (existing) {
    await prisma.userProfile.delete({ where: { id: existing.id } });
  }
  const user = await prisma.userProfile.create({
    data: {
      name: data.name,
      gender: data.gender,
      age: data.age,
      height: data.height,
      weight: data.weight,
      bodyFat: data.bodyFat || null,
      activityLevel: data.activityLevel,
      experienceLevel: data.experienceLevel,
    },
  });

  await prisma.fitnessGoal.create({
    data: {
      userId: user.id,
      goalType: data.goalType,
      startWeight: data.weight,
      targetWeight: data.targetWeight || null,
      priority: 'primary',
      status: 'active',
    },
  });

  if (data.rules && data.rules.length > 0) {
    await prisma.personalRule.createMany({
      data: data.rules.map((r: { ruleType: string; description: string }) => ({
        userId: user.id,
        ruleType: r.ruleType,
        description: r.description,
        isActive: true,
      })),
    });
  }

  return NextResponse.json({ user });
});

// GET /api/dashboard
const getDashboard = withErrorHandler(async () => {
  const user = await prisma.userProfile.findFirst({ include: { goals: true } });
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const goal = user.goals[0];
  const latestMetric = await prisma.bodyMetric.findFirst({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
  });

  const workoutDays = await prisma.workoutDay.findMany({
    where: {
      plan: { userId: user.id, status: 'active' },
      date: { lte: today },
    },
    orderBy: { date: 'desc' },
    take: 7,
  });
  const completed = workoutDays.filter(d => d.completed).length;
  const workoutRate = workoutDays.length > 0 ? Math.round((completed / workoutDays.length) * 100) : 0;

  const nutritionLogs = await prisma.nutritionLog.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    take: 7,
  });

  const nutritionPlan = await prisma.nutritionPlan.findFirst({
    where: { userId: user.id },
    orderBy: { startDate: 'desc' },
  });

  let avgCalories = 0, avgProtein = 0, avgWater = 0;
  if (nutritionLogs.length > 0) {
    avgCalories = Math.round(nutritionLogs.reduce((s, l) => s + l.calories, 0) / nutritionLogs.length);
    avgProtein = Math.round(nutritionLogs.reduce((s, l) => s + l.protein, 0) / nutritionLogs.length);
    avgWater = Math.round(nutritionLogs.reduce((s, l) => s + l.water, 0) / nutritionLogs.length);
  }

  const checkIns = await prisma.dailyCheckIn.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    take: 7,
  });
  const avgSleep = checkIns.length > 0 ? Math.round((checkIns.reduce((s, c) => s + (c.sleepHours || 0), 0) / checkIns.length) * 10) / 10 : 0;
  const avgStress = checkIns.length > 0 ? Math.round(checkIns.reduce((s, c) => s + (c.stress || 0), 0) / checkIns.length) : 0;

  const bodyMetrics = await prisma.bodyMetric.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    take: 14,
  });
  bodyMetrics.reverse();

  const latestInsight = await prisma.aiCoachInsight.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    user,
    goal,
    latestMetric,
    workoutRate,
    nutritionPlan,
    avgCalories,
    avgProtein,
    avgWater,
    avgSleep,
    avgStress,
    bodyMetrics,
    latestInsight,
  });
});

// GET /api/today
const getToday = withErrorHandler(async () => {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayWorkout = await prisma.workoutDay.findFirst({
    where: {
      plan: { userId: user.id, status: 'active' },
      date: {
        gte: today,
        lt: new Date(today.getTime() + 86400000),
      },
    },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  const nutritionPlan = await prisma.nutritionPlan.findFirst({
    where: { userId: user.id },
    orderBy: { startDate: 'desc' },
    include: { meals: true },
  });

  const todayLog = await prisma.nutritionLog.findFirst({
    where: {
      userId: user.id,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 86400000),
      },
    },
  });

  const todayCheckIn = await prisma.dailyCheckIn.findFirst({
    where: {
      userId: user.id,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 86400000),
      },
    },
  });

  return NextResponse.json({
    todayWorkout,
    nutritionPlan,
    todayLog,
    todayCheckIn,
  });
});

// POST /api/checkin
const createCheckIn = withErrorHandler(async (req) => {
  const data = await req.json();
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.dailyCheckIn.findFirst({
    where: {
      userId: user.id,
      date: { gte: today, lt: new Date(today.getTime() + 86400000) },
    },
  });

  let checkIn;
  if (existing) {
    checkIn = await prisma.dailyCheckIn.update({
      where: { id: existing.id },
      data,
    });
  } else {
    checkIn = await prisma.dailyCheckIn.create({
      data: { userId: user.id, date: today, ...data },
    });
  }

  return NextResponse.json({ checkIn });
});

// POST /api/nutrition
const logNutrition = withErrorHandler(async (req) => {
  const data = await req.json();
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.nutritionLog.findFirst({
    where: {
      userId: user.id,
      date: { gte: today, lt: new Date(today.getTime() + 86400000) },
    },
  });

  let log;
  if (existing) {
    log = await prisma.nutritionLog.update({
      where: { id: existing.id },
      data,
    });
  } else {
    log = await prisma.nutritionLog.create({
      data: { userId: user.id, date: today, ...data },
    });
  }

  return NextResponse.json({ log });
});

// POST /api/workout/log
const logWorkout = withErrorHandler(async (req) => {
  const data = await req.json();
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const { workoutDayId, completed, skippedReason, notes, exercises } = data;

  const wd = await prisma.workoutDay.findUnique({ where: { id: workoutDayId } });
  if (!wd) return NextResponse.json({ error: 'Workout day not found' }, { status: 404 });

  await prisma.workoutDay.update({
    where: { id: workoutDayId },
    data: { completed },
  });

  const log = await prisma.workoutLog.create({
    data: {
      userId: user.id,
      workoutDayId,
      date: new Date(),
      completed,
      skippedReason: skippedReason || null,
      notes: notes || null,
    },
  });

  if (completed && exercises) {
    for (const ex of exercises) {
      await prisma.exerciseLog.create({
        data: {
          workoutLogId: log.id,
          exerciseId: ex.exerciseId,
          setsCompleted: ex.setsCompleted,
          reps: ex.reps,
          weight: ex.weight || null,
          rpe: ex.rpe || null,
          notes: ex.notes || null,
        },
      });
    }
  }

  return NextResponse.json({ log });
});

// POST /api/body-metrics
const logBodyMetrics = withErrorHandler(async (req) => {
  const data = await req.json();
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const metric = await prisma.bodyMetric.create({
    data: { userId: user.id, ...data },
  });

  return NextResponse.json({ metric });
});

// GET /api/workout-plan
const getWorkoutPlan = withErrorHandler(async () => {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const plan = await prisma.workoutPlan.findFirst({
    where: { userId: user.id, status: 'active' },
    include: {
      days: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { date: 'asc' },
      },
    },
  });

  return NextResponse.json({ plan });
});

// GET /api/exercises
const getExercises = withErrorHandler(async () => {
  const exercises = await prisma.exercise.findMany({ orderBy: { category: 'asc' } });
  return NextResponse.json({ exercises });
});

// GET /api/progress
const getProgress = withErrorHandler(async () => {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const bodyMetrics = await prisma.bodyMetric.findMany({
    where: { userId: user.id },
    orderBy: { date: 'asc' },
  });

  const workoutLogs = await prisma.workoutLog.findMany({
    where: { userId: user.id },
    include: { exercises: { include: { exercise: true } }, workoutDay: true },
    orderBy: { date: 'desc' },
    take: 30,
  });

  const nutritionLogs = await prisma.nutritionLog.findMany({
    where: { userId: user.id },
    orderBy: { date: 'asc' },
    take: 30,
  });

  const nutritionPlan = await prisma.nutritionPlan.findFirst({
    where: { userId: user.id },
    orderBy: { startDate: 'desc' },
  });

  const progressRecords = await prisma.progressRecord.findMany({
    where: { userId: user.id },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json({
    bodyMetrics,
    workoutLogs,
    nutritionLogs,
    nutritionPlan,
    progressRecords,
  });
});

// GET /api/weekly-review?date=2024-01-01
const getWeeklyReview = withErrorHandler(async (req) => {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const url = new URL(req.url);
  const dateStr = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
  const endDate = new Date(dateStr);
  endDate.setHours(23, 59, 59, 999);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const workoutDays = await prisma.workoutDay.findMany({
    where: {
      plan: { userId: user.id },
      date: { gte: startDate, lte: endDate },
    },
  });
  const completed = workoutDays.filter(d => d.completed).length;

  const nutritionLogs = await prisma.nutritionLog.findMany({
    where: { userId: user.id, date: { gte: startDate, lte: endDate } },
  });
  const nutritionPlan = await prisma.nutritionPlan.findFirst({
    where: { userId: user.id },
    orderBy: { startDate: 'desc' },
  });

  const checkIns = await prisma.dailyCheckIn.findMany({
    where: { userId: user.id, date: { gte: startDate, lte: endDate } },
  });

  const bodyMetrics = await prisma.bodyMetric.findMany({
    where: { userId: user.id, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
  });

  const weightChange = bodyMetrics.length >= 2
    ? bodyMetrics[bodyMetrics.length - 1].weight! - bodyMetrics[0].weight!
    : 0;

  const avgCals = nutritionLogs.length > 0 ? Math.round(nutritionLogs.reduce((s, l) => s + l.calories, 0) / nutritionLogs.length) : 0;
  const avgProtein = nutritionLogs.length > 0 ? Math.round(nutritionLogs.reduce((s, l) => s + l.protein, 0) / nutritionLogs.length) : 0;
  const avgSleep = checkIns.length > 0 ? Math.round((checkIns.reduce((s, c) => s + (c.sleepHours || 0), 0) / checkIns.length) * 10) / 10 : 0;
  const avgEnergy = checkIns.length > 0 ? Math.round(checkIns.reduce((s, c) => s + (c.energy || 0), 0) / checkIns.length) : 0;
  const avgStress = checkIns.length > 0 ? Math.round(checkIns.reduce((s, c) => s + (c.stress || 0), 0) / checkIns.length) : 0;
  const avgMood = checkIns.length > 0 ? Math.round(checkIns.reduce((s, c) => s + (c.mood || 0), 0) / checkIns.length) : 0;
  const avgSoreness = checkIns.length > 0 ? Math.round(checkIns.reduce((s, c) => s + (c.soreness || 0), 0) / checkIns.length) : 0;

  return NextResponse.json({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    workoutsCompleted: completed,
    workoutsPlanned: workoutDays.length,
    avgCalories: avgCals,
    avgProtein: avgProtein,
    caloriesTarget: nutritionPlan?.caloriesTarget || 0,
    proteinTarget: nutritionPlan?.proteinTarget || 0,
    weightChange: Math.round(weightChange * 10) / 10,
    avgSleep,
    avgEnergy,
    avgStress,
    avgMood,
    avgSoreness,
    completionRate: workoutDays.length > 0 ? Math.round((completed / workoutDays.length) * 100) : 0,
    calorieAdherence: nutritionPlan ? Math.round((avgCals / nutritionPlan.caloriesTarget) * 100) : 0,
    proteinAdherence: nutritionPlan ? Math.round((avgProtein / nutritionPlan.proteinTarget) * 100) : 0,
  });
});

// GET /api/ai-insights
const getAiInsights = withErrorHandler(async () => {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const insights = await prisma.aiCoachInsight.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return NextResponse.json({ insights });
});

// POST /api/ai-insights
const createAiInsight = withErrorHandler(async (req) => {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const data = await req.json();
  const insight = await prisma.aiCoachInsight.create({
    data: {
      userId: user.id,
      type: data.type,
      title: data.title,
      content: data.content,
      recommendation: data.recommendation || null,
    },
  });

  return NextResponse.json({ insight });
});

// GET /api/rules
const getRules = withErrorHandler(async () => {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const rules = await prisma.personalRule.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ rules });
});

// POST /api/rules
const createRule = withErrorHandler(async (req) => {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const data = await req.json();
  const rule = await prisma.personalRule.create({
    data: {
      userId: user.id,
      ruleType: data.ruleType,
      description: data.description,
      isActive: true,
    },
  });

  return NextResponse.json({ rule });
});

// DELETE /api/rules?id=xxx
const deleteRule = withErrorHandler(async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.personalRule.delete({ where: { id } });
  return NextResponse.json({ success: true });
});

// PATCH /api/rules
const toggleRule = withErrorHandler(async (req) => {
  const data = await req.json();
  const rule = await prisma.workoutDay.findUnique({ where: { id: data.id } });
  if (!rule) {
    const r = await prisma.personalRule.findUnique({ where: { id: data.id } });
    if (r) {
      const updated = await prisma.personalRule.update({
        where: { id: data.id },
        data: { isActive: !r.isActive },
      });
      return NextResponse.json({ rule: updated });
    }
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
});

// GET /api/user-profile
const getUserProfile = withErrorHandler(async () => {
  const user = await prisma.userProfile.findFirst({
    include: { goals: true, rules: true, nutritionPlans: { orderBy: { startDate: 'desc' }, take: 1 } },
  });
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
});

// PATCH /api/user-profile
const updateUserProfile = withErrorHandler(async (req) => {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const data = await req.json();
  const updated = await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      name: data.name,
      gender: data.gender,
      age: data.age,
      height: data.height,
      weight: data.weight,
      bodyFat: data.bodyFat,
      activityLevel: data.activityLevel,
      experienceLevel: data.experienceLevel,
    },
  });

  return NextResponse.json({ user: updated });
});

const routes: Record<string, Record<string, Handler>> = {
  'GET /api/user': { GET: getUser },
  'GET /api/user-profile': { GET: getUserProfile },
  'PATCH /api/user-profile': { PATCH: updateUserProfile },
  'POST /api/onboarding': { POST: createProfile },
  'GET /api/dashboard': { GET: getDashboard },
  'GET /api/today': { GET: getToday },
  'POST /api/checkin': { POST: createCheckIn },
  'POST /api/nutrition': { POST: logNutrition },
  'POST /api/workout/log': { POST: logWorkout },
  'POST /api/body-metrics': { POST: logBodyMetrics },
  'GET /api/workout-plan': { GET: getWorkoutPlan },
  'GET /api/exercises': { GET: getExercises },
  'GET /api/progress': { GET: getProgress },
  'GET /api/weekly-review': { GET: getWeeklyReview },
  'GET /api/ai-insights': { GET: getAiInsights },
  'POST /api/ai-insights': { POST: createAiInsight },
  'GET /api/rules': { GET: getRules },
  'POST /api/rules': { POST: createRule },
  'DELETE /api/rules': { DELETE: deleteRule },
  'PATCH /api/rules': { PATCH: toggleRule },
};

// Next.js App Router: Each endpoint is a separate route.ts file
// This file exports handlers for individual route files
export { routes };
