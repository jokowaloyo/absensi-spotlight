import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';

interface AttendanceReviewProps {
  reviews: {
    nama: string;
    jam_masuk: Date;
    jam_keluar?: Date;
    foto_masuk: string;
    foto_keluar?: string;
    lokasi_masuk: string;
    lokasi_keluar?: string;
  }[];
}

const AttendanceReview = ({ reviews }: AttendanceReviewProps) => {
  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div key={index} className="bg-card rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-lg mb-4">{review.nama}</h3>
            
            {/* Check In Details */}
            <div className="mb-4">
              <h4 className="font-medium text-primary mb-2">Check In</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img 
                    src={review.foto_masuk} 
                    alt="Check in photo" 
                    className="rounded-lg w-full h-48 object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {format(new Date(review.jam_masuk), 'dd MMM yyyy HH:mm')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {review.lokasi_masuk}
                  </div>
                </div>
              </div>
            </div>

            {/* Check Out Details */}
            {review.jam_keluar && (
              <div>
                <h4 className="font-medium text-primary mb-2">Check Out</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {review.foto_keluar && (
                      <img 
                        src={review.foto_keluar} 
                        alt="Check out photo" 
                        className="rounded-lg w-full h-48 object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {format(new Date(review.jam_keluar), 'dd MMM yyyy HH:mm')}
                    </div>
                    {review.lokasi_keluar && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {review.lokasi_keluar}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default AttendanceReview;