import type { ColorPalette } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function LoadingDots() {
  const [dots, setDots] = useState('.');
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev === '...' ? '.' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{dots}</Text>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      width: 53,
      height: 27,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 13,
      backgroundColor: colors.loadingDotsBg,
    },
    text: {
      fontSize: 24,
      color: colors.loadingDotsText,
      lineHeight: 24,
    },
  });
