import * as React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ViewStyle } from "react-native";

// hover-card → on mobile, show on press
const HoverCardContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: false, setOpen: () => {},
});

export const HoverCard = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <HoverCardContext.Provider value={{ open, setOpen }}>
      <View>{children}</View>
    </HoverCardContext.Provider>
  );
};

export const HoverCardTrigger = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const { setOpen } = React.useContext(HoverCardContext);
  return <TouchableOpacity onPress={() => setOpen(true)} style={style}>{children}</TouchableOpacity>;
};

export const HoverCardContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const { open, setOpen } = React.useContext(HoverCardContext);
  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
        <View style={[styles.content, style]}>{children}</View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.1)", justifyContent: "center", alignItems: "center" },
  content: {
    backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, minWidth: 200,
    borderWidth: 1, borderColor: "#E2E8F0",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
});
