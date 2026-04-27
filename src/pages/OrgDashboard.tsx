import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Activity,
  ClipboardList,
  Stethoscope,
  Users,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  UserCheck,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

const { width } = Dimensions.get("window");

const OrgDashboard = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    lab: 0,
    checkup: 0,
    totalDoctors: 0,
  });
  const [doctors, setDoctors] = useState<any[]>([]);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Stats
      const { data: cases, error: caseError } = await supabase
        .from('cases')
        .select('*')
        .eq('org_id', user.id);

      if (!caseError && cases) {
        setStats({
          active: cases.filter(c => c.status === 'in-progress').length,
          lab: cases.filter(c => c.status === 'lab-sent').length,
          checkup: cases.filter(c => c.status === 'checkup').length,
          totalDoctors: new Set(cases.map(c => c.doctor_id)).size,
        });
        setRecentCases(cases.slice(0, 5));
      }

      // 2. Fetch Doctors in Org
      const { data: profileList } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_id', user.id)
        .eq('role', 'doctor');
      
      if (profileList) {
        setDoctors(profileList);
      }

      // 3. Fetch Org Profile
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (p) setProfile(p);

      // 4. Check for Pending Approvals
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', user.id)
        .eq('role', 'doctor')
        .eq('status', 'pending');
      
      setPendingCount(count || 0);

      setLoading(false);
    };

    fetchData();

    // Add Real-time subscription for Pending Approvals
    const channel = supabase
      .channel('org-dashboard-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        console.log("OrgDashboard: Detected profile change, refreshing...");
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <View style={styles.container}>
        {/* Welcome Card (Personalized) */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeGreeting}>Welcome back,</Text>
            <Text style={styles.welcomeName}>{profile?.full_name || "Organization"}</Text>
            <View style={styles.verifiedBadge}>
              <UserCheck size={12} color="#10B981" />
              <Text style={styles.verifiedText}>Verified Clinical Hub</Text>
            </View>
          </View>
          <View style={styles.welcomeIconBox}>
            <Stethoscope size={32} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Clinical Overview</Text>
          <Text style={styles.subtext}>Monitor activity across all {doctors.length} departments.</Text>
        </View>
        
        {/* Pending Approval Alert (Only shows if there are requests) */}
        {pendingCount > 0 && (
          <TouchableOpacity 
            style={styles.approvalAlert}
            onPress={() => navigation.navigate("ApprovalCenter")}
          >
            <View style={styles.alertIconBox}>
              <Users size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Doctor Approval Required</Text>
              <Text style={styles.alertSubtitle}>
                {pendingCount} {pendingCount === 1 ? 'doctor is' : 'doctors are'} waiting for your access approval.
              </Text>
            </View>
            <ChevronRight size={18} color="#0EA5E9" />
          </TouchableOpacity>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: "#0EA5E9" }]}>
            <Activity size={20} color="#0EA5E9" />
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active Cases</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#8B5CF6" }]}>
            <ClipboardList size={20} color="#8B5CF6" />
            <Text style={styles.statValue}>{stats.lab}</Text>
            <Text style={styles.statLabel}>Lab Requests</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#10B981" }]}>
            <Stethoscope size={20} color="#10B981" />
            <Text style={styles.statValue}>{stats.checkup}</Text>
            <Text style={styles.statLabel}>Checkups</Text>
          </View>
        </View>

        {/* Doctors Performance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <UserCheck size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>Medical Staff</Text>
            </View>
            <Text style={styles.badge}>{doctors.length} Active</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorScroll}>
            {doctors.map((dr) => (
              <TouchableOpacity key={dr.id} style={styles.drCard}>
                <View style={styles.drAvatar}>
                  <Text style={styles.drAvatarText}>{dr.full_name?.charAt(0)}</Text>
                </View>
                <Text style={styles.drName} numberOfLines={1}>{dr.full_name}</Text>
                <Text style={styles.drSpecialty}>{dr.specialization || "Clinical"}</Text>
                <View style={styles.drStatus}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.statusText}>Online</Text>
                </View>
              </TouchableOpacity>
            ))}
            {doctors.length === 0 && (
              <View style={styles.emptyDr}>
                <Text style={styles.emptyText}>No doctors registered yet.</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Recent Organization Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Cases</Text>
            <TouchableOpacity onPress={() => navigation.navigate("OrgCases")}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {recentCases.map((c, i) => (
              <TouchableOpacity 
                key={c.id} 
                style={[styles.activityItem, i === recentCases.length - 1 && styles.noBorder]}
                onPress={() => navigation.navigate("Patients", { screen: "PatientDetail", params: { id: c.id } })}
              >
                <View style={[styles.activityIcon, { backgroundColor: c.is_urgent ? "#FEF2F2" : "#F0F9FF" }]}>
                  {c.is_urgent ? <AlertCircle size={16} color="#EF4444" /> : <FileText size={16} color="#0EA5E9" />}
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{c.patient_name}</Text>
                  <Text style={styles.activityDesc}>By {c.doctor_name || "Doctor"}</Text>
                </View>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityTime}>{new Date(c.created_at).toLocaleDateString()}</Text>
                  <ChevronRight size={14} color="#94A3B8" />
                </View>
              </TouchableOpacity>
            ))}
            {recentCases.length === 0 && (
              <View style={styles.emptyActivity}>
                <Text style={styles.emptyText}>No recent activity found.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Analytics Card */}
        <TouchableOpacity style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <TrendingUp size={24} color="#FFFFFF" />
            <Text style={styles.analyticsTitle}>Real-time Insights</Text>
          </View>
          <Text style={styles.analyticsText}>
            You have <Text style={{fontWeight: '700', color: '#FFFFFF'}}>{stats.active} active cases</Text> being handled by <Text style={{fontWeight: '700', color: '#FFFFFF'}}>{doctors.length} staff members</Text>. 
            {stats.lab > 0 ? ` There are ${stats.lab} pending lab results to review.` : " All lab results are up to date."}
          </Text>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => navigation.navigate("OrgReports")}
          >
            <Text style={styles.analyticsButtonText}>Detailed Reports</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    gap: 2,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtext: {
    fontSize: 13,
    color: "#64748B",
  },
  welcomeCard: {
    backgroundColor: "#0EA5E9",
    borderRadius: 28,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginVertical: 4,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  welcomeIconBox: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderLeftWidth: 4,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0EA5E9",
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: "#F1F5F9",
    color: "#475569",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  doctorScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  drCard: {
    width: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  drAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#0EA5E915",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  drAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0EA5E9",
  },
  drName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  drSpecialty: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },
  drStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  activityList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  activityDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityTime: {
    fontSize: 11,
    color: "#94A3B8",
  },
  analyticsCard: {
    backgroundColor: "#0F172A",
    borderRadius: 28,
    padding: 24,
    gap: 12,
  },
  analyticsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  analyticsText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 20,
  },
  analyticsButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  analyticsButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyDr: {
    width: width - 40,
    padding: 20,
    alignItems: "center",
  },
  emptyActivity: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
  },
  approvalAlert: {
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  alertSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
});

export default OrgDashboard;
