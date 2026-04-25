import * as React from "react";
import { ScrollView, ViewStyle } from "react-native";

// ScrollArea is just a ScrollView in React Native
export const ScrollArea = ({ children, style, horizontal }: { children: React.ReactNode; style?: ViewStyle; horizontal?: boolean }) => (
  <ScrollView
    style={style}
    horizontal={horizontal}
    showsHorizontalScrollIndicator={false}
    showsVerticalScrollIndicator={false}
  >
    {children}
  </ScrollView>
);

export const ScrollBar = () => null; // handled natively
