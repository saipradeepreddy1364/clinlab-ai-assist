import { useState } from "react";
import { Upload, FileText, Image as ImageIcon, FileArchive, X, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type FileItem = { name: string; size: string; tag: string; progress: number; type: "img" | "pdf" | "doc" | "zip" };

const tags = ["X-ray", "Prescription", "Lab Report", "Other"];

const initial: FileItem[] = [
  { name: "IOPA_36_preop.jpg", size: "1.2 MB", tag: "X-ray", progress: 100, type: "img" },
  { name: "Crown_LabReq.pdf", size: "248 KB", tag: "Lab Report", progress: 100, type: "pdf" },
  { name: "Patient_history.docx", size: "84 KB", tag: "Other", progress: 64, type: "doc" },
];

const iconMap = {
  img: ImageIcon,
  pdf: FileText,
  doc: FileText,
  zip: FileArchive,
};

const Uploads = () => {
  const [files, setFiles] = useState<FileItem[]>(initial);
  const [drag, setDrag] = useState(false);

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <Upload className="w-7 h-7 text-primary" /> File uploads
        </h1>
        <p className="text-muted-foreground mt-1">PDF · Images · DOCX · ZIP — bulk supported, auto-linked to patient.</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-10 text-center transition-smooth",
          drag ? "border-primary bg-primary/5" : "border-border bg-card"
        )}
      >
        <div className="w-14 h-14 rounded-2xl gradient-soft flex items-center justify-center mx-auto mb-4">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-lg">Drop files here</h3>
        <p className="text-sm text-muted-foreground mt-1">or click to browse — up to 25 files at once</p>
        <div className="flex flex-wrap gap-2 justify-center mt-5">
          <Button variant="hero" size="lg">
            <Upload className="w-4 h-4" /> Upload multiple files
          </Button>
        </div>
        <div className="flex items-center justify-center gap-4 mt-5 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-full">PDF</Badge>
          <Badge variant="outline" className="rounded-full">JPG / PNG</Badge>
          <Badge variant="outline" className="rounded-full">DOCX</Badge>
          <Badge variant="outline" className="rounded-full">ZIP</Badge>
        </div>
      </div>

      <Card className="rounded-2xl shadow-card border-border/60 overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-semibold">Recent uploads</h3>
          <span className="text-xs text-muted-foreground">{files.length} files</span>
        </div>
        <div className="divide-y divide-border">
          {files.map((f, i) => {
            const Icon = iconMap[f.type];
            return (
              <div key={i} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <Badge variant="outline" className="rounded-full text-xs">{f.tag}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Progress value={f.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {f.progress < 100 ? `${f.progress}%` : f.size}
                    </span>
                  </div>
                </div>
                {f.progress === 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="text-xs text-muted-foreground">
        Tag uploads as: {tags.map((t) => (
          <Badge key={t} variant="outline" className="rounded-full mr-1.5 text-xs">
            {t}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default Uploads;
