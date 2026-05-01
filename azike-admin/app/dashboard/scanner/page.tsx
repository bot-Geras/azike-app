// admin/app/dashboard/scanner/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, CameraIcon } from '@heroicons/react/24/outline';

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

export default function ScannerPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const audioRef = useRef<{ success: HTMLAudioElement; error: HTMLAudioElement }>();

  useEffect(() => {
    fetchEvents();

    // Initialize audio
    if (typeof window !== 'undefined') {
      audioRef.current = {
        success: new Audio('/sounds/success.mp3'),
        error: new Audio('/sounds/error.mp3')
      };
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events', { params: { status: 'upcoming' } });
      setEvents(response.data.data.events);
      if (response.data.data.events.length > 0) {
        setSelectedEvent(response.data.data.events[0].event_id);
      }
    } catch (error) {
      toast.error('Failed to load events');
    }
  };

  const playSound = (type: 'success' | 'error') => {
    try {
      audioRef.current?.[type].play().catch(() => {});
    } catch (error) {
      console.error('Sound error:', error);
    }
  };

  const handleScan = async (data: string | null) => {
    if (!data || !selectedEvent || scanning) return;

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
    }
  };

  const handleError = (error: any) => {
    setCameraError('Camera access denied or not available');
    console.error('Camera error:', error);
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanning(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Ticket Scanner</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <select
                value={selectedEvent}
                title="Select event for check-in"
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option key={event.event_id} value={event.event_id}>
                    {event.title} ({new Date(event.start_datetime).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {cameraError ? (
              <div className="p-8 text-center">
                <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{cameraError}</p>
              </div>
            ) : (
              <div className="aspect-square">
                <Scanner
                  onScan={(result) => {
                    if (result[0]) handleScan(result[0].rawValue);
                  }}
                  scanDelay={500}
                  onError={handleError}
                  constraints={{ facingMode: 'environment' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Result Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Scan Result</h2>

          {scanResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                {scanResult.success ? (
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-12 h-12 text-green-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircleIcon className="w-12 h-12 text-red-600" />
                  </div>
                )}
              </div>

              <h3 className={`text-xl font-bold text-center ${
                scanResult.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {scanResult.success ? 'Valid Ticket!' : 'Invalid Ticket'}
              </h3>

              <p className="text-gray-500 text-center">{scanResult.message}</p>

              {scanResult.success && scanResult.data && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Attendee</p>
                    <p className="font-medium">
                      {scanResult.data.attendee.first_name} {scanResult.data.attendee.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ticket Number</p>
                    <p className="font-mono">{scanResult.data.ticket_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ticket Type</p>
                    <p className="capitalize">{scanResult.data.ticket_type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Membership</p>
                    <p className="capitalize">{scanResult.data.attendee.membership_status}</p>
                  </div>
                </div>
              )}

              <button
                onClick={resetScanner}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90"
              >
                Scan Next Ticket
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CameraIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {selectedEvent 
                  ? 'Position QR code in front of camera'
                  : 'Select an event to start scanning'}
              </p>
            </div>
          )}

          {scanning && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="text-gray-500 mt-2">Verifying ticket...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}