
import { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { 
  BellIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  MegaphoneIcon,
  TicketIcon 
} from 'react-native-heroicons/outline';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'event_reminders',
      title: 'Event Reminders',
      description: 'Get notified before events you\'re attending',
      icon: <CalendarIcon size={24} color="#2E7D32" />,
      enabled: true
    },
    {
      id: 'payment_updates',
      title: 'Payment Updates',
      description: 'Transaction confirmations and receipts',
      icon: <CurrencyDollarIcon size={24} color="#2E7D32" />,
      enabled: true
    },
    {
      id: 'announcements',
      title: 'Announcements',
      description: 'Community news and updates',
      icon: <MegaphoneIcon size={24} color="#2E7D32" />,
      enabled: true
    },
    {
      id: 'ticket_updates',
      title: 'Ticket Updates',
      description: 'When tickets are confirmed or checked in',
      icon: <TicketIcon size={24} color="#2E7D32" />,
      enabled: true
    },
    {
      id: 'membership_reminders',
      title: 'Membership Reminders',
      description: 'Expiry and renewal notifications',
      icon: <BellIcon size={24} color="#2E7D32" />,
      enabled: true
    }
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-primary px-5 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">Notifications</Text>
        <Text className="text-white/80 text-sm mt-1">
          Manage your notification preferences
        </Text>
      </View>

      <ScrollView className="flex-1 p-5">
        <View className="bg-white rounded-xl divide-y divide-gray-100">
          {settings.map((setting) => (
            <View key={setting.id} className="flex-row items-center p-4">
              <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                {setting.icon}
              </View>
              <View className="flex-1 mr-3">
                <Text className="font-medium text-gray-800">{setting.title}</Text>
                <Text className="text-gray-500 text-xs mt-0.5">{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: '#D1D5DB', true: '#A5D6A7' }}
                thumbColor={setting.enabled ? '#2E7D32' : '#9CA3AF'}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity className="mt-6 bg-white rounded-xl p-4">
          <Text className="text-error text-center font-medium">Disable All Notifications</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}