import * as React from "react";
import { TouchableOpacity, StyleSheet, View, ViewStyle } from "react-native";
import { Check } from "lucide-react-native";

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const Checkbox = React.forwardRef<View, CheckboxProps>(
  ({ checked, onCheckedChange, style, disabled }, ref) => {
    return (
      <TouchableOpacity
        ref={ref as any}
        style={[
          styles.checkbox,
          checked && styles.checked,
          disabled && styles.disabled,
          style,
        ]}
        onPress={() => !disabled && onCheckedChange?.(!checked)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {checked && <Check size={12} color="#FFFFFF" />}
      </TouchableOpacity>
    );
  },
);
Checkbox.displayName = "Checkbox";

const styles = StyleSheet.create({
  checkbox: {
    height: 18,
    width: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checked: {
    backgroundColor: "#0EA5E9",
  },
  disabled: {
    opacity: 0.5,
  },
});

export { Checkbox };
