import * as React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ViewStyle, TextStyle, Animated, Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const DrawerContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

const Drawer = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
  const [internalOpen, setInternalOpen] = React.useState(open ?? false);
  const isOpen = open ?? internalOpen;
  const setOpen = (val: boolean) => {
    setInternalOpen(val);
    onOpenChange?.(val);
  };
  return (
    <DrawerContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </DrawerContext.Provider>
  );
};

const DrawerTrigger = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => {
  const { setOpen } = React.useContext(DrawerContext);
  return <TouchableOpacity onPress={() => setOpen(true)} style={style}>{children}</TouchableOpacity>;
};

const DrawerClose = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => {
  const { setOpen } = React.useContext(DrawerContext);
  return <TouchableOpacity onPress={() => setOpen(false)} style={style}>{children}</TouchableOpacity>;
};

const DrawerContent = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => {
  const { open, setOpen } = React.useContext(DrawerContext);
  return (
    <Modal transparent visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)} />
      <View style={[styles.content, style]}>
        <View style={styles.handle} />
        {children}
      </View>
    </Modal>
  );
};

const DrawerHeader = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.header, style]}>{children}</View>
);

const DrawerFooter = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const DrawerTitle = ({ children, style }: { children: React.ReactNode, style?: TextStyle }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

const DrawerDescription = ({ children, style }: { children: React.ReactNode, style?: TextStyle }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingTop: 8,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    padding: 16,
    gap: 6,
  },
  footer: {
    padding: 16,
    gap: 8,
    marginTop: "auto",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  description: {
    fontSize: 14,
    color: "#64748B",
  },
});

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription };
