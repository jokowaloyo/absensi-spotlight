import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Camera from './Camera';
import Location from './Location';
import { supabase } from "@/integrations/supabase/client";
import { LogIn, LogOut } from 'lucide-react';

const AttendanceForm = () => {
  const [selfieImage, setSelfieImage] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCapture = (image: string) => {
    setSelfieImage(image);
  };

  const handleLocationUpdate = (address: string) => {
    setLocation(address);
  };

  const handleSubmit = async (type: 'in' | 'out') => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Anda harus login terlebih dahulu",
          variant: "destructive",
        });
        return;
      }

      if (!selfieImage || !location) {
        toast({
          title: "Error",
          description: "Mohon lengkapi foto dan lokasi",
          variant: "destructive",
        });
        return;
      }

      // Get existing review or create new one
      const { data: existingReview } = await supabase
        .from('attendance_review')
        .select('*')
        .eq('user_id', user.id)
        .is('jam_keluar', null)
        .single();

      if (type === 'in' && existingReview) {
        toast({
          title: "Error",
          description: "Anda sudah melakukan check in",
          variant: "destructive",
        });
        return;
      }

      if (type === 'out' && !existingReview) {
        toast({
          title: "Error",
          description: "Anda belum melakukan check in",
          variant: "destructive",
        });
        return;
      }

      if (type === 'in') {
        const { error } = await supabase
          .from('attendance_review')
          .insert({
            user_id: user.id,
            nama: user.email,
            jam_masuk: new Date().toISOString(),
            foto_masuk: selfieImage,
            lokasi_masuk: location,
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance_review')
          .update({
            jam_keluar: new Date().toISOString(),
            foto_keluar: selfieImage,
            lokasi_keluar: location,
          })
          .eq('id', existingReview.id);

        if (error) throw error;
      }

      toast({
        title: "Sukses",
        description: `Berhasil melakukan check ${type === 'in' ? 'in' : 'out'}`,
      });

      setSelfieImage('');
      setLocation('');
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Camera onCapture={handleCapture} />
        {selfieImage && (
          <img
            src={selfieImage}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
        )}
        <Location onLocationUpdate={handleLocationUpdate} />
      </div>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => handleSubmit('in')}
          disabled={isSubmitting}
          className="w-32"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Check In
        </Button>
        <Button
          onClick={() => handleSubmit('out')}
          disabled={isSubmitting}
          className="w-32"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Check Out
        </Button>
      </div>
    </div>
  );
};

export default AttendanceForm;