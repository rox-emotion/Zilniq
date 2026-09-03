import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';
import Purchases, { type CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import * as SecureStore from 'expo-secure-store';
import { logEvent } from '@/utils/analytics';

const BASE_URL = 'https://payload-cms-production-c64b.up.railway.app';
export const ENTITLEMENT_ID = 'zilniq_access';
const TRIAL_PERIOD_DAYS = 7;
const TRIAL_PERIOD_MS = TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000;
const TRIAL_STARTED_LOGGED_KEY = 'zilniq_trial_started_logged';
const TRIAL_EXPIRED_LOGGED_KEY = 'zilniq_trial_expired_logged';

// Capped backoff between bootstrap retries (last value repeats).
const BOOTSTRAP_RETRY_DELAYS_MS = [2_000, 5_000, 10_000, 20_000, 30_000];

type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled' | null;

interface SubscriptionInfo {
  status: SubscriptionStatus;
  plan: string | null;
  expiresAt: string | null;
}

interface PurchasesContextValue {
  isPremium: boolean;
  isLoading: boolean;
  subscription: SubscriptionInfo | null;
  refreshSubscription: () => Promise<void>;
  setRcPremium: (value: boolean) => void;
  isInFreeTrial: boolean;
  trialDaysRemaining: number;
  hasActiveSubscription: boolean;
  /** True when we couldn't resolve subscription state (e.g. backend unreachable at launch). */
  bootstrapError: boolean;
  /** Force an immediate bootstrap retry. */
  retryBootstrap: () => void;
}

const PurchasesContext = createContext<PurchasesContextValue>({
  isPremium: false,
  isLoading: true,
  subscription: null,
  refreshSubscription: async () => {},
  setRcPremium: () => {},
  isInFreeTrial: false,
  trialDaysRemaining: 0,
  hasActiveSubscription: false,
  bootstrapError: false,
  retryBootstrap: () => {},
});

function isWithinFreeTrial(firstSeen: string | null): boolean {
  if (!firstSeen) return false;
  const firstSeenMs = new Date(firstSeen).getTime();
  if (Number.isNaN(firstSeenMs)) return false;
  return Date.now() - firstSeenMs < TRIAL_PERIOD_MS;
}

function getTrialDaysRemaining(firstSeen: string | null): number {
  if (!firstSeen) return 0;
  const firstSeenMs = new Date(firstSeen).getTime();
  if (Number.isNaN(firstSeenMs)) return 0;
  const remainingMs = TRIAL_PERIOD_MS - (Date.now() - firstSeenMs);
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

async function fetchSubscription(token: string): Promise<SubscriptionInfo> {
  const res = await fetch(`${BASE_URL}/api/me/subscription`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { status: null, plan: null, expiresAt: null };
  const data = await res.json();
  return {
    status: data.subscriptionStatus ?? null,
    plan: data.subscriptionPlan ?? null,
    expiresAt: data.subscriptionExpiresAt ?? null,
  };
}

async function linkRevenueCat(token: string, revenueCatAppUserId: string): Promise<void> {
  await fetch(`${BASE_URL}/api/me/revenuecat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ revenueCatAppUserId }),
  });
}

async function fetchPayloadUserId(token: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const id = data.profile?.id ?? data.user?.id ?? data.id;
  return id ? String(id) : null;
}

function isRCEntitlementActive(customerInfo: CustomerInfo): boolean {
  return !!customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive;
}

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [rcPremium, setRcPremium] = useState(false);
  const [firstSeen, setFirstSeen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState(false);
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();

  const getTokenRef = useRef(getToken);
  const isConfiguredRef = useRef(false);
  const bootstrappingRef = useRef(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAttemptRef = useRef(0);

  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsLoading(false);
    }
  }, []);

  const clearRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  // Stable RevenueCat listener — attached exactly once, the first time we
  // configure. Kept out of `bootstrap` so retries don't stack listeners.
  const handleCustomerInfo = useCallback((info: CustomerInfo) => {
    const isActive = isRCEntitlementActive(info);
    setRcPremium(isActive);
    setFirstSeen(info.firstSeen);
    if (!isActive) {
      getTokenRef.current()
        .then((t) => { if (t) fetchSubscription(t).then(setSubscription); })
        .catch(console.error);
    }
  }, []);

  // Resolve the backend user id, configure RevenueCat and pull current
  // subscription state. Any failure here (backend unreachable at launch, no
  // token yet, RevenueCat init error) is retryable: we surface `bootstrapError`
  // so the UI shows a retry affordance instead of a hard paywall, and we keep
  // retrying with a capped backoff until it succeeds or the user signs out.
  const bootstrap = useCallback(async () => {
    if (bootstrappingRef.current) return;
    bootstrappingRef.current = true;

    try {
      const token = await getTokenRef.current();
      if (!token) throw new Error('No auth token available');

      const payloadUserId = await fetchPayloadUserId(token);
      if (!payloadUserId) throw new Error('Could not resolve backend user id');

      if (Platform.OS !== 'web') {
        const apiKey =
          Platform.OS === 'ios'
            ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!
            : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!;

        if (!isConfiguredRef.current) {
          Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
          Purchases.configure({ apiKey, appUserID: payloadUserId });
          isConfiguredRef.current = true;
          Purchases.addCustomerInfoUpdateListener(handleCustomerInfo);
        } else {
          await Purchases.logIn(payloadUserId).catch(console.error);
        }

        await Purchases.setAttributes({ payload_user_id: payloadUserId }).catch(console.error);
        await linkRevenueCat(token, payloadUserId).catch(console.error);

        const info = await Purchases.getCustomerInfo().catch(() => null);
        if (info) {
          setRcPremium(isRCEntitlementActive(info));
          setFirstSeen(info.firstSeen);
        }
      }

      const sub = await fetchSubscription(token);
      setSubscription(sub);

      retryAttemptRef.current = 0;
      clearRetry();
      setBootstrapError(false);
    } catch (err) {
      console.error('Purchases bootstrap failed, will retry:', err);
      setBootstrapError(true);

      clearRetry();
      const i = Math.min(retryAttemptRef.current, BOOTSTRAP_RETRY_DELAYS_MS.length - 1);
      retryAttemptRef.current = i + 1;
      retryTimerRef.current = setTimeout(() => { bootstrap(); }, BOOTSTRAP_RETRY_DELAYS_MS[i]);
    } finally {
      bootstrappingRef.current = false;
      setIsLoading(false);
    }
  }, [clearRetry, handleCustomerInfo]);

  const retryBootstrap = useCallback(() => {
    retryAttemptRef.current = 0;
    clearRetry();
    setIsLoading(true);
    bootstrap();
  }, [bootstrap, clearRetry]);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user?.id) {
      setIsLoading(true);
      retryAttemptRef.current = 0;
      clearRetry();
      bootstrap();
      return;
    }

    // Signed out (or no Clerk user yet): reset everything.
    clearRetry();
    retryAttemptRef.current = 0;
    bootstrappingRef.current = false;
    setBootstrapError(false);
    if (Platform.OS !== 'web' && isConfiguredRef.current) {
      Purchases.logOut().catch(console.error);
    }
    setSubscription(null);
    setRcPremium(false);
    setFirstSeen(null);
    setIsLoading(false);
  }, [isLoaded, isSignedIn, user?.id, bootstrap, clearRetry]);

  // Retry the moment the app is foregrounded while stuck in an error state.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && bootstrapError && isSignedIn) {
        retryAttemptRef.current = 0;
        clearRetry();
        bootstrap();
      }
    });
    return () => sub.remove();
  }, [bootstrapError, isSignedIn, bootstrap, clearRetry]);

  useEffect(() => clearRetry, [clearRetry]);

  const refreshSubscription = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const sub = await fetchSubscription(token);
      setSubscription(sub);
    } catch (err) {
      console.error('Failed to refresh subscription:', err);
    }
  }, [getToken]);

  const backendPremium =
    subscription?.status === 'active' || subscription?.status === 'trial';

  const isInFreeTrial = isWithinFreeTrial(firstSeen);
  const trialDaysRemaining = getTrialDaysRemaining(firstSeen);

  const hasActiveSubscription = backendPremium || rcPremium;
  const isPremium = hasActiveSubscription || isInFreeTrial;

  // Fire `trial_started` / `trial_expired` once per install. The pre-paywall
  // trial window is derived from RevenueCat's `firstSeen`, so we can only act
  // once that value is known and the user isn't already paying.
  useEffect(() => {
    if (Platform.OS === 'web' || !firstSeen || hasActiveSubscription) return;

    (async () => {
      try {
        if (isInFreeTrial) {
          if (!(await SecureStore.getItemAsync(TRIAL_STARTED_LOGGED_KEY))) {
            logEvent('trial_started');
            await SecureStore.setItemAsync(TRIAL_STARTED_LOGGED_KEY, '1');
          }
        } else if (!(await SecureStore.getItemAsync(TRIAL_EXPIRED_LOGGED_KEY))) {
          logEvent('trial_expired');
          await SecureStore.setItemAsync(TRIAL_EXPIRED_LOGGED_KEY, '1');
        }
      } catch (err) {
        console.error('Trial event logging failed:', err);
      }
    })();
  }, [firstSeen, isInFreeTrial, hasActiveSubscription]);

  return (
    <PurchasesContext.Provider
      value={{
        isPremium,
        isLoading,
        subscription,
        refreshSubscription,
        setRcPremium,
        isInFreeTrial,
        trialDaysRemaining,
        hasActiveSubscription,
        bootstrapError,
        retryBootstrap,
      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
}

export const usePurchases = () => useContext(PurchasesContext);
