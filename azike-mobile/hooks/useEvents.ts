
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../services/api';

// export const useEvents = (status: string = 'upcoming') => {
//   return useQuery({
//     queryKey: ['events', status],
//     queryFn: async () => {
//       const response = await api.get('/events', { params: { status } });
//       return response.data.data;
     
//     },
//     staleTime: 2 * 60 * 1000
//   });
// };

// export const useEvent = (eventId: string) => {
//   return useQuery({
//     queryKey: ['event', eventId],
//     queryFn: async () => {
//       const response = await api.get(`/events/${eventId}`);
//       return response.data.data;
       
//     },
//     enabled: !!eventId,
//     staleTime: 5 * 60 * 1000
//   });
// };

// export const useInfiniteEvents = (status: string = 'upcoming') => {
//   return useInfiniteQuery({
//     queryKey: ['events', 'infinite', status],
//     queryFn: async ({ pageParam = 1 }) => {
//       const response = await api.get('/events', { 
//         params: { 
//           status, 
//           page: pageParam.toString(), 
//           limit: '10' 
//         } 
//       });
//       return response.data.data;
//     },
//     getNextPageParam: (lastPage) => {
//       if (lastPage.pagination.current_page < lastPage.pagination.total_pages) {
//         return lastPage.pagination.current_page + 1;
//       }
//       return undefined;
//     },
//     initialPageParam: 1,
//     staleTime: 2 * 60 * 1000
//   });
// };



// Type definitions
interface Event {
  event_id: string;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  banner_image_url: string | null;
  pricing: {
    member_price: number;
    non_member_price: number;
    your_price: number | null;
    is_eligible_for_free: boolean;
    discount_applied: boolean;
  };
  capacity: {
    max: number | null;
    current_bookings: number;
    is_available: boolean;
    spots_remaining: number | null;
  };
  is_members_only: boolean;
  user_booking_status: string | null;
}

interface EventsResponse {
  events: Event[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_events: number;
    limit: number;
  };
}

interface EventDetail {
  event_id: string;
  title: string;
  description: string;
  location: string;
  location_coordinates: { lat: number; lng: number } | null;
  start_datetime: string;
  end_datetime: string;
  registration_deadline: string | null;
  banner_image_url: string | null;
  organizer: {
    name: string;
    contact_email: string;
  };
  pricing: {
    member_price: number;
    non_member_price: number;
    currency: string;
    your_price: number | null;
    is_eligible_for_free: boolean;
    free_entitlements_remaining: number;
  };
  capacity: {
    max: number | null;
    current_bookings: number;
    is_available: boolean;
    spots_remaining: number | null;
  };
  user_booking_status: string | null;
  is_members_only: boolean;
  created_at: string;
}

// Hook for fetching paginated events
export const useEvents = (status: string = 'upcoming') => {
  return useQuery<EventsResponse>({
    queryKey: ['events', status],
    queryFn: async () => {
      const response = await api.get('/events', { 
        params: { status } 
      });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Hook for fetching a single event
export const useEvent = (eventId: string | undefined) => {
  return useQuery<EventDetail>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}`);
      return response.data.data;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// Hook for infinite scrolling events
export const useInfiniteEvents = (status: string = 'upcoming') => {
  return useInfiniteQuery<EventsResponse, Error>({
    queryKey: ['events', 'infinite', status],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get('/events', { 
        params: { 
          status, 
          page: String(pageParam),  // Ensure string
          limit: String(10)          // Ensure string
        } 
      });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.current_page < lastPage.pagination.total_pages) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    maxPages: 10, // Limit maximum cached pages
  });
};