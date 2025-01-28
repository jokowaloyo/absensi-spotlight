import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

const Location = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          
          // Get address using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setLocation(prev => ({
              ...prev!,
              address: data.display_name
            }));
          } catch (err) {
            console.error("Error fetching address:", err);
          }
        },
        (err) => {
          setError("Unable to retrieve your location");
          console.error(err);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <MapPin className="w-4 h-4" />
      {location ? (
        <span className="truncate max-w-[300px]">
          {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
        </span>
      ) : (
        <span>Getting location...</span>
      )}
    </div>
  );
};

export default Location;