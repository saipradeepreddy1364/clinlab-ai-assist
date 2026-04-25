import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const NotFound = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", route.name);
  }, [route.name]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Oops! Page not found</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
          <Text style={styles.link}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 64,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#64748B",
    marginBottom: 24,
  },
  link: {
    fontSize: 16,
    color: "#0EA5E9",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default NotFound;
