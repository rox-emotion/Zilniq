export interface NutrientValues {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  nutrients: NutrientValues;
}

export interface MealEntry {
  mealType: string;
  icon: string;
  mealTime: string;
  loggedInTimezone: string,
  totals: NutrientValues;
  items: FoodItem[];
}

export interface MealEntryBlockData {
  type: 'mealEntry';
  data: MealEntry;
}

export interface MealHistoryBlockData {
  type: 'mealHistory';
  data: {
    entries: MealEntry[];
    totals: NutrientValues;
  };
}

export interface DailyTotals {
  totals: {
    kcal: number;
    carbs: number;
    fat: number;
    protein: number;
  },
  targets:{
    kcal: number;
    carbs: number;
    fat: number;
    protein: number;
  }
  
}

export interface WeeklyGraphDay {
  day: string;
  value: number;
}
