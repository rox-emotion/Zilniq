import { Platform } from 'react-native';


export async function registerDeviceWithBackend(expoPushToken: string, clerkToken: string) {
  try {

    const response = await fetch('https://payload-cms-production-c64b.up.railway.app/api/devices/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clerkToken}`,
      },
      body: JSON.stringify({
        expoPushToken,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        deviceId:  'unknown',
        appVersion: '1.0.0',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale:  'en-US',
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Device registered successfully:', data);
      return data;
    } else {
      console.error('Failed to register device:', data);
      throw new Error(data.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Error registering device:', error);
    throw error;
  }
}
