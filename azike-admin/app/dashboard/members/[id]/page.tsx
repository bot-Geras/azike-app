// admin/app/dashboard/members/[id]/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

export default async function MemberDetailPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';
  
  const res = await fetch(`${BACKEND_URL}/admin/members/${params.id}`, {
    headers: { 'Authorization': `Bearer ${(session.user as any).accessToken}` }
  });
  const response = await res.json();
  const member = response.data;

  if (!member) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Member not found</h1>
      </div>
    );
  }

  const membership = member.memberships[0];
  const isActive = membership?.status === 'active' && 
                   new Date(membership.end_date) >= new Date();

  return (
    <div className="p-6">
      <Link 
        href="/dashboard/members" 
        className="flex items-center text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Members
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary text-3xl font-bold">
                {member.first_name[0]}{member.last_name[0]}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {member.first_name} {member.last_name}
            </h2>
            <span className="text-gray-500 text-sm">{member.email}</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Phone</label>
              <p className="text-gray-900">{member.phone_number}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Member Since</label>
              <p className="text-gray-900">
                {new Date(member.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Roles</label>
              <div className="flex gap-1 mt-1">
                {member.user_roles.map((role: { role: string }) => (
                  <span key={role.role} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs capitalize">
                    {role.role?.replace('_', ' ') || 'member'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Membership Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Membership</h2>
            
            {membership ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isActive ? 'Active' : membership.status}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Tier</label>
                  <p className="text-gray-900 capitalize">{membership.membership_tier}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Start Date</label>
                  <p className="text-gray-900">{new Date(membership.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">End Date</label>
                  <p className="text-gray-900">{new Date(membership.end_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Free Events Used</label>
                  <p className="text-gray-900">{membership.free_events_used} / {membership.free_events_limit}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Auto Renew</label>
                  <p className="text-gray-900">{membership.auto_renew_enabled ? 'Yes' : 'No'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No membership record</p>
            )}
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Tickets</h2>
            
            {member.tickets.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {member.tickets.map((ticket: { id: Key | null | undefined; events: { title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; ticket_number: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; purchased_at: string | number | Date; ticket_type: string; price_paid: any; }) => (
                  <div key={ticket.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{ticket.events.title}</p>
                        <p className="text-sm text-gray-500">
                          Ticket #{ticket.ticket_number} • {new Date(ticket.purchased_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          ticket.ticket_type === 'free_entitlement' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ticket.ticket_type.replace(/_/g, ' ')}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          KES {Number(ticket.price_paid).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tickets purchased</p>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            
            {member.transactions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {member.transactions.map((tx: { id: Key | null | undefined; transaction_type: string; created_at: string | number | Date; amount: any; status: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
                  <div key={tx.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {tx.transaction_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        KES {Number(tx.amount).toLocaleString()}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        tx.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : tx.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}