import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mic, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const symptomOptions = ["Pain", "Swelling", "Sensitivity", "Sinus tract", "Mobility", "Bleeding"];

const NewCase = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState<string[]>(["Pain"]);

  const toggle = (s: string) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold">New case entry</h1>
        <p className="text-muted-foreground mt-1">Capture clinical findings — AI will structure the rest.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate("/ai-engine");
        }}
        className="space-y-6"
      >
        <Card className="rounded-2xl p-6 shadow-card border-border/60 space-y-5">
          <h2 className="font-display font-semibold text-lg">Patient details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient name</Label>
              <Input placeholder="e.g. Priya Sharma" className="rounded-xl h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" placeholder="32" className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tooth number (FDI)</Label>
              <Input placeholder="e.g. 36" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Chief complaint</Label>
              <Input placeholder="e.g. Severe pain on chewing" className="rounded-xl h-11" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-card border-border/60 space-y-5">
          <h2 className="font-display font-semibold text-lg">Symptoms</h2>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((s) => {
              const active = symptoms.includes(s);
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggle(s)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-smooth flex items-center gap-1.5",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background border-border text-foreground hover:border-primary/50"
                  )}
                >
                  {s}
                  {active && <X className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-card border-border/60 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Clinical notes</h2>
            <Button type="button" variant="outline" size="sm" className="rounded-full gap-2">
              <Mic className="w-4 h-4" /> Voice
            </Button>
          </div>
          <Textarea
            placeholder="e.g. Spontaneous throbbing pain, lingering response to cold test on 36. Tender on percussion. No swelling."
            className="rounded-xl min-h-32 resize-none"
          />
        </Card>

        <div className="flex gap-3 sticky bottom-20 lg:bottom-6 z-20">
          <Button type="button" variant="outline" size="lg" className="rounded-xl flex-1 sm:flex-initial">
            Save draft
          </Button>
          <Button type="submit" variant="hero" size="lg" className="flex-1">
            <Sparkles className="w-4 h-4" /> Analyze with AI
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewCase;
