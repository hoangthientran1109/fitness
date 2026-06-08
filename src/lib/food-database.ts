// Food Database — per 100g values (edible portion, cooked where applicable)
// Sources: USDA, VN Institute of Nutrition

export interface FoodItem {
  name: string;
  nameVi: string;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy' | 'supplement';
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  servingGrams: number;
  servingName: string;
}

export const FOOD_DATABASE: FoodItem[] = [
  // ===== PROTEIN =====
  { name: 'chicken_breast', nameVi: 'Ức Gà', category: 'protein', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, servingGrams: 150, servingName: '150g' },
  { name: 'lean_beef', nameVi: 'Thịt Bò Nạc', category: 'protein', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15, fiberPer100g: 0, servingGrams: 150, servingName: '150g' },
  { name: 'salmon', nameVi: 'Cá Hồi', category: 'protein', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, fiberPer100g: 0, servingGrams: 150, servingName: '150g' },
  { name: 'tuna', nameVi: 'Cá Ngừ', category: 'protein', caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 0.8, fiberPer100g: 0, servingGrams: 150, servingName: '150g' },
  { name: 'tilapia', nameVi: 'Cá Rô Phi', category: 'protein', caloriesPer100g: 96, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 1.7, fiberPer100g: 0, servingGrams: 150, servingName: '150g' },
  { name: 'pork_lean', nameVi: 'Thịt Heo Nạc', category: 'protein', caloriesPer100g: 143, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 6.5, fiberPer100g: 0, servingGrams: 150, servingName: '150g' },
  { name: 'shrimp', nameVi: 'Tôm', category: 'protein', caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3, fiberPer100g: 0, servingGrams: 150, servingName: '150g' },
  { name: 'whole_egg', nameVi: 'Trứng Gà Nguyên Quả', category: 'protein', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0, servingGrams: 100, servingName: '2 quả (100g)' },
  { name: 'egg_whites', nameVi: 'Lòng Trắng Trứng', category: 'protein', caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2, fiberPer100g: 0, servingGrams: 100, servingName: '4 lòng trắng' },
  { name: 'greek_yogurt', nameVi: 'Sữa Chua Hy Lạp', category: 'dairy', caloriesPer100g: 60, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 0, servingGrams: 200, servingName: '200g' },
  { name: 'tofu', nameVi: 'Đậu Phụ', category: 'protein', caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 1.9, fatPer100g: 4.8, fiberPer100g: 0.3, servingGrams: 200, servingName: '200g' },
  { name: 'milk_whole', nameVi: 'Sữa Tươi Nguyên Kem', category: 'dairy', caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, fiberPer100g: 0, servingGrams: 250, servingName: '250ml' },
  { name: 'whey', nameVi: 'Whey Protein', category: 'supplement', caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 8, fatPer100g: 5, fiberPer100g: 0, servingGrams: 30, servingName: '1 muỗng (30g)' },

  // ===== CARBS =====
  { name: 'white_rice', nameVi: 'Cơm Trắng', category: 'carb', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, fiberPer100g: 0.4, servingGrams: 200, servingName: '1 chén (200g)' },
  { name: 'brown_rice', nameVi: 'Gạo Lứt', category: 'carb', caloriesPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 26, fatPer100g: 0.9, fiberPer100g: 1.6, servingGrams: 180, servingName: '1 chén (180g)' },
  { name: 'oats', nameVi: 'Yến Mạch', category: 'carb', caloriesPer100g: 379, proteinPer100g: 13, carbsPer100g: 66, fatPer100g: 6.5, fiberPer100g: 10, servingGrams: 80, servingName: '80g (khô)' },
  { name: 'potato', nameVi: 'Khoai Tây', category: 'carb', caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatPer100g: 0.1, fiberPer100g: 1.8, servingGrams: 200, servingName: '200g' },
  { name: 'sweet_potato', nameVi: 'Khoai Lang', category: 'carb', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, fiberPer100g: 3, servingGrams: 200, servingName: '200g' },
  { name: 'bread_white', nameVi: 'Bánh Mì Trắng', category: 'carb', caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2, fiberPer100g: 2.7, servingGrams: 80, servingName: '1 ổ nhỏ (80g)' },
  { name: 'bread_wholewheat', nameVi: 'Bánh Mì Nguyên Cám', category: 'carb', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4, fiberPer100g: 7, servingGrams: 80, servingName: '2 lát (80g)' },
  { name: 'rice_noodle', nameVi: 'Bún / Phở (sợi)', category: 'carb', caloriesPer100g: 110, proteinPer100g: 1.5, carbsPer100g: 25, fatPer100g: 0.2, fiberPer100g: 0.5, servingGrams: 200, servingName: '200g' },
  { name: 'corn', nameVi: 'Bắp (Ngô)', category: 'carb', caloriesPer100g: 96, proteinPer100g: 3.4, carbsPer100g: 21, fatPer100g: 1.5, fiberPer100g: 2.4, servingGrams: 150, servingName: '1 trái' },

  // ===== FRUIT =====
  { name: 'banana', nameVi: 'Chuối', category: 'fruit', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, fiberPer100g: 2.6, servingGrams: 120, servingName: '1 quả (120g)' },
  { name: 'apple', nameVi: 'Táo', category: 'fruit', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, fiberPer100g: 2.4, servingGrams: 180, servingName: '1 quả (180g)' },

  // ===== FATS =====
  { name: 'almonds', nameVi: 'Hạnh Nhân', category: 'fat', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, fiberPer100g: 12.5, servingGrams: 30, servingName: '30g' },
  { name: 'cashews', nameVi: 'Hạt Điều', category: 'fat', caloriesPer100g: 553, proteinPer100g: 18, carbsPer100g: 30, fatPer100g: 44, fiberPer100g: 3.3, servingGrams: 30, servingName: '30g' },
  { name: 'peanut_butter', nameVi: 'Bơ Đậu Phộng', category: 'fat', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, fiberPer100g: 6, servingGrams: 30, servingName: '2 muỗng (30g)' },
  { name: 'olive_oil', nameVi: 'Dầu Olive', category: 'fat', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0, servingGrams: 15, servingName: '1 muỗng (15ml)' },
  { name: 'avocado', nameVi: 'Bơ (Trái)', category: 'fat', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15, fiberPer100g: 7, servingGrams: 100, servingName: '1/2 quả' },

  // ===== VEGETABLES =====
  { name: 'broccoli', nameVi: 'Bông Cải Xanh', category: 'vegetable', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 2.6, servingGrams: 150, servingName: '150g' },
  { name: 'spinach', nameVi: 'Rau Bina (Cải Bó Xôi)', category: 'vegetable', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 2.2, servingGrams: 100, servingName: '100g' },
  { name: 'lettuce', nameVi: 'Xà Lách', category: 'vegetable', caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, fiberPer100g: 1.3, servingGrams: 100, servingName: '100g' },
  { name: 'tomato', nameVi: 'Cà Chua', category: 'vegetable', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, fiberPer100g: 1.2, servingGrams: 150, servingName: '150g' },
  { name: 'cucumber', nameVi: 'Dưa Leo', category: 'vegetable', caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1, fiberPer100g: 0.5, servingGrams: 150, servingName: '150g' },
  { name: 'carrot', nameVi: 'Cà Rốt', category: 'vegetable', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, fiberPer100g: 2.8, servingGrams: 100, servingName: '100g' },
];

export function getFoodByName(name: string): FoodItem | undefined {
  return FOOD_DATABASE.find(f => f.name === name || f.nameVi.toLowerCase() === name.toLowerCase());
}

export function getFoodsByCategory(category: FoodItem['category']): FoodItem[] {
  return FOOD_DATABASE.filter(f => f.category === category);
}

export function calcMacro(food: FoodItem, grams: number): { calories: number; protein: number; carbs: number; fat: number; fiber: number } {
  const factor = grams / 100;
  return {
    calories: Math.round(food.caloriesPer100g * factor),
    protein: +((food.proteinPer100g * factor).toFixed(1)),
    carbs: +((food.carbsPer100g * factor).toFixed(1)),
    fat: +((food.fatPer100g * factor).toFixed(1)),
    fiber: +((food.fiberPer100g * factor).toFixed(1)),
  };
}
