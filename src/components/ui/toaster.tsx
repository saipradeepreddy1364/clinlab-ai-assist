import * as React from "react";
import { View, StyleSheet } from "react-native";
import { useToast } from "./use-toast";
import { Toast } from "./toast";

export const Toaster = () => {
  const { toasts, dismiss } = useToast();
  if (!toasts.length) return null;
  return (
    <View style={styles.container}>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          title={t.title}
          description={t.description}
          variant={t.variant}
          onDismiss={() => dismiss(t.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
});
