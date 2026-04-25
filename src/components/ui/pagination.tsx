import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react-native";

export const Pagination = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.pagination, style]}>{children}</View>
);

export const PaginationContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.content, style]}>{children}</View>
);

export const PaginationItem = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.item, style]}>{children}</View>
);

export const PaginationLink = ({ children, onPress, isActive, style }: { children: React.ReactNode; onPress?: () => void; isActive?: boolean; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.link, isActive && styles.linkActive, style]}>
    <Text style={[styles.linkText, isActive && styles.linkTextActive]}>{children}</Text>
  </TouchableOpacity>
);

export const PaginationPrevious = ({ onPress, style }: { onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.link, style]}>
    <ChevronLeft size={16} color="#64748B" />
  </TouchableOpacity>
);

export const PaginationNext = ({ onPress, style }: { onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.link, style]}>
    <ChevronRight size={16} color="#64748B" />
  </TouchableOpacity>
);

export const PaginationEllipsis = ({ style }: { style?: ViewStyle }) => (
  <View style={[styles.link, style]}>
    <MoreHorizontal size={16} color="#64748B" />
  </View>
);

const styles = StyleSheet.create({
  pagination: { width: "100%", alignItems: "center" },
  content: { flexDirection: "row", alignItems: "center", gap: 4 },
  item: {},
  link: { width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  linkActive: { backgroundColor: "#0F172A", borderColor: "#0F172A" },
  linkText: { fontSize: 14, color: "#0F172A" },
  linkTextActive: { color: "#FFFFFF", fontWeight: "600" },
});
