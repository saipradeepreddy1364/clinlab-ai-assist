import * as React from "react";
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle, TextStyle } from "react-native";

const Avatar = ({ children, style }: { children?: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.avatar, style]}>{children}</View>
);

const AvatarImage = ({ source, style }: { source: any, style?: ImageStyle }) => (
  <Image source={source} style={[styles.image, style]} />
);

const AvatarFallback = ({ children, style }: { children?: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.fallback, style]}>
    {typeof children === "string" ? (
      <Text style={styles.fallbackText}>{children}</Text>
    ) : (
      children
    )}
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    position: "relative",
    height: 40,
    width: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },
  image: {
    height: "100%",
    width: "100%",
    aspectRatio: 1,
  },
  fallback: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
});

export { Avatar, AvatarImage, AvatarFallback };
