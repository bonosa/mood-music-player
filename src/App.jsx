import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Music, Loader2, SwitchCamera as FlipCamera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { SongCard } from "@/components/ui/song-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENRES, MOODS } from "@/lib/constants";
import { detectEmotion, initializeDetectors } from "@/lib/emotion-detection";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [detectedMood, setDetectedMood] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("pop");
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const videoRef = useRef(null);
  const { toast } = useToast();
  useEffect(() => {
    // Initialize AI models when component mounts
    initializeDetectors()
      .then(() => {
        setIsModelLoading(false);
        toast({
          title: "Ready!",
          description: "Emotion detection models loaded successfully."
        });
      })
      .catch(error => {
        setIsModelLoading(false);
        toast({
          title: "Model Loading Error",
          description: error.message,
          variant: "destructive"
        });
      });

   useEffect(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(error => {
            console.error("Error playing video:", error);
          });
        }
      }, [stream]);
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
  
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  const switchCamera = async () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    await startCamera();
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    if (isModelLoading) {
      toast({
        title: "Please Wait",
        description: "Emotion detection models are still loading...",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Handle mirrored video
      if (facingMode === "user") {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      }
      
      ctx.drawImage(videoRef.current, 0, 0);
      
      const mood = await detectEmotion(canvas);
      setDetectedMood(mood);
      
      toast({
        title: "Mood Detected!",
        description: `We detected that you're feeling ${mood}!`
      });
    } catch (error) {
      toast({
        title: "Detection Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsRecording(false);
    setDetectedMood(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-md mx-auto pt-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-4xl font-bold mb-8 text-center"
        >
          Mood Music Player
        </motion.h1>

        {isModelLoading && (
          <div className="text-center p-8">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading emotion detection models...</p>
          </div>
        )}

        {!isModelLoading && !isRecording && !detectedMood && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Button 
              onClick={startCamera}
              className="w-full h-16 text-lg"
              variant="outline"
            >
              <Camera className="mr-2 h-6 w-6" /> Take Selfie
            </Button>
          </motion.div>
        )}

        {isRecording && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={switchCamera}
                variant="outline"
                className="flex-shrink-0"
              >
                <FlipCamera className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative rounded-lg overflow-hidden bg-black">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg transform scale-x-[-1]"
                style={{ minHeight: "300px", objectFit: "cover" }}
              />
              <Button 
                onClick={captureImage}
                disabled={isProcessing}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Capture Mood'
                )}
              </Button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {detectedMood && MOODS[detectedMood] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 space-y-4"
            >
              <div className={`p-6 rounded-lg bg-gradient-to-br ${MOODS[detectedMood].gradient}`}>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Mood Analysis</h2>
                  <p className="text-sm opacity-90">{MOODS[detectedMood].description}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Select Music Genre
                  </label>
                  <Select onValueChange={setSelectedGenre} value={selectedGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GENRES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Music className="mr-2" />
                  Recommended Songs
                </h2>
                <ul className="space-y-3">
                  {MOODS[detectedMood].songsByGenre[selectedGenre]?.map((song, index) => (
                    <SongCard key={song.name} song={song} index={index} />
                  ))}
                </ul>
              </div>
              <Button 
                onClick={reset}
                className="w-full"
                variant="outline"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Toaster />
    </div>
  );
}

export default App;