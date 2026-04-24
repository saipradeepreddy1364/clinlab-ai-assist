import { Link } from "react-router-dom";
import { Search, Plus, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const patients = [
  { id: "C-2041", name: "Priya Sharma", date: "24 Apr 2026", dx: "Irreversible Pulpitis · 36", urgent: false, status: "In progress" },
  { id: "C-2040", name: "Rohan Mehta", date: "23 Apr 2026", dx: "Crown Prep PFM · 11", urgent: false, status: "Lab sent" },
  { id: "C-2039", name: "Aisha Khan", date: "23 Apr 2026", dx: "Acute Apical Abscess · 46", urgent: true, status: "Urgent" },
  { id: "C-2038", name: "Vikram Patel", date: "22 Apr 2026", dx: "Composite Class II · 21", urgent: false, status: "Complete" },
  { id: "C-2037", name: "Neha Gupta", date: "21 Apr 2026", dx: "Periapical Surgery · 23", urgent: false, status: "Follow-up" },
  { id: "C-2036", name: "Arjun Rao", date: "20 Apr 2026", dx: "Bridge Prep · 14–16", urgent: false, status: "Complete" },
];

const Patients = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Patient records</h1>
          <p className="text-muted-foreground mt-1">{patients.length} cases</p>
        </div>
        <Link to="/new-case">
          <Button variant="hero" size="lg">
            <Plus className="w-4 h-4" /> New case
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search patients, case ID, diagnosis..." className="pl-10 rounded-xl h-11" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((p) => (
          <Link key={p.id} to={`/patients/${p.id}`}>
            <Card className="p-5 rounded-2xl shadow-card border-border/60 hover:shadow-elevated hover:-translate-y-0.5 transition-smooth h-full">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold ${
                    p.urgent ? "bg-urgent/10 text-urgent" : "gradient-soft text-primary"
                  }`}
                >
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">#{p.id} · {p.date}</p>
                </div>
                {p.urgent && <AlertCircle className="w-4 h-4 text-urgent flex-shrink-0" />}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.dx}</p>
              <Badge
                variant="outline"
                className={`rounded-full text-xs ${
                  p.urgent ? "border-urgent/30 text-urgent bg-urgent/5" : ""
                }`}
              >
                {p.status}
              </Badge>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Patients;
