import type { ColorPalette } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useColors } from '@/hooks/useColors';
import type { FoodItem } from '@/types/meal';
import { capitalize } from '@/utils/utils';
import { useMemo } from 'react';
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
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {index !== 0 && <View style={styles.divider} />}

      <View style={styles.titleRow}>
        <Text style={styles.titleText}>
          {capitalize(title)} - {quantity}
          {unit}
        </Text>
      </View>

      <Text style={styles.nutrientRow} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        <View style={[styles.indicator, { backgroundColor: colors.nutrient.kcal }]} />
        <Text style={styles.nutrientText}> {kcal} kcal   </Text>
        <View style={[styles.indicator, { backgroundColor: colors.nutrient.protein }]} />
        <Text style={styles.nutrientText}> Protein: {protein}g   </Text>
        <View style={[styles.indicator, { backgroundColor: colors.nutrient.fat }]} />
        <Text style={styles.nutrientText}> Fat: {fat}g   </Text>
        <View style={[styles.indicator, { backgroundColor: colors.nutrient.carbs }]} />
        <Text style={styles.nutrientText}> Carbs: {carbs}g</Text>
      </Text>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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
      color: colors.text,
    },
    nutrientRow: {
      fontSize: 13,
      color: colors.text,
    },
    nutrientText: {
      fontSize: 13,
      color: colors.text,
    },
    indicator: {
      width: 4,
      height: 14,
      borderRadius: 4,
    },
  });
