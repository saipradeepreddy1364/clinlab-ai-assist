import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  LayoutDashboard,
  FilePlus2,
  Sparkles,
  ClipboardList,
  Users,
  Upload,
  Moon,
  Sun,
  Stethoscope,
  Bell,
  ChevronLeft,
  LogOut,
  LayoutGrid,
  FileSearch,
} from "lucide-react-native"; // Using native version
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationSidebar } from "./NotificationSidebar";

const { width } = Dimensions.get("window");

const doctorTabs = [
  { name: "Dashboard", label: "Home", icon: LayoutDashboard },
  { name: "NewCase", label: "New", icon: FilePlus2 },
  { name: "AIEngine", label: "AI", icon: Sparkles, primary: true },
  { name: "Patients", label: "Records", icon: Users },
  { name: "Uploads", label: "Files", icon: Upload },
];

const orgTabs = [
  { name: "OrgDashboard", label: "Overview", icon: LayoutGrid },
  { name: "OrgCases", label: "Cases", icon: ClipboardList },
  { name: "AIEngine", label: "AI", icon: Sparkles, primary: true },
  { name: "Patients", label: "Records", icon: Users },
  { name: "OrgReports", label: "Reports", icon: FileSearch },
];

const titleMap: Record<string, string> = {
  "Dashboard": "Clinical Assistant",
  "OrgDashboard": "Organization Hub",
  "NewCase": "New Case",
  "AIEngine": "AI Clinical Guide",
  "LabRequisition": "Lab Requisition",
  "Patients": "Patient Records",
  "OrgCases": "Organization Cases",
  "OrgReports": "Patient Reports",
  "Uploads": "File Uploads",
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme, toggle } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [role, setRole] = useState<string>("guest");
  
  useNotifications();

  useEffect(() => {
    let authListener: any;

    const checkUser = async () => {
      const guestValue = await AsyncStorage.getItem("guestMode");
      const isGuest = guestValue === "true";
      
      if (isGuest) {
        setRole("guest");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("AppLayout: No session found");
        navigation.navigate("Login");
        return;
      }

      // 1. Try metadata first (faster)
      const metaRole = session.user.user_metadata?.role;
      if (metaRole) {
        console.log("AppLayout: Detected role from metadata:", metaRole);
        setRole(metaRole);
      }

      // 2. Always fetch profile to be sure and get latest status
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        console.log("AppLayout: Detected role from profile table:", profile.role);
        setRole(profile.role);
      } else if (error) {
        console.error("AppLayout: Error fetching profile:", error);
      }
    };

    checkUser();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AppLayout: Auth state change:", event);
      if (session) {
        checkUser();
      } else {
        setRole("guest");
      }
    });
    authListener = data;

    return () => {
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, [navigation]);

  const activeTabs = role === "organization" ? orgTabs : doctorTabs;

  const handleLogout = async () => {
    await AsyncStorage.removeItem("guestMode");
    await supabase.auth.signOut();
    navigation.navigate("Login");
  };

  const isHome = route.name === "Dashboard";
  const title = titleMap[route.name] || "ClinLab";
  const isDark = theme === "dark";

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* App header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Stethoscope size={18} color="#FFFFFF" />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.brandText}>ClinLab</Text>
              <View style={[styles.roleBadge, role === 'organization' ? styles.roleBadgeOrg : styles.roleBadgeDr]}>
                <Text style={styles.roleBadgeText}>{role}</Text>
              </View>
            </View>
            <Text style={[styles.headerTitle, isDark && styles.textWhite]}>{title}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggle} style={styles.iconButton}>
            {isDark ? <Sun size={18} color="#FFFFFF" /> : <Moon size={18} color="#0F172A" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <LogOut size={18} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsNotificationsOpen(true)}
            style={styles.iconButton}
          >
            <Bell size={18} color={isDark ? "#FFFFFF" : "#0F172A"} />
            {hasNewNotifications && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {children}
      </ScrollView>

      {/* Notifications Sidebar */}
      <NotificationSidebar 
        open={isNotificationsOpen} 
        onOpenChange={setIsNotificationsOpen} 
      />

      {/* Bottom tab bar */}
      <View style={[styles.tabBar, isDark && styles.tabBarDark]}>
        {activeTabs.map((tab) => {
          const isActive = route.name === tab.name;
          if (tab.primary) {
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => navigation.navigate(tab.name)}
                style={styles.primaryTab}
              >
                <View style={styles.primaryTabInner}>
                  <Sparkles size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              style={styles.tabItem}
            >
              <tab.icon size={20} color={isActive ? "#0EA5E9" : "#94A3B8"} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    ...(Platform.OS === 'web' ? { 
      position: 'fixed' as any, 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      height: '100%' as any,
      width: '100%' as any,
    } : {}),
  },
  containerDark: {
    backgroundColor: "#0F172A",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.6)",
  },
  headerDark: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderBottomColor: "rgba(30, 41, 59, 0.6)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 11,
    color: "#64748B",
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleBadgeOrg: {
    backgroundColor: "#F1F5F9",
  },
  roleBadgeDr: {
    backgroundColor: "#E0F2FE",
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  textWhite: {
    color: "#FFFFFF",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },
  content: {
    flex: 1,
    ...(Platform.OS === 'web' ? { overflowY: 'auto' as any } : {}),
  },
  contentInner: {
    paddingBottom: 20,
  },
  tabBar: {
    height: 70,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    flexDirection: "row",
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(226, 232, 240, 0.6)",
  },
  tabBarDark: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderTopColor: "rgba(30, 41, 59, 0.6)",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
  },
  tabLabelActive: {
    color: "#0EA5E9",
  },
  primaryTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTabInner: {
    width: 48,
    height: 48,
    marginTop: -20,
    borderRadius: 16,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default AppLayout;
