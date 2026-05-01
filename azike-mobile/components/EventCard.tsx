
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { CalendarIcon, MapPinIcon, UsersIcon } from 'react-native-heroicons/outline';
import { format } from 'date-fns';
import { router } from 'expo-router';

interface EventCardProps {
  event: {
    event_id: string;
    title: string;
    description?: string;
    location: string;
    start_datetime: string;
    banner_image_url: string | null;
    pricing: {
      member_price: number;
      non_member_price: number;
      your_price: number | null;
      is_eligible_for_free: boolean;
      discount_applied: boolean;
    };
    capacity: {
      is_available: boolean;
      spots_remaining: number | null;
    };
    is_members_only: boolean;
    user_booking_status: string | null;
  };
  isMember: boolean;
}

export function EventCard({ event, isMember }: EventCardProps) {
  const getPriceDisplay = () => {
    if (event.user_booking_status === 'booked' || event.user_booking_status === 'checked_in') {
      return <Text className="text-success font-medium">✓ Booked</Text>;
    }
    
    if (event.pricing.your_price === 0) {
      return <Text className="text-success font-medium">FREE</Text>;
    }
    
    if (isMember && event.pricing.discount_applied) {
      return (
        <View>
          <Text className="text-gray-400 line-through text-xs">
            KES {event.pricing.non_member_price.toLocaleString()}
          </Text>
          <Text className="text-primary font-bold">
            KES {event.pricing.your_price?.toLocaleString()}
          </Text>
        </View>
      );
    }
    
    return (
      <Text className="text-gray-800 font-bold">
        KES {event.pricing.your_price?.toLocaleString()}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl overflow-hidden shadow-sm mb-4"
      onPress={() => router.push(`/events/${event.event_id}`)}
    >
      {event.banner_image_url ? (
        <Image
          source={{ uri: event.banner_image_url }}
          className="w-full h-40"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-40 bg-primary/20 items-center justify-center">
          <CalendarIcon size={48} color="#2E7D32" />
        </View>
      )}
      
      {event.is_members_only && (
        <View className="absolute top-3 right-3 bg-accent px-3 py-1 rounded-full">
          <Text className="text-primary text-xs font-bold">Members Only</Text>
        </View>
      )}
      
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-1" numberOfLines={1}>
          {event.title}
        </Text>
        
        <View className="flex-row items-center mb-1">
          <CalendarIcon size={14} color="#6B7280" />
          <Text className="text-gray-500 text-sm ml-1">
            {format(new Date(event.start_datetime), 'EEE, MMM d • h:mm a')}
          </Text>
        </View>
        
        <View className="flex-row items-center mb-3">
          <MapPinIcon size={14} color="#6B7280" />
          <Text className="text-gray-500 text-sm ml-1" numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        
        <View className="flex-row justify-between items-center">
          {getPriceDisplay()}
          
          {event.capacity.spots_remaining !== null && event.capacity.spots_remaining < 20 && (
            <View className="flex-row items-center">
              <UsersIcon size={12} color="#F59E0B" />
              <Text className="text-warning text-xs ml-1">
                {event.capacity.spots_remaining} left
              </Text>
            </View>
          )}
        </View>
        
        {event.pricing.is_eligible_for_free && !event.user_booking_status && (
          <View className="mt-2 bg-success/10 p-2 rounded">
            <Text className="text-success text-xs text-center">
              🎉 You have a free ticket available!
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}