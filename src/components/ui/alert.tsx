import * as React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

const Alert = React.forwardRef<
  View,
  { variant?: "default" | "destructive"; style?: ViewStyle; children?: React.ReactNode }
>(({ style, variant = "default", children, ...props }, ref) => (
  <View
    ref={ref}
    style={[
      styles.alert,
      variant === "destructive" ? styles.destructive : styles.default,
      style,
    ]}
    {...props}
  >
    {children}
  </View>
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<Text, { style?: TextStyle; children?: React.ReactNode }>(
  ({ style, children, ...props }, ref) => (
    <Text ref={ref} style={[styles.title, style]} {...props}>
      {children}
    </Text>
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<Text, { style?: TextStyle; children?: React.ReactNode }>(
  ({ style, children, ...props }, ref) => (
    <Text ref={ref} style={[styles.description, style]} {...props}>
      {children}
    </Text>
  )
);
AlertDescription.displayName = "AlertDescription";

const styles = StyleSheet.create({
  alert: {
    position: "relative",
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  default: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  destructive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },
});

export { Alert, AlertTitle, AlertDescription };
