// mobile/app/(tabs)/card.tsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useMembership } from '../../hooks/useMembership';
import { router, Stack } from 'expo-router';
import { ShareIcon, QrCodeIcon, ArrowPathIcon } from 'react-native-heroicons/outline';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { useRef } from 'react';

// Import the barcode library
import Barcode from 'react-native-barcode-qr-generator';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MembershipCardScreen() {
  const { membership, isLoading, refetch } = useMembership();
  const cardRef = useRef<ViewShot>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '---' : date.toLocaleDateString();
  };

  const barcodeValue = membership?.digital_card?.barcode_data || '';
  const hasValidBarcode = barcodeValue.length > 0;

  const handleShare = async () => {
    if (!cardRef.current?.capture) return;
    try {
      const uri = await cardRef.current.capture();
      if (!uri) return;
      await Sharing.shareAsync(uri, { dialogTitle: 'Share Membership Card' });
    } catch (error) {
      Alert.alert('Error', 'Could not share membership card');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!membership?.is_active) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
          <QrCodeIcon size={40} color="#9CA3AF" />
        </View>
        <Text className="text-xl font-semibold text-gray-800 mb-2">Membership Expired</Text>
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
      {/* <Stack initialRouteName={membership?.digital_card?.member_id} /> */}
      <SafeAreaView className="flex-1 p-5">
        <ViewShot ref={cardRef} options={{ format: 'png', quality: 0.9 }}>
          <View style={{ backgroundColor: '#2E7D32', borderRadius: 16, padding: 24 }}>
            {/* Card Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>AZIKE Member</Text>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                  {membership?.digital_card?.member_name || 'Member'}
                </Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }}>
                  {membership?.membership_tier || 'standard'}
                </Text>
              </View>
            </View>

            {/* Member ID */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 }}>Member ID</Text>
              <Text style={{ color: 'white', fontSize: 18, fontFamily: 'monospace', letterSpacing: 2 }}>
                {membership?.digital_card?.member_id || '---'}
              </Text>
            </View>

            {/* Barcode */}
            <View className="bg-white rounded-xl p-4 items-center min-h-[110px] justify-center">
  {hasValidBarcode ? (
    <View className="items-center w-full">
      <Barcode
        value={barcodeValue}
        type="barcode"
        format="CODE128"
        maxWidth={260}
        height={70}
        lineColor="#1B5E20"
        background="#ffffff"
        text={barcodeValue.slice(0, 30)}
        textStyle={{
          fontSize: 10,
          color: '#6B7280',
          marginTop: 8,
          fontFamily: 'monospace',
        }}
      />
    </View>
  ) : (
    <View className="h-[70px] justify-center">
      <ActivityIndicator size="small" color="#2E7D32" />
    </View>
  )}
</View>

            {/* Expiry Info */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Member Since</Text>
                <Text style={{ color: 'white', fontSize: 16 }}>
                  {formatDate(membership?.digital_card?.member_since)}
                </Text>
              </View>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Expires</Text>
                <Text style={{ color: 'white', fontSize: 16 }}>
                  {formatDate(membership?.current_period?.end_date)}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View style={{ position: 'absolute', top: 16, right: 16 }}>
              <View style={{ backgroundColor: 'rgba(76,175,80,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ color: 'white', fontSize: 12 }}>● Active</Text>
              </View>
            </View>
          </View>
        </ViewShot>

        {/* Actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <TouchableOpacity
            style={{ backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}
            onPress={handleShare}
          >
            <ShareIcon size={20} color="#2E7D32" />
            <Text style={{ color: '#2E7D32', marginLeft: 8, fontWeight: '500' }}>Share Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}
            onPress={() => refetch()}
          >
            <ArrowPathIcon size={20} color="#2E7D32" />
            <Text style={{ color: '#2E7D32', marginLeft: 8, fontWeight: '500' }}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Benefits */}
        <View style={{ marginTop: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>Your Benefits</Text>
          <View style={{ backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' }}>
            <BenefitItem
              title="Free Events Remaining"
              value={`${membership?.entitlements?.free_events_remaining || 0} of ${membership?.entitlements?.free_events_limit || 1}`}
            />
            <BenefitItem title="Member Discount" value="Up to 70% off events" />
            <BenefitItem title="Exclusive Access" value="Member-only events" />
            <BenefitItem
              title="Auto-Renewal"
              value={membership?.auto_renew_enabled ? 'Enabled' : 'Disabled'}
              action
              onPress={() => router.push('/membership/settings')}
            />
          </View>
        </View>
      </SafeAreaView>
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
      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#F3F4F6' }}
      onPress={onPress}
      disabled={!action}
    >
      <Text style={{ color: '#374151' }}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: '#111827', fontWeight: '500', marginRight: 8 }}>{value}</Text>
        {action && <Text style={{ color: '#2E7D32', fontSize: 20 }}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}