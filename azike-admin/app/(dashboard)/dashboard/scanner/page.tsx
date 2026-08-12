'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { QrReader } from 'react-qr-reader';

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
  const [selectedEvent, setSelectedEvent] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const successSound = useRef<HTMLAudioElement | null>(null);
  const errorSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchEvents();
    successSound.current = new Audio('/sounds/success.mp3');
    errorSound.current = new Audio('/sounds/error.mp3');
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events?status=upcoming');
      const data = await res.json();
      if (data.success) {
        const upcoming = data.data.events?.filter((e: any) => e.status === 'published') || [];
        setEvents(upcoming);
        if (upcoming.length > 0) {
          setSelectedEvent(upcoming[0].id);
        }
      }
    } catch (error) {
      toast.error('Failed to load events');
    }
  };

  const handleScan = useCallback(
    async (result: any) => {
      if (!result || !selectedEvent || scanning) return;

      const qrData = result.getText();
      setScanning(true);

      try {
        const res = await fetch('/api/admin/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qr_data: qrData,
            event_id: selectedEvent,
          }),
        });

        const data = await res.json();

        if (data.success) {
          successSound.current?.play().catch(() => {});
          setScanResult({ success: true, message: 'Check-in successful!', data: data.data });
        } else {
          errorSound.current?.play().catch(() => {});
          setScanResult({ success: false, message: data.message || 'Invalid ticket' });
        }
      } catch (error) {
        errorSound.current?.play().catch(() => {});
        setScanResult({ success: false, message: 'Failed to verify ticket' });
      } finally {
        setScanning(false);
      }
    },
    [selectedEvent, scanning]
  );

  const handleError = useCallback((error: any) => {
    console.error('Scanner error:', error);
  }, []);

  const resetScanner = () => {
    setScanResult(null);
  };

  const selectedEventDetails = events.find((e) => e.id === selectedEvent);

  return (
    <div className="p-6 lg:p-8">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Scanner</h1>
          <p className="text-gray-600 mt-1">Scan QR codes at event entrance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <select
                value={selectedEvent}
                onChange={(e) => {
                  setSelectedEvent(e.target.value);
                  setScanResult(null);
                }}
                className="w-full"
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({new Date(event.start_datetime).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
            <div className="aspect-square bg-gray-900">
              {selectedEvent ? (
                <QrReader
                  onResult={handleScan}
                  constraints={{ facingMode: 'environment' }}
                  containerStyle={{ width: '100%', height: '100%' }}
                  videoStyle={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <p>Select an event to start scanning</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Scan Result</h2>
          </div>
          <div className="card-body">
            {scanResult ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  {scanResult.success ? (
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>

                <h3 className={`text-xl font-bold ${scanResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {scanResult.success ? 'Valid Ticket!' : 'Invalid Ticket'}
                </h3>
                <p className="text-gray-500">{scanResult.message}</p>

                {scanResult.success && scanResult.data && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 mt-4">
                    <div>
                      <p className="text-xs text-gray-500">Attendee</p>
                      <p className="font-medium">
                        {scanResult.data.attendee.first_name} {scanResult.data.attendee.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ticket Number</p>
                      <p className="font-mono text-sm">{scanResult.data.ticket_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ticket Type</p>
                      <p className="capitalize">{scanResult.data.ticket_type.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Event</p>
                      <p>{scanResult.data.event_title}</p>
                    </div>
                  </div>
                )}

                <button onClick={resetScanner} className="btn-primary w-full mt-4">
                  Scan Next Ticket
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" />
                </svg>
                <p className="text-gray-500">
                  {selectedEvent
                    ? 'Position QR code in front of camera'
                    : 'Select an event to start scanning'}
                </p>
              </div>
            )}

            {scanning && (
              <div className="text-center mt-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" />
                <p className="text-gray-500 text-sm mt-2">Verifying...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}