import * as React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";

export interface ToggleProps {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  style?: ViewStyle;
  disabled?: boolean;
}

export const Toggle = ({ pressed, onPressedChange, children, variant = "default", size = "default", style, disabled }: ToggleProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPressedChange?.(!pressed)}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        styles[size],
        pressed ? styles.pressed : (variant === "outline" ? styles.outline : styles.default),
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 8 },
  default: { backgroundColor: "transparent" },
  outline: { borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "transparent" },
  pressed: { backgroundColor: "#F1F5F9" },
  disabled: { opacity: 0.5 },
  sm: { height: 32, paddingHorizontal: 10 },
  lg: { height: 44, paddingHorizontal: 16 },
});
