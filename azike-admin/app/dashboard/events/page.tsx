// admin/app/dashboard/events/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { EventsTable } from '@/components/events/EventsTable';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';
  
  const res = await fetch(`${BACKEND_URL}/admin/events`, {
    headers: { 'Authorization': `Bearer ${(session.user as any).accessToken}` }
  });
  const response = await res.json();
  const events = response.data || [];

  const stats = {
    total: events.length,
    published: events.filter((e: { status: string; }) => e.status === 'published').length,
    draft: events.filter((e: { status: string; }) => e.status === 'draft').length,
    completed: events.filter((e: { status: string; }) => e.status === 'completed').length
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <Link
          href="/dashboard/events/create"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Create Event
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total Events</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Draft</p>
          <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        </div>
      </div>

      <EventsTable events={events} />
    </div>
  );
}