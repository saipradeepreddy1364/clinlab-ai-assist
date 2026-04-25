import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions } from "react-native";
import { Download, Printer, Send, ClipboardList } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

const labOptions = [
  { id: "crown", label: "Crown" },
  { id: "rct", label: "Root Canal Treatment" },
  { id: "impression", label: "Impression" },
  { id: "prosthesis", label: "Prosthesis" },
  { id: "bridge", label: "Bridge" },
  { id: "denture", label: "Denture" },
];

const LabRequisition = () => {
  const [selected, setSelected] = useState<string[]>(["crown"]);
  const [dentistName, setDentistName] = useState("Doctor");
  
  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setDentistName(user.user_metadata.full_name);
      }
    };
    fetchUser();
  }, []);

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.description}>Auto-filled from clinical entry — review and send.</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.reqNumber}>Lab requisition #LR-2041</Text>
            <Text style={styles.cardTitle}>Crown — Tooth 36</Text>
            <View style={styles.headerMeta}>
              <Text style={styles.metaText}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              <Text style={styles.metaText}>Return: 5–7 days</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Patient name</Text>
              <TextInput style={styles.input} defaultValue="Priya Sharma" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Age</Text>
                <TextInput style={styles.input} defaultValue="32" keyboardType="numeric" placeholderTextColor="#94A3B8" />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Gender</Text>
                <TextInput style={styles.input} defaultValue="Female" placeholderTextColor="#94A3B8" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dentist</Text>
              <TextInput 
                style={styles.input}
                value={dentistName} 
                onChangeText={setDentistName}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tooth number (FDI)</Text>
              <TextInput style={styles.input} defaultValue="36" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Diagnosis</Text>
              <TextInput style={styles.input} defaultValue="Irreversible pulpitis — RCT completed, crown indicated" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.selectionGroup}>
              <Text style={styles.label}>Lab work required</Text>
              <View style={styles.badgeGrid}>
                {labOptions.map((o) => {
                  const active = selected.includes(o.id);
                  return (
                    <TouchableOpacity
                      key={o.id}
                      onPress={() => toggle(o.id)}
                      style={[styles.badge, active && styles.badgeActive]}
                    >
                      <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{o.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Material</Text>
              <TextInput style={styles.input} defaultValue="PFM (Porcelain-fused-to-metal)" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Shade</Text>
                <TextInput style={styles.input} defaultValue="A2 (Vita)" placeholderTextColor="#94A3B8" />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Margin</Text>
                <TextInput style={styles.input} defaultValue="Chamfer" placeholderTextColor="#94A3B8" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Special instructions</Text>
              <TextInput
                style={styles.textarea}
                defaultValue="Please match cervical translucency. Contact for shade verification before bake."
                multiline
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Download size={16} color="#0F172A" />
              <Text style={styles.secondaryButtonText}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Printer size={16} color="#0F172A" />
              <Text style={styles.secondaryButtonText}>Print</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.primaryButton}>
            <Send size={16} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Send to lab</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  cardHeader: {
    backgroundColor: "#0EA5E9",
    padding: 16,
  },
  reqNumber: {
    fontSize: 10,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
  },
  headerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  cardBody: {
    padding: 16,
    gap: 16,
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
  selectionGroup: {
    gap: 8,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  badgeActive: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  badgeText: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "500",
  },
  badgeTextActive: {
    color: "#FFFFFF",
  },
  textarea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#0F172A",
    textAlignVertical: "top",
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  primaryButton: {
    height: 54,
    backgroundColor: "#0EA5E9",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LabRequisition;
