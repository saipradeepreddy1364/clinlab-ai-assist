import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Platform, Alert, Modal, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Search, Loader2, User, Mail, Phone, Calendar, ShieldCheck, MoreVertical, Ban, UserMinus, CheckCircle2 } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

const OrgDoctors = () => {
  const navigation = useNavigation<any>();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_id', user.id)
        .eq('role', 'doctor')
        .in('status', ['approved', 'blocked'])
        .order('full_name', { ascending: true });

      if (!error && data) {
        setDoctors(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleBlockDoctor = async (doctorId: string, currentStatus: string) => {
    const isBlocking = currentStatus !== 'blocked';
    const actionLabel = isBlocking ? "Block" : "Unblock";
    
    const confirmAction = () => {
      if (Platform.OS === 'web') {
        return window.confirm(`Are you sure you want to ${actionLabel.toLowerCase()} this doctor? ${isBlocking ? "They will lose access to all clinical cases immediately." : ""}`);
      }
      return true; // Alert.alert handles this on mobile
    };

    const performAction = async () => {
      setProcessingId(doctorId);
      const { error } = await supabase
        .from('profiles')
        .update({ status: isBlocking ? 'blocked' : 'approved' })
        .eq('id', doctorId);

      if (error) {
        alert(error.message);
      } else {
        await fetchDoctors();
      }
      setProcessingId(null);
      setActiveMenu(null);
    };

    if (Platform.OS === 'web') {
      if (confirmAction()) performAction();
    } else {
      Alert.alert(
        `${actionLabel} Doctor`,
        `Are you sure you want to ${actionLabel.toLowerCase()} this doctor? ${isBlocking ? "They will lose access to all clinical cases immediately." : ""}`,
        [
          { text: "Cancel", style: "cancel" },
          { text: actionLabel, style: isBlocking ? "destructive" : "default", onPress: performAction }
        ]
      );
    }
  };

  const handleRemoveDoctor = async (doctorId: string) => {
    const performAction = async () => {
      setProcessingId(doctorId);
      // Detach doctor from org and reset status to pending
      const { error } = await supabase
        .from('profiles')
        .update({ 
          org_id: null, 
          status: 'pending' 
        })
        .eq('id', doctorId);

      if (error) {
        alert(error.message);
      } else {
        await fetchDoctors();
      }
      setProcessingId(null);
      setActiveMenu(null);
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to remove this doctor? They will be detached from your organization and moved back to pending status.")) {
        performAction();
      }
    } else {
      Alert.alert(
        "Remove Doctor",
        "Are you sure you want to remove this doctor? They will be detached from your organization and moved back to pending status.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: performAction }
        ]
      );
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.phone?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.countText}>{filteredDoctors.length} Registered Doctors</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Search size={18} color="#94A3B8" />
          </View>
          <TextInput 
            placeholder="Search by name, role, or phone..." 
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.list}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Loader2 size={24} color="#0EA5E9" />
              <Text style={styles.loadingText}>Loading doctors...</Text>
            </View>
          ) : filteredDoctors.length > 0 ? (
            filteredDoctors.map((d) => (
              <View key={d.id} style={styles.doctorCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{d.full_name?.charAt(0)}</Text>
                  </View>
                  <View style={styles.nameContainer}>
                    <View style={styles.nameRow}>
                      <Text style={styles.doctorName}>{d.full_name}</Text>
                      <ShieldCheck size={14} color="#10B981" />
                    </View>
                    <Text style={styles.specialtyText}>{d.specialization || "General Practitioner"}</Text>
                  </View>
                  <View style={[styles.statusBadge, d.status === 'blocked' && styles.statusBadgeBlocked]}>
                    <View style={[styles.statusDot, d.status === 'blocked' && styles.statusDotBlocked]} />
                    <Text style={[styles.statusText, d.status === 'blocked' && styles.statusTextBlocked]}>
                      {d.status === 'blocked' ? 'Blocked' : 'Active'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setActiveMenu(d.id)}
                    style={styles.moreButton}
                  >
                    <MoreVertical size={20} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* Dropdown Menu Modal */}
                  <Modal
                    visible={activeMenu === d.id}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setActiveMenu(null)}
                  >
                    <Pressable 
                      style={styles.modalBackdrop} 
                      onPress={() => setActiveMenu(null)}
                    >
                      <View style={styles.menuContainer}>
                        <View style={styles.menuHeader}>
                          <Text style={styles.menuTitle}>Doctor Actions</Text>
                          <Text style={styles.menuSubtitle}>{d.full_name}</Text>
                        </View>
                        
                        <TouchableOpacity 
                          style={styles.menuItem}
                          onPress={() => {
                            setActiveMenu(null);
                            handleBlockDoctor(d.id, d.status);
                          }}
                        >
                          <View style={[styles.menuIconBox, { backgroundColor: d.status === 'blocked' ? '#F0FDF4' : '#FEF2F2' }]}>
                            {d.status === 'blocked' ? (
                              <CheckCircle2 size={18} color="#10B981" />
                            ) : (
                              <Ban size={18} color="#EF4444" />
                            )}
                          </View>
                          <View>
                            <Text style={[styles.menuText, { color: d.status === 'blocked' ? "#10B981" : "#EF4444" }]}>
                              {d.status === 'blocked' ? 'Unblock Access' : 'Block Usage'}
                            </Text>
                            <Text style={styles.menuDesc}>
                              {d.status === 'blocked' ? 'Restore clinical access' : 'Restrict temporary usage'}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.menuItem}
                          onPress={() => {
                            setActiveMenu(null);
                            handleRemoveDoctor(d.id);
                          }}
                        >
                          <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                            <UserMinus size={18} color="#EF4444" />
                          </View>
                          <View>
                            <Text style={[styles.menuText, { color: "#EF4444" }]}>Remove from Org</Text>
                            <Text style={styles.menuDesc}>Detach from your organization</Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.cancelMenuButton}
                          onPress={() => setActiveMenu(null)}
                        >
                          <Text style={styles.cancelMenuText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </Pressable>
                  </Modal>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Phone size={12} color="#64748B" />
                    <Text style={styles.detailText} numberOfLines={1}>{d.phone || "No phone"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Calendar size={12} color="#64748B" />
                    <Text style={styles.detailText}>Joined {new Date(d.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => navigation.navigate("OrgCases", { doctorId: d.id })}
                >
                  <Text style={styles.viewButtonText}>View Clinical Cases</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <User size={40} color="#CBD5E1" strokeWidth={1.5} />
              <Text style={styles.emptyText}>No doctors found.</Text>
              <Text style={styles.emptySubtext}>Doctors must register and be approved to appear here.</Text>
            </View>
          )}
        </View>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  list: {
    gap: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  doctorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#0EA5E910",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0EA5E9",
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  specialtyText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
    textTransform: "uppercase",
  },
  statusBadgeBlocked: {
    backgroundColor: "#FEF2F2",
  },
  statusDotBlocked: {
    backgroundColor: "#EF4444",
  },
  statusTextBlocked: {
    color: "#991B1B",
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  menuContainer: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 25,
  },
  menuHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 20,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    fontSize: 15,
    fontWeight: "700",
  },
  menuDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  cancelMenuButton: {
    marginTop: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  cancelMenuText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: '45%',
  },
  detailText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  viewButton: {
    height: 40,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0EA5E9",
  },
  emptyState: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
  },
});

export default OrgDoctors;
