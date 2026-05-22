// admin/app/(dashboard)/transactions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Transaction {
  transaction_id: string;
  user: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  receipt?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.recent_transactions || []);
      }
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch = t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.receipt && t.receipt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Monitor all payments</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-green-700">KES {totalAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-blue-700">{filtered.filter((t) => t.status === 'completed').length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="search"
          placeholder="Search by name or receipt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[180px]">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending_stk_push">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="max-w-[180px]">
          <option value="all">All Types</option>
          <option value="membership">Membership</option>
          <option value="event_ticket">Event Ticket</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map((tx, i) => (
                  <tr key={tx.transaction_id || i} className="hover:bg-gray-50">
                    <td className="text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString()}
                      <div className="text-xs">{new Date(tx.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="font-medium text-gray-900">{tx.user}</td>
                    <td className="capitalize">{tx.type.replace('_', ' ')}</td>
                    <td className="font-medium">KES {tx.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${tx.status === 'completed' ? 'badge-success' : tx.status === 'failed' ? 'badge-error' : 'badge-warning'}`}>
                        {tx.status.replace(/_/g, ' ')}
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
  );
}