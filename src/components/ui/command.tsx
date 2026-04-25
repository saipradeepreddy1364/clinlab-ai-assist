import * as React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ViewStyle, TextStyle } from "react-native";
import { Search } from "lucide-react-native";
import { Dialog, DialogContent, DialogDescription } from "./dialog";

const Command = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => {
  return <View style={[styles.command, style]}>{children}</View>;
};

const CommandDialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={styles.dialogContent}>
        <DialogDescription style={{ display: "none" }}>
          Search for actions or tools.
        </DialogDescription>
        <Command>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = ({ value, onChangeText, placeholder, style }: { value?: string, onChangeText?: (text: string) => void, placeholder?: string, style?: ViewStyle }) => (
  <View style={[styles.inputWrapper, style]}>
    <View style={styles.searchIcon}>
      <Search size={18} color="#64748B" />
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      style={styles.input}
    />
  </View>
);

const CommandList = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <ScrollView style={[styles.list, style]}>{children}</ScrollView>
);

const CommandEmpty = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyText}>{children}</Text>
  </View>
);

const CommandGroup = ({ heading, children, style }: { heading?: string, children: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.group, style]}>
    {heading && <Text style={styles.groupHeading}>{heading}</Text>}
    {children}
  </View>
);

const CommandSeparator = () => <View style={styles.separator} />;

const CommandItem = ({ children, onSelect, style }: { children: React.ReactNode, onSelect?: () => void, style?: ViewStyle }) => (
  <TouchableOpacity onPress={onSelect} style={[styles.item, style]}>
    {children}
  </TouchableOpacity>
);

const CommandShortcut = ({ children, style }: { children: React.ReactNode, style?: TextStyle }) => (
  <Text style={[styles.shortcut, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  command: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    flex: 1,
  },
  dialogContent: {
    padding: 0,
    overflow: "hidden",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: "#0F172A",
  },
  list: {
    maxHeight: 300,
  },
  empty: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
  },
  group: {
    padding: 4,
  },
  groupHeading: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: -4,
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
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
