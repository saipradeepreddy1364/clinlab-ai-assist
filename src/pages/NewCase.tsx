import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Sparkles, Mic, X, Loader2, ChevronDown } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useVoiceInput } from "@/hooks/useVoice";
import AppLayout from "@/components/AppLayout";

const symptomOptions = ["Pain", "Swelling", "Sensitivity", "Sinus tract", "Mobility", "Bleeding"];

const NewCase = () => {
  const navigation = useNavigation<any>();
  const [symptoms, setSymptoms] = useState<string[]>(["Pain"]);
  const [loading, setLoading] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: "",
    age: "",
    gender: "female",
    tooth_number: "",
    chief_complaint: "",
    notes: "",
  });

  const { isListening, startListening, stopListening } = useVoiceInput((text) => {
    setFormData(prev => ({ ...prev, notes: prev.notes + (prev.notes ? " " : "") + text }));
  });

  const toggleSymptom = (s: string) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigation.navigate("Login");
        return;
      }

      const { error } = await supabase.from('cases').insert([
        {
          patient_name: formData.patient_name,
          tooth_number: formData.tooth_number,
          diagnosis: formData.chief_complaint,
          status: 'in-progress',
          is_urgent: symptoms.includes("Pain") || symptoms.includes("Swelling"),
          doctor_id: user.id,
          metadata: {
            age: formData.age,
            gender: formData.gender,
            symptoms: symptoms,
            notes: formData.notes,
          },
        },
      ]);

      if (error) throw error;
      navigation.navigate("AIEngine");
    } catch (error: any) {
      navigation.navigate("AIEngine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.description}>Capture clinical findings — AI will structure the rest.</Text>

        <View style={styles.form}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Patient details</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Patient name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Priya Sharma"
                value={formData.patient_name}
                onChangeText={(v) => setFormData({ ...formData, patient_name: v })}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="32"
                  value={formData.age}
                  onChangeText={(v) => setFormData({ ...formData, age: v })}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Gender</Text>
                <TouchableOpacity 
                  onPress={() => setGenderModalVisible(true)}
                  style={styles.selectTrigger}
                >
                  <Text style={styles.selectValue}>
                    {formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)}
                  </Text>
                  <ChevronDown size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tooth number (FDI)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 36"
                value={formData.tooth_number}
                onChangeText={(v) => setFormData({ ...formData, tooth_number: v })}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chief complaint</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Severe pain on chewing"
                value={formData.chief_complaint}
                onChangeText={(v) => setFormData({ ...formData, chief_complaint: v })}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Symptoms</Text>
            <View style={styles.symptomsGrid}>
              {symptomOptions.map((s) => {
                const active = symptoms.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => toggleSymptom(s)}
                    style={[styles.symptomBadge, active && styles.symptomBadgeActive]}
                  >
                    <Text style={[styles.symptomText, active && styles.symptomTextActive]}>{s}</Text>
                    {active && <X size={12} color="#FFFFFF" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Clinical notes</Text>
              <TouchableOpacity 
                onPress={isListening ? stopListening : startListening}
                style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
              >
                <Mic size={14} color={isListening ? "#EF4444" : "#64748B"} />
                <Text style={[styles.voiceButtonText, isListening && styles.voiceButtonTextActive]}>
                  {isListening ? "Listening..." : "Voice"}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textarea}
              placeholder="e.g. Spontaneous throbbing pain, lingering response to cold test on 36. Tender on percussion. No swelling."
              multiline
              value={formData.notes}
              onChangeText={(v) => setFormData({ ...formData, notes: v })}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.draftButton}>
              <Text style={styles.draftButtonText}>Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={18} color="#FFFFFF" />
              ) : (
                <View style={styles.buttonInner}>
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Analyze with AI</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Gender Picker Modal */}
      <Modal
        visible={genderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setGenderModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {["female", "male", "other"].map((v) => (
              <TouchableOpacity
                key={v}
                style={styles.modalOption}
                onPress={() => {
                  setFormData({ ...formData, gender: v });
                  setGenderModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 20,
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  form: {
    gap: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
    gap: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  gridItem: {
    flex: 1,
    gap: 8,
  },
  selectTrigger: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectValue: {
    fontSize: 14,
    color: "#0F172A",
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  symptomBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    gap: 6,
  },
  symptomBadgeActive: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  symptomText: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "500",
  },
  symptomTextActive: {
    color: "#FFFFFF",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voiceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 32,
  },
  voiceButtonActive: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "#EF4444",
  },
  voiceButtonText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  voiceButtonTextActive: {
    color: "#EF4444",
  },
  textarea: {
    fontSize: 14,
    color: "#0F172A",
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  draftButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  draftButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  submitButton: {
    flex: 2,
    height: 48,
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalOption: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
});

export default NewCase;
