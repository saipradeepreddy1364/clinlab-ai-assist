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
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{patients.length} cases</p>
        <Link to="/new-case">
          <Button variant="hero" size="sm" className="rounded-full h-9">
            <Plus className="w-3.5 h-3.5" /> New
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search patients, case ID..." className="pl-10 rounded-xl h-11" />
      </div>

      <div className="space-y-3">
        {patients.map((p) => (
          <Link key={p.id} to={`/patients/${p.id}`}>
            <Card className="p-4 rounded-2xl shadow-card border-border/60 active:scale-[0.99] transition-smooth flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold flex-shrink-0 ${
                  p.urgent ? "bg-urgent/10 text-urgent" : "gradient-soft text-primary"
                }`}
              >
                {p.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  {p.urgent && <AlertCircle className="w-3.5 h-3.5 text-urgent flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">#{p.id} · {p.dx}</p>
              </div>
              <Badge
                variant="outline"
                className={`rounded-full text-[10px] flex-shrink-0 ${
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
