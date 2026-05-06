import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

const SPEED_THRESHOLD_MBPS = 2; // Threshold for "Low Speed"
const POPUP_DURATION_MS = 2000; // Show popup for 2 seconds

// A small but reliably-sized public resource (~100 KB) used for speed testing.
// Using a Google CDN image so it's accessible globally and CORS-friendly.
const TEST_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg';
const TEST_SIZE_BYTES = 40_000; // ~40 KB conservative estimate

export type NetworkStatus = 'offline' | 'slow' | 'normal' | 'unknown';

export const useInternetSpeed = () => {
  const [isLowSpeed, setIsLowSpeed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [speed, setSpeed] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStatusRef = useRef<NetworkStatus>('unknown');

  // Trigger popup for 2 seconds whenever the network status changes
  const triggerPopup = useCallback((newStatus: NetworkStatus) => {
    if (newStatus === prevStatusRef.current) return; // No change, no popup
    prevStatusRef.current = newStatus;

    setShowPopup(true);
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(() => {
      setShowPopup(false);
    }, POPUP_DURATION_MS);
  }, []);

  const checkSpeed = useCallback(async () => {
    // 1. Basic offline check
    if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
      setIsOffline(true);
      setIsLowSpeed(false);
      setSpeed(0);
      triggerPopup('offline');
      return;
    }

    if (Platform.OS !== 'web') return;

    try {
      // 2. Real download speed test using a timed fetch of a known resource.
      //    We avoid the navigator.connection.downlink API because desktop
      //    Chromium browsers cap it at 10 Mbps and often report ~0.4 Mbps
      //    regardless of actual speed.
      const startTime = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(`${TEST_URL}?nocache=${startTime}`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!response.ok && !response.type) {
        throw new Error('Fetch failed');
      }

      // Read the full body to get a meaningful elapsed time
      const blob = await response.blob();
      clearTimeout(timeoutId);

      const endTime = performance.now();
      const durationSeconds = (endTime - startTime) / 1000;
      const fileSizeBytes = blob.size > 0 ? blob.size : TEST_SIZE_BYTES;
      const speedMbps = (fileSizeBytes * 8) / (durationSeconds * 1_000_000);

      const roundedSpeed = Math.round(speedMbps * 10) / 10;
      setSpeed(roundedSpeed);
      setIsOffline(false);
      setIsLowSpeed(roundedSpeed < SPEED_THRESHOLD_MBPS);

      const newStatus: NetworkStatus = roundedSpeed < SPEED_THRESHOLD_MBPS ? 'slow' : 'normal';
      triggerPopup(newStatus);
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // Timed out — treat as very slow connection
        setSpeed(0.1);
        setIsOffline(false);
        setIsLowSpeed(true);
        triggerPopup('slow');
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOffline(true);
        setIsLowSpeed(false);
        setSpeed(0);
        triggerPopup('offline');
      } else {
        // Fetch may fail due to CORS on some environments; fall back gracefully
        console.warn('Speed check failed:', error);
      }
    }
  }, [triggerPopup]);

  useEffect(() => {
    // Initial check
    checkSpeed();

    // Immediately react to browser online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      checkSpeed();
    };
    const handleOffline = () => {
      setIsOffline(true);
      setIsLowSpeed(false);
      setSpeed(0);
      triggerPopup('offline');
    };

    if (Platform.OS === 'web') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // Re-check every 30 seconds
    const interval = setInterval(checkSpeed, 30_000);

    return () => {
      clearInterval(interval);
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      if (Platform.OS === 'web') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [checkSpeed, triggerPopup]);

  return { isLowSpeed, isOffline, speed, showPopup };
};
