
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../services/api';
import QRCode from 'react-native-qrcode-svg';
import { CalendarIcon, MapPinIcon, ClockIcon, TicketIcon, ShareIcon } from 'react-native-heroicons/outline';
import { format } from 'date-fns';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { useRef } from 'react';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<ViewShot>(null);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/tickets/my`);
      const foundTicket = response.data.data.tickets.find((t: any) => t.ticket_id === id);
      setTicket(foundTicket);
    } catch (error) {
      Alert.alert('Error', 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!qrRef.current?.capture) return;
    
    try {
      const uri = await qrRef.current.capture?.();
      if (!uri) return;
      await Sharing.shareAsync(uri, {
        dialogTitle: 'Share Ticket QR Code'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share ticket');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Ticket not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-5">
        <ViewShot ref={qrRef} options={{ format: 'png', quality: 0.9 }}>
          <View className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <View className="bg-primary p-5">
              <Text className="text-white text-xl font-bold text-center">
                {ticket.event.title}
              </Text>
            </View>
            
            <View className="p-5 items-center">
              <QRCode
                value={ticket.qr_code_data}
                size={250}
                color="#1B5E20"
                backgroundColor="white"
              />
              
              <Text className="text-gray-500 text-xs mt-2 font-mono">
                {ticket.ticket_number}
              </Text>
            </View>
            
            <View className="px-5 pb-5">
              <View className="border-t border-gray-200 pt-4">
                <View className="flex-row items-center mb-3">
                  <CalendarIcon size={18} color="#6B7280" />
                  <Text className="text-gray-700 ml-3">
                    {format(new Date(ticket.event.start_datetime), 'EEEE, MMMM d, yyyy')}
                  </Text>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <ClockIcon size={18} color="#6B7280" />
                  <Text className="text-gray-700 ml-3">
                    {format(new Date(ticket.event.start_datetime), 'h:mm a')}
                  </Text>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <MapPinIcon size={18} color="#6B7280" />
                  <Text className="text-gray-700 ml-3">{ticket.event.location}</Text>
                </View>
                
                <View className="flex-row items-center">
                  <TicketIcon size={18} color="#6B7280" />
                  <Text className="text-gray-700 ml-3 capitalize">
                    {ticket.ticket_type.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ViewShot>

        <TouchableOpacity
          className="bg-primary rounded-lg py-4 mt-6 flex-row items-center justify-center"
          onPress={handleShare}
        >
          <ShareIcon size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Share Ticket</Text>
        </TouchableOpacity>

        {ticket.is_checked_in ? (
          <View className="bg-success/10 rounded-lg p-4 mt-4">
            <Text className="text-success text-center font-medium">
              ✓ Checked in at {format(new Date(ticket.checked_in_at), 'h:mm a')}
            </Text>
          </View>
        ) : (
          <View className="bg-warning/10 rounded-lg p-4 mt-4">
            <Text className="text-warning text-center">
              Show this QR code at the event entrance
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}