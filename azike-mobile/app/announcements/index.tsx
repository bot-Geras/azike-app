
import { useState, useEffect } from 'react';
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

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data.data.announcements);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
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
        <Text className="text-white text-2xl font-bold">Announcements</Text>
        <Text className="text-white/80 text-sm mt-1">
          Stay updated with community news
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {announcements.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center">
            <MegaphoneIcon size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-center mt-4">
              No announcements yet
            </Text>
          </View>
        ) : (
          <View className="space-y-4 pb-8">
            {announcements.map((announcement) => (
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