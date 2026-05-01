
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

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const response = await api.get('/announcements');
      const found = response.data.data.announcements.find((a: Announcement) => a.id === id);
      setAnnouncement(found || null);
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