import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateFullTargets } from '@/lib/fitness-calculator';
import { generateWorkoutPlan, generateNutritionPlan } from '@/lib/plan-generators';
import { ActivityLevel, ExperienceLevel, GoalType } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const existing = await prisma.userProfile.findFirst();
    if (existing) {
      await prisma.exerciseLog.deleteMany({ where: { workoutLog: { userId: existing.id } } });
      await prisma.workoutLog.deleteMany({ where: { userId: existing.id } });
      await prisma.workoutExercise.deleteMany({ where: { workoutDay: { plan: { userId: existing.id } } } });
      await prisma.workoutDay.deleteMany({ where: { plan: { userId: existing.id } } });
      await prisma.workoutPlan.deleteMany({ where: { userId: existing.id } });
      await prisma.meal.deleteMany({ where: { plan: { userId: existing.id } } });
      await prisma.nutritionPlan.deleteMany({ where: { userId: existing.id } });
      await prisma.nutritionLog.deleteMany({ where: { userId: existing.id } });
      await prisma.bodyMetric.deleteMany({ where: { userId: existing.id } });
      await prisma.dailyCheckIn.deleteMany({ where: { userId: existing.id } });
      await prisma.progressRecord.deleteMany({ where: { userId: existing.id } });
      await prisma.aiCoachInsight.deleteMany({ where: { userId: existing.id } });
      await prisma.fitnessGoal.deleteMany({ where: { userId: existing.id } });
      await prisma.personalRule.deleteMany({ where: { userId: existing.id } });
      await prisma.userProfile.delete({ where: { id: existing.id } });
    }

    const user = await prisma.userProfile.create({
      data: {
        name: data.name,
        gender: data.gender || 'male',
        age: data.age,
        height: data.height,
        weight: data.weight,
        bodyFat: data.bodyFat || null,
        activityLevel: data.activityLevel || 'moderately_active',
        experienceLevel: data.experienceLevel || 'intermediate',
      },
    });

    await prisma.fitnessGoal.create({
      data: {
        userId: user.id,
        goalType: data.goalType || 'body_recomposition',
        startWeight: data.weight,
        targetWeight: data.targetWeight || null,
        priority: 'primary',
        status: 'active',
      },
    });

    if (data.rules?.length > 0) {
      await prisma.personalRule.createMany({
        data: data.rules.map((r: any) => ({
          userId: user.id,
          ruleType: r.ruleType || 'training',
          description: r.description,
          isActive: true,
        })),
      });
    }

    // Generate workout plan
    let workoutPlan = null;
    try {
      workoutPlan = await generateWorkoutPlan({
        userId: user.id,
        experienceLevel: user.experienceLevel,
        daysPerWeek: data.trainingDaysPerWeek || 4,
        timePerWorkout: data.timePerWorkout || 60,
        gymAccess: data.gymAccess !== false,
        weakBodyParts: data.weakBodyParts || [],
        injuries: data.injuries || '',
      });
    } catch (e) {
      console.error('Failed to generate workout plan:', e);
    }

    // Calculate macros & generate nutrition plan
    let nutritionPlan = null;
    try {
      if (data.activityLevel && data.goalType) {
        const macros = calculateFullTargets(
          user.gender,
          user.weight,
          user.height,
          user.age,
          user.activityLevel as ActivityLevel,
          data.goalType as GoalType,
        );
        nutritionPlan = await generateNutritionPlan({
          userId: user.id,
          calories: macros.calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          water: macros.water,
        });
      }
    } catch (e) {
      console.error('Failed to generate nutrition plan:', e);
    }

    // Seed initial body metric
    try {
      await prisma.bodyMetric.create({
        data: {
          userId: user.id,
          date: new Date(),
          weight: user.weight,
          bodyFat: user.bodyFat,
        },
      });
    } catch (e) {
      console.error('Failed to seed body metric:', e);
    }

    // Seed welcome AI insight
    try {
      await prisma.aiCoachInsight.create({
        data: {
          userId: user.id,
          type: 'encouragement',
          title: 'Chào Mừng Đến Với Personal Fitness OS!',
          content: `Kế hoạch ${data.goalType === 'fat_loss' ? 'giảm mỡ' : data.goalType === 'muscle_gain' ? 'tăng cơ' : data.goalType === 'body_recomposition' ? 'tái cấu trúc cơ thể' : 'fitness'} của bạn đã sẵn sàng. Bạn có lịch tập ${data.trainingDaysPerWeek || 4} ngày/tuần và chỉ tiêu dinh dưỡng được tính toán riêng cho mục tiêu của bạn.`,
          recommendation: 'Bắt đầu với buổi tập hôm nay, ghi nhận bữa ăn và hoàn thành điểm danh đầu tiên. HLV AI sẽ điều chỉnh dựa trên phản hồi của bạn.',
        },
      });
    } catch (e) {
      console.error('Failed to seed AI insight:', e);
    }

    return NextResponse.json({
      user,
      workoutPlan: !!workoutPlan,
      nutritionPlan: !!nutritionPlan,
    });
  } catch (err: any) {
    console.error('Onboarding error:', err);
    return NextResponse.json({ error: err.message || 'Onboarding failed' }, { status: 500 });
  }
}
