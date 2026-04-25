import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions } from "react-native";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Wrench,
  FlaskConical,
  Mic,
  ArrowRight,
  Loader2,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useVoiceInput } from "@/hooks/useVoice";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

type Output = {
  diagnosis: string;
  confidence: "High" | "Medium" | "Low";
  steps: string[];
  instruments: string[];
  materials: string[];
  alerts: string[];
};

const procedures: Record<string, Output> = {
  "access cavity": {
    diagnosis: "Irreversible Pulpitis — Tooth 36",
    confidence: "High",
    steps: [
      "Locate all canals (MB, ML, DB, DL) under magnification",
      "Establish glide path with #10 K-file to working length",
      "Select initial rotary file (ProTaper SX → S1)",
      "Begin irrigation protocol: 3% NaOCl, EDTA 17%, saline rinse",
      "Determine working length with apex locator + IOPA confirmation",
    ],
    instruments: ["DG-16 endodontic explorer", "Endo-Z bur", "K-files #10–#25", "Rotary endomotor", "Apex locator"],
    materials: ["3% Sodium Hypochlorite", "17% EDTA", "Saline", "Calcium hydroxide (intracanal)"],
    alerts: ["Verify rubber dam isolation before irrigation.", "Avoid binding files past WL — risk of perforation."],
  },
  "crown prep": {
    diagnosis: "Crown Preparation — Tooth 11",
    confidence: "High",
    steps: [
      "Select appropriate diamond burs (tapered chamfer)",
      "Reduce occlusal surface by 1.5mm - 2.0mm",
      "Prepare axial walls with 6-degree taper",
      "Refine gingival finish line (chamfer)",
      "Take final impression using PVS material",
    ],
    instruments: ["High-speed handpiece", "Diamond burs", "Retraction cord", "Impression trays"],
    materials: ["PVS impression material", "Retraction solution", "Temporary cement"],
    alerts: ["Ensure adequate clearance for material thickness.", "Protect adjacent teeth with metal matrix."],
  },
  "extraction": {
    diagnosis: "Non-restorable Caries — Tooth 46",
    confidence: "High",
    steps: [
      "Administer local anesthesia (IANB + Long Buccal)",
      "Sever periodontal ligament using periotome",
      "Luxate tooth with straight elevator",
      "Engage tooth with appropriate forceps (Lower molar)",
      "Debride socket and verify hemostasis",
    ],
    instruments: ["Periotome", "Straight elevator", "Molar forceps", "Curette"],
    materials: ["Local Anesthetic (Articaine 4%)", "Gauze", "Gelfoam (if needed)"],
    alerts: ["Monitor patient vitals.", "Warn patient about post-op numbness."],
  },
};

const confidenceColors: Record<Output["confidence"], string> = {
  High: "#22C55E",
  Medium: "#F59E0B",
  Low: "#EF4444",
};

const AIEngine = () => {
  const [isGuest, setIsGuest] = useState(false);
  const [input, setInput] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [stage, setStage] = useState("");
  const [output, setOutput] = useState<Output | null>(null);
  const [loading, setLoading] = useState(false);

  const { isListening, startListening, stopListening } = useVoiceInput((text) => {
    setInput(prev => prev + (prev ? " " : "") + text);
  });

  useEffect(() => {
    const checkGuest = async () => {
      const guestValue = await AsyncStorage.getItem("guestMode");
      setIsGuest(guestValue === "true");
    };
    checkGuest();
  }, []);

  const handleSuggest = () => {
    if (!input.trim()) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      let match = procedures["access cavity"];

      if (lowerInput.includes("crown") || lowerInput.includes("prep")) {
        match = procedures["crown prep"];
      } else if (lowerInput.includes("extract") || lowerInput.includes("remove")) {
        match = procedures["extraction"];
      }

      setOutput(match);
      setLoading(false);
    }, 1500);
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.description}>
          Share your clinical findings or the current procedure step to get AI-validated guidance.
        </Text>

        {/* Entry area */}
        {!isGuest ? (
          <View style={styles.entrySection}>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>Symptoms</Text>
                  <TextInput 
                    placeholder="Pain, swelling..." 
                    style={styles.smallInput}
                    value={symptoms}
                    onChangeText={setSymptoms}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>Procedure Stage</Text>
                  <TextInput 
                    placeholder="Access, Cleaning..." 
                    style={styles.smallInput}
                    value={stage}
                    onChangeText={setStage}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            </View>

            <View style={styles.mainInputCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.inputLabel}>Clinical thoughts / condition</Text>
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
                value={input}
                onChangeText={setInput}
                placeholder="e.g. Completed access on 36, canal orifi located but having trouble with MB2..."
                multiline
                style={styles.textarea}
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity
                onPress={handleSuggest}
                style={styles.suggestButton}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} color="#FFFFFF" /> : <Sparkles size={16} color="#FFFFFF" />}
                <Text style={styles.suggestButtonText}>Get AI Guidance</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.mainInputCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.inputLabel}>Current Step / Thought</Text>
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
              value={input}
              onChangeText={setInput}
              placeholder="What step are you performing right now?"
              multiline
              style={styles.textarea}
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity
              onPress={handleSuggest}
              style={styles.suggestButton}
              disabled={loading}
            >
              {loading ? <Loader2 size={16} color="#FFFFFF" /> : <Sparkles size={16} color="#FFFFFF" />}
              <Text style={styles.suggestButtonText}>Get Guidance</Text>
            </TouchableOpacity>
          </View>
        )}

        {output && !loading && (
          <View style={styles.outputSection}>
            {/* Diagnosis card */}
            <View style={styles.diagnosisCard}>
              <View style={styles.diagnosisHeader}>
                <Text style={styles.diagnosisLabel}>Suggested diagnosis</Text>
                <View style={[styles.confidenceBadge, { backgroundColor: confidenceColors[output.confidence] }]}>
                  <ShieldCheck size={10} color="#FFFFFF" />
                  <Text style={styles.confidenceText}>{output.confidence}</Text>
                </View>
              </View>
              <Text style={styles.diagnosisTitle}>{output.diagnosis}</Text>
            </View>

            {/* Next steps */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <ArrowRight size={16} color="#0EA5E9" />
                <Text style={styles.cardTitle}>Next steps</Text>
              </View>
              <View style={styles.stepsList}>
                {output.steps.map((step, i) => (
                  <View key={i} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                    <CheckCircle2 size={16} color="#CBD5E1" />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Wrench size={16} color="#8B5CF6" />
                <Text style={styles.cardTitle}>Instruments</Text>
              </View>
              <View style={styles.list}>
                {output.instruments.map((item) => (
                  <View key={item} style={styles.listItem}>
                    <View style={[styles.dot, { backgroundColor: "#8B5CF6" }]} />
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <FlaskConical size={16} color="#F43F5E" />
                <Text style={styles.cardTitle}>Materials</Text>
              </View>
              <View style={styles.list}>
                {output.materials.map((item) => (
                  <View key={item} style={styles.listItem}>
                    <View style={[styles.dot, { backgroundColor: "#F43F5E" }]} />
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Alerts */}
            <View style={styles.alertCard}>
              <AlertTriangle size={20} color="#F59E0B" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Verify clinically before proceeding</Text>
                {output.alerts.map((alert) => (
                  <Text key={alert} style={styles.alertText}>• {alert}</Text>
                ))}
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
    gap: 20,
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  entrySection: {
    gap: 16,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  inputCard: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  smallInput: {
    fontSize: 12,
    color: "#0F172A",
    height: 36,
    padding: 0,
  },
  mainInputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
    gap: 16,
  },
  cardHeader: {
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
    minHeight: 120,
    textAlignVertical: "top",
    padding: 0,
  },
  suggestButton: {
    backgroundColor: "#0EA5E9",
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  suggestButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  outputSection: {
    gap: 16,
  },
  diagnosisCard: {
    backgroundColor: "rgba(14, 165, 233, 0.05)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: "rgba(14, 165, 233, 0.2)",
  },
  diagnosisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  diagnosisLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0EA5E9",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confidenceText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  diagnosisTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepText: {
    fontSize: 14,
    color: "#0F172A",
    lineHeight: 20,
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  listText: {
    fontSize: 14,
    color: "#0F172A",
  },
  alertCard: {
    backgroundColor: "rgba(245, 158, 11, 0.05)",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  alertContent: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  alertText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },
  spin: {
    // Rotation logic in RN usually requires Animated API
  },
  pulse: {
    // Pulse logic in RN usually requires Animated API
  }
});

export default AIEngine;
