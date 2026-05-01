
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { 
  QuestionMarkCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ChevronRightIcon
} from 'react-native-heroicons/outline';

const faqItems = [
  {
    question: 'How do I renew my membership?',
    answer: 'Go to the Membership Card tab and tap "Renew Membership". Follow the M-Pesa payment prompts.'
  },
  {
    question: 'How do free event tickets work?',
    answer: 'Active members get 1 free event per year. When booking, select "Use Free Entitlement".'
  },
  {
    question: 'Can I get a refund?',
    answer: 'Refunds are handled on a case-by-case basis. Contact support for assistance.'
  },
  {
    question: 'How do I change my password?',
    answer: 'Go to Profile > Security > Change Password.'
  }
];

export default function SupportScreen() {
  const handleEmail = () => {
    Linking.openURL('mailto:support@azike.com');
  };

  const handleCall = () => {
    Linking.openURL('tel:+254700000000');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/254700000000');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-primary px-5 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">Help & Support</Text>
      </View>

      <ScrollView className="flex-1 p-5">
        {/* Contact Options */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="font-semibold text-gray-800 mb-3">Contact Us</Text>
          
          <TouchableOpacity 
            className="flex-row items-center p-3 rounded-lg bg-gray-50 mb-2"
            onPress={handleEmail}
          >
            <EnvelopeIcon size={20} color="#2E7D32" />
            <View className="ml-3 flex-1">
              <Text className="font-medium text-gray-800">Email</Text>
              <Text className="text-gray-500 text-sm">support@azike.com</Text>
            </View>
            <ChevronRightIcon size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center p-3 rounded-lg bg-gray-50 mb-2"
            onPress={handleWhatsApp}
          >
            <ChatBubbleLeftRightIcon size={20} color="#2E7D32" />
            <View className="ml-3 flex-1">
              <Text className="font-medium text-gray-800">WhatsApp</Text>
              <Text className="text-gray-500 text-sm">+254 700 000 000</Text>
            </View>
            <ChevronRightIcon size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center p-3 rounded-lg bg-gray-50"
            onPress={handleCall}
          >
            <PhoneIcon size={20} color="#2E7D32" />
            <View className="ml-3 flex-1">
              <Text className="font-medium text-gray-800">Phone</Text>
              <Text className="text-gray-500 text-sm">+254 700 000 000</Text>
            </View>
            <ChevronRightIcon size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="font-semibold text-gray-800 mb-3">Frequently Asked Questions</Text>
          
          {faqItems.map((item, index) => (
            <View key={index} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b border-gray-100 last:border-b-0">
              <View className="flex-row items-start">
                <QuestionMarkCircleIcon size={18} color="#2E7D32" />
                <View className="ml-2 flex-1">
                  <Text className="font-medium text-gray-800">{item.question}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{item.answer}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Terms & Privacy */}
        <View className="bg-white rounded-xl p-4">
          <Text className="font-semibold text-gray-800 mb-3">Legal</Text>
          
          <TouchableOpacity className="flex-row items-center justify-between p-3 rounded-lg bg-gray-50 mb-2">
            <View className="flex-row items-center">
              <DocumentTextIcon size={20} color="#2E7D32" />
              <Text className="ml-3 text-gray-700">Terms of Service</Text>
            </View>
            <ChevronRightIcon size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-3 rounded-lg bg-gray-50">
            <View className="flex-row items-center">
              <DocumentTextIcon size={20} color="#2E7D32" />
              <Text className="ml-3 text-gray-700">Privacy Policy</Text>
            </View>
            <ChevronRightIcon size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <Text className="text-gray-400 text-xs text-center mt-6 mb-8">
          App Version 1.0.0 • Build 2024
        </Text>
      </ScrollView>
    </View>
  );
}