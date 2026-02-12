import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { FoodItem } from '@/types/meal';
import { capitalize } from '@/utils/utils';
import { StyleSheet, Text, View } from 'react-native';

interface ItemStatsProps {
  index: number;
  info: FoodItem;
}

export function ItemStats({ index, info }: ItemStatsProps) {
  const title = info.name;
  const { kcal, protein, fat, carbs } = info.nutrients ?? info;
  const quantity = info.quantity;
  const unit = info.unit === 'piece' || info.unit === 'pieces' ? 'pcs' : info.unit;

  return (
    <View style={styles.container}>
      {index !== 0 && <View style={styles.divider} />}

      <View style={styles.titleRow}>
        <Text style={styles.titleText}>
          {capitalize(title)} - {quantity}
          {unit}
        </Text>
      </View>

      <View style={styles.nutrientRow}>
        <View style={styles.nutrientItem}>
          <View style={[styles.indicator, { backgroundColor: colors.nutrient.kcal }]} />
          <Text>{kcal} kcal</Text>
        </View>

        <View style={styles.nutrientItem}>
          <View style={[styles.indicator, { backgroundColor: colors.nutrient.protein }]} />
          <Text>Protein: {protein}g</Text>
        </View>

        <View style={styles.nutrientItem}>
          <View style={[styles.indicator, { backgroundColor: colors.nutrient.fat }]} />
          <Text>Fat: {fat}g</Text>
        </View>

        <View style={styles.nutrientItem}>
          <View style={[styles.indicator, { backgroundColor: colors.nutrient.carbs }]} />
          <Text>Carbs: {carbs}g</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
  },
  divider: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    height: 1,
    marginVertical: 18,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientItem: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  indicator: {
    width: 4,
    height: 14,
    borderRadius: 4,
  },
});
