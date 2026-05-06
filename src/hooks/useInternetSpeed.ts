import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

const SPEED_THRESHOLD_MBPS = 2;
const POPUP_DURATION_MS = 2000;

export type NetworkStatus = 'offline' | 'slow' | 'normal' | 'unknown';

export const useInternetSpeed = () => {
  const [isLowSpeed, setIsLowSpeed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [speed, setSpeed] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStatusRef = useRef<NetworkStatus>('unknown');

  const triggerPopup = useCallback((newStatus: NetworkStatus) => {
    if (newStatus === prevStatusRef.current) return;
    prevStatusRef.current = newStatus;

    setShowPopup(true);
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(() => {
      setShowPopup(false);
    }, POPUP_DURATION_MS);
  }, []);

  const checkSpeed = useCallback(async () => {
    // 1. Offline check
    if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
      setIsOffline(true);
      setIsLowSpeed(false);
      setSpeed(0);
      triggerPopup('offline');
      return;
    }

    if (Platform.OS !== 'web') return;

    // 2. Use navigator.connection (works on Chrome/Edge/Android WebView)
    //    This is the most reliable method without CORS issues.
    const nav: any = navigator;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection && typeof connection.downlink === 'number') {
      const currentSpeed = connection.downlink; // Mbps
      const rounded = Math.round(currentSpeed * 10) / 10;
      setSpeed(rounded);
      setIsOffline(false);
      setIsLowSpeed(rounded > 0 && rounded < SPEED_THRESHOLD_MBPS);
      const newStatus: NetworkStatus = rounded === 0 ? 'offline' : rounded < SPEED_THRESHOLD_MBPS ? 'slow' : 'normal';
      triggerPopup(newStatus);

      // Also listen for connection changes
      if (!connection._listenerAdded) {
        connection._listenerAdded = true;
        connection.addEventListener('change', () => checkSpeed());
      }
      return;
    }

    // 3. Fallback: no-cors latency test (Firefox / Safari / no Network Info API)
    //    We fetch a tiny resource from our own origin to measure round-trip time.
    //    Using /favicon.ico which always exists in Vite apps.
    try {
      const start = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      await fetch(`/favicon.ico?t=${start}`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const durationMs = performance.now() - start;

      // Heuristic: <200ms = fast, 200-800ms = normal, >800ms = slow
      let estimatedSpeed: number;
      if (durationMs < 200) estimatedSpeed = 10;
      else if (durationMs < 500) estimatedSpeed = 4;
      else if (durationMs < 800) estimatedSpeed = 2;
      else estimatedSpeed = 0.8;

      setSpeed(estimatedSpeed);
      setIsOffline(false);
      setIsLowSpeed(estimatedSpeed < SPEED_THRESHOLD_MBPS);

      const newStatus: NetworkStatus = estimatedSpeed < SPEED_THRESHOLD_MBPS ? 'slow' : 'normal';
      triggerPopup(newStatus);
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        setSpeed(0.5);
        setIsLowSpeed(true);
        setIsOffline(false);
        triggerPopup('slow');
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOffline(true);
        setIsLowSpeed(false);
        setSpeed(0);
        triggerPopup('offline');
      }
    }
  }, [triggerPopup]);

  useEffect(() => {
    checkSpeed();

    const handleOnline = () => { setIsOffline(false); checkSpeed(); };
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
