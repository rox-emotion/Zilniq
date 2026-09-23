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
  /** Diameter in points. Defaults to 100 (the original fixed size). */
  size?: number;
}

const DEFAULT_SIZE = 100;
const STROKE_WIDTH = 8;

export function RoundProgressIndicator({
  progress,
  color,
  value,
  measure,
  text,
  size = DEFAULT_SIZE,
}: RoundProgressIndicatorProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - STROKE_WIDTH;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, progress);
  const offset = circumference * (1 - clampedProgress);
  const colors = useColors();
  const scale = size / DEFAULT_SIZE;
  const styles = useMemo(() => createStyles(colors, size, scale), [colors, size, scale]);

  return (
    <View>
      <View style={styles.svgContainer}>
        <Svg width={size} height={size}>
          <G rotation={-90} originX={cx} originY={cy}>
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={colors.progressTrack}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={color}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
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

const createStyles = (colors: ColorPalette, size: number, scale: number) =>
  StyleSheet.create({
    svgContainer: {
      width: size,
      height: size,
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
      fontSize: Math.round(18 * scale),
      fontWeight: '700',
      color: colors.text,
    },
    measureText: {
      fontSize: Math.round(16 * scale),
      color: colors.textSecondary,
    },
    label: {
      alignSelf: 'center',
      marginTop: spacing.sm,
      color: colors.text,
    },
  });
