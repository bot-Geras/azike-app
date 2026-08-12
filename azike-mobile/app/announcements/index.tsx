import { useQuery } from '@tanstack/react-query';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../services/api';
import { BellIcon, MegaphoneIcon } from 'react-native-heroicons/outline';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  target_audience: string;
  created_by: string;
  created_at: string;
}

/* 
  ------------------------------------------------------------------
  TEST DATA: Dummy announcements for Announcements Screen (Commented out)
  ------------------------------------------------------------------
const DUMMY_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'New Member Perks!',
    body: 'We have partnered with local cafes and co-working spaces to give you exclusive discounts. Show your digital member card at any participating location to enjoy up to 15% off your bill.',
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60',
    target_audience: 'members_only',
    created_by: 'Community Manager',
    created_at: '2024-05-01T09:00:00Z',
  },
  {
    id: '2',
    title: 'App Maintenance Notice',
    body: 'The Azike app will be undergoing brief maintenance this Sunday between 2 AM and 4 AM. Some features may be temporarily unavailable during this window.',
    image_url: null,
    target_audience: 'all',
    created_by: 'Tech Team',
    created_at: '2024-05-02T14:30:00Z',
  },
  {
    id: '3',
    title: 'Upcoming Networking Brunch',
    body: 'Join us for our monthly networking brunch next Saturday. It is a great opportunity to meet fellow members and share ideas.',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=60',
    target_audience: 'all',
    created_by: 'Events Team',
    created_at: '2024-04-28T11:00:00Z',
  }
];
*/

export default function AnnouncementsScreen() {
  const { data: announcementsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await api.get('/announcements');
      return response.data.data;
    }
  });

  const announcements = announcementsData?.announcements || [];

  const onRefresh = () => {
    refetch();
  };

  const getAudienceLabel = (audience: string) => {
    const labels: Record<string, string> = {
      'all': 'Everyone',
      'members_only': 'Members Only',
      'expired_members': 'Expired Members',
      'event_attendees': 'Event Attendees'
    };
    return labels[audience] || audience;
  };

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-primary px-5 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">Announcements</Text>
        <Text className="text-white/80 text-sm mt-1">
          Stay updated with community news
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#2E7D32" />
        }
      >
        {announcements.length === 0 ? (
          <View className="bg-white rounded-[32px] p-12 items-center border border-gray-100 shadow-sm mt-4">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6">
              <MegaphoneIcon size={40} color="#D1D5DB" />
            </View>
            <Text className="text-gray-900 font-bold text-xl text-center">
              No announcements
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-3 leading-5">
              Stay tuned! When we have new updates for the community, they'll appear here.
            </Text>
          </View>
        ) : (
          <View className="space-y-4 pb-8">
            {announcements.map((announcement: Announcement) => (
              <TouchableOpacity
                key={announcement.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
                onPress={() => router.push(`/announcements/${announcement.id}`)}
              >
                {announcement.image_url && (
                  <Image
                    source={{ uri: announcement.image_url }}
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                )}
                
                <View className="p-4">
                  <View className="flex-row items-center mb-2">
                    <View className="bg-primary/10 px-2 py-1 rounded-full">
                      <Text className="text-primary text-xs">
                        {getAudienceLabel(announcement.target_audience)}
                      </Text>
                    </View>
                    <Text className="text-gray-400 text-xs ml-2">
                      {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                    </Text>
                  </View>
                  
                  <Text className="text-lg font-semibold text-gray-800 mb-1">
                    {announcement.title}
                  </Text>
                  
                  <Text className="text-gray-600" numberOfLines={3}>
                    {announcement.body}
                  </Text>
                  
                  <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
                    <Text className="text-gray-500 text-xs">
                      Posted by {announcement.created_by}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}