import * as React from "react";
import { View, StyleSheet, LayoutAnimation, Platform, UIManager, ViewStyle } from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CollapsibleContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: false, setOpen: () => {},
});

export const Collapsible = ({
  children,
  open,
  onOpenChange,
  style,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: ViewStyle;
}) => {
  const [internalOpen, setInternalOpen] = React.useState(open ?? false);
  const isOpen = open ?? internalOpen;

  const setOpen = (val: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInternalOpen(val);
    onOpenChange?.(val);
  };

  return (
    <CollapsibleContext.Provider value={{ open: isOpen, setOpen }}>
      <View style={style}>{children}</View>
    </CollapsibleContext.Provider>
  );
};

export const CollapsibleTrigger = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const { open, setOpen } = React.useContext(CollapsibleContext);
  // Children must be a TouchableOpacity or pressable; we just clone and inject onPress
  return React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, { onPress: () => setOpen(!open) })
    : null;
};

export const CollapsibleContent = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const { open } = React.useContext(CollapsibleContext);
  if (!open) return null;
  return <View style={style}>{children}</View>;
};
