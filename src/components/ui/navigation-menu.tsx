import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ViewStyle, TextStyle } from "react-native";
import { ChevronDown } from "lucide-react-native";

// Simplified horizontal navigation menu for React Native
export const NavigationMenu = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.menu, style]}>{children}</View>
);

export const NavigationMenuList = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.list, style]}>
    {children}
  </ScrollView>
);

export const NavigationMenuItem = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.menuItem, style]}>{children}</View>
);

export const NavigationMenuTrigger = ({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.trigger, style]}>
    {typeof children === "string" ? <Text style={styles.triggerText}>{children}</Text> : children}
    <View style={{ marginLeft: 4 }}>
      <ChevronDown size={14} color="#64748B" />
    </View>
  </TouchableOpacity>
);

export const NavigationMenuContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.content, style]}>{children}</View>
);

export const NavigationMenuLink = ({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.link, style]}>
    {typeof children === "string" ? <Text style={styles.linkText}>{children}</Text> : children}
  </TouchableOpacity>
);

export const NavigationMenuViewport = ({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) =>
  children ? <View style={[styles.viewport, style]}>{children}</View> : null;

export const NavigationMenuIndicator = () => null;

const styles = StyleSheet.create({
  menu: { width: "100%" },
  list: { flexDirection: "row", gap: 4, paddingHorizontal: 4 },
  menuItem: {},
  trigger: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  triggerText: { fontSize: 14, fontWeight: "500", color: "#0F172A" },
  content: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  link: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  linkText: { fontSize: 14, color: "#0F172A" },
  viewport: { marginTop: 4 },
});
