import * as React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

const Card = ({ children, style }: { children?: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const CardHeader = ({ children, style }: { children?: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.cardHeader, style]}>{children}</View>
);

const CardTitle = ({ children, style }: { children?: React.ReactNode, style?: TextStyle }) => (
  <Text style={[styles.cardTitle, style]}>{children}</Text>
);

const CardDescription = ({ children, style }: { children?: React.ReactNode, style?: TextStyle }) => (
  <Text style={[styles.cardDescription, style]}>{children}</Text>
);

const CardContent = ({ children, style }: { children?: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.cardContent, style]}>{children}</View>
);

const CardFooter = ({ children, style }: { children?: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.cardFooter, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 24,
    gap: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#64748B",
  },
  cardContent: {
    padding: 24,
    paddingTop: 0,
  },
  cardFooter: {
    padding: 24,
    paddingTop: 0,
    flexDirection: "row",
    alignItems: "center",
  },
});

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
