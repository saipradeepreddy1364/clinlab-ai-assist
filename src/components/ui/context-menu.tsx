import * as React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { Check, ChevronRight, Circle } from "lucide-react-native";

const ContextMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

const ContextMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <ContextMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

const ContextMenuTrigger = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => {
  const { setOpen } = React.useContext(ContextMenuContext);
  return (
    <TouchableOpacity onLongPress={() => setOpen(true)} style={style}>
      {children}
    </TouchableOpacity>
  );
};

const ContextMenuContent = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => {
  const { open, setOpen } = React.useContext(ContextMenuContext);
  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={() => setOpen(false)}
      >
        <View style={[styles.content, style]}>
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const ContextMenuItem = ({ children, onPress, inset, style }: { children: React.ReactNode, onPress?: () => void, inset?: boolean, style?: ViewStyle }) => {
  const { setOpen } = React.useContext(ContextMenuContext);
  return (
    <TouchableOpacity 
      onPress={() => {
        onPress?.();
        setOpen(false);
      }} 
      style={[styles.item, inset && styles.inset, style]}
    >
      {children}
    </TouchableOpacity>
  );
};

const ContextMenuCheckboxItem = ({ children, checked, onPress, style }: { children: React.ReactNode, checked?: boolean, onPress?: () => void, style?: ViewStyle }) => {
  const { setOpen } = React.useContext(ContextMenuContext);
  return (
    <TouchableOpacity 
      onPress={() => {
        onPress?.();
        setOpen(false);
      }} 
      style={[styles.item, styles.inset, style]}
    >
      <View style={styles.indicator}>
        {checked && <Check size={14} color="#0F172A" />}
      </View>
      {children}
    </TouchableOpacity>
  );
};

const ContextMenuRadioItem = ({ children, checked, onPress, style }: { children: React.ReactNode, checked?: boolean, onPress?: () => void, style?: ViewStyle }) => {
  const { setOpen } = React.useContext(ContextMenuContext);
  return (
    <TouchableOpacity 
      onPress={() => {
        onPress?.();
        setOpen(false);
      }} 
      style={[styles.item, styles.inset, style]}
    >
      <View style={styles.indicator}>
        {checked && <Circle size={8} color="#0F172A" fill="#0F172A" />}
      </View>
      {children}
    </TouchableOpacity>
  );
};

const ContextMenuLabel = ({ children, inset, style }: { children: React.ReactNode, inset?: boolean, style?: TextStyle }) => (
  <Text style={[styles.label, inset && styles.insetLabel, style]}>{children}</Text>
);

const ContextMenuSeparator = () => <View style={styles.separator} />;

const ContextMenuShortcut = ({ children, style }: { children: React.ReactNode, style?: TextStyle }) => (
  <Text style={[styles.shortcut, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    minWidth: 160,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 6,
  },
  inset: {
    paddingLeft: 32,
  },
  indicator: {
    position: "absolute",
    left: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  insetLabel: {
    paddingLeft: 32,
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  shortcut: {
    marginLeft: "auto",
    fontSize: 10,
    color: "#94A3B8",
    letterSpacing: 1,
  },
});

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
};
