import * as React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ViewStyle, TextStyle } from "react-native";

// Tooltip — on mobile, show on long-press
const TooltipContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: false, setOpen: () => {},
});

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <View>{children}</View>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const { setOpen } = React.useContext(TooltipContext);
  return (
    <TouchableOpacity
      onLongPress={() => setOpen(true)}
      onPressOut={() => setOpen(false)}
      style={style}
      delayLongPress={300}
    >
      {children}
    </TouchableOpacity>
  );
};

export const TooltipContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const { open, setOpen } = React.useContext(TooltipContext);
  if (!open) return null;
  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
        <View style={[styles.content, style]}>
          {typeof children === "string" ? <Text style={styles.text}>{children}</Text> : children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.1)", justifyContent: "center", alignItems: "center" },
  content: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 240,
  },
  text: { fontSize: 12, color: "#FFFFFF" },
});
