export interface NutritionGoals {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const DEFAULT_GOALS: NutritionGoals = {
  kcal: 2560,
  protein: 100,
  fat: 78,
  carbs: 150,
} as const;
