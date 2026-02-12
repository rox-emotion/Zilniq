import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { DEFAULT_GOALS } from '@/constants/nutrition';
import { useWeeklyGraph } from '@/hooks/useStats';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

interface GraphProps {
  date: Date;
}

export function Graph({ date }: GraphProps) {
  const width = Dimensions.get('window').width;
  const height = 250;
  const chartTop = 40;
  const chartHeight = 180;
  const chartBottom = chartTop + chartHeight;
  const GOAL = DEFAULT_GOALS.kcal;

  const { data: days = [] } = useWeeklyGraph(date);

  const weekMax = days.length > 0 ? Math.max(...days.map((d) => d.value)) : 0;
  const computedMax = weekMax > GOAL ? weekMax * 1.1 : GOAL * 1.15;

  const barWidth = 18;
  const totalBarsWidth = days.length * barWidth;
  const totalGapsWidth = width - 60 - totalBarsWidth;
  const gap = totalGapsWidth / days.length;
  const startX = 60;

  const yGoal = chartBottom - (GOAL / computedMax) * chartHeight;

  const hasOverGoal = days.some((d) => d.value > GOAL);
  const actualMax = Math.max(...days.map((d) => d.value));

  const yLabels = hasOverGoal ? [0, 1500, GOAL, Math.round(actualMax)] : [0, 1500, GOAL];

  return (
    <View>
      <Svg width={width} height={height}>
        {yLabels.map((val) => {
          const y = chartBottom - (val / computedMax) * chartHeight;
          return (
            <SvgText key={val} x={10} y={y + 5} fontSize={14} fill={colors.graph.label} textAnchor="start">
              {val}
            </SvgText>
          );
        })}

        <Line
          x1={startX - 10}
          x2={width - 20}
          y1={yGoal}
          y2={yGoal}
          stroke={colors.graph.goalLine}
          strokeWidth={1}
          strokeDasharray="4 2"
        />

        {days.map((d, i) => {
          const x = startX + i * (barWidth + gap);
          const isOver = d.value > GOAL;
          const fillH = (d.value / computedMax) * chartHeight;
          const yFill = chartBottom - fillH;
          const fillColor = isOver ? colors.graph.overGoal : colors.graph.underGoal;
          const trackHeight = isOver ? fillH : (GOAL / computedMax) * chartHeight;
          const trackY = isOver ? yFill : chartBottom - trackHeight;

          return (
            <React.Fragment key={`${d.day}-${i}`}>
              <Rect
                x={x}
                y={trackY}
                width={barWidth}
                height={trackHeight}
                rx={10}
                fill={colors.trackBackground}
              />
              <Rect x={x} y={yFill} width={barWidth} height={fillH} rx={10} fill={fillColor} />
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

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.graph.legendUnder }]} />
          <Text style={styles.legendText}>Under goal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.graph.legendOver }]} />
          <Text style={styles.legendText}>Over goal</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
