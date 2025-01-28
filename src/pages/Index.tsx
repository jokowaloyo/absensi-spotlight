import React, { useState } from 'react';
import Camera from '@/components/Camera';
import Location from '@/components/Location';
import Clock from '@/components/Clock';
import AttendanceHistory from '@/components/AttendanceHistory';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AttendanceRecord {
  id: number;
  type: 'in' | 'out';
  timestamp: Date;
  location: string;
  image: string;
}

const Index = () => {
  const [selfieImage, setSelfieImage] = useState<string>('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isClockingIn, setIsClockingIn] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const { toast } = useToast();

  const handleCapture = (image: string) => {
    setSelfieImage(image);
  };

  const handleLocationUpdate = (address: string) => {
    setCurrentLocation(address);
  };

  const handleAttendance = () => {
    if (!selfieImage) {
      toast({
        title: "Error",
        description: "Please take a selfie first",
        variant: "destructive",
      });
      return;
    }

    if (!currentLocation) {
      toast({
        title: "Error",
        description: "Waiting for location information",
        variant: "destructive",
      });
      return;
    }

    const newRecord: AttendanceRecord = {
      id: Date.now(),
      type: isClockingIn ? 'in' : 'out',
      timestamp: new Date(),
      location: currentLocation,
      image: selfieImage,
    };

    setRecords([newRecord, ...records]);
    setSelfieImage('');
    setIsClockingIn(!isClockingIn);

    toast({
      title: `Successfully ${isClockingIn ? 'Clocked In' : 'Clocked Out'}`,
      description: `Attendance recorded at ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GG Suspension</h1>
          <p className="mt-2 text-gray-600">Attendance System</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center">
              <Clock />
              <Location onLocationUpdate={handleLocationUpdate} />
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <Camera onCapture={handleCapture} />
              {selfieImage && (
                <div className="mt-4">
                  <img
                    src={selfieImage}
                    alt="Captured selfie"
                    className="w-48 h-48 mx-auto rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleAttendance}
              className={`w-full ${
                isClockingIn ? 'bg-primary hover:bg-primary/90' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isClockingIn ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Clock In
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Clock Out
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Attendance History</h2>
          <AttendanceHistory records={records} />
        </div>
      </div>
    </div>
  );
};

export default Index;