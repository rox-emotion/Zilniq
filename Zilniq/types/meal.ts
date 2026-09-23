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

export interface MealOrigin {
  /** True when the entry is a preview/hypothetical that was NOT persisted. */
  isVirtual: boolean;
  source?: string;
  confidence?: number;
}

/**
 * UUIDs of the HealthKit samples written for a meal's macros/energy, keyed by
 * nutrient. Populated client-side after `syncMealToHealthKit` runs — not sent
 * by the backend. Not used for deletion yet; kept around so a future "undo"
 * action can identify exactly which Health samples to remove.
 */
export interface MealHealthKitIds {
  protein?: string;
  carbs?: string;
  fat?: string;
  kcal?: string;
}

export interface MealEntry {
  mealType: string;
  icon: string;
  mealTime: string;
  loggedInTimezone: string,
  totals: NutrientValues;
  items: FoodItem[];
  origin?: MealOrigin;
  healthKitIds?: MealHealthKitIds;
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
  goal: number;
}
