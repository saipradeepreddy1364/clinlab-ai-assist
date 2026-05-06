import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Search, Loader2, User, Mail, Phone, Calendar, ShieldCheck } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

const OrgDoctors = () => {
  const navigation = useNavigation<any>();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('org_id', user.id)
          .eq('role', 'doctor')
          .eq('status', 'approved')
          .order('full_name', { ascending: true });

        if (!error && data) {
          setDoctors(data);
        }
      }
      setLoading(false);
    };

    fetchDoctors();
  }, []);

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
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Active</Text>
                  </View>
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
