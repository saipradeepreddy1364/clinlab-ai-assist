import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Modal, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Upload, FileText, Image as ImageIcon, FileArchive, X, CheckCircle2, Loader2, Calendar, User, ClipboardList, Search, ChevronDown } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

type FileItem = { 
  id: string;
  name: string; 
  size: string; 
  tag: string; 
  progress: number; 
  type: "img" | "pdf" | "doc" | "zip";
  path: string;
  patientName?: string;
  caseType?: string;
  appointmentDate?: string;
};

const tags = ["X-ray", "Prescription", "Lab Report", "Other"];

const iconMap = {
  img: ImageIcon,
  pdf: FileText,
  doc: FileText,
  zip: FileArchive,
};

const Uploads = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [patients, setPatients] = useState<{ id: string; patient_name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState(route.params?.search || "");
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const [patientModalVisible, setPatientModalVisible] = useState(false);
  const [caseModalVisible, setCaseModalVisible] = useState(false);
 
  const [metadata, setMetadata] = useState({
    patientName: "",
    caseType: "General",
    appointmentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchFiles = async () => {
      const guestValue = await AsyncStorage.getItem("guestMode");
      const isGuest = guestValue === "true";
      if (isGuest) {
        setFiles([]);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.storage
          .from('clinical-files')
          .list(user.id);

        if (!error && data) {
          setFiles(data.map(f => {
            const parts = f.name.split('--');
            let pName = "", cType = "", aDate = "", actualName = f.name;
            
            if (parts.length > 1) {
              const metaParts = parts[0].split('_');
              pName = metaParts[0]?.replace(/-/g, ' ');
              cType = metaParts[1]?.replace(/-/g, ' ');
              aDate = metaParts[2]?.replace(/-/g, ' ');
              actualName = parts.slice(1).join('--');
            }

            return {
              id: f.id,
              name: actualName,
              size: `${(f.metadata.size / 1024 / 1024).toFixed(1)} MB`,
              tag: "Other",
              progress: 100,
              type: f.name.match(/\.(jpg|jpeg|png|gif)$/i) ? "img" : f.name.match(/\.pdf$/i) ? "pdf" : "doc",
              path: `${user.id}/${f.name}`,
              patientName: pName,
              caseType: cType,
              appointmentDate: aDate
            };
          }));
        }
      }
      setLoading(false);
    };

    fetchFiles();

    const fetchPatients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('cases').select('id, patient_name').eq('doctor_id', user.id);
        if (data) setPatients(data);
      }
    };
    fetchPatients();
  }, []);

  const handleFileUpload = async () => {
    // In a real Expo app, we'd use DocumentPicker.getDocumentAsync()
    // For this conversion, I'll keep the structure ready for it.
    if (!metadata.patientName.trim()) {
      return;
    }
    
    // Placeholder for actual picker logic
    console.log("Picking files...");
  };

  const handleFileClick = async (file: FileItem) => {
    if (file.progress < 100) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('clinical-files')
        .createSignedUrl(file.path, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        // In RN we use Linking.openURL
        console.log("Opening URL:", data.signedUrl);
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleDelete = async (file: FileItem) => {
    try {
      const { error } = await supabase.storage
        .from('clinical-files')
        .remove([file.path]);

      if (error) throw error;
      setFiles(prev => prev.filter(f => f.path !== file.path));
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Case Information</Text>
          <TouchableOpacity 
            onPress={() => setMetadata({
              patientName: "",
              caseType: "General",
              appointmentDate: new Date().toISOString().split('T')[0]
            })}
          >
            <Text style={styles.clearText}>Clear Form</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <User size={12} color="#64748B" /> Select Patient
            </Text>
            <TouchableOpacity 
              style={styles.pickerTrigger}
              onPress={() => setPatientModalVisible(true)}
            >
              <Text style={styles.pickerValue}>
                {isAddingNew ? "New Patient" : metadata.patientName || "Select existing patient"}
              </Text>
              <ChevronDown size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {isAddingNew && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <User size={12} color="#64748B" /> New Patient Name
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter patient name..."
                value={metadata.patientName}
                onChangeText={(v) => setMetadata({ ...metadata, patientName: v })}
                placeholderTextColor="#94A3B8"
              />
            </View>
          )}
          
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>
                <ClipboardList size={12} color="#64748B" /> Case
              </Text>
              <TouchableOpacity 
                style={styles.pickerTrigger}
                onPress={() => setCaseModalVisible(true)}
              >
                <Text style={styles.pickerValue}>{metadata.caseType}</Text>
                <ChevronDown size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>
                <Calendar size={12} color="#64748B" /> Date
              </Text>
              <TextInput
                style={styles.input}
                value={metadata.appointmentDate}
                onChangeText={(v) => setMetadata({ ...metadata, appointmentDate: v })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleFileUpload}
          style={[styles.dropZone, !metadata.patientName && styles.dropZoneDisabled]}
          disabled={uploading || !metadata.patientName}
        >
          <View style={styles.uploadIconBox}>
            {uploading ? <ActivityIndicator color="#0EA5E9" /> : <Upload size={20} color="#0EA5E9" />}
          </View>
          <Text style={styles.dropZoneTitle}>
            {!metadata.patientName ? "Enter patient name first" : "Select files to upload"}
          </Text>
          <Text style={styles.dropZoneSub}>Files will be tagged for {metadata.patientName || "..."}</Text>
          <View style={[styles.heroButton, !metadata.patientName && styles.heroButtonDisabled]}>
            <Text style={styles.heroButtonText}>{uploading ? "Uploading..." : "Select files"}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Recent uploads</Text>
            <View style={styles.searchBar}>
              <Search size={14} color="#94A3B8" />
              <TextInput 
                placeholder="Search..." 
                style={styles.searchTextInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
          
          <View style={styles.fileList}>
            {loading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator color="#0EA5E9" />
                <Text style={styles.emptyText}>Fetching files...</Text>
              </View>
            ) : files.length > 0 ? (
              files
                .filter(f => 
                  !searchQuery || 
                  f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  f.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((f, i) => {
                  const Icon = iconMap[f.type] || FileText;
                  return (
                    <TouchableOpacity 
                      key={i} 
                      style={styles.fileItem}
                      onPress={() => handleFileClick(f)}
                    >
                      <View style={styles.fileIconBox}>
                        <Icon size={18} color="#0EA5E9" />
                      </View>
                      <View style={styles.fileInfo}>
                        <View style={styles.fileNameRow}>
                          <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                          {f.patientName && (
                            <View style={styles.patientBadge}>
                              <Text style={styles.badgeText}>{f.patientName}</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.progressRow}>
                          <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${f.progress}%` }]} />
                          </View>
                          <Text style={styles.fileMeta}>{f.appointmentDate || f.size}</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleDelete(f)}
                        style={styles.deleteButton}
                      >
                        <X size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No files uploaded yet.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Why upload X-rays & reports?</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoDot}>•</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>Clinical Accuracy:</Text> AI uses visual data to validate clinical findings.</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoDot}>•</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>Lab Precision:</Text> Providing pre-op X-rays ensures better fit.</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoDot}>•</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>Case History:</Text> Maintains a complete digital record.</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Patient Picker Modal */}
      <Modal visible={patientModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setPatientModalVisible(false)}>
          <View style={styles.modalContent}>
            <ScrollView>
              {patients.map(p => (
                <TouchableOpacity 
                  key={p.id} 
                  style={styles.modalOption}
                  onPress={() => {
                    setIsAddingNew(false);
                    setMetadata({ ...metadata, patientName: p.patient_name });
                    setPatientModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{p.patient_name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => {
                  setIsAddingNew(true);
                  setMetadata({ ...metadata, patientName: "" });
                  setPatientModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: "#0EA5E9" }]}>+ Add New Name</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Case Picker Modal */}
      <Modal visible={caseModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setCaseModalVisible(false)}>
          <View style={styles.modalContent}>
            {["General", "RCT", "Crown", "Extraction", "Implant", "Ortho"].map(v => (
              <TouchableOpacity 
                key={v} 
                style={styles.modalOption}
                onPress={() => {
                  setMetadata({ ...metadata, caseType: v });
                  setCaseModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{v}</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  clearText: {
    fontSize: 12,
    color: "#64748B",
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  pickerTrigger: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerValue: {
    fontSize: 14,
    color: "#0F172A",
  },
  input: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
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
  dropZone: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  dropZoneDisabled: {
    opacity: 0.5,
  },
  uploadIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(14, 165, 233, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  dropZoneTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  dropZoneSub: {
    fontSize: 12,
    color: "#64748B",
  },
  heroButton: {
    backgroundColor: "#0EA5E9",
    width: "100%",
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  heroButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
    overflow: "hidden",
  },
  listHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  listTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 32,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 12,
    marginLeft: 6,
    color: "#0F172A",
    padding: 0,
  },
  fileList: {
  },
  fileItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
    gap: 4,
  },
  fileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    flex: 1,
  },
  patientBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    color: "#64748B",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0EA5E9",
  },
  fileMeta: {
    fontSize: 11,
    color: "#94A3B8",
    width: 80,
    textAlign: "right",
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    color: "#64748B",
  },
  infoCard: {
    backgroundColor: "rgba(14, 165, 233, 0.05)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.1)",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0EA5E9",
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    gap: 8,
  },
  infoDot: {
    color: "#0EA5E9",
  },
  infoText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    flex: 1,
  },
  bold: {
    fontWeight: "700",
    color: "#475569",
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
    maxHeight: "80%",
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
  }
});

export default Uploads;
