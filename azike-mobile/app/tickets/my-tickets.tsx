
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
import { CalendarIcon, MapPinIcon, TicketIcon, QrCodeIcon } from 'react-native-heroicons/outline';
import { format } from 'date-fns';

interface Ticket {
  ticket_id: string;
  ticket_number: string;
  event: {
    id: string;
    title: string;
    start_datetime: string;
    location: string;
    banner_image_url: string | null;
  };
  ticket_type: string;
  price_paid: number;
  is_checked_in: boolean;
  purchased_at: string;
}

import { useTickets } from '../../hooks/useTickets';

/* 
  ------------------------------------------------------------------
  TEST DATA: Dummy tickets for My Tickets Screen (Commented out)
  ------------------------------------------------------------------
const DUMMY_TICKETS: Ticket[] = [
  {
    ticket_id: '1',
    ticket_number: 'AZK-2024-001',
    event: {
      id: '2',
      title: 'Annual Charity Gala',
      start_datetime: '2024-06-02T19:30:00Z',
      location: 'Grand Ballroom, Nairobi',
      banner_image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60',
    },
    ticket_type: 'member_early_bird',
    price_paid: 1500,
    is_checked_in: false,
    purchased_at: '2024-04-10T10:00:00Z',
  },
  {
    ticket_id: '2',
    ticket_number: 'AZK-2024-045',
    event: {
      id: '5',
      title: 'Jazz Night under the Stars',
      start_datetime: '2024-05-28T20:00:00Z',
      location: 'Riverside Gardens',
      banner_image_url: 'https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=800&auto=format&fit=crop&q=60',
    },
    ticket_type: 'regular',
    price_paid: 1000,
    is_checked_in: true,
    purchased_at: '2024-05-01T14:30:00Z',
  }
];
*/

export default function MyTicketsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<'upcoming' | 'past'>('upcoming');
  const { data: ticketsData, isLoading, refetch, isRefetching } = useTickets(selectedFilter);

  const tickets = ticketsData?.tickets || [];

  const onRefresh = () => {
    refetch();
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
        <Text className="text-white text-2xl font-bold">My Tickets</Text>
        
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
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#2E7D32" />
        }
      >
        {tickets.length === 0 ? (
          <View className="bg-white rounded-[32px] p-12 items-center border border-gray-100 shadow-sm mt-4">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6">
              <TicketIcon size={40} color="#D1D5DB" />
            </View>
            <Text className="text-gray-900 font-bold text-xl text-center">
              No {selectedFilter} tickets
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-3 leading-5">
              {selectedFilter === 'upcoming' 
                ? "You don't have any active tickets at the moment. Browse events to find your next experience!" 
                : "You don't have any past ticket history."}
            </Text>
            {selectedFilter === 'upcoming' && (
              <TouchableOpacity 
                onPress={() => router.push('/events')}
                className="mt-6 bg-primary px-8 py-4 rounded-full shadow-md"
              >
                <Text className="text-white font-bold">Discover Events</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="space-y-4 pb-8">
            {tickets.map((ticket: Ticket) => (
              <TouchableOpacity
                key={ticket.ticket_id}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
                onPress={() => router.push(`/tickets/${ticket.ticket_id}`)}
              >
                {ticket.event.banner_image_url ? (
                  <Image
                    source={{ uri: ticket.event.banner_image_url }}
                    className="w-full h-32"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-32 bg-primary/10 items-center justify-center">
                    <TicketIcon size={40} color="#2E7D32" />
                  </View>
                )}
                
                {ticket.is_checked_in && (
                  <View className="absolute top-3 right-3 bg-success px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">Checked In</Text>
                  </View>
                )}
                
                <View className="p-4">
                  <Text className="text-lg font-semibold text-gray-800 mb-1">
                    {ticket.event.title}
                  </Text>
                  
                  <View className="flex-row items-center mb-1">
                    <CalendarIcon size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-sm ml-1">
                      {format(new Date(ticket.event.start_datetime), 'EEE, MMM d • h:mm a')}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center mb-3">
                    <MapPinIcon size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-sm ml-1">
                      {ticket.event.location}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-gray-500 text-xs">Ticket #{ticket.ticket_number}</Text>
                      <Text className="text-gray-800 text-sm capitalize">
                        {ticket.ticket_type.replace(/_/g, ' ')}
                      </Text>
                    </View>
                    <View className="bg-primary/10 p-2 rounded-full">
                      <QrCodeIcon size={20} color="#2E7D32" />
                    </View>
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
