// admin/app/dashboard/events/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  start_datetime: z.string().min(1, 'Start date is required'),
  end_datetime: z.string().min(1, 'End date is required'),
  registration_deadline: z.string().optional(),
  banner_image_url: z.string().url().optional().or(z.literal('')),
  member_price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  non_member_price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  is_free_for_members: z.boolean().default(false),
  max_capacity: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().min(1).optional()),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']),
  visibility: z.enum(['public', 'members_only', 'hidden'])
});

type EventForm = z.infer<typeof eventSchema>;

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<EventForm>({
    resolver: zodResolver(eventSchema)
  });

  const isFreeForMembers = watch('is_free_for_members');

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${params.id}`);
      const event = response.data.data;
      
      reset({
        title: event.title,
        description: event.description || '',
        location: event.location,
        start_datetime: new Date(event.start_datetime).toISOString().slice(0, 16),
        end_datetime: new Date(event.end_datetime).toISOString().slice(0, 16),
        registration_deadline: event.registration_deadline 
          ? new Date(event.registration_deadline).toISOString().slice(0, 16) 
          : '',
        banner_image_url: event.banner_image_url || '',
        member_price: event.pricing.member_price,
        non_member_price: event.pricing.non_member_price,
        is_free_for_members: false, // Get from event if applicable
        max_capacity: event.capacity.max || undefined,
        status: event.status || 'draft',
        visibility: event.visibility || 'public'
      });
    } catch (error) {
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EventForm) => {
    setSubmitting(true);
    try {
      await api.put(`/admin/events/${params.id}`, data);
      toast.success('Event updated successfully!');
      router.push('/dashboard/events');
    } catch (error) {
      toast.error('Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/events" className="text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Same form fields as create event page */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Event Title *</label>
            <input
              {...register('title')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <input
              {...register('location')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Banner Image URL</label>
            <input
              {...register('banner_image_url')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Date & Time</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date/Time *</label>
              <input
                type="datetime-local"
                {...register('start_datetime')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date/Time *</label>
              <input
                type="datetime-local"
                {...register('end_datetime')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Pricing</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Member Price (KES) *</label>
              <input
                type="number"
                step="0.01"
                {...register('member_price')}
                disabled={isFreeForMembers}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Non-Member Price (KES) *</label>
              <input
                type="number"
                step="0.01"
                {...register('non_member_price')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('is_free_for_members')}
              className="rounded border-gray-300"
            />
            <label className="text-sm">Free for members (uses annual entitlement)</label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Settings</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <select
                {...register('visibility')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="public">Public</option>
                <option value="members_only">Members Only</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link
            href="/dashboard/events"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}