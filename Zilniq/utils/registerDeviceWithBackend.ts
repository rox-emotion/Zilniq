import { apiFetch } from '@/api/client';
import { APP_VERSION } from '@/constants/version';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

interface DeviceRegistrationPayload {
  expoPushToken: string;
  platform: 'ios' | 'android';
  deviceId: string;
  appVersion: string;
  timezone: string;
  locale: string;
}

export async function registerDeviceWithBackend(
  expoPushToken: string,
  clerkToken: string,
): Promise<unknown> {
  const payload: DeviceRegistrationPayload = {
    expoPushToken,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    deviceId: Device.modelName || 'unknown',
    appVersion: APP_VERSION,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: Intl.DateTimeFormat().resolvedOptions().locale || 'en-US',
  };

  return apiFetch('/api/devices/register', {
    token: clerkToken,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
