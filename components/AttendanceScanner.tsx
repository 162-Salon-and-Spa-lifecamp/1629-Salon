import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../services/StoreContext';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import { QRCodeData } from '../types';

export const AttendanceScanner: React.FC = () => {
  const { toggleAttendance, users, currentUser } = useStore();
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start "Camera"
  useEffect(() => {
    if (scanning && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error("Camera error:", err);
          // Fallback for demo if no camera
        });
    }
    return () => {
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning]);

  const handleSimulateScan = () => {
    if (!currentUser) return;
    
    setScanning(false);
    
    // Simulate reading the SHARED TERMINAL QR code from the manager screen
    // The ID 'SALON_TERMINAL' matches what is generated in BarcodeDisplay.tsx
    const mockQRData: QRCodeData = {
      userId: 'SALON_TERMINAL',
      timestamp: Date.now(),
      validUntil: Date.now() + (20 * 60 * 1000), // 20 mins
      signature: 'valid_sig'
    };

    // Validation: We verify the scanned code identifies the official Salon Terminal
    if (mockQRData.userId === 'SALON_TERMINAL') {
      // We use the CURRENT USER'S ID to perform the action, not the ID in the QR code.
      // The QR code just proves location/presence.
      toggleAttendance(currentUser.id);
      
      const isNowClockedIn = !users.find(u => u.id === currentUser.id)?.isClockedIn;
      setLastResult({
        success: true,
        message: isNowClockedIn 
          ? `Success! Welcome back, ${currentUser.name}. You are Clocked In.` 
          : `Success! Goodbye, ${currentUser.name}. You are Clocked Out.`
      });
    } else {
      setLastResult({ success: false, message: 'Invalid QR Code. Please scan the official Terminal Code.' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 max-w-md mx-auto w-full">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden w-full transition-colors">
        <div className="p-6 bg-slate-900 dark:bg-black text-white text-center">
          <h2 className="text-xl font-bold">Attendance Scanner</h2>
          <p className="text-slate-400 text-sm mt-1">Scan the Terminal Code to sign in/out</p>
        </div>

        <div className="p-6 flex flex-col items-center">
          
          {scanning ? (
            <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden mb-6 group">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-64 h-64 border-2 border-green-400 rounded-lg animate-pulse relative">
                   <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 opacity-50"></div>
                 </div>
              </div>
              <button 
                onClick={handleSimulateScan}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg text-sm z-10 hover:bg-slate-100"
              >
                (Demo) Simulate Successful Scan
              </button>
            </div>
          ) : (
            <div className="w-full aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-6 border-2 border-dashed border-slate-300 dark:border-slate-600 transition-colors">
               <Camera className="w-16 h-16 text-slate-400 dark:text-slate-500" />
            </div>
          )}

          {lastResult && !scanning && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 w-full ${lastResult.success ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
              {lastResult.success ? <CheckCircle className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
              <div>
                <p className="font-semibold">{lastResult.success ? 'Success' : 'Error'}</p>
                <p className="text-sm opacity-90">{lastResult.message}</p>
              </div>
            </div>
          )}

          {!scanning && (
            <button
              onClick={() => { setLastResult(null); setScanning(true); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
            >
              <Camera className="w-5 h-5" />
              Open Scanner
            </button>
          )}
          
          {scanning && (
             <button
             onClick={() => setScanning(false)}
             className="w-full mt-4 text-slate-500 dark:text-slate-400 font-medium py-2 hover:text-slate-800 dark:hover:text-slate-200"
           >
             Cancel
           </button>
          )}
        </div>
      </div>
    </div>
  );
};