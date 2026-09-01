import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, LOG_LEVEL } from 'react-native-purchases';

const BASE_URL = 'https://payload-cms-production-c64b.up.railway.app';
export const ENTITLEMENT_ID = 'zilniq_access';
const TRIAL_PERIOD_DAYS = 7;
const TRIAL_PERIOD_MS = TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000;

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
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const getTokenRef = useRef(getToken);
  const isConfiguredRef = useRef(false);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user?.id) {
      setIsLoading(true);
      getToken()
        .then(async (token) => {
          if (!token) return;

          const payloadUserId = await fetchPayloadUserId(token);
          console.log("my payload user id is:")
          console.log(payloadUserId)
          if (!payloadUserId || Platform.OS === 'web') return;

          const apiKey =
            Platform.OS === 'ios'
              ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!
              : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!;

          if (!isConfiguredRef.current) {
            Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
            console.log(`🔥 EXACT KEY BEING PASSED TO ${Platform.OS.toUpperCase()}: "${apiKey}"`);
            Purchases.configure({ apiKey, appUserID: payloadUserId });
            isConfiguredRef.current = true;

            const listener = (info: CustomerInfo) => {
              const isActive = isRCEntitlementActive(info);
              setRcPremium(isActive);
              setFirstSeen(info.firstSeen);
              if (!isActive) {
                getTokenRef.current().then(t => {
                  if (t) fetchSubscription(t).then(setSubscription);
                }).catch(console.error);
              }
            };
            Purchases.addCustomerInfoUpdateListener(listener);
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

          const sub = await fetchSubscription(token);
          setSubscription(sub);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else if (isLoaded && !isSignedIn) {
      if (Platform.OS !== 'web' && isConfiguredRef.current) {
        Purchases.logOut().catch(console.error);
      }
      setSubscription(null);
      setRcPremium(false);
      setFirstSeen(null);
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user?.id]);

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
      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
}

export const usePurchases = () => useContext(PurchasesContext);
