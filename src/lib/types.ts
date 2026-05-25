export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type GoalType = 'fat_loss' | 'muscle_gain' | 'body_recomposition' | 'strength' | 'general_health';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutSplitType = 'push_pull_legs' | 'upper_lower' | 'full_body' | 'strength' | 'hypertrophy' | 'custom';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
export type EquipmentType = 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'cable' | 'bodyweight' | 'bands' | 'smith_machine';
export type RuleType = 'training' | 'nutrition' | 'recovery' | 'lifestyle';
export type InsightType = 'daily_suggestion' | 'weekly_review' | 'warning' | 'adjustment' | 'encouragement';
export type DashboardStatus = 'ON_TRACK' | 'NEED_ADJUSTMENT' | 'OFF_TRACK' | 'RECOVERY_NEEDED';

export interface OnboardingData {
  name: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  bodyFat?: number;
  activityLevel: ActivityLevel;
  experienceLevel: ExperienceLevel;
  goalType: GoalType;
  trainingDaysPerWeek: number;
  timePerWorkout: number;
  gymAccess: boolean;
  equipment: EquipmentType[];
  weakBodyParts: string[];
  injuries: string;
  foodAllergies: string;
  foodsToAvoid: string;
  mealFrequency: number;
  wakeUpTime: string;
  sleepTime: string;
  stressLevel: number;
  avgSleepHours: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}
