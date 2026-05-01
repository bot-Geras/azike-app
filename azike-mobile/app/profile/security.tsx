
import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { api } from '../../services/api';
import { ShieldCheckIcon, LockClosedIcon, KeyIcon } from 'react-native-heroicons/outline';

export default function SecuritySettingsScreen() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    if (!form.new_password || form.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    if (form.new_password !== form.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await api.put('/auth/change-password', form);
      Alert.alert('Success', 'Password changed successfully');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-primary px-5 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">Security</Text>
      </View>

      <ScrollView className="flex-1 p-5">
        {/* Change Password */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <LockClosedIcon size={20} color="#2E7D32" />
            <Text className="font-semibold text-gray-800 ml-2">Change Password</Text>
          </View>
          
          <View className="space-y-3">
            <View>
              <Text className="text-gray-700 mb-1">Current Password</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-base ${
                  errors.current_password ? 'border-error' : 'border-gray-300'
                }`}
                value={form.current_password}
                onChangeText={(text) => setForm({ ...form, current_password: text })}
                secureTextEntry
                placeholder="Enter current password"
              />
              {errors.current_password && (
                <Text className="text-error text-xs mt-1">{errors.current_password}</Text>
              )}
            </View>

            <View>
              <Text className="text-gray-700 mb-1">New Password</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-base ${
                  errors.new_password ? 'border-error' : 'border-gray-300'
                }`}
                value={form.new_password}
                onChangeText={(text) => setForm({ ...form, new_password: text })}
                secureTextEntry
                placeholder="Enter new password"
              />
              {errors.new_password && (
                <Text className="text-error text-xs mt-1">{errors.new_password}</Text>
              )}
            </View>

            <View>
              <Text className="text-gray-700 mb-1">Confirm New Password</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-base ${
                  errors.confirm_password ? 'border-error' : 'border-gray-300'
                }`}
                value={form.confirm_password}
                onChangeText={(text) => setForm({ ...form, confirm_password: text })}
                secureTextEntry
                placeholder="Confirm new password"
              />
              {errors.confirm_password && (
                <Text className="text-error text-xs mt-1">{errors.confirm_password}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            className={`rounded-lg py-3 mt-4 ${loading ? 'bg-gray-400' : 'bg-primary'}`}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">Update Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <ShieldCheckIcon size={20} color="#2E7D32" />
            <Text className="font-semibold text-gray-800 ml-2">Account Security</Text>
          </View>
          
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Two-Factor Authentication</Text>
              <Text className="text-gray-400">Coming Soon</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Login History</Text>
              <TouchableOpacity>
                <Text className="text-primary">View</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Active Sessions</Text>
              <Text className="text-success">1 Active</Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="bg-white rounded-xl p-4">
          <TouchableOpacity
            className="flex-row items-center justify-center py-2"
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'This action is irreversible. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive' }
                ]
              );
            }}
          >
            <Text className="text-error font-medium">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}