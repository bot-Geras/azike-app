
import { api } from './api';

export const paymentsService = {
  initiateSTKPush: async (data: {
    phone_number: string;
    amount: number;
    reference_type: 'membership' | 'event_ticket';
    reference_id: string;
    description: string;
  }) => {
    const response = await api.post('/payments/mpesa/stkpush', data);
    return response.data.data;
  },

  getTransactionStatus: async (transactionId: string) => {
    const response = await api.get(`/payments/transaction/${transactionId}/status`);
    return response.data.data;
  },

  getTransactionHistory: async () => {
    const response = await api.get('/payments/transactions');
    return response.data.data.transactions;
  },

  pollTransactionStatus: (
    transactionId: string,
    onSuccess: (data: any) => void,
    onFailure: (error: any) => void,
    maxAttempts: number = 20
  ) => {
    let attempts = 0;
    
    const pollInterval = setInterval(async () => {
      try {
        const status = await paymentsService.getTransactionStatus(transactionId);
        
        if (status.status === 'completed') {
          clearInterval(pollInterval);
          onSuccess(status);
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          onFailure(status);
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          onFailure({ status: 'timeout', message: 'Transaction timed out' });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }
};