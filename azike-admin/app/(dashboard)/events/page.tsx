// admin/app/(dashboard)/events/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  location: string;
  start_datetime: string;
  status: string;
  member_price: number;
  non_member_price: number;
  current_bookings: number;
  ticket_count: number;
  created_by: string;
  created_at: string;
}

export default function EventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.data.events || []);
      }
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this event?')) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Event cancelled');
        fetchEvents();
      } else {
        toast.error(data.message || 'Failed to cancel event');
      }
    } catch (error) {
      toast.error('Failed to cancel event');
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 skeleton" />
          <div className="h-4 w-64 skeleton" />
          <div className="h-64 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-1">Manage community events</p>
        </div>
        <Link href="/dashboard/events/create" className="btn-primary">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="search"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="max-w-[180px]"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Pricing</th>
                <th>Bookings</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No events found
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="font-medium text-gray-900">
                      {event.title}
                      <div className="text-xs text-gray-500 mt-0.5">{event.location}</div>
                    </td>
                    <td className="text-gray-500">
                      {new Date(event.start_datetime).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="text-sm">Member: KES {event.member_price.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Guest: KES {event.non_member_price.toLocaleString()}</div>
                    </td>
                    <td>
                      <span className="font-medium">{event.current_bookings}</span>
                      <span className="text-gray-500"> attendees</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          event.status === 'published'
                            ? 'badge-success'
                            : event.status === 'cancelled'
                            ? 'badge-error'
                            : 'badge-neutral'
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/events/${event.id}/edit`} className="btn-ghost text-sm">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(event.id)} className="btn-ghost text-sm text-red-600 hover:text-red-700">
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}