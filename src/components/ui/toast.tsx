import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, ViewStyle, TextStyle } from "react-native";
import { X } from "lucide-react-native";

export type ToastVariant = "default" | "destructive" | "success";

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  style?: ViewStyle;
}

export const Toast = ({ title, description, variant = "default", onDismiss, style }: ToastProps) => {
  const bgColor = variant === "destructive" ? "#EF4444" : variant === "success" ? "#22C55E" : "#0F172A";
  return (
    <View style={[styles.toast, { backgroundColor: bgColor }, style]}>
      <View style={styles.body}>
        {title && <Text style={styles.title}>{title}</Text>}
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.close}>
          <X size={14} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const ToastTitle = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

export const ToastDescription = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

export const ToastClose = ({ onPress, style }: { onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.close, style]}>
    <X size={14} color="#FFFFFF" />
  </TouchableOpacity>
);

export const ToastAction = ({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.action, style]}>
    <Text style={styles.actionText}>{children}</Text>
  </TouchableOpacity>
);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const ToastViewport = () => null;

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 14, borderRadius: 12, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  description: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  close: { padding: 4, marginLeft: 8 },
  action: { marginLeft: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)" },
  actionText: { fontSize: 12, color: "#FFFFFF", fontWeight: "600" },
});
