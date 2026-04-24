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
    <div className="space-y-5 animate-fade-up">
      <p className="text-sm text-muted-foreground">Auto-filled from clinical entry — review and send.</p>

      <Card className="rounded-2xl overflow-hidden shadow-card border-border/60">
        <div className="gradient-primary p-4 text-primary-foreground">
          <p className="text-[10px] uppercase tracking-wider opacity-80">Lab requisition #LR-2041</p>
          <h2 className="font-display text-lg font-bold mt-1">Crown — Tooth 36</h2>
          <div className="flex items-center justify-between text-xs opacity-90 mt-2">
            <span>24 Apr 2026</span>
            <span>Return: 5–7 days</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-3">
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

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label>Material</Label>
              <Input defaultValue="PFM (Porcelain-fused-to-metal)" className="rounded-xl h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Shade</Label>
                <Input defaultValue="A2 (Vita)" className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label>Margin</Label>
                <Input defaultValue="Chamfer" className="rounded-xl h-11" />
              </div>
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

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="lg" className="rounded-xl gap-2" onClick={() => toast.success("PDF downloaded")}>
          <Download className="w-4 h-4" /> PDF
        </Button>
        <Button variant="outline" size="lg" className="rounded-xl gap-2" onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Print
        </Button>
        <Button variant="hero" size="lg" className="col-span-2" onClick={() => toast.success("Sent to lab")}>
          <Send className="w-4 h-4" /> Send to lab
        </Button>
      </div>
    </div>
  );
};

export default LabRequisition;
