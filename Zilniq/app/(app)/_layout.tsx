import ChatIcon from '@/assets/icons/ChatIcon';
import MenuIcon from '@/assets/icons/MenuIcon';
import StatsIcon from '@/assets/icons/StatsIcon';
import { spacing } from '@/constants/spacing';
import { useColors } from '@/hooks/useColors';
import { usePurchases } from '@/providers/PurchasesProvider';
import { logEvent } from '@/utils/analytics';
import { useAuth } from '@clerk/clerk-expo';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { Route } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { CustomDrawerContent } from './_drawerContent';

function getMainRouteName(route: Route<string>): string {
  return getFocusedRouteNameFromRoute(route) ?? 'home';
}

export default function AppLayout() {
  const colors = useColors();
  const { isLoaded, isSignedIn } = useAuth();
  const { isPremium, isLoading, refreshSubscription, bootstrapError, retryBootstrap } =
    usePurchases();

  const showConnectionError =
    isSignedIn && bootstrapError && !isPremium && Platform.OS !== 'web';
  const showPaywall =
    isSignedIn && !isPremium && !bootstrapError && Platform.OS !== 'web';

  useEffect(() => {
    if (isLoaded && !isLoading && showPaywall) {
      logEvent('paywall_viewed');
    }
  }, [isLoaded, isLoading, showPaywall]);

  if (!isLoaded || isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign_in" />;
  }

  if (showConnectionError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Can&apos;t reach Zilniq</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Check your internet connection and try again.
        </Text>
        <Pressable
          onPress={retryBootstrap}
          style={({ pressed }) => [
            styles.retryButton,
            { borderColor: colors.border },
            pressed && styles.retryButtonPressed,
          ]}
        >
          <Text style={[styles.retryButtonText, { color: colors.text }]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (showPaywall) {
    return (
      <RevenueCatUI.Paywall
        onPurchaseCompleted={() => {
          logEvent('purchase_completed');
          refreshSubscription();
        }}
        onRestoreCompleted={() => {
          logEvent('restore_completed');
          refreshSubscription();
        }}
      />
    );
  }

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerTitle: '',
        headerStyle: { backgroundColor: colors.background },
        drawerStyle: { backgroundColor: colors.background },
        drawerActiveBackgroundColor: colors.drawer.activeBackground,
        drawerActiveTintColor: colors.drawer.activeTint,
        headerShadowVisible: false,
        headerLeft: () => (
          <Pressable hitSlop={5} onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <MenuIcon color={colors.text} />
          </Pressable>
        ),
      })}
    >
      <Drawer.Screen
        name="(main)"
        options={({ route }) => {
          const focused = getMainRouteName(route);
          const isStats = focused === 'stats';

          return {
            title: '',
            headerRight: isStats
              ? () => (
                  <Pressable onPress={() => router.push('/home')} hitSlop={20}>
                    <LinearGradient colors={colors.gradient.buttonActive} style={styles.headerButton}>
                      <ChatIcon />
                    </LinearGradient>
                  </Pressable>
                )
              : () => (
                  <Pressable onPress={() => router.push('/stats')} hitSlop={20}>
                    <LinearGradient colors={colors.gradient.buttonActive} style={styles.headerButton}>
                      <StatsIcon />
                    </LinearGradient>
                  </Pressable>
                ),
          };
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
  },
  retryButtonPressed: {
    opacity: 0.6,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuButton: {
    paddingHorizontal: spacing.xl,
  },
  headerButton: {
    height: 48,
    width: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
});
