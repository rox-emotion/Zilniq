import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SafeAreaScreen({
  children,
  withBottom = true,
  paddingHorizontal = 14,
  extraStyles = {}
}: {
  children: React.ReactNode;
  withBottom?: boolean;
  paddingHorizontal?: number;
  extraStyles? : {}
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: withBottom ? insets.bottom : 0,
        paddingHorizontal: paddingHorizontal,
        backgroundColor: "#FFF",
        ...extraStyles
      }}
    >
      {children}
    </View>
  );
}
