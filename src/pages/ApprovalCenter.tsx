import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { UserCheck, UserX, Clock, ChevronLeft, ShieldCheck } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import AppLayout from "@/components/AppLayout";

const ApprovalCenter = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [tab, setTab] = useState<"pending" | "approved">("pending");

  const fetchDoctors = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('org_id', user.id)
      .eq('role', 'doctor')
      .order('created_at', { ascending: false });

    if (data) setDoctors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();

    // Subscribe to profile changes for this org
    const subscription = supabase
      .channel('approval-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles'
      }, () => {
        fetchDoctors();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAction = async (doctorId: string, status: 'approved' | 'rejected' | 'pending') => {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', doctorId);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      fetchDoctors();
    }
  };

  const filteredDoctors = doctors.filter(d => d.status === tab);

  return (
    <AppLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Approval Center</Text>
            <Text style={styles.subtitle}>Manage clinical access requests</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, tab === "pending" && styles.tabActive]}
            onPress={() => setTab("pending")}
          >
            <Text style={[styles.tabText, tab === "pending" && styles.tabTextActive]}>
              Pending ({doctors.filter(d => d.status === 'pending').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, tab === "approved" && styles.tabActive]}
            onPress={() => setTab("approved")}
          >
            <Text style={[styles.tabText, tab === "approved" && styles.tabTextActive]}>
              Approved
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0EA5E9" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => (
                <View key={doc.id} style={styles.doctorCard}>
                  <View style={styles.doctorInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{doc.full_name?.charAt(0) || "D"}</Text>
                    </View>
                    <View style={styles.details}>
                      <Text style={styles.doctorName}>{doc.full_name}</Text>
                      <Text style={styles.doctorMeta}>{doc.specialization || "General Dentist"}</Text>
                      <View style={styles.timeRow}>
                        <Clock size={12} color="#94A3B8" />
                        <Text style={styles.timeText}>
                          Joined {new Date(doc.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actions}>
                    {tab === "pending" ? (
                      <>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleAction(doc.id, 'rejected')}
                        >
                          <UserX size={18} color="#EF4444" />
                          <Text style={styles.rejectText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.approveButton]}
                          onPress={() => handleAction(doc.id, 'approved')}
                        >
                          <UserCheck size={18} color="#FFFFFF" />
                          <Text style={styles.approveText}>Approve</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={styles.approvedBadge}>
                        <ShieldCheck size={16} color="#10B981" />
                        <Text style={styles.approvedBadgeText}>Verified</Text>
                        <TouchableOpacity 
                          onPress={() => handleAction(doc.id, 'pending')}
                          style={styles.revokeButton}
                        >
                          <Text style={styles.revokeText}>Revoke</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No {tab} requests found</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  tab: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#0EA5E9",
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  doctorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 16,
  },
  doctorInfo: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0EA5E9",
  },
  details: {
    flex: 1,
    gap: 2,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  doctorMeta: {
    fontSize: 13,
    color: "#64748B",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  approveButton: {
    backgroundColor: "#0EA5E9",
  },
  approveText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  rejectButton: {
    backgroundColor: "#FEE2E2",
  },
  rejectText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
  },
  approvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  approvedBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
    flex: 1,
  },
  revokeButton: {
    padding: 8,
  },
  revokeText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  }
});

export default ApprovalCenter;
