import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { supabase } from "@/lib/supabase";
import { Clock, AlertCircle, LogOut } from "lucide-react-native";

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        // Fetch profile to check status and role
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profile);
      }
      setLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
      } else {
        checkAuth();
      }
    });

    // Real-time listener for profile updates (approval)
    let profileSubscription: any;
    if (session?.user) {
      profileSubscription = supabase
        .channel(`profile-${session.user.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${session.user.id}`
        }, (payload) => {
          setProfile(payload.new);
        })
        .subscribe();
    }

    return () => {
      authListener.subscription.unsubscribe();
      if (profileSubscription) profileSubscription.unsubscribe();
    };
  }, [session?.user?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  // If not logged in, just show children (Login/Signup pages)
  if (!session) return <>{children}</>;

  // If doctor and pending approval
  if (profile?.role === 'doctor' && profile?.status === 'pending') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Clock size={32} color="#0EA5E9" />
          </View>
          <Text style={styles.title}>Approval Pending</Text>
          <Text style={styles.message}>
            Your account has been created for <Text style={styles.bold}>{profile.org_name || "your organization"}</Text>. 
            Please wait for an administrator to verify and approve your clinical access.
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Status: Pending Verification</Text>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={16} color="#64748B" />
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If rejected
  if (profile?.status === 'rejected') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: "#FEE2E2" }]}>
            <AlertCircle size={32} color="#EF4444" />
          </View>
          <Text style={[styles.title, { color: "#B91C1C" }]}>Access Rejected</Text>
          <Text style={styles.message}>
            Your request to join <Text style={styles.bold}>{profile.org_name}</Text> was not approved by the organization administrator. 
            If you believe this is an error, please contact your clinic manager.
          </Text>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={16} color="#64748B" />
            <Text style={styles.logoutText}>Back to Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  message: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  bold: {
    fontWeight: "600",
    color: "#0F172A",
  },
  statusBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    padding: 12,
  },
  logoutText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  }
});
