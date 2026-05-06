import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

const SPEED_THRESHOLD_MBPS = 2; // Threshold for "Low Speed"

export const useInternetSpeed = () => {
  const [isLowSpeed, setIsLowSpeed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [speed, setSpeed] = useState<number | null>(null);

  const checkSpeed = async () => {
    // Basic connectivity check first
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      if (!navigator.onLine) {
        setIsOffline(true);
        setIsLowSpeed(false);
        setSpeed(0);
        return;
      }
    }

    if (Platform.OS !== 'web') return;

    try {
      // 1. Check Navigator Connection API (Most accurate for Chromium browsers)
      const nav: any = navigator;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
      
      if (connection && typeof connection.downlink === 'number') {
        const currentSpeed = connection.downlink;
        setSpeed(currentSpeed);
        setIsOffline(currentSpeed === 0);
        setIsLowSpeed(currentSpeed > 0 && currentSpeed < SPEED_THRESHOLD_MBPS);
        return;
      }

      // 2. Fallback: Quick Latency/Speed Test
      // We use a small, reliable endpoint to measure round-trip time
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      await fetch("https://www.google.com/favicon.ico?t=" + startTime, { 
        mode: 'no-cors',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      // Rough estimation: if a favicon takes more than 1.5s, it's effectively low speed
      const estimatedSpeed = duration > 1.5 ? 1 : 5; 
      
      setSpeed(estimatedSpeed);
      setIsOffline(false);
      setIsLowSpeed(estimatedSpeed < SPEED_THRESHOLD_MBPS);
    } catch (error) {
      // If fetch fails, we might be offline or blocked
      if (!navigator.onLine) {
        setIsOffline(true);
      }
      console.log("Speed check failed", error);
    }
  };

  useEffect(() => {
    // Initial check
    checkSpeed();

    // Browser events for immediate feedback
    const handleOnline = () => {
      setIsOffline(false);
      checkSpeed();
    };
    const handleOffline = () => {
      setIsOffline(true);
      setIsLowSpeed(false);
    };

    if (Platform.OS === 'web') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    const interval = setInterval(checkSpeed, 15000); // Check every 15 seconds
    
    return () => {
      clearInterval(interval);
      if (Platform.OS === 'web') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  return { isLowSpeed, isOffline, speed };
};
