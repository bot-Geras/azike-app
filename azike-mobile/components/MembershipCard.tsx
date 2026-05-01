
import { View, Text } from 'react-native';
import Barcode from 'react-native-barcode-builder';
import { ShieldCheckIcon } from 'react-native-heroicons/outline';

interface MembershipCardProps {
  membership: any;
  user?: any;
}

export function MembershipCard({ membership, user }: MembershipCardProps) {
  if (!membership?.is_active) {
    return (
      <View className="bg-gray-200 rounded-2xl p-6 items-center">
        <View className="w-16 h-16 bg-gray-300 rounded-full items-center justify-center mb-3">
          <ShieldCheckIcon size={32} color="#6B7280" />
        </View>
        <Text className="text-gray-500 text-lg font-semibold">Membership Expired</Text>
        <Text className="text-gray-400 text-sm mt-1">Renew to access your card</Text>
      </View>
    );
  }

  return (
    <View className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-white/80 text-sm">AZIKE Member</Text>
          <Text className="text-white text-xl font-bold">
            {user?.first_name} {user?.last_name}
          </Text>
        </View>
        <View className="bg-white/20 px-3 py-1 rounded-full">
          <Text className="text-white text-xs uppercase font-medium">
            {membership.membership_tier}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-white/60 text-xs mb-1">Member ID</Text>
        <Text className="text-white text-lg font-mono tracking-wider">
          {membership.digital_card?.member_id}
        </Text>
      </View>

      <View className="bg-white rounded-xl p-4 items-center">
        <Barcode
          value={membership.digital_card?.barcode_data || ''}
          format="CODE128"
          width={1.5}
          height={70}
          background="white"
          lineColor="#1B5E20"
        />
      </View>

      <View className="flex-row justify-between mt-4">
        <View>
          <Text className="text-white/60 text-xs">Member Since</Text>
          <Text className="text-white text-sm">
            {new Date(membership.digital_card?.member_since || '').toLocaleDateString()}
          </Text>
        </View>
        <View>
          <Text className="text-white/60 text-xs">Expires</Text>
          <Text className="text-white text-sm">
            {new Date(membership.current_period.end_date).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
}