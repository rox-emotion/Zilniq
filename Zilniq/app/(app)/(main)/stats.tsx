import DayHeader from '@/components/stats/DayHeader';
import { Graph } from '@/components/stats/Graph';
import { MealStats } from '@/components/stats/MealStats';
import { RoundProgressIndicator } from '@/components/stats/RoundProgressIndicator';
import type { ColorPalette } from '@/constants/colors';
import { DEFAULT_GOALS } from '@/constants/nutrition';
import { spacing } from '@/constants/spacing';
import { queryKeys } from '@/api/queryKeys';
import { useColors } from '@/hooks/useColors';
import { useEnergyBurned } from '@/hooks/useEnergyBurned';
import { useDailyTotals, useMeals } from '@/hooks/useStats';
import { logEvent } from '@/utils/analytics';
import { isHealthKitSupported } from '@/utils/healthkit';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Stats() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    logEvent('stats_viewed');
  }, []);

  const [screenFocused, setScreenFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: daily } = useDailyTotals(selectedDate);
  const { data: meals = [] } = useMeals(selectedDate);
  const { data: energyBurned, refetch: refetchEnergyBurned } = useEnergyBurned(
    selectedDate,
    screenFocused,
  );

  const showEnergyBurned = isHealthKitSupported() && !!energyBurned;

  // Re-read Health data every time the Stats screen regains focus (e.g. coming
  // back from the chat tab) — navigation within the app isn't an AppState change.
  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      if (isHealthKitSupported()) void refetchEnergyBurned();
      return () => setScreenFocused(false);
    }, [refetchEnergyBurned]),
  );

  // Pull-to-refresh: re-request every stat on the screen (macros, meals, the
  // week graph and Health energy).
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.dailyTotals }),
        queryClient.invalidateQueries({ queryKey: queryKeys.meals }),
        queryClient.invalidateQueries({ queryKey: queryKeys.weeklyGraph }),
        queryClient.invalidateQueries({ queryKey: queryKeys.energyBurned }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const displayTotals = {
    kcal: Math.round(daily?.totals.kcal ?? 0),
    carbs: Math.round(daily?.totals.carbs ?? 0),
    fat: Math.round(daily?.totals.fat ?? 0),
    protein: Math.round(daily?.totals.protein ?? 0),
  };

  const progress = {
    kcal: (daily?.totals.kcal ?? 0) / (daily?.targets?.kcal ?? DEFAULT_GOALS.kcal),
    carbs: (daily?.totals.carbs ?? 0) / (daily?.targets?.carbs ?? DEFAULT_GOALS.carbs),
    fat: (daily?.totals.fat ?? 0) / (daily?.targets?.fat ?? DEFAULT_GOALS.fat),
    protein: (daily?.totals.protein ?? 0) / (daily?.targets?.protein ?? DEFAULT_GOALS.protein),
  };

  return (
    <View style={styles.container}>
      <DayHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        goalKcal={daily?.targets?.kcal}
      />

      <View style={styles.scrollContainer}>
        <LinearGradient
          colors={[colors.white, colors.fadeGradient]}
          style={styles.fadeOverlay}
        />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.text}
              colors={[colors.text]}
            />
          }
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stats</Text>
          </View>

          <View style={styles.progressRow}>
            <RoundProgressIndicator
              progress={progress.kcal}
              color={colors.nutrient.kcal}
              value={displayTotals.kcal}
              measure="kcal"
              text="Calories"
              size={80}
            />
            <RoundProgressIndicator
              progress={progress.protein}
              color={colors.nutrient.protein}
              value={displayTotals.protein}
              measure="grams"
              text="Protein"
              size={80}
            />
            <RoundProgressIndicator
              progress={progress.fat}
              color={colors.nutrient.fat}
              value={displayTotals.fat}
              measure="grams"
              text="Fat"
              size={80}
            />
            <RoundProgressIndicator
              progress={progress.carbs}
              color={colors.nutrient.carbs}
              value={displayTotals.carbs}
              measure="grams"
              text="Carbs"
              size={80}
            />
          </View>

          {showEnergyBurned && (
            <View style={styles.energyCard}>
              <Text style={styles.energyTitle}>Energy burned</Text>
              <Text style={styles.energyTotal}>
                {energyBurned.total} <Text style={styles.energyUnit}>kcal</Text>
              </Text>
              <View style={styles.energyBreakdownRow}>
                <View style={styles.energyBreakdownItem}>
                  <Text style={styles.energyBreakdownValue}>{energyBurned.active}</Text>
                  <Text style={styles.energyBreakdownLabel}>Active</Text>
                </View>
                <View style={styles.energyBreakdownItem}>
                  <Text style={styles.energyBreakdownValue}>{energyBurned.basal}</Text>
                  <Text style={styles.energyBreakdownLabel}>Resting</Text>
                </View>
              </View>
            </View>
          )}

          <Text style={styles.weekOverviewTitle}>This week overview</Text>
          <Text style={styles.weekOverviewGoal}>Goal: {daily?.targets?.kcal ?? DEFAULT_GOALS.kcal} Kcal</Text>

          <Graph date={selectedDate} goalKcal={daily?.targets?.kcal} />

          {meals.length > 0 && (
            <View style={styles.mealsHeader}>
              <Text style={styles.mealsTitle}>Your Meals</Text>
              <Text style={styles.mealsCount}>{meals.length} meals</Text>
            </View>
          )}

          {meals.map((meal, index) => (
            <MealStats key={meal.mealType + index} data={meal} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    fadeOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 12,
      zIndex: 1,
      pointerEvents: 'none',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.xxxl,
    },
    sectionHeader: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 26,
      fontWeight: '500',
      marginBottom: spacing.xxl,
      color: colors.text,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
    },
    energyCard: {
      marginTop: 48,
      marginHorizontal: spacing.lg,
      padding: spacing.lg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    energyTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    energyTotal: {
      fontSize: 34,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.sm,
    },
    energyUnit: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    energyBreakdownRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 48,
      marginTop: spacing.md,
    },
    energyBreakdownItem: {
      alignItems: 'center',
    },
    energyBreakdownValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    energyBreakdownLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    weekOverviewTitle: {
      fontSize: 26,
      fontWeight: '500',
      alignSelf: 'center',
      marginTop: 72,
      marginBottom: spacing.md,
      color: colors.text,
    },
    weekOverviewGoal: {
      fontSize: 18,
      fontWeight: '400',
      alignSelf: 'center',
      marginTop: spacing.sm,
      color: colors.text,
    },
    mealsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      marginTop: 36,
    },
    mealsTitle: {
      fontWeight: '500',
      fontSize: 22,
      color: colors.text,
    },
    mealsCount: {
      fontSize: 15,
      fontWeight: '400',
      color: colors.textSecondary,
    },
  });
