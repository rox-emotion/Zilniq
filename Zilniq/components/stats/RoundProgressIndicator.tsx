import type { ColorPalette } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useColors } from '@/hooks/useColors';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, G, Svg } from 'react-native-svg';

interface RoundProgressIndicatorProps {
  progress: number;
  color: string;
  value: number;
  measure: string;
  text: string;
}

const SIZE = 100;
const STROKE_WIDTH = 8;
const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RoundProgressIndicator({ progress, color, value, measure, text }: RoundProgressIndicatorProps) {
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const clampedProgress = Math.min(1, progress);
  const offset = CIRCUMFERENCE * (1 - clampedProgress);
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View>
      <View style={styles.svgContainer}>
        <Svg width={SIZE} height={SIZE}>
          <G rotation={-90} originX={cx} originY={cy}>
            <Circle
              cx={cx}
              cy={cy}
              r={RADIUS}
              stroke={colors.progressTrack}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <Circle
              cx={cx}
              cy={cy}
              r={RADIUS}
              stroke={color}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={offset}
            />
          </G>
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={styles.valueText}>{value}</Text>
          <Text style={styles.measureText}>{measure}</Text>
        </View>
      </View>
      <Text style={styles.label}>{text}</Text>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    svgContainer: {
      width: SIZE,
      height: SIZE,
    },
    centerLabel: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    valueText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    measureText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    label: {
      alignSelf: 'center',
      marginTop: spacing.sm,
      color: colors.text,
    },
  });
