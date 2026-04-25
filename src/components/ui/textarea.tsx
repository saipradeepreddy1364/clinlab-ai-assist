import * as React from "react";
import { TextInput, StyleSheet, ViewStyle } from "react-native";

export interface TextareaProps extends React.ComponentProps<typeof TextInput> {
  style?: ViewStyle;
}

const Textarea = React.forwardRef<TextInput, TextareaProps>(({ style, ...props }, ref) => {
  return (
    <TextInput
      multiline
      style={[styles.textarea, style]}
      ref={ref}
      placeholderTextColor="#94A3B8"
      textAlignVertical="top"
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

const styles = StyleSheet.create({
  textarea: {
    minHeight: 80,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
  },
});

export { Textarea };
