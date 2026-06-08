export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDailyMeals } from '@/lib/ai-coach';
import { generateMealPlan, formatMealIngredients, formatMealInstructions } from '@/lib/meal-engine';

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

    // Lấy buổi tập hôm nay
    const todayWorkout = await prisma.workoutDay.findFirst({
      where: { plan: { userId: user.id, status: 'active' }, date: { gte: today, lt: tomorrow } },
    });

    const isWorkoutDay = !!todayWorkout;
    const mealFrequency = Math.max(4, Math.min(5, Math.round(nutritionPlan.caloriesTarget / 600)));

    // Use Meal Engine: Macro Target → Food Selection → Meal Generation
    const generatedMeals = generateMealPlan(
      {
        calories: nutritionPlan.caloriesTarget,
        protein: nutritionPlan.proteinTarget,
        carbs: nutritionPlan.carbTarget,
        fat: nutritionPlan.fatTarget,
      },
      mealFrequency,
      isWorkoutDay
    );

    const meals = generatedMeals.map(m => ({
      name: m.name,
      mealType: m.mealType,
      calories: m.totalMacros.calories,
      protein: m.totalMacros.protein,
      carbs: m.totalMacros.carbs,
      fat: m.totalMacros.fat,
      ingredients: formatMealIngredients(m),
      instructions: formatMealInstructions(m),
      items: m.items.map(i => ({
        foodName: i.food.nameVi,
        grams: i.grams,
        calories: i.macros.calories,
        protein: i.macros.protein,
        carbs: i.macros.carbs,
        fat: i.macros.fat,
      })),
    }));

    // Calculate daily totals
    const dailyTotal = {
      calories: meals.reduce((s, m) => s + m.calories, 0),
      protein: meals.reduce((s, m) => s + m.protein, 0),
      carbs: meals.reduce((s, m) => s + m.carbs, 0),
      fat: meals.reduce((s, m) => s + m.fat, 0),
    };

    return NextResponse.json({
      meals,
      isWorkoutDay,
      workoutFocus: todayWorkout?.focus || undefined,
      dailyTotal,
      targets: {
        calories: nutritionPlan.caloriesTarget,
        protein: nutritionPlan.proteinTarget,
        carbs: nutritionPlan.carbTarget,
        fat: nutritionPlan.fatTarget,
      },
    });
  } catch (err: any) {
    console.error('[Nutrition Suggest] Error:', err.message);
    return NextResponse.json({ error: 'Lỗi tạo thực đơn', detail: err.message }, { status: 500 });
  }
}
