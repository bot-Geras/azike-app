import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { CreditCardIcon, PlusIcon, TrashIcon } from 'react-native-heroicons/outline';

export default function PaymentMethodsScreen() {
  const paymentMethods = [
    {
      id: '1',
      type: 'mpesa',
      name: 'M-Pesa',
      detail: '254712345678',
      isDefault: true
    }
  ];

  const handleRemove = (id: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive' }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-primary px-5 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">Payment Methods</Text>
      </View>

      <ScrollView className="flex-1 p-5">
        {paymentMethods.map((method) => (
          <View key={method.id} className="bg-white rounded-xl p-4 mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                  <CreditCardIcon size={24} color="#2E7D32" />
                </View>
                <View className="ml-3">
                  <Text className="font-semibold text-gray-800">{method.name}</Text>
                  <Text className="text-gray-500 text-sm">{method.detail}</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                {method.isDefault && (
                  <View className="bg-primary/10 px-2 py-1 rounded mr-2">
                    <Text className="text-primary text-xs">Default</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => handleRemove(method.id)}>
                  <TrashIcon size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-300 items-center mt-4">
          <PlusIcon size={24} color="#2E7D32" />
          <Text className="text-primary font-medium mt-2">Add Payment Method</Text>
        </TouchableOpacity>

        <View className="mt-8">
          <Text className="text-gray-500 text-sm text-center">
            All payments are securely processed via M-Pesa. We do not store your M-Pesa PIN.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}