'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  roles: string[];
  joined: string;
  memberships: Membership[];
  tickets: Ticket[];
  transactions: Transaction[];
}

interface Membership {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  free_events_used: number;
  free_events_limit: number;
  membership_tier: string;
}

interface Ticket {
  id: string;
  ticket_number: string;
  event_title: string;
  ticket_type: string;
  price_paid: number;
  is_checked_in: boolean;
  purchased_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  receipt: string;
  created_at: string;
}

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    try {
      const res = await fetch(`/api/admin/members/${memberId}`);
      const data = await res.json();
      if (data.success) {
        setMember(data.data);
      } else {
        toast.error('Member not found');
      }
    } catch (error) {
      toast.error('Failed to load member');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 skeleton" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 skeleton rounded-xl" />
            <div className="lg:col-span-2 h-64 skeleton rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Member Not Found</h1>
        <button onClick={() => router.back()} className="btn-primary">Go Back</button>
      </div>
    );
  }

  const activeMembership = member.memberships?.find(
    (m) => m.status === 'active' && new Date(m.end_date) >= new Date()
  );

  return (
    <div className="p-6 lg:p-8">
      <button onClick={() => router.back()} className="btn-ghost mb-6">
        ← Back to Members
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card">
          <div className="card-body text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-4">
              <span className="text-primary-700 text-3xl font-bold">
                {member.first_name[0]}{member.last_name[0]}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {member.first_name} {member.last_name}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{member.email}</p>

            <div className="mt-4 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{member.phone_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Joined</span>
                <span className="font-medium">{new Date(member.joined).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Roles</span>
                <div className="flex gap-1">
                  {member.roles.map((role) => (
                    <span key={role} className="badge badge-neutral capitalize text-xs">
                      {role.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Membership & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Membership Status */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Membership</h2>
            </div>
            <div className="card-body">
              {activeMembership ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className="badge badge-success">{activeMembership.status}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tier</p>
                    <p className="font-medium capitalize">{activeMembership.membership_tier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="font-medium">{new Date(activeMembership.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expiry Date</p>
                    <p className="font-medium">{new Date(activeMembership.end_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Free Events Used</p>
                    <p className="font-medium">{activeMembership.free_events_used} / {activeMembership.free_events_limit}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No active membership</p>
              )}
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Ticket #</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {member.tickets?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No tickets</td>
                    </tr>
                  ) : (
                    member.tickets?.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="font-medium">{ticket.event_title}</td>
                        <td className="text-sm font-mono">{ticket.ticket_number}</td>
                        <td className="capitalize">{ticket.ticket_type.replace(/_/g, ' ')}</td>
                        <td>KES {ticket.price_paid.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${ticket.is_checked_in ? 'badge-success' : 'badge-neutral'}`}>
                            {ticket.is_checked_in ? 'Checked In' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {member.transactions?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No transactions</td>
                    </tr>
                  ) : (
                    member.transactions?.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="capitalize">{tx.type.replace('_', ' ')}</td>
                        <td className="font-medium">KES {tx.amount.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${tx.status === 'completed' ? 'badge-success' : tx.status === 'failed' ? 'badge-error' : 'badge-warning'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="text-sm font-mono text-gray-500">{tx.receipt || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}