import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string; // Kept for compatibility during migration
  activeClassName?: string;
  style?: any;
}

const NavLink = ({ to, children, style, ...props }: NavLinkProps) => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  
  // Logic to determine if 'to' matches current route
  // In RN, 'to' is usually the screen name
  const isActive = route.name === to;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate(to)}
      style={[style, isActive && styles.active]}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={isActive ? styles.activeText : styles.inactiveText}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  active: {
    opacity: 1,
  },
  activeText: {
    color: "#0EA5E9",
    fontWeight: "600",
  },
  inactiveText: {
    color: "#94A3B8",
  }
});

export { NavLink };
