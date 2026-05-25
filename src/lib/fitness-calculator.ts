import { ActivityLevel, GoalType, MacroTargets } from './types';

export function calculateBMR(gender: string, weight: number, height: number, age: number): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
}

export function calculateMacroTargets(tdee: number, weight: number, goalType: GoalType): { calories: number; protein: number; carbs: number; fat: number } {
  let calories = tdee;
  let protein = 0;
  let fat = 0;

  switch (goalType) {
    case 'fat_loss':
      calories = tdee - 400;
      protein = weight * 2.0;
      fat = weight * 0.8;
      break;
    case 'muscle_gain':
      calories = tdee + 250;
      protein = weight * 1.9;
      fat = weight * 1.0;
      break;
    case 'body_recomposition':
      calories = Math.round(tdee * 0.97);
      protein = weight * 2.1;
      fat = weight * 0.9;
      break;
    case 'strength':
      calories = tdee + 150;
      protein = weight * 1.8;
      fat = weight * 1.0;
      break;
    case 'general_health':
    default:
      calories = tdee;
      protein = weight * 1.2;
      fat = weight * 0.8;
      break;
  }

  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbCals = calories - proteinCals - fatCals;
  const carbs = Math.max(0, Math.round(carbCals / 4));

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs,
    fat: Math.round(fat),
  };
}

export function calculateWaterTarget(weight: number, _activityLevel: ActivityLevel): number {
  return Math.round(weight * 35);
}

export function calculateFullTargets(gender: string, weight: number, height: number, age: number, activityLevel: ActivityLevel, goalType: GoalType): MacroTargets {
  const bmr = calculateBMR(gender, weight, height, age);
  const tdee = calculateTDEE(bmr, activityLevel);
  const macros = calculateMacroTargets(tdee, weight, goalType);
  const water = calculateWaterTarget(weight, activityLevel);
  return { ...macros, water };
}
