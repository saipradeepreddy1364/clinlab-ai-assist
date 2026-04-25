import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { ChevronRight, MoreHorizontal } from "lucide-react-native";

const Breadcrumb = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.breadcrumb, style]}>{children}</View>
);

const BreadcrumbList = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.list, style]}>{children}</View>
);

const BreadcrumbItem = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.item, style]}>{children}</View>
);

const BreadcrumbLink = ({ children, onPress, style }: { children: React.ReactNode, onPress?: () => void, style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.link, style]}>
    <Text style={styles.linkText}>{children}</Text>
  </TouchableOpacity>
);

const BreadcrumbPage = ({ children, style }: { children: React.ReactNode, style?: TextStyle }) => (
  <Text style={[styles.page, style]}>{children}</Text>
);

const BreadcrumbSeparator = ({ children, style }: { children?: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.separator, style]}>
    {children ?? <ChevronRight size={14} color="#94A3B8" />}
  </View>
);

const BreadcrumbEllipsis = ({ style }: { style?: ViewStyle }) => (
  <View style={[styles.ellipsis, style]}>
    <MoreHorizontal size={14} color="#94A3B8" />
  </View>
);

const styles = StyleSheet.create({
  breadcrumb: {
    paddingVertical: 8,
  },
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
  },
  link: {
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "400",
  },
  page: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "400",
    paddingHorizontal: 4,
  },
  separator: {
    paddingHorizontal: 4,
  },
  ellipsis: {
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
