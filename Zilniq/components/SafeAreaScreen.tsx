import { colors } from '@/constants/colors';
import type { ViewStyle } from 'react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaScreenProps {
  children: React.ReactNode;
  withBottom?: boolean;
  paddingHorizontal?: number;
  extraStyles?: ViewStyle;
}

export function SafeAreaScreen({
  children,
  withBottom = true,
  paddingHorizontal = 14,
  extraStyles,
}: SafeAreaScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: withBottom ? insets.bottom : 0,
        paddingHorizontal,
        backgroundColor: colors.background,
        ...extraStyles,
      }}
    >
      {children}
    </View>
  );
}
