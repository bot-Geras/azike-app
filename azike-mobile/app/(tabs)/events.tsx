

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
import { useMembership } from '../../hooks/useMembership';
import { CalendarIcon, MapPinIcon, UsersIcon } from 'react-native-heroicons/outline';
import { format } from 'date-fns';

interface Event {
  event_id: string;
  title: string;
  description: string;
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
}

const DUMMY_EVENTS: Event[] = [
  {
    event_id: '1',
    title: 'Community Tech Meetup',
    description: 'Join us for an evening of networking and tech talks from industry leaders.',
    location: 'Azike Hub, Main Hall',
    start_datetime: '2024-05-15T18:00:00Z',
    banner_image_url: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=800&auto=format&fit=crop&q=60',
    pricing: {
      member_price: 0,
      non_member_price: 500,
      your_price: 0,
      is_eligible_for_free: true,
      discount_applied: true,
    },
    capacity: {
      is_available: true,
      spots_remaining: 15,
    },
    is_members_only: true,
    user_booking_status: null,
  },
  {
    event_id: '2',
    title: 'Annual Charity Gala',
    description: 'A night of elegance and giving. All proceeds go to local community projects.',
    location: 'Grand Ballroom, Nairobi',
    start_datetime: '2024-06-02T19:30:00Z',
    banner_image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60',
    pricing: {
      member_price: 1500,
      non_member_price: 3000,
      your_price: 1500,
      is_eligible_for_free: false,
      discount_applied: true,
    },
    capacity: {
      is_available: true,
      spots_remaining: 45,
    },
    is_members_only: false,
    user_booking_status: 'booked',
  },
  {
    event_id: '3',
    title: 'Morning Yoga Session',
    description: 'Start your day with a refreshing yoga session in the park.',
    location: 'City Park Gardens',
    start_datetime: '2024-05-20T07:00:00Z',
    banner_image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=60',
    pricing: {
      member_price: 200,
      non_member_price: 500,
      your_price: 200,
      is_eligible_for_free: false,
      discount_applied: true,
    },
    capacity: {
      is_available: true,
      spots_remaining: 8,
    },
    is_members_only: false,
    user_booking_status: null,
  }
];

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>(DUMMY_EVENTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'upcoming' | 'past'>('upcoming');
  const { membership } = useMembership();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      if (selectedFilter === 'past') {
        setEvents([]);
      } else {
        setEvents(DUMMY_EVENTS);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  // if (loading) {
  //   return (
  //     <View className="flex-1 bg-white justify-center items-center">
  //       <ActivityIndicator size="large" color="#2E7D32" />
  //     </View>
  //   );
  // }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-5 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">Events</Text>
        <Text className="text-white/80 text-sm mt-1">
          Discover and join community events
        </Text>
        
        {/* Filter Tabs */}
        <View className="flex-row mt-4 bg-white/20 rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${
              selectedFilter === 'upcoming' ? 'bg-white' : ''
            }`}
            onPress={() => setSelectedFilter('upcoming')}
          >
            <Text className={`text-center font-medium ${
              selectedFilter === 'upcoming' ? 'text-primary' : 'text-white'
            }`}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${
              selectedFilter === 'past' ? 'bg-white' : ''
            }`}
            onPress={() => setSelectedFilter('past')}
          >
            <Text className={`text-center font-medium ${
              selectedFilter === 'past' ? 'text-primary' : 'text-white'
            }`}>
              Past
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {events.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center">
            <CalendarIcon size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-center mt-4">
              No {selectedFilter} events found
            </Text>
          </View>
        ) : (
          <View className="space-y-4 pb-8">
            {events.map((event) => (
              <EventCard 
                key={event.event_id} 
                event={event} 
                isMember={membership?.is_active}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function EventCard({ event, isMember }: { event: Event; isMember: boolean }) {
  const getPriceDisplay = () => {
    if (event.user_booking_status === 'booked') {
      return <Text className="text-success font-medium">✓ Booked</Text>;
    }
    
    if (event.pricing.your_price === 0) {
      return <Text className="text-success font-medium">FREE</Text>;
    }
    
    if (isMember && event.pricing.discount_applied) {
      return (
        <View>
          <Text className="text-gray-400 line-through text-xs">
            KES {event.pricing.non_member_price}
          </Text>
          <Text className="text-primary font-bold">
            KES {event.pricing.your_price}
          </Text>
        </View>
      );
    }
    
    return (
      <Text className="text-gray-800 font-bold">
        KES {event.pricing.your_price}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl overflow-hidden shadow-sm"
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
        <Text className="text-lg font-semibold text-gray-800 mb-1">
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
                {event.capacity.spots_remaining} spots left
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