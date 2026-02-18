import type { ColorPalette } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface DayHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  goalKcal?: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate.getTime() === today.getTime()) return 'Today';

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (compareDate.getTime() === yesterday.getTime()) return 'Yesterday';

  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compare = new Date(date);
  compare.setHours(0, 0, 0, 0);
  return compare.getTime() === today.getTime();
}

export default function DayHeader({ selectedDate, onDateChange, goalKcal = 2560 }: DayHeaderProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const isTodaySelected = isToday(selectedDate);

  return (
    <View style={styles.container}>
      <Pressable hitSlop={20} onPress={handlePreviousDay}>
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        <View style={styles.goalContainer}>
          <Text style={styles.goalLabel}>Goal: </Text>
          <Text style={styles.goalValue}>{goalKcal}</Text>
          <Text style={styles.goalLabel}> Kcal</Text>
        </View>
      </View>

      <Pressable
        style={isTodaySelected ? styles.arrowDisabled : undefined}
        onPress={handleNextDay}
        disabled={isTodaySelected}
        hitSlop={20}
      >
        <Ionicons name="chevron-forward" size={18} color={isTodaySelected ? colors.disabled : colors.text} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: spacing.lg,
      marginBottom: 42,
      backgroundColor: colors.background,
      justifyContent: 'center',
    },
    center: {
      alignItems: 'center',
      paddingHorizontal: 34,
    },
    arrowDisabled: {
      opacity: 0.4,
    },
    dateText: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 5,
    },
    goalContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    goalLabel: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '400',
    },
    goalValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
  });
