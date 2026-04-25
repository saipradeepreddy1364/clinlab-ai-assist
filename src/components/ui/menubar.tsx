import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ViewStyle, TextStyle } from "react-native";

// Menubar — simplified native implementation using a horizontal row of menus
const MenubarContext = React.createContext<{ activeMenu: string | null; setActiveMenu: (v: string | null) => void }>({
  activeMenu: null, setActiveMenu: () => {},
});

export const Menubar = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  return (
    <MenubarContext.Provider value={{ activeMenu, setActiveMenu }}>
      <View style={[styles.menubar, style]}>{children}</View>
    </MenubarContext.Provider>
  );
};

export const MenubarMenu = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;

export const MenubarTrigger = ({ children, menuId, style }: { children: React.ReactNode; menuId?: string; style?: ViewStyle }) => {
  const { setActiveMenu, activeMenu } = React.useContext(MenubarContext);
  const id = menuId || String(children);
  return (
    <TouchableOpacity onPress={() => setActiveMenu(activeMenu === id ? null : id)} style={[styles.trigger, style]}>
      <Text style={styles.triggerText}>{children}</Text>
    </TouchableOpacity>
  );
};

export const MenubarContent = ({ children, menuId, style }: { children: React.ReactNode; menuId?: string; style?: ViewStyle }) => {
  const { activeMenu, setActiveMenu } = React.useContext(MenubarContext);
  const id = menuId || "";
  if (activeMenu !== id) return null;
  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => setActiveMenu(null)}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setActiveMenu(null)}>
        <View style={[styles.content, style]}>{children}</View>
      </TouchableOpacity>
    </Modal>
  );
};

export const MenubarItem = ({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) => {
  const { setActiveMenu } = React.useContext(MenubarContext);
  return (
    <TouchableOpacity onPress={() => { onPress?.(); setActiveMenu(null); }} style={[styles.item, style]}>
      {typeof children === "string" ? <Text style={styles.itemText}>{children}</Text> : children}
    </TouchableOpacity>
  );
};

export const MenubarSeparator = () => <View style={styles.separator} />;
export const MenubarLabel = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.label, style]}>{children}</Text>
);
export const MenubarShortcut = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[styles.shortcut, style]}>{children}</Text>
);
export const MenubarGroup = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
export const MenubarRadioGroup = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
export const MenubarRadioItem = ({ children, checked, onPress, style }: { children: React.ReactNode; checked?: boolean; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, style]}>
    <Text style={styles.itemText}>{children}</Text>
  </TouchableOpacity>
);
export const MenubarCheckboxItem = ({ children, checked, onPress, style }: { children: React.ReactNode; checked?: boolean; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, style]}>
    <Text style={styles.itemText}>{children}</Text>
  </TouchableOpacity>
);
export const MenubarSub = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
export const MenubarSubTrigger = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.item, style]}>
    <Text style={styles.itemText}>{children}</Text>
  </View>
);
export const MenubarSubContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={style}>{children}</View>
);
export const MenubarPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const styles = StyleSheet.create({
  menubar: { flexDirection: "row", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 4 },
  trigger: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  triggerText: { fontSize: 14, color: "#0F172A", fontWeight: "500" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.1)", justifyContent: "flex-start", alignItems: "flex-start" },
  content: { backgroundColor: "#FFFFFF", borderRadius: 10, padding: 4, marginTop: 40, marginLeft: 8, minWidth: 160, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  item: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 10, borderRadius: 6 },
  itemText: { fontSize: 14, color: "#0F172A" },
  separator: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 4 },
  label: { paddingHorizontal: 8, paddingVertical: 6, fontSize: 12, fontWeight: "600", color: "#64748B" },
  shortcut: { marginLeft: "auto", fontSize: 10, color: "#94A3B8" },
});
