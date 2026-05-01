
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useMembership } from '../../hooks/useMembership';
import { router } from 'expo-router';
import { CalendarIcon, TicketIcon, UserGroupIcon, BellIcon } from 'react-native-heroicons/outline';
import { EventCardSkeleton, MembershipCardSkeleton, SkeletonLoader } from '../../components/SkeletonLoader';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function HomeScreen() {
  const { user } = useAuth();
  const { membership, isLoading } = useMembership();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

// if (isLoading) {
//   return (
//     <ScrollView className="flex-1 bg-gray-50">
//       <View className="bg-primary px-5 pt-12 pb-6 rounded-b-3xl">
//         <View className="flex-row justify-between items-center">
//           <View>
//             <SkeletonLoader className="w-32 h-5 bg-white/20 mb-2" />
//             <SkeletonLoader className="w-48 h-8 bg-white/20" />
//           </View>
//           <SkeletonLoader className="w-10 h-10 bg-white/20 rounded-full" />
//         </View>
//         <View className="mt-6">
//           <MembershipCardSkeleton />
//         </View>
//       </View>
//       <View className="px-5 mt-6">
//         <SkeletonLoader className="w-32 h-6 mb-4" />
//         <EventCardSkeleton />
//         <EventCardSkeleton />
//       </View>
//     </ScrollView>
//   );
// }


  return (
    <ScrollView className="flex-1 bg-gray-50">
     <SafeAreaView>
       {/* Header */}
      <View className="bg-primary px-5 pt-12 pb-6 rounded-b-3xl">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white/80 text-base">
              {getGreeting()}
            </Text>
            <Text className="text-white text-2xl font-bold">
              {user?.first_name} 👋
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <BellIcon size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Membership Status Card */}
        <TouchableOpacity 
          onPress={() => router.push('/card')}
          className="bg-white rounded-xl p-4 mt-6"
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-600 text-sm">Membership Status</Text>
              <View className="flex-row items-center mt-1">
                <View className={`w-2 h-2 rounded-full mr-2 ${
                  membership?.is_active ? 'bg-success' : 'bg-error'
                }`} />
                <Text className={`text-lg font-semibold ${
                  membership?.is_active ? 'text-success' : 'text-error'
                }`}>
                  {membership?.is_active ? 'Active' : 'Expired'}
                </Text>
              </View>
            </View>
            {membership?.is_active ? (
              <View className="bg-primary/10 px-3 py-1 rounded-full">
                <Text className="text-primary text-sm">
                  {membership?.current_period.days_remaining} days left
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                className="bg-primary px-4 py-2 rounded-lg"
                onPress={() => router.push('/membership/renew')}
              >
                <Text className="text-white font-medium">Renew</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {membership?.is_active && (
            <View className="mt-3 pt-3 border-t border-gray-100">
              <Text className="text-gray-500 text-xs">Member ID</Text>
              <Text className="text-gray-800 font-mono text-sm">
                {membership?.digital_card?.member_id}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View className="px-5 -mt-3">
        <View className="bg-white rounded-xl p-4 shadow-sm flex-row justify-around">
          <QuickAction 
            icon={<CalendarIcon size={24} color="#2E7D32" />}
            label="Events"
            onPress={() => router.push('/events')}
          />
          <QuickAction 
            icon={<TicketIcon size={24} color="#2E7D32" />}
            label="My Tickets"
            onPress={() => router.push('/tickets/my-tickets')}
          />
          <QuickAction 
            icon={<UserGroupIcon size={24} color="#2E7D32" />}
            label="Community"
            onPress={() => router.push('/community')}
          />
        </View>
      </View>

      {/* Upcoming Events */}
      <View className="px-5 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-800">Upcoming Events</Text>
          <TouchableOpacity onPress={() => router.push('/events')}>
            <Text className="text-primary">See All</Text>
          </TouchableOpacity>
        </View>
        
        {/* Placeholder for events - will be populated in Sprint 3 */}
        <View className="bg-white rounded-xl p-4">
          <Text className="text-gray-400 text-center py-8">
            Events coming soon...
          </Text>
        </View>
      </View>

      {/* Announcements */}
      <View className="px-5 mt-6 mb-8">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Announcements</Text>
        <View className="bg-white rounded-xl p-4">
          <Text className="text-gray-400 text-center py-4">
            No announcements yet
          </Text>
        </View>
      </View>
     </SafeAreaView>
    </ScrollView>
  );
}

function QuickAction({ icon, label, onPress }: { 
  icon: React.ReactNode; 
  label: string; 
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      className="items-center"
      onPress={onPress}
    >
      <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-1">
        {icon}
      </View>
      <Text className="text-gray-600 text-xs">{label}</Text>
    </TouchableOpacity>
  );
}