import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload as UploadIcon, ImagePlus, RefreshCw, X, Zap, ZapOff } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (imageData: string | File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);  const videoRef = useRef<HTMLVideoElement>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraLoading, setIsCameraLoading] = useState(false); // Add loading state
  const [isTorchSupported, setIsTorchSupported] = useState(false); // Add torch support state
  const [isTorchOn, setIsTorchOn] = useState(false); // Add torch on/off state

  // Effect to handle starting/stopping the camera stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    const videoElement = videoRef.current; // Capture ref value

    const setupStream = async () => {
      if (!showCamera || !videoElement) {
        return; // Don't start if not showing or video element not ready
      }

      setIsCameraLoading(true); // Indicate loading
      console.log(`useEffect: Attempting to start camera with mode: ${facingMode}`);

      // Stop any previous stream first
      if (stream) {
        console.log("useEffect: Stopping previous stream.");
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode }
        });

        // Check for torch support
        const [track] = currentStream.getVideoTracks();
        const capabilities = track.getCapabilities();

        if ('torch' in capabilities) {
          setIsTorchSupported(true);
        } else {
          setIsTorchSupported(false);
        }
        setStream(currentStream); // Store the new stream
        console.log("useEffect: Got stream successfully.");

        videoElement.srcObject = currentStream;

        // Reset event listener before adding
        videoElement.onloadedmetadata = null; 
        videoElement.onloadedmetadata = async () => {
          if (videoRef.current) { // Use ref directly inside async callback
            console.log("useEffect: onloadedmetadata triggered.");
            try {
              await videoRef.current.play();
              console.log("useEffect: Play successful via onloadedmetadata.");
              setIsCameraLoading(false); // Stop loading indicator
            } catch (playError) {
              console.error("useEffect: Error attempting to play video via onloadedmetadata:", playError);
              setIsCameraLoading(false);
            }
          }
        };
        
        // Also try immediate play
        try {
           await videoElement.play();
           console.log("useEffect: Immediate play successful.");
           setIsCameraLoading(false); // Stop loading indicator if immediate play works
        } catch (immediatePlayError) {
           console.warn("useEffect: Immediate play failed, relying on onloadedmetadata.", immediatePlayError);
           // Don't set loading false here, wait for onloadedmetadata
        }

      } catch (err) {
        console.error('useEffect: Error accessing camera:', err);
        alert('Unable to access camera. Please make sure you have granted camera permissions.');
        setShowCamera(false); // Hide camera view on error
        setIsCameraLoading(false);
      }
    };

    setupStream();

    // Cleanup function
    return () => {
      console.log("useEffect cleanup: Stopping stream.");
      setIsCameraLoading(false); // Ensure loading is off on cleanup
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) {
         videoElement.srcObject = null; // Clear srcObject
         videoElement.onloadedmetadata = null; // Remove listener
      }
       // Also clear state stream if it matches the one we set up
       setStream(prevStream => {
         if (prevStream === currentStream) {
           return null;
         }
         return prevStream;
       });
    };
  }, [showCamera, facingMode]);

  const toggleTorch = useCallback(async () => {
    if (stream) {
      const [track] = stream.getVideoTracks();
      if (track && track.getCapabilities().torch) {
        try {
          if (track.getSettings().torch) {
            await track.applyConstraints({
              advanced: [{ torch: false }],
            });
          } else {
            await track.applyConstraints({
              advanced: [{ torch: true }],
            });
          }

          setIsTorchOn((prevTorchState) => !prevTorchState);
          
        } catch (err) {
          console.error('Error toggling torch:', err);
          alert('Unable to toggle torch.');
        }
      } else {
        alert('Torch is not supported.');
      }
    }
  }, [stream]);


  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      onImageSelected(file);
    } else {
      alert('Please upload an image file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleStartCameraClick = useCallback(() => {
    setFacingMode('environment'); // Ensure default is environment
    setShowCamera(true); // Trigger the useEffect
  }, []);

  const stopCamera = useCallback(() => {
    setShowCamera(false); // Trigger the useEffect cleanup
  }, []);

  const toggleCamera = useCallback(() => {
    // Just change the facing mode, useEffect will handle the stream restart
    setFacingMode(prevMode => prevMode === 'environment' ? 'user' : 'environment');
  }, []);

  const capturePhoto = () => {
    if (videoRef.current) {
      if (videoRef.current.readyState < videoRef.current.HAVE_METADATA) {
         console.error("Capture attempted before video metadata loaded.");
         alert("Camera is not ready yet. Please wait a moment.");
         return;
      }
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        console.error("Video dimensions are not available yet for capture.");
        alert("Camera is not ready yet, please wait a moment and try again.");
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Flip image horizontally if using front camera ('user' mode)
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        onImageSelected(imageData);
        stopCamera(); // This will trigger useEffect cleanup
      } else {
        console.error("Failed to get 2D context from canvas.");
        alert("Failed to capture photo. Could not process image.");
      }
    } else {
      console.error("Video reference not available for capture.");
      alert("Failed to capture photo. Camera not available.");
    }
  };

  return (
    // Remove px-6, padding is handled by parent in App.tsx now
    <div className="flex flex-col items-center space-y-6"> 
      {/* User Profile Section - Use new colors */}
      <div className="flex items-center space-x-4 w-full mb-6"> 
        {/* Use primary color subtle background */}
        <div className="w-16 h-16 rounded-full bg-primary/10 overflow-hidden border-2 border-primary/20"> 
          <img
            src="https://i.pinimg.com/736x/75/e4/0a/75e40ab9dc9197c1f7fc3cd06bb5e941.jpg"
            alt="Guest"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
           {/* Apply heading font and secondary color */}
          <h2 className="text-xl font-heading font-semibold text-secondary">Guest</h2> 
           {/* Use subtle text color */}
          <p className="text-subtle-text">email</p> 
        </div>
      </div>

      {showCamera ? (
        // Keep camera view styling mostly, ensure rounding matches theme
        <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden flex items-center justify-center shadow-inner"> 
          {/* Loading Indicator - Use theme colors */}
           {isCameraLoading && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10"> 
               <p className="text-white text-lg font-medium">Starting camera...</p> 
             </div>
           )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // Keep muted
            className={`w-full h-full object-cover ${isCameraLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }} // Mirror front camera via CSS
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4 z-20">
            {/* Toggle Camera Button - Use subtle background */}
            <button
              onClick={toggleCamera}
              className="bg-white/20 backdrop-blur-sm text-white rounded-full p-3 shadow-lg hover:bg-white/30 transition-colors disabled:opacity-50"
              aria-label="Switch camera"
              disabled={isCameraLoading}
            >
              <RefreshCw className="w-6 h-6" />
            </button>
            <button
            onClick={toggleTorch}
            className="bg-white/20 backdrop-blur-sm text-white rounded-full p-3 shadow-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            aria-label="Toggle flashlight"
            disabled={isCameraLoading}
            >
               {isTorchOn ? <Zap className="w-6 h-6" /> : <ZapOff className="w-6 h-6" />}
            </button>
             {/* Capture Button - Keep white, maybe add subtle border */}
           
            {/* Capture Button - Keep white, maybe add subtle border */}
            
              <button
                onClick={capturePhoto}
                className="bg-white rounded-full p-4 shadow-lg border border-gray-200 disabled:opacity-50"
                aria-label="Capture photo"
                disabled={isCameraLoading}
              >
                {/* Use primary color for icon */}
                <Camera className="w-8 h-8 text-primary" />
               
              </button>
            {/* Stop/Cancel Button */}
            <button
              onClick={stopCamera}
              className="bg-white/20 backdrop-blur-sm text-white rounded-full p-3 shadow-lg hover:bg-white/30 transition-colors disabled:opacity-50"
              aria-label="Close camera"
              disabled={isCameraLoading}
            >
              <X className="w-6 h-6" /> 
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Logo and Title - Center align, adjust spacing */}
          <div className="flex flex-col items-center space-y-2 mb-8"> 
            <div className="w-16 h-16 flex items-center justify-center">
              <img
                src="https://iili.io/3Axsx8G.png" // Consider hosting locally or using SVG
                alt="CropCare Logo"
                className="w-12 h-12"
              />
            </div>
             {/* Use heading font, secondary color, adjust size */}
            <h1 className="text-3xl font-heading font-bold text-secondary">CropCare</h1> 
          </div>

          {/* Description Boxes - Use theme colors, consistent padding/rounding */}
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 w-full mb-4 text-center"> 
            <p className="text-base-text"> 
              Plant disease detection made easy
            </p>
          </div>

          <div className="bg-secondary/5 border border-secondary/10 rounded-lg p-5 w-full mb-8 text-center"> 
            <p className="text-subtle-text leading-relaxed"> 
              Take a <Camera className="inline-block w-5 h-5 mx-1 align-text-bottom text-subtle-text" /> or upload an
              <ImagePlus className="inline-block w-5 h-5 mx-1 align-text-bottom text-subtle-text" /> of your plant to diagnose diseases and
              get treatment recommendations
            </p>
          </div>

          {/* Action Buttons - Use theme colors, consistent style */}
          <button
            onClick={handleStartCameraClick} 
            // Use primary bg, white text, standard rounding/padding, add shadow/transition
            className="w-full bg-primary text-white rounded-lg py-3 px-4 flex items-center justify-center space-x-2 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors shadow-sm mb-4" 
          >
            <Camera className="w-5 h-5" /> 
            <span className="text-base font-medium">Take a photo</span> 
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
             // Use secondary color for border/text, light bg on hover
            className="w-full border-2 border-secondary text-secondary rounded-lg py-3 px-4 flex items-center justify-center space-x-2 hover:bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors shadow-sm" 
          >
            <UploadIcon className="w-5 h-5" /> 
            <span className="text-base font-medium">Upload image</span> 
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
          />
        </>
      )}
    </div>
  );
};

export default ImageUpload;
// eslint-disable-next-line react-hooks/exhaustive-deps
