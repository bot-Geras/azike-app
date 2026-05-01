
import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../stores/authStore';
import { registerForPushNotificationsAsync, setupNotificationListeners } from '../services/notifications';
import { api } from '../services/api';
import '../global.css';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const { isAuthenticated, isHydrated, token, fetchMe, updateDeviceToken } = useAuthStore();

  useEffect(() => {
    setupNotificationListeners(() => {});

    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
      registerPushToken();
    }
  }, [isAuthenticated, token]);

  const registerPushToken = async () => {
    const pushToken = await registerForPushNotificationsAsync();
    
    if (pushToken) {
      try {
        await api.post('/auth/device-token', { fcm_token: pushToken });
        console.log('📱 Push token registered');
      } catch (error) {
        console.error('Failed to register push token:', error);
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="admin/scanner" options={{ headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}