import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from "react-native";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

const TabsContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const Tabs = ({ defaultValue, value: controlledValue, onValueChange, children, style }: TabsProps) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  }, [controlledValue, onValueChange]);

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <View style={style}>{children}</View>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.list, style]}>{children}</View>
);

const TabsTrigger = ({ value, children, style }: { value: string, children: React.ReactNode, style?: ViewStyle }) => {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <TouchableOpacity 
      onPress={() => onValueChange?.(value)}
      style={[styles.trigger, isActive && styles.triggerActive, style]}
    >
      {typeof children === "string" ? (
        <Text style={[styles.triggerText, isActive && styles.triggerTextActive]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const TabsContent = ({ value, children, style }: { value: string, children: React.ReactNode, style?: ViewStyle }) => {
  const { value: activeValue } = React.useContext(TabsContext);
  if (activeValue !== value) return null;
  return <View style={style}>{children}</View>;
};

const styles = StyleSheet.create({
  list: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  trigger: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  triggerActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  triggerTextActive: {
    color: "#0F172A",
  },
});

export { Tabs, TabsList, TabsTrigger, TabsContent };
