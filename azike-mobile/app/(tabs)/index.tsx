
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useMembership } from '../../hooks/useMembership';
import { router } from 'expo-router';
import { CalendarIcon, TicketIcon, UserGroupIcon, BellIcon, ChevronRightIcon, SparklesIcon, MapPinIcon, ClockIcon } from 'react-native-heroicons/outline';
import { EventCardSkeleton, MembershipCardSkeleton, SkeletonLoader } from '../../components/SkeletonLoader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const DUMMY_EVENTS = [
  {
    id: '1',
    title: 'Community Tech Meetup',
    date: 'May 15, 2024',
    time: '6:00 PM',
    location: 'Azike Hub, Main Hall',
    image: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=800&auto=format&fit=crop&q=60',
    category: 'Technology'
  },
  {
    id: '2',
    title: 'Annual Charity Gala',
    date: 'June 02, 2024',
    time: '7:30 PM',
    location: 'Grand Ballroom',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60',
    category: 'Social'
  }
];

const DUMMY_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'New Member Perks!',
    content: 'We have partnered with local cafes to give you 10% off. Check your card for details.',
    time: '2 hours ago',
    type: 'Update'
  },
  {
    id: '2',
    title: 'App Maintenance',
    content: 'The app will be undergoing brief maintenance this Sunday at 2 AM.',
    time: '1 day ago',
    type: 'Alert'
  }
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { membership, isLoading } = useMembership();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // if (isLoading) {
  //   return (
  //     <View className="flex-1 bg-white justify-center items-center">
  //       <ActivityIndicator size="large" color="#2E7D32" />
  //     </View>
  //   );
  // }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50" 
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1">
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={['#2E7D32', '#1B5E20']}
          className="px-5 pt-12 pb-12 rounded-b-[40px] shadow-lg"
        >
          <SafeAreaView>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border border-white/30 mr-3">
                  <Text className="text-white text-xl font-bold">
                    {user?.first_name?.charAt(0) || 'U'}
                  </Text>
                </View>
                <View>
                  <Text className="text-white/70 text-sm font-medium">
                    {getGreeting()}
                  </Text>
                  <Text className="text-white text-2xl font-bold">
                    {user?.first_name} 👋
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/notifications')}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20"
              >
                <BellIcon size={22} color="white" />
                <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full border-2 border-[#2E7D32]" />
              </TouchableOpacity>
            </View>

            {/* Membership Card - Integrated into Header */}
            <TouchableOpacity 
              onPress={() => router.push('/card')}
              activeOpacity={0.9}
              className="mt-8 overflow-hidden"
            >
              <LinearGradient
                colors={['#ffffff', '#f8fdf8']}
                className="rounded-3xl p-5 shadow-xl"
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <View className="flex-row items-center mb-1">
                      <SparklesIcon size={16} color="#2E7D32" />
                      <Text className="text-primary font-bold text-xs ml-1 uppercase tracking-wider">
                        {membership?.tier || 'Premium Member'}
                      </Text>
                    </View>
                    <Text className="text-gray-900 text-xl font-bold">
                      Digital Member Card
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${
                    membership?.is_active ? 'bg-success/10' : 'bg-error/10'
                  }`}>
                    <Text className={`text-xs font-bold ${
                      membership?.is_active ? 'text-success' : 'text-error'
                    }`}>
                      {membership?.is_active ? 'ACTIVE' : 'EXPIRED'}
                    </Text>
                  </View>
                </View>

                <View className="mt-6 flex-row justify-between items-end">
                  <View>
                    <Text className="text-gray-400 text-xs uppercase font-medium">Member ID</Text>
                    <Text className="text-gray-800 font-mono text-base font-bold mt-0.5">
                      {membership?.digital_card?.member_id || 'AZ-8829-102'}
                    </Text>
                  </View>
                  {membership?.is_active ? (
                    <View className="items-end">
                      <Text className="text-gray-400 text-xs uppercase font-medium">Validity</Text>
                      <Text className="text-primary font-bold text-sm">
                        {membership?.current_period.days_remaining} days left
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      className="bg-primary px-5 py-2.5 rounded-xl shadow-md"
                      onPress={() => router.push('/membership/renew')}
                    >
                      <Text className="text-white font-bold text-sm">Renew Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </SafeAreaView>
        </LinearGradient>

        {/* Quick Actions Grid */}
        <View className="px-5 -mt-6">
          <View className="bg-white rounded-3xl p-6 shadow-sm flex-row justify-between items-center border border-gray-100">
            <QuickAction 
              icon={<CalendarIcon size={26} color="#2E7D32" />}
              label="Events"
              onPress={() => router.push('/events')}
            />
            <View className="w-[1px] h-10 bg-gray-100" />
            <QuickAction 
              icon={<TicketIcon size={26} color="#2E7D32" />}
              label="Tickets"
              onPress={() => router.push('/tickets/my-tickets')}
            />
            <View className="w-[1px] h-10 bg-gray-100" />
            <QuickAction 
              icon={<UserGroupIcon size={26} color="#2E7D32" />}
              label="Profile"
              onPress={() => router.push('/profile')}
            />
          </View>
        </View>

        {/* Upcoming Events Section */}
        <View className="px-5 mt-10">
          <View className="flex-row justify-between items-center mb-5">
            <View>
              <Text className="text-xl font-bold text-gray-900">Upcoming Events</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Don't miss out on what's next</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/events')}
              className="flex-row items-center"
            >
              <Text className="text-primary font-bold text-sm mr-1">See All</Text>
              <ChevronRightIcon size={16} color="#2E7D32" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="-mx-5 px-5"
          >
            {DUMMY_EVENTS.map((event) => (
              <TouchableOpacity 
                key={event.id}
                onPress={() => router.push(`/events/${event.id}`)}
                activeOpacity={0.9}
                className="bg-white rounded-[32px] w-[280px] mr-4 overflow-hidden border border-gray-100 shadow-sm"
              >
                <Image source={{ uri: event.image }} className="w-full h-40" />
                <View className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full">
                  <Text className="text-primary text-[10px] font-bold uppercase">{event.category}</Text>
                </View>
                <View className="p-4">
                  <Text className="text-gray-900 font-bold text-lg mb-2" numberOfLines={1}>
                    {event.title}
                  </Text>
                  <View className="flex-row items-center mb-1">
                    <CalendarIcon size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-xs ml-1.5">{event.date}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <MapPinIcon size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-xs ml-1.5" numberOfLines={1}>{event.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Announcements Section */}
        <View className="px-5 mt-10">
          <View className="flex-row justify-between items-center mb-5">
            <View>
              <Text className="text-xl font-bold text-gray-900">Latest News</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Stay updated with the community</Text>
            </View>
          </View>
          
          {DUMMY_ANNOUNCEMENTS.map((news) => (
            <View key={news.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
              <View className="flex-row items-start">
                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                  news.type === 'Alert' ? 'bg-error/10' : 'bg-accent/10'
                }`}>
                  <BellIcon size={20} color={news.type === 'Alert' ? '#F44336' : '#DAA520'} />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-gray-900 font-bold text-base">{news.title}</Text>
                    <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-tighter">
                      {news.time}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-sm leading-5">
                    {news.content}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
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
      className="items-center flex-1"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-14 h-14 bg-primary/5 rounded-2xl items-center justify-center mb-2 border border-primary/10">
        {icon}
      </View>
      <Text className="text-gray-700 text-xs font-bold">{label}</Text>
    </TouchableOpacity>
  );
}
