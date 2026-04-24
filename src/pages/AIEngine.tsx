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
    <div className="space-y-6 animate-fade-up max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-accent" /> AI Clinical Step Engine
        </h1>
        <p className="text-muted-foreground mt-1">
          Enter the current step or condition — get the next clinically validated move.
        </p>
      </div>

      <Card className="rounded-2xl p-6 shadow-card border-border/60 space-y-4">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-2">
            <Label>Current step or clinical condition</Label>
            <Input
              defaultValue="Access cavity completed on tooth 36"
              placeholder="e.g. Access cavity completed"
              className="rounded-xl h-12"
            />
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={() => setOutput(sample)}
            className="h-12"
          >
            <Sparkles className="w-4 h-4" /> Suggest next step
          </Button>
        </div>
      </Card>

      {output && (
        <div className="space-y-4 animate-fade-up">
          {/* Diagnosis card */}
          <Card className="rounded-2xl p-6 border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 shadow-glow">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-wider text-accent font-semibold">Suggested diagnosis</p>
                <h2 className="font-display text-2xl font-bold mt-1 text-foreground">{output.diagnosis}</h2>
              </div>
              <Badge className={`${confidenceColors[output.confidence]} border-0 rounded-full px-3 py-1`}>
                <ShieldCheck className="w-3 h-3 mr-1" /> {output.confidence} confidence
              </Badge>
            </div>
          </Card>

          {/* Next steps */}
          <Card className="rounded-2xl p-6 shadow-card border-border/60">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2 mb-4">
              <ArrowRight className="w-5 h-5 text-primary" /> Next steps
            </h3>
            <ol className="space-y-3">
              {output.steps.map((step, i) => (
                <li key={i} className="flex gap-3 group">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0 shadow-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-foreground leading-relaxed">{step}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-muted-foreground/30 group-hover:text-success transition-smooth flex-shrink-0 mt-0.5" />
                </li>
              ))}
            </ol>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="rounded-2xl p-6 shadow-card border-border/60">
              <h3 className="font-display font-semibold flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-secondary" /> Required instruments
              </h3>
              <ul className="space-y-2">
                {output.instruments.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    {i}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="rounded-2xl p-6 shadow-card border-border/60">
              <h3 className="font-display font-semibold flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-accent" /> Suggested materials
              </h3>
              <ul className="space-y-2">
                {output.materials.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Alerts */}
          <Card className="rounded-2xl p-5 border-warning/30 bg-warning/5">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Verify clinically before proceeding</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
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
