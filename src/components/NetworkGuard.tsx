import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, SafeAreaView } from 'react-native';
import { WifiOff, AlertTriangle } from 'lucide-react-native';
import { useInternetSpeed } from '@/hooks/useInternetSpeed';

export const NetworkGuard = () => {
  const { isLowSpeed, isOffline, speed, showPopup } = useInternetSpeed();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  // Animate the banner in when showPopup is true, out after 2 seconds
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: showPopup ? 0 : -120,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  }, [showPopup]);

  const bgColor = isOffline ? '#EF4444' : '#F59E0B'; // Red for offline, Amber for slow
  const Icon = isOffline ? WifiOff : AlertTriangle;
  const message = isOffline
    ? 'No internet connection. Reconnecting...'
    : `Slow connection (${speed?.toFixed(1)} Mbps). Features may be slow.`;

  // Don't render at all if there's nothing to show and popup is hidden
  if (!showPopup && !isOffline && !isLowSpeed) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: bgColor,
          shadowOpacity: showPopup ? 0.3 : 0,
        },
      ]}
    >
      <SafeAreaView>
        <View style={styles.alertBar}>
          <Icon size={18} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.text} numberOfLines={1}>
            {message}
          </Text>
          {isOffline && (
            <View style={styles.pulseContainer}>
              <View style={styles.pulse} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 10,
  },
  alertBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  pulseContainer: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginLeft: 4,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
    transform: [{ scale: 1.5 }],
    position: 'absolute',
  },
});
