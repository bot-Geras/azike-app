
import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { CheckIcon, XMarkIcon, UserIcon } from 'react-native-heroicons/outline';
import { useAudioPlayer } from 'expo-audio';

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    ticket_id: string;
    ticket_number: string;
    attendee: {
      first_name: string;
      last_name: string;
      membership_status: string;
    };
    ticket_type: string;
    event_title: string;
  };
}

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const successPlayer = useAudioPlayer(require('../../assets/sounds/success.mp3'));
  const errorPlayer = useAudioPlayer(require('../../assets/sounds/error.mp3'));

  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events', { params: { status: 'upcoming' } });
      setEvents(response.data.data.events);
      if (response.data.data.events.length > 0) {
        setSelectedEvent(response.data.data.events[0].event_id);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const playSound = (type: 'success' | 'error') => {
    const player = type === 'success' ? successPlayer : errorPlayer;
    player.seekTo(0);
    player.play();
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!selectedEvent) {
      Alert.alert('Error', 'Please select an event first');
      return;
    }

    setScanned(true);
    setScanning(true);

    try {
      const response = await api.post('/checkin/scan', {
        qr_data: data,
        event_id: selectedEvent
      });

      playSound('success');
      setScanResult({
        success: true,
        message: 'Check-in successful!',
        data: response.data.data
      });
    } catch (error: any) {
      playSound('error');
      setScanResult({
        success: false,
        message: error.response?.data?.message || 'Invalid ticket'
      });
    } finally {
      setScanning(false);
      setShowResult(true);
    }
  };

  const handleContinue = () => {
    setShowResult(false);
    setScanResult(null);
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-black justify-center items-center p-5">
        <Text className="text-white text-center mb-4">
          Camera access is required to scan tickets
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-lg"
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text className="text-white">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedEventDetails = events.find(e => e.event_id === selectedEvent);

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr']
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View className="flex-1">
          {/* Header */}
          <View className="bg-black/50 p-5 pt-12">
            <Text className="text-white text-xl font-bold">Ticket Scanner</Text>
            
            <TouchableOpacity
              className="bg-white/20 rounded-lg px-4 py-2 mt-3 flex-row items-center justify-between"
              onPress={() => setShowEventPicker(true)}
            >
              <Text className="text-white">
                {selectedEventDetails?.title || 'Select Event'}
              </Text>
              <Text className="text-white">▼</Text>
            </TouchableOpacity>
          </View>

          {/* Scanner Overlay */}
          <View className="flex-1 items-center justify-center">
            <View className="w-64 h-64 border-2 border-white rounded-lg opacity-50" />
            <Text className="text-white mt-4 text-center px-5">
              Align the QR code within the frame
            </Text>
          </View>

          {/* Footer */}
          <View className="bg-black/50 p-5">
            {scanned && scanning && (
              <View className="items-center">
                <ActivityIndicator size="large" color="white" />
                <Text className="text-white mt-2">Verifying...</Text>
              </View>
            )}
          </View>
        </View>
      </CameraView>

      {/* Event Picker Modal */}
      <Modal
        visible={showEventPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEventPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-4">Select Event</Text>
            
            {events.map((event) => (
              <TouchableOpacity
                key={event.event_id}
                className={`p-4 rounded-lg mb-2 ${
                  selectedEvent === event.event_id ? 'bg-primary/10' : 'bg-gray-50'
                }`}
                onPress={() => {
                  setSelectedEvent(event.event_id);
                  setShowEventPicker(false);
                }}
              >
                <Text className="font-medium">{event.title}</Text>
                <Text className="text-gray-500 text-sm">
                  {new Date(event.start_datetime).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              className="bg-gray-200 rounded-lg py-3 mt-4"
              onPress={() => setShowEventPicker(false)}
            >
              <Text className="text-center font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scan Result Modal */}
      <Modal
        visible={showResult}
        animationType="fade"
        transparent
        onRequestClose={handleContinue}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              {scanResult?.success ? (
                <View className="w-16 h-16 bg-success rounded-full items-center justify-center">
                  <CheckIcon size={32} color="white" />
                </View>
              ) : (
                <View className="w-16 h-16 bg-error rounded-full items-center justify-center">
                  <XMarkIcon size={32} color="white" />
                </View>
              )}
            </View>
            
            <Text className={`text-xl font-bold text-center mb-2 ${
              scanResult?.success ? 'text-success' : 'text-error'
            }`}>
              {scanResult?.success ? 'Valid Ticket!' : 'Invalid Ticket'}
            </Text>
            
            {scanResult?.success && scanResult.data && (
              <View className="bg-gray-50 rounded-lg p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <UserIcon size={16} color="#6B7280" />
                  <Text className="text-gray-800 ml-2 font-medium">
                    {scanResult.data.attendee.first_name} {scanResult.data.attendee.last_name}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm">
                  Ticket #{scanResult.data.ticket_number}
                </Text>
                <Text className="text-gray-500 text-sm capitalize">
                  {scanResult.data.ticket_type.replace(/_/g, ' ')}
                </Text>
              </View>
            )}
            
            {!scanResult?.success && (
              <Text className="text-gray-500 text-center mb-4">
                {scanResult?.message}
              </Text>
            )}
            
            <TouchableOpacity
              className={`py-3 rounded-lg ${
                scanResult?.success ? 'bg-primary' : 'bg-gray-400'
              }`}
              onPress={handleContinue}
            >
              <Text className="text-white text-center font-semibold">
                Continue Scanning
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}