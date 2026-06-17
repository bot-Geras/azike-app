import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import {
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ChevronRightIcon,
} from "react-native-heroicons/outline";

const faqItems = [
  {
    question: "How do I renew my membership?",
    answer:
      'Go to the Membership Card tab and tap "Renew Membership". Follow the M-Pesa payment prompts.',
  },
  {
    question: "How do free event tickets work?",
    answer:
      'Active members get 1 free event per year. When booking, select "Use Free Entitlement".',
  },
  {
    question: "Can I get a refund?",
    answer:
      "Refunds are handled on a case-by-case basis. Contact support for assistance.",
  },
  {
    question: "How do I change my password?",
    answer: "Go to Profile > Security > Change Password.",
  },
];

export default function SupportScreen() {
  const handleEmail = () => {
    Linking.openURL("mailto:support@azike.com");
  };

  const handleCall = () => {
    Linking.openURL("tel:+254700000000");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/254700000000");
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Hero Section */}
        <View className="bg-primary px-6 pt-14 pb-12 rounded-b-[32px]">
          <Text className="text-white text-3xl font-bold">Help & Support</Text>

          <Text className="text-white/80 mt-2 text-base">
            We're here whenever you need assistance.
          </Text>
        </View>

        <View className="-mt-6 px-5">
          {/* Contact Section */}
          <View className="bg-white rounded-3xl p-5 shadow-sm mb-5">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Contact Us
            </Text>

            <TouchableOpacity
              className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-3"
              onPress={handleEmail}
            >
              <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
                <EnvelopeIcon size={22} color="#2E7D32" />
              </View>

              <View className="flex-1 ml-4">
                <Text className="font-semibold text-gray-900">
                  Email Support
                </Text>
                <Text className="text-gray-500 text-sm">support@azike.com</Text>
              </View>

              <ChevronRightIcon size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-3"
              onPress={handleWhatsApp}
            >
              <View className="w-12 h-12 rounded-xl bg-green-100 items-center justify-center">
                <ChatBubbleLeftRightIcon size={22} color="#16A34A" />
              </View>

              <View className="flex-1 ml-4">
                <Text className="font-semibold text-gray-900">WhatsApp</Text>
                <Text className="text-gray-500 text-sm">+254 700 000 000</Text>
              </View>

              <ChevronRightIcon size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-gray-50 p-4 rounded-2xl"
              onPress={handleCall}
            >
              <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
                <PhoneIcon size={22} color="#2563EB" />
              </View>

              <View className="flex-1 ml-4">
                <Text className="font-semibold text-gray-900">
                  Call Support
                </Text>
                <Text className="text-gray-500 text-sm">+254 700 000 000</Text>
              </View>

              <ChevronRightIcon size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* FAQ Section */}
          <View className="bg-white rounded-3xl p-5 shadow-sm mb-5">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </Text>

            {faqItems.map((item, index) => (
              <View
                key={index}
                className="bg-gray-50 rounded-2xl p-4 mb-3 last:mb-0"
              >
                <View className="flex-row">
                  <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                    <QuestionMarkCircleIcon size={20} color="#2E7D32" />
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="font-semibold text-gray-900">
                      {item.question}
                    </Text>

                    <Text className="text-gray-500 mt-2 leading-6">
                      {item.answer}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Legal */}
          <View className="bg-white rounded-3xl p-5 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4">Legal</Text>

            <TouchableOpacity className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl mb-3">
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center">
                  <DocumentTextIcon size={20} color="#2E7D32" />
                </View>

                <Text className="ml-3 font-medium text-gray-800">
                  Terms of Service
                </Text>
              </View>

              <ChevronRightIcon size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl">
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center">
                  <DocumentTextIcon size={20} color="#2E7D32" />
                </View>

                <Text className="ml-3 font-medium text-gray-800">
                  Privacy Policy
                </Text>
              </View>

              <ChevronRightIcon size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center py-8">
            <View className="bg-white px-4 py-2 rounded-full shadow-sm">
              <Text className="text-xs text-gray-500">
                Version 1.0.0 • Build 2024
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
