
import { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useMembership } from '../../hooks/useMembership';
import { api } from '../../services/api';
import { 
  ArrowPathIcon, 
  BellIcon, 
  DocumentTextIcon,
  ChevronRightIcon
} from 'react-native-heroicons/outline';

export default function MembershipSettingsScreen() {
  const { membership, refetch } = useMembership();
  const [autoRenew, setAutoRenew] = useState(membership?.auto_renew_enabled || false);
  const [loading, setLoading] = useState(false);

  const toggleAutoRenew = async (value: boolean) => {
    setLoading(true);
    try {
      await api.put('/membership/settings', { auto_renew_enabled: value });
      setAutoRenew(value);
      refetch();
      Alert.alert(
        'Success',
        value ? 'Auto-renewal enabled' : 'Auto-renewal disabled'
      );
    } catch (error) {
      setAutoRenew(!value); // Revert on error
      Alert.alert('Error', 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-primary px-5 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">Membership Settings</Text>
      </View>

      <ScrollView className="flex-1 p-5">
        {/* Auto-Renewal */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <ArrowPathIcon size={20} color="#2E7D32" />
              <Text className="font-semibold text-gray-800 ml-2">Auto-Renewal</Text>
            </View>
            <Switch
              value={autoRenew}
              onValueChange={toggleAutoRenew}
              disabled={loading}
              trackColor={{ false: '#D1D5DB', true: '#A5D6A7' }}
              thumbColor={autoRenew ? '#2E7D32' : '#9CA3AF'}
            />
          </View>
          <Text className="text-gray-500 text-sm ml-8">
            Automatically renew your membership before it expires. Payment will be processed via M-Pesa.
          </Text>

          {autoRenew && (
            <View className="bg-blue-50 rounded-lg p-3 mt-3 ml-8">
              <Text className="text-blue-700 text-xs">
                Your membership will renew on {new Date(membership?.current_period.end_date || '').toLocaleDateString()} for KES 2,000.
              </Text>
            </View>
          )}
        </View>

        {/* Membership History */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <TouchableOpacity className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <DocumentTextIcon size={20} color="#2E7D32" />
              <Text className="font-semibold text-gray-800 ml-2">Membership History</Text>
            </View>
            <ChevronRightIcon size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Current Plan Details */}
        <View className="bg-white rounded-xl p-4">
          <View className="flex-row items-center mb-3">
            <BellIcon size={20} color="#2E7D32" />
            <Text className="font-semibold text-gray-800 ml-2">Current Plan</Text>
          </View>
          
          <View className="bg-gray-50 rounded-lg p-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Plan</Text>
              <Text className="font-medium capitalize">{membership?.membership_tier}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Price</Text>
              <Text className="font-medium">KES 2,000/year</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Free Events</Text>
              <Text className="font-medium">
                {membership?.entitlements.free_events_remaining} remaining
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Renewal Date</Text>
              <Text className="font-medium">
                {new Date(membership?.current_period.end_date || '').toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}