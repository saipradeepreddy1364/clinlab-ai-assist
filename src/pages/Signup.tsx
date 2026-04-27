import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Alert } from "react-native";
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
  const [googleResults, setGoogleResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigation.navigate("Dashboard");
      }
    });

    const fetchOrgs = async () => {
      setLoadingOrgs(true);
      console.log("Signup: Fetching organizations from Supabase...");
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'organization');
      
      if (error) {
        console.error("Signup: Supabase Error:", error);
        Alert.alert("Database Error", "Could not load organizations. Please check your Supabase RLS policies.");
      }
      if (data) {
        console.log("Signup: Successfully loaded from Supabase:", data.length, "organizations");
        setOrganizations(data);
      }
      setLoadingOrgs(false);
    };

    fetchOrgs();
  }, [navigation]);

  // Debounced Background Search (Web Search Simulation)
  useEffect(() => {
    if (authType !== 'organization' || formData.name.length < 3) {
      setGoogleResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      // Simulating a Web/Google search for official hospital names
      setTimeout(() => {
        const query = formData.name.toLowerCase();
        const mockWebResults = [
          "City General Hospital",
          "Grace Medical Center",
          "Advanced Dental Care",
          "Sunrise Dental Hub",
          "National Institute of Dentistry",
          "Metropolitan Health Clinic",
          "Smile Design Studio",
        ].filter(name => name.toLowerCase().includes(query));
        
        setGoogleResults(mockWebResults);
        setIsSearching(false);
      }, 800);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.name, authType]);

  const handleSignup = async () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      Alert.alert("Missing Fields", "All fields are mandatory. Please fill in all details.");
      return;
    }

    if (authType === "doctor" && (!formData.specialization || !formData.organization.id)) {
      Alert.alert("Missing Fields", "Please provide your specialization and select an organization.");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long.");
      return;
    }

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
        // Manually create profile in public.profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: formData.name,
              phone: formData.phone,
              role: authType,
              status: authType === "organization" ? "approved" : "pending",
              specialization: authType === "doctor" ? formData.specialization : null,
              org_id: authType === "doctor" ? formData.organization.id : null,
              org_name: authType === "doctor" ? formData.organization.name : null,
            }
          ]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // If 401/403, it's likely because email isn't verified yet
          Alert.alert(
            "Almost there!",
            "Your account is created, but we couldn't set up your clinical profile yet. Please check your email and click the verification link, then sign in.",
            [{ text: "OK", onPress: () => navigation.navigate("Login") }]
          );
          return;
        }

        Alert.alert(
          "Registration Successful",
          "Your account has been created. If you don't have auto-login enabled, please check your email for a verification link before signing in.",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      }
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={authType === "organization" ? "e.g. City Dental Clinic" : "Dr. Aarav Singh"}
                value={formData.name}
                onChangeText={(v) => setFormData({ ...formData, name: v })}
                placeholderTextColor="#94A3B8"
              />
              {isSearching && (
                <View style={styles.inputLoader}>
                  <ActivityIndicator size="small" color="#0EA5E9" />
                </View>
              )}
            </View>
            
            {authType === "organization" && googleResults.length > 0 && (
              <View style={styles.inlineDropdown}>
                <Text style={styles.dropdownLabel}>Suggested Official Names (from Web)</Text>
                {googleResults.map((res, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.inlineOption}
                    onPress={() => {
                      setFormData({ ...formData, name: res });
                      setGoogleResults([]);
                    }}
                  >
                    <Text style={styles.inlineOptionText}>{res}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
            <TouchableOpacity 
              style={styles.refreshBtn} 
              onPress={() => {
                // Trigger refresh logic
                supabase.from('profiles').select('id, full_name').eq('role', 'organization').then(({data}) => {
                  if(data) setOrganizations(data);
                });
              }}
            >
              <Text style={styles.refreshBtnText}>Refresh List from Database</Text>
            </TouchableOpacity>
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
                <View style={styles.emptyState}>
                  <Text style={styles.noData}>No organizations found in Supabase.</Text>
                  <Text style={styles.hintText}>Make sure your clinic has registered as an "Organization" first.</Text>
                </View>
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
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    gap: 16,
    flexGrow: 1,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  hero: {
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
  },
  form: {
    gap: 12,
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
    borderRadius: 10,
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
    gap: 6,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  input: {
    height: 44,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#0F172A",
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  inputLoader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  dropdownLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    padding: 6,
    backgroundColor: "#F8FAFC",
    textTransform: "uppercase",
  },
  inlineDropdown: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 180,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1000,
  },
  inlineOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  inlineOptionText: {
    fontSize: 14,
    color: "#0F172A",
  },
  pickerTrigger: {
    height: 44,
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
    height: 50,
    backgroundColor: "#0EA5E9",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
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
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
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
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  refreshBtn: {
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  refreshBtnText: {
    color: "#0EA5E9",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    padding: 16,
    alignItems: "center",
  },
  noData: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
  },
  hintText: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
  },
  modalOption: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalOptionText: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },
});

export default Signup;
