import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "../../services/api";
import { useMembership } from "../../hooks/useMembership";
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon,
} from "react-native-heroicons/outline";
import { format } from "date-fns";

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

import { useEvent } from "../../hooks/useEvents";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading, refetch } = useEvent(id || "");
  const { membership } = useMembership();
  const { user } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [useFreeEntitlement, setUseFreeEntitlement] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");

  useEffect(() => {
    if (event?.pricing?.is_eligible_for_free) {
      setUseFreeEntitlement(true);
    }
  }, [event]);

  const fetchEvent = async () => {
    refetch();
  };

  const handlePurchase = async () => {
    if (!event) return;

    if (!useFreeEntitlement && event.pricing.your_price! > 0) {
      if (!phoneNumber || phoneNumber.trim() === "") {
        Alert.alert(
          "Phone Required",
          "Please enter your M-Pesa phone number to proceed.",
        );
        return;
      }
    }

    setPurchasing(true);
    try {
      const response = await api.post(`/tickets/events/${id}/purchase`, {
        use_free_entitlement: useFreeEntitlement,
        phone_number: phoneNumber || user?.phone_number,
      });

      const data = response.data.data;

      if (data.status === "pending_payment") {
        setShowCheckout(false);
        Alert.alert(
          "M-Pesa Payment",
          `Payment request sent to your phone. Please enter PIN.`,
          [
            {
              text: "OK",
              onPress: () => startPaymentPolling(data.transaction_id),
            },
          ],
        );
      } else {
        Alert.alert(
          "Success! 🎉",
          "Your ticket has been claimed successfully.",
          [
            {
              text: "View Ticket",
              onPress: () => router.push(`/tickets/${data.ticket_id}`),
            },
            {
              text: "OK",
              onPress: () => {
                setShowCheckout(false);
                fetchEvent();
              },
            },
          ],
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Booking Failed",
        error.response?.data?.message || "Could not complete booking",
      );
    } finally {
      setPurchasing(false);
    }
  };

  // const startPaymentPolling = (txId: string) => {
  //   let attempts = 0;
  //   const pollInterval = setInterval(async () => {
  //     try {
  //       const response = await api.get(`/payments/transaction/${txId}/status`);
  //       const { status } = response.data.data;

  //       if (status === 'completed') {
  //         clearInterval(pollInterval);
  //         Alert.alert('Payment Successful!', 'Your ticket has been confirmed.');
  //         fetchEvent();
  //         router.push('/tickets/my-tickets');
  //       } else if (status === 'failed') {
  //         clearInterval(pollInterval);
  //         Alert.alert('Payment Failed', 'Please try again.');
  //       }

  //       if (++attempts >= 20) {
  //         clearInterval(pollInterval);
  //       }
  //     } catch (error) {
  //       console.error('Polling error:', error);
  //     }
  //   }, 3000);
  // };

  const startPaymentPolling = (txId: string) => {
    let attempts = 0;
    const maxAttempts = 20; // 20 * 3 seconds = 60 seconds total

    const pollInterval = setInterval(async () => {
      attempts++; // Always increment, even on failure

      try {
        const response = await api.get(`/payments/transaction/${txId}/status`);
        const { status } = response.data.data;

        if (status === "completed") {
          clearInterval(pollInterval);
          Alert.alert("Payment Successful!", "Your ticket has been confirmed.");
          fetchEvent();
          router.push("/tickets/my-tickets");
          return;
        } else if (status === "failed") {
          clearInterval(pollInterval);
          Alert.alert("Payment Failed", "Please try again.");
          return;
        }
      } catch (error) {
        console.error("Polling error:", error);
        // Still continue, but the interval will stop after maxAttempts
      }

      // Stop after max attempts regardless of outcome
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        Alert.alert(
          "Payment Timeout",
          "We could not confirm your payment. Please check your transaction history later.",
        );
      }
    }, 3000);
  };

  if (isLoading) {
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

  const isBooked = event.user_booking_status === "booked";
  const isCheckedIn = event.user_booking_status === "checked_in";
  const canBook = event.capacity.is_available && !isBooked && !isCheckedIn;

  return (
    <>
      <ScrollView className="flex-1 bg-slate-50">
        {event.banner_image_url ? (
          <Image
            source={{ uri: event.banner_image_url }}
            className="w-full h-56"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full bg-primary/20 items-center justify-center h-56">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60",
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}

        <View className="px-5 pt-6 pb-24">
          <Text className="text-2xl font-extrabold text-slate-900 tracking-tight mb-5">
            {event.title}
          </Text>

          {/* Event Meta Details Card Layout */}
          <View className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 shadow-sm shadow-slate-100">
            <View className="flex-row items-center mb-4 pb-4 border-b border-slate-100">
              <View className="bg-slate-100 p-2 rounded-lg">
                <CalendarIcon size={18} color="#475569" />
              </View>
              <Text className="text-slate-700 font-semibold text-[15px] ml-3">
                {format(new Date(event.start_datetime), "EEEE, MMMM d, yyyy")}
              </Text>
            </View>

            <View className="flex-row items-center mb-4 pb-4 border-b border-slate-100">
              <View className="bg-slate-100 p-2 rounded-lg">
                <ClockIcon size={18} color="#475569" />
              </View>
              <Text className="text-slate-700 font-semibold text-[15px] ml-3">
                {format(new Date(event.start_datetime), "h:mm a")} -{" "}
                {format(new Date(event.end_datetime), "h:mm a")}
              </Text>
            </View>

            <View className="flex-row items-center mb-4 pb-4 border-b border-slate-100">
              <View className="bg-slate-100 p-2 rounded-lg">
                <MapPinIcon size={18} color="#475569" />
              </View>
              <Text
                className="text-slate-700 font-semibold text-[15px] ml-3 flex-1"
                numberOfLines={1}
              >
                {event.location}
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="bg-slate-100 p-2 rounded-lg">
                <UsersIcon size={18} color="#475569" />
              </View>
              <Text className="text-slate-700 font-semibold text-[15px] ml-3">
                {event.capacity.current_bookings} attending
                {event.capacity.max &&
                  ` • ${event.capacity.spots_remaining} spots left`}
              </Text>
            </View>
          </View>

          {/* Description Panel */}
          <View className="bg-white border border-slate-100 rounded-2xl p-5 mb-6 shadow-sm shadow-slate-100">
            <Text className="text-base font-bold text-slate-900 mb-2">
              About
            </Text>
            <Text className="text-slate-600 text-[15px] leading-relaxed">
              {event.description}
            </Text>
          </View>

          {event.registration_deadline && (
            <View className="bg-amber-50 border border-amber-200/60 rounded-xl p-3.5 mb-6">
              <Text className="text-amber-800 text-sm font-medium text-center">
                Registration closes on{" "}
                {format(new Date(event.registration_deadline), "MMM d, h:mm a")}
              </Text>
            </View>
          )}

          {isCheckedIn && (
            <View className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-4 mb-6">
              <View className="flex-row items-center justify-center">
                <CheckIcon size={20} color="#059669" />
                <Text className="text-emerald-800 font-semibold ml-2 text-sm">
                  You're checked in! Enjoy the event!
                </Text>
              </View>
            </View>
          )}

          {isBooked && (
            <TouchableOpacity
              className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 active:opacity-80"
              onPress={() => router.push("/tickets/my-tickets")}
            >
              <View className="flex-row items-center justify-center">
                <CheckIcon size={20} color="#2E7D32" />
                <Text className="text-primary font-bold ml-2 text-sm">
                  View Your Ticket →
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      {canBook && (
        <View className="absolute bottom-0 left-0 right-0 p-5 pb-6 border-t border-slate-100 bg-white/95 backdrop-blur-md flex-row justify-between items-center shadow-lg shadow-slate-200">
          <View>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
              Price
            </Text>
            {event.pricing.your_price === 0 ? (
              <Text className="text-2xl font-black text-emerald-600 tracking-tight">
                FREE
              </Text>
            ) : (
              <Text className="text-2xl font-black text-slate-900 tracking-tight">
                KES {event.pricing.your_price}
              </Text>
            )}
          </View>
          <TouchableOpacity
            className="bg-primary px-8 py-3.5 rounded-xl shadow-sm shadow-primary/20 active:opacity-90"
            onPress={() => setShowCheckout(true)}
          >
            <Text className="text-white font-bold tracking-wide text-base">
              Get Ticket
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Checkout Modal Sheet */}
      <Modal
        visible={showCheckout}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCheckout(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 pb-8 max-h-[85%] shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-extrabold text-slate-900">
                Checkout
              </Text>
              <TouchableOpacity
                className="p-1.5 bg-slate-100 rounded-full active:opacity-70"
                onPress={() => setShowCheckout(false)}
              >
                <XMarkIcon size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <Text
              className="font-bold text-slate-800 text-base mb-4"
              numberOfLines={1}
            >
              {event.title}
            </Text>

            {event.pricing.is_eligible_for_free && (
              <TouchableOpacity
                className={`flex-row items-center p-4 rounded-xl mb-4 border-2 ${
                  useFreeEntitlement
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 bg-white"
                }`}
                onPress={() => setUseFreeEntitlement(!useFreeEntitlement)}
              >
                <View
                  className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
                    useFreeEntitlement
                      ? "bg-primary border-primary"
                      : "border-slate-300"
                  }`}
                >
                  {useFreeEntitlement && <CheckIcon size={12} color="white" />}
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-800 text-sm">
                    Use Free Entitlement
                  </Text>
                  <Text className="text-slate-500 text-xs mt-0.5">
                    {event.pricing.free_entitlements_remaining} remaining this
                    year
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {!useFreeEntitlement && event.pricing.your_price! > 0 && (
              <View className="mb-4">
                <Text className="text-slate-700 text-sm font-semibold mb-2">
                  Phone Number (Optional)
                </Text>
                <TextInput
                  className="border border-slate-300 rounded-xl px-4 py-3.5 text-slate-800 text-base font-medium"
                  placeholder="2547XXXXXXXX"
                  placeholderTextColor="#94A3B8"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            <View className="border-t border-slate-200 pt-4 mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-500 text-sm font-medium">
                  Ticket Price
                </Text>
                <Text className="font-semibold text-slate-700">
                  KES {useFreeEntitlement ? 0 : event.pricing.your_price}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="font-bold text-slate-900 text-base">
                  Total
                </Text>
                <Text className="font-black text-primary text-lg">
                  KES {useFreeEntitlement ? 0 : event.pricing.your_price}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className={`py-4 rounded-xl shadow-sm flex-row justify-center items-center ${
                purchasing
                  ? "bg-slate-300"
                  : "bg-primary shadow-primary/20 active:opacity-95"
              }`}
              onPress={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold tracking-wide text-base">
                  {useFreeEntitlement ? "Claim Free Ticket" : "Pay with M-Pesa"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
