import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface AttendanceRecord {
  id: number;
  type: 'in' | 'out';
  timestamp: Date;
  location: string;
  image: string;
}

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
}

const AttendanceHistory = ({ records }: AttendanceHistoryProps) => {
  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {records.map((record) => (
          <div
            key={record.id}
            className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow"
          >
            <img
              src={record.image}
              alt="Attendance selfie"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  record.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {record.type === 'in' ? 'Clock In' : 'Clock Out'}
                </span>
                <time className="text-sm text-gray-500">
                  {new Intl.DateTimeFormat('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    dateStyle: 'medium',
                    timeStyle: 'medium'
                  }).format(record.timestamp)}
                </time>
              </div>
              <p className="mt-1 text-sm text-gray-600">{record.location}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default AttendanceHistory;