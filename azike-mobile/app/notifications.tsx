
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { api } from '../services/api';
import { BellIcon, CheckCircleIcon } from 'react-native-heroicons/outline';
import { format } from 'date-fns';
import { router } from 'expo-router';

interface Notification {
  id: string;
  title: string;
  body: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/announcements/notifications');
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await api.patch(`/announcements/notifications/${notification.id}/read`);
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => prev - 1);
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate based on data
    if (notification.data?.screen) {
      switch (notification.data.screen) {
        case 'EventDetails':
          router.push(`/events/${notification.data.event_id}`);
          break;
        case 'MembershipRenewal':
          router.push('/membership/renew');
          break;
        case 'AnnouncementDetail':
          router.push(`/announcements/${notification.data.announcement_id}`);
          break;
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/announcements/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-primary px-5 pt-12 pb-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-white/80 text-sm mt-1">
                {unreadCount} unread
              </Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              className="bg-white/20 px-3 py-2 rounded-lg"
              onPress={markAllAsRead}
            >
              <Text className="text-white text-sm">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View className="p-8 items-center">
            <BellIcon size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-center mt-4">
              No notifications yet
            </Text>
          </View>
        ) : (
          <View className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                className={`p-4 ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
                onPress={() => handleNotificationPress(notification)}
              >
                <View className="flex-row items-start">
                  <View className="flex-1">
                    <Text className={`font-semibold mb-1 ${
                      notification.is_read ? 'text-gray-800' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </Text>
                    <Text className={`text-sm mb-2 ${
                      notification.is_read ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      {notification.body}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                    </Text>
                  </View>
                  {!notification.is_read && (
                    <View className="w-2 h-2 bg-primary rounded-full ml-2 mt-2" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}