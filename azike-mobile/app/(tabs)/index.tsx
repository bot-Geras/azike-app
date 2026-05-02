
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useMembership } from '../../hooks/useMembership';
import { router } from 'expo-router';
import { CalendarIcon, TicketIcon, UserGroupIcon, BellIcon, ChevronRightIcon, SparklesIcon, MapPinIcon, ClockIcon } from 'react-native-heroicons/outline';
import { EventCardSkeleton, MembershipCardSkeleton, SkeletonLoader } from '../../components/SkeletonLoader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvents } from '../../hooks/useEvents';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';

/* 
  ------------------------------------------------------------------
  TEST DATA: Dummy content for Home Screen (Commented out)
  ------------------------------------------------------------------
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
*/

export default function HomeScreen() {
  const { user } = useAuth();
  const { membership, isLoading: isMembershipLoading, refetch: refetchMembership } = useMembership();
  const { data: eventsData, isLoading: isEventsLoading, refetch: refetchEvents } = useEvents('upcoming');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    setIsAnnouncementsLoading(true);
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data.data.announcements.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setIsAnnouncementsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchMembership(),
      refetchEvents(),
      fetchAnnouncements()
    ]);
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const events = eventsData?.events || [];

  return (
    <ScrollView 
      className="flex-1 bg-gray-50" 
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
      }
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
            {isMembershipLoading ? (
              <View className="mt-8">
                <MembershipCardSkeleton />
              </View>
            ) : (
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
                          {membership?.membership_tier || 'Premium Member'}
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
                        {membership?.digital_card?.member_id || '---'}
                      </Text>
                    </View>
                    {membership?.is_active ? (
                      <View className="items-end">
                        <Text className="text-gray-400 text-xs uppercase font-medium">Validity</Text>
                        <Text className="text-primary font-bold text-sm">
                          {membership?.current_period?.days_remaining} days left
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
            )}
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
          
          {isEventsLoading && !refreshing ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
              {[1, 2].map((i) => (
                <View key={i} className="w-[280px] mr-4">
                  <EventCardSkeleton />
                </View>
              ))}
            </ScrollView>
          ) : events.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="-mx-5 px-5"
            >
              {events.map((event: any) => (
                <TouchableOpacity 
                  key={event.event_id}
                  onPress={() => router.push(`/events/${event.event_id}`)}
                  activeOpacity={0.9}
                  className="bg-white rounded-[32px] w-[280px] mr-4 overflow-hidden border border-gray-100 shadow-sm"
                >
                  {event.banner_image_url ? (
                    <Image source={{ uri: event.banner_image_url }} className="w-full h-40" />
                  ) : (
                    <View className="w-full h-40 bg-primary/10 items-center justify-center">
                      <CalendarIcon size={40} color="#2E7D32" />
                    </View>
                  )}
                  <View className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full">
                    <Text className="text-primary text-[10px] font-bold uppercase">
                      {event.is_members_only ? 'Members Only' : 'Public'}
                    </Text>
                  </View>
                  <View className="p-4">
                    <Text className="text-gray-900 font-bold text-lg mb-2" numberOfLines={1}>
                      {event.title}
                    </Text>
                    <View className="flex-row items-center mb-1">
                      <CalendarIcon size={14} color="#6B7280" />
                      <Text className="text-gray-500 text-xs ml-1.5">
                        {new Date(event.start_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MapPinIcon size={14} color="#6B7280" />
                      <Text className="text-gray-500 text-xs ml-1.5" numberOfLines={1}>{event.location}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className="bg-white rounded-[32px] p-10 items-center border border-gray-100 shadow-sm">
              <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-5">
                <CalendarIcon size={40} color="#D1D5DB" />
              </View>
              <Text className="text-gray-900 font-bold text-lg">No events scheduled</Text>
              <Text className="text-gray-500 text-sm text-center mt-2 leading-5">
                We're planning new activities for the community. Check back soon for updates!
              </Text>
            </View>
          )}
        </View>

        {/* Announcements Section */}
        <View className="px-5 mt-10">
          <View className="flex-row justify-between items-center mb-5">
            <View>
              <Text className="text-xl font-bold text-gray-900">Latest News</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Stay updated with the community</Text>
            </View>
          </View>
          
          {isAnnouncementsLoading && !refreshing ? (
            [1, 2].map((i) => (
              <View key={i} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
                <View className="flex-row items-start">
                  <SkeletonLoader className="w-10 h-10 rounded-xl mr-4" />
                  <View className="flex-1">
                    <SkeletonLoader className="w-3/4 h-5 mb-2" />
                    <SkeletonLoader className="w-full h-4" />
                  </View>
                </View>
              </View>
            ))
          ) : announcements.length > 0 ? (
            announcements.map((news) => (
              <TouchableOpacity 
                key={news.id} 
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4"
                onPress={() => router.push(`/announcements/${news.id}`)}
              >
                <View className="flex-row items-start">
                  <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                    news.target_audience === 'members_only' ? 'bg-accent/10' : 'bg-primary/10'
                  }`}>
                    <BellIcon size={20} color={news.target_audience === 'members_only' ? '#DAA520' : '#2E7D32'} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>{news.title}</Text>
                      <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-tighter">
                        {new Date(news.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-sm leading-5" numberOfLines={2}>
                      {news.body}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white rounded-[32px] p-8 items-center border border-gray-100 shadow-sm">
              <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                <BellIcon size={32} color="#D1D5DB" />
              </View>
              <Text className="text-gray-900 font-bold text-base">No news yet</Text>
              <Text className="text-gray-500 text-xs text-center mt-1">
                When there are updates, they'll appear here.
              </Text>
            </View>
          )}
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
