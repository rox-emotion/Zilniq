import { spacing } from '@/constants/spacing';
import { useColors } from '@/hooks/useColors';
import { usePurchases } from '@/providers/PurchasesProvider';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import type { ColorPalette } from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PremiumScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isPremium, isLoading, refreshSubscription } = usePurchases();

  const handleManageSubscription = async () => {
    if (Platform.OS === 'web') return;
    await RevenueCatUI.presentCustomerCenter();
  };

  const handlePurchaseCompleted = async () => {
    await refreshSubscription();
  };

  const handleRestoreCompleted = async () => {
    await refreshSubscription();
  };

  const handleDismiss = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </SafeAreaView>
    );
  }

  if (isPremium) {
    return (
      <SafeAreaView style={[styles.subscribedRoot, { backgroundColor: colors.background }]}>
        <View style={styles.subscribedContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            You're on ZILNIQ Premium
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Thank you for supporting us. You have access to all premium features.
          </Text>

          <Pressable
            onPress={handleManageSubscription}
            style={({ pressed }) => [styles.manageBtn, pressed && styles.pressed]}
          >
            <Text style={[styles.manageBtnText, { color: colors.text }]}>
              Manage Subscription
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Subscriptions are not available on web.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <RevenueCatUI.Paywall
      options={{ displayCloseButton: true }}
      onPurchaseCompleted={handlePurchaseCompleted}
      onRestoreCompleted={handleRestoreCompleted}
      onDismiss={handleDismiss}
    />
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    subscribedRoot: {
      flex: 1,
    },
    subscribedContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
    },
    manageBtn: {
      marginTop: spacing.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    manageBtnText: {
      fontSize: 16,
      fontWeight: '500',
    },
    backBtn: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xl,
    },
    backBtnText: {
      fontSize: 15,
    },
    pressed: {
      opacity: 0.6,
    },
  });
