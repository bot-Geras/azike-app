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
import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useEvents } from "../../hooks/useEvents";
import { useMembership } from "../../hooks/useMembership";
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  SparklesIcon,
} from "react-native-heroicons/outline";
import { format } from "date-fns";
import { EventCardSkeleton } from "../../components/SkeletonLoader";

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
  const [selectedFilter, setSelectedFilter] = useState<"upcoming" | "past">(
    "upcoming",
  );
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useEvents(selectedFilter);
  const { membership } = useMembership();
  const events: Event[] = response?.events || [];

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [selectedFilter]),
  );

  const handleFilterChange = (filter: "upcoming" | "past") =>
    setSelectedFilter(filter);
  const onRefresh = () => refetch();

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 bg-[#F5F5F0]">
        <View className="bg-[#1A3C2E] px-5 pt-14 pb-5">
          <Text className="text-[#8EB89A] text-xs tracking-widest uppercase font-medium mb-1">
            AZIKE Community
          </Text>
          <Text className="text-white text-2xl font-bold">Events</Text>
          <View className="flex-row mt-4 bg-white/10 rounded-xl p-1">
            <View className="flex-1 py-2 rounded-lg bg-white items-center">
              <Text className="font-semibold text-[#1A3C2E] text-sm">
                Upcoming
              </Text>
            </View>
            <View className="flex-1 py-2 items-center">
              <Text className="font-medium text-white/60 text-sm">Past</Text>
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

  if (error) {
    return (
      <View className="flex-1 bg-[#F5F5F0]">
        <View className="bg-[#1A3C2E] px-5 pt-14 pb-5">
          <Text className="text-[#8EB89A] text-xs tracking-widest uppercase font-medium mb-1">
            AZIKE Community
          </Text>
          <Text className="text-white text-2xl font-bold">Events</Text>
        </View>
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-5">
            <CalendarIcon size={36} color="#EF4444" />
          </View>
          <Text className="text-[#1A3C2E] font-bold text-xl text-center mb-2">
            Couldn't Load Events
          </Text>
          <Text className="text-gray-400 text-sm text-center leading-relaxed">
            Something went wrong while fetching events. Please check your
            connection and try again.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-6 bg-[#1A3C2E] px-8 py-3.5 rounded-2xl"
          >
            <Text className="text-white font-semibold text-sm">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F5F0]">
      {/* Header */}
      <View className="bg-[#1A3C2E] px-5 pt-14 pb-5">
        <Text className="text-[#8EB89A] text-xl tracking-widest uppercase font-medium mb-1 mt-7">
          AZIKE Community
        </Text>
        <Text className="text-white text-2xl font-bold tracking-tight">
          Events
        </Text>

        {/* Filter Tabs */}
        <View className="flex-row mt-4 bg-white/10 rounded-xl p-1">
          {(["upcoming", "past"] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`flex-1 py-2 rounded-lg items-center ${selectedFilter === filter ? "bg-white" : ""}`}
              onPress={() => handleFilterChange(filter)}
              activeOpacity={0.8}
            >
              <Text
                className={`font-semibold text-sm capitalize ${
                  selectedFilter === filter ? "text-[#1A3C2E]" : "text-white/60"
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Member badge */}
        {membership?.is_active && (
          <View className="flex-row items-center mt-3 bg-white/10 rounded-full px-3 py-1.5 self-start border border-white/10">
            <SparklesIcon size={11} color="#FFD700" />
            <Text className="text-white/80 text-xs ml-1.5 font-medium">
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
            tintColor="#1A3C2E"
            colors={["#1A3C2E"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {events.length === 0 ? (
          <View
            className="bg-white rounded-3xl p-12 items-center mt-2 mb-8"
            style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)" }}
          >
            <View className="w-20 h-20 bg-[#F0F7F1] rounded-full items-center justify-center mb-5">
              <CalendarIcon size={36} color="#8EB89A" />
            </View>
            <Text className="text-[#1A3C2E] font-bold text-lg text-center mb-2">
              No {selectedFilter} events
            </Text>
            <Text className="text-gray-400 text-sm text-center leading-relaxed">
              {selectedFilter === "upcoming"
                ? "We're planning exciting new events. Check back soon!"
                : "You haven't attended any events yet. Explore upcoming events!"}
            </Text>
            {selectedFilter === "past" && (
              <TouchableOpacity
                onPress={() => handleFilterChange("upcoming")}
                className="mt-6 bg-[#1A3C2E] px-6 py-3 rounded-2xl"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-sm">
                  Browse Upcoming
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="pb-8 gap-4">
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
    if (
      event.user_booking_status === "booked" ||
      event.user_booking_status === "checked_in"
    ) {
      return (
        <View className="flex-row items-center">
          <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
          <Text className="text-emerald-600 font-semibold text-sm">
            {event.user_booking_status === "checked_in"
              ? "Checked In"
              : "Booked"}
          </Text>
        </View>
      );
    }
    if (event.pricing.your_price === 0) {
      return (
        <View className="bg-emerald-50 px-3 py-1 rounded-full">
          <Text className="text-emerald-600 font-bold text-sm">FREE</Text>
        </View>
      );
    }
    if (isMember && event.pricing.discount_applied) {
      return (
        <View>
          <Text className="text-gray-300 line-through text-xs">
            KES {event.pricing.non_member_price.toLocaleString()}
          </Text>
          <Text className="text-[#1A3C2E] font-bold text-base">
            KES {event.pricing.your_price?.toLocaleString()}
          </Text>
        </View>
      );
    }
    return (
      <Text className="text-[#1A3C2E] font-bold text-base">
        KES {event.pricing.your_price?.toLocaleString()}
      </Text>
    );
  };

  const formattedDate = (() => {
    try {
      if (event.start_datetime)
        return format(new Date(event.start_datetime), "EEE, MMM d • h:mm a");
    } catch {}
    return "Date TBA";
  })();

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden"
      style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)" }}
      onPress={() => router.push(`/events/${event.event_id}`)}
      activeOpacity={0.93}
    >
      {/* Image */}
      {event.banner_image_url ? (
        <Image
          source={{ uri: event.banner_image_url }}
          className="w-full h-44"
          resizeMode="cover"
        />
      ) : (
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60",
          }}
          className="w-full h-44"
          resizeMode="cover"
        />
      )}

      {/* Overlay Badges */}
      <View className="absolute top-3 left-3 right-3 flex-row justify-between">
        <View />
        <View className="flex-row gap-2">
          {event.is_members_only && (
            <View className="bg-[#1A3C2E]/80 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">
                Members Only
              </Text>
            </View>
          )}
          {event.user_booking_status === "checked_in" && (
            <View className="bg-emerald-500/90 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">
                Checked In
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text
          className="text-[#1A3C2E] text-base font-bold mb-2.5 leading-snug"
          numberOfLines={2}
        >
          {event.title}
        </Text>

        <View className="flex-row items-center mb-1.5">
          <CalendarIcon size={13} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs ml-1.5">{formattedDate}</Text>
        </View>

        <View className="flex-row items-center mb-3.5">
          <MapPinIcon size={13} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs ml-1.5" numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-50 mb-3" />

        {/* Bottom row */}
        <View className="flex-row justify-between items-center">
          {getPriceDisplay()}
          <View className="flex-row gap-2">
            {event.capacity.spots_remaining !== null &&
              event.capacity.spots_remaining <= 20 &&
              event.capacity.spots_remaining > 0 && (
                <View className="flex-row items-center bg-amber-50 px-2.5 py-1 rounded-full">
                  <UsersIcon size={11} color="#D97706" />
                  <Text className="text-amber-600 text-xs ml-1 font-medium">
                    {event.capacity.spots_remaining} left
                  </Text>
                </View>
              )}
            {event.capacity.spots_remaining === 0 && (
              <View className="bg-red-50 px-2.5 py-1 rounded-full">
                <Text className="text-red-400 text-xs font-semibold">
                  Sold Out
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Free entitlement banner */}
        {event.pricing.is_eligible_for_free && !event.user_booking_status && (
          <View className="mt-3 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex-row items-center justify-center">
            <SparklesIcon size={13} color="#10B981" />
            <Text className="text-emerald-600 text-xs font-medium ml-1.5">
              You have a free ticket available
            </Text>
          </View>
        )}

        {/* Already booked banner */}
        {event.user_booking_status === "booked" && (
          <TouchableOpacity
            onPress={() => router.push("/tickets/my-tickets")}
            className="mt-3 bg-[#F0F7F1] border border-[#D4E6D0] p-2.5 rounded-xl flex-row items-center justify-center"
          >
            <Text className="text-[#1A3C2E] text-xs font-semibold">
              View Your Ticket →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
