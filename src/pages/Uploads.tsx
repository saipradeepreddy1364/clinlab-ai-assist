import { useState, useEffect } from "react";
import { Upload, FileText, Image as ImageIcon, FileArchive, X, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type FileItem = { 
  id: string;
  name: string; 
  size: string; 
  tag: string; 
  progress: number; 
  type: "img" | "pdf" | "doc" | "zip";
  path: string;
};

const tags = ["X-ray", "Prescription", "Lab Report", "Other"];

const iconMap = {
  img: ImageIcon,
  pdf: FileText,
  doc: FileText,
  zip: FileArchive,
};

const Uploads = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      const isGuest = localStorage.getItem("guestMode") === "true";
      if (isGuest) {
        setFiles([]);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.storage
          .from('clinical-files')
          .list(user.id);

        if (!error && data) {
          setFiles(data.map(f => ({
            id: f.id,
            name: f.name,
            size: `${(f.metadata.size / 1024 / 1024).toFixed(1)} MB`,
            tag: "Other",
            progress: 100,
            type: f.name.match(/\.(jpg|jpeg|png|gif)$/i) ? "img" : f.name.match(/\.pdf$/i) ? "pdf" : "doc",
            path: `${user.id}/${f.name}`
          })));
        }
      }
      setLoading(false);
    };

    fetchFiles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to upload files");
      setUploading(false);
      return;
    }

    for (const file of Array.from(selectedFiles)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      const newFileItem: FileItem = {
        id: Math.random().toString(),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        tag: "Other",
        progress: 10,
        type: file.type.includes("image") ? "img" : file.type.includes("pdf") ? "pdf" : "doc",
        path: filePath
      };

      setFiles(prev => [newFileItem, ...prev]);

      try {
        const { error } = await supabase.storage
          .from('clinical-files')
          .upload(filePath, file);

        if (error) throw error;

        setFiles(prev => prev.map(f => 
          f.path === filePath ? { ...f, progress: 100 } : f
        ));
        toast.success(`${file.name} uploaded!`);
      } catch (error: any) {
        toast.error(`Error uploading ${file.name}: ${error.message}`);
        setFiles(prev => prev.filter(f => f.path !== filePath));
      }
    }
    setUploading(false);
  };

  const handleDelete = async (file: FileItem) => {
    try {
      const { error } = await supabase.storage
        .from('clinical-files')
        .remove([file.path]);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.path !== file.path));
      toast.success("File removed");
    } catch (error: any) {
      toast.error(`Error removing file: ${error.message}`);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <p className="text-sm text-muted-foreground">PDF · Images · DOCX · ZIP — bulk supported, auto-linked to patient.</p>

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
          "relative rounded-2xl border-2 border-dashed p-6 text-center transition-smooth",
          drag ? "border-primary bg-primary/5" : "border-border bg-card"
        )}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <div className="w-12 h-12 rounded-2xl gradient-soft flex items-center justify-center mx-auto mb-3">
          {uploading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Upload className="w-5 h-5 text-primary" />}
        </div>
        <h3 className="font-display font-semibold text-base">Drop files or browse</h3>
        <p className="text-xs text-muted-foreground mt-1">Up to 25 files at once</p>
        <Button variant="hero" size="lg" className="w-full mt-4 pointer-events-none">
          {uploading ? "Uploading..." : "Select files"}
        </Button>
      </div>

      <Card className="rounded-2xl shadow-card border-border/60 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Recent uploads</h3>
          <span className="text-xs text-muted-foreground">{files.length} files</span>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-xs">Fetching files...</p>
            </div>
          ) : files.length > 0 ? (
            files.map((f, i) => {
              const Icon = iconMap[f.type] || FileText;
              return (
                <div key={i} className="p-4 flex items-center gap-3 group">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(f)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-sm">No files uploaded yet.</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 rounded-2xl bg-accent/5 border-accent/20">
        <h4 className="font-display font-semibold text-sm text-accent mb-2">Why upload X-rays & reports?</h4>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-accent">•</span>
            <span><strong>Clinical Accuracy:</strong> AI uses visual data to validate clinical findings and suggest precise next steps.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent">•</span>
            <span><strong>Lab Precision:</strong> Providing pre-op X-rays to dental labs ensures better fit and aesthetics for restorations.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent">•</span>
            <span><strong>Case History:</strong> Maintains a complete digital record for future reference and patient follow-ups.</span>
          </li>
        </ul>
      </Card>

      <div className="text-xs text-muted-foreground pb-4">
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
