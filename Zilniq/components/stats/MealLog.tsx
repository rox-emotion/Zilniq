import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { MealEntryBlock } from '@/types/message';
import { capitalize } from '@/utils/utils';
import { StyleSheet, Text, View } from 'react-native';
import { ItemStats } from './ItemStats';

interface MealLogProps {
  data: MealEntryBlock;
}

export function MealLog({ data }: MealLogProps) {
  const meal = data.content.data;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>{meal.icon}</Text>
        </View>
        <View>
          <Text style={styles.mealType}>{capitalize(meal.mealType)}</Text>
          <Text style={styles.totalsText}>
            {meal.totals.kcal}kcal Protein:{meal.totals.protein}g Fat:{meal.totals.fat}g Carbs:
            {meal.totals.carbs}g
          </Text>
        </View>
      </View>
      <View style={styles.itemsContainer}>
        {meal.items.map((foodItem, index) => (
          <ItemStats key={foodItem.name + index} index={index} info={foodItem} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    marginRight: 10,
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: colors.userBubble,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 26,
  },
  mealType: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  totalsText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  itemsContainer: {
    paddingVertical: 18,
  },
});
