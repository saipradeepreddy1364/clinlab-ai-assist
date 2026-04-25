import * as React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  style?: ViewStyle;
}

function Badge({ children, variant = "default", style }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      {typeof children === "string" ? (
        <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "transparent",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  
  // Variants
  default: {
    backgroundColor: "#0F172A",
  },
  defaultText: {
    color: "#FFFFFF",
  },
  secondary: {
    backgroundColor: "#F1F5F9",
  },
  secondaryText: {
    color: "#0F172A",
  },
  destructive: {
    backgroundColor: "#EF4444",
  },
  destructiveText: {
    color: "#FFFFFF",
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: "#E2E8F0",
  },
  outlineText: {
    color: "#0F172A",
  },
});

export { Badge };
