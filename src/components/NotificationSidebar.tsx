import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Bell, X, Info, AlertTriangle, CheckCircle2, Clock, Sparkles } from "lucide-react-native";
import { SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "urgent" | "update";
  time: string;
  read: boolean;
};

export const NotificationSidebar = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userName, setUserName] = useState("Doctor");
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const fetchRecentChanges = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserName(user.user_metadata.full_name || "Doctor");

      // Fetch recent cases to simulate notifications
      const { data: cases } = await supabase
        .from('cases')
        .select('*')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (cases) {
        const mapped: Notification[] = cases.map(c => ({
          id: c.id,
          title: c.is_urgent ? "Urgent Case Alert" : "New Case Assigned",
          message: `${c.patient_name}: Tooth ${c.tooth_number} - ${c.diagnosis}`,
          type: c.is_urgent ? "urgent" : "info",
          time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        }));
        setNotifications(mapped);
      }
    };

    if (open) {
      fetchRecentChanges();
    }
  }, [open]);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "urgent": return <AlertTriangle size={18} color="#EF4444" />;
      case "update": return <CheckCircle2 size={18} color="#0EA5E9" />;
      default: return <Info size={18} color="#64748B" />;
    }
  };

  return (
    <SheetContent open={open} onOpenChange={onOpenChange} side="right" style={styles.sheetContent}>
      <SheetHeader style={styles.header}>
        <View style={styles.titleRow}>
          <Bell size={20} color="#0F172A" />
          <SheetTitle style={styles.title}>Notifications</SheetTitle>
        </View>
        <TouchableOpacity onPress={() => setNotifications([])}>
          <Text style={styles.clearAll}>Clear all</Text>
        </TouchableOpacity>
      </SheetHeader>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <View style={styles.todayBadge}>
              <Sparkles size={10} color="#FFFFFF" />
              <Text style={styles.todayText}>Clinical Assistant</Text>
            </View>
            <Text style={styles.greetingText}>
              {greeting}, Dr. {userName}
            </Text>
            <Text style={styles.welcomeSubtitle}>Check your latest updates here.</Text>
          </View>
        </View>

        {notifications.length > 0 ? (
          notifications.map((n) => (
            <View key={n.id} style={[styles.notificationItem, !n.read && styles.unreadItem]}>
              <View style={[styles.iconContainer, styles[`${n.type}Icon`]]}>
                {getIcon(n.type)}
              </View>
              <View style={styles.content}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{n.title}</Text>
                  <Text style={styles.time}>{n.time}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>{n.message}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Clock size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No new notifications</Text>
            <Text style={styles.emptyText}>We'll alert you when there are updates to your cases.</Text>
          </View>
        )}
      </ScrollView>
    </SheetContent>
  );
};

const styles = StyleSheet.create({
  sheetContent: {
    padding: 0,
    width: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  clearAll: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  unreadItem: {
    backgroundColor: "rgba(14, 165, 233, 0.02)",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoIcon: {
    backgroundColor: "rgba(100, 116, 139, 0.1)",
  },
  urgentIcon: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  updateIcon: {
    backgroundColor: "rgba(14, 165, 233, 0.1)",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  time: {
    fontSize: 10,
    color: "#94A3B8",
  },
  message: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  welcomeCard: {
    margin: 16,
    borderRadius: 20,
    backgroundColor: "#0EA5E9",
    padding: 16,
    overflow: "hidden",
  },
  welcomeContent: {
    zIndex: 10,
  },
  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
    gap: 4,
  },
  todayText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  greetingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  welcomeSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    marginTop: 4,
  },
});
