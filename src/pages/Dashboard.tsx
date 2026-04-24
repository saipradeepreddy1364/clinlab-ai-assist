import { Link } from "react-router-dom";
import {
  FilePlus2,
  ClipboardList,
  Sparkles,
  Users,
  TrendingUp,
  Activity,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const actions = [
  {
    to: "/new-case",
    title: "New Case",
    desc: "Start a clinical entry",
    icon: FilePlus2,
    tint: "bg-primary/10 text-primary",
  },
  {
    to: "/lab-requisition",
    title: "Generate Lab Request",
    desc: "Auto-fill from notes",
    icon: ClipboardList,
    tint: "bg-secondary/10 text-secondary",
  },
  {
    to: "/ai-engine",
    title: "AI Clinical Guide",
    desc: "Suggest next steps",
    icon: Sparkles,
    tint: "bg-accent/10 text-accent",
  },
  {
    to: "/patients",
    title: "Patient Records",
    desc: "Browse case history",
    icon: Users,
    tint: "bg-warning/10 text-warning",
  },
];

const recentCases = [
  { id: "C-2041", name: "Priya Sharma", tooth: "36", dx: "Irreversible Pulpitis", status: "in-progress", urgent: false },
  { id: "C-2040", name: "Rohan Mehta", tooth: "11", dx: "Crown Prep — PFM", status: "lab-sent", urgent: false },
  { id: "C-2039", name: "Aisha Khan", tooth: "46", dx: "Acute Apical Abscess", status: "urgent", urgent: true },
  { id: "C-2038", name: "Vikram Patel", tooth: "21", dx: "Composite Restoration", status: "complete", urgent: false },
];

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 sm:p-10 text-primary-foreground shadow-elevated">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-32 bottom-0 w-56 h-56 rounded-full bg-accent/40 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-white/20 text-primary-foreground hover:bg-white/30 border-0 mb-4 backdrop-blur">
            <Activity className="w-3 h-3 mr-1" /> Clinical Assistant
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
            Good morning, Dr. Singh
          </h1>
          <p className="text-primary-foreground/85 mt-2 text-base sm:text-lg">
            You have 4 active cases and 2 lab requests pending today.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/new-case">
              <Button variant="glass" size="lg">
                <FilePlus2 className="w-4 h-4" /> New case
              </Button>
            </Link>
            <Link to="/ai-engine">
              <Button variant="ghost" size="lg" className="text-primary-foreground hover:bg-white/15">
                <Sparkles className="w-4 h-4" /> Ask AI
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active cases", value: "12", trend: "+3", icon: Activity, tint: "text-primary" },
          { label: "Lab requests", value: "5", trend: "2 pending", icon: ClipboardList, tint: "text-secondary" },
          { label: "AI suggestions", value: "47", trend: "this week", icon: Sparkles, tint: "text-accent" },
          { label: "Urgent alerts", value: "1", trend: "needs review", icon: AlertCircle, tint: "text-urgent" },
        ].map((s) => (
          <Card key={s.label} className="p-5 rounded-2xl shadow-card border-border/60">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                <p className="font-display text-3xl font-bold mt-2">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {s.trend}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-xl bg-muted flex items-center justify-center ${s.tint}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((a) => (
            <Link key={a.to} to={a.to}>
              <Card className="group p-6 rounded-2xl shadow-card border-border/60 hover:shadow-elevated hover:-translate-y-1 transition-smooth cursor-pointer h-full">
                <div className={`w-12 h-12 rounded-xl ${a.tint} flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth`}>
                  <a.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-base">{a.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">Recent cases</h2>
          <Link to="/patients" className="text-sm text-primary font-medium hover:underline">
            View all
          </Link>
        </div>
        <Card className="rounded-2xl shadow-card border-border/60 overflow-hidden">
          <div className="divide-y divide-border">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                to={`/patients/${c.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-smooth"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm ${
                  c.urgent ? "bg-urgent/10 text-urgent" : "bg-primary/10 text-primary"
                }`}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{c.name}</p>
                    <span className="text-xs text-muted-foreground">#{c.id}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    Tooth {c.tooth} · {c.dx}
                  </p>
                </div>
                {c.urgent ? (
                  <Badge className="bg-urgent text-urgent-foreground border-0 rounded-full">
                    <AlertCircle className="w-3 h-3 mr-1" /> Urgent
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full capitalize hidden sm:inline-flex">
                    <Clock className="w-3 h-3 mr-1" /> {c.status.replace("-", " ")}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
