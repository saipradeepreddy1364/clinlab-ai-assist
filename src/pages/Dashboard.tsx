import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FilePlus2,
  ClipboardList,
  Sparkles,
  Users,
  Activity,
  AlertCircle,
  ChevronRight,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const actions = [
  { to: "/new-case", title: "New Case", desc: "Start clinical entry", icon: FilePlus2, tint: "bg-primary/10 text-primary" },
  { to: "/lab-requisition", title: "Lab Request", desc: "Auto-fill from notes", icon: ClipboardList, tint: "bg-secondary/10 text-secondary" },
  { to: "/ai-engine", title: "AI Guide", desc: "Suggest next step", icon: Sparkles, tint: "bg-accent/10 text-accent" },
  { to: "/patients", title: "Records", desc: "Browse case history", icon: Users, tint: "bg-warning/10 text-warning" },
];

const Dashboard = () => {
  const [userName, setUserName] = useState("Doctor");
  const [greeting, setGreeting] = useState("Good morning");
  const [stats, setStats] = useState({
    active: 0,
    labPending: 0,
    urgent: 0,
  });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const guest = localStorage.getItem("guestMode") === "true";
      setIsGuest(guest);

      if (guest) {
        setUserName("Guest");
        setStats({ active: 0, labPending: 0, urgent: 0 });
        setRecentCases([]);
        setLoading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata.full_name || "Doctor");
        
        // Fetch cases for this user
        const { data: cases, error } = await supabase
          .from('cases')
          .select('*')
          .eq('doctor_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && cases) {
          setRecentCases(cases.slice(0, 3).map(c => ({
            id: c.id,
            name: c.patient_name,
            tooth: c.tooth_number,
            dx: c.diagnosis,
            urgent: c.is_urgent
          })));
          
          setStats({
            active: cases.filter(c => c.status === 'in-progress').length,
            labPending: cases.filter(c => c.status === 'lab-sent').length,
            urgent: cases.filter(c => c.is_urgent).length,
          });
        }
      }
      setLoading(false);
    };

    // Greeting logic
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary p-5 text-primary-foreground shadow-elevated">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-10 bottom-0 w-32 h-32 rounded-full bg-accent/40 blur-2xl" />
        <div className="relative z-10">
          <Badge className="bg-white/20 text-primary-foreground hover:bg-white/30 border-0 backdrop-blur text-[10px] mb-2">
            <Activity className="w-2.5 h-2.5 mr-1" /> Today
          </Badge>
          <h2 className="font-display text-xl font-bold leading-snug">
            {greeting}, {isGuest ? "Guest" : `Dr. ${userName}`}
          </h2>
          {!isGuest && (
            <p className="text-primary-foreground/85 text-sm mt-1">
              {stats.active} active cases · {stats.labPending} lab requests pending
            </p>
          )}
          <div className="flex gap-2 mt-4">
            {!isGuest && (
              <Link to="/new-case" className="flex-1">
                <Button variant="glass" size="sm" className="w-full rounded-xl">
                  <FilePlus2 className="w-3.5 h-3.5" /> New case
                </Button>
              </Link>
            )}
            <Link to="/ai-engine" className="flex-1">
              <Button variant="glass" size="sm" className="w-full rounded-xl">
                <Sparkles className="w-3.5 h-3.5" /> {isGuest ? "AI Clinical Guide" : "Ask AI"}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {!isGuest && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Active", value: stats.active, tint: "text-primary", icon: Activity },
              { label: "Lab", value: stats.labPending, tint: "text-secondary", icon: ClipboardList },
              { label: "Urgent", value: stats.urgent, tint: "text-urgent", icon: AlertCircle },
            ].map((s) => (
              <Card key={s.label} className="p-3 rounded-2xl shadow-card border-border/60">
                <s.icon className={`w-4 h-4 ${s.tint} mb-2`} />
                <p className="font-display text-xl font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Quick actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {actions.map((a) => (
                <Link key={a.to} to={a.to}>
                  <Card className="group p-4 rounded-2xl shadow-card border-border/60 active:scale-[0.98] hover:shadow-elevated transition-smooth h-full">
                    <div className={`w-10 h-10 rounded-xl ${a.tint} flex items-center justify-center mb-3`}>
                      <a.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-display font-semibold text-sm">{a.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent cases */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recent cases
              </h3>
              <Link to="/patients" className="text-xs text-primary font-medium">
                See all
              </Link>
            </div>
            <Card className="rounded-2xl shadow-card border-border/60 overflow-hidden">
              <div className="divide-y divide-border">
                {recentCases.length > 0 ? (
                  recentCases.map((c) => (
                    <Link
                      key={c.id}
                      to={`/patients/${c.id}`}
                      className="flex items-center gap-3 p-3.5 active:bg-muted transition-smooth"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                          c.urgent ? "bg-urgent/10 text-urgent" : "bg-primary/10 text-primary"
                        }`}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Tooth {c.tooth} · {c.dx}
                        </p>
                      </div>
                      {c.urgent ? (
                        <Badge className="bg-urgent text-urgent-foreground border-0 rounded-full text-[10px] px-2">
                          Urgent
                        </Badge>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No recent cases found.</p>
                    <Link to="/new-case">
                      <Button variant="link" className="text-xs h-auto p-0 mt-1">Create your first case</Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick upload nudge */}
          <Link to="/uploads">
            <Card className="p-4 rounded-2xl border-dashed border-2 border-border/80 bg-muted/30 flex items-center gap-3 active:scale-[0.99] transition-smooth">
              <div className="w-10 h-10 rounded-xl gradient-soft flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Upload X-rays or reports</p>
                <p className="text-xs text-muted-foreground">Bulk upload, auto-linked to patient</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Card>
          </Link>
        </>
      )}
    </div>
  );
};

export default Dashboard;
