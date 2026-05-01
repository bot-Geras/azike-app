
import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { XMarkIcon, CheckIcon } from 'react-native-heroicons/outline';
import { api } from '../services/api';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  transactionId: string;
  amount: number;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export function PaymentModal({ 
  visible, 
  onClose, 
  transactionId, 
  amount, 
  onSuccess, 
  onFailure 
}: PaymentModalProps) {
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [message, setMessage] = useState('Waiting for payment...');

  useEffect(() => {
    if (!visible || !transactionId) return;

    setStatus('processing');
    setMessage('Waiting for payment...');

    let attempts = 0;
    const maxAttempts = 20;

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/payments/transaction/${transactionId}/status`);
        const data = response.data.data;

        if (data.status === 'completed') {
          clearInterval(pollInterval);
          setStatus('success');
          setMessage('Payment successful!');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 2000);
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          setStatus('failed');
          setMessage(data.failure_reason || 'Payment failed');
          onFailure?.();
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setStatus('failed');
          setMessage('Payment timed out. Please check your transactions.');
          onFailure?.();
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [visible, transactionId]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">
              {status === 'processing' ? 'Payment' : status === 'success' ? 'Success' : 'Failed'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <XMarkIcon size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-6">
            {status === 'processing' && (
              <ActivityIndicator size="large" color="#2E7D32" />
            )}
            {status === 'success' && (
              <View className="w-16 h-16 bg-success rounded-full items-center justify-center">
                <CheckIcon size={32} color="white" />
              </View>
            )}
            {status === 'failed' && (
              <View className="w-16 h-16 bg-error rounded-full items-center justify-center">
                <XMarkIcon size={32} color="white" />
              </View>
            )}
          </View>

          <Text className="text-center text-gray-800 mb-2">{message}</Text>
          <Text className="text-center text-gray-500 text-sm mb-4">
            Amount: KES {amount.toLocaleString()}
          </Text>

          {status === 'processing' && (
            <Text className="text-center text-gray-400 text-xs">
              Please check your phone for the M-Pesa PIN prompt
            </Text>
          )}

          {(status === 'success' || status === 'failed') && (
            <TouchableOpacity
              className={`py-3 rounded-lg ${
                status === 'success' ? 'bg-primary' : 'bg-gray-400'
              }`}
              onPress={onClose}
            >
              <Text className="text-white text-center font-semibold">
                {status === 'success' ? 'Continue' : 'Close'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}