'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    start_datetime: '',
    end_datetime: '',
    registration_deadline: '',
    banner_image_url: '',
    member_price: 0,
    non_member_price: 0,
    max_capacity: '',
    status: 'draft',
    visibility: 'public',
  });

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/admin/events`);
      const data = await res.json();
      if (data.success) {
        const event = data.data.events?.find((e: any) => e.id === eventId);
        if (event) {
          setForm({
            title: event.title || '',
            description: event.description || '',
            location: event.location || '',
            start_datetime: event.start_datetime ? new Date(event.start_datetime).toISOString().slice(0, 16) : '',
            end_datetime: event.end_datetime ? new Date(event.end_datetime).toISOString().slice(0, 16) : '',
            registration_deadline: event.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : '',
            banner_image_url: event.banner_image_url || '',
            member_price: event.member_price || 0,
            non_member_price: event.non_member_price || 0,
            max_capacity: event.max_capacity?.toString() || '',
            status: event.status || 'draft',
            visibility: event.visibility || 'public',
          });
        }
      }
    } catch (error) {
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          location: form.location,
          start_datetime: form.start_datetime,
          end_datetime: form.end_datetime,
          registration_deadline: form.registration_deadline || null,
          banner_image_url: form.banner_image_url || null,
          member_price: form.member_price,
          non_member_price: form.non_member_price,
          max_capacity: form.max_capacity ? parseInt(form.max_capacity) : null,
          status: form.status,
          visibility: form.visibility,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Event updated successfully!');
        router.push('/dashboard/events');
      } else {
        toast.error(data.message || 'Failed to update event');
      }
    } catch (error) {
      toast.error('Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 skeleton" />
          <div className="h-64 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <button onClick={() => router.back()} className="btn-ghost mb-4">
          ← Back to Events
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-600 mt-1">Update event details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label htmlFor="title">Event Title *</label>
              <input id="title" name="title" type="text" required value={form.title} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="location">Location *</label>
              <input id="location" name="location" type="text" required value={form.location} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="banner_image_url">Banner Image URL</label>
              <input id="banner_image_url" name="banner_image_url" type="url" value={form.banner_image_url} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Date & Time</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_datetime">Start Date/Time *</label>
                <input id="start_datetime" name="start_datetime" type="datetime-local" required value={form.start_datetime} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="end_datetime">End Date/Time *</label>
                <input id="end_datetime" name="end_datetime" type="datetime-local" required value={form.end_datetime} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label htmlFor="registration_deadline">Registration Deadline</label>
              <input id="registration_deadline" name="registration_deadline" type="datetime-local" value={form.registration_deadline} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="member_price">Member Price (KES)</label>
                <input id="member_price" name="member_price" type="number" step="0.01" min="0" value={form.member_price} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="non_member_price">Non-Member Price (KES)</label>
                <input id="non_member_price" name="non_member_price" type="number" step="0.01" min="0" value={form.non_member_price} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label htmlFor="max_capacity">Maximum Capacity</label>
              <input id="max_capacity" name="max_capacity" type="number" min="1" value={form.max_capacity} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label htmlFor="visibility">Visibility</label>
                <select id="visibility" name="visibility" value={form.visibility} onChange={handleChange}>
                  <option value="public">Public</option>
                  <option value="members_only">Members Only</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}