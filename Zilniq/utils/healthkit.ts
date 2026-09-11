import type { MealEntry } from '@/types/meal';
import * as ExpoHealthKit from '@kayzmann/expo-healthkit';
import { Keyboard, Platform } from 'react-native';

// Nutrition types Zilniq reads from / writes to the Health app.
// NOTE: `@kayzmann/expo-healthkit` v2 exposes save helpers for protein / carbs /
// fat only — there is no JS binding for dietary energy (kcal) yet, so calories
// are not written back to Health until the native module gains `saveEnergy`.
const NUTRITION_TYPES = [
  'DietaryProtein',
  'DietaryCarbohydrates',
  'DietaryFatTotal',
  'DietaryEnergy',
] as const;

// Energy-expenditure types we only ever read (HealthKit does not allow writing
// basal energy, and we have no reason to write active energy).
const ENERGY_READ_TYPES = ['ActiveEnergyBurned', 'BasalEnergyBurned'] as const;

let authPromise: Promise<void> | null = null;

let authSettled = false;
const authSettledListeners = new Set<() => void>();

function markAuthSettled() {
  if (authSettled) return;
  authSettled = true;
  authSettledListeners.forEach((fn) => fn());
  authSettledListeners.clear();
}

/**
 * Resolves once the initial Health permission prompt has been dealt with — or
 * immediately when Health isn't supported. Use this to hold back UI that would
 * steal focus from the native permission sheet (e.g. auto-focusing the chat
 * input, which pops the keyboard over the sheet's buttons). Always resolves
 * after `timeoutMs` as a safety net.
 */
export function whenHealthPermissionSettled(timeoutMs = 5000): Promise<void> {
  if (authSettled || !isHealthKitSupported()) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const done = () => {
      authSettledListeners.delete(done);
      resolve();
    };
    authSettledListeners.add(done);
    setTimeout(done, timeoutMs);
  });
}

export function isHealthKitSupported(): boolean {
  return Platform.OS === 'ios' && ExpoHealthKit.isAvailable();
}

/**
 * Request Health app authorization once per app session. Safe to call
 * repeatedly — the underlying request is memoized.
 */
export function initHealthKit(): Promise<void> {
  if (!isHealthKitSupported()) {
    markAuthSettled();
    return Promise.resolve();
  }

  if (!authPromise) {
    // The native permission sheet appears on top of everything; make sure the
    // keyboard isn't up (e.g. the chat input) so its buttons stay tappable.
    Keyboard.dismiss();
    authPromise = ExpoHealthKit.requestAuthorization(
      [...NUTRITION_TYPES, ...ENERGY_READ_TYPES], // read
      [...NUTRITION_TYPES], // write
    )
      .catch((err) => {
        console.warn('[HealthKit] authorization failed', err);
        authPromise = null; // allow a retry on the next call
      })
      .finally(markAuthSettled);
  }

  return authPromise;
}

/**
 * Write a logged meal's macro totals to the Health app. Called when the
 * assistant returns a meal_log result (a `mealEntry` block).
 */
export async function syncMealToHealthKit(meal: MealEntry): Promise<void> {
  if (!isHealthKitSupported() || !meal?.totals) return;

  const parsed = meal.mealTime ? new Date(meal.mealTime) : new Date();
  const when = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

  const { protein = 0, carbs = 0, fat = 0 } = meal.totals;

  try {
    await initHealthKit();
    await Promise.all([
      protein > 0 ? ExpoHealthKit.saveProtein(protein, when) : undefined,
      carbs > 0 ? ExpoHealthKit.saveCarbs(carbs, when) : undefined,
      fat > 0 ? ExpoHealthKit.saveFat(fat, when) : undefined,
    ]);
    console.log('[HealthKit] synced meal', { protein, carbs, fat, when: when.toISOString() });
  } catch (err) {
    console.warn('[HealthKit] failed to sync meal', err);
  }
}

export interface EnergyBurned {
  /** Active Energy burned in the range, in kcal. */
  active: number;
  /** Basal (resting) Energy burned in the range, in kcal. */
  basal: number;
  /** active + basal, in kcal. */
  total: number;
}

async function readKcal(
  label: string,
  read: (start: Date, end: Date) => Promise<number>,
  start: Date,
  end: Date,
): Promise<number> {
  try {
    return Math.round((await read(start, end)) || 0);
  } catch (err) {
    // A denied read is reported as "no data" natively, so anything reaching here
    // is unexpected. Don't let one metric failing zero out the other.
    console.warn(`[HealthKit] failed to read ${label}`, err);
    return 0;
  }
}

/**
 * Read the active + basal energy burned from the Health app for a given day
 * (defaults to today). Values are summed and also logged to the console.
 * Returns all-zeros when HealthKit is unavailable or the user hasn't granted
 * read access (HealthKit surfaces a denied read as empty data).
 */
export async function getEnergyBurned(date: Date = new Date()): Promise<EnergyBurned> {
  const empty: EnergyBurned = { active: 0, basal: 0, total: 0 };
  if (!isHealthKitSupported()) return empty;

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  await initHealthKit();
  const [active, basal] = await Promise.all([
    readKcal('active energy', ExpoHealthKit.getActiveEnergyBurned, start, end),
    readKcal('basal energy', ExpoHealthKit.getBasalEnergyBurned, start, end),
  ]);

  const result: EnergyBurned = { active, basal, total: active + basal };
  const day = [
    start.getFullYear(),
    String(start.getMonth() + 1).padStart(2, '0'),
    String(start.getDate()).padStart(2, '0'),
  ].join('-');
  console.log('[HealthKit] energy burned', { ...result, date: day });
  return result;
}
