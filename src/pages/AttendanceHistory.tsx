import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import AttendanceHistoryComponent from '@/components/AttendanceHistory';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AttendanceHistory = () => {
  const navigate = useNavigate();
  
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['attendance-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      return data.map(record => ({
        id: record.id,
        type: record.type as 'in' | 'out',
        timestamp: new Date(record.timestamp),
        location: record.location,
        image: record.image_url,
        isLate: record.is_late
      }));
    }
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-primary">Riwayat Absensi</h1>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Memuat riwayat absensi...</div>
        ) : (
          <div className="bg-card rounded-lg shadow-lg p-6">
            <AttendanceHistoryComponent records={records} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;