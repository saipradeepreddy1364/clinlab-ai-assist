import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

export interface ProgressProps {
  value?: number;
  style?: ViewStyle;
}

const Progress = React.forwardRef<View, ProgressProps>(({ style, value = 0, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.progress, style]}
    {...props}
  >
    <View
      style={[
        styles.indicator,
        { width: `${Math.min(100, Math.max(0, value))}%` }
      ]}
    />
  </View>
));
Progress.displayName = "Progress";

const styles = StyleSheet.create({
  progress: {
    position: "relative",
    height: 8,
    width: "100%",
    overflow: "hidden",
    borderRadius: 9999,
    backgroundColor: "#F1F5F9",
  },
  indicator: {
    height: "100%",
    backgroundColor: "#0EA5E9",
  },
});

export { Progress };
