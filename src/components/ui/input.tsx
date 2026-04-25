import * as React from "react";
import { TextInput, StyleSheet, ViewStyle } from "react-native";

export interface InputProps extends React.ComponentProps<typeof TextInput> {
  style?: ViewStyle;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ style, ...props }, ref) => {
    return (
      <TextInput
        style={[styles.input, style]}
        ref={ref}
        placeholderTextColor="#94A3B8"
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

const styles = StyleSheet.create({
  input: {
    height: 44,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
  },
});

export { Input };
