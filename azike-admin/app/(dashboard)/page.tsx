// admin/app/(dashboard)/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

async function getStats(accessToken: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

  try {
    const res = await fetch(`${API_URL}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const stats = await getStats((session.user as any).accessToken);

  return (
    <div className="p-6 lg:p-8">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {session.user?.name}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            System Online
          </span>
        </div>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Members"
              value={stats.members?.total ?? 0}
              sublabel={`${stats.members?.active ?? 0} active`}
              trend={stats.members?.renewal_rate_percent}
              color="blue"
            />
            <StatCard
              label="Revenue YTD"
              value={`KES ${(stats.revenue?.total_ytd ?? 0).toLocaleString()}`}
              sublabel={`KES ${(stats.revenue?.this_month ?? 0).toLocaleString()} this month`}
              color="green"
            />
            <StatCard
              label="Events"
              value={stats.events?.total_published ?? 0}
              sublabel={`${stats.events?.upcoming ?? 0} upcoming`}
              color="purple"
            />
            <StatCard
              label="New Members"
              value={stats.members?.new_this_month ?? 0}
              sublabel="This month"
              color="yellow"
            />
          </div>

          {stats.recent_transactions?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.recent_transactions.map((tx: any) => (
                      <tr key={tx.transaction_id} className="hover:bg-gray-50">
                        <td className="font-medium text-gray-900">{tx.user}</td>
                        <td className="capitalize">{tx.type.replace('_', ' ')}</td>
                        <td className="font-medium">KES {tx.amount.toLocaleString()}</td>
                        <td>
                          <span className="badge-success">{tx.status}</span>
                        </td>
                        <td className="text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Could not load dashboard</h3>
            <p className="text-gray-500">Ensure the backend server is running on port 4000</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ StatCard defined in the same file
function StatCard({
  label,
  value,
  sublabel,
  trend,
  color,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: number;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}) {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  };

  const c = colors[color];

  return (
    <div className="card">
      <div className="card-body">
        <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
        <p className={`text-3xl font-bold ${c.text} mb-1`}>{value}</p>
        {sublabel && <p className="text-sm text-gray-500">{sublabel}</p>}
        {trend !== undefined && (
          <div className={`mt-3 pt-3 border-t ${c.border}`}>
            <span className={`text-sm font-medium ${trend > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
              {trend}% renewal rate
            </span>
          </div>
        )}
      </div>
    </div>
  );
}