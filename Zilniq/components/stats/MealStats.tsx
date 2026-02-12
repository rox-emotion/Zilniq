import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { MealEntry } from '@/types/meal';
import { capitalize, formatTimeForUser } from '@/utils/utils';
import { StyleSheet, Text, View } from 'react-native';
import { ItemStats } from './ItemStats';

interface MealStatsProps {
  data: MealEntry;
}

export function MealStats({ data }: MealStatsProps) {
  const { kcal, protein, fat, carbs } = data.totals;
  const title = data.mealType;
  const time = formatTimeForUser(data.mealTime, data.loggedInTimezone);

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{capitalize(title)}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalText}>{kcal} Kcal</Text>
          <Text style={styles.totalText}>Protein: {protein}g</Text>
          <Text style={styles.totalText}>Fat: {fat}g</Text>
          <Text style={styles.totalText}>Carbs: {carbs}g</Text>
        </View>
      </View>
      <View style={styles.itemsContainer}>
        {data.items.map((food, index) => (
          <ItemStats key={food.name + index} index={index} info={food} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.userBubble,
    padding: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  time: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  itemsContainer: {
    paddingVertical: 18,
  },
});
