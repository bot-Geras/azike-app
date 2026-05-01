
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { api } from './api';

export async function registerForPushNotificationsAsync() {
  // Check if running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';
  
  if (isExpoGo) {
    console.warn('Push notifications are not fully supported in Expo Go. Please use a development build.');
    return null;
  }

  if (!Device.isDevice) {
    console.log('Push notifications require physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PROJECT_ID || Constants.expoConfig?.extra?.eas?.projectId
    })).data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('azike_notifications', {
        name: 'AZIKE Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }

    return token;
  } catch (e) {
    console.error('Error getting push token:', e);
    return null;
  }
}

export function setupNotificationListeners(p0: (response: any) => void) {
  // Handle notifications received while app is foregrounded
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Handle notification tap
  Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    
    if (data?.screen) {
      switch (data.screen) {
        case 'EventDetails':
          router.push(`/events/${data.event_id}`);
          break;
        case 'MembershipRenewal':
          router.push('/membership/renew');
          break;
        case 'AnnouncementDetail':
          router.push(`/announcements/${data.announcement_id}`);
          break;
        case 'MyTickets':
          router.push('/tickets/my-tickets');
          break;
        default:
          router.push('/');
      }
    }
  });
}