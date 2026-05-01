// admin/app/dashboard/announcements/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { MegaphoneIcon, UsersIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline';

const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Message is required'),
  image_url: z.string().url().optional().or(z.literal('')),
  target_audience: z.enum(['all', 'members_only', 'expired_members', 'event_attendees']),
  target_event_id: z.string().optional(),
  send_push_notification: z.boolean(),
  scheduled_for: z.string().optional(),
  expires_at: z.string().optional()
});

type AnnouncementForm = z.infer<typeof announcementSchema>;

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AnnouncementForm>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      target_audience: 'all',
      send_push_notification: true
    }
  });

  const targetAudience = watch('target_audience');

  useEffect(() => {
    fetchAnnouncements();
    fetchEvents();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/admin/announcements');
      setAnnouncements(response.data.data);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/admin/events?status=published');
      setEvents(response.data.data);
    } catch (error) {
      console.error('Failed to load events');
    }
  };

  const onSubmit = async (data: AnnouncementForm) => {
    setSubmitting(true);
    try {
      await api.post('/admin/announcements', data);
      toast.success('Announcement created successfully');
      reset();
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <MegaphoneIcon className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      {/* Announcement Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Announcement</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  {...register('title')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Important Update"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  {...register('body')}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Write your announcement message..."
                />
                {errors.body && (
                  <p className="text-red-500 text-sm mt-1">{errors.body.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                <input
                  {...register('image_url')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Target Audience</label>
                <select
                  {...register('target_audience')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">Everyone</option>
                  <option value="members_only">Members Only</option>
                  <option value="expired_members">Expired Members</option>
                  <option value="event_attendees">Event Attendees</option>
                </select>
              </div>

              {targetAudience === 'event_attendees' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Select Event</label>
                  <select
                    {...register('target_event_id')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select an event</option>
                    {events.map((event: any) => (
                      <option key={event.id} value={event.id}>
                        {event.title} ({new Date(event.start_datetime).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('send_push_notification')}
                  className="rounded border-gray-300"
                />
                <label className="text-sm">Send push notification immediately</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    {...register('scheduled_for')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expires (Optional)</label>
                  <input
                    type="datetime-local"
                    {...register('expires_at')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="divide-y divide-gray-200">
          {announcements.map((announcement: any) => (
            <div key={announcement.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {announcement.target_audience}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{announcement.body}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>By {announcement.created_by}</span>
                    <span>{new Date(announcement.created_at).toLocaleString()}</span>
                    {announcement.push_notification_sent && (
                      <span className="text-green-600">✓ Push sent</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}