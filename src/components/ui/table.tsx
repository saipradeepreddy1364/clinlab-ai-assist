import * as React from "react";
import { View, Text, StyleSheet, ScrollView, ViewStyle, TextStyle } from "react-native";

const Table = React.forwardRef<View, { style?: ViewStyle; children?: React.ReactNode }>(
  ({ style, children, ...props }, ref) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View ref={ref} style={[styles.table, style]} {...props}>
        {children}
      </View>
    </ScrollView>
  )
);
Table.displayName = "Table";

const TableHeader = ({ style, children }: { style?: ViewStyle; children?: React.ReactNode }) => (
  <View style={[styles.header, style]}>{children}</View>
);

const TableBody = ({ style, children }: { style?: ViewStyle; children?: React.ReactNode }) => (
  <View style={[styles.body, style]}>{children}</View>
);

const TableRow = ({ style, children }: { style?: ViewStyle; children?: React.ReactNode }) => (
  <View style={[styles.row, style]}>{children}</View>
);

const TableHead = ({ style, children }: { style?: TextStyle; children?: React.ReactNode }) => (
  <Text style={[styles.head, style]}>{children}</Text>
);

const TableCell = ({ style, children }: { style?: TextStyle; children?: React.ReactNode }) => (
  <Text style={[styles.cell, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  table: {
    width: "100%",
    minWidth: 400,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  body: {},
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 12,
  },
  head: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "left",
  },
  cell: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
    textAlign: "left",
  },
});

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
