
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useEvents = (status: string = 'upcoming') => {
  return useQuery({
    queryKey: ['events', status],
    queryFn: async () => {
      const response = await api.get('/events', { params: { status } });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000
  });
};

export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}`);
      return response.data.data;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000
  });
};

export const useInfiniteEvents = (status: string = 'upcoming') => {
  return useInfiniteQuery({
    queryKey: ['events', 'infinite', status],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get('/events', { 
        params: { 
          status, 
          page: pageParam.toString(), 
          limit: '10' 
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
    staleTime: 2 * 60 * 1000
  });
};