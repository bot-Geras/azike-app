
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  TextInput
} from 'react-native';
import { router } from 'expo-router';
import { useMembership } from '../../hooks/useMembership';
import { api } from '../../services/api';
import { CheckIcon, CurrencyDollarIcon, CalendarIcon, ShieldCheckIcon } from 'react-native-heroicons/outline';

interface RenewalPackage {
  package_id: string;
  name: string;
  price: number;
  currency: string;
  duration_days: number;
  benefits: string[];
}

export default function RenewScreen() {
  const { membership } = useMembership();
  const [packages, setPackages] = useState<RenewalPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    fetchRenewalOptions();
  }, []);

  const fetchRenewalOptions = async () => {
    try {
      const response = await api.get('/membership/renewal-options');
      setPackages(response.data.data.packages);
      if (response.data.data.packages.length > 0) {
        setSelectedPackage(response.data.data.packages[0].package_id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load renewal options');
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleRenew = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a membership package');
      return;
    }

    const selectedPkg = packages.find(p => p.package_id === selectedPackage);
    if (!selectedPkg) return;

    setLoading(true);
    setPaymentStatus('processing');

    try {
      const response = await api.post('/membership/renew', {
        package_id: selectedPackage,
        phone_number: phoneNumber || undefined
      });

      const { transaction_id, checkout_request_id, amount } = response.data.data;
      setTransactionId(transaction_id);

      Alert.alert(
        'M-Pesa Payment',
        `Payment request of KES ${amount} sent to your phone. Please enter your M-Pesa PIN to complete.`,
        [
          {
            text: 'OK',
            onPress: () => startPolling(transaction_id)
          }
        ]
      );
    } catch (error: any) {
      setPaymentStatus('failed');
      Alert.alert('Payment Failed', error.response?.data?.message || 'Could not initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (txId: string) => {
    let attempts = 0;
    const maxAttempts = 20; // 60 seconds max

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/payments/transaction/${txId}/status`);
        const { status, completed_at, failure_reason } = response.data.data;

        if (status === 'completed') {
          clearInterval(pollInterval);
          setPaymentStatus('success');
          Alert.alert(
            'Payment Successful! 🎉',
            'Your membership has been renewed successfully.',
            [
              {
                text: 'View Card',
                onPress: () => router.replace('/(tabs)/card')
              }
            ]
          );
        } else if (status === 'failed') {
          clearInterval(pollInterval);
          setPaymentStatus('failed');
          Alert.alert(
            'Payment Failed',
            failure_reason || 'The payment was not completed. Please try again.',
            [{ text: 'OK' }]
          );
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setPaymentStatus('failed');
          Alert.alert(
            'Payment Timeout',
            'We couldn\'t confirm your payment. Please check your transaction history.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
  };

  const selectedPkgDetails = packages.find(p => p.package_id === selectedPackage);

  if (loadingPackages) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-5">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800">Renew Membership</Text>
          <Text className="text-gray-500 mt-1">
            Continue enjoying exclusive member benefits
          </Text>
        </View>

        {/* Current Status */}
        {membership && (
          <View className="bg-white rounded-xl p-4 mb-6">
            <Text className="text-gray-500 text-sm mb-2">Current Status</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full mr-2 ${
                  membership.is_active ? 'bg-success' : 'bg-error'
                }`} />
                <Text className={`font-semibold ${
                  membership.is_active ? 'text-success' : 'text-error'
                }`}>
                  {membership.is_active ? 'Active' : 'Expired'}
                </Text>
              </View>
              {membership.is_active && (
                <Text className="text-gray-600">
                  Expires: {new Date(membership.current_period.end_date).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Package Selection */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">Select Package</Text>
        
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.package_id}
            className={`bg-white rounded-xl p-4 mb-3 border-2 ${
              selectedPackage === pkg.package_id 
                ? 'border-primary' 
                : 'border-transparent'
            }`}
            onPress={() => setSelectedPackage(pkg.package_id)}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold text-gray-800">{pkg.name}</Text>
              <View className="bg-primary/10 px-3 py-1 rounded-full">
                <Text className="text-primary font-bold">
                  {pkg.currency} {pkg.price.toLocaleString()}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-3">
              <CalendarIcon size={16} color="#6B7280" />
              <Text className="text-gray-500 ml-2">
                {pkg.duration_days} days membership
              </Text>
            </View>

            <View className="border-t border-gray-100 pt-3">
              {pkg.benefits.map((benefit, index) => (
                <View key={index} className="flex-row items-center mb-1">
                  <CheckIcon size={14} color="#4CAF50" />
                  <Text className="text-gray-600 ml-2 text-sm">{benefit}</Text>
                </View>
              ))}
            </View>

            {selectedPackage === pkg.package_id && (
              <View className="absolute top-4 right-4">
                <View className="bg-primary w-5 h-5 rounded-full items-center justify-center">
                  <CheckIcon size={12} color="white" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Phone Number (Optional) */}
        <View className="mt-4 mb-6">
          <Text className="text-gray-700 mb-2">Phone Number (Optional)</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Leave empty to use registered number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <Text className="text-gray-400 text-xs mt-1">
            M-Pesa payment will be sent to this number
          </Text>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          className={`rounded-lg py-4 ${
            loading || paymentStatus === 'processing' 
              ? 'bg-gray-400' 
              : 'bg-primary'
          }`}
          onPress={handleRenew}
          disabled={loading || paymentStatus === 'processing'}
        >
          {loading || paymentStatus === 'processing' ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator color="white" />
              <Text className="text-white font-semibold ml-2">
                Processing...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center justify-center">
              <CurrencyDollarIcon size={20} color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                Pay KES {selectedPkgDetails?.price.toLocaleString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Security Note */}
        <View className="flex-row items-center justify-center mt-6">
          <ShieldCheckIcon size={16} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs ml-1">
            Secure payment via M-Pesa
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}