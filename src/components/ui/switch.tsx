import * as React from "react";
import { Switch as RNSwitch, StyleSheet, ViewStyle } from "react-native";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const Switch = React.forwardRef<any, SwitchProps>(
  ({ checked, onCheckedChange, disabled, style }, ref) => (
    <RNSwitch
      value={checked}
      onValueChange={onCheckedChange}
      disabled={disabled}
      trackColor={{ false: "#E2E8F0", true: "#0EA5E9" }}
      thumbColor={checked ? "#FFFFFF" : "#FFFFFF"}
      ios_backgroundColor="#E2E8F0"
      style={style}
    />
  )
);
Switch.displayName = "Switch";

export { Switch };
