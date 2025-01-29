import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Camera from '@/components/Camera';
import Location from '@/components/Location';
import Clock from '@/components/Clock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, LogOut, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [selfieImage, setSelfieImage] = useState<string>('');
  const [isClockingIn, setIsClockingIn] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setFullName(profile.full_name);
        }
      }
    };
    
    loadProfile();
  }, []);

  const handleCapture = (image: string) => {
    setSelfieImage(image);
  };

  const handleLocationUpdate = (address: string) => {
    setCurrentLocation(address);
  };

  const checkAttendanceTime = (type: 'in' | 'out', currentTime: Date): boolean => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    if (type === 'in') {
      return timeInMinutes > (8 * 60);
    } else {
      return timeInMinutes < (17 * 60);
    }
  };

  const handleNameSubmit = async () => {
    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Mohon masukkan nama lengkap",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        full_name: fullName.trim(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan nama",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sukses",
      description: "Nama berhasil disimpan",
    });
  };

  const handleAttendance = async () => {
    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Mohon masukkan nama lengkap terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!selfieImage) {
      toast({
        title: "Error",
        description: "Mohon ambil foto selfie terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!currentLocation) {
      toast({
        title: "Error",
        description: "Menunggu informasi lokasi",
        variant: "destructive",
      });
      return;
    }

    const currentTime = new Date();
    const isLate = checkAttendanceTime(isClockingIn ? 'in' : 'out', currentTime);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('attendance_records')
      .insert({
        user_id: user.id,
        type: isClockingIn ? 'in' : 'out',
        timestamp: currentTime.toISOString(),
        location: currentLocation,
        image_url: selfieImage,
        is_late: isLate
      });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal mencatat absensi",
        variant: "destructive",
      });
      return;
    }

    setSelfieImage('');
    setIsClockingIn(!isClockingIn);

    const attendanceStatus = isClockingIn ? 'Absensi Masuk' : 'Absensi Keluar';
    const lateMessage = isLate ? 
      (isClockingIn ? ' - Terlambat (Setelah jam 08:00 WIB)' : ' - Terlalu Awal (Sebelum jam 17:00 WIB)') 
      : '';

    toast({
      title: `${attendanceStatus} Berhasil${lateMessage}`,
      description: `Absensi tercatat pada ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">GG Suspension</h1>
          <p className="mt-2 text-foreground/80">Sistem Absensi</p>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center">
              <Clock />
              <Location onLocationUpdate={handleLocationUpdate} />
            </div>

            {/* Name Input */}
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleNameSubmit}>
                Simpan Nama
              </Button>
            </div>

            {/* Clock In/Out Menu */}
            <div className="flex gap-4 justify-center mb-6">
              <Button
                variant={isClockingIn ? "default" : "secondary"}
                className={`w-40 ${isClockingIn ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setIsClockingIn(true)}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Absensi Masuk
              </Button>
              <Button
                variant={!isClockingIn ? "default" : "secondary"}
                className={`w-40 ${!isClockingIn ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setIsClockingIn(false)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Absensi Keluar
              </Button>
            </div>

            <div className="border-t border-b border-border py-6">
              <Camera onCapture={handleCapture} />
              {selfieImage && (
                <div className="mt-4">
                  <img
                    src={selfieImage}
                    alt="Captured selfie"
                    className="w-48 h-48 mx-auto rounded-lg object-cover border-2 border-primary"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleAttendance}
              className="w-full"
            >
              {isClockingIn ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Absensi Masuk
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Absensi Keluar
                </>
              )}
            </Button>

            {/* History Button */}
            <Button
              variant="outline"
              onClick={() => navigate('/history')}
              className="w-full"
            >
              <History className="w-4 h-4 mr-2" />
              Lihat Riwayat Absensi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;