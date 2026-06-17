import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useMembership } from "../../hooks/useMembership";
import { router } from "expo-router";
import {
  CalendarIcon,
  TicketIcon,
  UserGroupIcon,
  BellIcon,
  ChevronRightIcon,
  SparklesIcon,
  MapPinIcon,
  ClockIcon,
} from "react-native-heroicons/outline";
import {
  EventCardSkeleton,
  MembershipCardSkeleton,
  SkeletonLoader,
} from "../../components/SkeletonLoader";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useEvents } from "../../hooks/useEvents";
import { useState, useEffect } from "react";
import { api } from "../../services/api";

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
  const {
    membership,
    isLoading: isMembershipLoading,
    refetch: refetchMembership,
  } = useMembership();
  const {
    data: eventsData,
    isLoading: isEventsLoading,
    refetch: refetchEvents,
  } = useEvents("upcoming");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    setIsAnnouncementsLoading(true);
    try {
      const response = await api.get("/announcements");
      setAnnouncements(response.data.data.announcements.slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
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
      fetchAnnouncements(),
    ]);
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const events = eventsData?.events || [];

  return (
    <ScrollView
      className="flex-1 bg-[#F5F5F0]"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#1A3C2E"
        />
      }
    >
      <View className="flex-1">
        {/* Header */}
        <View className="bg-[#1A3C2E] px-5 pt-5 pb-10">
          <SafeAreaView>
            {/* Top Row */}
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-[#8EB89A] text-xs tracking-widest uppercase font-medium mb-0.5">
                  {getGreeting()}
                </Text>
                <Text className="text-white text-2xl font-bold tracking-tight">
                  {user?.first_name}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => router.push("/notifications")}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/10"
                >
                  <BellIcon size={20} color="white" />
                  <View className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Member Card */}
            <TouchableOpacity
              onPress={() => router.push("/card")}
              activeOpacity={0.9}
              className="mt-6"
            >
              {isMembershipLoading ? (
                <MembershipCardSkeleton />
              ) : (
                <View
                  className="bg-white rounded-2xl p-5"
                  style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)" }}
                >
                  <View className="flex-row justify-between items-start mb-5">
                    <View>
                      <View className="flex-row items-center mb-1">
                        {membership?.is_active && (
                          <SparklesIcon size={13} color="#1A3C2E" />
                        )}
                        <Text className="text-[#1A3C2E] font-semibold text-xs ml-1 uppercase tracking-widest">
                          {membership?.membership_tier
                            ? `${membership.membership_tier} Member`
                            : "Standard Member"}
                        </Text>
                      </View>
                      <Text className="text-[#1A3C2E] text-lg font-bold">
                        Digital Member Card
                      </Text>
                    </View>
                    <View
                      className={`px-2.5 py-1 rounded-full ${
                        membership?.is_active ? "bg-emerald-50" : "bg-red-50"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          membership?.is_active
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {membership?.is_active ? "● Active" : "● Expired"}
                      </Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View className="h-px bg-gray-50 mb-4" />

                  <View className="flex-row justify-between items-end">
                    <View>
                      <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-medium mb-1">
                        Member ID
                      </Text>
                      <Text className="text-[#1A3C2E] font-mono text-sm font-bold tracking-widest">
                        {membership?.digital_card?.member_id || "---"}
                      </Text>
                    </View>
                    {membership?.is_active ? (
                      <View className="items-end">
                        <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-medium mb-1">
                          Validity
                        </Text>
                        <Text className="text-[#1A3C2E] font-bold text-sm">
                          {membership?.current_period?.days_remaining} days left
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        className="bg-[#1A3C2E] px-4 py-2 rounded-xl"
                        onPress={() => router.push("/membership/renew")}
                      >
                        <Text className="text-white font-semibold text-xs">
                          Renew Now
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Quick Actions */}
        <View className="px-5 -mt-5">
          <View
            className="bg-white rounded-2xl px-6 py-4 flex-row justify-between items-center"
            style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)" }}
          >
            <QuickAction
              icon={<CalendarIcon size={24} color="#1A3C2E" />}
              label="Events"
              onPress={() => router.push("/events")}
            />
            <View className="w-px h-8 bg-gray-100" />
            <QuickAction
              icon={<TicketIcon size={24} color="#1A3C2E" />}
              label="Tickets"
              onPress={() => router.push("/tickets/my-tickets")}
            />
            <View className="w-px h-8 bg-gray-100" />
            <QuickAction
              icon={<UserGroupIcon size={24} color="#1A3C2E" />}
              label="Profile"
              onPress={() => router.push("/profile")}
            />
          </View>
        </View>

        {/* Upcoming Events */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-4 px-5">
            <View>
              <Text className="text-[#9CA3AF] text-xs tracking-widest uppercase font-medium mb-0.5">
                What's Next
              </Text>
              <Text className="text-[#1A3C2E] text-lg font-bold">
                Upcoming Events
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/events")}
              className="flex-row items-center"
            >
              <Text className="text-[#1A3C2E] font-semibold text-sm mr-1">
                See All
              </Text>
              <ChevronRightIcon size={15} color="#1A3C2E" />
            </TouchableOpacity>
          </View>

          {isEventsLoading && !refreshing ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-5"
            >
              {[1, 2].map((i) => (
                <View key={i} className="w-[270px] mr-4">
                  <EventCardSkeleton />
                </View>
              ))}
            </ScrollView>
          ) : events.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {events.map((event: any) => (
                <TouchableOpacity
                  key={event.event_id}
                  onPress={() => router.push(`/events/${event.event_id}`)}
                  activeOpacity={0.92}
                  className="bg-white rounded-2xl w-[265px] mr-4 overflow-hidden"
                  style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)" }}
                >
                  {event.banner_image_url ? (
                    <Image
                      source={{ uri: event.banner_image_url }}
                      className="w-full h-36"
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={{
                        uri: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60",
                      }}
                      className="w-full h-36"
                      resizeMode="cover"
                    />
                  )}
                  {/* Badge */}
                  <View className="absolute top-2.5 left-2.5 bg-[#1A3C2E]/75 px-2.5 py-1 rounded-full">
                    <Text className="text-white text-[10px] font-semibold uppercase tracking-wide">
                      {event.is_members_only ? "Members Only" : "Public"}
                    </Text>
                  </View>
                  <View className="p-3.5">
                    <Text
                      className="text-[#1A3C2E] font-bold text-sm mb-2"
                      numberOfLines={1}
                    >
                      {event.title}
                    </Text>
                    <View className="flex-row items-center mb-1">
                      <CalendarIcon size={12} color="#9CA3AF" />
                      <Text className="text-gray-400 text-xs ml-1.5">
                        {event.start_datetime &&
                        !isNaN(new Date(event.start_datetime).getTime())
                          ? new Date(event.start_datetime).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "TBA"}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MapPinIcon size={12} color="#9CA3AF" />
                      <Text
                        className="text-gray-400 text-xs ml-1.5"
                        numberOfLines={1}
                      >
                        {event.location}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View
              className="mx-5 bg-white rounded-2xl p-10 items-center"
              style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)" }}
            >
              <View className="w-16 h-16 bg-[#F0F7F1] rounded-full items-center justify-center mb-4">
                <CalendarIcon size={32} color="#8EB89A" />
              </View>
              <Text className="text-[#1A3C2E] font-bold text-base">
                No events scheduled
              </Text>
              <Text className="text-gray-400 text-xs text-center mt-1.5 leading-relaxed">
                We're planning new activities. Check back soon!
              </Text>
            </View>
          )}
        </View>

        {/* Announcements */}
        <View className="px-5 mt-8">
          <View className="mb-4">
            <Text className="text-[#9CA3AF] text-xs tracking-widest uppercase font-medium mb-0.5">
              Community
            </Text>
            <Text className="text-[#1A3C2E] text-lg font-bold">
              Latest News
            </Text>
          </View>

          {isAnnouncementsLoading && !refreshing ? (
            [1, 2].map((i) => (
              <View
                key={i}
                className="bg-white rounded-2xl p-4 mb-3"
                style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)" }}
              >
                <View className="flex-row items-start">
                  <SkeletonLoader className="w-10 h-10 rounded-xl mr-3" />
                  <View className="flex-1">
                    <SkeletonLoader className="w-3/4 h-4 mb-2" />
                    <SkeletonLoader className="w-full h-3" />
                  </View>
                </View>
              </View>
            ))
          ) : announcements.length > 0 ? (
            announcements.map((news) => (
              <TouchableOpacity
                key={news.id}
                className="bg-white rounded-2xl p-4 mb-3"
                style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)" }}
                onPress={() => router.push(`/announcements/${news.id}`)}
                activeOpacity={0.85}
              >
                <View className="flex-row items-start">
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                      news.target_audience === "members_only"
                        ? "bg-amber-50"
                        : "bg-[#F0F7F1]"
                    }`}
                  >
                    <BellIcon
                      size={18}
                      color={
                        news.target_audience === "members_only"
                          ? "#D97706"
                          : "#1A3C2E"
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text
                        className="text-[#1A3C2E] font-bold text-sm flex-1 mr-3"
                        numberOfLines={1}
                      >
                        {news.title}
                      </Text>
                      <Text className="text-gray-300 text-[10px] font-medium uppercase tracking-tight mt-0.5">
                        {news.created_at &&
                        !isNaN(new Date(news.created_at).getTime())
                          ? new Date(news.created_at).toLocaleDateString(
                              "en-GB",
                              { day: "numeric", month: "short" },
                            )
                          : ""}
                      </Text>
                    </View>
                    <Text
                      className="text-gray-400 text-xs leading-relaxed"
                      numberOfLines={2}
                    >
                      {news.body}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View
              className="bg-white rounded-2xl p-8 items-center"
              style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)" }}
            >
              <View className="w-14 h-14 bg-[#F0F7F1] rounded-full items-center justify-center mb-3">
                <BellIcon size={26} color="#8EB89A" />
              </View>
              <Text className="text-[#1A3C2E] font-bold text-sm">
                No news yet
              </Text>
              <Text className="text-gray-400 text-xs text-center mt-1">
                Updates will appear here when available.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
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
