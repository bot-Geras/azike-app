
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  receipt: string | null;
  created_at: string;
  completed_at: string | null;
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/payments/transactions');
      setTransactions(response.data.data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'failed': return 'text-error';
      case 'mpesa_callback_received_success': return 'text-warning';
      default: return 'text-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'membership' ? 'Membership Renewal' : 'Event Ticket';
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-5">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Transaction History</Text>

        {transactions.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center">
            <Text className="text-gray-500 text-center">No transactions yet</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {transactions.map((tx) => (
              <View key={tx.id} className="bg-white rounded-xl p-4">
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="font-semibold text-gray-800">
                      {getTypeLabel(tx.type)}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      {format(new Date(tx.created_at), 'dd MMM yyyy, hh:mm a')}
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-gray-800">
                    KES {tx.amount.toLocaleString()}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100">
                  <View className="flex-row items-center">
                    <View className={`w-2 h-2 rounded-full mr-2 ${
                      tx.status === 'completed' ? 'bg-success' : 
                      tx.status === 'failed' ? 'bg-error' : 'bg-warning'
                    }`} />
                    <Text className={`capitalize ${getStatusColor(tx.status)}`}>
                      {tx.status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                  {tx.receipt && (
                    <Text className="text-gray-500 text-xs">
                      Receipt: {tx.receipt}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}