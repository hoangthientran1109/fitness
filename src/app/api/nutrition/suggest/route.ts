export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDailyMeals } from '@/lib/ai-coach';

export async function POST(req: Request) {
  try {
    const user = await prisma.userProfile.findFirst();
    if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Lấy nutrition plan
    const nutritionPlan = await prisma.nutritionPlan.findFirst({
      where: { userId: user.id },
      orderBy: { startDate: 'desc' },
      include: { meals: true },
    });

    if (!nutritionPlan) {
      return NextResponse.json({ error: 'Chưa có kế hoạch dinh dưỡng. Hoàn thành onboarding trước.' }, { status: 400 });
    }

    // Lấy log hôm nay (đã ăn gì chưa)
    const todayLog = await prisma.nutritionLog.findFirst({
      where: { userId: user.id, date: { gte: today, lt: tomorrow } },
    });

    // Lấy buổi tập hôm nay
    const todayWorkout = await prisma.workoutDay.findFirst({
      where: { plan: { userId: user.id, status: 'active' }, date: { gte: today, lt: tomorrow } },
    });

    // Lấy rules để tìm dị ứng/tránh
    const rules = await prisma.personalRule.findMany({
      where: { userId: user.id, ruleType: 'nutrition', isActive: true },
    });

    const context = {
      caloriesTarget: nutritionPlan.caloriesTarget,
      proteinTarget: nutritionPlan.proteinTarget,
      carbTarget: nutritionPlan.carbTarget,
      fatTarget: nutritionPlan.fatTarget,
      waterTarget: nutritionPlan.waterTarget,
      todayCaloriesSoFar: todayLog?.calories || 0,
      todayProteinSoFar: todayLog?.protein || 0,
      todayCarbsSoFar: todayLog?.carbs || 0,
      todayFatSoFar: todayLog?.fat || 0,
      foodAllergies: '',
      foodsToAvoid: rules.map(r => r.description).join(', '),
      mealFrequency: nutritionPlan.meals.length > 0 ? nutritionPlan.meals.length : 4,
      isWorkoutDay: !!todayWorkout,
      workoutFocus: todayWorkout?.focus || undefined,
    };

    const meals = await generateDailyMeals(context);

    return NextResponse.json({ meals, isWorkoutDay: context.isWorkoutDay, workoutFocus: context.workoutFocus });
  } catch (err: any) {
    console.error('[Nutrition Suggest] Error:', err.message);
    return NextResponse.json({ error: 'Lỗi tạo thực đơn', detail: err.message }, { status: 500 });
  }
}
