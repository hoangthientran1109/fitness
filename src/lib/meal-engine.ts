// Meal Engine — Macro-Target-First Generation
import { FOOD_DATABASE, FoodItem, calcMacro } from './food-database';

export interface MealItem {
  food: FoodItem;
  grams: number;
  macros: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
}

export interface GeneratedMeal {
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  items: MealItem[];
  totalMacros: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
}

export interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const PROTEIN_SOURCES: FoodItem[] = ['chicken_breast', 'lean_beef', 'salmon', 'tuna', 'tilapia', 'pork_lean', 'shrimp', 'whole_egg', 'egg_whites', 'tofu', 'greek_yogurt', 'whey']
  .map(n => FOOD_DATABASE.find(f => f.name === n)!)
  .filter(Boolean);

const CARB_SOURCES: FoodItem[] = ['white_rice', 'brown_rice', 'oats', 'potato', 'sweet_potato', 'bread_wholewheat', 'bread_white', 'rice_noodle', 'corn']
  .map(n => FOOD_DATABASE.find(f => f.name === n)!)
  .filter(Boolean);

const FAT_SOURCES: FoodItem[] = ['almonds', 'cashews', 'peanut_butter', 'olive_oil', 'avocado', 'whole_egg']
  .map(n => FOOD_DATABASE.find(f => f.name === n)!)
  .filter(Boolean);

const VEG_SOURCES: FoodItem[] = ['broccoli', 'spinach', 'lettuce', 'tomato', 'cucumber', 'carrot']
  .map(n => FOOD_DATABASE.find(f => f.name === n)!)
  .filter(Boolean);

const FRUIT_SOURCES: FoodItem[] = ['banana', 'apple']
  .map(n => FOOD_DATABASE.find(f => f.name === n)!)
  .filter(Boolean);

/**
 * Select foods to hit macro targets, divided into meals.
 * Algorithm:
 * 1. Determine grams of protein needed → select protein foods
 * 2. Determine grams of carbs needed → select carb foods
 * 3. Determine grams of fat needed → select fat foods (accounting for fat from protein/carb sources)
 * 4. Divide across meals
 */
export function generateMealPlan(target: MacroTarget, mealCount: number = 4, isWorkoutDay: boolean = true): GeneratedMeal[] {
  // Step 1: Allocate macros per meal
  const mealTypes: GeneratedMeal['mealType'][] = determineMealTypes(mealCount, isWorkoutDay);
  const meals: GeneratedMeal[] = [];

  // Daily macro allocation (% per meal)
  let remainingProtein = target.protein;
  let remainingCarbs = target.carbs;
  let remainingFat = target.fat;

  // Pre-allocate fat from cooking oil (used in most meals)
  const cookingOil = FAT_SOURCES.find(f => f.name === 'olive_oil')!;
  const oilPerMeal = Math.floor(15 / mealCount); // ~15ml total cooking oil

  const macroPerMeal = mealTypes.map((type, i) => {
    const isBreakfast = type === 'breakfast';
    const isLunch = type === 'lunch';
    const isDinner = type === 'dinner';
    const isSnack = type === 'snack' || type === 'pre_workout' || type === 'post_workout';

    let calPct: number, proPct: number, carbPct: number;

    if (isBreakfast) {
      calPct = 0.25; proPct = 0.25; carbPct = 0.3;
    } else if (isLunch) {
      calPct = 0.30; proPct = 0.30; carbPct = 0.30;
    } else if (isDinner) {
      calPct = 0.28; proPct = 0.25; carbPct = 0.25;
    } else {
      calPct = 0.17 / mealTypes.filter(t => t === 'snack' || t === 'pre_workout' || t === 'post_workout').length;
      proPct = 0.20 / mealTypes.filter(t => t === 'snack' || t === 'pre_workout' || t === 'post_workout').length;
      carbPct = 0.15 / mealTypes.filter(t => t === 'snack' || t === 'pre_workout' || t === 'post_workout').length;
    }

    return {
      type,
      targetProtein: Math.round(target.protein * proPct),
      targetCarbs: Math.round(target.carbs * carbPct),
      targetFat: Math.round(target.fat * calPct * 0.5), // fat varies, rough alloc
      targetCalories: Math.round(target.calories * calPct),
    };
  });

  // Step 2: Build each meal by selecting foods
  const usedProteins: FoodItem[] = [];
  const usedCarbs: FoodItem[] = [];

  for (let i = 0; i < mealTypes.length; i++) {
    const mp = macroPerMeal[i];
    const items: MealItem[] = [];
    let totalPro = 0, totalCarb = 0, totalFat = 0, totalCal = 0, totalFiber = 0;

    // Select protein source (rotate)
    const proteinSrc = selectBestProtein(mp.targetProtein, usedProteins);
    if (proteinSrc.length > 0) {
      for (const { food, grams } of proteinSrc) {
        const m = calcMacro(food, grams);
        items.push({ food, grams, macros: m });
        totalPro += m.protein; totalCarb += m.carbs; totalFat += m.fat; totalCal += m.calories; totalFiber += m.fiber;
        usedProteins.push(food);
      }
    }

    // Select carb source (rotate)
    const carbSrc = selectBestCarb(mp.targetCarbs - totalCarb, usedCarbs, i === 0);
    if (carbSrc.length > 0) {
      for (const { food, grams } of carbSrc) {
        const m = calcMacro(food, grams);
        items.push({ food, grams, macros: m });
        totalPro += m.protein; totalCarb += m.carbs; totalFat += m.fat; totalCal += m.calories; totalFiber += m.fiber;
        usedCarbs.push(food);
      }
    }

    // Add vegetables (always, for fiber + satiety)
    if (mealTypes[i] === 'lunch' || mealTypes[i] === 'dinner' || mealTypes[i] === 'breakfast') {
      const vegIdx = i % VEG_SOURCES.length;
      const veg = VEG_SOURCES[vegIdx];
      const vegGrams = veg.servingGrams;
      const vegM = calcMacro(veg, vegGrams);
      items.push({ food: veg, grams: vegGrams, macros: vegM });
      totalPro += vegM.protein; totalCarb += vegM.carbs; totalFat += vegM.fat; totalCal += vegM.calories; totalFiber += vegM.fiber;
    }

    // Add cooking oil for lunch/dinner
    if (mealTypes[i] === 'lunch' || mealTypes[i] === 'dinner') {
      const oilM = calcMacro(cookingOil, oilPerMeal);
      items.push({ food: cookingOil, grams: oilPerMeal, macros: oilM });
      totalFat += oilM.fat; totalCal += oilM.calories;
    }

    // Add fruit for snacks/breakfast
    if (mealTypes[i] === 'snack' || mealTypes[i] === 'breakfast') {
      const fruitIdx = i % FRUIT_SOURCES.length;
      const fruit = FRUIT_SOURCES[fruitIdx];
      const fruitM = calcMacro(fruit, fruit.servingGrams);
      items.push({ food: fruit, grams: fruit.servingGrams, macros: fruitM });
      totalCarb += fruitM.carbs; totalCal += fruitM.calories; totalFiber += fruitM.fiber;
    }

    const mealName = buildMealName(items, mealTypes[i]);

    meals.push({
      name: mealName,
      mealType: mealTypes[i],
      items,
      totalMacros: {
        calories: Math.round(totalCal),
        protein: Math.round(totalPro),
        carbs: Math.round(totalCarb),
        fat: Math.round(totalFat),
        fiber: Math.round(totalFiber),
      },
    });
  }

  return meals;
}

function determineMealTypes(mealCount: number, isWorkoutDay: boolean): GeneratedMeal['mealType'][] {
  if (mealCount <= 0) mealCount = 4;
  if (mealCount >= 5 && isWorkoutDay) return ['breakfast', 'lunch', 'pre_workout', 'dinner', 'snack'];
  if (mealCount >= 5) return ['breakfast', 'lunch', 'snack', 'dinner', 'snack'];
  if (mealCount === 4 && isWorkoutDay) return ['breakfast', 'lunch', 'pre_workout', 'dinner'];
  if (mealCount === 4) return ['breakfast', 'lunch', 'snack', 'dinner'];
  if (mealCount === 3) return ['breakfast', 'lunch', 'dinner'];
  return ['breakfast', 'lunch', 'dinner', 'snack'];
}

function selectBestProtein(targetProtein: number, usedSources: FoodItem[]): { food: FoodItem; grams: number }[] {
  // Rotate: prefer unused sources first
  const available = PROTEIN_SOURCES.filter(f => !usedSources.some(u => u.name === f.name));
  const pool = available.length >= 3 ? available : [...available, ...PROTEIN_SOURCES];

  // Pick 1-2 protein sources to hit target
  const primary = pool[0];
  const needed = targetProtein;
  const gramsNeeded = Math.round((needed / primary.proteinPer100g) * 100);

  // Clamp to realistic serving sizes (100-250g)
  let grams = Math.max(100, Math.min(250, gramsNeeded));
  grams = Math.round(grams / 50) * 50; // Round to nearest 50g

  let proFromPrimary = Math.round(primary.proteinPer100g * grams / 100);
  const result: { food: FoodItem; grams: number }[] = [{ food: primary, grams }];

  // If protein still low, add eggs as secondary
  if (proFromPrimary < targetProtein - 5 && pool.length > 1) {
    const eggs = FOOD_DATABASE.find(f => f.name === 'whole_egg')!;
    const eggCount = Math.min(3, Math.round((targetProtein - proFromPrimary) / (eggs.proteinPer100g * 0.5)));
    if (eggCount > 0) {
      const eggGrams = eggCount * 50;
      result.push({ food: eggs, grams: eggGrams });
    }
  }

  return result;
}

function selectBestCarb(targetCarbs: number, usedSources: FoodItem[], isBreakfast: boolean): { food: FoodItem; grams: number }[] {
  const available = CARB_SOURCES.filter(f => !usedSources.some(u => u.name === f.name));
  const pool = available.length >= 2 ? available : [...available, ...CARB_SOURCES];

  let primary: FoodItem;
  if (isBreakfast) {
    primary = pool.find(f => f.name === 'oats') || pool.find(f => f.name === 'bread_wholewheat') || pool[0];
  } else {
    primary = pool.find(f => f.name === 'white_rice' || f.name === 'brown_rice') || pool[0];
  }

  // Ensure primary is found
  if (!primary) primary = CARB_SOURCES[0];

  const gramsNeeded = Math.round((targetCarbs / primary.carbsPer100g) * 100);
  let grams = Math.max(100, Math.min(250, gramsNeeded));
  grams = Math.round(grams / 25) * 25;

  return [{ food: primary, grams }];
}

function buildMealName(items: MealItem[], type: string): string {
  const typeLabels: Record<string, string> = {
    breakfast: 'Sáng', lunch: 'Trưa', dinner: 'Tối', snack: 'Bữa Phụ',
    pre_workout: 'Pre-Workout', post_workout: 'Post-Workout',
  };
  const mainFoods = items.filter(i => i.food.category === 'protein' || i.food.category === 'carb').slice(0, 2);
  const names = mainFoods.map(i => {
    const m = calcMacro(i.food, i.grams);
    return `${i.food.nameVi} ${i.grams}g (${m.calories} cal, ${m.protein}g P)`;
  });
  return names.join(' + ') || `${typeLabels[type] || 'Bữa'} gợi ý`;
}

/** Format meal items for display */
export function formatMealIngredients(meal: GeneratedMeal): string {
  return meal.items.map(i => `${i.grams}g ${i.food.nameVi}`).join(', ');
}

export function formatMealInstructions(meal: GeneratedMeal): string {
  const instructions: Record<string, string> = {
    chicken_breast: 'Luộc hoặc nướng ức gà với ít muối tiêu',
    lean_beef: 'Xào bò nhanh tay với tỏi, không dầu nhiều',
    salmon: 'Nướng hoặc hấp cá hồi với chanh, tiêu',
    tuna: 'Cá ngừ hộp ngâm nước - để ráo, trộn salad',
    tilapia: 'Hấp cá rô phi với gừng, hành',
    pork_lean: 'Luộc hoặc nướng thịt heo nạc',
    shrimp: 'Luộc hoặc hấp tôm, chấm muối tiêu chanh',
    whole_egg: 'Luộc 7 phút hoặc ốp la với ít dầu',
    egg_whites: 'Luộc hoặc hấp lòng trắng trứng',
    white_rice: 'Nấu cơm trắng như bình thường',
    brown_rice: 'Nấu gạo lứt với nhiều nước hơn cơm trắng',
    oats: 'Nấu yến mạch với nước hoặc sữa, thêm trái cây',
    potato: 'Luộc hoặc hấp khoai tây, không chiên',
    sweet_potato: 'Luộc hoặc nướng khoai lang',
    greek_yogurt: 'Ăn trực tiếp hoặc trộn với trái cây',
    broccoli: 'Hấp hoặc luộc bông cải, không nấu quá chín',
    spinach: 'Xào nhanh với tỏi hoặc ăn sống làm salad',
  };

  const lines: string[] = [];
  let hasInstructions = false;

  for (const item of meal.items) {
    const instr = instructions[item.food.name];
    if (instr) {
      lines.push(`${item.food.nameVi} (${item.grams}g): ${instr}`);
      hasInstructions = true;
    }
  }

  if (!hasInstructions) lines.push('Chuẩn bị nguyên liệu, nấu chín và thưởng thức.');

  return lines.join('; ');
}

// ========== MEAL SWAP ==========

export interface SwapOption {
  food: FoodItem;
  grams: number;
  macros: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
}

export function getSwapOptions(sourceFoodName: string, currentGrams: number): SwapOption[] {
  const source = FOOD_DATABASE.find(f => f.name === sourceFoodName);
  if (!source) return [];

  const sourceMacro = calcMacro(source, currentGrams);
  const sourceProtein = sourceMacro.protein;
  const sourceCalories = sourceMacro.calories;

  // Find alternative foods in the same category
  let alternatives: FoodItem[];
  if (source.category === 'protein') {
    alternatives = PROTEIN_SOURCES.filter(f => f.name !== source.name);
  } else if (source.category === 'carb') {
    alternatives = CARB_SOURCES.filter(f => f.name !== source.name);
  } else {
    return [];
  }

  // Calculate grams needed for each alternative to match protein (for protein) or calories (for carbs)
  const options: SwapOption[] = [];
  for (const alt of alternatives) {
    let grams: number;
    if (source.category === 'protein') {
      // Match protein content
      grams = Math.round((sourceProtein / alt.proteinPer100g) * 100);
      grams = Math.round(grams / 10) * 10; // Round to 10g
      if (grams < 80) grams = Math.max(80, grams);
      if (grams > 400) continue; // Too much
    } else {
      // Match calories
      grams = Math.round((sourceCalories / alt.caloriesPer100g) * 100);
      grams = Math.round(grams / 25) * 25;
      if (grams < 100) grams = Math.max(100, grams);
      if (grams > 400) continue;
    }

    const macros = calcMacro(alt, grams);
    options.push({ food: alt, grams, macros });

    if (options.length >= 3) break;
  }

  return options;
}

// ========== NUTRITION SCORE ==========

export function calculateNutritionScore(todayLog: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  fiber?: number;
}, targets: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}): { score: number; label: string; color: string; breakdown: { calScore: number; proScore: number; fiberScore: number; waterScore: number } } {
  // Calories score (0-30)
  const calRatio = targets.calories > 0 ? todayLog.calories / targets.calories : 0;
  let calScore: number;
  if (calRatio >= 0.85 && calRatio <= 1.15) calScore = 30;
  else if (calRatio >= 0.7 && calRatio <= 1.3) calScore = 20;
  else if (calRatio >= 0.5 && calRatio <= 1.5) calScore = 10;
  else calScore = 0;

  // Protein score (0-35) — protein is most important for body recomposition
  const proRatio = targets.protein > 0 ? todayLog.protein / targets.protein : 0;
  let proScore: number;
  if (proRatio >= 0.9) proScore = 35;
  else if (proRatio >= 0.75) proScore = 25;
  else if (proRatio >= 0.6) proScore = 15;
  else if (proRatio >= 0.4) proScore = 8;
  else proScore = 0;

  // Fiber score (0-20)
  const fiber = todayLog.fiber || 0;
  let fiberScore: number;
  if (fiber >= 25) fiberScore = 20;
  else if (fiber >= 18) fiberScore = 16;
  else if (fiber >= 12) fiberScore = 12;
  else if (fiber >= 6) fiberScore = 6;
  else fiberScore = Math.round(fiber / 25 * 20);

  // Water score (0-15)
  const waterRatio = targets.water > 0 ? todayLog.water / targets.water : 0;
  let waterScore: number;
  if (waterRatio >= 0.9) waterScore = 15;
  else if (waterRatio >= 0.7) waterScore = 12;
  else if (waterRatio >= 0.5) waterScore = 8;
  else if (waterRatio >= 0.3) waterScore = 4;
  else waterScore = 0;

  const totalScore = calScore + proScore + fiberScore + waterScore;

  let label: string;
  let color: string;
  if (totalScore >= 85) { label = 'Xuất Sắc'; color = 'text-emerald-400'; }
  else if (totalScore >= 70) { label = 'Tốt'; color = 'text-blue-400'; }
  else if (totalScore >= 50) { label = 'Trung Bình'; color = 'text-amber-400'; }
  else { label = 'Cần Cải Thiện'; color = 'text-red-400'; }

  return { score: totalScore, label, color, breakdown: { calScore, proScore, fiberScore, waterScore } };
}
