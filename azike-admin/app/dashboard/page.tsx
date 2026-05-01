// admin/app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { StatCard } from '@/components/StatCard';
import { UsersIcon, TicketIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';
  
  const res = await fetch(`${BACKEND_URL}/admin/dashboard/stats`, {
    headers: { 'Authorization': `Bearer ${(session.user as any).accessToken}` }
  });
  
  const response = await res.json();
  const stats = response.data || {
    totalMembers: 0,
    activeMembers: 0,
    totalEvents: 0,
    totalRevenue: 0
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={<UsersIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Members"
          value={stats.activeMembers}
          icon={<UsersIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={<CalendarIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={`KES ${Number(stats.totalRevenue).toLocaleString()}`}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="yellow"
        />
      </div>
    </div>
  );
}