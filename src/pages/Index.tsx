import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AttendanceForm from '@/components/AttendanceForm';
import AttendanceReview from '@/components/AttendanceReview';
import Clock from '@/components/Clock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [fullName, setFullName] = useState('');
  const [reviews, setReviews] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found, redirecting to auth');
          navigate('/auth');
          return;
        }

        // Load profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setFullName(profile.full_name);
        }

        // Load attendance reviews
        const { data: reviewsData } = await supabase
          .from('attendance_review')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (reviewsData) {
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    };
    
    loadProfile();
  }, [navigate, toast]);

  const handleNameSubmit = async () => {
    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Mohon masukkan nama lengkap",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Anda harus login terlebih dahulu",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Nama berhasil disimpan",
      });
    } catch (error) {
      console.error('Error in handleNameSubmit:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan nama. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">GG Suspension</h1>
          <p className="mt-2 text-foreground/80">Sistem Absensi</p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Clock />
          </div>

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

          <AttendanceForm />

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Riwayat Kehadiran</h2>
            <AttendanceReview reviews={reviews} />
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('/history')}
            className="w-full"
          >
            <History className="w-4 h-4 mr-2" />
            Lihat Riwayat Absensi Lengkap
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;