import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

// A basic website (HTML + assets) needs roughly 0.5 Mbps to load at all.
// Below this speed, pages will time out or fail to load meaningfully.
// Above this speed → no popup, no noise.
const SLOW_SPEED_THRESHOLD_MBPS = 0.5;
const POPUP_DURATION_MS = 2000;

export type NetworkStatus = 'offline' | 'slow' | 'normal' | 'unknown';

export const useInternetSpeed = () => {
  const [isLowSpeed, setIsLowSpeed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [speed, setSpeed] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStatusRef = useRef<NetworkStatus>('unknown');

  // Only trigger popup when going offline or below 0.5 Mbps.
  // Never show popup for normal speeds.
  const triggerPopup = useCallback((newStatus: NetworkStatus) => {
    if (newStatus === prevStatusRef.current) return; // no change → no popup
    prevStatusRef.current = newStatus;

    if (newStatus === 'normal' || newStatus === 'unknown') {
      // Speed is fine — dismiss any existing popup silently
      setShowPopup(false);
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      return;
    }

    // Only show popup for 'offline' or 'slow'
    setShowPopup(true);
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(() => {
      setShowPopup(false);
    }, POPUP_DURATION_MS);
  }, []);

  const applySpeed = useCallback((mbps: number) => {
    const rounded = Math.round(mbps * 10) / 10;
    setSpeed(rounded);
    setIsOffline(false);

    if (rounded < SLOW_SPEED_THRESHOLD_MBPS) {
      setIsLowSpeed(true);
      triggerPopup('slow');
    } else {
      setIsLowSpeed(false);
      triggerPopup('normal'); // clears popup if it was showing
    }
  }, [triggerPopup]);

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

    // 2. navigator.connection (Chrome / Edge / Android WebView)
    //    Reliable, instant, no network request needed.
    const nav: any = navigator;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection && typeof connection.downlink === 'number') {
      applySpeed(connection.downlink);

      // React to live network changes (e.g. switching WiFi → 4G)
      if (!connection._clGuardListening) {
        connection._clGuardListening = true;
        connection.addEventListener('change', () => {
          if (typeof connection.downlink === 'number') applySpeed(connection.downlink);
        });
      }
      return;
    }

    // 3. Fallback latency test against same-origin /favicon.ico
    //    (Firefox / Safari — no Network Information API)
    try {
      const start = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      await fetch(`/favicon.ico?t=${start}`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const ms = performance.now() - start;

      // Map latency → rough speed estimate:
      //   <300ms  → good (5 Mbps+)
      //   300-800ms → okay (1-2 Mbps)
      //   800-2000ms → borderline (0.5-1 Mbps)
      //   >2000ms → very slow (<0.5 Mbps)
      let estimated: number;
      if (ms < 300)       estimated = 5.0;
      else if (ms < 800)  estimated = 1.5;
      else if (ms < 2000) estimated = 0.6;
      else                estimated = 0.3;

      applySpeed(estimated);
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // Timed out → definitely slow
        applySpeed(0.2);
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOffline(true);
        setIsLowSpeed(false);
        setSpeed(0);
        triggerPopup('offline');
      }
      // Any other fetch error → ignore, don't show popup
    }
  }, [applySpeed, triggerPopup]);

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
