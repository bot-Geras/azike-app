// admin/app/dashboard/transactions/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { StatCard } from '@/components/StatCard';
import { CurrencyDollarIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';
  
  const fetchFromBackend = async (endpoint: string) => {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${(session.user as any).accessToken}` }
    });
    return res.json();
  };

  const [transactionsRes, statsRes] = await Promise.all([
    fetchFromBackend('/admin/transactions'),
    fetchFromBackend('/admin/transactions/stats')
  ]);

  const transactions = transactionsRes.data || [];
  const stats = statsRes.data || { total: 0, completed: 0, pending: 0, failed: 0 };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Transactions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`KES ${stats.total.toLocaleString()}`}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<ClockIcon className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Failed"
          value={stats.failed}
          icon={<XCircleIcon className="w-6 h-6" />}
          color="red"
        />
      </div>

      <TransactionsTable transactions={transactions} />
    </div>
  );
}