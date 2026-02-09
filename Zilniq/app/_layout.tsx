import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
// import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import appConfig from '../app.json';
import { registerDeviceWithBackend } from '../utils/registerDeviceWithBackend';
import registerForPushNotificationsAsync from '../utils/registerNotifications';

//to replace
const FORCE_UPDATE_VERSION = '1.0.0';

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <SafeAreaProvider>
          <RootLayoutInner />
      </SafeAreaProvider>
    </ClerkProvider>
  );
}


function RootLayoutInner() {
  const [isUpdateRequired, setIsUpdateRequired] = useState(false);
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    async function initApp() {
      //Check app version
      const currentVersion = appConfig.expo?.version ?? '1.0.0';
      if (currentVersion < FORCE_UPDATE_VERSION) {
        setIsUpdateRequired(true);
        return;
      }

      // notification
      try {
        // Wait for Clerk to be fully loaded before accessing auth state
        if (!isLoaded) return;
        if (!isSignedIn) return;

        const clerkToken = await getToken();
        if (!clerkToken) return;

        const expoPushToken = await registerForPushNotificationsAsync();
        if (!expoPushToken) return;

        await registerDeviceWithBackend(expoPushToken, clerkToken);
        console.log('Push notifications setup complete');
      } catch (err) {
        console.error('Push notifications setup failed:', err);
      }
    }

    initApp();
  }, [isLoaded, isSignedIn, getToken]);

  const openStore = () => {
    const iosUrl = 'https://apps.apple.com/app/idYOUR_APP_ID'; // replace later
    const androidUrl = `market://details?id=${appConfig.expo?.android?.package}`; //Also replace later maybe? 
    const url = Platform.OS === 'ios' ? iosUrl : androidUrl;

    Linking.openURL(url).catch(err =>
      console.error('Error opening store:', err),
    );
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation:"none"
        }}
      />
      <StatusBar style="dark" />

      <Modal visible={isUpdateRequired} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Update Required</Text>
            <Text style={styles.message}>
              A new version of the app is available. Please update to continue
              using the app.
            </Text>
            
            {/* <LinearGradient colors={['#606060', "#060606"]} style={{borderRadius: 6, height:50}}> */}
              <TouchableOpacity style={styles.button} onPress={openStore}>
                <Text style={styles.buttonText}>Update Now</Text>
              </TouchableOpacity>
            {/* </LinearGradient> */}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
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
    justifyContent:'center',
    alignItems:'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
