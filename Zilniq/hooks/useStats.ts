import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { DailyTotals, MealEntry, WeeklyGraphDay } from '@/types/meal';
import { useAuth } from '@clerk/clerk-expo';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useDailyTotals(date: Date) {
  const { getToken } = useAuth();
  const formattedDate = [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

  return useQuery({
    queryKey: [...queryKeys.dailyTotals, formattedDate],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const data = await apiFetch<DailyTotals>(
        `/api/analytics/daily?date=${formattedDate}`,
        { token },
      );

      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useMeals(date: Date) {
  const { getToken } = useAuth();
  const formattedDate = [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

  return useQuery({
    queryKey: [...queryKeys.meals, formattedDate],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const data = await apiFetch<{ entries: MealEntry[] }>(
        `/api/history/day/${formattedDate}`,
        { token },
      );

      return data.entries;
    },
  });
}

export function useWeeklyGraph(date: Date) {
  const { getToken } = useAuth();

  // clonăm data ca să nu mutăm selectedDate
  const startDateObj = new Date(date);
  startDateObj.setDate(startDateObj.getDate() - 6);

  const formattedStartDate = [
    startDateObj.getFullYear(),
    String(startDateObj.getMonth() + 1).padStart(2, '0'),
    String(startDateObj.getDate()).padStart(2, '0'),
  ].join('-');

  return useQuery({
    queryKey: [...queryKeys.weeklyGraph, formattedStartDate],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const data = await apiFetch<{ week: Array<{ kcal: number; targets: { kcal: number } }> }>(
        `/api/analytics/weekly?startDate=${formattedStartDate}`,
        { token },
      );

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const weekData: WeeklyGraphDay[] = data.week.map((dayData, index) => {
        const currentDate = new Date(startDateObj);
        currentDate.setDate(startDateObj.getDate() + index);

        return {
          day: dayNames[currentDate.getDay()],
          value: dayData.kcal,
          goal: dayData.targets.kcal,
        };
      });

      return weekData;
    },
    staleTime: 5 * 60 * 1000,
  });
}
