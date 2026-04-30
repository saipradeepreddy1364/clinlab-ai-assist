import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        const role = profile?.role || session.user.user_metadata?.role || 'doctor';
        
        if (role === 'organization') {
          navigation.replace("OrgDashboard");
        } else {
          navigation.replace("Dashboard");
        }
      } else {
        navigation.replace("Login");
      }
    };

    checkAuth();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <Image 
          source={{ uri: "/pwa-512x512.png" }} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <ActivityIndicator size="small" color="#0EA5E9" style={styles.loader} />
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
  logoWrapper: {
    width: 280,
    height: 280,
    marginBottom: 20,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  loader: {
    marginVertical: 20,
  },
  tagline: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
});

export default SplashScreen;
