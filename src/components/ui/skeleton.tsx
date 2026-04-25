import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

function Skeleton({ style, ...props }: { style?: ViewStyle }) {
  return <View style={[styles.skeleton, style]} {...props} />;
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
  },
});

export { Skeleton };
