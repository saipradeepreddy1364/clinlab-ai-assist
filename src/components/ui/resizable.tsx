import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

// Resizable panels are not natively supported — render simple split View
export const ResizablePanelGroup = ({ children, direction = "horizontal", style }: { children: React.ReactNode; direction?: "horizontal" | "vertical"; style?: ViewStyle }) => (
  <View style={[direction === "horizontal" ? styles.row : styles.col, style]}>{children}</View>
);

export const ResizablePanel = ({ children, defaultSize, style }: { children: React.ReactNode; defaultSize?: number; style?: ViewStyle }) => (
  <View style={[{ flex: defaultSize ?? 1 }, style]}>{children}</View>
);

export const ResizableHandle = ({ style }: { style?: ViewStyle }) => (
  <View style={[styles.handle, style]} />
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", flex: 1 },
  col: { flexDirection: "column", flex: 1 },
  handle: { width: 4, backgroundColor: "#E2E8F0" },
});
