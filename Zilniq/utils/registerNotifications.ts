// utils/registerNotifications.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

export default async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    Alert.alert('Push Notifications require a physical device');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Failed to get push token for push notifications!');
    return;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'd5e5e0a5-8884-4d77-80d5-222fb41fc032', 
    });
    token = tokenData.data;
    console.log('Expo Push Token:', token);
  } catch (err) {
    console.error('Error getting push token', err);
  }

  return token;
}
