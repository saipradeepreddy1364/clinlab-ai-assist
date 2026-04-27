import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Alert, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Stethoscope, Loader2, ChevronDown, Search } from "lucide-react-native";
import { supabase } from "@/lib/supabase";

const showAlert = (title: string, message: string, actions?: any[]) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
    if (actions && actions[0] && actions[0].onPress) {
      actions[0].onPress();
    }
  } else {
    Alert.alert(title, message, actions);
  }
};

const Signup = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [authType, setAuthType] = useState<"doctor" | "organization">("doctor");
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [orgModalVisible, setOrgModalVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
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
      if (formData.name.length < 3) {
        setGoogleResults([]);
        return;
      }

      setIsSearching(true);
      console.log("Signup: Live searching global directory for:", formData.name);
      
      try {
        // Using Photon (OpenStreetMap) API - 100% Free & Global
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(formData.name)}&limit=8&osm_tag=amenity:hospital`);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const results = data.features.map((f: any) => {
            const name = f.properties.name || f.properties.street || "Clinic";
            const city = f.properties.city || f.properties.state || "";
            return city ? `${name} (${city})` : name;
          });
          setGoogleResults(results);
        } else {
          setGoogleResults(["NO_RESULTS"]);
        }
      } catch (error) {
        console.error("Live Search Error:", error);
        // Fallback to a few common ones if API fails
        setGoogleResults(["NO_RESULTS"]);
      } finally {
        setIsSearching(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.name, authType]);

  const handleSignup = async () => {
    // Basic validation
    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      showAlert("Missing Fields", "Please fill in all mandatory fields.");
      return;
    }

    if (authType === "doctor" && (!formData.specialization || !formData.organization.id)) {
      showAlert("Clinical Details Required", "Please select your role and organization.");
      return;
    }

    if (formData.password.length < 6) {
      showAlert("Weak Password", "Password must be at least 6 characters long.");
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
        setTempUserId(data.user.id);
        // Show verification modal instead of immediate redirect
        setVerifying(true);
        setVerifyModalVisible(true);
        
        // Silently handle profile upsert in background
        supabase.from('profiles').upsert([{
          id: data.user.id,
          full_name: formData.name,
          phone: formData.phone,
          role: authType,
          status: authType === "organization" ? "approved" : "pending",
          specialization: authType === "doctor" ? formData.specialization : null,
          org_id: authType === "doctor" ? formData.organization.id : null,
          org_name: authType === "doctor" ? formData.organization.name : null,
        }], { onConflict: 'id' }).then(({ error: pe }) => {
          if (pe) console.warn("Background profile sync warning:", pe.message);
        });
      }
    } catch (error: any) {
      if (error.message.includes("Invalid login credentials")) {
        showAlert("Access Denied", "Incorrect password or account not found. Please check your credentials.");
      } else if (error.message.includes("Email not confirmed")) {
        showAlert("Verification Needed", "Please confirm your professional email before logging in.");
      } else {
        showAlert("Login Failed", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session?.user?.email_confirmed_at) {
      setVerifyModalVisible(false);
      showAlert("Verification Successful", "Welcome to ClinLab! Taking you to your dashboard...", [
        { text: "Let's Go", onPress: () => navigation.replace(authType === "organization" ? "OrgDashboard" : "Dashboard") }
      ]);
    } else {
      showAlert("Not Verified Yet", "We couldn't confirm your verification. Please click the link in your email first.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1, paddingBottom: 120 }]}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled={true}
        >
        <View style={styles.hero}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Fill in your details to get started.</Text>
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
                <Text style={styles.dropdownLabel}>Suggested Official Names (Web Search)</Text>
                {googleResults[0] === "NO_RESULTS" ? (
                  <View style={styles.inlineOption}>
                    <Text style={[styles.inlineOptionText, { color: '#94A3B8' }]}>No official names found. You can keep typing yours.</Text>
                  </View>
                ) : (
                  googleResults.map((res, i) => (
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
                  ))
                )}
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
            style={[styles.heroButton, (loading || verifying) && styles.buttonDisabled]} 
            onPress={handleSignup}
            disabled={loading || verifying}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} /> : null}
            <Text style={styles.heroButtonText}>
              {verifying ? "Waiting for Verification..." : "Create account"}
            </Text>
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
            <View style={styles.diagBox}>
              <Text style={styles.diagText}>Database Status: {organizations.length > 0 ? "Connected" : "Searching..."}</Text>
              <Text style={styles.diagText}>Registered Orgs Found: {organizations.length}</Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshBtn} 
              onPress={() => {
                supabase.from('profiles').select('id, full_name').eq('role', 'organization').then(({data, error}) => {
                  if(error) Alert.alert("Error", error.message);
                  if(data) setOrganizations(data);
                });
              }}
            >
              <Text style={styles.refreshBtnText}>Refresh from Supabase</Text>
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
      <Modal visible={verifyModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40 }]}>
            <View style={{ width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
            
            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 }}>
              <Stethoscope size={32} color="#0EA5E9" />
            </View>

            <Text style={[styles.modalHeader, { textAlign: 'center' }]}>Verify Your Email</Text>
            <Text style={{ textAlign: 'center', color: '#64748B', marginBottom: 24, lineHeight: 22, fontSize: 15 }}>
              We've sent a verification link to{"\n"}
              <Text style={{ fontWeight: '700', color: '#0EA5E9' }}>{formData.email}</Text>.{"\n"}
              Please click the link in your email to continue.
            </Text>
            
            <TouchableOpacity 
              style={[styles.heroButton, { width: '100%', marginBottom: 12 }]} 
              onPress={checkVerificationStatus}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.heroButtonText}>I've Verified My Email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setVerifyModalVisible(false);
                navigation.navigate("Login");
              }}
              style={{ alignSelf: 'center', padding: 12 }}
            >
              <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '500' }}>I'll verify later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  </SafeAreaView>
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
    position: 'relative',
    width: '100%',
  },
  inputLoader: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
  },
  dropdownLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    padding: 8,
    backgroundColor: "#F8FAFC",
    textTransform: "uppercase",
  },
  inlineDropdown: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    maxHeight: 200,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 10,
  },
  inlineOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
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
  diagBox: {
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  diagText: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default Signup;
