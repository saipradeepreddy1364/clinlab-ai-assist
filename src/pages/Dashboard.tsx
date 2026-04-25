import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  FilePlus2,
  ClipboardList,
  Sparkles,
  Users,
  Activity,
  AlertCircle,
  ChevronRight,
  Upload,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

const actions = [
  { to: "NewCase", title: "New Case", desc: "Start clinical entry", icon: FilePlus2, color: "#0EA5E9" },
  { to: "LabRequisition", title: "Lab Request", desc: "Auto-fill from notes", icon: ClipboardList, color: "#8B5CF6" },
  { to: "AIEngine", title: "AI Guide", desc: "Suggest next step", icon: Sparkles, color: "#F43F5E" },
  { to: "Patients", title: "Records", desc: "Browse case history", icon: Users, color: "#F59E0B" },
];

const Dashboard = () => {
  const navigation = useNavigation<any>();
  const [userName, setUserName] = useState("Doctor");
  const [greeting, setGreeting] = useState("Good morning");
  const [stats, setStats] = useState({
    active: 0,
    labPending: 0,
    urgent: 0,
  });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const guestValue = await AsyncStorage.getItem("guestMode");
      const guest = guestValue === "true";
      setIsGuest(guest);

      if (guest) {
        setUserName("Guest");
        setStats({ active: 0, labPending: 0, urgent: 0 });
        setRecentCases([]);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata.full_name || "Doctor");
        
        const { data: cases, error } = await supabase
          .from('cases')
          .select('*')
          .eq('doctor_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && cases) {
          setRecentCases(cases.slice(0, 3).map(c => ({
            id: c.id,
            name: c.patient_name,
            tooth: c.tooth_number,
            dx: c.diagnosis,
            urgent: c.is_urgent
          })));
          
          setStats({
            active: cases.filter(c => c.status === 'in-progress').length,
            labPending: cases.filter(c => c.status === 'lab-sent').length,
            urgent: cases.filter(c => c.is_urgent).length,
          });
        }
      }
      setLoading(false);
    };

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    fetchData();
  }, []);

  return (
    <AppLayout>
      <View style={styles.container}>
        {/* Hero greeting */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.todayBadge}>
              <Activity size={10} color="#FFFFFF" />
              <Text style={styles.todayText}>Today</Text>
            </View>
            <Text style={styles.greetingText}>
              {greeting}, {isGuest ? "Guest" : `Dr. ${userName}`}
            </Text>
            {!isGuest && (
              <Text style={styles.statsSummary}>
                {stats.active} active cases · {stats.labPending} lab requests pending
              </Text>
            )}
            <View style={styles.heroActions}>
              {!isGuest && (
                <TouchableOpacity 
                  onPress={() => navigation.navigate("NewCase")}
                  style={styles.heroButton}
                >
                  <FilePlus2 size={14} color="#FFFFFF" />
                  <Text style={styles.heroButtonText}>New case</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={() => navigation.navigate("AIEngine")}
                style={styles.heroButton}
              >
                <Sparkles size={14} color="#FFFFFF" />
                <Text style={styles.heroButtonText}>
                  {isGuest ? "AI Clinical Guide" : "Ask AI"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {!isGuest && (
          <View style={styles.mainContent}>
            {/* Stats */}
            <View style={styles.statsGrid}>
              {[
                { label: "Active", value: stats.active, color: "#0EA5E9", icon: Activity },
                { label: "Lab", value: stats.labPending, color: "#8B5CF6", icon: ClipboardList },
                { label: "Urgent", value: stats.urgent, color: "#EF4444", icon: AlertCircle },
              ].map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <s.icon size={16} color={s.color} />
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Quick actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick actions</Text>
              <View style={styles.actionsGrid}>
                {actions.map((a) => (
                  <TouchableOpacity 
                    key={a.title} 
                    onPress={() => navigation.navigate(a.to)}
                    style={styles.actionCard}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: `${a.color}15` }]}>
                      <a.icon size={20} color={a.color} />
                    </View>
                    <Text style={styles.actionTitle}>{a.title}</Text>
                    <Text style={styles.actionDesc}>{a.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent cases */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent cases</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Patients")}>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.casesCard}>
                {recentCases.length > 0 ? (
                  recentCases.map((c, i) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => navigation.navigate("Patients", { screen: "PatientDetail", params: { id: c.id } })}
                      style={[styles.caseItem, i === recentCases.length - 1 && styles.noBorder]}
                    >
                      <View style={[styles.patientAvatar, { backgroundColor: c.urgent ? "#EF444415" : "#0EA5E915" }]}>
                        <Text style={[styles.avatarText, { color: c.urgent ? "#EF4444" : "#0EA5E9" }]}>
                          {c.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.caseInfo}>
                        <Text style={styles.patientName}>{c.name}</Text>
                        <Text style={styles.caseSubtext}>
                          Tooth {c.tooth} · {c.dx}
                        </Text>
                      </View>
                      {c.urgent ? (
                        <View style={styles.urgentBadge}>
                          <Text style={styles.urgentBadgeText}>Urgent</Text>
                        </View>
                      ) : (
                        <ChevronRight size={16} color="#94A3B8" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No recent cases found.</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("NewCase")}>
                      <Text style={styles.emptyLink}>Create your first case</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#0EA5E9",
    padding: 20,
    overflow: "hidden",
  },
  heroContent: {
    zIndex: 10,
  },
  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
    gap: 4,
  },
  todayText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  greetingText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  statsSummary: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 13,
    marginTop: 4,
  },
  heroActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  heroButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: 36,
    borderRadius: 12,
    gap: 6,
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  mainContent: {
    gap: 24,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0EA5E9",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (Dimensions.get("window").width - 44) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  actionDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  casesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
    overflow: "hidden",
  },
  caseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.6)",
    gap: 12,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
  },
  caseInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  caseSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  urgentBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgentBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
  },
  emptyLink: {
    fontSize: 13,
    color: "#0EA5E9",
    marginTop: 4,
    fontWeight: "500",
  },
});

export default Dashboard;
