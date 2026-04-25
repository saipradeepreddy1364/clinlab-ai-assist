import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Plus, AlertCircle, Loader2, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

const Patients = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      const isGuest = localStorage.getItem("guestMode") === "true";
      if (isGuest) {
        setCases([]);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .eq('doctor_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setCases(data);
        }

        // Fetch file counts from storage
        const { data: files } = await supabase.storage
          .from('clinical-files')
          .list(user.id);
        
        if (files) {
          const counts: Record<string, number> = {};
          files.forEach(f => {
            const parts = f.name.split('--');
            if (parts.length > 1) {
              const pName = parts[0].split('_')[0]?.replace(/-/g, ' ');
              if (pName) {
                counts[pName] = (counts[pName] || 0) + 1;
              }
            }
          });
          setFileCounts(counts);
        }
      }
      setLoading(false);
    };

    fetchCases();
  }, []);

  const filteredCases = cases.filter(c => 
    c.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    c.tooth_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filteredCases.length} cases</p>
        <Link to="/new-case">
          <Button variant="hero" size="sm" className="rounded-full h-9">
            <Plus className="w-3.5 h-3.5" /> New
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search patients, tooth #..." 
          className="pl-10 rounded-xl h-11" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">Loading records...</p>
          </div>
        ) : filteredCases.length > 0 ? (
          filteredCases.map((p) => (
            <div key={p.id} className="relative group">
              <Link to={`/patients/${p.id}`}>
                <Card className="p-4 rounded-2xl shadow-card border-border/60 active:scale-[0.99] transition-smooth flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold flex-shrink-0 ${
                      p.is_urgent ? "bg-urgent/10 text-urgent" : "gradient-soft text-primary"
                    }`}
                  >
                    {p.patient_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{p.patient_name}</p>
                      {p.is_urgent && <AlertCircle className="w-3.5 h-3.5 text-urgent flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">Tooth {p.tooth_number} · {p.diagnosis}</p>
                    
                    {fileCounts[p.patient_name] && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/uploads?search=${encodeURIComponent(p.patient_name)}`);
                        }}
                        className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-primary hover:underline"
                      >
                        <FileText className="w-3 h-3" />
                        {fileCounts[p.patient_name]} reports available
                      </button>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`rounded-full text-[10px] flex-shrink-0 capitalize ${
                      p.is_urgent ? "border-urgent/30 text-urgent bg-urgent/5" : ""
                    }`}
                  >
                    {p.status.replace('-', ' ')}
                  </Badge>
                </Card>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dashed border-border/60">
            <p className="text-sm text-muted-foreground">No records found.</p>
            <Link to="/new-case">
              <Button variant="link" className="mt-1">Create a new case</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
