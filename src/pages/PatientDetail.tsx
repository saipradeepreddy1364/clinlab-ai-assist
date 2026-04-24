import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  ClipboardList,
  Image as ImageIcon,
  Download,
  CheckCircle2,
  Circle,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const timeline = [
  { date: "24 Apr 2026", title: "Diagnosis confirmed", desc: "Irreversible Pulpitis · Tooth 36", done: true, type: "diagnosis" },
  { date: "24 Apr 2026", title: "Access cavity completed", desc: "Rubber dam placed, MB/ML/DB/DL canals located", done: true, type: "step" },
  { date: "24 Apr 2026", title: "Lab requisition sent", desc: "Crown — PFM, Shade A2, Chamfer margin", done: true, type: "lab" },
  { date: "01 May 2026", title: "Crown try-in", desc: "Scheduled · check fit, occlusion, contacts", done: false, type: "follow" },
  { date: "08 May 2026", title: "Permanent cementation", desc: "Resin cement (RelyX) — final review", done: false, type: "follow" },
];

const PatientDetail = () => {
  const { id } = useParams();
  return (
    <div className="space-y-6 animate-fade-up max-w-5xl">
      <Link to="/patients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>

      <Card className="rounded-2xl overflow-hidden shadow-card border-border/60">
        <div className="gradient-primary p-6 text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-display font-bold text-2xl">
              P
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold">Priya Sharma</h1>
              <p className="text-primary-foreground/85 text-sm mt-0.5">
                Case #{id || "C-2041"} · Female · 32 yrs · Tooth 36
              </p>
            </div>
            <Badge className="bg-white/20 text-primary-foreground border-0 rounded-full backdrop-blur">In progress</Badge>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="rounded-xl bg-muted p-1">
          <TabsTrigger value="timeline" className="rounded-lg">Timeline</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-lg">Notes</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg">AI suggestions</TabsTrigger>
          <TabsTrigger value="files" className="rounded-lg">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card className="rounded-2xl p-6 shadow-card border-border/60">
            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-6">
                {timeline.map((t, i) => (
                  <div key={i} className="relative flex gap-4">
                    <div className="relative z-10 flex-shrink-0">
                      {t.done ? (
                        <div className="w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
                          <Circle className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{t.title}</p>
                        <Badge variant="outline" className="rounded-full text-xs gap-1">
                          <Calendar className="w-3 h-3" />
                          {t.date}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="rounded-2xl p-6 shadow-card border-border/60 space-y-3">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Clinical notes
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Patient reports spontaneous throbbing pain on left mandibular region for 3 days. Lingering response to cold
              test on tooth 36. Tender on percussion. No swelling. IOPA shows deep caries approaching pulp horn.
              Diagnosis: Irreversible Pulpitis. Plan: RCT followed by crown.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="rounded-2xl p-6 shadow-card border-border/60 space-y-3">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> AI suggestions log
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-accent">→</span> Establish glide path with #10 K-file</li>
              <li className="flex gap-2"><span className="text-accent">→</span> Use 3% NaOCl irrigation between files</li>
              <li className="flex gap-2"><span className="text-accent">→</span> Confirm WL with apex locator + IOPA</li>
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card className="rounded-2xl p-6 shadow-card border-border/60 space-y-3">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-secondary" /> Lab forms & uploads
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: "Pre-op IOPA.jpg", tag: "X-ray", icon: ImageIcon },
                { name: "Crown Lab Req.pdf", tag: "Lab Report", icon: FileText },
                { name: "Master Cone IOPA.jpg", tag: "X-ray", icon: ImageIcon },
                { name: "Prescription.pdf", tag: "Prescription", icon: FileText },
              ].map((f) => (
                <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-smooth">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <Badge variant="outline" className="text-xs rounded-full mt-0.5">{f.tag}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetail;
