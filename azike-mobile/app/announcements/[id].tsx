
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../services/api';
import { format } from 'date-fns';
import { ArrowLeftIcon, MegaphoneIcon } from 'react-native-heroicons/outline';

interface Announcement {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  target_audience: string;
  created_by: string;
  created_at: string;
  expires_at: string | null;
}

const DUMMY_ANNOUNCEMENT_DETAILS: Record<string, Announcement> = {
  '1': {
    id: '1',
    title: 'New Member Perks!',
    body: 'We have partnered with local cafes and co-working spaces to give you exclusive discounts. Show your digital member card at any participating location to enjoy up to 15% off your bill. Participating locations include: The Hub Cafe, TechSpace, and Green Garden Restaurant. This offer is valid for all active premium members.',
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60',
    target_audience: 'members_only',
    created_by: 'Community Manager',
    created_at: '2024-05-01T09:00:00Z',
    expires_at: '2024-12-31T23:59:59Z',
  },
  '2': {
    id: '2',
    title: 'App Maintenance Notice',
    body: 'The Azike app will be undergoing brief maintenance this Sunday between 2 AM and 4 AM. Some features may be temporarily unavailable during this window. We apologize for any inconvenience caused. This maintenance is necessary to ensure the stability and security of our platform.',
    image_url: null,
    target_audience: 'all',
    created_by: 'Tech Team',
    created_at: '2024-05-02T14:30:00Z',
    expires_at: '2024-05-05T00:00:00Z',
  },
  '3': {
    id: '3',
    title: 'Upcoming Networking Brunch',
    body: 'Join us for our monthly networking brunch next Saturday. It is a great opportunity to meet fellow members, share ideas, and build lasting connections. We will have guest speakers from the tech and business sectors. Tickets are free for members, but registration is required.',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=60',
    target_audience: 'all',
    created_by: 'Events Team',
    created_at: '2024-04-28T11:00:00Z',
    expires_at: '2024-05-10T12:00:00Z',
  }
};

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<Announcement | null>(DUMMY_ANNOUNCEMENT_DETAILS[id || '1'] || DUMMY_ANNOUNCEMENT_DETAILS['1']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    setLoading(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const found = DUMMY_ANNOUNCEMENT_DETAILS[id || '1'] || DUMMY_ANNOUNCEMENT_DETAILS['1'];
      setAnnouncement(found);
    } catch (error) {
      console.error('Failed to fetch announcement:', error);
    } finally {
      setLoading(false);
    }
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

  if (!announcement) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-5">
        <MegaphoneIcon size={48} color="#9CA3AF" />
        <Text className="text-gray-500 text-center mt-4">Announcement not found</Text>
        <TouchableOpacity
          className="mt-6 bg-primary px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="relative">
        <TouchableOpacity
          className="absolute top-12 left-4 z-10 bg-black/30 p-2 rounded-full"
          onPress={() => router.back()}
        >
          <ArrowLeftIcon size={24} color="white" />
        </TouchableOpacity>

        {announcement.image_url ? (
          <Image
            source={{ uri: announcement.image_url }}
            className="w-full h-64"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-primary items-center justify-center">
            <MegaphoneIcon size={64} color="white" />
          </View>
        )}
      </View>

      <View className="p-5">
        <View className="flex-row items-center mb-3">
          <View className="bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-primary text-xs font-medium">
              {getAudienceLabel(announcement.target_audience)}
            </Text>
          </View>
          <Text className="text-gray-400 text-sm ml-3">
            {format(new Date(announcement.created_at), 'MMMM d, yyyy')}
          </Text>
        </View>

        <Text className="text-2xl font-bold text-gray-800 mb-4">
          {announcement.title}
        </Text>

        <Text className="text-gray-600 leading-relaxed text-base mb-6">
          {announcement.body}
        </Text>

        <View className="border-t border-gray-200 pt-4">
          <Text className="text-gray-500 text-sm">
            Posted by {announcement.created_by}
          </Text>
          {announcement.expires_at && (
            <Text className="text-gray-400 text-xs mt-1">
              Expires: {format(new Date(announcement.expires_at), 'MMMM d, yyyy')}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}