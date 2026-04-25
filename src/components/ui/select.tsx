import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, ViewStyle, TextStyle } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";

const SelectContext = React.createContext<{
  open?: boolean;
  setOpen?: (open: boolean) => void;
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const Select = ({ children, defaultValue, value: controlledValue, onValueChange }: any) => {
  const [open, setOpen] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ open, setOpen, value, onValueChange: handleValueChange }}>
      <View>{children}</View>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, style }: { children?: React.ReactNode, style?: ViewStyle }) => {
  const { setOpen } = React.useContext(SelectContext);
  return (
    <TouchableOpacity 
      style={[styles.trigger, style]} 
      onPress={() => setOpen?.(true)}
    >
      <View style={styles.triggerContent}>{children}</View>
      <ChevronDown size={16} color="#64748B" />
    </TouchableOpacity>
  );
};

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = React.useContext(SelectContext);
  return (
    <Text style={styles.valueText}>
      {value || placeholder}
    </Text>
  );
};

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen } = React.useContext(SelectContext);
  return (
    <Modal visible={open} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={() => setOpen?.(false)}
      >
        <View style={styles.content}>
          <View style={styles.innerContent}>
            {children}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const SelectItem = ({ value, children, style }: { value: string, children: React.ReactNode, style?: ViewStyle }) => {
  const { value: activeValue, onValueChange } = React.useContext(SelectContext);
  const isActive = activeValue === value;

  return (
    <TouchableOpacity 
      style={[styles.item, style]} 
      onPress={() => onValueChange?.(value)}
    >
      <View style={styles.itemIndicator}>
        {isActive && <Check size={14} color="#0EA5E9" />}
      </View>
      <Text style={[styles.itemText, isActive && styles.itemTextActive]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const SelectGroup = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
const SelectLabel = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.label}>{children}</Text>
);
const SelectSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  trigger: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  triggerContent: {
    flex: 1,
  },
  valueText: {
    fontSize: 14,
    color: "#0F172A",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  innerContent: {
    padding: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  itemIndicator: {
    width: 20,
    alignItems: "center",
    marginRight: 8,
  },
  itemText: {
    fontSize: 14,
    color: "#475569",
  },
  itemTextActive: {
    color: "#0F172A",
    fontWeight: "600",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    textTransform: "uppercase",
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 4,
  }
});

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
