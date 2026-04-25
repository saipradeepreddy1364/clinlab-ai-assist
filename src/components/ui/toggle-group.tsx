import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Toggle } from "./toggle";

interface ToggleGroupContextProps {
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  type: "single" | "multiple";
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

const ToggleGroupContext = React.createContext<ToggleGroupContextProps>({
  value: "",
  onValueChange: () => {},
  type: "single",
});

export const ToggleGroup = ({
  children,
  type = "single",
  value,
  onValueChange,
  variant,
  size,
  style,
}: {
  children: React.ReactNode;
  type?: "single" | "multiple";
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  style?: ViewStyle;
}) => {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(value ?? (type === "multiple" ? [] : ""));

  const handleChange = (val: string | string[]) => {
    setInternalValue(val);
    onValueChange?.(val);
  };

  return (
    <ToggleGroupContext.Provider value={{ value: value ?? internalValue, onValueChange: handleChange, type, variant, size }}>
      <View style={[styles.group, style]}>{children}</View>
    </ToggleGroupContext.Provider>
  );
};

export const ToggleGroupItem = ({ value, children, style }: { value: string; children: React.ReactNode; style?: ViewStyle }) => {
  const ctx = React.useContext(ToggleGroupContext);

  const isPressed = Array.isArray(ctx.value) ? ctx.value.includes(value) : ctx.value === value;

  const handlePress = () => {
    if (ctx.type === "multiple") {
      const arr = Array.isArray(ctx.value) ? ctx.value : [];
      ctx.onValueChange(isPressed ? arr.filter((v) => v !== value) : [...arr, value]);
    } else {
      ctx.onValueChange(isPressed ? "" : value);
    }
  };

  return (
    <Toggle
      pressed={isPressed}
      onPressedChange={handlePress}
      variant={ctx.variant}
      size={ctx.size}
      style={style}
    >
      {children}
    </Toggle>
  );
};

const styles = StyleSheet.create({
  group: { flexDirection: "row", gap: 4, alignItems: "center" },
});
