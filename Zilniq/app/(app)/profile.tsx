import BackArrowIcon from '@/assets/icons/BackArrowIcon';
import { SafeAreaScreen } from '@/components/SafeAreaScreen';
import { SignOutButton } from '@/components/SignOutButton';
import { useColors } from '@/hooks/useColors';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export default function Profile() {
  const colors = useColors();

  return (
    <SafeAreaScreen>
      <Pressable onPress={() => router.back()}>
        <BackArrowIcon color={colors.text} />
      </Pressable>
      <View style={styles.center}>
        <SignOutButton />
      </View>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
