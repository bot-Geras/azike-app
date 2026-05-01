
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../services/api';
import { useMembership } from '../../hooks/useMembership';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon
} from 'react-native-heroicons/outline';
import { format } from 'date-fns';

interface EventDetails {
  event_id: string;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  registration_deadline: string | null;
  banner_image_url: string | null;
  pricing: {
    member_price: number;
    non_member_price: number;
    your_price: number | null;
    is_eligible_for_free: boolean;
    free_entitlements_remaining: number;
  };
  capacity: {
    max: number | null;
    current_bookings: number;
    is_available: boolean;
    spots_remaining: number | null;
  };
  user_booking_status: string | null;
  is_members_only: boolean;
}

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [useFreeEntitlement, setUseFreeEntitlement] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const { membership } = useMembership();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.data);
      if (response.data.data.pricing.is_eligible_for_free) {
        setUseFreeEntitlement(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!event) return;

    setPurchasing(true);
    try {
      const response = await api.post(`/tickets/events/${id}/purchase`, {
        use_free_entitlement: useFreeEntitlement,
        phone_number: phoneNumber || undefined
      });

      const data = response.data.data;

      if (data.status === 'pending_payment') {
        setShowCheckout(false);
        Alert.alert(
          'M-Pesa Payment',
          `Payment request sent to your phone. Please enter PIN.`,
          [
            { 
              text: 'OK', 
              onPress: () => startPaymentPolling(data.transaction_id) 
            }
          ]
        );
      } else {
        Alert.alert(
          'Success! 🎉',
          'Your ticket has been claimed successfully.',
          [
            { 
              text: 'View Ticket', 
              onPress: () => router.push(`/tickets/${data.ticket_id}`) 
            },
            { 
              text: 'OK', 
              onPress: () => {
                setShowCheckout(false);
                fetchEvent();
              }
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Booking Failed',
        error.response?.data?.message || 'Could not complete booking'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const startPaymentPolling = (txId: string) => {
    let attempts = 0;
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/payments/transaction/${txId}/status`);
        const { status } = response.data.data;

        if (status === 'completed') {
          clearInterval(pollInterval);
          Alert.alert('Payment Successful!', 'Your ticket has been confirmed.');
          fetchEvent();
          router.push('/tickets/my-tickets');
        } else if (status === 'failed') {
          clearInterval(pollInterval);
          Alert.alert('Payment Failed', 'Please try again.');
        }

        if (++attempts >= 20) {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Event not found</Text>
      </View>
    );
  }

  const isBooked = event.user_booking_status === 'booked';
  const isCheckedIn = event.user_booking_status === 'checked_in';
  const canBook = event.capacity.is_available && !isBooked && !isCheckedIn;

  return (
    <>
      <ScrollView className="flex-1 bg-white">
        {event.banner_image_url ? (
          <Image
            source={{ uri: event.banner_image_url }}
            className="w-full h-56"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-56 bg-primary/20 items-center justify-center">
            <CalendarIcon size={64} color="#2E7D32" />
          </View>
        )}

        <View className="p-5">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {event.title}
          </Text>

          <View className="flex-row items-center mb-4">
            <CalendarIcon size={18} color="#6B7280" />
            <Text className="text-gray-600 ml-2">
              {format(new Date(event.start_datetime), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>

          <View className="flex-row items-center mb-4">
            <ClockIcon size={18} color="#6B7280" />
            <Text className="text-gray-600 ml-2">
              {format(new Date(event.start_datetime), 'h:mm a')} - {' '}
              {format(new Date(event.end_datetime), 'h:mm a')}
            </Text>
          </View>

          <View className="flex-row items-center mb-4">
            <MapPinIcon size={18} color="#6B7280" />
            <Text className="text-gray-600 ml-2">{event.location}</Text>
          </View>

          <View className="flex-row items-center mb-6">
            <UsersIcon size={18} color="#6B7280" />
            <Text className="text-gray-600 ml-2">
              {event.capacity.current_bookings} attending
              {event.capacity.max && ` • ${event.capacity.spots_remaining} spots left`}
            </Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="font-semibold text-gray-800 mb-2">About</Text>
            <Text className="text-gray-600 leading-relaxed">
              {event.description}
            </Text>
          </View>

          {event.registration_deadline && (
            <View className="bg-warning/10 rounded-lg p-3 mb-6">
              <Text className="text-warning text-sm text-center">
                Registration closes on {' '}
                {format(new Date(event.registration_deadline), 'MMM d, h:mm a')}
              </Text>
            </View>
          )}

          {isCheckedIn && (
            <View className="bg-success/10 rounded-lg p-4 mb-6">
              <View className="flex-row items-center justify-center">
                <CheckIcon size={20} color="#4CAF50" />
                <Text className="text-success font-semibold ml-2">
                  You're checked in! Enjoy the event!
                </Text>
              </View>
            </View>
          )}

          {isBooked && (
            <TouchableOpacity
              className="bg-primary/10 rounded-lg p-4 mb-6"
              onPress={() => router.push('/tickets/my-tickets')}
            >
              <View className="flex-row items-center justify-center">
                <CheckIcon size={20} color="#2E7D32" />
                <Text className="text-primary font-semibold ml-2">
                  View Your Ticket →
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {canBook && (
        <View className="p-5 border-t border-gray-200 bg-white">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-gray-500 text-sm">Price</Text>
              {event.pricing.your_price === 0 ? (
                <Text className="text-2xl font-bold text-success">FREE</Text>
              ) : (
                <Text className="text-2xl font-bold text-gray-800">
                  KES {event.pricing.your_price}
                </Text>
              )}
            </View>
            <TouchableOpacity
              className="bg-primary px-8 py-3 rounded-lg"
              onPress={() => setShowCheckout(true)}
            >
              <Text className="text-white font-semibold">Get Ticket</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={showCheckout}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCheckout(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Checkout</Text>
              <TouchableOpacity onPress={() => setShowCheckout(false)}>
                <XMarkIcon size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="font-semibold mb-2">{event.title}</Text>
            
            {event.pricing.is_eligible_for_free && (
              <TouchableOpacity
                className={`flex-row items-center p-4 rounded-lg mb-4 border ${
                  useFreeEntitlement ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
                onPress={() => setUseFreeEntitlement(!useFreeEntitlement)}
              >
                <View className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
                  useFreeEntitlement ? 'bg-primary border-primary' : 'border-gray-300'
                }`}>
                  {useFreeEntitlement && <CheckIcon size={12} color="white" />}
                </View>
                <View className="flex-1">
                  <Text className="font-medium">Use Free Entitlement</Text>
                  <Text className="text-gray-500 text-sm">
                    {event.pricing.free_entitlements_remaining} remaining this year
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {!useFreeEntitlement && event.pricing.your_price! > 0 && (
              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Phone Number (Optional)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="2547XXXXXXXX"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            <View className="border-t border-gray-200 pt-4 mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Ticket Price</Text>
                <Text className="font-medium">
                  KES {useFreeEntitlement ? 0 : event.pricing.your_price}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="font-semibold">Total</Text>
                <Text className="font-bold text-primary">
                  KES {useFreeEntitlement ? 0 : event.pricing.your_price}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className={`py-4 rounded-lg ${
                purchasing ? 'bg-gray-400' : 'bg-primary'
              }`}
              onPress={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  {useFreeEntitlement ? 'Claim Free Ticket' : 'Pay with M-Pesa'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}