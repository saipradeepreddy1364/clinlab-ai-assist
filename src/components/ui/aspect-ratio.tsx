import * as React from "react";
import { View, ViewStyle } from "react-native";

const AspectRatio = ({ ratio = 1, children, style }: { ratio?: number, children: React.ReactNode, style?: ViewStyle }) => {
  return (
    <View style={[{ aspectRatio: ratio }, style]}>
      {children}
    </View>
  );
};

export { AspectRatio };
