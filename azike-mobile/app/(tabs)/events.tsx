
// import { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   ScrollView, 
//   TouchableOpacity, 
//   Image, 
//   ActivityIndicator,
//   RefreshControl 
// } from 'react-native';
// import { router } from 'expo-router';
// import { api } from '../../services/api';
// import { useMembership } from '../../hooks/useMembership';
// import { CalendarIcon, MapPinIcon, UsersIcon } from 'react-native-heroicons/outline';
// import { format } from 'date-fns';
// import { useEvents } from '../../hooks/useEvents';

// interface Event {
//   event_id: string;
//   title: string;
//   description: string;
//   location: string;
//   start_datetime: string;
//   banner_image_url: string | null;
//   pricing: {
//     member_price: number;
//     non_member_price: number;
//     your_price: number | null;
//     is_eligible_for_free: boolean;
//     discount_applied: boolean;
//   };
//   capacity: {
//     is_available: boolean;
//     spots_remaining: number | null;
//   };
//   is_members_only: boolean;
//   user_booking_status: string | null;
// }



// export default function EventsScreen() {
//   const [selectedFilter, setSelectedFilter] = useState<'upcoming' | 'past'>('upcoming');
//   const { data: eventsData, isLoading, error, refetch, isRefetching } = useEvents(selectedFilter);
//   const { membership } = useMembership();

//   // Check if events are nested inside a 'data' property based on your API pattern
//   const events = eventsData?.events || eventsData?.data?.events || [];

//   if (error) {
//     console.error('Events Fetch Error:', error);
//   }

//   const onRefresh = () => {
//     refetch();
//   };

//   if (isLoading && !isRefetching) {
//     return (
//       <View className="flex-1 bg-white justify-center items-center">
//         <ActivityIndicator size="large" color="#2E7D32" />
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-gray-50">
//       {/* Header */}
//       <View className="bg-primary px-5 pt-12 pb-4">
//         <Text className="text-white text-2xl font-bold">Events</Text>
//         <Text className="text-white/80 text-sm mt-1">
//           Discover and join community events
//         </Text>
        
//         {/* Filter Tabs */}
//         <View className="flex-row mt-4 bg-white/20 rounded-lg p-1">
//           <TouchableOpacity
//             className={`flex-1 py-2 rounded-md ${
//               selectedFilter === 'upcoming' ? 'bg-white' : ''
//             }`}
//             onPress={() => setSelectedFilter('upcoming')}
//           >
//             <Text className={`text-center font-medium ${
//               selectedFilter === 'upcoming' ? 'text-primary' : 'text-white'
//             }`}>
//               Upcoming
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className={`flex-1 py-2 rounded-md ${
//               selectedFilter === 'past' ? 'bg-white' : ''
//             }`}
//             onPress={() => setSelectedFilter('past')}
//           >
//             <Text className={`text-center font-medium ${
//               selectedFilter === 'past' ? 'text-primary' : 'text-white'
//             }`}>
//               Past
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView
//         className="flex-1 px-5 pt-4"
//         refreshControl={
//           <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#2E7D32" />
//         }
//       >
//         {events.length === 0 ? (
//           <View className="bg-white rounded-[32px] p-12 items-center border border-gray-100 shadow-sm mt-4">
//             <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6">
//               <CalendarIcon size={40} color="#D1D5DB" />
//             </View>
//             <Text className="text-gray-900 font-bold text-xl text-center">
//               No {selectedFilter} events
//             </Text>
//             <Text className="text-gray-500 text-sm text-center mt-3 leading-5">
//               {selectedFilter === 'upcoming' 
//                 ? "We're currently planning new events. Stay tuned and check back soon!" 
//                 : "You haven't attended any events in the past."}
//             </Text>
//             {selectedFilter === 'past' && (
//               <TouchableOpacity 
//                 onPress={() => setSelectedFilter('upcoming')}
//                 className="mt-6 bg-primary/10 px-6 py-3 rounded-full"
//               >
//                 <Text className="text-primary font-bold">Browse Upcoming Events</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         ) : (
//           <View className="space-y-4 pb-8">
//             {events.map((event: Event) => (
//               <EventCard 
//                 key={event.event_id} 
//                 event={event} 
//                 isMember={membership?.is_active}
//               />
//             ))}
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// function EventCard({ event, isMember }: { event: Event; isMember: boolean }) {
//   const getPriceDisplay = () => {
//     if (event.user_booking_status === 'booked') {
//       return <Text className="text-success font-medium">✓ Booked</Text>;
//     }
    
//     if (event.pricing.your_price === 0) {
//       return <Text className="text-success font-medium">FREE</Text>;
//     }
    
//     if (isMember && event.pricing.discount_applied) {
//       return (
//         <View>
//           <Text className="text-gray-400 line-through text-xs">
//             KES {event.pricing.non_member_price}
//           </Text>
//           <Text className="text-primary font-bold">
//             KES {event.pricing.your_price}
//           </Text>
//         </View>
//       );
//     }
    
//     return (
//       <Text className="text-gray-800 font-bold">
//         KES {event.pricing.your_price}
//       </Text>
//     );
//   };

//   return (
//     <TouchableOpacity
//       className="bg-white rounded-xl overflow-hidden shadow-sm"
//       onPress={() => router.push(`/events/${event.event_id}`)}
//     >
//       {event.banner_image_url ? (
//         <Image
//           source={{ uri: event.banner_image_url }}
//           className="w-full h-40"
//           resizeMode="cover"
//         />
//       ) : (
//         <View className="w-full h-40 bg-primary/20 items-center justify-center">
//           <CalendarIcon size={48} color="#2E7D32" />
//         </View>
//       )}
      
//       {event.is_members_only && (
//         <View className="absolute top-3 right-3 bg-accent px-3 py-1 rounded-full">
//           <Text className="text-primary text-xs font-bold">Members Only</Text>
//         </View>
//       )}
      
//       <View className="p-4">
//         <Text className="text-lg font-semibold text-gray-800 mb-1">
//           {event.title}
//         </Text>
        
//         <View className="flex-row items-center mb-1">
//           <CalendarIcon size={14} color="#6B7280" />
//           <Text className="text-gray-500 text-sm ml-1">
//             {event.start_datetime && !isNaN(new Date(event.start_datetime).getTime())
//               ? format(new Date(event.start_datetime), 'EEE, MMM d • h:mm a')
//               : 'Date TBA'}
//           </Text>
//         </View>
        
//         <View className="flex-row items-center mb-3">
//           <MapPinIcon size={14} color="#6B7280" />
//           <Text className="text-gray-500 text-sm ml-1" numberOfLines={1}>
//             {event.location}
//           </Text>
//         </View>
        
//         <View className="flex-row justify-between items-center">
//           {getPriceDisplay()}
          
//           {event.capacity.spots_remaining !== null && event.capacity.spots_remaining < 20 && (
//             <View className="flex-row items-center">
//               <UsersIcon size={12} color="#F59E0B" />
//               <Text className="text-warning text-xs ml-1">
//                 {event.capacity.spots_remaining} spots left
//               </Text>
//             </View>
//           )}
//         </View>
        
//         {event.pricing.is_eligible_for_free && !event.user_booking_status && (
//           <View className="mt-2 bg-success/10 p-2 rounded">
//             <Text className="text-success text-xs text-center">
//               🎉 You have a free ticket available!
//             </Text>
//           </View>
//         )}
//       </View>
//     </TouchableOpacity>
//   );
// }

// mobile/app/(tabs)/events.tsx
import { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useEvents } from '../../hooks/useEvents';
import { useMembership } from '../../hooks/useMembership';
import { CalendarIcon, MapPinIcon, UsersIcon, SparklesIcon } from 'react-native-heroicons/outline';
import { format } from 'date-fns';
import { EventCardSkeleton } from '../../components/SkeletonLoader';

// Type from our shared types
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

export default function EventsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<'upcoming' | 'past'>('upcoming');
  const { data: response, isLoading, error, refetch, isRefetching } = useEvents(selectedFilter);
  const { membership } = useMembership();

  // Extract events from the standardized API response
  const events: Event[] = response?.events || [];

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [selectedFilter])
  );

  const handleFilterChange = (filter: 'upcoming' | 'past') => {
    setSelectedFilter(filter);
  };

  const onRefresh = () => {
    refetch();
  };

  // Loading state with skeletons
  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-primary px-5 pt-12 pb-4">
          <Text className="text-white text-2xl font-bold">Events</Text>
          <View className="flex-row mt-4 bg-white/20 rounded-lg p-1">
            <View className="flex-1 py-2 rounded-md bg-white">
              <Text className="text-center font-medium text-primary">Upcoming</Text>
            </View>
            <View className="flex-1 py-2">
              <Text className="text-center font-medium text-white">Past</Text>
            </View>
          </View>
        </View>
        <ScrollView className="flex-1 px-5 pt-4">
          {[1, 2, 3].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-primary px-5 pt-12 pb-4">
          <Text className="text-white text-2xl font-bold">Events</Text>
        </View>
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
            <CalendarIcon size={40} color="#EF4444" />
          </View>
          <Text className="text-gray-900 font-bold text-xl text-center">
            Couldn't Load Events
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-3 leading-5">
            Something went wrong while fetching events. Please check your connection and try again.
          </Text>
          <TouchableOpacity 
            onPress={() => refetch()}
            className="mt-6 bg-primary px-8 py-3 rounded-full"
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            onPress={() => handleFilterChange('upcoming')}
            activeOpacity={0.8}
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
            onPress={() => handleFilterChange('past')}
            activeOpacity={0.8}
          >
            <Text className={`text-center font-medium ${
              selectedFilter === 'past' ? 'text-primary' : 'text-white'
            }`}>
              Past
            </Text>
          </TouchableOpacity>
        </View>

        {/* Member Badge */}
        {membership?.is_active && (
          <View className="flex-row items-center mt-3 bg-white/10 rounded-full px-3 py-1 self-start">
            <SparklesIcon size={12} color="#FFD700" />
            <Text className="text-white text-xs ml-1">
              Member pricing active
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={onRefresh} 
            tintColor="#2E7D32"
            colors={['#2E7D32']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {events.length === 0 ? (
          <View className="bg-white rounded-[32px] p-12 items-center border border-gray-100 shadow-sm mt-4">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6">
              <CalendarIcon size={40} color="#D1D5DB" />
            </View>
            <Text className="text-gray-900 font-bold text-xl text-center">
              No {selectedFilter} events
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-3 leading-5">
              {selectedFilter === 'upcoming' 
                ? "We're currently planning exciting new events. Stay tuned and check back soon!" 
                : "You haven't attended any events in the past. Explore upcoming events to join!"}
            </Text>
            {selectedFilter === 'past' && (
              <TouchableOpacity 
                onPress={() => handleFilterChange('upcoming')}
                className="mt-6 bg-primary/10 px-6 py-3 rounded-full"
                activeOpacity={0.8}
              >
                <Text className="text-primary font-bold">Browse Upcoming Events</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="space-y-4 pb-8">
            {events.map((event: Event) => (
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
    // Already booked
    if (event.user_booking_status === 'booked' || event.user_booking_status === 'checked_in') {
      return (
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-success rounded-full mr-2" />
          <Text className="text-success font-semibold text-sm">
            {event.user_booking_status === 'checked_in' ? 'Checked In' : 'Booked'}
          </Text>
        </View>
      );
    }
    
    // Free for this member
    if (event.pricing.your_price === 0) {
      return (
        <View className="bg-success/10 px-3 py-1 rounded-full">
          <Text className="text-success font-bold text-sm">FREE</Text>
        </View>
      );
    }
    
    // Member discount
    if (isMember && event.pricing.discount_applied) {
      return (
        <View>
          <Text className="text-gray-400 line-through text-xs">
            KES {event.pricing.non_member_price.toLocaleString()}
          </Text>
          <Text className="text-primary font-bold text-base">
            KES {event.pricing.your_price?.toLocaleString()}
          </Text>
        </View>
      );
    }
    
    // Standard price
    return (
      <Text className="text-gray-800 font-bold text-base">
        KES {event.pricing.your_price?.toLocaleString()}
      </Text>
    );
  };

  // Format date safely
  const formattedDate = (() => {
    try {
      if (event.start_datetime) {
        return format(new Date(event.start_datetime), 'EEE, MMM d • h:mm a');
      }
    } catch (e) {
      // Fallback if date is invalid
    }
    return 'Date TBA';
  })();

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[0.98]"
      onPress={() => router.push(`/events/${event.event_id}`)}
      activeOpacity={0.95}
    >
      {/* Image Section */}
      {event.banner_image_url ? (
        <Image
          source={{ uri: event.banner_image_url }}
          className="w-full h-44"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-44 bg-gradient-to-br from-primary/10 to-primary/5 items-center justify-center">
          {/* <CalendarIcon size={48} color="#2E7D32" opacity={0.5} /> */}
          
          <Image
          source={{ uri: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60' }}
        className="w-full h-44"
          // resizeMode="cover"
        />
        </View>
      )}
      
      {/* Overlay Badges */}
      <View className="absolute top-3 right-3 flex-row space-x-2">
        {event.is_members_only && (
          <View className="bg-accent/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Text className="text-primary text-xs font-bold">Members Only</Text>
          </View>
        )}
        
        {event.user_booking_status === 'checked_in' && (
          <View className="bg-success/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-bold">Checked In</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800 mb-2" numberOfLines={2}>
          {event.title}
        </Text>
        
        {/* Date */}
        <View className="flex-row items-center mb-1.5">
          <CalendarIcon size={15} color="#6B7280" />
          <Text className="text-gray-500 text-sm ml-1.5">
            {formattedDate}
          </Text>
        </View>
        
        {/* Location */}
        <View className="flex-row items-center mb-3">
          <MapPinIcon size={15} color="#6B7280" />
          <Text className="text-gray-500 text-sm ml-1.5" numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        
        {/* Bottom Row */}
        <View className="flex-row justify-between items-center">
          {getPriceDisplay()}
          
          {/* Spots remaining indicator */}
          {event.capacity.spots_remaining !== null && 
           event.capacity.spots_remaining <= 20 && 
           event.capacity.spots_remaining > 0 && (
            <View className="flex-row items-center bg-orange-50 px-2.5 py-1 rounded-full">
              <UsersIcon size={12} color="#F59E0B" />
              <Text className="text-orange-600 text-xs ml-1 font-medium">
                {event.capacity.spots_remaining} left
              </Text>
            </View>
          )}

          {/* Sold out */}
          {event.capacity.spots_remaining === 0 && (
            <View className="flex-row items-center bg-red-50 px-2.5 py-1 rounded-full">
              <Text className="text-red-500 text-xs font-bold">Sold Out</Text>
            </View>
          )}
        </View>
        
        {/* Free entitlement banner */}
        {event.pricing.is_eligible_for_free && !event.user_booking_status && (
          <View className="mt-3 bg-success/5 border border-success/20 p-2.5 rounded-lg">
            <View className="flex-row items-center justify-center">
              <SparklesIcon size={14} color="#4CAF50" />
              <Text className="text-success text-xs font-medium ml-1">
                You have a free ticket available!
              </Text>
            </View>
          </View>
        )}

        {/* Already booked info */}
        {event.user_booking_status === 'booked' && (
          <View className="mt-3 bg-primary/5 border border-primary/20 p-2.5 rounded-lg">
            <TouchableOpacity 
              onPress={() => router.push('/tickets/my-tickets')}
              className="flex-row items-center justify-center"
            >
              <Text className="text-primary text-xs font-medium">
                View Your Ticket →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}