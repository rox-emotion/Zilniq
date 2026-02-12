import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { QueryProvider } from '@/providers/QueryProvider';
import appConfig from '../app.json';
import { registerDeviceWithBackend } from '../utils/registerDeviceWithBackend';
import registerForPushNotificationsAsync from '../utils/registerNotifications';

const FORCE_UPDATE_VERSION = '1.0.0';

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <QueryProvider>
        <SafeAreaProvider>
          <RootLayoutInner />
        </SafeAreaProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}

function RootLayoutInner() {
  const [isUpdateRequired, setIsUpdateRequired] = useState(false);
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    async function initApp() {
      const currentVersion = appConfig.expo?.version ?? '1.0.0';
      if (compareVersions(currentVersion, FORCE_UPDATE_VERSION) < 0) {
        setIsUpdateRequired(true);
        return;
      }

      try {
        if (!isLoaded || !isSignedIn) return;

        const clerkToken = await getToken();
        if (!clerkToken) return;

        const expoPushToken = await registerForPushNotificationsAsync();
        if (!expoPushToken) return;

        await registerDeviceWithBackend(expoPushToken, clerkToken);
      } catch (err) {
        console.error('Push notifications setup failed:', err);
      }
    }

    initApp();
  }, [isLoaded, isSignedIn, getToken]);

  const openStore = () => {
    const iosUrl = 'https://apps.apple.com/app/idYOUR_APP_ID';
    const androidUrl = `market://details?id=${appConfig.expo?.android?.package}`;
    const url = Platform.OS === 'ios' ? iosUrl : androidUrl;
    Linking.openURL(url).catch((err) => console.error('Error opening store:', err));
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      <StatusBar style="dark" />

      <Modal visible={isUpdateRequired} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Update Required</Text>
            <Text style={styles.message}>
              A new version of the app is available. Please update to continue using the app.
            </Text>
            <TouchableOpacity style={styles.button} onPress={openStore}>
              <Text style={styles.buttonText}>Update Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: colors.background,
    padding: spacing.xl,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 26,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
