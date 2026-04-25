import * as React from "react";
import { View, StyleSheet, PanResponder, ViewStyle } from "react-native";

export interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const Slider = ({ value, defaultValue, min = 0, max = 100, step = 1, onValueChange, style, disabled }: SliderProps) => {
  const [internalValue, setInternalValue] = React.useState(value ?? defaultValue ?? [0]);
  const [trackWidth, setTrackWidth] = React.useState(0);
  const currentValue = value ?? internalValue;
  const pct = ((currentValue[0] - min) / (max - min)) * 100;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderMove: (_, gesture) => {
      if (!trackWidth) return;
      const raw = (gesture.moveX / trackWidth) * (max - min) + min;
      const stepped = Math.round(raw / step) * step;
      const clamped = Math.min(max, Math.max(min, stepped));
      const newVal = [clamped];
      setInternalValue(newVal);
      onValueChange?.(newVal);
    },
  });

  return (
    <View
      style={[styles.track, style, disabled && styles.disabled]}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      <View style={[styles.fill, { width: `${pct}%` }]} />
      <View style={[styles.thumb, { left: `${pct}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: { height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, position: "relative", justifyContent: "center" },
  fill: { height: 6, backgroundColor: "#0EA5E9", borderRadius: 3, position: "absolute", left: 0 },
  thumb: {
    position: "absolute", width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: "#0EA5E9",
    marginLeft: -10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  disabled: { opacity: 0.5 },
});
