
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await api.get('/payments/transactions');
      return response.data.data.transactions;
    },
    staleTime: 30 * 1000
  });
};

export const useTransactionStatus = (transactionId: string | null) => {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const response = await api.get(`/payments/transaction/${transactionId}/status`);
      return response.data.data;
    },
    enabled: !!transactionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 3000; // Poll every 3 seconds
    }
  });
};

export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      phone_number: string;
      amount: number;
      reference_type: string;
      reference_id: string;
      description: string;
    }) => {
      const response = await api.post('/payments/mpesa/stkpush', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
};