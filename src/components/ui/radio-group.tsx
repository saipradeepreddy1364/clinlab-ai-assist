import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { Circle } from "lucide-react-native";

export const RadioGroup = ({ children, value, onValueChange, style }: { children: React.ReactNode; value?: string; onValueChange?: (v: string) => void; style?: ViewStyle }) => (
  <View style={[styles.group, style]}>{children}</View>
);

export const RadioGroupItem = ({ value, currentValue, onSelect, style }: { value: string; currentValue?: string; onSelect?: (v: string) => void; style?: ViewStyle }) => {
  const isSelected = value === currentValue;
  return (
    <TouchableOpacity onPress={() => onSelect?.(value)} style={[styles.item, style]}>
      <View style={[styles.outer, isSelected && styles.outerSelected]}>
        {isSelected && <View style={styles.inner} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  group: { gap: 8 },
  item: { flexDirection: "row", alignItems: "center" },
  outer: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#CBD5E1", justifyContent: "center", alignItems: "center" },
  outerSelected: { borderColor: "#0EA5E9" },
  inner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#0EA5E9" },
});
