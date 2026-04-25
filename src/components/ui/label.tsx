import * as React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

export interface LabelProps {
  children?: React.ReactNode;
  style?: TextStyle;
}

const Label = ({ children, style }: LabelProps) => {
  return (
    <Text style={[styles.label, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
});

export { Label };
