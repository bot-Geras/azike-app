// admin/app/dashboard/members/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { MembersTable } from '@/components/members/MembersTable';
import { StatCard } from '@/components/StatCard';
import { UsersIcon, UserPlusIcon, ClockIcon } from '@heroicons/react/24/outline';

export default async function MembersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';
  
  // Fetch data from backend API using the session token
  const fetchFromBackend = async (endpoint: string) => {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${(session.user as any).accessToken}` }
    });
    return res.json();
  };

  const [membersRes, statsRes] = await Promise.all([
    fetchFromBackend('/admin/members'),
    fetchFromBackend('/admin/members/stats')
  ]);

  const members = membersRes.data || [];
  const stats = statsRes.data || { total: 0, active: 0, expiringThisMonth: 0, newThisMonth: 0 };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Members</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition">
          + Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Members"
          value={stats.total}
          icon={<UsersIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Members"
          value={stats.active}
          icon={<UsersIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringThisMonth}
          icon={<ClockIcon className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="New This Month"
          value={stats.newThisMonth}
          icon={<UserPlusIcon className="w-6 h-6" />}
          color="purple"
        />
      </div>

      <MembersTable members={members} />
    </div>
  );
}