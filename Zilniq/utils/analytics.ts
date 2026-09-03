import { Platform } from 'react-native';

/**
 * Thin wrapper around Firebase Analytics (modular API, @react-native-firebase v23).
 *
 * - No-ops on web (the native module isn't available there) and whenever the
 *   native module fails to load, so callers never have to guard.
 * - Every call is fire-and-forget and swallows errors: analytics must never
 *   crash or block a user flow.
 */

const isSupported = Platform.OS !== 'web';

type AnalyticsApi = typeof import('@react-native-firebase/analytics');

let api: AnalyticsApi | null = null;
let instance: ReturnType<AnalyticsApi['getAnalytics']> | null = null;

function load(): { api: AnalyticsApi; instance: ReturnType<AnalyticsApi['getAnalytics']> } | null {
  if (!isSupported) return null;
  try {
    if (!api) {
      // Lazy require so a web bundle never tries to resolve the native module.
      api = require('@react-native-firebase/analytics') as AnalyticsApi;
    }
    if (!instance) {
      instance = api.getAnalytics();
    }
    return { api, instance };
  } catch (err) {
    if (__DEV__) console.warn('[analytics] native module unavailable', err);
    return null;
  }
}

/** Log a custom event. Names: snake_case, <= 40 chars, letters/digits/underscores. */
export async function logEvent(name: string, params?: Record<string, any>): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.api.logEvent(m.instance, name, params);
    if (__DEV__) console.log('[analytics] event', name, params ?? {});
  } catch (err) {
    if (__DEV__) console.warn('[analytics] logEvent failed', name, err);
  }
}

/**
 * Associate subsequent events with a user (pass the stable app user id, e.g. the
 * Clerk user id). Pass null on sign-out.
 */
export async function identifyUser(
  id: string | null,
  properties?: Record<string, string | null>,
): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.api.setUserId(m.instance, id);
    if (properties) {
      await Promise.all(
        Object.entries(properties).map(([key, value]) =>
          m.api.setUserProperty(m.instance, key, value),
        ),
      );
    }
  } catch (err) {
    if (__DEV__) console.warn('[analytics] identifyUser failed', err);
  }
}

/** Set a single user property. */
export async function setUserProperty(key: string, value: string | null): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.api.setUserProperty(m.instance, key, value);
  } catch (err) {
    if (__DEV__) console.warn('[analytics] setUserProperty failed', key, err);
  }
}
