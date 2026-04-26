import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  FileText,
  Sparkles,
  ClipboardList,
  Image as ImageIcon,
  Download,
  CheckCircle2,
  Circle,
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

const timeline = [
  { date: "24 Apr 2026", title: "Diagnosis confirmed", desc: "Irreversible Pulpitis · Tooth 36", done: true, type: "diagnosis" },
  { date: "24 Apr 2026", title: "Access cavity completed", desc: "Rubber dam placed, MB/ML/DB/DL canals located", done: true, type: "step" },
  { date: "24 Apr 2026", title: "Lab requisition sent", desc: "Crown — PFM, Shade A2, Chamfer margin", done: true, type: "lab" },
  { date: "01 May 2026", title: "Crown try-in", desc: "Scheduled · check fit, occlusion, contacts", done: false, type: "follow" },
  { date: "08 May 2026", title: "Permanent cementation", desc: "Resin cement (RelyX) — final review", done: false, type: "follow" },
];

const PatientDetail = () => {
  const route = useRoute<any>();
  const id = route.params?.id;
  const [activeTab, setActiveTab] = useState("timeline");
  const [patient, setPatient] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const { data: caseData } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .single();

      if (caseData) {
        setPatient(caseData);
        
        // Fetch files for this patient
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: storageFiles } = await supabase.storage
            .from('clinical-files')
            .list(user.id);
          
          if (storageFiles) {
            const matchedFiles = storageFiles.filter(f => {
              const parts = f.name.split('--');
              if (parts.length > 1) {
                const pName = parts[0].split('_')[0]?.replace(/-/g, ' ');
                return pName?.toLowerCase() === caseData.patient_name.toLowerCase();
              }
              return false;
            }).map(f => ({
              name: f.name.split('--').slice(1).join('--') || f.name,
              tag: f.name.split('--')[0]?.split('_')[1]?.replace(/-/g, ' ') || "Other",
              path: `${user.id}/${f.name}`,
              type: f.name.match(/\.(jpg|jpeg|png|gif)$/i) ? "img" : "pdf"
            }));
            setFiles(matchedFiles);
          }
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <Loader2 size={24} color="#0EA5E9" />
          <Text style={styles.loadingText}>Loading patient record...</Text>
        </View>
      </AppLayout>
    );
  }

  if (!patient) {
    return (
      <AppLayout>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={styles.errorText}>Patient record not found.</Text>
        </View>
      </AppLayout>
    );
  }

  const renderTimeline = () => (
    <View style={styles.card}>
      <View style={styles.timelineContainer}>
        <View style={styles.timelineLine} />
        {timeline.map((t, i) => (
          <View key={i} style={styles.timelineItem}>
            <View style={styles.timelineIconBox}>
              {t.done ? (
                <View style={styles.doneIcon}>
                  <CheckCircle2 size={16} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.todoIcon}>
                  <Circle size={12} color="#CBD5E1" />
                </View>
              )}
            </View>
            <View style={styles.timelineContent}>
              <View style={styles.timelineHeader}>
                <Text style={styles.timelineTitle}>{t.title}</Text>
                <View style={styles.dateBadge}>
                  <Calendar size={10} color="#64748B" />
                  <Text style={styles.dateText}>{t.date}</Text>
                </View>
              </View>
              <Text style={styles.timelineDesc}>{t.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderNotes = () => (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <FileText size={16} color="#0EA5E9" />
        <Text style={styles.cardHeaderTitle}>Clinical notes</Text>
      </View>
      <Text style={styles.notesText}>
        Patient reports spontaneous throbbing pain on left mandibular region for 3 days. Lingering response to cold
        test on tooth 36. Tender on percussion. No swelling. IOPA shows deep caries approaching pulp horn.
        Diagnosis: Irreversible Pulpitis. Plan: RCT followed by crown.
      </Text>
    </View>
  );

  const renderAI = () => (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Sparkles size={16} color="#F43F5E" />
        <Text style={styles.cardHeaderTitle}>AI suggestions log</Text>
      </View>
      <View style={styles.aiList}>
        <View style={styles.aiItem}>
          <Text style={styles.aiDot}>→</Text>
          <Text style={styles.aiText}>Establish glide path with #10 K-file</Text>
        </View>
        <View style={styles.aiItem}>
          <Text style={styles.aiDot}>→</Text>
          <Text style={styles.aiText}>Use 3% NaOCl irrigation between files</Text>
        </View>
        <View style={styles.aiItem}>
          <Text style={styles.aiDot}>→</Text>
          <Text style={styles.aiText}>Confirm WL with apex locator + IOPA</Text>
        </View>
      </View>
    </View>
  );

  const renderFiles = () => (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <ClipboardList size={16} color="#8B5CF6" />
        <Text style={styles.cardHeaderTitle}>Lab forms & uploads</Text>
      </View>
      <View style={styles.fileList}>
        {files.length > 0 ? (
          files.map((f) => (
            <View key={f.name} style={styles.fileItem}>
              <View style={styles.fileIconBox}>
                {f.type === "img" ? <ImageIcon size={18} color="#0EA5E9" /> : <FileText size={18} color="#0EA5E9" />}
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                <View style={styles.fileTag}>
                  <Text style={styles.fileTagText}>{f.tag}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={async () => {
                  const { data } = await supabase.storage
                    .from('clinical-files')
                    .createSignedUrl(f.path, 3600);
                  if (data?.signedUrl) {
                    import("react-native").then(({ Linking, Platform }) => {
                      if (Platform.OS === 'web') window.open(data.signedUrl, '_blank');
                      else Linking.openURL(data.signedUrl);
                    });
                  }
                }}
              >
                <Download size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyFilesText}>No files uploaded for this patient yet.</Text>
        )}
      </View>
    </View>
  );

  return (
    <AppLayout>
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>P</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.patientName}>{patient.patient_name}</Text>
              <Text style={styles.patientMeta}>
                #{id.slice(0, 8)} · Tooth {patient.tooth_number}
              </Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{patient.status.replace('-', ' ')}</Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          {["timeline", "notes", "ai", "files"].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {activeTab === "timeline" && renderTimeline()}
          {activeTab === "notes" && renderNotes()}
          {activeTab === "ai" && renderAI()}
          {activeTab === "files" && renderFiles()}
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
  profileCard: {
    backgroundColor: "#0EA5E9",
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  patientMeta: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#0F172A",
  },
  content: {
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  timelineContainer: {
    position: "relative",
    paddingLeft: 4,
  },
  timelineLine: {
    position: "absolute",
    left: 15,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: "#F1F5F9",
  },
  timelineItem: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  timelineIconBox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  doneIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  todoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dateText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  timelineDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  notesText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  aiList: {
    gap: 10,
  },
  aiItem: {
    flexDirection: "row",
    gap: 8,
  },
  aiDot: {
    color: "#F43F5E",
    fontWeight: "700",
  },
  aiText: {
    fontSize: 14,
    color: "#475569",
  },
  fileList: {
    gap: 10,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  fileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  fileTag: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  fileTagText: {
    fontSize: 10,
    color: "#64748B",
  },
  downloadButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyFilesText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    padding: 20,
    fontStyle: "italic",
  }
});

export default PatientDetail;
