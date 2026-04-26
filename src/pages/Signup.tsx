import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Stethoscope, Loader2, ChevronDown } from "lucide-react-native";
import { supabase } from "@/lib/supabase";

const Signup = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [authType, setAuthType] = useState<"doctor" | "organization">("doctor");
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [orgModalVisible, setOrgModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: "",
    organization: { id: "", name: "" },
    role: "dentist",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigation.navigate("Dashboard");
      }
    });

    const fetchOrgs = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'organization');
      
      if (data) setOrganizations(data);
    };

    fetchOrgs();
  }, [navigation]);

  const handleSignup = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            role: authType,
            status: authType === "organization" ? "approved" : "pending",
            specialization: authType === "doctor" ? formData.specialization : null,
            org_id: authType === "doctor" ? formData.organization.id : null,
            org_name: authType === "doctor" ? formData.organization.name : null,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        navigation.navigate("Dashboard");
      }
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Stethoscope size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>ClinLab</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Choose your account type to continue.</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, authType === "doctor" && styles.tabActive]}
            onPress={() => setAuthType("doctor")}
          >
            <Text style={[styles.tabText, authType === "doctor" && styles.tabTextActive]}>Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, authType === "organization" && styles.tabActive]}
            onPress={() => setAuthType("organization")}
          >
            <Text style={[styles.tabText, authType === "organization" && styles.tabTextActive]}>Organization</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {authType === "organization" ? "Organization Name" : "Full name"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={authType === "organization" ? "e.g. City Dental Clinic" : "Dr. Aarav Singh"}
              value={formData.name}
              onChangeText={(v) => setFormData({ ...formData, name: v })}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@clinic.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(v) => setFormData({ ...formData, email: v })}
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 ..."
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(v) => setFormData({ ...formData, phone: v })}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={formData.password}
              onChangeText={(v) => setFormData({ ...formData, password: v })}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {authType === "doctor" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialization</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Orthodontist"
                  value={formData.specialization}
                  onChangeText={(v) => setFormData({ ...formData, specialization: v })}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Organization</Text>
                <TouchableOpacity 
                  style={styles.pickerTrigger}
                  onPress={() => setOrgModalVisible(true)}
                >
                  <Text style={styles.pickerValue}>
                    {formData.organization.name || "Choose Clinic/Hospital"}
                  </Text>
                  <ChevronDown size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {authType === "doctor" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Clinical Role</Text>
              <TouchableOpacity 
                style={styles.pickerTrigger}
                onPress={() => setRoleModalVisible(true)}
              >
                <Text style={styles.pickerValue}>{formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</Text>
                <ChevronDown size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.heroButton, loading && styles.buttonDisabled]} 
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} /> : null}
            <Text style={styles.heroButtonText}>Create account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.footer}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.linkText}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={roleModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setRoleModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Clinical Role</Text>
            {["dentist", "assistant", "therapist"].map(v => (
              <TouchableOpacity 
                key={v} 
                style={styles.modalOption}
                onPress={() => {
                  setFormData({ ...formData, role: v });
                  setRoleModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={orgModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setOrgModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Registered Organizations</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {organizations.length > 0 ? (
                organizations.map(org => (
                  <TouchableOpacity 
                    key={org.id} 
                    style={styles.modalOption}
                    onPress={() => {
                      setFormData({ ...formData, organization: { id: org.id, name: org.full_name } });
                      setOrgModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{org.full_name}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noData}>No organizations found. They must register first.</Text>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    gap: 32,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  hero: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  form: {
    gap: 20,
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
  inputGroup: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  input: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#0F172A",
  },
  pickerTrigger: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerValue: {
    fontSize: 14,
    color: "#0F172A",
  },
  heroButton: {
    height: 54,
    backgroundColor: "#0EA5E9",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#64748B",
  },
  linkText: {
    color: "#0EA5E9",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  noData: {
    textAlign: "center",
    color: "#64748B",
    padding: 20,
  },
  modalOption: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  }
});

export default Signup;
