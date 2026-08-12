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
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
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
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#2E7D32',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              // headerBackTitleVisible: false,
              
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
            
            {/* Events */}
            <Stack.Screen name="events/[id]" options={{ title: 'Event Details',}} />
            
            {/* Tickets */}
            <Stack.Screen name="tickets/[id]" options={{ title: 'Ticket Details', headerShown: false }} />
            <Stack.Screen name="tickets/my-tickets" options={{ title: '', }} />
            
            {/* Announcements */}
            <Stack.Screen name="announcements/index" options={{ title: 'Announcements' }} />
            <Stack.Screen name="announcements/[id]" options={{ title: 'Announcement', headerTransparent: true, headerTitle: '' }} />
            
            {/* Membership */}
            <Stack.Screen name="membership/renew" options={{ title: '' }} />
            <Stack.Screen name="membership/settings" options={{ title: 'Membership Settings' }} />
            
            {/* Profile & Settings */}
            <Stack.Screen name="profile/edit" options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="profile/notifications" options={{ title: 'Notification Settings' }} />
            <Stack.Screen name="profile/payments" options={{ title: 'Payment Methods', }} />
            <Stack.Screen name="profile/security" options={{ title: 'Security',  }} />
            <Stack.Screen name="profile/support" options={{ title: '', }} />
            <Stack.Screen name="profile/transactions" options={{ title: 'Transactions' }} />
            
            {/* Admin */}
            <Stack.Screen name="admin/scanner" options={{ title: 'Ticket Scanner', headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}