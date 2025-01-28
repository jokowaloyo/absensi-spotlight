import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera as CameraIcon } from 'lucide-react';

interface CameraProps {
  onCapture: (image: string) => void;
}

const Camera = ({ onCapture }: CameraProps) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full rounded-lg"
      />
      <Button 
        onClick={capture}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
      >
        <CameraIcon className="w-4 h-4 mr-2" />
        Capture
      </Button>
    </div>
  );
};

export default Camera;