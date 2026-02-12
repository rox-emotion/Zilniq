import { colors } from '@/constants/colors';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function LoadingDots() {
  const [dots, setDots] = useState('.');

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

const styles = StyleSheet.create({
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
