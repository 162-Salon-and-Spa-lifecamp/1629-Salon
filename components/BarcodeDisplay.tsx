import React, { useState, useEffect } from 'react';
import { useStore } from '../services/StoreContext';
import { QRCodeData } from '../types';
import { RefreshCw, Lock } from 'lucide-react';

export const BarcodeDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [tokenVersion, setTokenVersion] = useState(0);

  // Refresh codes every 20 minutes (1200000 ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
      setTokenVersion(v => v + 1);
    }, 20 * 60 * 1000); // 20 minutes
    return () => clearInterval(timer);
  }, []);

  const generateQRUrl = () => {
    // Shared Terminal QR Code
    // We use a generic 'userId' to represent the location/terminal itself
    const data: QRCodeData = {
      userId: 'SALON_TERMINAL', 
      timestamp: currentTime,
      validUntil: currentTime + (20 * 60 * 1000), 
      signature: `sig_terminal_${tokenVersion}` 
    };
    const jsonString = JSON.stringify(data);
    // Increased size for visibility on shared screen
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(jsonString)}&color=1e293b`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
              <Lock className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Staff Attendance Terminal
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Scan this code with your device to Clock In or Clock Out.
          </p>
        </div>

        <div className="p-12 flex flex-col items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-2xl opacity-75 animate-pulse"></div>
            <img 
              src={generateQRUrl()} 
              alt="Terminal QR Code" 
              className="relative w-80 h-80 rounded-xl border-8 border-white dark:border-slate-200 shadow-2xl"
            />
          </div>
          
          <div className="mt-8 flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-medium bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Code refreshes automatically every 20 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};