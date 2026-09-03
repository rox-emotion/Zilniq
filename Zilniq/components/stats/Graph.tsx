import type { ColorPalette } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { DEFAULT_GOALS } from '@/constants/nutrition';
import { useColors } from '@/hooks/useColors';
import { useWeeklyGraph } from '@/hooks/useStats';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { ActivityIndicator } from 'react-native';
interface GraphProps {
  date: Date;
  goalKcal?: number;
}

export function Graph({ date, goalKcal }: GraphProps) {
  const width = Dimensions.get('window').width;
  const height = 250;
  const chartTop = 40;
  const chartHeight = 180;
  const chartBottom = chartTop + chartHeight;

  const fallbackGoal = goalKcal ?? DEFAULT_GOALS.kcal;

  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { data: days = [], isLoading } = useWeeklyGraph(date);

  if (isLoading) {
  return (
    <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.graph.underGoal} />
    </View>
  );
}

  // Highest daily goal in the week — reference height for the track bars.
  const maxGoal =
    Math.max(...days.map((d) => d.goal ?? fallbackGoal)) || fallbackGoal;

  const barWidth = 18;
  const totalBarsWidth = days.length * barWidth;
  const totalGapsWidth = width - 60 - totalBarsWidth;
  const gap = totalGapsWidth / days.length;
  const startX = 60;

  return (
    <View>
      <Svg width={width} height={height}>
        {/* Y Axis labels */}
        {[0, Math.round(maxGoal / 2), maxGoal].map((val) => {
          const y =
            chartBottom - (val / maxGoal) * chartHeight;

          return (
            <SvgText
              key={val}
              x={10}
              y={y + 5}
              fontSize={14}
              fill={colors.graph.label}
              textAnchor="start"
            >
              {val}
            </SvgText>
          );
        })}

        {days.map((d, i) => {
          const dayGoal = d.goal ?? fallbackGoal;
          const dayValue = d.value ?? 0;

          const x = startX + i * (barWidth + gap);

          // Track (grey) bar — scaled to the week's max goal.
          const trackHeight =
            (dayGoal / maxGoal) * chartHeight;

          const trackY = chartBottom - trackHeight;

          // Progress relative to that day's own goal.
          const progressRatio =
            dayGoal === 0 ? 0 : dayValue / dayGoal;

          const isOver = progressRatio > 1;

          const fillHeight =
            Math.min(progressRatio, 1) * trackHeight;

          const yFill = chartBottom - fillHeight;

          const fillColor = isOver
            ? colors.graph.overGoal
            : colors.graph.underGoal;

          return (
            <React.Fragment key={`${d.day}-${i}`}>
              {/* Track (that day's goal) */}
              <Rect
                x={x}
                y={trackY}
                width={barWidth}
                height={trackHeight}
                rx={10}
                fill={colors.trackBackground}
              />

              {/* Progress */}
              <Rect
                x={x}
                y={yFill}
                width={barWidth}
                height={fillHeight}
                rx={10}
                fill={fillColor}
              />

              {/* Day label */}
              <SvgText
                x={x + barWidth / 2}
                y={chartBottom + 18}
                fontSize={14}
                fill={colors.graph.dayLabel}
                textAnchor="middle"
              >
                {d.day}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.graph.underGoal },
            ]}
          />
          <Text style={styles.legendText}>On target</Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.graph.overGoal },
            ]}
          />
          <Text style={styles.legendText}>Over target</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.md,
      gap: spacing.xxl,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    legendText: {
      color: colors.textMuted,
      fontSize: 14,
    },
  });