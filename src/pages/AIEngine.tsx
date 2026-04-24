import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Wrench,
  FlaskConical,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Output = {
  diagnosis: string;
  confidence: "High" | "Medium" | "Low";
  steps: string[];
  instruments: string[];
  materials: string[];
  alerts: string[];
};

const sample: Output = {
  diagnosis: "Irreversible Pulpitis — Tooth 36",
  confidence: "High",
  steps: [
    "Locate all canals (MB, ML, DB, DL) under magnification",
    "Establish glide path with #10 K-file to working length",
    "Select initial rotary file (ProTaper SX → S1)",
    "Begin irrigation protocol: 3% NaOCl, EDTA 17%, saline rinse",
    "Determine working length with apex locator + IOPA confirmation",
  ],
  instruments: [
    "DG-16 endodontic explorer",
    "Endo-Z bur",
    "K-files #10–#25",
    "Rotary endomotor",
    "Apex locator",
  ],
  materials: ["3% Sodium Hypochlorite", "17% EDTA", "Saline", "Calcium hydroxide (intracanal)"],
  alerts: ["Verify rubber dam isolation before irrigation.", "Avoid binding files past WL — risk of perforation."],
};

const confidenceColors: Record<Output["confidence"], string> = {
  High: "bg-success text-success-foreground",
  Medium: "bg-warning text-warning-foreground",
  Low: "bg-destructive text-destructive-foreground",
};

const AIEngine = () => {
  const [output, setOutput] = useState<Output | null>(sample);

  return (
    <div className="space-y-5 animate-fade-up">
      <p className="text-sm text-muted-foreground">
        Enter the current step or condition — get the next clinically validated move.
      </p>

      <Card className="rounded-2xl p-4 shadow-card border-border/60 space-y-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Current step / condition</Label>
        <Input
          defaultValue="Access cavity completed on tooth 36"
          placeholder="e.g. Access cavity completed"
          className="rounded-xl h-11"
        />
        <Button
          variant="hero"
          size="lg"
          onClick={() => setOutput(sample)}
          className="w-full"
        >
          <Sparkles className="w-4 h-4" /> Suggest next step
        </Button>
      </Card>

      {output && (
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
