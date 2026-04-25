import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager, ViewStyle, TextStyle } from "react-native";
import { ChevronDown } from "lucide-react-native";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccordionContext = React.createContext<{
  openValue?: string;
  setOpenValue: (value: string) => void;
  type: "single" | "multiple";
}>({ setOpenValue: () => {}, type: "single" });

const Accordion = ({ 
  children, 
  type = "single", 
  value, 
  onValueChange 
}: { 
  children: React.ReactNode, 
  type?: "single" | "multiple",
  value?: string,
  onValueChange?: (value: string) => void
}) => {
  const [internalValue, setInternalValue] = React.useState(value || "");

  const setOpenValue = (val: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newVal = internalValue === val ? "" : val;
    setInternalValue(newVal);
    onValueChange?.(newVal);
  };

  return (
    <AccordionContext.Provider value={{ openValue: value || internalValue, setOpenValue, type }}>
      <View style={styles.accordion}>{children}</View>
    </AccordionContext.Provider>
  );
};

const AccordionItem = ({ value, children, style }: { value: string, children: React.ReactNode, style?: ViewStyle }) => {
  return <View style={[styles.item, style]}>{React.Children.map(children, child => 
    React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { value }) : child
  )}</View>;
};

const AccordionTrigger = ({ value, children, style }: { value?: string, children: React.ReactNode, style?: ViewStyle }) => {
  const { openValue, setOpenValue } = React.useContext(AccordionContext);
  const isOpen = openValue === value;

  return (
    <TouchableOpacity 
      onPress={() => value && setOpenValue(value)}
      style={[styles.trigger, style]}
    >
      <View style={styles.triggerContent}>{children}</View>
      <ChevronDown 
        size={16} 
        color="#64748B" 
        style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }} 
      />
    </TouchableOpacity>
  );
};

const AccordionContent = ({ value, children, style }: { value?: string, children: React.ReactNode, style?: ViewStyle }) => {
  const { openValue } = React.useContext(AccordionContext);
  const isOpen = openValue === value;

  if (!isOpen) return null;

  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  accordion: {
    width: "100%",
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  triggerContent: {
    flex: 1,
  },
  content: {
    paddingBottom: 16,
  },
});

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
