import { prisma } from './prisma';

interface GenerateWorkoutPlanParams {
  userId: string;
  experienceLevel: string;
  daysPerWeek: number;
  timePerWorkout: number;
  gymAccess: boolean;
  weakBodyParts: string[];
  injuries: string;
}

const PUSH_EXERCISES = [
  { name: 'Đẩy Ngực Barbell', category: 'chest', mainMuscle: 'Ngực', secondaryMuscle: 'Tay Sau, Vai Trước', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Đẩy Ngực Dumbbell Ghế Dốc', category: 'chest', mainMuscle: 'Ngực Trên', secondaryMuscle: 'Tay Sau, Vai Trước', equipment: 'dumbbell', difficulty: 'intermediate' },
  { name: 'Ép Ngực Cable', category: 'chest', mainMuscle: 'Ngực', secondaryMuscle: 'Vai Trước', equipment: 'cable', difficulty: 'beginner' },
  { name: 'Đẩy Vai Barbell', category: 'shoulder', mainMuscle: 'Vai', secondaryMuscle: 'Tay Sau, Ngực Trên', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Nâng Vai Giữa', category: 'shoulder', mainMuscle: 'Vai Giữa', secondaryMuscle: 'Cầu Vai', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Đẩy Tay Sau Cable', category: 'triceps', mainMuscle: 'Tay Sau', secondaryMuscle: null, equipment: 'cable', difficulty: 'beginner' },
  { name: 'Đẩy Ngực Tay Hẹp', category: 'triceps', mainMuscle: 'Tay Sau', secondaryMuscle: 'Ngực', equipment: 'barbell', difficulty: 'advanced' },
  { name: 'Đẩy Vai Dumbbell', category: 'shoulder', mainMuscle: 'Vai', secondaryMuscle: 'Tay Sau', equipment: 'dumbbell', difficulty: 'intermediate' },
  { name: 'Máy Đẩy Ngực', category: 'chest', mainMuscle: 'Ngực', secondaryMuscle: 'Tay Sau', equipment: 'machine', difficulty: 'beginner' },
  { name: 'Nâng Vai Trước', category: 'shoulder', mainMuscle: 'Vai Trước', secondaryMuscle: 'Ngực Trên', equipment: 'dumbbell', difficulty: 'beginner' },
];

const PULL_EXERCISES = [
  { name: 'Hít Xà Đơn', category: 'back', mainMuscle: 'Xô', secondaryMuscle: 'Tay Trước', equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Chèo Barbell', category: 'back', mainMuscle: 'Lưng Giữa', secondaryMuscle: 'Tay Trước, Vai Sau', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Kéo Xô Máy', category: 'back', mainMuscle: 'Xô', secondaryMuscle: 'Tay Trước', equipment: 'cable', difficulty: 'beginner' },
  { name: 'Chèo Cable Ngồi', category: 'back', mainMuscle: 'Lưng Giữa', secondaryMuscle: 'Tay Trước', equipment: 'cable', difficulty: 'beginner' },
  { name: 'Cuốn Tạ Barbell', category: 'biceps', mainMuscle: 'Tay Trước', secondaryMuscle: 'Cẳng Tay', equipment: 'barbell', difficulty: 'beginner' },
  { name: 'Hammer Curl', category: 'biceps', mainMuscle: 'Tay Trước', secondaryMuscle: 'Cẳng Tay', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Kéo Mặt (Face Pull)', category: 'shoulder', mainMuscle: 'Vai Sau', secondaryMuscle: 'Xoay Vai, Cầu Vai', equipment: 'cable', difficulty: 'beginner' },
  { name: 'Chèo Dumbbell Một Tay', category: 'back', mainMuscle: 'Xô', secondaryMuscle: 'Tay Trước', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Cuốn Tạ Ghế Preacher', category: 'biceps', mainMuscle: 'Tay Trước', secondaryMuscle: null, equipment: 'machine', difficulty: 'intermediate' },
  { name: 'Chèo Dumbbell Một Tay', category: 'back', mainMuscle: 'Xô', secondaryMuscle: 'Tay Trước', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Kéo Mặt (Face Pull)', category: 'shoulder', mainMuscle: 'Vai Sau', secondaryMuscle: 'Xoay Vai, Cầu Vai', equipment: 'cable', difficulty: 'beginner' },
  { name: 'Chèo Cable Ngồi', category: 'back', mainMuscle: 'Lưng Giữa', secondaryMuscle: 'Tay Trước', equipment: 'cable', difficulty: 'beginner' },
];

const LEG_EXERCISES = [
  { name: 'Squat Barbell', category: 'legs', mainMuscle: 'Đùi Trước', secondaryMuscle: 'Mông, Đùi Sau', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Romanian Deadlift (RDL)', category: 'legs', mainMuscle: 'Đùi Sau', secondaryMuscle: 'Mông, Lưng Dưới', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Leg Press', category: 'legs', mainMuscle: 'Đùi Trước', secondaryMuscle: 'Mông', equipment: 'machine', difficulty: 'beginner' },
  { name: 'Walking Lunge', category: 'legs', mainMuscle: 'Đùi Trước', secondaryMuscle: 'Mông, Đùi Sau', equipment: 'dumbbell', difficulty: 'intermediate' },
  { name: 'Leg Curl', category: 'legs', mainMuscle: 'Đùi Sau', secondaryMuscle: null, equipment: 'machine', difficulty: 'beginner' },
  { name: 'Leg Extension', category: 'legs', mainMuscle: 'Đùi Trước', secondaryMuscle: null, equipment: 'machine', difficulty: 'beginner' },
  { name: 'Nhún Bắp Chân', category: 'legs', mainMuscle: 'Bắp Chân', secondaryMuscle: null, equipment: 'machine', difficulty: 'beginner' },
  { name: 'Hip Thrust', category: 'glutes', mainMuscle: 'Mông', secondaryMuscle: 'Đùi Sau', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Bulgarian Split Squat', category: 'legs', mainMuscle: 'Đùi Trước', secondaryMuscle: 'Mông', equipment: 'dumbbell', difficulty: 'advanced' },
  { name: 'Đạp Mông Cable', category: 'glutes', mainMuscle: 'Mông', secondaryMuscle: null, equipment: 'cable', difficulty: 'beginner' },
];

function getExercisesForMuscle(muscle: string): typeof PUSH_EXERCISES {
  const all = [...PUSH_EXERCISES, ...PULL_EXERCISES, ...LEG_EXERCISES];
  const m = muscle.toLowerCase();
  return all.filter(e =>
    e.mainMuscle.toLowerCase().includes(m) ||
    e.category.toLowerCase().includes(m) ||
    (e.secondaryMuscle && e.secondaryMuscle.toLowerCase().includes(m))
  );
}

function filterByDifficulty(exercises: typeof PUSH_EXERCISES, level: string) {
  if (level === 'advanced') return exercises;
  if (level === 'intermediate') return exercises.filter(e => e.difficulty !== 'advanced');
  return exercises.filter(e => e.difficulty === 'beginner');
}

function filterByInjury(exercises: typeof PUSH_EXERCISES, injuries: string) {
  if (!injuries) return exercises;
  const injuryLower = injuries.toLowerCase();
  if (injuryLower.includes('knee') || injuryLower.includes('đau gối')) {
    return exercises.filter(e => !['Squat Barbell', 'Leg Press', 'Walking Lunge', 'Bulgarian Split Squat'].includes(e.name));
  }
  if (injuryLower.includes('back') || injuryLower.includes('lưng') || injuryLower.includes('spine')) {
    return exercises.filter(e => !['Chèo Barbell', 'Romanian Deadlift (RDL)'].includes(e.name));
  }
  if (injuryLower.includes('shoulder') || injuryLower.includes('vai')) {
    return exercises.filter(e => !['Đẩy Vai Barbell', 'Đẩy Vai Dumbbell', 'Đẩy Ngực Barbell'].includes(e.name));
  }
  return exercises;
}

export async function generateWorkoutPlan(params: GenerateWorkoutPlanParams) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let splitType = 'push_pull_legs';
  if (params.daysPerWeek === 3) splitType = 'push_pull_legs';
  else if (params.daysPerWeek === 2) splitType = 'upper_lower';
  else if (params.daysPerWeek <= 4) splitType = 'upper_lower';
  else if (params.daysPerWeek >= 5) splitType = 'push_pull_legs';

  const plan = await prisma.workoutPlan.create({
    data: {
      userId: params.userId,
      name: `Lịch ${params.daysPerWeek} Ngày ${splitType === 'push_pull_legs' ? 'PPL' : 'Thân Trên/Thân Dưới'}`,
      type: splitType,
      startDate: today,
      daysPerWeek: params.daysPerWeek,
      status: 'active',
    },
  });

  const days: { dayIndex: number; date: Date; focus: string; notes: string | null; exercises: ReturnType<typeof selectExercisesForDay> }[] = [];

  const startOfWeek = new Date(today);
  const currentDay = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  if (splitType === 'push_pull_legs') {
    const dayConfigs = [
      { index: 0, focus: 'Đẩy - Ngực & Vai', pool: PUSH_EXERCISES },
      { index: 1, focus: 'Kéo - Lưng & Tay Trước', pool: PULL_EXERCISES },
      { index: 2, focus: 'Chân - Đùi Trước & Mông', pool: LEG_EXERCISES },
      { index: 3, focus: 'Đẩy - Vai & Tay Sau', pool: PUSH_EXERCISES },
      { index: 4, focus: 'Kéo - Xô & Vai Sau', pool: PULL_EXERCISES },
      { index: 5, focus: 'Chân - Đùi Sau & Mông', pool: LEG_EXERCISES },
      { index: 6, focus: 'Toàn Thân - Compound', pool: [...PUSH_EXERCISES, ...PULL_EXERCISES, ...LEG_EXERCISES].slice(0, 10) },
    ];

    for (let week = 0; week < 4; week++) {
      for (let i = 0; i < params.daysPerWeek && i < dayConfigs.length; i++) {
        const dayConfig = dayConfigs[i];
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + week * 7 + dayConfig.index);
        const exercises = selectExercisesForDay(dayConfig.pool, params, dayConfig.focus);
        days.push({ dayIndex: d.getDay(), date: d, focus: dayConfig.focus, notes: null, exercises });
      }
    }
  } else {
    const dayConfigs = [
      { index: 0, focus: 'Thân Trên - Đẩy', pool: PUSH_EXERCISES },
      { index: 1, focus: 'Thân Dưới - Đùi Trước', pool: LEG_EXERCISES },
      { index: 2, focus: 'Thân Trên - Kéo', pool: PULL_EXERCISES },
      { index: 3, focus: 'Thân Dưới - Chuỗi Sau', pool: LEG_EXERCISES },
    ];

    for (let week = 0; week < 4; week++) {
      for (let i = 0; i < params.daysPerWeek && i < 4; i++) {
        const dayConfig = dayConfigs[i];
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + week * 7 + dayConfig.index);
        const exercises = selectExercisesForDay(dayConfig.pool, params, dayConfig.focus);
        days.push({ dayIndex: d.getDay(), date: d, focus: dayConfig.focus, notes: null, exercises });
      }
    }
  }

  for (const day of days) {
    const workoutDay = await prisma.workoutDay.create({
      data: {
        planId: plan.id,
        dayIndex: day.dayIndex,
        date: day.date,
        focus: day.focus,
        notes: day.notes,
      },
    });

    for (const [idx, ex] of day.exercises.entries()) {
      const exercise = await prisma.exercise.findFirst({ where: { name: ex.name } });
      if (exercise) {
        await prisma.workoutExercise.create({
          data: {
            workoutDayId: workoutDay.id,
            exerciseId: exercise.id,
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds,
            rpe: ex.rpe,
            tempo: ex.tempo,
            notes: null,
            order: idx,
          },
        });
      }
    }
  }

  return plan;
}

function selectExercisesForDay(
  pool: typeof PUSH_EXERCISES,
  params: GenerateWorkoutPlanParams,
  _focus: string
) {
  let exercises = [...pool];
  exercises = filterByDifficulty(exercises, params.experienceLevel);
  exercises = filterByInjury(exercises, params.injuries);

  if (params.weakBodyParts.length > 0) {
    const weakEx = params.weakBodyParts.flatMap(p => getExercisesForMuscle(p));
    const weakFiltered = filterByDifficulty(weakEx, params.experienceLevel);
    const weakFilteredInjury = filterByInjury(weakFiltered, params.injuries);
    const existing = new Set(exercises.map(e => e.name));
    for (const e of weakFilteredInjury) {
      if (!existing.has(e.name)) exercises.push(e);
    }
  }

  const maxExercises = Math.min(params.timePerWorkout <= 45 ? 5 : params.timePerWorkout <= 60 ? 6 : 7, exercises.length);
  const selected = exercises.slice(0, maxExercises);

  return selected.map((e, i) => ({
    name: e.name,
    exerciseId: '',
    sets: i < 3 ? 4 : 3,
    reps: i < 3 ? '8-12' : '10-15',
    restSeconds: i < 3 ? 90 : 60,
    rpe: i < 3 ? 8 : 7,
    tempo: '2-0-2',
  }));
}

export async function generateNutritionPlan(params: {
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}) {
  const plan = await prisma.nutritionPlan.create({
    data: {
      userId: params.userId,
      caloriesTarget: params.calories,
      proteinTarget: params.protein,
      carbTarget: params.carbs,
      fatTarget: params.fat,
      waterTarget: params.water,
      startDate: new Date(),
    },
  });

  const meals = getMealTemplates(params.calories, params.protein, params.carbs, params.fat);
  for (const meal of meals) {
    await prisma.meal.create({
      data: {
        nutritionPlanId: plan.id,
        name: meal.name,
        mealType: meal.mealType,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        ingredients: meal.ingredients,
        instructions: meal.instructions,
      },
    });
  }

  return plan;
}

function getMealTemplates(calories: number, protein: number, carbs: number, fat: number) {
  const pct = protein / 4;
  const cct = carbs / 3;
  const fct = fat / 2;

  return [
    {
      name: 'Yến Mạch Trứng',
      mealType: 'breakfast',
      calories: Math.round(calories * 0.25),
      protein: Math.round(pct * 0.3),
      carbs: Math.round(cct * 0.35),
      fat: Math.round(fct * 0.25),
      ingredients: '80g yến mạch, 2 quả trứng, 100ml sữa, 1 quả chuối',
      instructions: 'Nấu yến mạch với sữa. Chiên trứng riêng. Cắt chuối lên trên.',
    },
    {
      name: 'Cơm Gà',
      mealType: 'lunch',
      calories: Math.round(calories * 0.3),
      protein: Math.round(pct * 0.35),
      carbs: Math.round(cct * 0.35),
      fat: Math.round(fct * 0.3),
      ingredients: '150g ức gà, 200g cơm trắng, 100g bông cải xanh, 1 muỗng dầu olive',
      instructions: 'Nướng ức gà, nấu cơm, xào bông cải với dầu olive.',
    },
    {
      name: 'Sữa Chua Hy Lạp Hạt',
      mealType: 'snack',
      calories: Math.round(calories * 0.15),
      protein: Math.round(pct * 0.15),
      carbs: Math.round(cct * 0.1),
      fat: Math.round(fct * 0.2),
      ingredients: '200g sữa chua Hy Lạp, 30g hạnh nhân, 1 muỗng mật ong',
      instructions: 'Trộn sữa chua với hạt và mật ong.',
    },
    {
      name: 'Cá Hồi Khoai Lang',
      mealType: 'dinner',
      calories: Math.round(calories * 0.3),
      protein: Math.round(pct * 0.2),
      carbs: Math.round(cct * 0.2),
      fat: Math.round(fct * 0.25),
      ingredients: '150g cá hồi phi lê, 200g khoai lang, rau xanh trộn',
      instructions: 'Nướng cá hồi và khoai lang. Dọn kèm rau xanh tươi.',
    },
  ];
}
