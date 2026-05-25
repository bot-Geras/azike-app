// admin/app/(dashboard)/members/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

async function getMembers(accessToken: string) {
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

export default async function MembersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const stats = await getMembers((session.user as any).accessToken);

  // Placeholder members data
  const members = [
    { id: '1', name: 'Sarah Mwangi', email: 'sarah@example.com', phone: '254712345678', status: 'active', joined: '2026-01-15' },
    { id: '2', name: 'John Doe', email: 'john@example.com', phone: '254723456789', status: 'expired', joined: '2025-11-01' },
    { id: '3', name: 'Jane Smith', email: 'jane@example.com', phone: '254734567890', status: 'active', joined: '2026-03-20' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">Manage your community members</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">All Members</h2>
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search members..."
              className="w-64 text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="font-medium text-gray-900">{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>
                    <span className={member.status === 'active' ? 'badge-success' : 'badge-error'}>
                      {member.status}
                    </span>
                  </td>
                  <td className="text-gray-500">{new Date(member.joined).toLocaleDateString()}</td>
                  <td className="text-right">
                    <Link href={`/dashboard/members/${member.id}`} className="btn-ghost text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}