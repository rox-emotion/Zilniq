import DayHeader from '@/components/stats/DayHeader';
import { Graph } from '@/components/stats/Graph';
import { MealStats } from '@/components/stats/MealStats';
import { RoundProgressIndicator } from '@/components/stats/RoundProgressIndicator';
import { colors } from '@/constants/colors';
import { DEFAULT_GOALS } from '@/constants/nutrition';
import { spacing } from '@/constants/spacing';
import { useDailyTotals, useMeals } from '@/hooks/useStats';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Stats() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: totals } = useDailyTotals(selectedDate);
  const { data: meals = [] } = useMeals(selectedDate);

  const displayTotals = {
    kcal: Math.round(totals?.kcal ?? 0),
    carbs: Math.round(totals?.carbs ?? 0),
    fat: Math.round(totals?.fat ?? 0),
    protein: Math.round(totals?.protein ?? 0),
  };

  const progress = {
    kcal: (totals?.kcal ?? 0) / DEFAULT_GOALS.kcal,
    carbs: (totals?.carbs ?? 0) / DEFAULT_GOALS.carbs,
    fat: (totals?.fat ?? 0) / DEFAULT_GOALS.fat,
    protein: (totals?.protein ?? 0) / DEFAULT_GOALS.protein,
  };

  return (
    <View style={styles.container}>
      <DayHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        goalKcal={DEFAULT_GOALS.kcal}
      />

      <View style={styles.scrollContainer}>
        <LinearGradient
          colors={[colors.white, colors.fadeGradient]}
          style={styles.fadeOverlay}
        />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
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
            />
            <RoundProgressIndicator
              progress={progress.protein}
              color={colors.nutrient.protein}
              value={displayTotals.protein}
              measure="grams"
              text="Protein"
            />
            <RoundProgressIndicator
              progress={progress.fat}
              color={colors.nutrient.fat}
              value={displayTotals.fat}
              measure="grams"
              text="Fat"
            />
          </View>

          <Text style={styles.weekOverviewTitle}>This week overview</Text>
          <Text style={styles.weekOverviewGoal}>Goals: {DEFAULT_GOALS.kcal} Kcal</Text>

          <Graph date={selectedDate} />

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

const styles = StyleSheet.create({
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
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  weekOverviewTitle: {
    fontSize: 26,
    fontWeight: '500',
    alignSelf: 'center',
    marginTop: 72,
    marginBottom: spacing.md,
  },
  weekOverviewGoal: {
    fontSize: 18,
    fontWeight: '400',
    alignSelf: 'center',
    marginTop: spacing.sm,
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
  },
  mealsCount: {
    fontSize: 15,
    fontWeight: '400',
  },
});
