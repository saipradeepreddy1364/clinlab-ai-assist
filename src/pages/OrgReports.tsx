import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Linking, Platform } from "react-native";
import { Search, FileText, Image as ImageIcon, FileArchive, Download, ChevronRight } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

type FileItem = { 
  name: string; 
  size: string; 
  path: string;
  doctorName: string;
  patientName: string;
  type: "img" | "pdf" | "doc";
  createdAt: string;
};

const OrgReports = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAllOrgFiles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get all doctors in this org
      const { data: doctors } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('org_id', user.id)
        .eq('role', 'doctor');

      if (doctors) {
        let allFiles: FileItem[] = [];

        for (const dr of doctors) {
          const { data: drFiles, error } = await supabase.storage
            .from('clinical-files')
            .list(dr.id);

          if (!error && drFiles) {
            const mappedFiles: FileItem[] = drFiles.map(f => {
              const parts = f.name.split('--');
              let pName = "Unknown Patient";
              if (parts.length > 1) {
                pName = parts[0].split('_')[0]?.replace(/-/g, ' ');
              }

              return {
                name: f.name.split('--').pop() || f.name,
                size: `${(f.metadata.size / 1024 / 1024).toFixed(1)} MB`,
                path: `${dr.id}/${f.name}`,
                doctorName: dr.full_name,
                patientName: pName,
                type: f.name.match(/\.(jpg|jpeg|png)$/i) ? "img" : f.name.match(/\.pdf$/i) ? "pdf" : "doc",
                createdAt: f.created_at
              };
            });
            allFiles = [...allFiles, ...mappedFiles];
          }
        }
        setFiles(allFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
      setLoading(false);
    };

    fetchAllOrgFiles();
  }, []);

  const filteredFiles = files.filter(f => 
    f.patientName.toLowerCase().includes(search.toLowerCase()) ||
    f.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (file: FileItem) => {
    const { data, error } = await supabase.storage
      .from('clinical-files')
      .createSignedUrl(file.path, 3600);

    if (data?.signedUrl) {
      if (Platform.OS === 'web') {
        window.open(data.signedUrl, '_blank');
      } else {
        Linking.openURL(data.signedUrl);
      }
    }
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Patient Reports</Text>
          <Text style={styles.subtitle}>All diagnostic files across the organization.</Text>
        </View>

        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <TextInput 
            placeholder="Search by patient or doctor..." 
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#0EA5E9" style={{ marginTop: 40 }} />
          ) : filteredFiles.length > 0 ? (
            filteredFiles.map((f, i) => (
              <TouchableOpacity key={i} style={styles.fileCard} onPress={() => handleDownload(f)}>
                <View style={styles.fileIcon}>
                  {f.type === 'img' ? <ImageIcon size={20} color="#0EA5E9" /> : <FileText size={20} color="#8B5CF6" />}
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                  <Text style={styles.fileMeta}>
                    {f.patientName} · By {f.doctorName}
                  </Text>
                  <Text style={styles.fileSize}>{f.size} · {new Date(f.createdAt).toLocaleDateString()}</Text>
                </View>
                <Download size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No reports found.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
  },
  list: {
    gap: 12,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 16,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  fileMeta: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  fileSize: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 2,
  },
  empty: {
    padding: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
  }
});

export default OrgReports;
