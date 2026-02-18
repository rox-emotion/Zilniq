import type { ColorPalette } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useColors } from '@/hooks/useColors';
import { MealLog } from '@/components/stats/MealLog';
import type { MealHistoryBlock } from '@/types/message';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MealHistoryLogProps {
  data: MealHistoryBlock;
}

export function MealHistoryLog({ data }: MealHistoryLogProps) {
  const historyData = data.content.data;
  const entries = historyData.entries ?? [];
  const totals = historyData.totals;
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {totals && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Daily Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>{Math.round(totals.kcal)} kcal</Text>
            <Text style={styles.summaryText}>P: {Math.round(totals.protein)}g</Text>
            <Text style={styles.summaryText}>F: {Math.round(totals.fat)}g</Text>
            <Text style={styles.summaryText}>C: {Math.round(totals.carbs)}g</Text>
          </View>
        </View>
      )}

      {entries.map((entry, index) => (
        <MealLog
          key={entry.mealType + index}
          data={{
            id: `history-entry-${index}`,
            type: 'mealEntry',
            content: { type: 'mealEntry', data: entry },
          }}
        />
      ))}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    summaryCard: {
      backgroundColor: colors.userBubble,
      borderRadius: 13,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 6,
      color: colors.text,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    summaryText: {
      fontSize: 15,
      color: colors.textSecondary,
    },
  });
