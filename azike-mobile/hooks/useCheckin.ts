
import { useQuery } from '@tanstack/react-query';
import { checkinService } from '../services/checkin';

export const useEventAttendees = (eventId: string) => {
  return useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: () => checkinService.getEventAttendees(eventId),
    enabled: !!eventId,
    staleTime: 30 * 1000, // 30 seconds
  });
};
