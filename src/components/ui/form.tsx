import * as React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

// Native form wrapper — react-hook-form works with RN natively
export const Form = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;

export const FormField = ({ children }: { children: React.ReactNode }) => <View style={styles.field}>{children}</View>;

export const FormItem = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.item, style]}>{children}</View>
);

export const FormLabel = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.label, style]}>{children}</Text>
);

export const FormControl = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;

export const FormDescription = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

export const FormMessage = ({ children, style }: { children?: React.ReactNode; style?: TextStyle }) =>
  children ? <Text style={[styles.message, style]}>{children}</Text> : null;

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  item: { gap: 4 },
  label: { fontSize: 14, fontWeight: "500", color: "#0F172A", marginBottom: 4 },
  description: { fontSize: 12, color: "#64748B", marginTop: 2 },
  message: { fontSize: 12, color: "#EF4444", marginTop: 2 },
});
