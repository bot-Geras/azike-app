
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useTickets = (status: string = 'upcoming') => {
  return useQuery({
    queryKey: ['tickets', status],
    queryFn: async () => {
      const response = await api.get('/tickets/my', { params: { status } });
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000
  });
};

export const useTicket = (ticketId: string) => {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const response = await api.get('/tickets/my');
      const ticket = response.data.data.tickets.find((t: any) => t.ticket_id === ticketId);
      return ticket;
    },
    enabled: !!ticketId
  });
};