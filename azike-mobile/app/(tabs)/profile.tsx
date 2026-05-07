
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';
import { 
  UserIcon, 
  CreditCardIcon, 
  BellIcon, 
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon
} from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            queryClient.clear();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 ">
      <View className="flex-1 ">
        {/* Profile Header */}
      <View className="bg-primary px-5 pt-12 pb-8 rounded-b-3xl">
        <View className="items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-3">
            {user?.profile_picture_url ? (
              <Image 
                source={{ uri: user.profile_picture_url }}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <UserIcon size={40} color="#2E7D32" />
            )}
          </View>
          <Text className="text-white text-xl font-bold">
            {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-white/80 text-sm mt-1">{user?.email}</Text>
          <Text className="text-white/60 text-xs mt-1">{user?.phone_number}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View className="px-5 -mt-3">
        <View className="bg-white rounded-xl divide-y divide-gray-100 shadow-sm">
          <MenuItem 
            icon={<UserIcon size={20} color="#2E7D32" />}
            label="Edit Profile"
            onPress={() => router.push('/profile/edit')}
          />
          <MenuItem 
            icon={<CreditCardIcon size={20} color="#2E7D32" />}
            label="Payment Methods"
            onPress={() => router.push('/profile/payments')}
          />
          <MenuItem 
            icon={<BellIcon size={20} color="#2E7D32" />}
            label="Notifications"
            onPress={() => router.push('/profile/notifications')}
          />
          <MenuItem 
            icon={<ShieldCheckIcon size={20} color="#2E7D32" />}
            label="Privacy & Security"
            onPress={() => router.push('/profile/security')}
          />
        </View>

        <View className="bg-white rounded-xl divide-y divide-gray-100 mt-4 shadow-sm">
          <MenuItem 
            icon={<QuestionMarkCircleIcon size={20} color="#2E7D32" />}
            label="Help & Support"
            onPress={() => router.push('/profile/support')}
          />
        </View>

        <TouchableOpacity 
          className="bg-white rounded-xl p-4 mt-4 shadow-sm flex-row items-center"
          onPress={handleLogout}
        >
          <ArrowRightOnRectangleIcon size={20} color="#F44336" />
          <Text className="text-error ml-3 font-medium">Logout</Text>
        </TouchableOpacity>

        <Text className="text-gray-400 text-xs text-center mt-6 mb-8">
          Version 1.0.0 • AZIKE Community
        </Text>
      </View>
      </View>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      className="flex-row items-center justify-between p-4"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="text-gray-700 ml-3">{label}</Text>
      </View>
      <ChevronRightIcon size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}