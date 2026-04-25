import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkAuth = async () => {
      const guestMode = await AsyncStorage.getItem("guestMode");
      const { data: { session } } = await supabase.auth.getSession();

      if (session || guestMode === "true") {
        navigation.replace("Dashboard");
      } else {
        navigation.replace("Login");
      }
    };

    const timer = setTimeout(checkAuth, 1000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ClinLab</Text>
      <ActivityIndicator size="large" color="#0EA5E9" style={styles.loader} />
      <Text style={styles.tagline}>AI Dental Clinical Assistant</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: "700",
    color: "#0EA5E9",
    marginBottom: 20,
  },
  loader: {
    marginBottom: 20,
  },
  tagline: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
});

export default SplashScreen;
