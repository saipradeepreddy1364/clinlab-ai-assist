import * as React from "react";
import { View, Text, StyleSheet, TextInput, ViewStyle, TextStyle } from "react-native";

// Simple OTP input — renders N separate single-character TextInputs
export interface InputOTPProps {
  maxLength: number;
  value?: string;
  onChange?: (value: string) => void;
  style?: ViewStyle;
}

export const InputOTP = ({ maxLength, value = "", onChange, style }: InputOTPProps) => {
  const refs = React.useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const chars = value.split("");
    chars[index] = text.slice(-1); // only last char
    const newVal = chars.join("").slice(0, maxLength);
    onChange?.(newVal);
    if (text && index < maxLength - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: maxLength }).map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => { if (r) refs.current[i] = r; }}
          style={styles.cell}
          maxLength={1}
          keyboardType="number-pad"
          value={value[i] || ""}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

export const InputOTPGroup = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.group, style]}>{children}</View>
);

export const InputOTPSlot = ({ index, style }: { index: number; style?: ViewStyle }) => (
  <View style={[styles.slot, style]}>
    <Text style={styles.slotText}>–</Text>
  </View>
);

export const InputOTPSeparator = () => <Text style={styles.sep}>·</Text>;

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 8, alignItems: "center" },
  group: { flexDirection: "row", gap: 8 },
  cell: {
    width: 44, height: 52, borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 10, textAlign: "center", fontSize: 20, fontWeight: "600", color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  slot: { width: 44, height: 52, borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  slotText: { fontSize: 20, color: "#CBD5E1" },
  sep: { fontSize: 18, color: "#94A3B8" },
});
