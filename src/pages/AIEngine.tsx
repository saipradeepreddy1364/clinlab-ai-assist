import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Wrench,
  FlaskConical,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Output = {
  diagnosis: string;
  confidence: "High" | "Medium" | "Low";
  steps: string[];
  instruments: string[];
  materials: string[];
  alerts: string[];
};

const procedures: Record<string, Output> = {
  "access cavity": {
    diagnosis: "Irreversible Pulpitis — Tooth 36",
    confidence: "High",
    steps: [
      "Locate all canals (MB, ML, DB, DL) under magnification",
      "Establish glide path with #10 K-file to working length",
      "Select initial rotary file (ProTaper SX → S1)",
      "Begin irrigation protocol: 3% NaOCl, EDTA 17%, saline rinse",
      "Determine working length with apex locator + IOPA confirmation",
    ],
    instruments: ["DG-16 endodontic explorer", "Endo-Z bur", "K-files #10–#25", "Rotary endomotor", "Apex locator"],
    materials: ["3% Sodium Hypochlorite", "17% EDTA", "Saline", "Calcium hydroxide (intracanal)"],
    alerts: ["Verify rubber dam isolation before irrigation.", "Avoid binding files past WL — risk of perforation."],
  },
  "crown prep": {
    diagnosis: "Crown Preparation — Tooth 11",
    confidence: "High",
    steps: [
      "Select appropriate diamond burs (tapered chamfer)",
      "Reduce occlusal surface by 1.5mm - 2.0mm",
      "Prepare axial walls with 6-degree taper",
      "Refine gingival finish line (chamfer)",
      "Take final impression using PVS material",
    ],
    instruments: ["High-speed handpiece", "Diamond burs", "Retraction cord", "Impression trays"],
    materials: ["PVS impression material", "Retraction solution", "Temporary cement"],
    alerts: ["Ensure adequate clearance for material thickness.", "Protect adjacent teeth with metal matrix."],
  },
  "extraction": {
    diagnosis: "Non-restorable Caries — Tooth 46",
    confidence: "High",
    steps: [
      "Administer local anesthesia (IANB + Long Buccal)",
      "Sever periodontal ligament using periotome",
      "Luxate tooth with straight elevator",
      "Engage tooth with appropriate forceps (Lower molar)",
      "Debride socket and verify hemostasis",
    ],
    instruments: ["Periotome", "Straight elevator", "Molar forceps", "Curette"],
    materials: ["Local Anesthetic (Articaine 4%)", "Gauze", "Gelfoam (if needed)"],
    alerts: ["Monitor patient vitals.", "Warn patient about post-op numbness."],
  },
};

const confidenceColors: Record<Output["confidence"], string> = {
  High: "bg-success text-success-foreground",
  Medium: "bg-warning text-warning-foreground",
  Low: "bg-destructive text-destructive-foreground",
};

const AIEngine = () => {
  const [input, setInput] = useState("Access cavity completed on tooth 36");
  const [output, setOutput] = useState<Output | null>(procedures["access cavity"]);
  const [loading, setLoading] = useState(false);

  const handleSuggest = () => {
    if (!input.trim()) {
      toast.error("Please enter a clinical condition");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      let match = procedures["access cavity"];

      if (lowerInput.includes("crown") || lowerInput.includes("prep")) {
        match = procedures["crown prep"];
      } else if (lowerInput.includes("extract") || lowerInput.includes("remove")) {
        match = procedures["extraction"];
      }

      setOutput(match);
      setLoading(false);
      toast.success("AI suggestion generated!");
    }, 1500);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <p className="text-sm text-muted-foreground">
        Enter the current step or condition — get the next clinically validated move.
      </p>

      <Card className="rounded-2xl p-4 shadow-card border-border/60 space-y-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Current step / condition</Label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Access cavity completed"
          className="rounded-xl h-11"
        />
        <Button
          variant="hero"
          size="lg"
          onClick={handleSuggest}
          className="w-full"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Suggest next step
        </Button>
      </Card>

      {output && !loading && (
        <div className="space-y-4 animate-fade-up">
          {/* Diagnosis card */}
          <Card className="rounded-2xl p-4 border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 shadow-glow">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-[10px] uppercase tracking-wider text-accent font-semibold">Suggested diagnosis</p>
              <Badge className={`${confidenceColors[output.confidence]} border-0 rounded-full px-2 py-0.5 text-[10px]`}>
                <ShieldCheck className="w-2.5 h-2.5 mr-1" /> {output.confidence}
              </Badge>
            </div>
            <h2 className="font-display text-lg font-bold text-foreground leading-snug">{output.diagnosis}</h2>
          </Card>

          {/* Next steps */}
          <Card className="rounded-2xl p-4 shadow-card border-border/60">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2 mb-3 uppercase tracking-wider text-muted-foreground">
              <ArrowRight className="w-4 h-4 text-primary" /> Next steps
            </h3>
            <ol className="space-y-3">
              {output.steps.map((step, i) => (
                <li key={i} className="flex gap-3 group">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold flex-shrink-0 shadow-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-foreground text-sm leading-relaxed">{step}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground/30 group-active:text-success transition-smooth flex-shrink-0 mt-1" />
                </li>
              ))}
            </ol>
          </Card>

          <Card className="rounded-2xl p-4 shadow-card border-border/60">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2 mb-3 uppercase tracking-wider text-muted-foreground">
              <Wrench className="w-4 h-4 text-secondary" /> Instruments
            </h3>
            <ul className="grid grid-cols-1 gap-2">
              {output.instruments.map((i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  {i}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-2xl p-4 shadow-card border-border/60">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2 mb-3 uppercase tracking-wider text-muted-foreground">
              <FlaskConical className="w-4 h-4 text-accent" /> Materials
            </h3>
            <ul className="grid grid-cols-1 gap-2">
              {output.materials.map((m) => (
                <li key={m} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {m}
                </li>
              ))}
            </ul>
          </Card>

          {/* Alerts */}
          <Card className="rounded-2xl p-4 border-warning/30 bg-warning/5">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-sm">Verify clinically before proceeding</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {output.alerts.map((a) => (
                    <li key={a}>• {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIEngine;
