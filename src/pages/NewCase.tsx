import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mic, X, Loader2 } from "lucide-react";
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
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const symptomOptions = ["Pain", "Swelling", "Sensitivity", "Sinus tract", "Mobility", "Bleeding"];

const NewCase = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState<string[]>(["Pain"]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: "",
    age: "",
    gender: "female",
    tooth_number: "",
    chief_complaint: "",
    notes: "",
  });

  const toggle = (s: string) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to create a case");
        navigate("/login");
        return;
      }

      const { error } = await supabase.from('cases').insert([
        {
          patient_name: formData.patient_name,
          tooth_number: formData.tooth_number,
          diagnosis: formData.chief_complaint,
          status: 'in-progress',
          is_urgent: symptoms.includes("Pain") || symptoms.includes("Swelling"),
          doctor_id: user.id,
          metadata: {
            age: formData.age,
            gender: formData.gender,
            symptoms: symptoms,
            notes: formData.notes,
          },
        },
      ]);

      if (error) throw error;

      toast.success("Case created successfully!");
      navigate("/ai-engine");
    } catch (error: any) {
      toast.error(error.message || "Failed to create case");
      navigate("/ai-engine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <p className="text-sm text-muted-foreground">Capture clinical findings — AI will structure the rest.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="rounded-2xl p-4 shadow-card border-border/60 space-y-4">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Patient details</h2>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label>Patient name</Label>
              <Input
                placeholder="e.g. Priya Sharma"
                className="rounded-xl h-11"
                required
                value={formData.patient_name}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="32"
                  className="rounded-xl h-11"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  defaultValue="female"
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}
                >
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
              <Input
                placeholder="e.g. 36"
                className="rounded-xl h-11"
                required
                value={formData.tooth_number}
                onChange={(e) => setFormData({ ...formData, tooth_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Chief complaint</Label>
              <Input
                placeholder="e.g. Severe pain on chewing"
                className="rounded-xl h-11"
                required
                value={formData.chief_complaint}
                onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl p-4 shadow-card border-border/60 space-y-3">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Symptoms</h2>
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

        <Card className="rounded-2xl p-4 shadow-card border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Clinical notes</h2>
            <Button type="button" variant="outline" size="sm" className="rounded-full gap-1.5 h-8 text-xs">
              <Mic className="w-3.5 h-3.5" /> Voice
            </Button>
          </div>
          <Textarea
            placeholder="e.g. Spontaneous throbbing pain, lingering response to cold test on 36. Tender on percussion. No swelling."
            className="rounded-xl min-h-28 resize-none text-sm"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </Card>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" size="lg" className="rounded-xl flex-1">
            Draft
          </Button>
          <Button type="submit" variant="hero" size="lg" className="flex-[2]" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Analyze with AI
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewCase;
