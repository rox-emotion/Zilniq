import { queryKeys } from '@/api/queryKeys';
import { getEnergyBurned, isHealthKitSupported, type EnergyBurned } from '@/utils/healthkit';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

const EMPTY: EnergyBurned = { active: 0, basal: 0, total: 0 };

/**
 * Active + basal energy burned for the given day, read from the Health app.
 * Falls back to zeros on platforms without HealthKit.
 *
 * @param date    the day to read
 * @param polling when true, slow-polls Health while mounted (pass the screen's
 *                focus state so we don't poll from a backgrounded screen)
 */
export function useEnergyBurned(date: Date, polling = false) {
  const formattedDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

  const supported = isHealthKitSupported();

  return useQuery({
    queryKey: [...queryKeys.energyBurned, formattedDate],
    queryFn: () => getEnergyBurned(date),
    enabled: supported,
    placeholderData: keepPreviousData,
    initialData: supported ? undefined : EMPTY,
    // Health data changes throughout the day (basal energy accrues, workouts
    // sync late), so keep it fresh: refetch when the app is re-focused, when the
    // Stats screen re-mounts, and on a slow poll while the screen is visible.
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    refetchInterval: supported && polling ? 60 * 1000 : false,
    refetchIntervalInBackground: false,
  });
}
