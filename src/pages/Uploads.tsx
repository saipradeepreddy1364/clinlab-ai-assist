import { useState, useEffect } from "react";
import { Upload, FileText, Image as ImageIcon, FileArchive, X, CheckCircle2, Loader2, Calendar, User, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  patientName?: string;
  caseType?: string;
  appointmentDate?: string;
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

  // Metadata form state
  const [metadata, setMetadata] = useState({
    patientName: "",
    caseType: "General",
    appointmentDate: new Date().toISOString().split('T')[0]
  });

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
          setFiles(data.map(f => {
            // Attempt to parse metadata from filename if possible
            // Format: patient_case_date-filename
            const parts = f.name.split('--');
            let pName = "", cType = "", aDate = "", actualName = f.name;
            
            if (parts.length > 1) {
              const metaParts = parts[0].split('_');
              pName = metaParts[0]?.replace(/-/g, ' ');
              cType = metaParts[1]?.replace(/-/g, ' ');
              aDate = metaParts[2]?.replace(/-/g, ' ');
              actualName = parts.slice(1).join('--');
            }

            return {
              id: f.id,
              name: actualName,
              size: `${(f.metadata.size / 1024 / 1024).toFixed(1)} MB`,
              tag: "Other",
              progress: 100,
              type: f.name.match(/\.(jpg|jpeg|png|gif)$/i) ? "img" : f.name.match(/\.pdf$/i) ? "pdf" : "doc",
              path: `${user.id}/${f.name}`,
              patientName: pName,
              caseType: cType,
              appointmentDate: aDate
            };
          }));
        }
      }
      setLoading(false);
    };

    fetchFiles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    if (!metadata.patientName.trim()) {
      toast.error("Please enter patient name first");
      return;
    }

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to upload files");
      setUploading(false);
      return;
    }

    for (const file of Array.from(selectedFiles)) {
      const fileExt = file.name.split('.').pop();
      // Store metadata in the filename: patient_case_date--original
      const metaString = `${metadata.patientName.replace(/\s+/g, '-')}_${metadata.caseType.replace(/\s+/g, '-')}_${metadata.appointmentDate.replace(/\s+/g, '-')}`;
      const fileName = `${metaString}--${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const newFileItem: FileItem = {
        id: Math.random().toString(),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        tag: "Other",
        progress: 10,
        type: file.type.includes("image") ? "img" : file.type.includes("pdf") ? "pdf" : "doc",
        path: filePath,
        patientName: metadata.patientName,
        caseType: metadata.caseType,
        appointmentDate: metadata.appointmentDate
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

  const handleFileClick = async (file: FileItem) => {
    if (file.progress < 100) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('clinical-files')
        .createSignedUrl(file.path, 3600); // 1 hour access

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      toast.error(`Error opening file: ${error.message}`);
    }
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Case Information</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground h-8 px-2"
            onClick={() => setMetadata({
              patientName: "",
              caseType: "General",
              appointmentDate: new Date().toISOString().split('T')[0]
            })}
          >
            Clear Form
          </Button>
        </div>
        
        <Card className="p-5 rounded-3xl shadow-card border-border/60 bg-card/50 backdrop-blur-sm space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientName" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                <User className="w-3.5 h-3.5" /> Full Name
              </Label>
              <Input
                id="patientName"
                placeholder="Dr. Jayasimha Mummadi..."
                className="rounded-2xl bg-background border-border/40 h-12 text-base focus:ring-primary/20"
                value={metadata.patientName}
                onChange={(e) => setMetadata({ ...metadata, patientName: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                  <ClipboardList className="w-3.5 h-3.5" /> Case
                </Label>
                <Select
                  value={metadata.caseType}
                  onValueChange={(v) => setMetadata({ ...metadata, caseType: v })}
                >
                  <SelectTrigger className="rounded-2xl bg-background border-border/40 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="General">General Exam</SelectItem>
                    <SelectItem value="RCT">Endodontics (RCT)</SelectItem>
                    <SelectItem value="Crown">Prosthetics (Crown)</SelectItem>
                    <SelectItem value="Extraction">Surgery (Extraction)</SelectItem>
                    <SelectItem value="Implant">Implantology</SelectItem>
                    <SelectItem value="Ortho">Orthodontics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="rounded-2xl bg-background border-border/40 h-12"
                  value={metadata.appointmentDate}
                  onChange={(e) => setMetadata({ ...metadata, appointmentDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </Card>
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
          "relative rounded-2xl border-2 border-dashed p-6 text-center transition-smooth",
          drag ? "border-primary bg-primary/5" : "border-border bg-card",
          !metadata.patientName && "opacity-50 grayscale cursor-not-allowed"
        )}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleFileUpload}
          disabled={uploading || !metadata.patientName}
        />
        <div className="w-12 h-12 rounded-2xl gradient-soft flex items-center justify-center mx-auto mb-3">
          {uploading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Upload className="w-5 h-5 text-primary" />}
        </div>
        <h3 className="font-display font-semibold text-base">
          {!metadata.patientName ? "Enter patient name first" : "Drop files or browse"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Files will be tagged for {metadata.patientName || "..."}</p>
        <Button variant="hero" size="lg" className="w-full mt-4 pointer-events-none" disabled={!metadata.patientName}>
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
                <div key={i} className="p-4 flex items-center gap-3 group hover:bg-muted/30 transition-smooth cursor-pointer" onClick={() => handleFileClick(f)}>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      {f.patientName && <Badge variant="secondary" className="rounded-full text-[10px]">{f.patientName}</Badge>}
                      {f.caseType && <Badge variant="outline" className="rounded-full text-[10px]">{f.caseType}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Progress value={f.progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground w-20 text-right">
                        {f.appointmentDate || f.size}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(f);
                    }}
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
    </div>
  );
};

export default Uploads;
