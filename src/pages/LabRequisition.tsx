import { useState } from "react";
import { Download, Printer, Send, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const labOptions = [
  { id: "crown", label: "Crown" },
  { id: "rct", label: "Root Canal Treatment" },
  { id: "impression", label: "Impression" },
  { id: "prosthesis", label: "Prosthesis" },
  { id: "bridge", label: "Bridge" },
  { id: "denture", label: "Denture" },
];

const LabRequisition = () => {
  const [selected, setSelected] = useState<string[]>(["crown"]);
  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-secondary" /> Lab requisition
        </h1>
        <p className="text-muted-foreground mt-1">Auto-filled from clinical entry — review and send.</p>
      </div>

      <Card className="rounded-2xl overflow-hidden shadow-card border-border/60">
        <div className="gradient-primary p-6 text-primary-foreground">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80">Lab requisition #LR-2041</p>
              <h2 className="font-display text-2xl font-bold mt-1">Crown — Tooth 36</h2>
            </div>
            <div className="text-right text-sm opacity-90">
              <p>24 Apr 2026</p>
              <p>Return: 5–7 working days</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient name</Label>
              <Input defaultValue="Priya Sharma" className="rounded-xl h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input defaultValue="32" className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input defaultValue="Female" className="rounded-xl h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dentist</Label>
              <Input defaultValue="Dr. Aarav Singh" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Tooth number (FDI)</Label>
              <Input defaultValue="36" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Diagnosis</Label>
              <Input defaultValue="Irreversible pulpitis — RCT completed, crown indicated" className="rounded-xl h-11" />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Lab work required</Label>
            <div className="flex flex-wrap gap-2">
              {labOptions.map((o) => {
                const active = selected.includes(o.id);
                return (
                  <button
                    type="button"
                    key={o.id}
                    onClick={() => toggle(o.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium border transition-smooth",
                      active
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : "bg-background border-border hover:border-secondary/50"
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Material</Label>
              <Input defaultValue="PFM (Porcelain-fused-to-metal)" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Shade</Label>
              <Input defaultValue="A2 (Vita)" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Margin type</Label>
              <Input defaultValue="Chamfer" className="rounded-xl h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Special instructions</Label>
            <Textarea
              defaultValue="Please match cervical translucency. Contact for shade verification before bake."
              className="rounded-xl min-h-24 resize-none"
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="lg" className="rounded-xl gap-2" onClick={() => toast.success("PDF downloaded")}>
          <Download className="w-4 h-4" /> Download PDF
        </Button>
        <Button variant="outline" size="lg" className="rounded-xl gap-2" onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Print
        </Button>
        <Button variant="hero" size="lg" className="flex-1 sm:flex-initial" onClick={() => toast.success("Sent to lab")}>
          <Send className="w-4 h-4" /> Send to lab
        </Button>
      </div>
    </div>
  );
};

export default LabRequisition;
