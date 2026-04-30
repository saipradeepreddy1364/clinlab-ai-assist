import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Activity, 
  ChevronRight,
  Target
} from "lucide-react-native";
import AppLayout from "@/components/AppLayout";

const Insights = () => {
  const [timeframe, setTimeframe] = useState("This Month");

  const stats = [
    { label: "Cases Completed", value: "124", change: "+12%", icon: Activity, color: "#0EA5E9" },
    { label: "AI Suggestions Used", value: "89", change: "+24%", icon: Sparkles, color: "#8B5CF6" },
    { label: "Avg. Time Saved", value: "2.5h", change: "+5%", icon: Clock, color: "#10B981" },
    { label: "Diagnosis Accuracy", value: "96%", change: "+2%", icon: Target, color: "#F59E0B" },
  ];

  const recentInsights = [
    { title: "Increased Endodontic Cases", desc: "You've seen a 15% increase in RCT cases compared to last month." },
    { title: "Optimal Material Usage", desc: "Using AI material suggestions has reduced your inventory waste by 8%." },
    { title: "Faster Consultations", desc: "Voice-guided notes are saving you an average of 4 mins per patient." },
  ];

  return (
    <AppLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Clinical Insights</Text>
            <Text style={styles.subtitle}>Your practice performance & AI impact</Text>
          </View>
          
          <TouchableOpacity style={styles.timeframeButton}>
            <Text style={styles.timeframeText}>{timeframe}</Text>
            <ChevronDown size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.iconBox, { backgroundColor: `${stat.color}15` }]}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <View style={styles.statFooter}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={styles.changeBadge}>
                  <TrendingUp size={10} color="#10B981" />
                  <Text style={styles.changeText}>{stat.change}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>AI Assistant Impact</Text>
            <Text style={styles.heroText}>
              Your use of the AI Clinical Guide has grown significantly. 
              You are currently ranked in the top 10% of tech-enabled clinicians in your region.
            </Text>
            <TouchableOpacity style={styles.heroButton}>
              <Text style={styles.heroButtonText}>View Detailed Report</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroGraphic}>
            <BarChart3 size={80} color="#FFFFFF" opacity={0.8} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Smart Observations</Text>
        <View style={styles.insightsList}>
          {recentInsights.map((insight, i) => (
            <View key={i} style={styles.insightCard}>
              <View style={styles.insightIconBox}>
                <Sparkles size={16} color="#8B5CF6" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDesc}>{insight.desc}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </AppLayout>
  );
};

// Add a quick ChevronDown component since we didn't import it
const ChevronDown = ({ size, color }: { size: number, color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  timeframeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  statFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10B981",
  },
  heroCard: {
    backgroundColor: "#0EA5E9",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    overflow: "hidden",
  },
  heroContent: {
    flex: 1,
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  heroText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
    marginBottom: 16,
    paddingRight: 20,
  },
  heroButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0EA5E9",
  },
  heroGraphic: {
    position: "absolute",
    right: -20,
    bottom: -20,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 8,
    marginBottom: -8,
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
    gap: 12,
  },
  insightIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  insightDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },
});

export default Insights;
