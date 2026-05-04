
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useMembership } from '../../hooks/useMembership';
import { router } from 'expo-router';
// import Barcode from 'react-native-barcode-builder';
import { ShareIcon, QrCodeIcon, ArrowPathIcon } from 'react-native-heroicons/outline';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { useRef } from 'react';

export default function MembershipCardScreen() {
  const { membership, card, isLoading, refetch } = useMembership();
  const cardRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    if (!cardRef.current?.capture) return;
    
    try {
      const uri = await cardRef.current.capture?.();
      if (!uri) return;
      await Sharing.shareAsync(uri, {
        dialogTitle: 'Share Membership Card'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share membership card');
    }
  };

  // if (isLoading) {
  //   return (
  //     <View className="flex-1 bg-white justify-center items-center">
  //       <ActivityIndicator size="large" color="#2E7D32" />
  //     </View>
  //   );
  // }

  if (!membership?.is_active) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
          <QrCodeIcon size={40} color="#9CA3AF" />
        </View>
        <Text className="text-xl font-semibold text-gray-800 mb-2">
          Membership Expired
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          Your membership has expired. Renew to access your digital card and member benefits.
        </Text>
        <TouchableOpacity 
          className="bg-primary px-6 py-3 rounded-lg"
          onPress={() => router.push('/membership/renew')}
        >
          <Text className="text-white font-semibold">Renew Membership</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-5">
        <ViewShot ref={cardRef} options={{ format: 'png', quality: 0.9 }}>
          <View className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6">
            {/* Card Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-white/80 text-sm">AZIKE Member</Text>
                <Text className="text-white text-2xl font-bold">
                  {card?.member_name || membership?.digital_card?.member_name}
                </Text>
              </View>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium uppercase">
                  {card?.tier || membership?.membership_tier}
                </Text>
              </View>
            </View>

            {/* Member ID */}
            <View className="mb-6">
              <Text className="text-white/60 text-xs mb-1">Member ID</Text>
              <Text className="text-white text-lg font-mono tracking-wider">
                {card?.member_id || membership?.digital_card?.member_id}
              </Text>
            </View>

            {/* Barcode */}
            <View className="bg-white rounded-xl p-4 items-center">
              {/* <Barcode 
                value={card?.barcode_data || membership?.digital_card?.barcode_data || ''} 
                format="CODE128"
                width={1.5}
                height={70}
                background="white"
                lineColor="#1B5E20"
              /> */}
              <Text className="text-gray-500 text-xs mt-2 font-mono">
                {(card?.barcode_data || membership?.digital_card?.barcode_data || '').slice(0, 30)}...
              </Text>
            </View>

            {/* Expiry Info */}
            <View className="flex-row justify-between mt-6">
              <View>
                <Text className="text-white/60 text-xs">Member Since</Text>
                <Text className="text-white text-base">
                  {new Date(card?.member_since || membership?.digital_card?.member_since || '').toLocaleDateString()}
                </Text>
              </View>
              <View>
                <Text className="text-white/60 text-xs">Expires</Text>
                <Text className="text-white text-base">
                  {new Date(card?.expiry_date || membership?.digital_card?.expiry_date || '').toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View className="absolute top-4 right-4">
              <View className="bg-success/20 px-2 py-1 rounded-full">
                <Text className="text-white text-xs">● Active</Text>
              </View>
            </View>
          </View>
        </ViewShot>

        {/* Actions */}
        <View className="flex-row justify-center space-x-4 mt-6">
          <TouchableOpacity 
            className="bg-white px-6 py-3 rounded-lg flex-row items-center shadow-sm"
            onPress={handleShare}
          >
            <ShareIcon size={20} color="#2E7D32" />
            <Text className="text-primary ml-2 font-medium">Share Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-white px-6 py-3 rounded-lg flex-row items-center shadow-sm"
            onPress={() => refetch()}
          >
            <ArrowPathIcon size={20} color="#2E7D32" />
            <Text className="text-primary ml-2 font-medium">Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Benefits */}
        <View className="mt-8">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Your Benefits
          </Text>
          <View className="bg-white rounded-xl divide-y divide-gray-100">
            <BenefitItem 
              title="Free Events Remaining"
              value={`${membership?.entitlements.free_events_remaining} of ${membership?.entitlements.free_events_limit}`}
            />
            <BenefitItem 
              title="Member Discount"
              value="Up to 70% off events"
            />
            <BenefitItem 
              title="Exclusive Access"
              value="Member-only events"
            />
            <BenefitItem 
              title="Auto-Renewal"
              value={membership?.auto_renew_enabled ? 'Enabled' : 'Disabled'}
              action
              onPress={() => router.push('/membership/settings')}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function BenefitItem({ title, value, action, onPress }: {
  title: string;
  value: string;
  action?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity 
      className="flex-row justify-between items-center p-4"
      onPress={onPress}
      disabled={!action}
    >
      <Text className="text-gray-700">{title}</Text>
      <View className="flex-row items-center">
        <Text className="text-gray-900 font-medium mr-2">{value}</Text>
        {action && (
          <Text className="text-primary text-xl">›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}