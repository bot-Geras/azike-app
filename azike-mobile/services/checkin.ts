
import { api } from './api';

export const checkinService = {
  getEventAttendees: async (eventId: string) => {
    const response = await api.get(`/checkin/events/${eventId}/attendees`);
    return response.data.data;
  },

  scanAndCheckin: async (data: { qr_data: string; event_id: string }) => {
    const response = await api.post('/checkin/scan', data);
    return response.data.data;
  }
};
